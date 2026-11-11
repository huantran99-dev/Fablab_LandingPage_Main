import { ArrowRightIcon } from '../../assets/icons/Icons'
import { useLiveHref } from '../../hooks/useLiveHref'
import { useT } from '../../i18n/context'
import { isButtonLive, isExternal, variantFor } from '../../lib/actions'
import { track } from '../../lib/track'
import { useActions } from '../actions/ActionContext'
import { Button } from './Button'

/**
 * Một nút do admin tạo (API 23) — mọi nút ở Hero, thanh menu, cuối trang, popup tự tạo và nút
 * chính của popup sự kiện mùa đi qua đây. Vẫn là `ui/Button` (không shadow, pill, có vật
 * trang trí mùa), chỉ thêm phần đọc dữ liệu.
 *
 *   slot      chỗ đặt — tạo id thống kê `${slot}-${id}` (khớp server/content/buttons.js)
 *   source    nguồn ghi vào lượt đăng ký / bài gửi form
 *   surface   'light' | 'dark' — nền nút đứng, quyết định variant của `style`
 *   ctaId     ghi đè id thống kê (nút popup sự kiện mùa giữ id cũ `seasonal-popup`)
 *   onBefore  chạy trước hành động: đóng drawer / popup chứa nút, trong CÙNG lượt bấm
 *
 * Nút không vẽ được (link vào khối đang tắt, form đóng nhận, popup đã xoá) trả `null`.
 */
export function ActionButton({ button, slot, source, surface = 'light', size = 'lg', ctaId, onBefore, className, wrap }) {
  const t = useT()
  const isLive = useLiveHref()
  const { runAction } = useActions()
  if (!isButtonLive(t, button, isLive)) return null

  const id = ctaId ?? `${slot}-${button.id}`
  const shared = { variant: variantFor(button.style, surface), size, className, wrap }
  const content = (
    <>
      {button.label}
      {button.arrow && <ArrowRightIcon />}
    </>
  )

  if (button.action === 'link') {
    const external = isExternal(button.href)
    return (
      <Button
        {...shared}
        href={button.href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        onClick={() => {
          track('cta_click', id)
          onBefore?.()
        }}
      >
        {content}
      </Button>
    )
  }

  return (
    <Button
      {...shared}
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        track('cta_click', id)
        onBefore?.()
        runAction(button, source)
      }}
    >
      {content}
    </Button>
  )
}
