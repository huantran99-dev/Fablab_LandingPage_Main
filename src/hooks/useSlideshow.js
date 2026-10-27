import { useRef, useState } from 'react'
import { useInView } from './useInView'
import { useMediaQuery } from './useMediaQuery'

/** Kéo/vuốt quá ngưỡng này (px) mới tính là chuyển slide. */
const DRAG_THRESHOLD = 40

const mod = (value, total) => ((value % total) + total) % total

/**
 * Bộ não chung của các banner tự chạy ở section Hoạt động (banner ảnh Sự kiện và banner
 * video Cuộc thi): con trỏ slide, tự chạy / tạm dừng, vuốt, phím mũi tên.
 *
 * Con trỏ khác `useCarousel` ở hai thứ: `cycle` (tăng sau MỖI lần chuyển, kể cả chọn lại
 * đúng slide đang hiện) làm `key` cho vạch tiến trình để nó chạy lại từ đầu; và `stamps[i]`
 * (lượt gần nhất slide `i` được chọn) làm `key` cho lớp Ken Burns — slide vừa được chọn
 * mount lại nên zoom chạy từ đầu, slide vừa rời đi GIỮ key nên vẫn zoom tiếp lúc mờ đi.
 * `current` kẹp lúc render: đổi ngôn ngữ mà danh sách ngắn đi thì tự về đầu.
 *
 * Tự chạy dừng khi: người dùng bấm dừng, focus BÀN PHÍM trong banner, banner ra khỏi khung
 * nhìn, và (chỉ khi `pauseOnHover`) rê chuột vào. Focus do chạm/bấm chuột KHÔNG dừng — nếu
 * không, vuốt một cái là banner đứng luôn trên điện thoại.
 *
 * `pauseOnHover` mặc định TẮT: banner Cuộc thi cao gần trọn màn hình nên lúc xem chuột hầu
 * như luôn nằm trên nó — dừng khi rê chuột làm banner đứng yên như bị hỏng (người dùng đã
 * báo đúng như vậy). Chỉ bật cho carousel thẻ nhỏ, nơi rê chuột vào là chủ ý đọc.
 *
 * Giảm chuyển động đọc SỐNG (không dùng hằng `REDUCED_MOTION`): bật giữa chừng thì rule ở
 * base ép animation còn 0.01ms, `animationend` của vạch tiến trình bắn liên tục và slide
 * nhấp nháy. Khi giảm chuyển động: KHÔNG tự chuyển slide, và `playing` mặc định là tắt.
 *
 * @param {number} total số slide
 * @param {{ playByDefault?: boolean, pauseOnHover?: boolean }} [options]
 *   `playByDefault: false` để mặc định dừng ngay cả khi không giảm chuyển động (vd. người
 *   xem bật tiết kiệm dữ liệu — đừng tự tải video).
 */
export function useSlideshow(total, { playByDefault = true, pauseOnHover = false } = {}) {
  const [state, setState] = useState({ index: 0, cycle: 0, stamps: {} })
  const current = state.index < total ? state.index : 0

  const move = (pick) =>
    setState((prev) => {
      const index = pick(prev.index < total ? prev.index : 0)
      const cycle = prev.cycle + 1
      return { index, cycle, stamps: { ...prev.stamps, [index]: cycle } }
    })
  const go = (step) => {
    if (total > 0) move((from) => mod(from + step, total))
  }
  const goTo = (index) => move(() => index)

  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, threshold: 0.4 })
  // `null` = người dùng chưa bấm nút dừng/phát lần nào → theo mặc định.
  const [userPaused, setUserPaused] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)

  const playing = userPaused === null ? !reduced && playByDefault : !userPaused
  // Tự CHUYỂN slide thì không bao giờ khi giảm chuyển động, kể cả khi người dùng bấm phát
  // (phát lúc đó chỉ là cho video chạy).
  const autoplay = !reduced && total > 1
  const running = autoplay && playing && !(pauseOnHover && hovered) && !keyboardFocus && inView

  // Kéo / vuốt: không pointer capture (để cú bấm vẫn rơi đúng nút bên trong), kéo xong
  // thì nuốt click đi kèm.
  const drag = useRef({ x: null, moved: false })

  const regionProps = {
    ref,
    tabIndex: 0,
    onKeyDown: (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
      }
    },
    onFocus: (event) => {
      if (event.target.matches(':focus-visible')) setKeyboardFocus(true)
    },
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false)
    },
    onPointerEnter: (event) => {
      if (event.pointerType === 'mouse') setHovered(true)
    },
    onPointerLeave: () => setHovered(false),
    onPointerDown: (event) => {
      drag.current = { x: event.clientX, moved: false }
    },
    onPointerUp: (event) => {
      if (drag.current.x === null) return
      const dx = event.clientX - drag.current.x
      drag.current.x = null
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        drag.current.moved = true
        go(dx < 0 ? 1 : -1)
      }
    },
    onPointerCancel: () => {
      drag.current.x = null
    },
    onClickCapture: (event) => {
      if (drag.current.moved) {
        event.stopPropagation()
        drag.current.moved = false
      }
    },
  }

  return {
    current,
    cycle: state.cycle,
    stamps: state.stamps,
    go,
    goTo,
    reduced,
    inView,
    autoplay,
    playing,
    running,
    playState: running ? 'running' : 'paused',
    togglePlaying: () => setUserPaused(playing),
    regionProps,
  }
}
