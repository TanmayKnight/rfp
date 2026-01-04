import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, FileText, TrendingUp, Sparkles, ArrowRight, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Unauthorized</div>

    // Fetch actual projects
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Calculate Stats (Mocked for now, but ready for logic)
    const activeProposals = projects?.length || 0;

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        Welcome back
                    </h1>
                    <p className="text-zinc-500 mt-1">Here is what's happening with your proposals today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/activity">
                        <Button variant="outline" className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-10 shadow-sm">
                            <History className="mr-2 h-4 w-4" />
                            Activity Log
                        </Button>
                    </Link>
                    <Link href="/dashboard/projects/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 shadow-md shadow-blue-600/20 transition-all hover:scale-105">
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-200/60 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Active Proposals</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{activeProposals}</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            <span className="text-green-600 font-medium">+0%</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/60 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Win Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">--%</div>
                        <p className="text-xs text-zinc-500 mt-1">AI estimation pending</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/60 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Knowledge Base</CardTitle>
                        <Sparkles className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">0 Docs</div>
                        <p className="text-xs text-zinc-500 mt-1">Train your AI brain</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-zinc-900">Recent Projects</h2>

                {(!projects || projects.length === 0) ? (
                    <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50 min-h-[400px] flex flex-col justify-center items-center text-center p-8 shadow-none">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm ring-1 ring-zinc-200">
                            <Sparkles className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900">No projects yet</h2>
                        <p className="text-zinc-500 max-w-sm mt-2 mb-8 mx-auto">
                            Get started by uploading an RFP document. Velocibid will extract questions and draft answers instantly.
                        </p>
                        <Link href="/dashboard/projects/new">
                            <Button size="lg" className="h-11 px-8 text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
                                Create First Project <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                                <Card className="hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer h-full group bg-white">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium truncate pr-2 text-zinc-900 group-hover:text-blue-600 transition-colors">
                                            {project.rfp_name}
                                        </CardTitle>
                                        <FileText className="h-4 w-4 text-zinc-400 group-hover:text-blue-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-zinc-500 mb-4">
                                            Created {new Date(project.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                                                {project.status.toUpperCase()}
                                            </Badge>
                                            <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
