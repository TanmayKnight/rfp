
import { createClient } from '@/utils/supabase/server'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DocumentList() {
    const supabase = await createClient()

    // Fetch unique filenames and their counts/dates
    // Note: Since we store chunks, we need to aggregate.
    // Ideally we'd have a parent 'documents' table, but for MVP we stored flat chunks.
    // We'll just fetch distinct source_filenames.
    // This is inefficient for large datasets but fine for MVP.

    const { data: documents } = await supabase
        .from('knowledge_base')
        .select('source_filename, created_at')
        .order('created_at', { ascending: false })

    // Deduplicate by filename (client side for MVP ease)
    const uniqueDocs = Array.from(new Set(documents?.map(d => d.source_filename)))
        .map(filename => {
            return documents?.find(d => d.source_filename === filename)
        })
        .filter(Boolean) as { source_filename: string; created_at: string }[]

    if (uniqueDocs.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
                No documents found. Upload one above.
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-white dark:bg-gray-950">
            <div className="grid grid-cols-[1fr_auto] gap-4 p-4 font-medium border-b bg-gray-50 dark:bg-gray-900/50">
                <div>Filename</div>
                <div>Action</div>
            </div>
            <div className="divide-y">
                {uniqueDocs.map((doc) => (
                    <div key={doc.source_filename} className="grid grid-cols-[1fr_auto] gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="font-medium">{doc.source_filename}</div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" disabled>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
