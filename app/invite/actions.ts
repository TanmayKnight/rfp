'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function acceptInviteAction(formData: FormData) {
    const supabase = await createClient()
    const token = formData.get('token') as string

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Validate Token
    const { data: invite } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()

    if (!invite) return { error: 'Invalid token' }

    // 3. Add Member
    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: invite.organization_id,
            user_id: user.id,
            role: invite.role
        })

    if (memberError) {
        console.error('Accept invite error', memberError)
        // Check for duplicate? If so just proceed and delete invite
    }

    // 4. Delete Invitation
    await supabase.from('invitations').delete().eq('id', invite.id)

    // 5. Redirect
    redirect('/dashboard')
}
