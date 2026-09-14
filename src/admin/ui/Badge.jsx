const COLORS = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-500/15 dark:text-info-500',
  gray: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
}

export function Badge({ color = 'gray', children, className = '', title }) {
  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${COLORS[color]} ${className}`}
    >
      {children}
    </span>
  )
}
