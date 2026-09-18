import { ChevronDownIcon } from '../../assets/icons/Icons'

/**
 * Mọi ô nhập của trang đi qua đây, giống cách mọi nút đi qua `Button.jsx`.
 *
 * Luật của hệ "Loom" áp nguyên cho ô nhập: bo tròn hoàn toàn, KHÔNG shadow, chỉ
 * chuyển màu viền khi hover/focus. Chữ trong ô tối thiểu 16px — nhỏ hơn thì iOS
 * Safari tự phóng to trang mỗi lần chạm vào ô.
 *
 * Viền focus không tự vẽ: rule `:focus-visible` chung ở `index.css` đã lo.
 */
const CONTROL = [
  'w-full border bg-white text-body text-ink placeholder:text-steel',
  'transition-colors duration-200 ease-[var(--ease-out-soft)]',
].join(' ')

const tone = (error) => (error ? 'border-alert' : 'border-ash hover:border-steel')

/** `aria-describedby` trỏ tới gợi ý và lỗi đang hiện — thứ tự: gợi ý trước, lỗi sau. */
function describedBy(id, hint, error) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
}

function Shell({ id, label, hint, error, required, marks, className = '', children }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-body-sm font-medium text-graphite">
        {label}
        {required ? (
          <>
            <span className="text-alert" aria-hidden="true">
              {' '}*
            </span>
            <span className="sr-only"> ({marks.required})</span>
          </>
        ) : (
          <span className="font-normal text-steel"> ({marks.optional})</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-caption text-steel">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-caption font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({ id, label, hint, error, required, marks, className, ...props }) {
  return (
    <Shell {...{ id, label, hint, error, required, marks, className }}>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL} ${tone(error)} h-12 rounded-pill px-5`}
        {...props}
      />
    </Shell>
  )
}

export function TextArea({ id, label, hint, error, required, marks, className, rows = 3, ...props }) {
  return (
    <Shell {...{ id, label, hint, error, required, marks, className }}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL} ${tone(error)} resize-y rounded-image-sm px-5 py-3`}
        {...props}
      />
    </Shell>
  )
}

export function SelectField({ id, label, hint, error, required, marks, className, children, ...props }) {
  return (
    <Shell {...{ id, label, hint, error, required, marks, className }}>
      <div className="relative">
        <select
          id={id}
          name={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`${CONTROL} ${tone(error)} h-12 cursor-pointer appearance-none rounded-pill pr-12 pl-5`}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-steel" />
      </div>
    </Shell>
  )
}

/** Ô tích: nhãn nằm cạnh ô, lỗi (nếu có) nằm dưới cả hai. */
export function Checkbox({ id, label, description, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={[description && `${id}-desc`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-signal"
          {...props}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="cursor-pointer text-body-sm font-medium text-graphite">
            {label}
          </label>
          {description && (
            <p id={`${id}-desc`} className="text-caption text-steel">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-caption font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  )
}
