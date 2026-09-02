import { useEffect, useMemo, useState } from 'react'
import { LanguageContext, dictionaries } from './context'

const STORAGE_KEY = 'fablab-lang'
const DEFAULT_LANG = 'vi'

/**
 * localStorage có thể ném lỗi (chế độ riêng tư, trình duyệt chặn site data),
 * nên mọi truy cập đều được bọc try/catch và luôn có đường lui về mặc định.
 */
function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && Object.hasOwn(dictionaries, stored)) return stored
  } catch {
    /* bỏ qua — dùng mặc định */
  }
  return DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang)

  useEffect(() => {
    // Cập nhật <html lang> để screen reader đọc đúng ngữ điệu và SEO nhận đúng
    // ngôn ngữ trang.
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* không lưu được thì thôi, phiên hiện tại vẫn chạy đúng */
    }
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((current) => (current === 'vi' ? 'en' : 'vi')),
      t: dictionaries[lang],
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
