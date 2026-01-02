'use client'

import { useState } from 'react'
import { Upload, Loader2, FileText, ArrowLeft } from 'lucide-react'
import { createProjectAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function NewProjectPage() {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsUploading(true)
        setError(null)

        const result = await createProjectAction(formData)

        if (result && result.error) {
            setError(result.error)
            setIsUploading(false)
        }
        // Success redirects automatically
    }

    return (
        <div className="grid gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">New RFP Project</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Target RFP</CardTitle>
                    <CardDescription>
                        Upload the RFP document (PDF) you want to answer. Our AI will analyze it and extract questions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="flex flex-col gap-6">
                        <div className="rounded-lg border border-dashed p-8 text-center hover:bg-gray-50/50 transition-colors">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto">
                                <Input id="file" name="file" type="file" accept=".pdf" disabled={isUploading} required className="cursor-pointer" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={isUploading} size="lg" className="w-full">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing RFP... (This may take a moment)
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Create Project & Extract Questions
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
