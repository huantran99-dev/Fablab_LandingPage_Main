import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Định tuyến bằng hash (`#/sections/courses`) — không dùng react-router.
 *
 * Dashboard chỉ có vài màn hình và chạy dưới đúng một file `admin.html`, nên hash
 * là đủ, và không phải cấu hình máy chủ trả `admin.html` cho mọi đường dẫn con.
 *
 * `shouldBlock` được hỏi MỖI lần hash đổi (kể cả nút Back của trình duyệt). Trả
 * `true` nghĩa là còn thay đổi chưa lưu: hỏi xác nhận, và nếu người dùng ở lại thì
 * trả URL về như cũ bằng `replaceState` — hàm này không phát `hashchange`, nên không
 * có vòng lặp hỏi đi hỏi lại.
 */
function parse(hash) {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => decodeURIComponent(part))
  return { name: parts[0] ?? 'dashboard', param: parts[1] ?? null }
}

export function useHashRoute(shouldBlock) {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  const blockRef = useRef(shouldBlock)
  const lastHash = useRef(window.location.hash)

  useEffect(() => {
    blockRef.current = shouldBlock
  })

  useEffect(() => {
    const onChange = () => {
      const next = window.location.hash
      if (next === lastHash.current) return

      if (blockRef.current?.() && !window.confirm('Có thay đổi chưa lưu. Rời trang này và bỏ các thay đổi đó?')) {
        window.history.replaceState(null, '', lastHash.current || '#/')
        return
      }
      lastHash.current = next
      setRoute(parse(next))
    }

    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((to) => {
    window.location.hash = to
  }, [])

  return [route, navigate]
}
