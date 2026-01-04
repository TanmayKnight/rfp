'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Check, ShieldCheck, Zap } from 'lucide-react'
import { useState } from 'react'

export default function SubscribePage() {
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', { method: 'POST' })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert('Failed to start checkout')
            }
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-lg border-2 border-blue-600 shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-2 text-center text-white text-sm font-medium">
                    7-Day Free Trial • Cancel Anytime
                </div>
                <CardHeader className="text-center pt-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Start your Pro Plan</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Get unlimited access to AI proposal generation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-4xl font-bold">$49</span>
                        <span className="text-gray-500 mb-1">/month</span>
                    </div>

                    <div className="grid gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Unlimited RFP Projects</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>AI Knowledge Base Training</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Export to Word & PDF</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Team Collaboration</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Secure payment via Stripe</span>
                    </div>
                </CardContent>
                <CardFooter className="pb-8">
                    <Button
                        size="lg"
                        className="w-full text-lg h-12"
                        onClick={handleSubscribe}
                        disabled={loading}
                    >
                        {loading ? 'Redirecting...' : 'Start 7-Day Free Trial'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
