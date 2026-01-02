'use server'

import { createClient } from '@/utils/supabase/server'
import { generateEmbedding, generateAnswer } from '@/utils/ai'
import { revalidatePath } from 'next/cache'

export async function generateAnswerAction(questionId: string, projectId: string) {
    const supabase = await createClient()

    // 1. Fetch Question
    const { data: question } = await supabase
        .from('project_questions')
        .select('question_text')
        .eq('id', questionId)
        .single()

    if (!question) return { error: 'Question not found' }

    try {
        // 2. Embed Question
        const embedding = await generateEmbedding(question.question_text)

        // 3. Search Knowledge Base (RAG)
        const { data: matchedDocs, error: matchError } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5, // Adjust based on testing
            match_count: 3,
        })

        if (matchError) {
            console.error('Match error:', matchError)
            return { error: 'Failed to retrieve context' }
        }

        // 4. Construct Context
        const contextText = matchedDocs?.map((d: any) => d.content_chunk).join('\n\n---\n\n') || ''
        const contextSources = matchedDocs?.map((d: any) => d.source_filename).join(', ')

        // 5. Generate Answer with LLM
        const systemPrompt = `You are an expert RFP writer. Answer the question based ONLY on the provided context.
    
    Context:
    ${contextText}
    
    If the context does not contain the answer, state "I could not find a specific answer in your knowledge base." and suggest what information is missing.
    Do not make up facts.`

        const answer = await generateAnswer(systemPrompt, question.question_text, 'gpt-4o-mini')

        if (!answer) return { error: 'Failed to generate answer' }

        // 6. Save Answer
        const { error: updateError } = await supabase
            .from('project_questions')
            .update({
                draft_answer: answer,
                context_used: matchedDocs, // Save what we used for transparency
                confidence_score: matchedDocs && matchedDocs.length > 0 ? matchedDocs[0].similarity : 0
            })
            .eq('id', questionId)

        if (updateError) throw updateError

        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }

    } catch (error) {
        console.error('Generation error:', error)
        return { error: 'Failed to generate answer' }
    }
}
