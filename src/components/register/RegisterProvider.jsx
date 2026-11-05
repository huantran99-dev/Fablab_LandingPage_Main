import { useCallback, useMemo, useState } from 'react'
import { track } from '../../lib/track'
import { RegisterContext } from './RegisterContext'
import { EMPTY_DRAFTS } from './validate'

/**
 * Giữ trạng thái mở/đóng, loại form đang mở (`kind`: 'course' | 'member' | 'event') và BẢN
 * NHÁP của từng loại. `event` không phải tab — form sự kiện chỉ mở từ nút trên từng slide
 * của section Hoạt động — nên `tab` nhớ riêng tab member/course chọn lần cuối.
 *
 * Bản nháp sống ở đây chứ không trong form: form chỉ được dựng khi dialog mở, nên
 * lỡ tay bấm Esc mà nháp nằm trong form là mất sạch chữ đã gõ. Mỗi tab một bản nháp
 * riêng — đổi tab qua lại không mất chữ, và số điện thoại phụ huynh không lẫn sang số
 * của thành viên. Nháp chỉ ở trong bộ nhớ — không ghi xuống localStorage, vì đây là dữ
 * liệu cá nhân (có trẻ em).
 */
export function RegisterProvider({ children }) {
  const [state, setState] = useState({ open: false, source: 'nav', kind: 'course', tab: 'course' })
  const [drafts, setDrafts] = useState(EMPTY_DRAFTS)

  /**
   * `courseId` có giá trị (nút trong popup khóa học) → tab Khóa học, chọn sẵn khóa đó.
   * `null` (navbar, cuối trang) → giữ tab đã chọn lần trước (lần đầu là Khóa học).
   * `kind` truyền vào ('member' | 'course') thắng cả hai.
   */
  const openRegister = useCallback((courseId, source, kind = null) => {
    track('register_open', source)
    if (courseId) setDrafts((current) => ({ ...current, course: { ...current.course, course: courseId } }))
    setState((current) => {
      const tab = kind ?? (courseId ? 'course' : current.tab)
      return { open: true, source, kind: tab, tab }
    })
  }, [])

  /**
   * Form đăng ký một hoạt động (nút "Đăng ký cuộc thi / Workshop / hội thảo"). Đổi sang sự
   * kiện khác thì nháp giữ chữ đã gõ (họ tên, số điện thoại…), chỉ đổi sự kiện.
   */
  const openEventRegister = useCallback((eventId, source) => {
    track('register_open', source)
    setDrafts((current) => ({ ...current, event: { ...current.event, event: eventId } }))
    setState((current) => ({ ...current, open: true, source, kind: 'event' }))
  }, [])

  const closeRegister = useCallback(() => {
    setState((current) => (current.open ? { ...current, open: false } : current))
  }, [])

  // Chỉ tab member/course gọi tới (form sự kiện không có tab).
  const setKind = useCallback(
    (kind) => setState((current) => (current.kind === kind ? current : { ...current, kind, tab: kind })),
    [],
  )

  /** Cập nhật bản nháp của MỘT tab, dạng `setState` (nhận hàm). */
  const setDraft = useCallback(
    (kind, update) => setDrafts((current) => ({ ...current, [kind]: update(current[kind]) })),
    [],
  )

  /** Gửi thành công chỉ xoá nháp của tab vừa gửi; tab kia giữ nguyên. */
  const resetDraft = useCallback((kind) => setDrafts((current) => ({ ...current, [kind]: EMPTY_DRAFTS[kind] })), [])

  const value = useMemo(
    () => ({ ...state, drafts, setDraft, setKind, openRegister, openEventRegister, closeRegister, resetDraft }),
    [state, drafts, setDraft, setKind, openRegister, openEventRegister, closeRegister, resetDraft],
  )

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>
}
