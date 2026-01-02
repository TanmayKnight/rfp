
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
    })
    return response.data[0].embedding
}

export async function generateAnswer(
    systemPrompt: string,
    userPrompt: string,
    model: 'gpt-4o-mini' | 'gpt-4o' = 'gpt-4o-mini'
) {
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    })
    return response.choices[0].message.content
}

export async function extractQuestionsFromText(text: string) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert RFP analyzer. Your task is to extract distinct questions that require a response from the provided RFP text.
        
        Rules:
        1. Return ONLY a JSON object with a single key "questions" containing an array of strings.
        2. Extract each question as a standalone string.
        3. Ignore general instructions or boilerplate unless it requires a specific answer.
        4. If a section has multiple sub-questions, break them down if they are distinct.
        5. Do not include markdown code blocks in the response, just the raw JSON string.`,
            },
            {
                role: 'user',
                content: `Extract questions from this text:\n\n${text.substring(0, 50000)}`,
            },
        ],
        response_format: { type: 'json_object' },
    })

    try {
        const content = response.choices[0].message.content
        if (!content) return []
        const parsed = JSON.parse(content)
        return parsed.questions as string[]
    } catch (e) {
        console.error('Failed to parse extraction response', e)
        return []
    }
}
