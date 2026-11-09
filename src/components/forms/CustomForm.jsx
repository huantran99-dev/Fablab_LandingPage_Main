import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CloseIcon } from '../../assets/icons/Icons'
import { useLanguage } from '../../i18n/context'
import { registrationReferrer } from '../../lib/track'
import { EMPTY_FORM_DRAFT, useActions } from '../actions/ActionContext'
import { Button } from '../ui/Button'
import { Checkbox, SelectField, TextArea, TextField } from '../ui/Field'
import { LIMITS, errorOrder, formNeedsParent, validateCustomForm } from './validateForm'

export const FORM_TITLE_ID = 'custom-form-title'
/** Máy chủ coi lượt gửi nhanh hơn 3 giây là máy điền — tự chờ cho đủ, như form đăng ký. */
const MIN_FILL_MS = 3200

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
/** Thời gian từ lúc mở form (ms) — chỉ gọi trong handler, không lúc render. */
const elapsedSince = (start) => Date.now() - start
const fill = (template, values) => String(template ?? '').replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match)
/** `answers.ho-ten` → `cf-ho-ten`: id của ô trên trang (link trong hộp tóm tắt lỗi focus tới đây). */
const domId = (key) => `cf-${key.replace(/^answers\./, 'a-')}`

/**
 * Form tự tạo (API 23): vẽ theo định nghĩa admin soạn ở section `forms`. Khung, hộp tóm tắt
 * lỗi, bẫy bot, chờ `MIN_FILL_MS`, màn hình thành công đi đúng mẫu RegisterForm; chữ lỗi
 * chung mượn `register.errors`, chữ riêng của form tự tạo ở `forms.*`.
 *
 * Ô năm sinh luôn có. Form tắt `allowMinors` thì người dưới 16 bị chặn (`age`); bật thì
 * dưới 16 hiện ô tên phụ huynh và phụ huynh đồng ý thay (Nghị định 13/2023).
 */
export function CustomForm({ form, source, onClose }) {
  const { t, lang } = useLanguage()
  const r = t.register
  const f = t.forms ?? {}
  const { formDrafts, setFormDraft, resetFormDraft } = useActions()
  const draft = formDrafts[form.id] ?? EMPTY_FORM_DRAFT
  const parentNeeded = formNeedsParent(form, draft.birthYear)

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

  useEffect(() => {
    if (summaryTick > 0) summaryRef.current?.focus()
  }, [summaryTick])
  useEffect(() => {
    if (status === 'done') successRef.current?.focus()
  }, [status])

  const order = errorOrder(form)
  const clientErrors = validateCustomForm(form, draft)
  const errorCode = (key) => clientErrors[key] ?? serverIssues[key]
  const messageOf = (code) =>
    ({ age: f.adultOnly, invalid: f.invalid, form: f.closedMessage })[code] ?? r.errors[code] ?? r.errors.required
  const visibleError = (key) => {
    const code = errorCode(key)
    if (!code || !(attempted || touched[key] || serverIssues[key])) return undefined
    return messageOf(code)
  }
  const summary = attempted ? order.filter((key) => errorCode(key)) : []

  const labelOf = (key) => {
    if (key === 'birthYear') return f.birthYear
    if (key === 'parentName') return f.parentName
    if (key === 'consent') return form.consent
    return form.fields.find((field) => `answers.${field.id}` === key)?.label ?? key
  }

  const clearServer = (key) => {
    if (serverIssues[key]) setServerIssues(({ [key]: _gone, ...rest }) => rest)
  }
  const setAnswer = (id, value) => {
    setFormDraft(form.id, (current) => ({ ...current, answers: { ...current.answers, [id]: value } }))
    clearServer(`answers.${id}`)
  }
  const setField = (key, value) => {
    setFormDraft(form.id, (current) => ({ ...current, [key]: value }))
    clearServer(key)
  }
  const blur = (key) => () => setTouched((current) => (current[key] ? current : { ...current, [key]: true }))

  const marks = { required: r.required, optional: r.optional }
  const contactValues = { email: t.footer?.contact?.email, phone: t.footer?.contact?.phone }

  function payload() {
    const answers = {}
    for (const field of form.fields) {
      const value = draft.answers[field.id]
      if (value !== undefined) answers[field.id] = value
    }
    return {
      answers,
      birthYear: draft.birthYear,
      // Tên phụ huynh còn sót trong nháp (gõ năm 2015 rồi sửa lại) thì không gửi.
      parentName: parentNeeded ? draft.parentName : '',
      consent: draft.consent === true,
      locale: lang,
      source,
      website: honeypotRef.current?.value ?? '',
      elapsed: elapsedSince(openedAt),
      ref: registrationReferrer(),
      width: window.innerWidth,
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    setAttempted(true)
    setServerError(null)
    if (form.closed) {
      setServerError('form')
      return
    }
    if (Object.keys(clientErrors).length > 0) {
      setSummaryTick((tick) => tick + 1)
      return
    }

    setStatus('sending')
    const wait = MIN_FILL_MS - elapsedSince(openedAt)
    if (wait > 0) await sleep(wait)

    try {
      const response = await fetch(`/api/forms/${encodeURIComponent(form.id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload()),
      })
      if (response.status === 201) {
        setStatus('done')
        resetFormDraft(form.id)
        return
      }
      const body = await response.json().catch(() => null)
      const issues = body?.issues ?? []
      const fieldIssues = Object.fromEntries(
        issues.filter((issue) => order.includes(issue.path)).map((issue) => [issue.path, issue.code]),
      )
      if (response.status === 422 && Object.keys(fieldIssues).length > 0) {
        setServerIssues(fieldIssues)
        setSummaryTick((tick) => tick + 1)
      } else if (response.status === 422 && issues.some((issue) => issue.code === 'form')) setServerError('form')
      else if (response.status === 429) setServerError('rateLimited')
      else if (body?.code === 'paused') setServerError('paused')
      else setServerError('network')
    } catch {
      setServerError('network')
    }
    setStatus('idle')
  }

  const focusField = (key) => (event) => {
    event.preventDefault()
    document.getElementById(domId(key))?.focus()
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
          <h2 id={FORM_TITLE_ID} ref={successRef} tabIndex={-1} className="text-heading-lg text-ink">
            {form.successTitle}
          </h2>
          <p className="max-w-[440px] text-subheading text-graphite">{form.successBody}</p>
        </div>
        <Button type="button" size="lg" onClick={onClose}>
          {r.success.close}
        </Button>
      </div>
    )
  }

  /** Một ô của form theo loại. */
  const renderField = (field) => {
    const key = `answers.${field.id}`
    const id = domId(key)
    const value = draft.answers[field.id]
    const base = {
      id,
      label: field.label,
      hint: field.help || undefined,
      marks,
      required: Boolean(field.required),
      error: visibleError(key),
      onBlur: blur(key),
    }
    switch (field.fieldType) {
      case 'textarea':
        return (
          <TextArea
            {...base}
            rows={4}
            maxLength={LIMITS.textarea}
            value={value ?? ''}
            onChange={(event) => setAnswer(field.id, event.target.value)}
          />
        )
      case 'select':
        return (
          <SelectField {...base} value={value ?? ''} onChange={(event) => setAnswer(field.id, event.target.value)}>
            <option value="">{f.selectPlaceholder}</option>
            {(field.options ?? []).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </SelectField>
        )
      case 'multiselect': {
        const chosen = Array.isArray(value) ? value : []
        const error = visibleError(key)
        // Một ô lỗi cho cả nhóm; `tabIndex -1` để link trong hộp tóm tắt lỗi focus được vào nhóm.
        return (
          <fieldset id={id} tabIndex={-1} className="flex flex-col gap-3 outline-none">
            <legend className="mb-3 text-body-sm font-medium text-graphite">
              {field.label}
              <span className="font-normal text-steel"> ({field.required ? r.required : r.optional})</span>
            </legend>
            {field.help && <p className="-mt-2 text-caption text-steel">{field.help}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {(field.options ?? []).map((option) => (
                <Checkbox
                  key={option.id}
                  id={`${id}-${option.id}`}
                  label={option.label}
                  checked={chosen.includes(option.id)}
                  onChange={(event) => {
                    const on = event.target.checked
                    // Giữ thứ tự của danh sách lựa chọn, không theo thứ tự bấm.
                    const next = (field.options ?? [])
                      .map((entry) => entry.id)
                      .filter((entryId) => (entryId === option.id ? on : chosen.includes(entryId)))
                    setAnswer(field.id, next)
                  }}
                  onBlur={blur(key)}
                />
              ))}
            </div>
            {error && <p className="text-caption font-medium text-alert">{error}</p>}
          </fieldset>
        )
      }
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            label={field.required ? field.label : `${field.label} (${r.optional})`}
            description={field.help || undefined}
            checked={value === true}
            onChange={(event) => setAnswer(field.id, event.target.checked)}
            onBlur={blur(key)}
            error={visibleError(key)}
          />
        )
      default: {
        const input = {
          phone: { type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
          email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
          number: { inputMode: 'decimal' },
          date: { type: 'date' },
        }[field.fieldType] ?? {}
        return (
          <TextField
            {...base}
            {...input}
            maxLength={LIMITS[field.fieldType] ?? LIMITS.text}
            value={value ?? ''}
            onChange={(event) => setAnswer(field.id, event.target.value)}
          />
        )
      }
    }
  }

  return (
    <div className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
      <header className="flex shrink-0 flex-col gap-4 border-b border-ash/60 px-6 pt-6 pb-5 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={FORM_TITLE_ID} className="text-heading-lg text-ink">
            {form.title}
          </h2>
          {closeButton}
        </div>
        {form.description && <p className="text-body-sm text-graphite">{form.description}</p>}
      </header>

      {/* noValidate: tự kiểm để báo lỗi theo đúng ngôn ngữ đang xem. */}
      <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="relative flex flex-col gap-6 overflow-y-auto px-6 py-6 md:px-8">
          {!form.allowMinors && f.adultOnly && (
            <p className="rounded-image-sm bg-wash px-5 py-3 text-body-sm text-graphite">{f.adultOnly}</p>
          )}

          {summary.length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="flex flex-col gap-2 rounded-image-sm border border-alert/40 bg-butter px-5 py-4"
            >
              <p className="text-body-sm font-medium text-ink">{fill(r.errorSummary, { count: summary.length })}</p>
              <ul className="flex flex-col gap-1">
                {summary.map((key) => (
                  <li key={key}>
                    <a href={`#${domId(key)}`} onClick={focusField(key)} className="text-body-sm text-alert underline underline-offset-2">
                      {labelOf(key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {form.fields.map((field) => (
            <div key={field.id}>{renderField(field)}</div>
          ))}

          <TextField
            id={domId('birthYear')}
            label={f.birthYear}
            hint={f.birthYearHint}
            marks={marks}
            required
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={draft.birthYear}
            onChange={(event) => setField('birthYear', event.target.value)}
            onBlur={blur('birthYear')}
            error={visibleError('birthYear')}
          />

          {/* Dưới 16 tuổi (theo năm sinh vừa nhập) ở form nhận trẻ em: phụ huynh điền tên và đồng ý thay. */}
          {parentNeeded && (
            <div className="flex flex-col gap-4 rounded-image-sm border border-ash/60 px-5 py-4">
              <p className="text-body-sm text-graphite">{f.parentNote}</p>
              <TextField
                id={domId('parentName')}
                label={f.parentName}
                marks={marks}
                required
                autoComplete="name"
                maxLength={LIMITS.parentName}
                value={draft.parentName}
                onChange={(event) => setField('parentName', event.target.value)}
                onBlur={blur('parentName')}
                error={visibleError('parentName')}
              />
            </div>
          )}

          <Checkbox
            id={domId('consent')}
            label={form.consent}
            description={fill(form.privacy, contactValues)}
            checked={draft.consent === true}
            onChange={(event) => setField('consent', event.target.checked)}
            onBlur={blur('consent')}
            error={visibleError('consent')}
          />

          {/* Ô bẫy bot: người thật không nhìn thấy, trình đọc màn hình bỏ qua, Tab không dừng. */}
          <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
            <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-ash/60 px-6 py-4 md:px-8">
          {serverError && (
            <p role="alert" className="text-body-sm font-medium text-alert">
              {serverError === 'form' ? f.closedMessage : fill(r.errors[serverError] ?? r.errors.network, contactValues)}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full justify-center disabled:cursor-wait disabled:opacity-60"
            disabled={status === 'sending'}
            aria-busy={status === 'sending'}
          >
            {status === 'sending' ? r.submitting : form.submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
