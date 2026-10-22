import { useEffect, useState } from 'react'

import { PageHeader } from '../layout/PageHeader'
import { api, describeError } from '../lib/api'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { BarChart, BarList, LineChart } from '../ui/charts'
import { Icon } from '../ui/Icon'

const RANGES = [
  ['7d', '7 ngày'],
  ['30d', '30 ngày'],
  ['90d', '90 ngày'],
]

const CTA_LABELS = {
  nav: 'Nút "Đăng ký" trên menu',
  'nav-drawer': 'Nút "Đăng ký" trong menu điện thoại',
  'hero-primary': 'Nút chính đầu trang',
  'hero-secondary': 'Nút phụ đầu trang',
  'final-primary': 'Nút chính cuối trang',
  'final-secondary': 'Nút "Liên hệ" cuối trang',
  'course-modal': 'Nút đăng ký trong popup khóa học',
}
const DEVICE_LABELS = { mobile: 'Điện thoại', tablet: 'Máy tính bảng', desktop: 'Máy tính' }
const LANGUAGE_LABELS = { vi: 'Tiếng Việt', en: 'Tiếng Anh' }

const percent = (value) => (value === null || value === undefined ? '—' : `${(value * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`)

/** Tỉ trọng của một dòng trong tổng — in nhỏ cạnh con số. */
function withShare(rows) {
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  return rows.map((row) => ({ ...row, share: total > 0 ? percent(row.value / total) : undefined }))
}

function StatTile({ label, value, note, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/90">
          <Icon name={icon} size={20} />
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="mt-4 text-title-sm font-bold text-gray-800 tabular-nums dark:text-white/90">{value}</p>
      {note && <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{note}</p>}
    </div>
  )
}

/**
 * Thống kê truy cập và tương tác. Số liệu tự lưu trên máy chủ của trang, không
 * cookie, không dịch vụ bên ngoài — nên cũng là bức tranh THIẾU: người bật chống
 * theo dõi và trình chặn quảng cáo không được đếm. Trang nói rõ điều đó.
 *
 * Đổi khoảng thời gian thì giữ nguyên biểu đồ cũ (mờ đi) cho tới khi số mới về —
 * không nháy trắng, không nhảy bố cục.
 */
export function StatsPage() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const result = await api.stats(range)
        if (cancelled) return
        setData(result)
        setLoadError(null)
      } catch (caught) {
        if (!cancelled) setLoadError(describeError(caught))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [range])

  const totals = data?.totals
  const courses = data?.courses ?? []

  return (
    <>
      <PageHeader
        title="Thống kê truy cập"
        description="Lượt xem, lượt khách và tương tác trên trang công khai."
        breadcrumb={[{ label: 'Tuyển sinh' }, { label: 'Thống kê truy cập' }]}
      />

      {/* Bộ lọc thời gian: một hàng, phía trên mọi biểu đồ nó chi phối. */}
      <div className="mb-6 inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist" aria-label="Khoảng thời gian">
        {RANGES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={range === value}
            onClick={() => setRange(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              range === value ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="mb-6">
          <Alert tone="error" title="Không tải được số liệu">
            {loadError}
          </Alert>
        </div>
      )}

      {!data ? (
        !loadError && (
          <Card>
            <p className="py-6 text-center text-sm text-gray-500">Đang tải số liệu…</p>
          </Card>
        )
      ) : (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            <StatTile icon="eye" label="Lượt xem trang" value={totals.views.toLocaleString('vi-VN')} />
            <StatTile icon="users" label="Lượt khách (theo ngày)" value={totals.visitors.toLocaleString('vi-VN')} note="Một người vào 3 ngày được tính 3 lượt" />
            <StatTile icon="inbox" label="Đăng ký" value={totals.registrations.toLocaleString('vi-VN')} note={`${totals.registerOpens.toLocaleString('vi-VN')} lượt mở form`} />
            <StatTile icon="chart" label="Tỉ lệ chuyển đổi" value={percent(totals.conversion)} note="Lượt khách đã gửi đăng ký / lượt khách" />
          </div>

          <Card title="Lượt xem và lượt khách theo ngày">
            <LineChart
              days={data.days}
              label="Biểu đồ đường lượt xem và lượt khách theo ngày"
              series={[
                { key: 'views', label: 'Lượt xem' },
                { key: 'visitors', label: 'Lượt khách' },
              ]}
            />
          </Card>

          <Card title="Đăng ký theo ngày" description="Số lượt gửi form thành công, đếm từ danh sách đăng ký.">
            <BarChart days={data.days} valueKey="registrations" label="Biểu đồ cột số đăng ký theo ngày" seriesLabel="Đăng ký" />
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Nguồn truy cập" description="Trang dẫn khách tới — theo lượt xem.">
              <BarList
                rows={withShare(
                  data.referrers.map((row) => ({
                    key: row.host ?? '-',
                    label: row.host ? (row.host.startsWith('utm:') ? `Chiến dịch: ${row.host.slice(4)}` : row.host) : 'Vào thẳng / không rõ',
                    value: row.views,
                  })),
                )}
              />
            </Card>
            <Card title="Nút kêu gọi được bấm">
              <BarList
                rows={data.ctas.map((row) => ({ key: row.cta, label: CTA_LABELS[row.cta] ?? row.cta, value: row.clicks }))}
                emptyText="Chưa có lượt bấm nào."
              />
            </Card>
            <Card title="Thiết bị" description="Theo lượt khách.">
              <BarList rows={withShare(data.devices.map((row) => ({ key: row.device, label: DEVICE_LABELS[row.device] ?? row.device, value: row.visitors })))} />
            </Card>
            <Card title="Ngôn ngữ" description="Ngôn ngữ trang lúc được xem.">
              <BarList
                rows={withShare(data.languages.map((row) => ({ key: row.lang ?? '-', label: LANGUAGE_LABELS[row.lang] ?? 'Không rõ', value: row.views })))}
              />
            </Card>
          </div>

          <Card
            title="Khóa học: mở popup → đăng ký"
            description="Chuyển đổi = lượt khách mở popup rồi gửi đăng ký đúng khóa đó trong cùng ngày / lượt khách mở popup."
            bodyClassName="p-0!"
          >
            {courses.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500 sm:px-6">Chưa có ai mở popup khóa học trong khoảng này.</p>
            ) : (
              <div className="scrollbar-thin overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th scope="col" className="px-5 py-3 text-theme-xs font-medium text-gray-500 sm:px-6">
                        Khóa học
                      </th>
                      <th scope="col" className="py-3 pr-4 text-right text-theme-xs font-medium whitespace-nowrap text-gray-500">
                        Lượt mở
                      </th>
                      <th scope="col" className="py-3 pr-4 text-right text-theme-xs font-medium whitespace-nowrap text-gray-500">
                        Đăng ký
                      </th>
                      <th scope="col" className="py-3 pr-5 text-right text-theme-xs font-medium whitespace-nowrap text-gray-500 sm:pr-6">
                        Chuyển đổi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((row) => (
                      <tr key={row.courseId} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                        <td className="px-5 py-3 text-theme-sm text-gray-800 sm:px-6 dark:text-white/90">
                          {row.title ?? <span className="text-gray-400">{row.courseId} (không còn trên trang)</span>}
                        </td>
                        <td className="py-3 pr-4 text-right text-theme-sm text-gray-800 tabular-nums dark:text-white/90">{row.opens}</td>
                        <td className="py-3 pr-4 text-right text-theme-sm text-gray-800 tabular-nums dark:text-white/90">{row.registrations}</td>
                        <td className="py-3 pr-5 text-right text-theme-sm text-gray-500 tabular-nums sm:pr-6">{percent(row.conversion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Alert tone="info" title="Cách đếm">
            Không dùng cookie và không lưu địa chỉ IP. Khách được nhận diện bằng mã băm đổi mỗi ngày, nên &ldquo;lượt khách&rdquo; là tổng khách của
            từng ngày chứ không phải số người khác nhau. Người bật Do Not Track / Global Privacy Control, và phần lớn trình chặn quảng cáo, không
            được đếm — số thật cao hơn. Dữ liệu chi tiết giữ {data.retentionDays} ngày.
          </Alert>
        </div>
      )}
    </>
  )
}
