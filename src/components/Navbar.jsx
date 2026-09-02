import { useEffect, useMemo, useState } from 'react'
import { CloseIcon, MenuIcon } from '../assets/icons/Icons'
import { Logo } from '../assets/icons/Logo'
import { useActiveSection } from '../hooks/useActiveSection'
import { LANGUAGES, useLanguage } from '../i18n/context'
import { Button } from './ui/Button'

function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      className={`inline-flex items-center rounded-pill bg-wash p-1 ${className}`}
      role="group"
      aria-label={t.nav.switchLanguage}
    >
      {LANGUAGES.map((item) => {
        const isActive = item.code === lang
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            aria-pressed={isActive}
            title={item.name}
            className={[
              'rounded-pill px-3 py-1 text-caption font-medium cursor-pointer',
              'transition-colors duration-200 ease-[var(--ease-out-soft)]',
              isActive ? 'bg-signal text-white' : 'text-graphite hover:text-ink',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function Navbar() {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Suy ra thẳng từ `nav.links` thay vì chép tay danh sách id: bỏ một section mà
  // quên sửa ở đây thì observer đi theo dõi một id không còn tồn tại.
  //
  // `href` là định danh không dịch nên mảng này giống hệt nhau ở mọi ngôn ngữ —
  // `useMemo` giữ tham chiếu ổn định để đổi ngôn ngữ không dựng lại observer.
  const hrefs = t.nav.links.map((link) => link.href).join(',')
  const sectionIds = useMemo(() => hrefs.split(',').map((href) => href.slice(1)), [hrefs])
  const activeSection = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Khóa cuộn nền và cho phép đóng drawer bằng phím Esc.
  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300 ease-[var(--ease-out-soft)]',
        scrolled ? 'bg-white/85 backdrop-blur-lg border-b border-ash/50' : 'bg-transparent',
      ].join(' ')}
    >
      <nav className="container-page flex items-center justify-between gap-6 py-4">
        <a href="#top" className="shrink-0" aria-label="FabLab EIU">
          <Logo tagline={t.nav.brandTagline} />
        </a>

        {/* Link điều hướng — chỉ hiện từ breakpoint lg trở lên */}
        <ul className="hidden lg:flex items-center gap-1">
          {t.nav.links.map((link) => {
            const isActive = activeSection === link.id
            return (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={[
                    'inline-block rounded-pill px-4 py-2 text-body-sm font-medium',
                    'transition-colors duration-200 ease-[var(--ease-out-soft)]',
                    isActive
                      ? 'bg-signal text-white'
                      : 'text-graphite hover:bg-wash hover:text-signal',
                  ].join(' ')}
                >
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Button href="#register" className="hidden sm:inline-flex">
            {t.nav.cta}
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={menuOpen}
            className="lg:hidden inline-flex items-center justify-center size-11 rounded-pill border border-ash text-ink cursor-pointer hover:border-ink transition-colors"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden animate-rise">
          <div className="container-page flex items-center justify-between py-4">
            <Logo tagline={t.nav.brandTagline} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t.nav.closeMenu}
              className="inline-flex items-center justify-center size-11 rounded-pill border border-ash text-ink cursor-pointer hover:border-ink transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="container-page flex flex-col gap-2 pt-6">
            {t.nav.links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-pill px-5 py-3.5 text-heading-sm font-display font-bold text-ink hover:bg-wash transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button href="#register" size="lg" className="mt-6 w-full" onClick={() => setMenuOpen(false)}>
              {t.nav.cta}
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
