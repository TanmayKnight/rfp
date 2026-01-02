
import { createClient } from '@/utils/supabase/server'
// @ts-ignore
import createReport from 'docx-templates'
import { redirect } from 'next/navigation'

export async function exportProjectAction(projectId: string) {
    const supabase = await createClient()

    // 1. Fetch Project & Questions
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    const { data: questions } = await supabase
        .from('project_questions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

    if (!project || !questions) return { error: 'Not found' }

    // 2. Prepare Data for Template
    const data = {
        rfp_name: project.rfp_name,
        date: new Date().toLocaleDateString(),
        qa: questions.map((q) => ({
            question: q.question_text,
            answer: q.draft_answer || '[Answer not generated]',
        })),
    }

    try {
        // 3. Generate Buffer from Empty Template (or simple buffer)
        // Since we don't have a file template on disk easily, we can use a base64 string of a blank docx
        // or just rely on a simple default. 
        // Ideally, we'd read 'template.docx' from public/.
        // For this MVP, we will try to create a simple structure using a minimal valid docx buffer if possible, 
        // but docx-templates requires a valid template.
        // Let's assume we copy a basic template.docx to public/

        // Simpler approach for MVP without file ops: Just return raw text or markdown if docx is too hard without a file.
        // But the requirement was Docx.
        // Let's instruct the user to provide a template or use a default one I create.

        // BETTER: I will create a simple `template.docx` file using a tool or just assume one exists? 
        // No, I can't create binary files easily.
        // I will use `Buffer.from` with a base64 string of a minimal valid docx if I had one.
        // Alternative: Use `docx` library (creating from scratch) instead of `docx-templates` (filling template).
        // `docx` is better for code-first generation. `docx-templates` is better for users.
        // The plan said `docx-templates`.

        // RE-EVALUATION: `docx-templates` needs a template file. 
        // I will switch to `docx` (npm install docx) for code-based generation as it's easier to implement without binary assets.
        // Actually, let's stick to the plan but make it robust.
        // I will read a `template.docx` that I will ASK the user to upload? 
        // No, I should provide a default one. 

        // ok, let's use `docx` (libraries) because I can write code to generate it.
        // "docx" package on npm.

        return { error: 'Template not found' } // Placeholder until I install `docx`

    } catch (e) {
        console.error(e)
        return { error: 'Export failed' }
    }
}
