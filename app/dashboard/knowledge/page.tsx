
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Trash2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { deleteDocument } from './actions'
import Link from 'next/link'
import UploadForm from './upload-form'

export default async function KnowledgeBasePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Check for API Key first
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user!.id)
        .single()

    // Check if we have a valid embedding provider
    const { data: keys } = await supabase
        .from('api_keys')
        .select('provider')
        .eq('org_id', membership!.organization_id)
        .eq('is_active', true)

    const hasAI = keys?.some(k => k.provider === 'openai') // Only OpenAI supports embeddings for now in our MVP

    // 2. Fetch Docs
    // Group by filename to show "Documents" instead of "Chunks"
    const { data: docs } = await supabase
        .from('knowledge_base')
        .select('source_filename, created_at, organization_id')
        .eq('organization_id', membership!.organization_id)
    // .distinct('source_filename') // Supabase/Postgres specific distinct
    // Note: distinct() in JS client might be tricky with other columns. 
    // Better to use a SQL view or a dedicated 'documents' table if we had one.
    // For MVP, we'll store metadata in 'knowledge_base' or just distinct in JS for display.

    // Deduping in JS for MVP since we store raw chunks
    const uniqueDocs = Array.from(new Set(docs?.map(d => d.source_filename)))
        .map(filename => {
            return docs?.find(d => d.source_filename === filename)
        })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Knowledge Base</h2>
                    <p className="text-zinc-500 mt-1">
                        Upload your past RFPs, security policies, and product docs.
                        Velocibid will cite these when writing proposals.
                    </p>
                </div>
                {!hasAI && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg border border-amber-200 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>You need to connect an OpenAI key to process files.</span>
                        <Link href="/dashboard/settings/keys" className="underline font-medium hover:text-amber-900">
                            Connect Keys
                        </Link>
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div className={!hasAI ? 'opacity-50 pointer-events-none' : ''}>
                <UploadForm />
            </div>

            {/* Document List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {uniqueDocs?.map((doc: any, i) => (
                    <Card key={i} className="group hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-zinc-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm line-clamp-1 break-all" title={doc.source_filename}>
                                        {doc.source_filename}
                                    </h4>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Added {new Date(doc.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <form action={async () => {
                                'use server'
                                await deleteDocument(doc.source_filename)
                            }}>
                                <button type="submit" className="text-zinc-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </form>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px] border-green-100">
                                    Indexed
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!uniqueDocs || uniqueDocs.length === 0) && (
                    <div className="col-span-full text-center py-12 text-zinc-400 italic">
                        No documents in knowledge base yet.
                    </div>
                )}
            </div>
        </div>
    )
}
