import { useState } from 'react'

/**
 * Con trỏ vòng cho carousel.
 *
 * `current` được kẹp lúc render chứ không đồng bộ bằng effect: khi đổi ngôn ngữ
 * mà danh sách mới ngắn hơn, con trỏ tự lùi về đầu ngay trong lần render đó,
 * không tốn thêm một vòng render và không dính lỗi lint `set-state-in-effect`.
 */
export function useCarousel(total) {
  const [index, setIndex] = useState(0)

  const current = index < total ? index : 0

  return {
    current,
    goTo: setIndex,
    go: (step) => setIndex(total > 0 ? (current + step + total) % total : 0),
  }
}
