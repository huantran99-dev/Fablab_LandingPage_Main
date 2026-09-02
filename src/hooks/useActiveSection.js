import { useEffect, useState } from 'react'

/**
 * Trả về id của section đang nằm trong vùng nhìn, để navbar tô sáng đúng link.
 *
 * `rootMargin` phía trên bù chiều cao navbar sticky, phía dưới thu hẹp vùng
 * quan sát về khoảng giữa màn hình — nhờ vậy chỉ có đúng một section được coi
 * là "đang xem" thay vì nhảy qua lại khi hai section cùng lọt vào khung nhìn.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el) => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: '-88px 0px -55% 0px', threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
