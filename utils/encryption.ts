
import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// Use a fallback key for development if env var is missing (DO NOT USE IN COMPLIANCE MODES)
// In production, this MUST be set in .env.local
const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.APP_ENCRYPTION_KEY || 'default-dev-key-32-chars-exactly!!'

export function encrypt(text: string) {
    // Key length validation
    if (SECRET_KEY.length !== 32) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('APP_ENCRYPTION_KEY must be exactly 32 characters')
        }
        console.warn('Warning: APP_ENCRYPTION_KEY is not 32 chars. Using unsafe padding.')
    }

    const iv = randomBytes(16)
    // Ensure key is 32 bytes
    const keyBuffer = Buffer.alloc(32)
    keyBuffer.write(SECRET_KEY)

    const cipher = createCipheriv(ALGORITHM, keyBuffer, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string) {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':')

    const keyBuffer = Buffer.alloc(32)
    keyBuffer.write(SECRET_KEY)

    const decipher = createDecipheriv(
        ALGORITHM,
        keyBuffer,
        Buffer.from(ivHex, 'hex')
    )

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}
