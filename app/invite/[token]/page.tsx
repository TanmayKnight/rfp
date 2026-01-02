
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { acceptInviteAction } from '../actions'
import Link from 'next/link'

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params
    const supabase = await createClient()

    // 1. Fetch Invitation
    const { data: invite } = await supabase
        .from('invitations')
        .select('*, organizations(name)')
        .eq('token', token)
        .single()

    if (!invite) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
                        <CardDescription>This link is invalid or has expired.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline">Go Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 2. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    const orgName = (invite.organizations as any)?.name || 'an organization'

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Join {orgName}</CardTitle>
                    <CardDescription>
                        You have been invited to join the team at {orgName}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="p-4 bg-gray-100 rounded-lg text-center text-sm mb-2 dark:bg-gray-800">
                        Invitation for: <strong>{invite.email}</strong>
                    </div>

                    {user ? (
                        <form action={acceptInviteAction}>
                            <input type="hidden" name="token" value={token} />
                            <Button type="submit" className="w-full">
                                Accept & Join
                            </Button>
                            <p className="text-xs text-center mt-2 text-gray-500">
                                Signed in as {user.email}
                            </p>
                        </form>
                    ) : (
                        <div className="grid gap-2">
                            <Link href={`/login?next=/invite/${token}`}>
                                <Button className="w-full">Log In to Accept</Button>
                            </Link>
                            <Link href={`/login?next=/invite/${token}&signup=true`}>
                                <Button variant="outline" className="w-full">Create Account</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
