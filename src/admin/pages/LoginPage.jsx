import { useState } from 'react'

import { LogoMark } from '../../assets/icons/Logo'
import { ApiError, api, setCsrfToken } from '../lib/api'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Input, Label } from '../ui/Field'
import { Icon } from '../ui/Icon'

/**
 * Đăng nhập, bố cục hai nửa kiểu TailAdmin.
 *
 * Máy chủ cố ý không phân biệt "sai tài khoản" với "sai mật khẩu", nên ở đây cũng
 * chỉ hiện đúng thông báo chung — đừng đoán thêm cho "thân thiện".
 */
export function LoginPage({ onSignedIn, theme, onToggleTheme }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = await api.login(username, password)
      setCsrfToken(result.csrfToken)
      onSignedIn(result)
    } catch (caught) {
      const locked = caught instanceof ApiError ? caught.body.lockedSeconds : null
      if (locked) setError(`Sai quá nhiều lần. Thử lại sau ${locked} giây.`)
      else if (caught instanceof ApiError && caught.status === 429) setError('Thử quá nhiều lần từ máy này. Đợi vài phút rồi thử lại.')
      else if (caught instanceof ApiError && caught.status === 401) setError('Tên đăng nhập hoặc mật khẩu không đúng.')
      else setError('Không kết nối được máy chủ. Kiểm tra `npm run server` đang chạy.')
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh bg-white dark:bg-gray-900">
      <div className="flex w-full flex-1 flex-col justify-center px-6 py-10 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <LogoMark size={40} />
            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">FabLab EIU</span>
          </div>

          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">Đăng nhập</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Dùng tài khoản quản trị để sửa nội dung trang.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="login-username">
                Tên đăng nhập <span className="text-error-500">*</span>
              </Label>
              <Input
                id="login-username"
                autoComplete="username"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus -- trang chỉ có đúng một việc
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="login-password">
                Mật khẩu <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  <Icon name="eye" size={20} />
                </button>
              </div>
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            <Button type="submit" size="md" className="w-full" disabled={busy}>
              {busy ? 'Đang kiểm tra…' : 'Đăng nhập'}
            </Button>
          </form>

          <p className="mt-8 text-theme-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Chưa có tài khoản? Tạo trên máy chủ bằng <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-white/5">npm run admin:create</code>. Không có
            trang đăng ký trên web — cố ý.
          </p>
        </div>
      </div>

      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-brand-950 lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex max-w-sm flex-col items-center px-6 text-center">
          <div className="rounded-3xl bg-white p-4">
            <LogoMark size={72} />
          </div>
          <p className="mt-6 text-2xl font-semibold text-white">FabLab EIU</p>
          <p className="mt-2 text-gray-400">Quản trị nội dung trang giới thiệu</p>
          <p className="mt-6 text-sm text-brand-300">Tự Hào Phục vụ cộng đồng</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
        className="fixed right-6 bottom-6 z-50 flex size-12 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
      </button>
    </div>
  )
}
