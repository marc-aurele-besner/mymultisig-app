export interface Searchable {
  label: string
  hint?: string
  keywords?: string[]
}

// True when `a` and `b` differ by at most one insertion, deletion,
// substitution or adjacent swap. Enough to forgive a single typo.
const withinOneEdit = (a: string, b: string): boolean => {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  if (a.length === b.length) {
    // substitution, or swap of two neighbours
    if (a.slice(i + 1) === b.slice(i + 1)) return true
    return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2)
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a]
  return shorter.slice(i) === longer.slice(i + 1)
}

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

// How well one query word matches an entry. 0 means no match.
const scoreToken = (token: string, entry: Searchable): number => {
  const label = entry.label.toLowerCase()
  const labelWords = words(label)
  const keywords = (entry.keywords ?? []).map((keyword) => keyword.toLowerCase())

  if (label === token) return 100
  if (label.startsWith(token)) return 85
  if (labelWords.includes(token)) return 75
  if (labelWords.some((word) => word.startsWith(token))) return 65
  if (keywords.includes(token)) return 55
  if (token.length >= 3 && label.includes(token)) return 45
  if (keywords.some((keyword) => words(keyword).some((word) => word.startsWith(token)))) return 35
  if (token.length >= 3 && keywords.some((keyword) => keyword.includes(token))) return 25
  if (token.length >= 3 && (entry.hint ?? '').toLowerCase().includes(token)) return 15
  // One typo, on words long enough that a near miss is not a coincidence.
  if (token.length >= 4) {
    if (labelWords.some((word) => withinOneEdit(word, token))) return 30
    if (keywords.some((keyword) => words(keyword).some((word) => withinOneEdit(word, token)))) return 12
  }
  return 0
}

// Score of an entry for a query: every query word has to match something
// (name, synonym or description), and matches on the name count most.
// A query that equals a whole synonym phrase ("api key") is boosted so the
// page that owns the phrase beats pages that merely mention both words.
export const scoreEntry = (query: string, entry: Searchable): number => {
  const normalized = query.trim().toLowerCase()
  const tokens = words(normalized)
  if (tokens.length === 0) return 0
  let total = 0
  for (const token of tokens) {
    const score = scoreToken(token, entry)
    if (score === 0) return 0
    total += score
  }
  const label = entry.label.toLowerCase()
  if (label === normalized) total += 100
  else if (label.startsWith(normalized)) total += 40
  else if (tokens.length > 1 && label.includes(normalized)) total += 30
  if (tokens.length > 1 && (entry.keywords ?? []).some((keyword) => keyword.toLowerCase() === normalized)) total += 30
  return total / tokens.length
}

// Entries that match, best first. Ties keep their original order, so the
// caller's list order doubles as a priority (e.g. the user's own multisigs
// before static pages).
export const rank = <T extends Searchable>(query: string, entries: T[], limit = 12): T[] =>
  entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(query, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.entry)
