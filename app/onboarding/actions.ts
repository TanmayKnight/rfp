'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createOrganizationAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const orgName = formData.get('orgName') as string
    const industry = formData.get('industry') as string
    const companySize = formData.get('size') as string
    const website = formData.get('website') as string

    if (!orgName || orgName.length < 2) {
        return { error: 'Invalid name' }
    }

    // 1. Transactional Create (Org + Member) via RPC
    const { data: orgId, error: rpcError } = await supabase.rpc('create_organization_v2', {
        org_name: orgName,
        org_industry: industry,
        org_size: companySize,
        org_website: website
    })

    if (rpcError || !orgId) {
        console.error('Org creation failed (RPC). Error details:', JSON.stringify(rpcError, null, 2))
        redirect(`/onboarding?error=creation_failed&details=${encodeURIComponent(rpcError?.message || 'unknown')}`)
    }

    // 3. Redirect to Subscription Page (Trial Enforced)
    redirect('/onboarding/subscribe')
}
