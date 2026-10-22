import { useCallback, useMemo, useState } from 'react'
import { track } from '../../lib/track'
import { RegisterContext } from './RegisterContext'
import { EMPTY_DRAFT } from './validate'

/**
 * Giữ trạng thái mở/đóng và BẢN NHÁP của form.
 *
 * Bản nháp sống ở đây chứ không trong form: form chỉ được dựng khi dialog mở, nên
 * lỡ tay bấm Esc mà nháp nằm trong form là mất sạch chữ đã gõ. Nháp chỉ ở trong bộ
 * nhớ — không ghi xuống localStorage, vì đây là dữ liệu cá nhân (có trẻ em).
 */
export function RegisterProvider({ children }) {
  const [state, setState] = useState({ open: false, source: 'nav' })
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  /** `courseId` null = mở form chưa chọn khóa (navbar, cuối trang): giữ lựa chọn cũ nếu có. */
  const openRegister = useCallback((courseId, source) => {
    track('register_open', source)
    if (courseId) setDraft((current) => ({ ...current, course: courseId }))
    setState({ open: true, source })
  }, [])

  const closeRegister = useCallback(() => {
    setState((current) => (current.open ? { ...current, open: false } : current))
  }, [])

  const resetDraft = useCallback(() => setDraft(EMPTY_DRAFT), [])

  const value = useMemo(
    () => ({ ...state, draft, setDraft, openRegister, closeRegister, resetDraft }),
    [state, draft, openRegister, closeRegister, resetDraft],
  )

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>
}
