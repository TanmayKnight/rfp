
import { signupAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { FileText, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Column: Testimonial/Brand */}
            <div className="hidden lg:flex flex-col bg-zinc-900 text-white p-12 justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 font-bold text-xl mb-12">
                        <div className="rounded bg-white/10 p-1">
                            <FileText className="h-6 w-6" />
                        </div>
                        Velocibid
                    </div>
                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-4xl font-bold tracking-tight leading-tight">
                            "Velocibid helped us win 3x more RFPs in our first month. The AI draft quality is incredible."
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-zinc-800 border block" />
                            <div>
                                <div className="font-semibold">Alex Chen</div>
                                <div className="text-zinc-400 text-sm">Head of Sales, TechFlow</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex gap-8 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" /> SOC2 Compliant
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" /> 7-Day Free Trial
                    </div>
                </div>
            </div>

            {/* Right Column: Sign Up Form */}
            <div className="flex items-center justify-center bg-white p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create your account</h1>
                        <p className="text-zinc-500 mt-2">Start your 7-day free trial. No commitments.</p>
                    </div>

                    <form className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-700">Work Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="h-11 bg-zinc-50 border-zinc-200 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-700">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                required
                                className="h-11 bg-zinc-50 border-zinc-200 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
                        </div>

                        <Button formAction={signupAction} className="w-full h-11 text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
