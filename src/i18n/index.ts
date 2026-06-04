import { create } from 'zustand'
import en from './locales/en'
import id from './locales/id'

export type Locale = 'en' | 'id'

interface LocaleStore {
  locale: Locale
  setLocale: (l: Locale) => void
  toggleLocale: () => void
}

export const useLocaleStore = create<LocaleStore>(set => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),
  toggleLocale: () => set(s => ({ locale: s.locale === 'en' ? 'id' : 'en' })),
}))

const locales = { en, id }

export function useT() {
  const locale = useLocaleStore(s => s.locale)
  return locales[locale]
}
