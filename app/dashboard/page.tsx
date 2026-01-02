
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Unauthorized</div>

    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
                <Link href="/dashboard/projects/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </Link>
            </div>

            {(!projects || projects.length === 0) ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-12">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            No projects created
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Start by uploading a new RFP document.
                        </p>
                        <Link href="/dashboard/projects/new" className="mt-4">
                            <Button>Create Project</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                            <Card className="hover:bg-gray-50/50 transition-colors cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium truncate pr-2">
                                        {project.rfp_name}
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground mb-4">
                                        Created {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={project.status === 'ready' ? 'default' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
