import { createContext, useContext } from 'react'

/**
 * Trạng thái form đăng ký, dùng chung cho mọi nút mở form (popup khóa học, navbar,
 * khối kêu gọi cuối trang). Tách khỏi file component để Fast Refresh không than.
 */
export const RegisterContext = createContext(null)

export function useRegister() {
  const context = useContext(RegisterContext)
  if (!context) throw new Error('useRegister phải nằm trong <RegisterProvider>')
  return context
}
