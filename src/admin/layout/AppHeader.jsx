import { useEffect, useRef, useState } from 'react'

import { SECTIONS } from '../sections/descriptors'
import { Icon } from '../ui/Icon'

const SEARCH_ENTRIES = [
  { label: 'Tổng quan', href: '#/', icon: 'grid' },
  ...SECTIONS.map((section) => ({ label: section.label, hint: section.description, href: `#/sections/${section.key}`, icon: section.icon })),
  { label: 'Thư viện ảnh', href: '#/media', icon: 'image' },
  { label: 'Tài khoản', hint: 'Đổi mật khẩu', href: '#/account', icon: 'key' },
]

/** So khớp không dấu: gõ "khoa hoc" vẫn ra "Khóa học". */
const fold = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

function QuickSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  const needle = fold(query.trim())
  const results = SEARCH_ENTRIES.filter((entry) => !needle || fold(entry.label).includes(needle) || fold(entry.hint).includes(needle)).slice(0, 8)

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (entry) => {
    window.location.hash = entry.href
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative hidden w-full max-w-[430px] md:block">
      <Icon name="search" size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((index) => Math.min(index + 1, results.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter' && results[active]) {
            event.preventDefault()
            go(results[active])
          } else if (event.key === 'Escape') {
            setOpen(false)
            event.currentTarget.blur()
          }
        }}
        placeholder="Tìm section hoặc trang…"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="admin-quick-search"
        aria-autocomplete="list"
        aria-label="Tìm nhanh"
        className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pr-16 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Ctrl K
      </kbd>

      {open && results.length > 0 && (
        <ul
          id="admin-quick-search"
          role="listbox"
          className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
        >
          {results.map((entry, index) => (
            <li key={entry.href} role="option" aria-selected={index === active}>
              <button
                type="button"
                // `mousedown` chặn mất focus trước khi `click` kịp chạy — không có dòng này
                // thì `onBlur` đóng danh sách và cú nhấp rơi vào khoảng trống.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(entry)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${index === active ? 'bg-gray-100 dark:bg-white/5' : ''}`}
              >
                <Icon name={entry.icon} size={18} className="text-gray-500 dark:text-gray-400" />
                <span className="min-w-0">
                  <span className="block text-gray-800 dark:text-white/90">{entry.label}</span>
                  {entry.hint && <span className="block truncate text-theme-xs text-gray-500">{entry.hint}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function UserMenu({ username, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const itemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 text-gray-700 dark:text-gray-400"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-500 text-base font-semibold text-white">
          {(username ?? '?').slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden text-theme-sm font-medium sm:block">{username}</span>
        <Icon name="chevron-down" size={18} className={`hidden transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-4 w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
          <div className="px-3 pb-3">
            <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300">{username}</span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">Quản trị viên</span>
          </div>
          <ul className="flex flex-col gap-1 border-y border-gray-200 py-3 dark:border-gray-800">
            <li>
              <a role="menuitem" href="#/account" onClick={() => setOpen(false)} className={itemClass}>
                <Icon name="key" size={20} className="text-gray-500" />
                Tài khoản & mật khẩu
              </a>
            </li>
            <li>
              <a role="menuitem" href="#/media" onClick={() => setOpen(false)} className={itemClass}>
                <Icon name="image" size={20} className="text-gray-500" />
                Thư viện ảnh
              </a>
            </li>
            <li>
              <a role="menuitem" href="/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className={itemClass}>
                <Icon name="external" size={20} className="text-gray-500" />
                Xem trang công khai
              </a>
            </li>
          </ul>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className={`${itemClass} mt-3`}
          >
            <Icon name="logout" size={20} className="text-gray-500" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

export function AppHeader({ onToggleSidebar, theme, onToggleTheme, username, onLogout }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:h-[72px] lg:gap-4 lg:px-6 dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Bật/tắt thanh bên"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 lg:size-11 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
      >
        <Icon name="sidebar" size={20} className="hidden lg:block" />
        <Icon name="menu" size={20} className="lg:hidden" />
      </button>

      <QuickSearch />

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
          title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
          className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
        </button>
        <UserMenu username={username} onLogout={onLogout} />
      </div>
    </header>
  )
}
