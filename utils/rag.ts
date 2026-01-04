
import { OpenAI } from 'openai'
import PDFParser from 'pdf2json'

// Simple chunking strategy
export async function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200) {
    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
        let end = start + chunkSize

        // If we are not at the end of the text, try to find a natural break point (newline or period)
        if (end < text.length) {
            const nextNewLine = text.indexOf('\n', end)
            const lastPeriod = text.lastIndexOf('.', end)

            // Prefer cutting at a newline if it's close, otherwise period
            if (nextNewLine !== -1 && nextNewLine - end < 100) {
                end = nextNewLine + 1
            } else if (lastPeriod > start + chunkSize / 2) {
                end = lastPeriod + 1
            }
        }

        const chunk = text.slice(start, end).trim()
        if (chunk.length > 50) { // Ignore very small chunks
            chunks.push(chunk)
        }

        start += chunkSize - overlap
    }

    return chunks
}

export async function parseFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.type === 'application/pdf') {
        return new Promise((resolve, reject) => {
            const parser = new PDFParser(null, true) // true = Need raw text

            parser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError))
            parser.on('pdfParser_dataReady', () => {
                // getRawTextContent() returns the text
                const text = parser.getRawTextContent()
                resolve(text)
            })

            // Parse from buffer
            parser.parseBuffer(buffer)
        })
    } else {
        // Assume text/md/csv
        return buffer.toString('utf-8')
    }
}

export async function generateEmbeddings(chunks: string[], apiKey: string) {
    const client = new OpenAI({ apiKey })

    // Process in batches of 20 to avoid rate limits
    const embeddings: { content: string, embedding: number[] }[] = []
    const batchSize = 20

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)

        try {
            const response = await client.embeddings.create({
                model: "text-embedding-3-small",
                input: batch,
                encoding_format: "float"
            })

            response.data.forEach((item, index) => {
                embeddings.push({
                    content: batch[index],
                    embedding: item.embedding
                })
            })
        } catch (e) {
            console.error('Error generating embeddings for batch', e)
            throw new Error('Failed to generate embeddings via OpenAI')
        }
    }

    return embeddings
}
