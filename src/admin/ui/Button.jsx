import { Icon } from './Icon'

/**
 * Nút của dashboard. Không có bóng — giữ đúng quy ước của repo dù dashboard không
 * dùng hệ Loom: shadow thuộc về card và khung nổi, không thuộc về nút.
 */
const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300 dark:disabled:bg-brand-800',
  outline:
    'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03]',
  danger: 'bg-error-500 text-white hover:bg-error-600 disabled:bg-error-300',
  soft: 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90',
  'ghost-danger': 'text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/15',
}

const SIZES = {
  xs: 'h-8 gap-1.5 rounded-lg px-2.5 text-theme-xs',
  sm: 'h-10 gap-2 rounded-lg px-4 text-sm',
  md: 'h-11 gap-2 rounded-lg px-5 text-sm',
}

const ICON_SIZES = { xs: 14, sm: 18, md: 18 }

const BASE =
  'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-70'

export function Button({ variant = 'primary', size = 'sm', icon, iconRight, children, className = '', type = 'button', ...props }) {
  return (
    <button type={type === 'submit' ? 'submit' : 'button'} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props}>
      {icon && <Icon name={icon} size={ICON_SIZES[size]} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ICON_SIZES[size]} />}
    </button>
  )
}

/** Link trông như nút — dùng khi đích là một trang, không phải một hành động. */
export function LinkButton({ href, variant = 'outline', size = 'sm', icon, iconRight, children, className = '', ...props }) {
  return (
    <a href={href} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props}>
      {icon && <Icon name={icon} size={ICON_SIZES[size]} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ICON_SIZES[size]} />}
    </a>
  )
}

const SQUARE = { xs: 'size-8 rounded-lg', sm: 'size-10 rounded-lg', md: 'size-11 rounded-lg' }

/** Nút chỉ có icon. `label` là bắt buộc — thành `aria-label` và tooltip. */
export function IconButton({ icon, label, variant = 'ghost', size = 'sm', className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SQUARE[size]} ${className}`}
      {...props}
    >
      <Icon name={icon} size={size === 'xs' ? 16 : 20} />
    </button>
  )
}
