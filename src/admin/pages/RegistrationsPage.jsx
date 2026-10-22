import { useEffect, useState } from 'react'

import { PageHeader } from '../layout/PageHeader'
import { api, describeError, registrationsExportUrl } from '../lib/api'
import { formatDateTime } from '../lib/paths'
import { formatPhone, SOURCE_LABELS, STATUS, STATUS_KEYS } from '../lib/registrations'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { Button, LinkButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Input, Label, Select, TextArea } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/toastContext'

const PAGE_SIZE = 25
const NO_COURSE = '-'

const courseLabel = (entry) => entry.courseTitle ?? (entry.courseId ? entry.courseId : 'Chưa chọn — cần tư vấn')

function StatusBadge({ status }) {
  return <Badge color={STATUS[status]?.color ?? 'gray'}>{STATUS[status]?.label ?? status}</Badge>
}

/** Một dòng thông tin trong popup chi tiết. */
function Row({ label, children }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-theme-sm text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-theme-sm break-words text-gray-800 dark:text-white/90">{children || '—'}</dd>
    </div>
  )
}

/**
 * Chi tiết một lượt đăng ký: đọc thẳng từ máy chủ theo id, nên mở bằng đường dẫn
 * `#/registrations/<id>` (từ trang Tổng quan) cũng chạy dù dòng đó không nằm ở
 * trang danh sách đang xem.
 */
function RegistrationDetail({ id, onSaved, onDeleted, onClose }) {
  const toast = useToast()
  const [item, setItem] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [status, setStatus] = useState('new')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.registration(id)
        if (cancelled) return
        setItem(result.item)
        setStatus(result.item.status)
        setAdminNote(result.item.adminNote ?? '')
      } catch (caught) {
        if (!cancelled) setLoadError(describeError(caught))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const dirty = item && (status !== item.status || adminNote.trim() !== (item.adminNote ?? ''))

  const save = async () => {
    setSaving(true)
    try {
      const result = await api.updateRegistration(id, { status, adminNote: adminNote.trim() || null })
      setItem(result.item)
      toast({ tone: 'success', title: 'Đã lưu', message: `${result.item.studentName}: ${STATUS[result.item.status]?.label}` })
      onSaved()
    } catch (caught) {
      toast({ tone: 'error', title: 'Không lưu được', message: describeError(caught) })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await api.deleteRegistration(id)
      toast({ tone: 'success', title: 'Đã xoá lượt đăng ký' })
      setConfirming(false)
      onDeleted()
    } catch (caught) {
      toast({ tone: 'error', title: 'Không xoá được', message: describeError(caught) })
      setDeleting(false)
    }
  }

  if (loadError) return <Alert tone="error" title="Không tải được lượt đăng ký">{loadError}</Alert>
  if (!item) return <p className="py-6 text-center text-sm text-gray-500">Đang tải…</p>

  return (
    <div className="space-y-6">
      {item.courseId && item.courseOnPage === false && (
        <Alert tone="warning">Khóa học này không còn trên trang. Tên hiển thị là tên lúc người dùng gửi.</Alert>
      )}

      <dl className="space-y-3">
        <Row label="Khóa học">{courseLabel(item)}</Row>
        <Row label="Học viên">{item.studentName}</Row>
        <Row label="Năm sinh / lớp">{item.studentGrade}</Row>
        <Row label="Trường">{item.school}</Row>
        <Row label="Phụ huynh">{item.parentName}</Row>
        <Row label="Điện thoại">
          <a href={`tel:${item.phone}`} className="font-medium text-brand-500 hover:underline">
            {formatPhone(item.phone)}
          </a>
        </Row>
        <Row label="Email">
          {item.email && (
            <a href={`mailto:${item.email}`} className="text-brand-500 hover:underline">
              {item.email}
            </a>
          )}
        </Row>
        <Row label="Ghi chú">{item.note && <span className="whitespace-pre-line">{item.note}</span>}</Row>
        <Row label="Gửi lúc">{formatDateTime(item.createdAt)}</Row>
        <Row label="Gửi từ">
          {SOURCE_LABELS[item.source] ?? item.source} · {item.locale === 'en' ? 'tiếng Anh' : 'tiếng Việt'}
          {item.referrerHost ? ` · đến từ ${item.referrerHost}` : ''}
        </Row>
      </dl>

      <details className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
        <summary className="cursor-pointer text-theme-sm font-medium text-gray-700 dark:text-gray-300">
          Bằng chứng đồng ý ({formatDateTime(item.consentAt)})
        </summary>
        <p className="mt-3 text-theme-xs whitespace-pre-line text-gray-500 dark:text-gray-400">{item.consentText}</p>
      </details>

      <div className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-[200px_1fr] dark:border-gray-800">
        <div>
          <Label htmlFor="registration-status">Trạng thái</Label>
          <Select
            id="registration-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_KEYS.map((key) => ({ value: key, label: STATUS[key].label }))}
          />
          {item.statusAt && <p className="mt-1.5 text-theme-xs text-gray-400">Đổi lần cuối {formatDateTime(item.statusAt)}</p>}
        </div>
        <div>
          <Label htmlFor="registration-note" hint="chỉ quản trị viên thấy">
            Ghi chú nội bộ
          </Label>
          <TextArea
            id="registration-note"
            rows={3}
            maxLength={2000}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="Đã gọi lúc…, hẹn học thử…"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost-danger" icon="trash" onClick={() => setConfirming(true)}>
          Xoá lượt đăng ký
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" icon="save" onClick={save} disabled={!dirty || saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Xoá lượt đăng ký này?"
        message={`Xoá vĩnh viễn thông tin của ${item.studentName} và phụ huynh khỏi hệ thống — dùng khi người đăng ký yêu cầu xoá dữ liệu. Bản sao lưu cũ và file CSV đã xuất vẫn còn dữ liệu này.`}
        confirmLabel="Xoá vĩnh viễn"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}

/**
 * Danh sách đăng ký khóa học. Phân trang ở máy chủ (khác thư viện ảnh): danh sách
 * này lớn dần theo thời gian. Bộ lọc gửi lên máy chủ; ô tìm kiếm chờ 300ms sau lần
 * gõ cuối mới gửi.
 */
export function RegistrationsPage({ openId, onChanged }) {
  const [status, setStatus] = useState('')
  const [course, setCourse] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const params = { status, course, from, to, q: search, page, pageSize: PAGE_SIZE }
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.registrations(JSON.parse(paramsKey))
        if (cancelled) return
        setData(result)
        setLoadError(null)
      } catch (caught) {
        if (!cancelled) setLoadError(describeError(caught))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [paramsKey, reloadToken])

  // Đổi bộ lọc là về trang 1 — đặt ngay trong handler, không qua effect.
  const filterSetter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const openDetail = (id) => {
    window.location.assign(`#/registrations/${id}`)
  }
  const closeDetail = () => {
    window.location.assign('#/registrations')
  }
  const refresh = () => {
    setReloadToken((token) => token + 1)
    onChanged()
  }

  const counts = data?.counts.byStatus ?? { all: 0 }
  const tabs = [['', 'Tất cả', counts.all], ...STATUS_KEYS.map((key) => [key, STATUS[key].label, counts[key] ?? 0])]
  const byCourse = data?.counts.byCourse ?? []
  const courseOptions = byCourse.map((entry) => ({
    value: entry.courseId ?? NO_COURSE,
    label: `${entry.title ?? entry.courseId ?? 'Chưa chọn — cần tư vấn'} (${entry.total})`,
  }))
  const hasFilters = Boolean(status || course || from || to || search)

  const total = data?.total ?? 0
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const last = Math.min(page * PAGE_SIZE, total)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Đăng ký khóa học"
        description="Người gửi form đăng ký trên trang. Gọi lại, cập nhật trạng thái, ghi chú nội bộ."
        breadcrumb={[{ label: 'Tuyển sinh' }, { label: 'Đăng ký khóa học' }]}
        actions={
          <LinkButton href={registrationsExportUrl(params)} download icon="download">
            Xuất CSV{hasFilters ? ' (theo bộ lọc)' : ''}
          </LinkButton>
        }
      />

      <div className="space-y-6">
        <Card bodyClassName="p-4! sm:p-5!">
          <div className="flex flex-col gap-4">
            <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
              <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist" aria-label="Lọc theo trạng thái">
                {tabs.map(([value, label, count]) => (
                  <button
                    key={value || 'all'}
                    type="button"
                    role="tab"
                    aria-selected={status === value}
                    onClick={() => filterSetter(setStatus)(value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      status === value
                        ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-700 dark:text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {label} <span className="text-theme-xs text-gray-400">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_160px_160px]">
              <div className="relative">
                <Icon name="search" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Tên, số điện thoại, email, trường…"
                  className="pl-10"
                  aria-label="Tìm đăng ký"
                />
              </div>
              <Select
                aria-label="Lọc theo khóa học"
                value={course}
                onChange={(event) => filterSetter(setCourse)(event.target.value)}
                placeholder="Mọi khóa học"
                options={courseOptions}
              />
              <Input type="date" aria-label="Từ ngày" value={from} max={to || undefined} onChange={(event) => filterSetter(setFrom)(event.target.value)} />
              <Input type="date" aria-label="Đến ngày" value={to} min={from || undefined} onChange={(event) => filterSetter(setTo)(event.target.value)} />
            </div>
          </div>
        </Card>

        {loadError && (
          <Alert tone="error" title="Không tải được danh sách">
            {loadError}
          </Alert>
        )}

        <Card bodyClassName="p-0!">
          {!data ? (
            <p className="py-10 text-center text-sm text-gray-500">Đang tải danh sách…</p>
          ) : data.items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">{hasFilters ? 'Không có lượt đăng ký nào khớp bộ lọc.' : 'Chưa có lượt đăng ký nào.'}</p>
            </div>
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th scope="col" className="px-5 py-3 text-theme-xs font-medium whitespace-nowrap text-gray-500 sm:px-6">
                      Gửi lúc
                    </th>
                    <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                      Học viên
                    </th>
                    <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                      Phụ huynh
                    </th>
                    <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                      Khóa học
                    </th>
                    <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                      Trạng thái
                    </th>
                    <th scope="col" className="py-3 pr-5 sm:pr-6">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-3 text-theme-xs whitespace-nowrap text-gray-500 sm:px-6">{formatDateTime(entry.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{entry.studentName}</p>
                        <p className="text-theme-xs text-gray-500">{[entry.studentGrade, entry.school].filter(Boolean).join(' · ') || '—'}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-theme-sm text-gray-800 dark:text-white/90">{entry.parentName}</p>
                        <a href={`tel:${entry.phone}`} className="text-theme-xs whitespace-nowrap text-brand-500 hover:underline">
                          {formatPhone(entry.phone)}
                        </a>
                      </td>
                      <td className="max-w-[260px] py-3 pr-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        <span className="line-clamp-2">{courseLabel(entry)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="py-3 pr-5 text-right sm:pr-6">
                        <Button size="xs" variant="ghost" icon="eye" onClick={() => openDetail(entry.id)}>
                          Xem
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 sm:px-6 dark:border-gray-800">
              <p className="text-theme-sm text-gray-500">
                {first}–{last} / {total.toLocaleString('vi-VN')}
              </p>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                  Trước
                </Button>
                <Button size="xs" variant="outline" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>
                  Sau
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Số đăng ký theo khóa học" description="Toàn bộ thời gian, không theo bộ lọc. Bấm tên khóa để lọc danh sách." bodyClassName="p-0!">
          {byCourse.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 sm:px-6">Chưa có số liệu.</p>
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th scope="col" className="px-5 py-3 text-theme-xs font-medium text-gray-500 sm:px-6">
                      Khóa học
                    </th>
                    <th scope="col" className="py-3 pr-4 text-right text-theme-xs font-medium text-gray-500">
                      Tổng
                    </th>
                    <th scope="col" className="py-3 pr-5 text-right text-theme-xs font-medium text-gray-500 sm:pr-6">
                      Chưa xử lý
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {byCourse.map((entry) => (
                    <tr key={entry.courseId ?? NO_COURSE} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-3 sm:px-6">
                        <button
                          type="button"
                          onClick={() => filterSetter(setCourse)(entry.courseId ?? NO_COURSE)}
                          className="text-left text-theme-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90"
                        >
                          {entry.title ?? entry.courseId ?? 'Chưa chọn — cần tư vấn'}
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-right text-theme-sm text-gray-800 tabular-nums dark:text-white/90">{entry.total}</td>
                      <td className="py-3 pr-5 text-right sm:pr-6">
                        {entry.new > 0 ? <Badge color="brand">{entry.new} mới</Badge> : <span className="text-theme-sm text-gray-400">0</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Alert tone="info" title="Dữ liệu cá nhân">
          Đăng ký tự xoá sau thời hạn lưu cấu hình trên máy chủ (mặc định 12 tháng). File CSV tải về nằm ngoài tầm kiểm soát của hệ thống —
          lưu ở nơi an toàn và xoá khi không còn cần.
        </Alert>
      </div>

      <Modal open={Boolean(openId)} onClose={closeDetail} title="Chi tiết đăng ký" size="md">
        {openId && (
          <RegistrationDetail
            key={openId}
            id={openId}
            onClose={closeDetail}
            onSaved={refresh}
            onDeleted={() => {
              closeDetail()
              refresh()
            }}
          />
        )}
      </Modal>
    </>
  )
}
