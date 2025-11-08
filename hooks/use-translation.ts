"use client"

import { useState, useCallback } from "react"
import { t as translate, getLocale, setLocale as setLocaleFn } from "@/lib/i18n"

type TranslationFunction = typeof translate

/**
 * React hook for i18n translations
 * Returns the translation function and locale management
 */
export function useTranslation() {
  const [locale, setLocaleState] = useState(getLocale())

  const setLocale = useCallback((newLocale: "en") => {
    setLocaleFn(newLocale)
    setLocaleState(newLocale)
  }, [])

  const t: TranslationFunction = useCallback(
    (key, params) => {
      return translate(key, params)
    },
    [locale],
  )

  return {
    t,
    locale,
    setLocale,
  }
}
