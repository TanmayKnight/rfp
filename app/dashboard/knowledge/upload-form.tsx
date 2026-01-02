'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { uploadKnowledgeAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function UploadForm() {
    const [isUploading, setIsUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(formData: FormData) {
        setIsUploading(true)
        setStatus(null)

        const result = await uploadKnowledgeAction(formData)

        if (result.error) {
            setStatus({ type: 'error', message: result.error })
        } else {
            setStatus({ type: 'success', message: result.message || 'File uploaded successfully' })
            formRef.current?.reset()
        }

        setIsUploading(false)
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription>
                        Upload PDF proposals, security policies, or company profiles to train your AI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Input id="file" name="file" type="file" accept=".pdf" disabled={isUploading} required />
                        </div>

                        <Button type="submit" disabled={isUploading} className="w-fit">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload & Train
                                </>
                            )}
                        </Button>

                        {status && (
                            <div
                                className={`flex items-center gap-2 rounded-md p-3 text-sm ${status.type === 'success'
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    }`}
                            >
                                {status.type === 'success' ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                {status.message}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>How it works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        1. <strong>Extraction:</strong> We parse the text from your PDF.
                    </p>
                    <p>
                        2. <strong>Chunking:</strong> We split the text into meaningful paragraphs.
                    </p>
                    <p>
                        3. <strong>Embedding:</strong> We convert these chunks into "vectors" (mathematical representations) using OpenAI.
                    </p>
                    <p>
                        4. <strong>Retrieval:</strong> When you process an RFP, we find the best matching chunks to answer each question.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
