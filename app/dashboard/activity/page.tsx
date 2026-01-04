
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, FileText, Key } from 'lucide-react'

export default async function ActivityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch recent projects as "activity"
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Activity Log</h2>
                <p className="text-zinc-500">Recent actions in your workspace.</p>
            </div>

            <div className="relative border-l border-zinc-200 ml-3 space-y-8 pb-10">
                {projects && projects.length > 0 ? (
                    projects.map((project, i) => (
                        <div key={project.id} className="relative pl-8">
                            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm ring-1 ring-zinc-200" />
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-zinc-900">
                                    New Project Created: <span className="font-semibold">{project.rfp_name}</span>
                                </p>
                                <span className="text-xs text-zinc-500">
                                    {new Date(project.created_at).toLocaleString()}
                                </span>
                                <div className="mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100 w-full max-w-md text-sm text-zinc-600 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Status: {project.status}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="pl-8 text-zinc-500 text-sm">No recent activity found.</div>
                )}
            </div>
        </div>
    )
}
