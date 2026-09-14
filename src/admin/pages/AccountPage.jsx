import { useState } from 'react'

import { PageHeader } from '../layout/PageHeader'
import { api, describeError } from '../lib/api'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FieldHelp, Input, Label } from '../ui/Field'
import { useToast } from '../ui/toastContext'

/** Đổi mật khẩu. Máy chủ kết thúc MỌI phiên sau khi đổi, kể cả phiên đang dùng. */
export function AccountPage({ username, onPasswordChanged }) {
  const toast = useToast()
  const [form, setForm] = useState({ current: '', next: '', again: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setError(null)
    if (form.next.length < 12) {
      setError('Mật khẩu mới phải có ít nhất 12 ký tự.')
      return
    }
    if (form.next !== form.again) {
      setError('Hai lần nhập mật khẩu mới không khớp.')
      return
    }
    setBusy(true)
    try {
      await api.changePassword(form.current, form.next)
      toast({ tone: 'success', title: 'Đã đổi mật khẩu', message: 'Mọi phiên đăng nhập đã kết thúc. Đăng nhập lại bằng mật khẩu mới.' })
      onPasswordChanged()
    } catch (caught) {
      setError(caught.status === 401 ? 'Mật khẩu hiện tại không đúng.' : describeError(caught))
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Tài khoản" breadcrumb={[{ label: 'Hệ thống' }, { label: 'Tài khoản' }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex flex-col items-center text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-brand-500 text-3xl font-semibold text-white">
              {(username ?? '?').slice(0, 1).toUpperCase()}
            </span>
            <p className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">{username}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quản trị viên — tài khoản duy nhất</p>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Đổi mật khẩu" description="Sau khi đổi, mọi thiết bị đang đăng nhập đều bị đăng xuất.">
          <form onSubmit={submit} className="max-w-lg space-y-5">
            {/* Trường ẩn giúp trình quản lý mật khẩu biết mật khẩu mới thuộc tài khoản nào. */}
            <input type="text" name="username" autoComplete="username" value={username ?? ''} readOnly hidden />
            <div>
              <Label htmlFor="password-current">Mật khẩu hiện tại</Label>
              <Input id="password-current" type="password" autoComplete="current-password" required value={form.current} onChange={set('current')} />
            </div>
            <div>
              <Label htmlFor="password-next">Mật khẩu mới</Label>
              <Input id="password-next" type="password" autoComplete="new-password" required minLength={12} value={form.next} onChange={set('next')} />
              <FieldHelp>Ít nhất 12 ký tự. Một cụm vài từ dễ nhớ an toàn hơn một chuỗi ngắn phức tạp.</FieldHelp>
            </div>
            <div>
              <Label htmlFor="password-again">Nhập lại mật khẩu mới</Label>
              <Input id="password-again" type="password" autoComplete="new-password" required value={form.again} onChange={set('again')} />
            </div>
            {error && <Alert tone="error">{error}</Alert>}
            <Button type="submit" size="md" icon="key" disabled={busy}>
              {busy ? 'Đang đổi…' : 'Đổi mật khẩu'}
            </Button>
          </form>
          <p className="mt-6 text-theme-xs text-gray-500 dark:text-gray-400">
            Quên mật khẩu: đặt lại trên máy chủ bằng <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-white/5">npm run admin:create -- --force</code>.
          </p>
        </Card>
      </div>
    </>
  )
}
