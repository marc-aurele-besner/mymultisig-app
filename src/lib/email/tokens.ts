import { randomBytes } from 'crypto'

// Random, URL-safe token for the confirm and unsubscribe links. 32 bytes of
// entropy is well beyond guessing; the value is stored on email_recipients
// (see schema.sql) so every notification can carry its own unsubscribe link.
export const generateLinkToken = (): string => randomBytes(32).toString('base64url')
