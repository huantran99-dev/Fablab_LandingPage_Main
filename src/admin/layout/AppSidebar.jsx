import { LogoMark } from '../../assets/icons/Logo'
import { SECTIONS } from '../sections/descriptors'
import { Icon } from '../ui/Icon'

const SYSTEM_LINKS = [
  { name: 'media', href: '#/media', label: 'Thư viện ảnh', icon: 'image' },
  { name: 'account', href: '#/account', label: 'Tài khoản', icon: 'key' },
]

function NavItem({ href, label, icon, active, collapsed, onNavigate }) {
  return (
    <li>
      <a
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? label : undefined}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium transition-colors ${
          collapsed ? 'lg:justify-center lg:px-0' : ''
        } ${
          active
            ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5'
        }`}
      >
        <Icon
          name={icon}
          size={22}
          className={
            active
              ? 'text-brand-500 dark:text-brand-400'
              : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
          }
        />
        <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
      </a>
    </li>
  )
}

function GroupTitle({ collapsed, children }) {
  return (
    <h2 className={`mt-6 mb-3 text-theme-xs leading-5 tracking-wider text-gray-400 uppercase ${collapsed ? 'lg:text-center' : ''}`}>
      <span className={collapsed ? 'lg:hidden' : ''}>{children}</span>
      {collapsed && (
        <span className="hidden lg:inline" aria-hidden="true">
          •••
        </span>
      )}
    </h2>
  )
}

/**
 * Sidebar kiểu TailAdmin: 290px, thu gọn còn 90px chỉ icon trên màn hình lớn, trượt
 * vào kèm lớp phủ trên điện thoại. Thứ tự section trong menu = thứ tự trên trang.
 */
export function AppSidebar({ route, collapsed, mobileOpen, onNavigate }) {
  const isActive = (name, param) => route.name === name && (param === undefined || route.param === param)

  return (
    <aside
      aria-label="Điều hướng quản trị"
      className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-gray-200 bg-white px-5 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${collapsed ? 'lg:w-[90px]' : 'lg:w-[290px]'}`}
    >
      <div className={`flex h-16 shrink-0 items-center lg:h-[72px] ${collapsed ? 'lg:justify-center' : ''}`}>
        <a href="#/" onClick={onNavigate} className="flex items-center gap-3">
          <LogoMark size={36} />
          <span className={`leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="block text-base font-semibold text-gray-800 dark:text-white/90">FabLab EIU</span>
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">Quản trị nội dung</span>
          </span>
        </a>
      </div>

      <nav className="scrollbar-thin -mx-5 flex-1 overflow-y-auto px-5 pb-6">
        <ul className="space-y-1">
          <NavItem href="#/" label="Tổng quan" icon="grid" active={isActive('dashboard')} collapsed={collapsed} onNavigate={onNavigate} />
        </ul>

        <GroupTitle collapsed={collapsed}>Nội dung trang</GroupTitle>
        <ul className="space-y-1">
          {SECTIONS.map((section) => (
            <NavItem
              key={section.key}
              href={`#/sections/${section.key}`}
              label={section.label}
              icon={section.icon}
              active={isActive('sections', section.key)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>

        <GroupTitle collapsed={collapsed}>Hệ thống</GroupTitle>
        <ul className="space-y-1">
          {SYSTEM_LINKS.map((link) => (
            <NavItem key={link.name} {...link} active={isActive(link.name)} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      <div className={`mb-5 shrink-0 rounded-2xl bg-gray-50 p-4 text-center dark:bg-white/[0.03] ${collapsed ? 'lg:hidden' : ''}`}>
        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">Trang công khai</p>
        <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Mở tab mới để xem thay đổi đã lưu.</p>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Xem trang
          <Icon name="external" size={16} />
        </a>
      </div>
    </aside>
  )
}
