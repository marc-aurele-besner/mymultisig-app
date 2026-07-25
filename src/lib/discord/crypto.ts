import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

import { discordConfig } from './config'

// AES-256-GCM for bot tokens at rest. The key is the raw 32-byte
// DISCORD_TOKEN_ENCRYPTION_KEY (the env var is base64-encoded for transport).
//
// Every call to encryptToken uses a fresh 12-byte IV — never reuse an IV with
// the same key. The output is base64(IV || ciphertext || authTag) so the
// stored string is self-describing and round-trips without a side table.
//
// Mirrors src/lib/slack/crypto.ts so the storage format is identical and
// the schema's bot_token_encrypted column is interchangeable between
// integrations in a future migration.

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

const key = (): Buffer => discordConfig().tokenEncryptionKey

export const encryptToken = (plain: string): string => {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, key(), iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  if (authTag.length !== AUTH_TAG_LENGTH) throw new Error('Unexpected GCM auth tag length')
  return Buffer.concat([iv, ciphertext, authTag]).toString('base64')
}

export const decryptToken = (encoded: string): string => {
  const buf = Buffer.from(encoded, 'base64')
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Encrypted token is too short')
  }
  const iv = buf.subarray(0, IV_LENGTH)
  const authTag = buf.subarray(buf.length - AUTH_TAG_LENGTH)
  const ciphertext = buf.subarray(IV_LENGTH, buf.length - AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGO, key(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
