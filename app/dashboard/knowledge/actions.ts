
'use server'

import { createClient } from '@/utils/supabase/server'
import { decrypt } from '@/utils/encryption'
import { parseFile, chunkText, generateEmbeddings } from '@/utils/rag'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Org & API Key
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'No org found' }

    const { data: keyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('org_id', membership.organization_id)
        .eq('provider', 'openai')
        .eq('is_active', true)
        .single()

    if (!keyData) return { error: 'No OpenAI key found. Please add one in Settings.' }

    let apiKey = ''
    try {
        apiKey = decrypt(keyData.encrypted_key)
    } catch (e) {
        return { error: 'Failed to decrypt API key' }
    }

    // 2. Parse & Chunk
    try {
        const text = await parseFile(file)
        const chunks = await chunkText(text)

        // 3. Embed (BYOK)
        const vectors = await generateEmbeddings(chunks, apiKey)

        // 4. Store
        // Prepare rows for bulk insert
        const rows = vectors.map(v => ({
            organization_id: membership.organization_id,
            source_filename: file.name,
            content_chunk: v.content,
            embedding: v.embedding
        }))

        const { error } = await supabase
            .from('knowledge_base')
            .insert(rows)

        if (error) {
            console.error('Insert error', error)
            return { error: 'Failed to save to database' }
        }

        revalidatePath('/dashboard/knowledge')
        return { success: true }

    } catch (e) {
        console.error('Processing error', e)
        return { error: 'Failed to process document. ' + (e as Error).message }
    }
}

export async function deleteDocument(filename: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get Org
    const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!membership) return { error: 'No org found' }

    // Delete all chunks with this filename for this org
    const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('organization_id', membership.organization_id)
        .eq('source_filename', filename)

    if (error) return { error: 'Failed to delete' }

    revalidatePath('/dashboard/knowledge')
    return { success: true }
}
