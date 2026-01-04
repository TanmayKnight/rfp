
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { DemoModal } from '@/components/demo-modal'

export function HeroActions() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-900/20 transition-all hover:-translate-y-0.5">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>

            <DemoModal>
                <div className="h-12 px-6 flex items-center justify-center text-zinc-500 text-sm hover:text-zinc-900 transition-colors cursor-pointer group">
                    <span className="group-hover:underline underline-offset-4">View Demo</span>
                </div>
            </DemoModal>
        </div>
    )
}
