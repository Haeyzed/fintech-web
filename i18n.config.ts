export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALES = ['en', 'de', 'ar', 'fr'] as const

export const i18n = {
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
} as const

export type Locale = (typeof LOCALES)[number]


export const dictionaries = {
    en: () => import('@/dictionaries/en.json').then(module => module.default),
    de: () => import('@/dictionaries/de.json').then(module => module.default),
    ar: () => import('@/dictionaries/ar.json').then(module => module.default),
    fr: () => import('@/dictionaries/fr.json').then(module => module.default)
} as const

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>