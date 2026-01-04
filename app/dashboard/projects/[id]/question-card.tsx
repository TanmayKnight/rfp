'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, RefreshCw, Loader2, BookOpen, Check } from 'lucide-react'
import { generateAnswerAction } from './generate-action'
// import { saveAnswerAction } from './actions' // We'll implement this later or assume it auto-saves? 

interface QuestionCardProps {
    question: {
        id: string
        project_id: string
        question_text: string
        draft_answer: string | null
        confidence_score?: number
        context_used?: any[]
    }
    index: number
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [answer, setAnswer] = useState(question.draft_answer || '')
    const [isDirty, setIsDirty] = useState(false)

    async function handleGenerate() {
        setIsGenerating(true)
        const result = await generateAnswerAction(question.id, question.project_id)
        if (result.success && result.answer) {
            setAnswer(result.answer)
            setIsDirty(false) // It's saved in DB by the action
        }
        setIsGenerating(false)
    }

    return (
        <Card className="overflow-hidden border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-4 bg-zinc-50 border-b flex flex-row items-start justify-between gap-4">
                <CardTitle className="text-sm font-medium leading-relaxed text-zinc-800">
                    <span className="text-zinc-400 font-normal mr-2">Q{index + 1}.</span>
                    {question.question_text}
                </CardTitle>
                <div className="flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="h-8 text-xs gap-1.5"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        ) : (
                            <Sparkles className="h-3 w-3 text-purple-500" />
                        )}
                        {question.draft_answer ? 'Regenerate' : 'Auto-Write'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative">
                    <Textarea
                        value={answer}
                        onChange={(e) => {
                            setAnswer(e.target.value)
                            setIsDirty(true)
                        }}
                        placeholder="AI will generate a draft here..."
                        className="min-h-[150px] resize-y border-0 focus-visible:ring-0 p-4 text-sm leading-relaxed rounded-none"
                    />
                    {/* Confidence / Citations Overlay */}
                    {question.context_used && question.context_used.length > 0 && (
                        <div className="bg-zinc-50 border-t px-4 py-2 text-xs text-zinc-500 flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            <span>Sources:</span>
                            <div className="flex gap-2">
                                {question.context_used.map((source: any, i: number) => (
                                    <span key={i} className="bg-white border px-1.5 rounded-sm truncate max-w-[150px] inline-block" title={source.content_chunk}>
                                        {source.source_filename}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            {/* Save/Status Footer */}
            {isDirty && (
                <CardFooter className="py-2 bg-yellow-50 border-t flex justify-between items-center">
                    <span className="text-xs text-yellow-700">Unsaved changes</span>
                    <Button size="sm" variant="ghost" className="h-6 text-xs hover:bg-yellow-100">
                        Top right Save button to persist (Implementation Pending)
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
