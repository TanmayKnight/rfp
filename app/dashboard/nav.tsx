'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Database, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardNav() {
    const pathname = usePathname()

    return (
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
            <Link
                href="/dashboard"
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                    // Exact match for dashboard home
                    pathname === '/dashboard'
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
            >
                <div className={cn(
                    pathname === '/dashboard' ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-900"
                )}>
                    <Home className="h-4 w-4" />
                </div>
                Dashboard
            </Link>
            <Link
                href="/dashboard/knowledge"
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                    pathname?.startsWith('/dashboard/knowledge')
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
            >
                <div className={cn(
                    pathname?.startsWith('/dashboard/knowledge') ? "text-purple-600" : "text-zinc-400 group-hover:text-zinc-900"
                )}>
                    <Database className="h-4 w-4" />
                </div>
                Knowledge Base
            </Link>
            <Link
                href="/dashboard/settings"
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                    pathname?.startsWith('/dashboard/settings')
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
            >
                <div className={cn(
                    pathname?.startsWith('/dashboard/settings') ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"
                )}>
                    <Settings className="h-4 w-4" />
                </div>
                Settings
            </Link>
        </nav>
    )
}
