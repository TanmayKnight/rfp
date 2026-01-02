'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function createInviteAction(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) return { error: 'Email required' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get User's Org
    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single()

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        return { error: 'Permission denied' }
    }

    // Generate Token
    const token = randomBytes(16).toString('hex')

    // Save Invite
    const { error } = await supabase
        .from('invitations')
        .insert({
            organization_id: member.organization_id,
            email,
            role: 'member',
            token
        })

    if (error) {
        console.error('Invite error', error)
        return { error: 'Failed to invite' }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function deleteMemberAction(formData: FormData) {
    const supabase = await createClient()
    const memberId = formData.get('memberId') as string

    // Very basic check: Am I an owner?
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: currentUserMember } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single()

    if (currentUserMember?.role !== 'owner') return // Only owner can delete

    await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', memberId)
        .eq('organization_id', currentUserMember.organization_id)

    revalidatePath('/dashboard/settings')
}
