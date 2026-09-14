import { Icon } from './Icon'

/** Ô nhập kiểu TailAdmin: cao 44px, viền xám, vòng sáng thương hiệu khi focus. */
export const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:bg-gray-800'

const invalidClass = 'border-error-500! focus:border-error-300! focus:ring-error-500/10! dark:border-error-500!'

export function Label({ htmlFor, children, hint, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 flex items-baseline gap-2 text-sm font-medium text-gray-700 dark:text-gray-400 ${className}`}>
      <span>{children}</span>
      {hint && <span className="text-theme-xs font-normal text-gray-400">{hint}</span>}
    </label>
  )
}

export function Input({ invalid = false, className = '', ...props }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`h-11 ${inputClass} ${invalid ? invalidClass : ''} ${className}`}
      {...props}
    />
  )
}

export function TextArea({ invalid = false, rows = 3, className = '', ...props }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={`py-2.5 leading-relaxed ${inputClass} ${invalid ? invalidClass : ''} ${className}`}
      {...props}
    />
  )
}

export function Select({ invalid = false, options, placeholder, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-invalid={invalid || undefined}
        className={`h-11 appearance-none pr-10 ${inputClass} ${invalid ? invalidClass : ''} dark:bg-gray-900`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        size={16}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-500"
      />
    </div>
  )
}

export function Switch({ checked, onChange, label, description, disabled = false, id }) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          checked ? 'bg-brand-500' : 'bg-gray-200 dark:bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-theme-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {(label || description) && (
        <label htmlFor={id} className="text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {description && <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">{description}</span>}
        </label>
      )}
    </div>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-1.5 flex items-start gap-1 text-theme-xs text-error-600 dark:text-error-500">
      <Icon name="alert" size={14} className="mt-0.5" />
      <span>{children}</span>
    </p>
  )
}

export function FieldHelp({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">{children}</p>
}

export function LocaleTag({ locale }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold tracking-wide uppercase ${
        locale === 'vi'
          ? 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
          : 'bg-info-50 text-info-700 dark:bg-info-500/15 dark:text-info-500'
      }`}
    >
      {locale}
    </span>
  )
}
