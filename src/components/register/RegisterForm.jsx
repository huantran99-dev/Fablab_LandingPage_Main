import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CloseIcon } from '../../assets/icons/Icons'
import { useLanguage } from '../../i18n/context'
import { registrationReferrer } from '../../lib/track'
import { Button } from '../ui/Button'
import { Checkbox, SelectField, TextArea, TextField } from '../ui/Field'
import { useRegister } from './RegisterContext'
import { FIELD_ORDER, LIMITS, validate } from './validate'

export const REGISTER_TITLE_ID = 'register-title'

/**
 * Dưới ngưỡng này máy chủ coi là máy điền và lặng lẽ bỏ. Người thật gần như không
 * bao giờ nhanh thế, nhưng nếu có thì form tự chờ cho đủ thay vì để lượt gửi mất.
 * Lấy dư 200ms so với ngưỡng 3000ms của máy chủ.
 */
const MIN_FILL_MS = 3200

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match)

/** Các khóa theo nhóm, đúng thứ tự `courses.groups`; khóa lạc nhóm dồn xuống cuối. */
function courseOptions(courses) {
  const groups = (courses.groups ?? []).map((group) => ({
    ...group,
    items: courses.items.filter((item) => item.group === group.id),
  }))
  const known = new Set(groups.map((group) => group.id))
  const loose = courses.items.filter((item) => !known.has(item.group))
  return { groups: groups.filter((group) => group.items.length > 0), loose }
}

/**
 * Form đăng ký khóa học. Chỉ được dựng khi dialog mở, nên mỗi lần mở là một phiên
 * mới (trạng thái gửi, lỗi) — còn chữ đã gõ nằm ở bản nháp trong provider.
 *
 * Đổi ngôn ngữ giữa chừng: nhãn dịch theo, giá trị đã nhập giữ nguyên vì bản nháp
 * đặt theo tên trường chứ không theo ngôn ngữ.
 */
export function RegisterForm({ onClose }) {
  const { t, lang } = useLanguage()
  const r = t.register
  const { draft, setDraft, source, resetDraft } = useRegister()

  const [openedAt] = useState(() => Date.now())
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState(null)
  const [serverIssues, setServerIssues] = useState({})
  const [summaryTick, setSummaryTick] = useState(0)

  const honeypotRef = useRef(null)
  const summaryRef = useRef(null)
  const successRef = useRef(null)

  // Chỉ đụng DOM, không setState: đưa focus tới hộp tóm tắt lỗi / tiêu đề thành công.
  useEffect(() => {
    if (summaryTick > 0) summaryRef.current?.focus()
  }, [summaryTick])
  useEffect(() => {
    if (status === 'done') successRef.current?.focus()
  }, [status])

  const clientErrors = validate(draft)
  const errorCode = (field) => clientErrors[field] ?? serverIssues[field]
  const visibleError = (field) => {
    const code = errorCode(field)
    if (!code || !(attempted || touched[field] || serverIssues[field])) return undefined
    return r.errors[code] ?? r.errors.required
  }
  const summary = attempted ? FIELD_ORDER.filter((field) => errorCode(field)) : []

  const labelOf = {
    course: r.course,
    studentName: r.studentName,
    studentGrade: r.studentGrade,
    school: r.school,
    parentName: r.parentName,
    phone: r.phone,
    email: r.email,
    note: r.note,
    consent: r.consent,
  }

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setDraft((current) => ({ ...current, [field]: value }))
    if (serverIssues[field]) setServerIssues(({ [field]: _gone, ...rest }) => rest)
  }
  const blur = (field) => () => setTouched((current) => (current[field] ? current : { ...current, [field]: true }))

  const marks = { required: r.required, optional: r.optional }
  const common = (field) => ({
    id: `reg-${field}`,
    label: labelOf[field],
    marks,
    value: draft[field],
    onChange: update(field),
    onBlur: blur(field),
    error: visibleError(field),
    maxLength: LIMITS[field],
  })

  const { groups, loose } = courseOptions(t.courses)
  const courseValue = t.courses.items.some((item) => item.id === draft.course) ? draft.course : ''
  const contactValues = { email: t.footer.contact.email, phone: t.footer.contact.phone }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    setAttempted(true)
    setServerError(null)
    if (Object.keys(validate(draft)).length > 0) {
      setSummaryTick((tick) => tick + 1)
      return
    }

    setStatus('sending')
    const wait = MIN_FILL_MS - (Date.now() - openedAt)
    if (wait > 0) await sleep(wait)

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          course: courseValue,
          studentName: draft.studentName,
          studentGrade: draft.studentGrade,
          school: draft.school,
          parentName: draft.parentName,
          phone: draft.phone,
          email: draft.email,
          note: draft.note,
          consent: draft.consent === true,
          locale: lang,
          source,
          website: honeypotRef.current?.value ?? '',
          elapsed: Date.now() - openedAt,
          ref: registrationReferrer(),
          width: window.innerWidth,
        }),
      })

      if (response.status === 201) {
        setStatus('done')
        resetDraft()
        return
      }

      const body = await response.json().catch(() => null)
      const fieldIssues = Object.fromEntries(
        (body?.issues ?? []).filter((issue) => FIELD_ORDER.includes(issue.path)).map((issue) => [issue.path, issue.code]),
      )
      if (response.status === 422 && Object.keys(fieldIssues).length > 0) {
        setServerIssues(fieldIssues)
        setSummaryTick((tick) => tick + 1)
      } else if (response.status === 429) setServerError('rateLimited')
      else if (body?.code === 'paused') setServerError('paused')
      else setServerError('network')
    } catch {
      setServerError('network')
    }
    setStatus('idle')
  }

  const focusField = (field) => (event) => {
    event.preventDefault()
    document.getElementById(`reg-${field}`)?.focus()
  }

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label={r.close}
      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-wash text-ink transition-colors duration-200 ease-[var(--ease-out-soft)] hover:bg-ash/50"
    >
      <CloseIcon />
    </button>
  )

  if (status === 'done') {
    return (
      <div className="relative flex flex-col items-center gap-5 rounded-card-sm bg-white px-6 py-12 text-center shadow-ambient-lift md:px-12">
        <div className="absolute top-4 right-4">{closeButton}</div>
        <span className="inline-flex size-16 items-center justify-center rounded-pill bg-mint text-leaf" aria-hidden="true">
          <CheckIcon size={30} />
        </span>
        <div role="status" className="flex flex-col items-center gap-3">
          <h2 id={REGISTER_TITLE_ID} ref={successRef} tabIndex={-1} className="text-heading-lg text-ink">
            {r.success.title}
          </h2>
          <p className="max-w-[440px] text-subheading text-graphite">{r.success.message}</p>
        </div>
        <Button type="button" size="lg" onClick={onClose}>
          {r.success.close}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ash/60 px-6 pt-6 pb-5 md:px-8">
        <div className="flex flex-col gap-2">
          <h2 id={REGISTER_TITLE_ID} className="text-heading-lg text-ink">
            {r.title}
          </h2>
          <p className="text-body-sm text-graphite">{r.description}</p>
        </div>
        {closeButton}
      </header>

      {/* noValidate: tự kiểm để thông báo lỗi theo đúng ngôn ngữ đang xem, thay vì
          bong bóng mặc định của trình duyệt (theo ngôn ngữ hệ điều hành). */}
      <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="relative flex flex-col gap-7 overflow-y-auto px-6 py-6 md:px-8">
          {summary.length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="flex flex-col gap-2 rounded-image-sm border border-alert/40 bg-butter px-5 py-4"
            >
              <p className="text-body-sm font-medium text-ink">{fill(r.errorSummary, { count: summary.length })}</p>
              <ul className="flex flex-col gap-1">
                {summary.map((field) => (
                  <li key={field}>
                    <a
                      href={`#reg-${field}`}
                      onClick={focusField(field)}
                      className="text-body-sm text-alert underline underline-offset-2"
                    >
                      {labelOf[field]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* value = courseValue chứ không phải bản nháp: khóa vừa bị xoá khỏi trang
              thì rơi về "cần tư vấn" thay vì một lựa chọn vô hình. */}
          <SelectField {...common('course')} value={courseValue}>
            <option value="">{r.courseNone}</option>
            {groups.map((group) => (
              <optgroup key={group.id} label={group.title}>
                {group.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </optgroup>
            ))}
            {loose.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </SelectField>

          <fieldset className="flex flex-col gap-5">
            <legend className="mb-4 text-heading-sm text-ink">{r.studentHeading}</legend>
            {/* autoComplete off: trình duyệt hay điền nhầm tên phụ huynh vào ô học viên. */}
            <TextField {...common('studentName')} required autoComplete="off" />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField {...common('studentGrade')} hint={r.studentGradeHint} autoComplete="off" />
              <TextField {...common('school')} autoComplete="off" />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-5">
            <legend className="mb-4 text-heading-sm text-ink">{r.parentHeading}</legend>
            <TextField {...common('parentName')} required autoComplete="name" />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField {...common('phone')} required type="tel" inputMode="tel" autoComplete="tel" />
              <TextField {...common('email')} type="email" inputMode="email" autoComplete="email" />
            </div>
          </fieldset>

          <TextArea {...common('note')} placeholder={r.notePlaceholder} rows={3} />

          <Checkbox
            id="reg-consent"
            label={r.consent}
            description={fill(r.privacy, contactValues)}
            checked={draft.consent}
            onChange={update('consent')}
            onBlur={blur('consent')}
            error={visibleError('consent')}
          />

          {/* Ô bẫy bot: người thật không nhìn thấy, trình đọc màn hình bỏ qua, Tab
              không dừng ở đây. Điền vào là máy chủ lặng lẽ bỏ lượt gửi. */}
          <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
            <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-ash/60 px-6 py-4 md:px-8">
          {serverError && (
            <p role="alert" className="text-body-sm font-medium text-alert">
              {fill(r.errors[serverError] ?? r.errors.network, contactValues)}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full justify-center disabled:cursor-wait disabled:opacity-60"
            disabled={status === 'sending'}
            aria-busy={status === 'sending'}
          >
            {status === 'sending' ? r.submitting : r.submit}
          </Button>
        </div>
      </form>
    </div>
  )
}
