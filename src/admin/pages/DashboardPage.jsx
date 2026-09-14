import { PageHeader } from '../layout/PageHeader'
import { formatBytes, formatDateTime } from '../lib/paths'
import { SECTIONS, SECTION_BY_KEY } from '../sections/descriptors'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { LinkButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

function summarize(descriptor, counts) {
  if (descriptor.lists.length === 0) return 'Chỉ có chữ'
  return descriptor.lists.map((list) => `${counts?.[list.path] ?? 0} ${list.itemName}`).join(' · ')
}

export function DashboardPage({ meta, username }) {
  if (!meta) {
    return (
      <>
        <PageHeader title="Tổng quan" />
        <Card>
          <p className="py-6 text-center text-sm text-gray-500">Đang tải số liệu…</p>
        </Card>
      </>
    )
  }

  const bySection = Object.fromEntries(meta.sections.map((section) => [section.key, section]))
  const count = (key, path) => bySection[key]?.counts?.[path] ?? 0

  const metrics = [
    { label: 'Khóa học', value: count('courses', 'items'), icon: 'courses', href: '#/sections/courses', note: `${count('courses', 'groups')} nhóm` },
    { label: 'Hoạt động', value: count('activities', 'items'), icon: 'activities', href: '#/sections/activities', note: `${count('activities', 'groups')} khối` },
    { label: 'Thành viên', value: count('team', 'members'), icon: 'team', href: '#/sections/team', note: `${count('partners', 'items')} đối tác` },
    {
      label: 'Ảnh trong thư viện',
      value: meta.media.total,
      icon: 'image',
      href: '#/media',
      note: meta.media.unused > 0 ? `${meta.media.unused} chưa dùng` : formatBytes(meta.media.bytes),
    },
  ]

  return (
    <>
      <PageHeader title={`Xin chào, ${username}`} description="Quản lý toàn bộ nội dung trang FabLab EIU bằng hai ngôn ngữ." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {metrics.map((metric) => (
          <a
            key={metric.label}
            href={metric.href}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <Icon name={metric.icon} size={24} />
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</span>
                <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{metric.value.toLocaleString('vi-VN')}</p>
              </div>
              <Badge color="brand">{metric.note}</Badge>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8" title="Nội dung trang" description="12 section, theo đúng thứ tự xuất hiện trên trang." bodyClassName="p-0!">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th scope="col" className="px-5 py-3 text-theme-xs font-medium text-gray-500 sm:px-6">
                    Section
                  </th>
                  <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                    Nội dung
                  </th>
                  <th scope="col" className="py-3 pr-4 text-theme-xs font-medium whitespace-nowrap text-gray-500">
                    Cập nhật
                  </th>
                  <th scope="col" className="py-3 pr-5 sm:pr-6">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((descriptor) => (
                  <tr key={descriptor.key} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-5 py-3 sm:px-6">
                      <a href={`#/sections/${descriptor.key}`} className="group flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-brand-50 group-hover:text-brand-500 dark:bg-white/5 dark:text-gray-400">
                          <Icon name={descriptor.icon} size={18} />
                        </span>
                        <span className="text-theme-sm font-medium whitespace-nowrap text-gray-800 group-hover:text-brand-500 dark:text-white/90">
                          {descriptor.label}
                        </span>
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-theme-sm text-gray-500 dark:text-gray-400">{summarize(descriptor, bySection[descriptor.key]?.counts)}</td>
                    <td className="py-3 pr-4 text-theme-xs whitespace-nowrap text-gray-500">{formatDateTime(bySection[descriptor.key]?.updatedAt)}</td>
                    <td className="py-3 pr-5 text-right sm:pr-6">
                      <LinkButton href={`#/sections/${descriptor.key}`} size="xs" variant="ghost" icon="pencil">
                        Sửa
                      </LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6 xl:col-span-4">
          <Card title="Lần lưu gần nhất">
            {meta.recent.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có lần lưu nào từ dashboard.</p>
            ) : (
              <ul className="space-y-4">
                {meta.recent.map((entry) => {
                  const descriptor = SECTION_BY_KEY[entry.key]
                  return (
                    <li key={entry.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                        <Icon name={descriptor?.icon ?? 'save'} size={16} />
                      </span>
                      <div className="min-w-0">
                        <a href={`#/sections/${entry.key}`} className="text-theme-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
                          {descriptor?.label ?? entry.key}
                        </a>
                        <p className="text-theme-xs text-gray-500">
                          {formatDateTime(entry.savedAt)}
                          {entry.note ? ` · ${entry.note}` : ''}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card title="Trạng thái nội dung">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Phiên bản nội dung</dt>
                <dd className="font-mono text-gray-800 dark:text-white/90">{meta.rev}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Sửa lần cuối</dt>
                <dd className="text-gray-800 dark:text-white/90">{formatDateTime(meta.updatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Popup khóa học đã sửa</dt>
                <dd className="text-gray-800 dark:text-white/90">{meta.overriddenDetails}</dd>
              </div>
            </dl>
            <div className="mt-5 space-y-3">
              {meta.warnings.map((warning) => (
                <Alert key={warning} tone="warning">
                  {warning}
                </Alert>
              ))}
              <Alert tone="info">
                Bản chạy offline (thư mục <code>dist/</code>) chỉ nhận nội dung và ảnh mới sau lần <code>npm run build</code> kế tiếp.
              </Alert>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
