import { useMemo } from 'react'
import { useT } from '../i18n/context'
import { hiddenAnchors, liveHref } from '../lib/pageSections'

/**
 * `(href) => boolean`: link còn đích trên trang không. Chỉ `#neo` thuộc một khối đang tắt là
 * "chết" — xem `src/lib/pageSections.js`. Dùng cho menu, footer, nút Hero, popup sự kiện mùa.
 */
export function useLiveHref() {
  const t = useT()
  return useMemo(() => {
    const hidden = hiddenAnchors(t)
    return (href) => liveHref(href, hidden)
  }, [t])
}
