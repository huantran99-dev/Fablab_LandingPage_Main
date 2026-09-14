import { Icon } from '../ui/Icon'

export function PageHeader({ title, description, breadcrumb = [], actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <nav aria-label="Vị trí">
          <ol className="mb-1 flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
            <li>
              <a href="#/" className="hover:text-brand-500">
                Tổng quan
              </a>
            </li>
            {breadcrumb.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                <Icon name="chevron-right" size={12} />
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-brand-500">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-700 dark:text-gray-300">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl dark:text-white/90">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
