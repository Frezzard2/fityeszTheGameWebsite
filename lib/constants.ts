export const SITE_TITLE = { hu: 'Fityesz Krónika', en: 'The Fityesz Chronicle' } as const
export const LOCALES = ['hu', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'hu'
