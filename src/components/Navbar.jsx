import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDownIcon, CloseIcon, MenuIcon } from '../assets/icons/Icons'
import { Logo } from '../assets/icons/Logo'
import { useActiveSection } from '../hooks/useActiveSection'
import { useLiveHref } from '../hooks/useLiveHref'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useScrollLock } from '../hooks/useScrollLock'
import { LANGUAGES, useLanguage } from '../i18n/context'
import { liveNavLinks } from '../lib/pageSections'
import { buttonsOf } from '../lib/actions'
import { ActionButton } from './ui/ActionButton'

/**
 * Class dùng chung cho mọi mục cấp một, dù là link hay nút mở nhánh — viết một
 * chỗ để hai loại mục không lệch nhau khi ai đó chỉnh một cái mà quên cái kia.
 */
const NAV_ITEM =
  'inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-body-sm font-medium cursor-pointer transition-colors duration-200 ease-[var(--ease-out-soft)]'
const NAV_ITEM_ON = 'bg-signal text-on-signal'
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
              isActive ? 'bg-signal text-on-signal' : 'text-graphite hover:text-ink',
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
  // Nút do admin tạo (dashboard → Menu điều hướng → Nút), tối đa 2.
  const navButtons = buttonsOf(t.nav, 'nav')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Một state duy nhất cho cả thanh desktop lẫn drawer — hai thứ không bao giờ
  // cùng hiện, và giữ một chỗ thì mở nhánh này tự đóng nhánh kia.
  const [openBranch, setOpenBranch] = useState(null)
  const navRef = useRef(null)
  const drawerRef = useRef(null)

  // Drawer chỉ tồn tại dưới `lg`. Nới cửa sổ qua `lg` lúc đang mở thì drawer phải đóng:
  // nó là dialog MODAL, để mở mà bị ẩn thì cả trang phía sau thành `inert`, không bấm
  // được gì. Suy lúc render chứ không setState trong effect (luật lint); `close` của
  // dialog sau đó gọi `closeDrawer` nên `menuOpen` cũng về false.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const drawerOpen = menuOpen && !isDesktop

  // Mục trỏ vào khối admin đã tắt thì bỏ khỏi menu; nhánh không còn mục con nào thì bỏ
  // hẳn (thanh desktop lẫn drawer). `useMemo` theo chuỗi href giữ tham chiếu ổn định.
  const isLive = useLiveHref()
  const links = useMemo(() => liveNavLinks(t.nav.links, isLive), [t.nav.links, isLive])

  // Suy ra thẳng từ `nav.links` thay vì chép tay danh sách id: bỏ một section mà
  // quên sửa ở đây thì observer đi theo dõi một id không còn tồn tại. Menu hai
  // cấp nên phải làm phẳng qua `children` — nhánh không có `href` của riêng nó.
  //
  // `href` là định danh không dịch nên mảng này giống hệt nhau ở mọi ngôn ngữ —
  // `useMemo` giữ tham chiếu ổn định để đổi ngôn ngữ không dựng lại observer.
  const hrefs = links
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

  // Drawer là `<dialog>` gốc, cùng mẫu với ba popup kia: trình duyệt lo bẫy focus, phím
  // Esc (qua sự kiện `close`), trả focus về nút menu và `inert` cho nền.
  //
  // Phải là dialog ở TOP LAYER, không được là một div `fixed` trong header: khi đã cuộn,
  // header có `backdrop-blur`, mà `backdrop-filter` biến header thành khung chứa của
  // con `position: fixed` — drawer cũ mở sau khi cuộn chỉ cao bằng header (đo được 76px
  // trên màn 844px). Top layer thoát khỏi mọi khung chứa của tổ tiên.
  useEffect(() => {
    const dialog = drawerRef.current
    if (!dialog) return
    if (drawerOpen && !dialog.open) dialog.showModal()
    else if (!drawerOpen && dialog.open) dialog.close()
  }, [drawerOpen])

  // Khoá cuộn trên <html>, dùng chung bộ đếm với các popup — KHÔNG đặt trên <body>
  // (body có `overflow-x: clip`; ghi đè `overflow` là làm chết navbar sticky).
  useScrollLock(drawerOpen)

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
      {/* 320px tiếng Anh: logo (dòng phụ "Digital fabrication lab" dài hơn bản Việt) + VI/EN
          + nút menu từng vượt khung 2px → cả trang kéo ngang được. Khe 8px trên điện thoại,
          và logo được co (`min-w-0`): chật thì dòng phụ xuống hàng thay vì đẩy tràn. */}
      <nav ref={navRef} className="container-page flex items-center justify-between gap-2 py-4 sm:gap-6">
        <a href="#top" className="min-w-0" aria-label="EIU FabLab">
          <Logo tagline={t.nav.brandTagline} />
        </a>

        {/* Link điều hướng — chỉ hiện từ breakpoint lg trở lên */}
        <ul className="hidden lg:flex items-center gap-1">
          {links.map((link) =>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {/* Ẩn/hiện đặt trên phần tử BỌC, không đặt lên Button: Button có sẵn
              display inline-flex trong class gốc, và utility đó phát sinh SAU utility
              ẩn trong CSS nên luôn thắng — nút từng hiện cả trên điện thoại, đẩy
              thanh menu (và cả trang) rộng ra ~480px. */}
          <span className="hidden sm:contents">
            {navButtons.map((button) => (
              <ActionButton key={button.id} button={button} slot="nav" source="nav" size="md" />
            ))}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={drawerOpen}
            className="lg:hidden inline-flex items-center justify-center size-11 rounded-pill border border-ash text-ink cursor-pointer hover:border-ink transition-colors"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Drawer mobile — `<dialog>` luôn mount, ruột chỉ dựng khi mở (như CourseModal).
          Class ghi đè style `dialog` chung ở `@layer base` (lề auto, bề rộng tối đa 720px)
          để phủ kín màn hình. */}
      <dialog
        ref={drawerRef}
        onClose={closeDrawer}
        aria-label="EIU FabLab"
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-white animate-rise"
      >
        {drawerOpen && (
          <>
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
              {links.map((link) =>
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
              {/* Đóng drawer rồi chạy hành động trong CÙNG một lượt: Navbar đứng trước mọi
                  dialog mở ra trong cây, nên drawer `close()` (trả focus về nút menu)
                  trước khi form / popup `showModal()` — như popup khóa học → form. */}
              {navButtons.length > 0 && (
                <div className="mt-6 flex flex-col gap-3">
                  {navButtons.map((button) => (
                    <ActionButton
                      key={button.id}
                      button={button}
                      slot="nav-drawer"
                      source="nav-drawer"
                      className="w-full"
                      onBefore={closeDrawer}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </dialog>
    </header>
  )
}
