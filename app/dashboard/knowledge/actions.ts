'use server'

import { createClient } from '@/utils/supabase/server'
import { generateEmbedding } from '@/utils/ai'
// @ts-ignore
const pdf = require('pdf-parse')
import { revalidatePath } from 'next/cache'

export async function uploadKnowledgeAction(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get Organization
    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!member) {
        return { error: 'No organization found. Please create one.' }
    }

    // 2. File Validation
    const file = formData.get('file') as File
    if (!file) {
        return { error: 'No file provided' }
    }

    if (file.type !== 'application/pdf') {
        return { error: 'Only PDF files are supported currently' }
    }

    try {
        // 3. Extract Text
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await pdf(buffer)
        const fullText = data.text

        if (!fullText || fullText.trim().length === 0) {
            return { error: 'Could not extract text from this PDF.' }
        }

        // 4. Chunk Text
        // Simple splitting by double newline (paragraphs) or fixed size
        // For MVP: Split by paragraphs, then ensure no chunk > 1000 chars
        const rawChunks = fullText.split(/\n\s*\n/)
        const chunks: string[] = []

        for (const chunk of rawChunks) {
            const trimmed = chunk.trim()
            if (trimmed.length > 0) {
                // If chunk is too big, just slice it (naive).
                // A better approach would be smart recursive splitting, but keeping MVP simple.
                if (trimmed.length > 2000) {
                    // Hard slice for massive blocks
                    const subChunks = trimmed.match(/.{1,2000}/g) || []
                    chunks.push(...subChunks)
                } else {
                    chunks.push(trimmed)
                }
            }
        }

        // 5. Generate Embeddings & Store
        // Limit to processing 50 chunks at a time to avoid timeouts/limits
        // In production, use a queue.
        const limitedChunks = chunks.slice(0, 50)

        // Check user credits (optional MVP step, skipping for now to reduce friction)

        for (const chunkText of limitedChunks) {
            const embedding = await generateEmbedding(chunkText)

            const { error: insertError } = await supabase
                .from('knowledge_base')
                .insert({
                    organization_id: member.organization_id,
                    user_id: user.id, // Optional now, but keeping for audit
                    content_chunk: chunkText,
                    embedding: embedding,
                    source_filename: file.name,
                })

            if (insertError) {
                console.error('Insert error:', insertError)
                // continue...
            }
        }

        revalidatePath('/dashboard/knowledge')
        return { success: true, message: `Processed ${limitedChunks.length} chunks.` }

    } catch (error) {
        console.error('Upload processing error:', error)
        return { error: 'Failed to process file' }
    }
}
