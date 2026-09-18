import { useEffect } from 'react'

/**
 * Khoá cuộn nền khi có popup mở. Dùng chung cho popup khóa học và form đăng ký.
 *
 * Đặt trên `<html>`, KHÔNG đặt trên `<body>`: body đang có `overflow-x: clip` để
 * chặn tràn ngang lúc section trượt; ghi đè `overflow` lên đó sẽ biến body thành
 * scroll container và làm chết navbar sticky.
 *
 * Có bộ đếm vì popup khóa học đóng và form đăng ký mở trong CÙNG một lượt render.
 * Hai khoá độc lập mỗi bên tự nhớ "giá trị trước đó" thì bên sau có thể nhớ nhầm
 * `hidden` của bên trước, và trang kẹt không cuộn được sau khi đóng hết.
 */
let locks = 0
let previous = ''

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return

    const root = document.documentElement
    if (locks === 0) {
      previous = root.style.overflow
      root.style.overflow = 'hidden'
    }
    locks += 1

    return () => {
      locks -= 1
      if (locks === 0) root.style.overflow = previous
    }
  }, [active])
}
