
'use server'

import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/utils/encryption'
import { revalidatePath } from 'next/cache'

export async function saveApiKey(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const provider = formData.get('provider') as string
    const rawKey = formData.get('apiKey') as string

    if (!rawKey || !rawKey.startsWith('sk-') && provider !== 'google') {
        return { error: 'Invalid API Key format. Must start with sk- (except Google)' }
    }

    // 1. Get User's Organization
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'No organization found' }

    // 2. Encrypt the key
    let encryptedKey = ''
    try {
        encryptedKey = encrypt(rawKey)
    } catch (e) {
        console.error('Encryption failed', e)
        return { error: 'Failed to secure key' }
    }

    // 3. Save to DB
    const { error } = await supabase
        .from('api_keys')
        .upsert({
            org_id: membership.organization_id,
            provider: provider.toLowerCase(),
            key_hint: rawKey.slice(-4),
            encrypted_key: encryptedKey,
            is_active: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'org_id, provider' })

    if (error) {
        console.error('DB Error', error)
        return { error: 'Failed to save key' }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function deleteApiKey(provider: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Org
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'No organization found' }

    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('org_id', membership.organization_id)
        .eq('provider', provider)

    if (error) return { error: 'Failed to delete' }

    revalidatePath('/dashboard/settings')
    return { success: true }
}
