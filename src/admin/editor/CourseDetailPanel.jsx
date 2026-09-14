import { useEffect, useState } from 'react'

import { api, describeError } from '../lib/api'
import { formatDateTime } from '../lib/paths'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { FieldError, FieldHelp, Input, Label, LocaleTag, Switch, TextArea } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { useToast } from '../ui/toastContext'

/**
 * Nội dung popup chi tiết của một khóa học.
 *
 * Lưu RIÊNG và NGAY, không đi qua nút Lưu của section: dữ liệu nằm ở bảng khác
 * (`course_detail`) và cố ý bất đối xứng giữa hai ngôn ngữ. Mỗi ngôn ngữ sửa độc lập.
 *
 * Máy chủ chỉ ghi bản `overridden`; bản bóc từ website cũ và bản viết tay từ
 * catalogue không bao giờ bị đè. "Gỡ bản sửa" là quay về đúng bản gốc.
 */
const LIST_FIELDS = [
  ['overview', 'Tổng quan'],
  ['knowledge', 'Kiến thức'],
  ['skills', 'Kỹ năng'],
  ['curriculum', 'Giáo trình'],
]

const SOURCE_LABELS = {
  overridden: { color: 'warning', text: 'Đang dùng bản đã sửa' },
  handwritten: { color: 'info', text: 'Bản viết tay (catalogue)' },
  scraped: { color: 'gray', text: 'Bản bóc từ website cũ' },
}

function toForm(detail) {
  return {
    audience: detail?.audience ?? '',
    sourceUrl: detail?.sourceUrl ?? '',
    viOnly: Boolean(detail?.viOnly),
    ...Object.fromEntries(LIST_FIELDS.map(([key]) => [key, (detail?.[key] ?? []).join('\n')])),
  }
}

function fromForm(form) {
  const out = {}
  if (form.audience.trim()) out.audience = form.audience.trim()
  for (const [key] of LIST_FIELDS) {
    const lines = form[key]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length > 0) out[key] = lines
  }
  if (form.sourceUrl.trim()) out.sourceUrl = form.sourceUrl.trim()
  if (form.viOnly) out.viOnly = true
  return out
}

export function CourseDetailPanel({ courseId }) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [forms, setForms] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [locale, setLocale] = useState('vi')
  const [busy, setBusy] = useState(false)
  const [issues, setIssues] = useState({ vi: [], en: [] })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.courseDetail(courseId)
        if (cancelled) return
        setData(result)
        setForms({ vi: toForm(result.vi.effective), en: toForm(result.en.effective) })
      } catch (caught) {
        if (!cancelled) setLoadError(describeError(caught))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [courseId])

  if (loadError) return <p className="text-sm text-error-600">{loadError}</p>
  if (!data || !forms) return <p className="py-8 text-center text-sm text-gray-500">Đang tải nội dung popup…</p>

  const state = data[locale]
  const form = forms[locale]
  const source = state.overridden ? 'overridden' : state.handwritten ? 'handwritten' : state.scraped ? 'scraped' : null
  const changed = JSON.stringify(fromForm(form)) !== JSON.stringify(state.effective ?? {})
  const setForm = (key, value) => setForms((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }))

  async function send(body, title) {
    setBusy(true)
    setIssues({ vi: [], en: [] })
    try {
      const result = await api.saveCourseDetail(courseId, body)
      setData(result)
      setForms({ vi: toForm(result.vi.effective), en: toForm(result.en.effective) })
      toast({ tone: 'success', title, message: 'Popup đổi trên trang ngay — không cần bấm Lưu của section.' })
    } catch (caught) {
      if (caught.status === 422) setIssues({ vi: caught.body.vi ?? [], en: caught.body.en ?? [] })
      toast({ tone: 'error', title: 'Chưa lưu được popup', message: describeError(caught) })
    } finally {
      setBusy(false)
    }
  }

  // Máy chủ đòi CẢ HAI ngôn ngữ mỗi lượt. Ngôn ngữ không sửa thì gửi lại đúng trạng
  // thái bản sửa hiện có của nó (hoặc `null` nếu chưa có) — không đụng tới.
  const keepOther = (value) => ({
    vi: locale === 'vi' ? value : data.vi.overridden,
    en: locale === 'en' ? value : data.en.overridden,
  })

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-xl border border-info-500/30 bg-info-50 p-4 text-sm text-gray-700 dark:bg-info-500/10 dark:text-gray-300">
        <Icon name="info" size={20} className="text-info-500" />
        <p>
          Popup lưu <strong>riêng</strong> và <strong>ngay</strong>, mỗi ngôn ngữ độc lập. Bản gốc không bao giờ bị ghi đè — gỡ bản sửa là quay về bản gốc.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist">
          {['vi', 'en'].map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={locale === entry}
              onClick={() => setLocale(entry)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                locale === entry ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {entry === 'vi' ? 'Tiếng Việt' : 'English'}
            </button>
          ))}
        </div>
        {source ? (
          <Badge color={SOURCE_LABELS[source].color}>
            {SOURCE_LABELS[source].text}
            {source === 'overridden' && state.overriddenAt ? ` · ${formatDateTime(state.overriddenAt)}` : ''}
          </Badge>
        ) : (
          <Badge color="gray">Chưa có nội dung — popup hiện thông báo trống</Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`detail-audience-${locale}`} hint={<LocaleTag locale={locale} />}>
            Đối tượng
          </Label>
          <Input id={`detail-audience-${locale}`} value={form.audience} onChange={(event) => setForm('audience', event.target.value)} placeholder="học sinh từ 16 – 18 tuổi" />
        </div>

        {LIST_FIELDS.map(([key, label]) => (
          <div key={key}>
            <Label htmlFor={`detail-${key}-${locale}`} hint="mỗi dòng một ý">
              {label}
            </Label>
            <TextArea id={`detail-${key}-${locale}`} rows={key === 'overview' ? 4 : 5} value={form[key]} onChange={(event) => setForm(key, event.target.value)} />
          </div>
        ))}

        <div>
          <Label htmlFor={`detail-source-${locale}`}>Liên kết nguồn</Label>
          <Input
            id={`detail-source-${locale}`}
            type="url"
            value={form.sourceUrl}
            onChange={(event) => setForm('sourceUrl', event.target.value)}
            placeholder="https://fablab.eiu.edu.vn/courses/…"
          />
        </div>

        <Switch
          id={`detail-vionly-${locale}`}
          checked={form.viOnly}
          onChange={(value) => setForm('viOnly', value)}
          label="Chỉ có bản tiếng Việt"
          description="Popup hiện thông báo khóa học chưa có nội dung bằng ngôn ngữ này."
        />

        {issues[locale].length > 0 && (
          <div>
            {issues[locale].map((issue) => (
              <FieldError key={`${issue.path}-${issue.message}`}>
                {issue.path ? `${issue.path}: ` : ''}
                {issue.message}
              </FieldError>
            ))}
          </div>
        )}
        <FieldHelp>Dòng trống bị bỏ qua. Để trống cả một mục thì popup không hiện mục đó.</FieldHelp>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        {state.overridden && (
          <Button variant="ghost-danger" icon="refresh" disabled={busy} onClick={() => send(keepOther(null), `Đã gỡ bản sửa (${locale.toUpperCase()}) — về bản gốc`)}>
            Gỡ bản sửa
          </Button>
        )}
        <Button icon="save" disabled={busy || !changed} onClick={() => send(keepOther(fromForm(form)), `Đã lưu popup (${locale.toUpperCase()})`)}>
          {busy ? 'Đang lưu…' : `Lưu popup (${locale.toUpperCase()})`}
        </Button>
      </div>
    </div>
  )
}
