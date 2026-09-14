/** Khung nội dung kiểu "ComponentCard" của TailAdmin: viền mảnh, bo 2xl, tiêu đề tách bằng đường kẻ. */
export function Card({ title, description, actions, children, className = '', bodyClassName = '', id }) {
  const hasHeader = Boolean(title || actions)
  return (
    <section
      id={id}
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div
        className={`${hasHeader ? 'border-t border-gray-100 dark:border-gray-800' : ''} p-5 sm:p-6 ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  )
}
