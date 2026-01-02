
import { Suspense } from 'react'
import DocumentList from './document-list'
import UploadForm from './upload-form'

export default function KnowledgeBasePage() {
    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Knowledge Base</h1>
            </div>

            <UploadForm />

            <h2 className="text-xl font-semibold mt-6">Recent Uploads</h2>
            <Suspense fallback={<div className="text-sm text-gray-500">Loading documents...</div>}>
                <DocumentList />
            </Suspense>
        </div>
    )
}
