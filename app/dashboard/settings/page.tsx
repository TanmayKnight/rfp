
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus, Trash2, Mail } from 'lucide-react'
import { createInviteAction, deleteMemberAction } from './actions'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Get Current Org
    const { data: membership } = await supabase
        .from('organization_members')
        .select('role, organizations(*)')
        .eq('user_id', user.id)
        .single()

    if (!membership) redirect('/onboarding')

    const org = membership.organizations as any
    const isOwner = membership.role === 'owner' || membership.role === 'admin'

    // 2. Get Members
    const { data: members } = await supabase
        .from('organization_members')
        .select(`
        id,
        role,
        user_id,
        users (
            email,
            full_name
        )
    `)
        .eq('organization_id', org.id)

    // 3. Get Pending Invites
    const { data: invitations } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', org.id)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Team Settings</h1>
            </div>

            {/* Organization Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                    <CardDescription>Manage your team workspace</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <div className="font-medium">Name</div>
                        <div className="text-sm text-gray-500">{org.name}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Invite Member */}
            {isOwner && (
                <Card>
                    <CardHeader>
                        <CardTitle>Invite Member</CardTitle>
                        <CardDescription>Add a new user to your team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            'use server'
                            await createInviteAction(formData)
                        }} className="flex gap-4 items-end">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input type="email" name="email" placeholder="colleague@company.com" required />
                            </div>
                            <Button type="submit">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Send Invite
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {members?.map((m: any) => (
                            <div key={m.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{m.users?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">{m.users?.email}</p>
                                        <p className="text-xs text-muted-foreground">{m.role}</p>
                                    </div>
                                </div>
                                {isOwner && m.user_id !== user.id && ( // Can't delete self
                                    <form action={deleteMemberAction}>
                                        <input type="hidden" name="memberId" value={m.user_id} />
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pending Invites */}
            {invitations && invitations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invitations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {invitations.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{inv.email}</span>
                                        <Badge variant="outline" className="ml-2">Pending</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded select-all">
                                            {/* MVP: Show Link to Copy */}
                                            {`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${inv.token}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
