import en from "@/locales/en.json"

type Locale = "en"

type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends object ? `${K}` | `${K}.${DeepKeyOf<T[K]>}` : `${K}`) : never
    }[keyof T]
  : never

type TranslationKeys = DeepKeyOf<typeof en>

// Current locale (defaults to English)
let currentLocale: Locale = "en"

// Locale data
const locales: Record<Locale, typeof en> = {
  en,
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale
}

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
  if (locales[locale]) {
    currentLocale = locale
  } else {
    console.warn(`[i18n] Locale "${locale}" not found, falling back to "en"`)
    currentLocale = "en"
  }
}

/**
 * Get a translation by key path with optional interpolation
 * @param key - Dot-separated path to translation (e.g., "hub.title")
 * @param params - Optional object for string interpolation
 * @returns Translated string
 */
export function t(key: TranslationKeys, params?: Record<string, string | number>): string {
  const translation = getNestedValue(locales[currentLocale], key)

  if (translation === undefined) {
    console.warn(`[i18n] Translation key "${key}" not found for locale "${currentLocale}"`)
    return key
  }

  if (typeof translation !== "string") {
    console.warn(`[i18n] Translation key "${key}" is not a string`)
    return key
  }

  // Simple string interpolation: replace {variable} with params.variable
  if (params) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match
    })
  }

  return translation
}

/**
 * Helper to get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj)
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(locales) as Locale[]
}
