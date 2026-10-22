import { useEffect, useRef } from 'react'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useRegister } from './RegisterContext'
import { REGISTER_TITLE_ID, RegisterForm } from './RegisterForm'

/**
 * Dialog chứa form đăng ký. Mount ĐÚNG MỘT LẦN, SAU `<Footer />` trong App.
 *
 * Thứ tự mount đó có chủ đích. Bấm "Đăng ký" trong popup khóa học sẽ đóng popup và
 * mở form trong cùng một lượt render; effect chạy theo thứ tự cây, nên popup
 * `close()` trước (trả focus về thẻ khóa học), rồi form mới `showModal()` và ghi
 * nhớ chính thẻ đó. Đóng form thì focus quay về đúng thẻ khóa học. Đảo thứ tự thì
 * form ghi nhớ nút bên trong popup đã đóng, và focus rơi mất.
 *
 * Bấm ra nền KHÔNG đóng form (khác popup khóa học): lỡ tay một cái là mất cả form
 * đang điền dở. Chỉ nút × và phím Esc đóng được — và bản nháp vẫn còn.
 */
export function RegisterDialog() {
  const { open, closeRegister } = useRegister()
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useScrollLock(open)

  return (
    <dialog
      ref={ref}
      onClose={closeRegister}
      aria-labelledby={REGISTER_TITLE_ID}
      className="w-full max-w-[min(680px,calc(100vw-32px))]"
    >
      {open && <RegisterForm onClose={closeRegister} />}
    </dialog>
  )
}
