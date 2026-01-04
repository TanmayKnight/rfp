
import { login } from './actions'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="mb-6">
                        <Logo className="h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
                    <p className="text-zinc-500 mt-2">Sign in to your Velocibid account</p>
                </div>

                <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 bg-white">
                    <CardContent className="pt-6">
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700">Email</Label>
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-zinc-700">Password</Label>
                                    <Link href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="h-11 bg-zinc-50 border-zinc-200 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <Button formAction={login} className="w-full h-11 text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
                                Sign in
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-zinc-100 py-6">
                        <span className="text-sm text-zinc-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
                                Sign up for free
                            </Link>
                        </span>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
