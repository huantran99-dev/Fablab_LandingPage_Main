import { createContext, useContext } from 'react'

/**
 * Hành động của nút do admin tạo (API 23): mở popup tự tạo, mở form tự tạo, hoặc chuyển
 * sang form đăng ký có sẵn. Tách khỏi file component để Fast Refresh không than.
 */
export const ActionContext = createContext(null)

/** Bản nháp trống của một form tự tạo. Câu trả lời theo id ô. */
export const EMPTY_FORM_DRAFT = { answers: {}, birthYear: '', parentName: '', consent: false }

export function useActions() {
  const context = useContext(ActionContext)
  if (!context) throw new Error('useActions phải nằm trong <ActionProvider>')
  return context
}
