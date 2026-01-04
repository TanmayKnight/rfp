'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'

export default function SuccessPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success'>('loading')
    const supabase = createClient()

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Poll for active/trialing status
            const interval = setInterval(async () => {
                const { data: member } = await supabase
                    .from('organization_members')
                    .select('organizations(subscription_status)')
                    .eq('user_id', user.id)
                    .single()

                const org = member?.organizations as any
                if (org && (org.subscription_status === 'active' || org.subscription_status === 'trialing')) {
                    clearInterval(interval)
                    setStatus('success')
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 1000)
                }
            }, 1000)

            return () => clearInterval(interval)
        }

        checkStatus()
    }, [router, supabase])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md text-center p-8">
                <CardContent className="flex flex-col items-center gap-4">
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                            <div>
                                <h1 className="text-2xl font-bold">Setting up your workspace...</h1>
                                <p className="text-gray-500">Confirming payment with Stripe.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <div>
                                <h1 className="text-2xl font-bold">All Set!</h1>
                                <p className="text-gray-500">Redirecting to dashboard...</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
