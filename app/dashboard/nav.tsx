
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Database, Settings, Key, LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    variant?: 'default' | 'ghost'
}

const mainNav: NavItem[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Knowledge Base',
        href: '/dashboard/knowledge',
        icon: Database,
    },
]

const configNav: NavItem[] = [
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
    {
        title: 'AI Keys',
        href: '/dashboard/settings/keys',
        icon: Key,
    },
]

export function DashboardNav() {
    return (
        <nav className="flex flex-col gap-6 px-4 py-4">
            {/* Main Section */}
            <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Workspace
                </p>
                {mainNav.map((item) => (
                    <NavItem key={item.href} item={item} />
                ))}
            </div>

            {/* Config Section */}
            <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Configuration
                </p>
                {configNav.map((item) => (
                    <NavItem key={item.href} item={item} />
                ))}
            </div>

            {/* Bottom/Support Section (Optional flair) */}
            <div className="mt-auto pt-4 border-t border-zinc-100">
                <Link
                    href="mailto:curiousmindshex@gmail.com"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <LifeBuoy className="h-4 w-4" />
                    Support
                </Link>
            </div>
        </nav>
    )
}

function NavItem({ item }: { item: NavItem }) {
    const pathname = usePathname()

    // Strict match for Settings to avoid highlighting it when in sub-routes like /keys
    const isSettings = item.href === '/dashboard/settings'
    const isActive = isSettings
        ? pathname === item.href
        : (pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href)))

    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            )}
        >
            <item.icon className={cn("h-4 w-4", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900")} />
            {item.title}
        </Link>
    )
}
