import { useEffect, useRef } from 'react'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useT } from '../../i18n/context'
import { useActions } from '../actions/ActionContext'
import { CustomForm, FORM_TITLE_ID } from './CustomForm'

/**
 * Dialog của form tự tạo (API 23). Mount đúng một lần, SAU `<CustomPopup />` và TRƯỚC
 * `<RegisterDialog />` trong App: nút trong popup đóng popup rồi mở form trong cùng một lượt,
 * effect chạy theo thứ tự cây — popup `close()` trả focus về nút đã mở popup trước, rồi form
 * mới `showModal()` và ghi nhớ chính nút đó.
 *
 * Bấm ra nền KHÔNG đóng form (như form đăng ký): lỡ tay là mất form đang điền dở. Nháp sống
 * trong ActionProvider nên Esc rồi mở lại vẫn còn chữ.
 *
 * Form tra theo id trong nội dung ĐANG XEM: đổi ngôn ngữ thì chữ dịch theo; form bị xoá khỏi
 * nội dung thì dialog đóng.
 */
export function FormDialog() {
  const t = useT()
  const { form: state, closeForm } = useActions()
  const ref = useRef(null)
  const form = state.open ? (t.forms?.items ?? []).find((item) => item.id === state.id) : null
  const open = Boolean(form)

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
      onClose={closeForm}
      aria-labelledby={FORM_TITLE_ID}
      className="w-full max-w-[min(680px,calc(100vw-32px))]"
    >
      {/* `key`: mở form khác thì trạng thái gửi / lỗi của form trước không lẫn sang. */}
      {form && <CustomForm key={form.id} form={form} source={state.source} onClose={closeForm} />}
    </dialog>
  )
}
