import { useState } from 'react'

/**
 * Soạn thảo section "Cảm nhận".
 *
 * Nguyên tắc xuyên suốt: **mọi thao tác cấu trúc — thêm, xoá, đổi thứ tự — đều
 * tác động lên CẢ HAI ngôn ngữ cùng lúc.** Giao diện không có nút nào chỉ thêm
 * một mục vào bản tiếng Việt. Nhờ vậy "hai bản lệch cấu trúc" là trạng thái không
 * thao tác ra được, chứ không phải một lỗi trông chờ máy chủ bắt lại.
 *
 * `id` chỉ đặt được lúc tạo rồi khoá luôn: nó là React key, khoá tra ảnh và khoá
 * tra chi tiết — đổi tên là phá cả ba cùng lúc.
 */

const TEXT_FIELDS = [
  ['eyebrow', 'Nhãn nhỏ'],
  ['title', 'Tiêu đề'],
  ['previous', 'Nhãn nút lùi'],
  ['next', 'Nhãn nút tiến'],
  ['goTo', 'Nhãn chấm tròn'],
]

const ITEM_FIELDS = [
  ['quote', 'Trích dẫn', true],
  ['name', 'Tên người nói', false],
  ['role', 'Vai trò', false],
]

const input = 'w-full rounded border border-ash bg-white px-2.5 py-1.5 text-sm'

/** Id mới: chữ thường, số, gạch ngang — đúng luật máy chủ kiểm. */
function nextItemId(items) {
  let n = items.length + 1
  const used = new Set(items.map((item) => item.id))
  while (used.has(`t${n}`)) n += 1
  return `t${n}`
}

export function TestimonialsEditor({ value, onChange, issues }) {
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { vi, en } = value

  const setField = (locale, field, next) => {
    onChange({ ...value, [locale]: { ...value[locale], [field]: next } })
  }

  const setItemField = (locale, index, field, next) => {
    const items = value[locale].items.map((item, i) => (i === index ? { ...item, [field]: next } : item))
    onChange({ ...value, [locale]: { ...value[locale], items } })
  }

  /** Áp cùng một phép biến đổi mảng lên cả hai ngôn ngữ. */
  const mapBoth = (fn) => {
    onChange({
      ...value,
      vi: { ...vi, items: fn(vi.items) },
      en: { ...en, items: fn(en.items) },
    })
  }

  const addItem = () => {
    const id = nextItemId(vi.items)
    mapBoth((items) => [...items, { id, quote: '', name: '', role: '' }])
  }

  const removeItem = (index) => {
    mapBoth((items) => items.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }

  const moveItem = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= vi.items.length) return
    mapBoth((items) => {
      const next = [...items]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  /** Lỗi máy chủ trả về, gắn theo đúng đường khoá của trường. */
  const issueFor = (locale, path) => issues?.[locale]?.find((issue) => issue.path === path)?.message

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded border border-ash bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-steel">Chữ chung</h2>
        <div className="mt-3 flex flex-col gap-3">
          {TEXT_FIELDS.map(([field, label]) => (
            <div key={field} className="grid gap-2 sm:grid-cols-[10rem_1fr_1fr] sm:items-center">
              <span className="text-sm font-medium">{label}</span>
              {['vi', 'en'].map((locale) => (
                <label key={locale} className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase text-steel sm:hidden">{locale}</span>
                  <input
                    value={value[locale][field] ?? ''}
                    onChange={(event) => setField(locale, field, event.target.value)}
                    className={input}
                    aria-label={`${label} (${locale.toUpperCase()})`}
                  />
                  {issueFor(locale, field) && (
                    <span className="text-xs text-danger">{issueFor(locale, field)}</span>
                  )}
                </label>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-steel">Cột trái tiếng Việt, cột phải tiếng Anh.</p>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-steel">
            Cảm nhận ({vi.items.length})
          </h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded border border-signal px-3 py-1.5 text-sm font-medium text-signal"
          >
            + Thêm cảm nhận
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-4">
          {vi.items.map((item, index) => (
            <article key={item.id} className="rounded border border-ash bg-white p-4">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-paper px-2 py-0.5 font-mono text-xs text-steel">{item.id}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="rounded border border-ash px-2 py-1 text-xs disabled:opacity-40"
                    aria-label="Đưa lên trên"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === vi.items.length - 1}
                    className="rounded border border-ash px-2 py-1 text-xs disabled:opacity-40"
                    aria-label="Đưa xuống dưới"
                  >
                    ↓
                  </button>
                  {confirmDelete === item.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded bg-danger px-2 py-1 text-xs text-white"
                      >
                        Xoá thật
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="rounded border border-ash px-2 py-1 text-xs"
                      >
                        Thôi
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(item.id)}
                      disabled={vi.items.length <= 1}
                      className="rounded border border-ash px-2 py-1 text-xs text-danger disabled:opacity-40"
                      title={vi.items.length <= 1 ? 'Phải còn ít nhất một cảm nhận' : undefined}
                    >
                      Xoá
                    </button>
                  )}
                </div>
              </header>

              <div className="mt-3 flex flex-col gap-3">
                {ITEM_FIELDS.map(([field, label, multiline]) => (
                  <div key={field} className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr] sm:items-start">
                    <span className="pt-1.5 text-sm font-medium">{label}</span>
                    {['vi', 'en'].map((locale) => {
                      const path = `items.${index}.${field}`
                      const problem = issueFor(locale, path)
                      const Tag = multiline ? 'textarea' : 'input'
                      return (
                        <label key={locale} className="flex flex-col gap-1">
                          <span className="text-[11px] uppercase text-steel sm:hidden">{locale}</span>
                          <Tag
                            value={value[locale].items[index]?.[field] ?? ''}
                            onChange={(event) => setItemField(locale, index, field, event.target.value)}
                            rows={multiline ? 3 : undefined}
                            className={input}
                            aria-label={`${label} (${locale.toUpperCase()})`}
                          />
                          {problem && <span className="text-xs text-danger">{problem}</span>}
                        </label>
                      )
                    })}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
