import { useEffect, useState } from 'react'

import { readStored, writeStored } from '../lib/storage'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

const COLLAPSED_KEY = 'fablab-admin.sidebar-collapsed'

export function AppLayout({ route, username, theme, onToggleTheme, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(() => readStored(COLLAPSED_KEY, false) === true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    writeStored(COLLAPSED_KEY, collapsed)
  }, [collapsed])

  // Một nút cho hai hành vi: màn hình lớn thì thu gọn sidebar, điện thoại thì trượt nó ra.
  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setCollapsed((value) => !value)
    else setMobileOpen((value) => !value)
  }

  return (
    <div className="min-h-dvh">
      <AppSidebar route={route} collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      {mobileOpen && (
        <button type="button" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[45] bg-gray-900/50 lg:hidden" />
      )}

      <div className={`flex min-h-dvh flex-col transition-[margin] duration-300 ${collapsed ? 'lg:ml-[90px]' : 'lg:ml-[290px]'}`}>
        <AppHeader onToggleSidebar={toggleSidebar} theme={theme} onToggleTheme={onToggleTheme} username={username} onLogout={onLogout} />
        <main className="mx-auto w-full max-w-(--breakpoint-2xl) flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
