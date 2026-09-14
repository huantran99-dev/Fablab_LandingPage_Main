import { createContext, useContext } from 'react'

/**
 * Ngôn ngữ hỗ trợ. `code` là khoá tra vào bản nội dung, KHÔNG được dịch.
 *
 * Trước đây file này import thẳng `vi.js` và `en.js`. Từ khi có dashboard thì nội
 * dung đến từ `lib/contentStore.js` (bản đóng gói + bản sống từ API), nên hai file
 * kia chỉ còn là hồ sơ nguồn gốc — **sửa vào chúng không còn tác dụng gì**.
 */
export const LANGUAGES = [
  { code: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { code: 'en', label: 'EN', name: 'English' },
]

export const LANGUAGE_CODES = new Set(LANGUAGES.map((language) => language.code))

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
