'use server'

import { createClient } from '@/utils/supabase/server'
// @ts-ignore
const pdf = require('pdf-parse')
import { extractQuestionsFromText } from '@/utils/ai'
import { redirect } from 'next/navigation'

export async function createProjectAction(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth Check
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get Organization
    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!member) {
        return { error: 'No organization found.' }
    }

    // 2. File Validation
    const file = formData.get('file') as File
    if (!file) {
        return { error: 'No file provided' }
    }

    // 3. Create Project Record (Upload Status)
    const { data: project, error: createError } = await supabase
        .from('projects')
        .insert({
            organization_id: member.organization_id,
            user_id: user.id,
            rfp_name: file.name,
            status: 'processing',
        })
        .select()
        .single()

    if (createError || !project) {
        console.error('Create project error:', createError)
        return { error: 'Failed to create project' }
    }

    try {
        // 4. Extract Text
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await pdf(buffer)
        const fullText = data.text

        if (!fullText || fullText.trim().length === 0) {
            throw new Error('Could not extract text from PDF')
        }

        // 5. Extract Questions (AI)
        const questions = await extractQuestionsFromText(fullText)

        if (questions.length === 0) {
            // Fallback or warning? For now just proceed potentially empty
            console.warn('No questions extracted')
        }

        // 6. Save Questions
        if (questions.length > 0) {
            const questionsToInsert = questions.map(q => ({
                project_id: project.id,
                question_text: q,
                draft_answer: '', // Empty initially
            }))

            const { error: qError } = await supabase
                .from('project_questions')
                .insert(questionsToInsert)

            if (qError) throw qError
        }

        // 7. Update Status
        await supabase
            .from('projects')
            .update({ status: 'ready' })
            .eq('id', project.id)

    } catch (error) {
        console.error('Processing error:', error)
        await supabase
            .from('projects')
            .update({ status: 'failed' })
            .eq('id', project.id)
        return { error: 'Failed to process RFP.' }
    }

    // 8. Redirect
    redirect(`/dashboard/projects/${project.id}`)
}
