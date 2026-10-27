import { useCallback, useMemo, useState } from 'react'
import { track } from '../../lib/track'
import { RegisterContext } from './RegisterContext'
import { EMPTY_DRAFTS } from './validate'

/**
 * Giữ trạng thái mở/đóng, TAB đang chọn (`kind`: 'course' | 'member') và BẢN NHÁP của
 * từng tab.
 *
 * Bản nháp sống ở đây chứ không trong form: form chỉ được dựng khi dialog mở, nên
 * lỡ tay bấm Esc mà nháp nằm trong form là mất sạch chữ đã gõ. Mỗi tab một bản nháp
 * riêng — đổi tab qua lại không mất chữ, và số điện thoại phụ huynh không lẫn sang số
 * của thành viên. Nháp chỉ ở trong bộ nhớ — không ghi xuống localStorage, vì đây là dữ
 * liệu cá nhân (có trẻ em).
 */
export function RegisterProvider({ children }) {
  const [state, setState] = useState({ open: false, source: 'nav', kind: 'course' })
  const [drafts, setDrafts] = useState(EMPTY_DRAFTS)

  /**
   * `courseId` có giá trị (nút trong popup khóa học) → tab Khóa học, chọn sẵn khóa đó.
   * `null` (navbar, cuối trang) → giữ tab đã chọn lần trước (lần đầu là Khóa học).
   */
  const openRegister = useCallback((courseId, source) => {
    track('register_open', source)
    if (courseId) setDrafts((current) => ({ ...current, course: { ...current.course, course: courseId } }))
    setState((current) => ({ open: true, source, kind: courseId ? 'course' : current.kind }))
  }, [])

  const closeRegister = useCallback(() => {
    setState((current) => (current.open ? { ...current, open: false } : current))
  }, [])

  const setKind = useCallback((kind) => setState((current) => (current.kind === kind ? current : { ...current, kind })), [])

  /** Cập nhật bản nháp của MỘT tab, dạng `setState` (nhận hàm). */
  const setDraft = useCallback(
    (kind, update) => setDrafts((current) => ({ ...current, [kind]: update(current[kind]) })),
    [],
  )

  /** Gửi thành công chỉ xoá nháp của tab vừa gửi; tab kia giữ nguyên. */
  const resetDraft = useCallback((kind) => setDrafts((current) => ({ ...current, [kind]: EMPTY_DRAFTS[kind] })), [])

  const value = useMemo(
    () => ({ ...state, drafts, setDraft, setKind, openRegister, closeRegister, resetDraft }),
    [state, drafts, setDraft, setKind, openRegister, closeRegister, resetDraft],
  )

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>
}
