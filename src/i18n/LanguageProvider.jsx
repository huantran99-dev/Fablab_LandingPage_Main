import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { getContentState, startContentSync, subscribeContent } from '../lib/contentStore'
import { LANGUAGE_CODES, LanguageContext } from './context'

const STORAGE_KEY = 'fablab-lang'
const DEFAULT_LANG = 'vi'

/**
 * localStorage có thể ném lỗi (chế độ riêng tư, trình duyệt chặn site data),
 * nên mọi truy cập đều được bọc try/catch và luôn có đường lui về mặc định.
 */
function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGE_CODES.has(stored)) return stored
  } catch {
    /* bỏ qua — dùng mặc định */
  }
  return DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang)

  // Nội dung sống ngoài React nên đăng ký qua `useSyncExternalStore`: mọi component
  // thấy cùng một bản, và không phải `setState` trong effect (luật lint cấm).
  const content = useSyncExternalStore(subscribeContent, getContentState, getContentState)

  useEffect(() => {
    // Gọi API sau lần vẽ đầu, để lần vẽ đó không phải chờ mạng.
    startContentSync()
  }, [])

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
      t: content[lang],
      contentRev: content.rev,
      contentSource: content.source,
    }),
    [lang, content],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
