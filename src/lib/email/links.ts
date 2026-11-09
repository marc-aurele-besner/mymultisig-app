// Public origin used to build links inside outgoing email (request, confirm,
// unsubscribe). Mirrors siteUrl in src/config.tsx; kept here as a plain
// string so server-side code does not import the React head helper.
export const SITE_URL = 'https://mymultisig.app'

export const requestUrl = (requestId: string) => `${SITE_URL}/request/${encodeURIComponent(requestId)}`

export const confirmUrl = (token: string) => `${SITE_URL}/api/email/confirm?token=${encodeURIComponent(token)}`

export const unsubscribeUrl = (token: string) => `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`
