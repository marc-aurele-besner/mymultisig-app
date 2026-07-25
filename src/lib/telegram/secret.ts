import { randomBytes } from 'crypto'

// Generates the webhook secret token we pass to Telegram's setWebhook.
// Telegram's allowed alphabet is `A-Z a-z 0-9 _ -` with a length of 1-256
// chars. 24 random bytes → 32 base64url chars is comfortably inside the
// alphabet (base64url uses `A-Za-z0-9-_`) and gives 192 bits of entropy.
export const generateWebhookSecret = (): string => randomBytes(24).toString('base64url')
