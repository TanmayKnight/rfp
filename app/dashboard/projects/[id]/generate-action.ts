
'use server'

import { createClient } from '@/utils/supabase/server'
import { decrypt } from '@/utils/encryption'
import { OpenAI } from 'openai'

export async function generateAnswerAction(questionId: string, projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Context (Project, Question, Org)
    const { data: project } = await supabase
        .from('projects')
        .select('organization_id')
        .eq('id', projectId)
        .single()

    if (!project) return { error: 'Project not found' }

    const { data: questionData } = await supabase
        .from('project_questions')
        .select('question_text')
        .eq('id', questionId)
        .single()

    if (!questionData) return { error: 'Question not found' }

    // 2. Get API Key (BYOK)
    const { data: keyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('org_id', project.organization_id)
        .eq('provider', 'openai')
        .eq('is_active', true)
        .single()

    if (!keyData) return { error: 'OpenAI API Key not found. Please add one in Settings.' }

    const apiKey = decrypt(keyData.encrypted_key)
    const openai = new OpenAI({ apiKey })

    try {
        // 3. Generate Embedding for the Question
        const embeddingUserParams = {
            model: "text-embedding-3-small",
            input: questionData.question_text.replace(/\n/g, ' '),
            encoding_format: "float" as const
        }

        const embeddingResponse = await openai.embeddings.create(embeddingUserParams)
        const embedding = embeddingResponse.data[0].embedding

        // 4. Search Knowledge Base (RAG)
        const { data: chunks, error: matchError } = await supabase
            .rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: 0.5,
                match_count: 5,
                filter_organization_id: project.organization_id
            })

        if (matchError) {
            console.error('Vector search error', matchError)
            return { error: 'Failed to search knowledge base' }
        }

        // 5. Construct Prompt
        const contextText = chunks?.map((c: any) => `SOURCE: ${c.source_filename}\nCONTENT: ${c.content_chunk}`).join('\n\n') || ''

        const systemPrompt = `You are an expert RFP Proposal Writer. 
        Your goal is to write a precise, professional, and compliant answer to the user's question.
        
        Use the provided CONTEXT from the company's knowledge base.
        If the answer is found in the context, cite the source filename in [brackets].
        If the answer is NOT found in the context, say "I don't have enough information in the Knowledge Base to answer this confidently," but try to provide a generic professional placeholder if possible.
        
        Start directly with the answer. Do not say "Here is the answer".`

        const userPrompt = `QUESTION: ${questionData.question_text}\n\nCONTEXT:\n${contextText}`

        // 6. Generate Completion
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Or gpt-4o-mini
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        })

        const generatedAnswer = completion.choices[0].message.content

        // 7. Save Draft
        await supabase
            .from('project_questions')
            .update({
                draft_answer: generatedAnswer,
                confidence_score: chunks && chunks.length > 0 ? chunks[0].similarity : 0,
                context_used: chunks
            })
            .eq('id', questionId)

        return { success: true, answer: generatedAnswer }

    } catch (e) {
        console.error('Generation error', e)
        return { error: 'Failed to generate answer. ' + (e as Error).message }
    }
}
