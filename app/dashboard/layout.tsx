import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
    Bell,
    Home,
    FileText,
    Settings,
    Database,
    Search,
    Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardNav } from './nav'
import { UserNav } from './user-nav'

import { Logo } from '@/components/logo'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let orgName = 'Velocibid'
    let subscriptionStatus = 'trialing' // Default to trialing for fallback, but logic below enforces it.

    if (user) {
        const { data: member } = await supabase
            .from('organization_members')
            .select('organizations(name, subscription_status)')
            .eq('user_id', user.id)
            .single()

        if (member && member.organizations) {
            const org = member.organizations as any;
            orgName = org.name;
            subscriptionStatus = org.subscription_status || 'trialing'; // Handle legacy nulls as trialing or inactive? 
            // Better to default to 'inactive' if completely missing in strict mode, but 'trialing' is safer for now.
            // Actually, per user request "should not be able to create free account", let's treat null as 'inactive'.
            if (!org.subscription_status) subscriptionStatus = 'inactive';
        }
    }

    // GATING LOGIC
    // Allow access if active or trialing. 
    // Otherwise, redirect to Subscribe page to fix payment.
    const VALID_STATUSES = ['active', 'trialing']
    if (!VALID_STATUSES.includes(subscriptionStatus)) {
        redirect('/onboarding/subscribe')
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-white">
            <div className="hidden border-r border-zinc-200 bg-zinc-50/40 md:block dark:bg-zinc-950/40">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-16 items-center border-b border-zinc-200/50 px-6">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Logo showText={false} className="h-8 w-8" />
                            <span className="font-bold text-lg tracking-tight">{orgName}</span>
                        </Link>
                    </div>
                    <div className="flex-1 py-6">
                        <DashboardNav />
                    </div>
                    <div className="mt-auto p-4">
                        <div className="rounded-xl bg-gradient-to-br from-zinc-900 to-black p-4 text-white shadow-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-white/10 backdrop-blur-md">
                                    <Users className="h-4 w-4 text-blue-400" />
                                </div>
                                <span className="font-semibold text-sm">Pro Plan</span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                                You are on the 7-day free trial. Enjoy unlimited access.
                            </p>
                            <form action="/api/stripe/portal" method="POST">
                                <Button size="sm" className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium shadow-none border-0 h-8">
                                    Manage Billing
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col relative">
                <header className="flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 backdrop-blur-xl px-8 sticky top-0 z-10">
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    type="search"
                                    placeholder="Search projects..."
                                    className="w-full max-w-md appearance-none bg-zinc-100/50 pl-10 shadow-none border-0 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-xl"
                                />
                            </div>
                        </form>
                    </div>
                    <Button
                        className="rounded-full h-9 w-9 border border-zinc-200 hover:bg-zinc-50"
                        size="icon"
                        variant="ghost"
                    >
                        <Bell className="h-4 w-4 text-zinc-500" />
                    </Button>
                    <UserNav email={user?.email || 'User'} />
                </header>
                <main className="flex flex-1 flex-col gap-8 p-8 bg-white max-w-6xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
