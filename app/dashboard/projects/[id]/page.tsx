
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import QuestionCard from './question-card'

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Project
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (!project) {
        redirect('/dashboard')
    }

    // 2. Fetch Questions
    const { data: questions } = await supabase
        .from('project_questions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <FileText className="h-4 w-4" />
                        {project.original_file_url || 'Uploaded PDF'}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.rfp_name}</h1>
                </div>
                <Badge variant={project.status === 'ready' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                    {project.status === 'ready' ? (
                        <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Ready
                        </>
                    ) : project.status}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Main Content: Questions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Extracted Questions ({questions?.length || 0})</h2>
                    {questions?.map((q, index) => (
                        <QuestionCard key={q.id} question={q} index={index} />
                    ))}

                    {questions?.length === 0 && (
                        <div className="p-12 text-center border border-dashed rounded-lg text-gray-500">
                            No questions were extracted. This might be a parsing error or the document text was not recognized.
                        </div>
                    )}
                </div>

                {/* Sidebar: Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2 w-full">
                                Generate All Answers
                            </button>
                            <a href={`/api/projects/${id}/export`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                Export as Word Doc
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
