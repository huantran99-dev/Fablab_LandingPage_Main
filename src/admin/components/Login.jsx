import { useState } from 'react'

import { ApiError, api, setCsrfToken } from '../lib/api'

/**
 * Trang đăng nhập.
 *
 * Máy chủ cố ý không phân biệt "sai tài khoản" với "sai mật khẩu", nên ở đây cũng
 * chỉ hiện đúng thông báo máy chủ trả về — đừng đoán thêm cho "thân thiện".
 */
export function Login({ onSignedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
      setError(
        locked
          ? `Sai quá nhiều lần. Thử lại sau ${locked} giây.`
          : (caught.message ?? 'Không đăng nhập được'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Quản trị nội dung</h1>
      <p className="mt-1 text-sm text-steel">FabLab EIU</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tên đăng nhập</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="rounded border border-ash bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="rounded border border-ash bg-white px-3 py-2 text-sm"
          />
        </label>

        {error && (
          <p role="alert" className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded bg-signal px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? 'Đang kiểm tra…' : 'Đăng nhập'}
        </button>
      </form>
    </main>
  )
}
