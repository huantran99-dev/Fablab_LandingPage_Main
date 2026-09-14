import { Icon } from './Icon'

const TONES = {
  error: { box: 'border-error-500/40 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10', icon: 'alert', color: 'text-error-600 dark:text-error-500' },
  warning: { box: 'border-warning-500/40 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10', icon: 'alert', color: 'text-warning-600 dark:text-warning-500' },
  success: { box: 'border-success-500/40 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10', icon: 'check', color: 'text-success-600 dark:text-success-500' },
  info: { box: 'border-info-500/40 bg-info-50 dark:border-info-500/30 dark:bg-info-500/10', icon: 'info', color: 'text-info-500' },
}

export function Alert({ tone = 'info', title, children, action }) {
  const style = TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={`flex gap-3 rounded-xl border p-4 ${style.box}`}>
      <Icon name={style.icon} size={22} className={style.color} />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold text-gray-800 dark:text-white/90">{title}</p>}
        {children && <div className={`${title ? 'mt-1' : ''} text-gray-600 dark:text-gray-300`}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}
