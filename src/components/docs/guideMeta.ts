const siteUrl = 'https://mymultisig.app'

export type GuideSlug =
  | 'what-is-a-multisig'
  | 'create-a-multisig'
  | 'propose-sign-execute'
  | 'import-a-multisig'
  | 'ai-agents'

// First publish and last content edit of each guide (YYYY-MM-DD, from git history).
// Bump dateModified when a guide's content changes: it is shown on the page as
// "Last updated" and sent to search and answer engines, which favour fresh pages.
export const GUIDE_DATES: Record<GuideSlug, { datePublished: string; dateModified: string }> = {
  'what-is-a-multisig': { datePublished: '2026-07-16', dateModified: '2026-11-09' },
  'create-a-multisig': { datePublished: '2026-07-16', dateModified: '2026-11-09' },
  'propose-sign-execute': { datePublished: '2026-07-16', dateModified: '2026-11-09' },
  'import-a-multisig': { datePublished: '2026-07-16', dateModified: '2026-11-09' },
  'ai-agents': { datePublished: '2026-11-09', dateModified: '2026-11-09' }
}

/** Shared schema.org fields for a guide's Article / HowTo block: dates, author, publisher and page. */
export const guideStructuredData = (slug: GuideSlug) => {
  const url = `${siteUrl}/docs/${slug}`
  return {
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    image: `${siteUrl}/images/og-image.png`,
    ...GUIDE_DATES[slug],
    author: { '@type': 'Person', name: 'Marc-Aurele Besner', url: 'https://github.com/marc-aurele-besner' },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'MyMultiSig',
      url: `${siteUrl}/`,
      logo: `${siteUrl}/favicon/web-app-manifest-512x512.png`
    }
  }
}

/** Props a guide's getStaticProps adds so the head emits og:type article with its dates. */
export const guidePageProps = (slug: GuideSlug) => GUIDE_DATES[slug]
