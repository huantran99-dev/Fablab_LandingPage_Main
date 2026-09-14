import { useState } from 'react'

import { COURSE_ICON_IDS, CourseIcon } from '../../assets/icons/CourseIcons'
import { Button, IconButton } from '../ui/Button'
import { FieldError, FieldHelp, Input, LocaleTag, Select, Switch, TextArea } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { LOCALES, narrow, toWorking } from './model'

/** Nhãn nhỏ cạnh tên trường dùng chung — để người sửa biết ô này ghi vào cả hai bản. */
function SharedHint() {
  return (
    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
      VI + EN
    </span>
  )
}

/** Cặp ô VI | EN cho một trường dịch. Dùng cho cả chữ chung của section lẫn trường của mục. */
export function TranslatedField({ field, id, values, onChange, errors = {} }) {
  const multiline = field.type === 'textarea'
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">{field.label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {LOCALES.map((locale) => {
          const inputId = `${id}-${locale}`
          const shared = {
            id: inputId,
            value: values[locale] ?? '',
            onChange: (event) => onChange(locale, event.target.value),
            invalid: Boolean(errors[locale]),
            placeholder: field.placeholder,
            'aria-label': `${field.label} (${locale.toUpperCase()})`,
            className: 'pl-12',
          }
          return (
            <div key={locale}>
              <div className="relative">
                {multiline ? <TextArea rows={field.rows ?? 3} {...shared} /> : <Input {...shared} />}
                <span className="pointer-events-none absolute top-3 left-3">
                  <LocaleTag locale={locale} />
                </span>
              </div>
              <FieldError>{errors[locale]}</FieldError>
            </div>
          )
        })}
      </div>
      <FieldHelp>{field.help}</FieldHelp>
    </div>
  )
}

/**
 * Chọn đường dẫn: neo có thật trên trang (lấy từ máy chủ, cùng nguồn với bộ bất biến
 * chặn lượt lưu) hoặc link ngoài. Không có ô gõ tự do cho neo — gõ tay là cách chắc
 * chắn nhất để có một link chết.
 */
function HrefInput({ id, value, onChange, anchors, invalid }) {
  const known = anchors ?? []
  const isAnchor = value === '#' || (typeof value === 'string' && value.startsWith('#') && known.includes(value.slice(1)))
  const [custom, setCustom] = useState(!isAnchor)

  const options = [
    { value: '#', label: '# — chưa có đích' },
    ...known.map((anchor) => ({ value: `#${anchor}`, label: `#${anchor}` })),
    { value: '__custom', label: 'Link ngoài hoặc tuỳ chỉnh…' },
  ]

  return (
    <div className="space-y-2">
      <Select
        id={id}
        options={options}
        value={custom ? '__custom' : value}
        invalid={invalid && !custom}
        onChange={(event) => {
          if (event.target.value === '__custom') {
            setCustom(true)
            if (isAnchor) onChange('https://')
          } else {
            setCustom(false)
            onChange(event.target.value)
          }
        }}
      />
      {custom && (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…  ·  mailto:…  ·  tel:…"
          aria-label="Đường dẫn tuỳ chỉnh"
          invalid={invalid}
        />
      )}
      {!anchors && <FieldHelp>Chưa tải được danh sách neo — chỉ nhập được link tuỳ chỉnh.</FieldHelp>}
    </div>
  )
}

function IconPicker({ value, onChange, invalid }) {
  return (
    <div
      role="radiogroup"
      className={`grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 ${invalid ? 'rounded-xl p-1 ring-2 ring-error-500/40' : ''}`}
    >
      {[...COURSE_ICON_IDS].map((iconId) => {
        const selected = value === iconId
        return (
          <button
            key={iconId}
            type="button"
            role="radio"
            aria-checked={selected}
            title={iconId}
            onClick={() => onChange(iconId)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-colors ${
              selected
                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <CourseIcon id={iconId} size={24} />
            <span className="w-full truncate text-center">{iconId}</span>
          </button>
        )
      })}
    </div>
  )
}

function ChipMulti({ options, value = [], onChange }) {
  if (options.length === 0) return <FieldHelp>Chưa có lựa chọn nào.</FieldHelp>
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((entry) => entry !== option.value) : [...value, option.value])}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors ${
              on
                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            {on && <Icon name="check" size={14} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Danh sách con trong một mục (mục con của menu, liên kết trong cột chân trang). */
function SubListEditor({ field, rows, onChange, errors, serverIssues, ctx, idPrefix }) {
  const update = (index, next) => onChange(rows.map((row, i) => (i === index ? next : row)))
  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">{field.label}</span>
        <Button size="xs" variant="soft" icon="plus" onClick={() => onChange([...rows, toWorking(field.itemFields, null, null)])}>
          Thêm
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            // Dòng mới chưa có id tới lúc Áp dụng; chỉ số là đủ vì dòng mới luôn ở cuối.
            key={row.id || `moi-${index}`}
            className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-white/[0.02]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="truncate font-mono text-theme-xs text-gray-400">{row.id || 'mới — id tự sinh từ nhãn VI'}</span>
              <div className="flex gap-1">
                <IconButton size="xs" icon="arrow-up" label="Đưa lên" onClick={() => move(index, -1)} disabled={index === 0} />
                <IconButton size="xs" icon="arrow-down" label="Đưa xuống" onClick={() => move(index, 1)} disabled={index === rows.length - 1} />
                <IconButton
                  size="xs"
                  icon="trash"
                  label="Xoá dòng"
                  variant="ghost-danger"
                  onClick={() => onChange(rows.filter((_, i) => i !== index))}
                />
              </div>
            </div>
            <div className="space-y-3">
              {field.itemFields.map((sub) => (
                <FieldControl
                  key={sub.key}
                  field={sub}
                  working={row}
                  onChange={(next) => update(index, next)}
                  errors={narrow(errors, `${field.key}.${index}`)}
                  serverIssues={narrow(serverIssues, `${field.key}.${index}`)}
                  ctx={ctx}
                  idPrefix={`${idPrefix}-${index}`}
                />
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700">
            Chưa có mục nào.
          </p>
        )}
      </div>
      <FieldError>{errors[`shared.${field.key}`]}</FieldError>
    </div>
  )
}

/**
 * Một trường của bản làm việc (xem editor/model.js).
 *
 * `errors` là lỗi kiểm phía trình duyệt, `serverIssues` là lỗi máy chủ trả về — cả hai
 * cùng dạng `${vi|en|shared}.${khoá}`.
 */
export function FieldControl({ field, working, onChange, errors = {}, serverIssues = {}, ctx, idPrefix }) {
  const inputId = `${idPrefix}-${field.key.replaceAll('.', '-')}`
  const setShared = (value) => onChange({ ...working, shared: { ...working.shared, [field.key]: value } })

  if (field.translated) {
    return (
      <TranslatedField
        field={field}
        id={inputId}
        values={{ vi: working.vi[field.key], en: working.en[field.key] }}
        onChange={(locale, value) => onChange({ ...working, [locale]: { ...working[locale], [field.key]: value } })}
        errors={{
          vi: errors[`vi.${field.key}`] ?? serverIssues[`vi.${field.key}`],
          en: errors[`en.${field.key}`] ?? serverIssues[`en.${field.key}`],
        }}
      />
    )
  }

  if (field.type === 'sublist') {
    return (
      <SubListEditor
        field={field}
        rows={working.shared[field.key] ?? []}
        onChange={setShared}
        errors={errors}
        serverIssues={serverIssues}
        ctx={ctx}
        idPrefix={inputId}
      />
    )
  }

  if (field.type === 'switch' || field.type === 'exclusive') {
    return (
      <Switch
        id={inputId}
        checked={Boolean(working.shared[field.key])}
        onChange={setShared}
        label={field.label}
        description={field.description}
      />
    )
  }

  const value = working.shared[field.key]
  const error = errors[`shared.${field.key}`] ?? serverIssues[`vi.${field.key}`] ?? serverIssues[`en.${field.key}`]
  let control

  switch (field.type) {
    case 'number':
      control = (
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={value}
          onChange={(event) => setShared(event.target.value === '' ? '' : Number(event.target.value))}
          invalid={Boolean(error)}
        />
      )
      break
    case 'select':
      control = (
        <Select
          id={inputId}
          options={field.options(ctx)}
          placeholder="Chọn…"
          value={value ?? ''}
          onChange={(event) => setShared(event.target.value)}
          invalid={Boolean(error)}
        />
      )
      break
    case 'multiselect':
      control = <ChipMulti options={field.options(ctx)} value={value} onChange={setShared} />
      break
    case 'href':
      control = <HrefInput id={inputId} value={value} onChange={setShared} anchors={ctx.meta?.anchors} invalid={Boolean(error)} />
      break
    case 'icon':
      control = <IconPicker value={value} onChange={setShared} invalid={Boolean(error)} />
      break
    default:
      control = (
        <Input
          id={inputId}
          value={value ?? ''}
          onChange={(event) => setShared(event.target.value)}
          placeholder={field.placeholder}
          invalid={Boolean(error)}
        />
      )
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-400">
          {field.label}
        </label>
        <SharedHint />
      </div>
      {control}
      <FieldHelp>{field.help}</FieldHelp>
      <FieldError>{error}</FieldError>
    </div>
  )
}
