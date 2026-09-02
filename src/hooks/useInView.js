import { useEffect, useState } from 'react'

/**
 * Theo dõi phần tử có đang nằm trong khung nhìn hay không.
 *
 * - `once: true` (mặc định): latch `true` ở lần đầu rồi tự ngắt observer. Dùng
 *   cho hiệu ứng chạy-một-lần.
 * - `once: false`: theo dõi liên tục, trả về `false` khi phần tử rời khung nhìn.
 *   Dùng cho hiệu ứng hai chiều vào/ra.
 * - `enabled: false`: không dựng observer (ví dụ người dùng đã tắt chuyển động).
 *
 * Mọi tuỳ chọn đều là giá trị nguyên thuỷ ổn định nên effect chỉ chạy một lần
 * lúc mount — không đưa `inView` vào dependency, tránh dựng rồi vứt observer mỗi
 * lần trạng thái lật.
 */
export function useInView(
  ref,
  { threshold = 0.3, rootMargin = '0px', enabled = true, once = true } = {},
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin, enabled, once])

  return inView
}
