import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDownIcon, CloseIcon, MenuIcon } from '../assets/icons/Icons'
import { Logo } from '../assets/icons/Logo'
import { useActiveSection } from '../hooks/useActiveSection'
import { LANGUAGES, useLanguage } from '../i18n/context'
import { Button } from './ui/Button'

/**
 * Class dùng chung cho mọi mục cấp một, dù là link hay nút mở nhánh — viết một
 * chỗ để hai loại mục không lệch nhau khi ai đó chỉnh một cái mà quên cái kia.
 */
const NAV_ITEM =
  'inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-body-sm font-medium cursor-pointer transition-colors duration-200 ease-[var(--ease-out-soft)]'
const NAV_ITEM_ON = 'bg-signal text-white'
const NAV_ITEM_OFF = 'text-graphite hover:bg-wash hover:text-signal'

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

/**
 * Một nhánh có submenu trên thanh desktop.
 *
 * Theo mẫu "Disclosure Navigation" của WAI-ARIA: nút bật/tắt một panel, còn Tab
 * đi xuyên qua như bình thường — không cần bắt phím mũi tên hay roving tabindex.
 *
 * Nhánh không phải là link vì nó không ứng với section nào của riêng nó; dùng
 * `<button>` để bàn phím và screen reader hiểu đúng đây là chỗ mở/đóng.
 */
function NavBranch({ link, open, activeSection, onToggle, onClose }) {
  const buttonRef = useRef(null)
  const panelId = `nav-submenu-${link.id}`

  // Nhánh sáng khi bất kỳ mục con nào đang được xem.
  const isActive = link.children.some((child) => child.href.slice(1) === activeSection)

  return (
    <li
      className="relative"
      // Chỉ mở theo con trỏ CHUỘT. Màn cảm ứng cũng bắn pointerenter trước cú
      // chạm, nên không lọc thì một cú chạm sẽ mở rồi đóng ngay: pointerenter
      // mở, click lật lại thành đóng. Thanh desktop hiện từ 1024px trở lên nên
      // laptop cảm ứng và tablet nằm ngang đều rơi vào trường hợp này.
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onToggle(link.id, true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') onClose()
      }}
      onBlur={(event) => {
        // Focus rời hẳn khỏi cụm (nút + panel) thì đóng; đi từ nút xuống panel
        // thì `relatedTarget` vẫn nằm trong nên không đóng nhầm.
        if (!event.currentTarget.contains(event.relatedTarget)) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          onClose()
          buttonRef.current?.focus()
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(link.id)}
        className={[NAV_ITEM, isActive ? NAV_ITEM_ON : NAV_ITEM_OFF].join(' ')}
      >
        {/* Không đặt `aria-label` ở đây: nó sẽ ghi đè chữ nhìn thấy được, làm
            người dùng điều khiển bằng giọng nói không gọi được "FabLab" nữa.
            Chữ trong nút cộng với `aria-expanded` đã đủ mô tả — đúng như mẫu
            Disclosure Navigation của WAI-ARIA. Chevron đã `aria-hidden` sẵn. */}
        {link.label}
        {/* `transition-transform` nở ra đủ bốn thuộc tính biến hình của Tailwind
            v4; giá trị tuỳ ý sẽ bỏ sót và làm giật. */}
        <ChevronDownIcon
          className={`transition-transform duration-200 ease-[var(--ease-out-soft)] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        // Đệm bằng khoảng độn TRÊN panel chứ không bằng lề: chuột đi từ nút
        // xuống panel không băng qua khe chết nào nên menu không đóng giữa chừng.
        <div className="absolute left-0 top-full pt-2">
          <ul
            id={panelId}
            className="min-w-[232px] rounded-image-sm border border-ash/60 bg-white p-2 shadow-ambient"
          >
            {link.children.map((child) => {
              const childActive = activeSection === child.href.slice(1)
              return (
                <li key={child.id}>
                  <a
                    href={child.href}
                    onClick={() => onClose()}
                    aria-current={childActive ? 'true' : undefined}
                    className={[
                      'block rounded-pill px-4 py-2.5 text-body-sm font-medium whitespace-nowrap',
                      'transition-colors duration-200 ease-[var(--ease-out-soft)]',
                      childActive ? NAV_ITEM_ON : NAV_ITEM_OFF,
                    ].join(' ')}
                  >
                    {child.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </li>
  )
}

/** Nhánh trong drawer mobile: mở tại chỗ dạng accordion, không phải panel nổi. */
function DrawerBranch({ link, open, onToggle, onNavigate }) {
  const panelId = `drawer-submenu-${link.id}`

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(link.id)}
        className="flex items-center justify-between rounded-pill px-5 py-3.5 text-heading-sm font-display font-bold text-ink cursor-pointer hover:bg-wash transition-colors"
      >
        {link.label}
        <ChevronDownIcon
          size={20}
          className={`transition-transform duration-200 ease-[var(--ease-out-soft)] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div id={panelId} className="flex flex-col gap-1 pl-4">
          {link.children.map((child) => (
            <a
              key={child.id}
              href={child.href}
              onClick={onNavigate}
              className="rounded-pill px-5 py-3 text-subheading font-medium text-graphite hover:bg-wash hover:text-signal transition-colors"
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Một state duy nhất cho cả thanh desktop lẫn drawer — hai thứ không bao giờ
  // cùng hiện, và giữ một chỗ thì mở nhánh này tự đóng nhánh kia.
  const [openBranch, setOpenBranch] = useState(null)
  const navRef = useRef(null)

  // Suy ra thẳng từ `nav.links` thay vì chép tay danh sách id: bỏ một section mà
  // quên sửa ở đây thì observer đi theo dõi một id không còn tồn tại. Menu hai
  // cấp nên phải làm phẳng qua `children` — nhánh không có `href` của riêng nó.
  //
  // `href` là định danh không dịch nên mảng này giống hệt nhau ở mọi ngôn ngữ —
  // `useMemo` giữ tham chiếu ổn định để đổi ngôn ngữ không dựng lại observer.
  const hrefs = t.nav.links
    .flatMap((link) => link.children?.map((child) => child.href) ?? [link.href])
    .join(',')
  const sectionIds = useMemo(() => hrefs.split(',').map((href) => href.slice(1)), [hrefs])
  const activeSection = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bấm ra ngoài thanh điều hướng thì đóng nhánh đang mở.
  //
  // Bỏ qua hoàn toàn khi drawer đang mở: drawer nằm NGOÀI `navRef`, nên mọi cú
  // bấm trong drawer đều bị tính là "bấm ra ngoài" và accordion sẽ sập ngay lúc
  // vừa mở. Hai thứ không bao giờ cùng hiện nên tắt hẳn ở đây là đúng.
  useEffect(() => {
    if (!openBranch || menuOpen) return

    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenBranch(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openBranch, menuOpen])

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

  const closeDrawer = () => {
    setMenuOpen(false)
    setOpenBranch(null)
  }

  // `force` để hover chỉ mở chứ không lật: rê qua một nhánh đang mở thì nó phải
  // ở nguyên, còn bấm vào thì mới đóng lại được.
  const toggleBranch = (id, force = false) =>
    setOpenBranch((current) => (force ? id : current === id ? null : id))

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300 ease-[var(--ease-out-soft)]',
        scrolled ? 'bg-white/85 backdrop-blur-lg border-b border-ash/50' : 'bg-transparent',
      ].join(' ')}
    >
      <nav ref={navRef} className="container-page flex items-center justify-between gap-6 py-4">
        <a href="#top" className="shrink-0" aria-label="FabLab EIU">
          <Logo tagline={t.nav.brandTagline} />
        </a>

        {/* Link điều hướng — chỉ hiện từ breakpoint lg trở lên */}
        <ul className="hidden lg:flex items-center gap-1">
          {t.nav.links.map((link) =>
            link.children ? (
              <NavBranch
                key={link.id}
                link={link}
                open={openBranch === link.id}
                activeSection={activeSection}
                onToggle={toggleBranch}
                onClose={() => setOpenBranch(null)}
              />
            ) : (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={activeSection === link.href.slice(1) ? 'true' : undefined}
                  className={[
                    NAV_ITEM,
                    activeSection === link.href.slice(1) ? NAV_ITEM_ON : NAV_ITEM_OFF,
                  ].join(' ')}
                >
                  {link.label}
                </a>
              </li>
            ),
          )}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden animate-rise">
          <div className="container-page flex items-center justify-between py-4">
            <Logo tagline={t.nav.brandTagline} />
            <button
              type="button"
              onClick={closeDrawer}
              aria-label={t.nav.closeMenu}
              className="inline-flex items-center justify-center size-11 rounded-pill border border-ash text-ink cursor-pointer hover:border-ink transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="container-page flex flex-col gap-2 pt-6 pb-10">
            {t.nav.links.map((link) =>
              link.children ? (
                <DrawerBranch
                  key={link.id}
                  link={link}
                  open={openBranch === link.id}
                  onToggle={toggleBranch}
                  onNavigate={closeDrawer}
                />
              ) : (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={closeDrawer}
                  className="rounded-pill px-5 py-3.5 text-heading-sm font-display font-bold text-ink hover:bg-wash transition-colors"
                >
                  {link.label}
                </a>
              ),
            )}
            <Button href="#register" size="lg" className="mt-6 w-full" onClick={closeDrawer}>
              {t.nav.cta}
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
