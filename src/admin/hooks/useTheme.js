import { useEffect, useState } from 'react'

import { readStored, writeStored } from '../lib/storage'

const KEY = 'fablab-admin.theme'

function initialTheme() {
  const stored = readStored(KEY, null)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Sáng / tối, gắn bằng class `dark` trên `<html>` (khớp `@custom-variant dark` trong
 * admin.css). Effect chỉ đổi DOM và lưu tuỳ chọn, không gọi setState.
 */
export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    writeStored(KEY, theme)
  }, [theme])

  const toggle = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  return [theme, toggle]
}
