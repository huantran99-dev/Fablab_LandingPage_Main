import { useCallback, useEffect, useRef, useState } from 'react'

import { useHashRoute } from './hooks/useHashRoute'
import { useTheme } from './hooks/useTheme'
import { AppLayout } from './layout/AppLayout'
import { PageHeader } from './layout/PageHeader'
import { api, onUnauthorized, setCsrfToken } from './lib/api'
import { AccountPage } from './pages/AccountPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MediaPage } from './pages/MediaPage'
import { SectionPage } from './pages/SectionPage'
import { SECTION_BY_KEY } from './sections/descriptors'
import { LinkButton } from './ui/Button'
import { Card } from './ui/Card'
import { useToast } from './ui/toastContext'

/**
 * Vỏ dashboard: phiên đăng nhập, định tuyến hash, và chốt "còn thay đổi chưa lưu".
 *
 * Cờ chưa lưu nằm trong REF chứ không phải state: nó chỉ được hỏi lúc sắp rời trang
 * (đổi hash, đóng tab), không bao giờ cần vẽ lại cả vỏ chỉ vì người dùng gõ một chữ.
 */
export default function App() {
  const toast = useToast()
  const [theme, toggleTheme] = useTheme()
  const [session, setSession] = useState({ status: 'checking', username: null })
  const [meta, setMeta] = useState(null)
  const [metaVersion, setMetaVersion] = useState(0)

  const dirtyRef = useRef(false)
  const [route] = useHashRoute(() => dirtyRef.current)

  useEffect(() => {
    let cancelled = false
    api
      .session()
      .then((result) => {
        if (cancelled) return
        setCsrfToken(result.csrfToken)
        setSession({ status: result.authenticated ? 'in' : 'out', username: result.username ?? null })
      })
      .catch(() => {
        if (!cancelled) setSession({ status: 'out', username: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    onUnauthorized(() => {
      dirtyRef.current = false
      setSession({ status: 'out', username: null })
      toast({ tone: 'warning', title: 'Phiên đăng nhập đã hết', message: 'Đăng nhập lại để tiếp tục. Thay đổi chưa lưu không được giữ.' })
    })
    return () => onUnauthorized(null)
  }, [toast])

  useEffect(() => {
    if (session.status !== 'in') return undefined
    let cancelled = false
    api
      .meta()
      .then((result) => {
        if (!cancelled) setMeta(result)
      })
      .catch(() => {
        // Tổng quan tự hiện "đang tải"; lỗi phiên đã có onUnauthorized lo.
      })
    return () => {
      cancelled = true
    }
  }, [session.status, metaVersion])

  useEffect(() => {
    const warn = (event) => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const setDirty = useCallback((value) => {
    dirtyRef.current = value
  }, [])
  const refreshMeta = useCallback(() => setMetaVersion((version) => version + 1), [])

  const signOut = useCallback(() => {
    dirtyRef.current = false
    setMeta(null)
    setSession({ status: 'out', username: null })
  }, [])

  const logout = () => {
    if (dirtyRef.current && !window.confirm('Có thay đổi chưa lưu. Vẫn đăng xuất?')) return
    api
      .logout()
      .catch(() => {})
      .finally(signOut)
  }

  if (session.status === 'checking') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-gray-500">Đang kiểm tra phiên đăng nhập…</p>
      </div>
    )
  }

  if (session.status === 'out') {
    return (
      <LoginPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignedIn={(result) => {
          window.location.hash = window.location.hash || '#/'
          setSession({ status: 'in', username: result.username })
        }}
      />
    )
  }

  let page
  if (route.name === 'dashboard') {
    page = <DashboardPage meta={meta} username={session.username} />
  } else if (route.name === 'sections' && SECTION_BY_KEY[route.param]) {
    page = (
      <SectionPage
        key={route.param}
        descriptor={SECTION_BY_KEY[route.param]}
        meta={meta}
        onDirtyChange={setDirty}
        onSaved={refreshMeta}
      />
    )
  } else if (route.name === 'media') {
    page = <MediaPage onChanged={refreshMeta} />
  } else if (route.name === 'account') {
    page = <AccountPage username={session.username} onPasswordChanged={signOut} />
  } else {
    page = (
      <>
        <PageHeader title="Không tìm thấy trang" />
        <Card>
          <p className="text-sm text-gray-500">Đường dẫn này không ứng với màn hình nào của dashboard.</p>
          <LinkButton href="#/" className="mt-4" icon="grid">
            Về Tổng quan
          </LinkButton>
        </Card>
      </>
    )
  }

  return (
    <AppLayout route={route} username={session.username} theme={theme} onToggleTheme={toggleTheme} onLogout={logout}>
      {page}
    </AppLayout>
  )
}
