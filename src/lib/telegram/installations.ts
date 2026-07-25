import { eq } from 'drizzle-orm'

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import { telegramInstallations } from '../db/schema'
import type { TelegramInstallationRow } from '../db/schema'

// DB helpers for the telegram_installations table. The route handlers
// at src/pages/api/telegram/installations*.ts delegate the lookup and
// the "deactivate all" rotation step here so the route files stay
// focused on HTTP wiring.

export const findActiveInstallation = async (
  db: NeonHttpDatabase<any>
): Promise<TelegramInstallationRow | null> => {
  const rows = await db
    .select()
    .from(telegramInstallations)
    .where(eq(telegramInstallations.isActive, true))
    .limit(1)
  return rows[0] ?? null
}

// Flip every active row to inactive. Called from the POST handler inside
// the same transaction as the new insert, so the partial unique index on
// is_active=true accepts the new row without a conflict. Returns the
// rows that were deactivated (used by the route to log + decide whether
// to warn the user).
export const deactivateAllInstallations = async (
  db: NeonHttpDatabase<any>
): Promise<TelegramInstallationRow[]> => {
  const rows = await db
    .select()
    .from(telegramInstallations)
    .where(eq(telegramInstallations.isActive, true))
  if (rows.length === 0) return []
  await db
    .update(telegramInstallations)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(telegramInstallations.isActive, true))
  return rows
}

// UUID-shape guard for the [id] path param. parseIdParam from
// src/lib/api/middleware.ts only ensures the param is a non-empty string;
// this is the stricter check the route applies before hitting the DB.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isInstallationId = (raw: string | null | undefined): raw is string => {
  if (raw == null || raw === '') return false
  return UUID_RE.test(raw)
}
