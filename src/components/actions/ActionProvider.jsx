import { useCallback, useMemo, useState } from 'react'
import { useRegister } from '../register/RegisterContext'
import { ActionContext, EMPTY_FORM_DRAFT } from './ActionContext'

/**
 * Trạng thái popup tự tạo + form tự tạo đang mở, và bản nháp của từng form.
 *
 * Phải nằm TRONG `<RegisterProvider>`: hành động "Mở form đăng ký có sẵn" đi qua
 * `openRegister` của nó. `source` là chỗ đặt nút (hero, nav, nav-drawer, final-cta, popup,
 * seasonal-popup) — ghi vào bài gửi / lượt đăng ký để biết người gửi đến từ nút nào.
 *
 * Nháp chỉ ở trong bộ nhớ, theo id form — không ghi localStorage (dữ liệu cá nhân). Lỡ Esc
 * đóng form thì mở lại vẫn còn chữ.
 */
export function ActionProvider({ children }) {
  const { openRegister } = useRegister()
  const [popup, setPopup] = useState({ open: false, id: null })
  const [form, setForm] = useState({ open: false, id: null, source: 'hero' })
  const [formDrafts, setFormDrafts] = useState({})

  const openPopup = useCallback((id) => setPopup({ open: true, id }), [])
  const closePopup = useCallback(() => setPopup((current) => (current.open ? { ...current, open: false } : current)), [])
  const openForm = useCallback((id, source) => setForm({ open: true, id, source }), [])
  const closeForm = useCallback(() => setForm((current) => (current.open ? { ...current, open: false } : current)), [])

  const setFormDraft = useCallback(
    (id, update) => setFormDrafts((current) => ({ ...current, [id]: update(current[id] ?? EMPTY_FORM_DRAFT) })),
    [],
  )
  const resetFormDraft = useCallback(
    (id) =>
      setFormDrafts((current) => {
        const { [id]: _sent, ...rest } = current
        return rest
      }),
    [],
  )

  /**
   * Chạy hành động của một nút (trừ `link` — link là thẻ `<a>`, trình duyệt tự đi). Gọi trong
   * CÙNG handler với việc đóng popup / drawer chứa nút: React gộp hai lần setState thành một
   * lượt render, và thứ tự mount trong App (popup trước form) lo phần trả focus.
   */
  const runAction = useCallback(
    (button, source) => {
      if (button.action === 'register') openRegister(button.courseId ?? null, source, button.registerKind ?? null)
      else if (button.action === 'form') openForm(button.formId, source)
      else if (button.action === 'popup') openPopup(button.popupId)
    },
    [openRegister, openForm, openPopup],
  )

  const value = useMemo(
    () => ({
      popup,
      form,
      formDrafts,
      openPopup,
      closePopup,
      openForm,
      closeForm,
      setFormDraft,
      resetFormDraft,
      runAction,
    }),
    [popup, form, formDrafts, openPopup, closePopup, openForm, closeForm, setFormDraft, resetFormDraft, runAction],
  )

  return <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
}
