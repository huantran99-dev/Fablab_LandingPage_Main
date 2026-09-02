import { useRef } from 'react'
import { useInView } from '../../hooks/useInView'
import { REDUCED_MOTION } from '../../lib/motion'

/**
 * Ngưỡng chung cho mọi phần tử trượt-khi-cuộn.
 *
 * Lề âm 25% ở đáy: kích hoạt khi đỉnh phần tử lên tới khoảng 3/4 chiều cao màn
 * hình, lúc nó đã vào hẳn tầm nhìn. `once: false` để theo dõi liên tục — đây là
 * điều kiện để có lượt trượt ra khi phần tử rời khung nhìn.
 */
const REVEAL_VIEWPORT = {
  threshold: 0,
  rootMargin: '0px 0px -25% 0px',
  once: false,
  // Người dùng đã tắt chuyển động thì không dựng observer làm gì.
  enabled: !REDUCED_MOTION,
}

function useRevealState() {
  const ref = useRef(null)
  const inView = useInView(ref, REVEAL_VIEWPORT)

  // Tắt chuyển động thì luôn ở trạng thái hiện, không bao giờ bị ẩn đi.
  const state = REDUCED_MOTION || inView ? 'shown' : 'hidden'
  return [ref, state]
}

/**
 * Một phần tử trượt vào khi cuộn tới và trượt ra khi rời khung nhìn.
 * `from` nhận 'left' | 'right' | 'up'.
 */
export function Reveal({ as: Tag = 'div', from = 'up', className = '', children, ...props }) {
  const [ref, state] = useRevealState()

  return (
    <Tag
      ref={ref}
      data-reveal={state}
      data-reveal-from={from}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  )
}

/**
 * Container cho lưới — các con trượt vào lần lượt cách nhau 90ms, và rời đi cùng
 * lúc khi ra khỏi khung nhìn.
 *
 * Dùng attribute riêng `data-reveal-group` để selector container không giẫm lên
 * selector của phần tử đơn. Độ trễ do CSS lo bằng nth-child (xem index.css), nên
 * bản thân các card không cần sửa gì và cả lưới chỉ tốn đúng một
 * IntersectionObserver thay vì một cái cho mỗi card.
 */
export function RevealGroup({ as: Tag = 'div', from = 'up', className = '', children, ...props }) {
  const [ref, state] = useRevealState()

  return (
    <Tag
      ref={ref}
      data-reveal-group={state}
      data-reveal-from={from}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  )
}
