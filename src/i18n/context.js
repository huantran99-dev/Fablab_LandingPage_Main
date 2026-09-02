import { createContext, useContext } from 'react'
import { en } from './en'
import { vi } from './vi'

/** Từ điển theo mã ngôn ngữ. Hai object phải luôn cùng shape. */
export const dictionaries = { vi, en }

export const LANGUAGES = [
  { code: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { code: 'en', label: 'EN', name: 'English' },
]

export const LanguageContext = createContext(null)

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage() phải được gọi bên trong <LanguageProvider>')
  }
  return ctx
}

/** Shortcut lấy thẳng từ điển của ngôn ngữ đang chọn. */
export function useT() {
  return useLanguage().t
}
