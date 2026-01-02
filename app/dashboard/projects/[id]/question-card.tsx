'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { generateAnswerAction } from './actions'

interface QuestionCardProps {
    question: {
        id: string
        project_id: string
        question_text: string
        draft_answer: string | null
    }
    index: number
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    async function handleGenerate() {
        setIsGenerating(true)
        await generateAnswerAction(question.id, question.project_id)
        setIsGenerating(false)
    }

    return (
        <Card>
            <CardHeader className="py-4 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium leading-relaxed max-w-[85%]">
                    <span className="text-gray-400 mr-2">Q{index + 1}.</span>
                    {question.question_text}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="h-8 w-8 p-0"
                >
                    {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                        <Sparkles className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                    )}
                    <span className="sr-only">Generate</span>
                </Button>
            </CardHeader>
            <CardContent className="py-4">
                {question.draft_answer ? (
                    <div className="relative group">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question.draft_answer}</p>
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Regenerate
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-gray-50/30">
                        <p className="italic text-gray-400 text-sm mb-3">Draft not generated yet.</p>
                        <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-3 w-3" />
                                    Generate Answer
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
