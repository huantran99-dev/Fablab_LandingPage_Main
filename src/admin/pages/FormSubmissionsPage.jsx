import { useEffect, useState } from 'react'

import { PageHeader } from '../layout/PageHeader'
import { api, describeError, formSubmissionsExportUrl } from '../lib/api'
import { formatDateTime } from '../lib/paths'
import { formatPhone } from '../lib/registrations'
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

/** Khớp `FORM_STATUSES` ở server/schema/formSubmission.js. Thứ tự = thứ tự tab. */
const STATUS = {
  new: { label: 'Mới', color: 'brand' },
  contacted: { label: 'Đã liên hệ', color: 'warning' },
  done: { label: 'Đã xử lý', color: 'success' },
  cancelled: { label: 'Đã huỷ', color: 'gray' },
}
const STATUS_KEYS = Object.keys(STATUS)

/** Chỗ đặt nút đã mở form — khớp `FORM_SOURCES` ở máy chủ. */
const SOURCE_LABELS = {
  hero: 'Nút ở Hero',
  nav: 'Nút trên thanh menu',
  'nav-drawer': 'Nút trong menu điện thoại',
  'final-cta': 'Nút ở khối kêu gọi cuối trang',
  popup: 'Nút trong popup tự tạo',
  'seasonal-popup': 'Nút của popup sự kiện mùa',
}

/** Dòng đầu trong danh sách: câu trả lời chữ đầu tiên (thường là họ tên). */
function headline(entry) {
  const first = entry.answers.find((answer) => answer.type === 'text' && answer.value)
  return first?.text ?? entry.email ?? `#${entry.id}`
}

function Row({ label, children }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-theme-sm text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-theme-sm break-words text-gray-800 dark:text-white/90">{children || '—'}</dd>
    </div>
  )
}

/** Chi tiết một bài gửi — đọc từ máy chủ theo id, nên mở được bằng `#/forms-inbox/<id>`. */
function SubmissionDetail({ id, onSaved, onDeleted, onClose }) {
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
        const result = await api.formSubmission(id)
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
      const result = await api.updateFormSubmission(id, { status, adminNote: adminNote.trim() || null })
      setItem(result.item)
      toast({ tone: 'success', title: 'Đã lưu', message: `${headline(result.item)}: ${STATUS[result.item.status]?.label}` })
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
      await api.deleteFormSubmission(id)
      toast({ tone: 'success', title: 'Đã xoá bài gửi' })
      setConfirming(false)
      onDeleted()
    } catch (caught) {
      toast({ tone: 'error', title: 'Không xoá được', message: describeError(caught) })
      setDeleting(false)
    }
  }

  if (loadError) return <Alert tone="error" title="Không tải được bài gửi">{loadError}</Alert>
  if (!item) return <p className="py-6 text-center text-sm text-gray-500">Đang tải…</p>

  return (
    <div className="space-y-6">
      {!item.formOnPage && (
        <Alert tone="warning">Form này không còn trong mục "Form tự tạo". Nhãn hiển thị là nhãn lúc người dùng gửi.</Alert>
      )}

      <dl className="space-y-3">
        <Row label="Form">{item.formTitle}</Row>
        {/* Nhãn là nhãn tiếng Việt chụp lúc gửi — form có sửa về sau thì bài cũ vẫn đúng. */}
        {item.answers.map((answer) => (
          <Row key={answer.id} label={answer.label}>
            {answer.type === 'phone' && answer.value ? (
              <a href={`tel:${answer.value}`} className="font-medium text-brand-500 hover:underline">
                {formatPhone(answer.value)}
              </a>
            ) : answer.type === 'email' && answer.value ? (
              <a href={`mailto:${answer.value}`} className="text-brand-500 hover:underline">
                {answer.value}
              </a>
            ) : (
              <span className="whitespace-pre-line">{answer.text}</span>
            )}
          </Row>
        ))}
        <Row label="Năm sinh">{item.birthYear}</Row>
        {/* Chỉ có khi người gửi dưới 16 tuổi ở form nhận trẻ em: phụ huynh điền và đồng ý thay. */}
        {item.parentName && <Row label="Phụ huynh">{item.parentName}</Row>}
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
          <Label htmlFor="submission-status">Trạng thái</Label>
          <Select
            id="submission-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_KEYS.map((key) => ({ value: key, label: STATUS[key].label }))}
          />
          {item.statusAt && <p className="mt-1.5 text-theme-xs text-gray-400">Đổi lần cuối {formatDateTime(item.statusAt)}</p>}
        </div>
        <div>
          <Label htmlFor="submission-note" hint="chỉ quản trị viên thấy">
            Ghi chú nội bộ
          </Label>
          <TextArea
            id="submission-note"
            rows={3}
            maxLength={2000}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="Đã gọi lúc…, đã trả lời qua email…"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost-danger" icon="trash" onClick={() => setConfirming(true)}>
          Xoá bài gửi
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
        title="Xoá bài gửi này?"
        message={`Xoá vĩnh viễn bài gửi của ${headline(item)}${item.parentName ? ' và tên phụ huynh' : ''} khỏi hệ thống — dùng khi người gửi yêu cầu xoá dữ liệu. Bản sao lưu cũ và file CSV đã xuất vẫn còn dữ liệu này.`}
        confirmLabel="Xoá vĩnh viễn"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}

/**
 * Bài gửi của form tự tạo (API 23). Phân trang ở máy chủ; ô tìm kiếm chờ 300ms sau lần gõ
 * cuối. Chọn một form thì CSV mở mỗi ô của form thành một cột.
 */
export function FormSubmissionsPage({ openId, onChanged }) {
  const [status, setStatus] = useState('')
  const [form, setForm] = useState('')
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

  const params = { status, form, from, to, q: search, page, pageSize: PAGE_SIZE }
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.formSubmissions(JSON.parse(paramsKey))
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

  const filterSetter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }
  const openDetail = (id) => window.location.assign(`#/forms-inbox/${id}`)
  const closeDetail = () => window.location.assign('#/forms-inbox')
  const refresh = () => {
    setReloadToken((token) => token + 1)
    onChanged()
  }

  const counts = data?.counts.byStatus ?? { all: 0 }
  const tabs = [['', 'Tất cả', counts.all], ...STATUS_KEYS.map((key) => [key, STATUS[key].label, counts[key] ?? 0])]
  const byForm = data?.counts.byForm ?? []
  const formOptions = byForm.map((entry) => ({
    value: entry.formId,
    label: `${entry.title}${entry.onPage ? '' : ' (đã xoá)'} (${entry.total})`,
  }))
  const hasFilters = Boolean(status || form || from || to || search)

  const total = data?.total ?? 0
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const last = Math.min(page * PAGE_SIZE, total)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Bài gửi form"
        description="Bài gửi của các form bạn tự tạo (mục Form tự tạo). Gọi lại, cập nhật trạng thái, ghi chú nội bộ."
        breadcrumb={[{ label: 'Tuyển sinh' }, { label: 'Bài gửi form' }]}
        actions={
          <LinkButton href={formSubmissionsExportUrl(params)} download icon="download">
            Xuất CSV{form ? ' (mỗi ô một cột)' : hasFilters ? ' (theo bộ lọc)' : ''}
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
                  placeholder="Tìm trong câu trả lời, số điện thoại, email…"
                  className="pl-10"
                  aria-label="Tìm bài gửi"
                />
              </div>
              <Select
                aria-label="Lọc theo form"
                value={form}
                onChange={(event) => filterSetter(setForm)(event.target.value)}
                placeholder="Mọi form"
                options={formOptions}
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
              <p className="text-sm text-gray-500">{hasFilters ? 'Không có bài gửi nào khớp bộ lọc.' : 'Chưa có bài gửi nào.'}</p>
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
                      Người gửi
                    </th>
                    <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                      Liên hệ
                    </th>
                    <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                      Form
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
                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{headline(entry)}</p>
                        <p className="text-theme-xs text-gray-500">
                          {[entry.birthYear, entry.parentName && `phụ huynh: ${entry.parentName}`].filter(Boolean).join(' · ')}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-theme-sm text-gray-800 dark:text-white/90">{entry.email ?? ''}</p>
                        {entry.phone && (
                          <a href={`tel:${entry.phone}`} className="text-theme-xs whitespace-nowrap text-brand-500 hover:underline">
                            {formatPhone(entry.phone)}
                          </a>
                        )}
                      </td>
                      <td className="max-w-[260px] py-3 pr-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        <span className="line-clamp-2">{entry.formTitle}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge color={STATUS[entry.status]?.color ?? 'gray'}>{STATUS[entry.status]?.label ?? entry.status}</Badge>
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

        <Alert tone="info" title="Dữ liệu cá nhân">
          Bài gửi tự xoá sau thời hạn lưu cấu hình trên máy chủ (mặc định 12 tháng), như đăng ký. File CSV tải về nằm ngoài tầm
          kiểm soát của hệ thống — lưu ở nơi an toàn và xoá khi không còn cần.
        </Alert>
      </div>

      <Modal open={Boolean(openId)} onClose={closeDetail} title="Chi tiết bài gửi" size="md">
        {openId && (
          <SubmissionDetail
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
