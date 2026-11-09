// Request timestamps come in two shapes: dateSubmitted is stored as epoch
// milliseconds (Date.now().toString()), while dateExecuted / dateCancelled are
// ISO strings (new Date().toISOString()). Parsing one shape as the other gives
// "Invalid Date", so accept both and return null for anything unusable.
export const parseRequestDate = (value: string | number | null | undefined): Date | null => {
  if (value == null) return null
  const raw = typeof value === 'number' ? value : value.trim()
  if (raw === '') return null
  const date = typeof raw === 'number' || /^\d+$/.test(raw) ? new Date(Number(raw)) : new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

// Date only, e.g. "11/9/2026". Null when the value cannot be parsed.
export const formatRequestDate = (value: string | number | null | undefined): string | null =>
  parseRequestDate(value)?.toLocaleDateString() ?? null

// Date and time, e.g. "11/9/2026, 3:42:10 PM". Null when the value cannot be parsed.
export const formatRequestDateTime = (value: string | number | null | undefined): string | null =>
  parseRequestDate(value)?.toLocaleString() ?? null
