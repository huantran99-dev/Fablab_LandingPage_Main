import { useEffect, useRef, useState } from 'react'

import { getPath, slugify, uniqueId } from '../lib/paths'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { FieldError, FieldHelp, Input, Label } from '../ui/Field'
import { Modal } from '../ui/Modal'
import { CourseDetailPanel } from './CourseDetailPanel'
import { FieldControl } from './FieldControl'
import { ImageField } from './ImageField'
import { activeFields, allFields, fillSubIds, toWorking, validateWorking } from './model'

function ItemForm({ list, mode, itemId, draft, images, ctx, serverIssues, savedIds, onApply, onCancel, guardRef, initialShared }) {
  const fields = allFields(list)
  const titleField = fields.find((field) => field.key === list.titleField)

  const [initial] = useState(() => {
    const viItem = mode === 'edit' ? getPath(draft.vi, list.path).find((item) => item.id === itemId) : null
    const enItem = mode === 'edit' ? getPath(draft.en, list.path).find((item) => item.id === itemId) : null
    const working = toWorking(fields, viItem, enItem)

    if (mode === 'create') {
      // Ô chọn bắt buộc lấy sẵn lựa chọn đầu — form trống thì lượt Áp dụng đầu tiên
      // nào cũng báo lỗi "chưa chọn", vô ích.
      for (const field of fields) {
        if (field.type === 'select' && !working.shared[field.key]) {
          working.shared[field.key] = field.options(ctx)[0]?.value ?? ''
        }
      }
      Object.assign(working.shared, initialShared)
    }

    return {
      working,
      variant: list.variants ? (viItem ? list.variants.detect(viItem) : list.variants.options[0].value) : null,
      image: list.image && viItem ? (images[viItem.id] ?? null) : null,
    }
  })

  const [working, setWorking] = useState(initial.working)
  const [variant, setVariant] = useState(initial.variant)
  const [image, setImage] = useState(initial.image)
  const [idTouched, setIdTouched] = useState(false)
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('card')

  const usedIds = new Set((getPath(draft.vi, list.path) ?? []).map((item) => item.id))

  // Id gợi ý từ tiêu đề, TÍNH lúc render cho tới khi người dùng tự gõ id.
  const suggestedFrom = titleField?.translated ? working.vi[list.titleField] : working.shared[list.titleField]
  const current = mode === 'create' && !idTouched ? { ...working, id: uniqueId(slugify(suggestedFrom), usedIds) } : working

  const dirty = JSON.stringify({ working, variant, image }) !== JSON.stringify(initial)
  useEffect(() => {
    guardRef.current = () => dirty
  })

  const active = activeFields(list, variant)
  const canEditDetails = list.courseDetails && mode === 'edit' && savedIds.has(itemId)

  function apply() {
    const filled = fillSubIds(active, current)
    const found = validateWorking(active, filled, { checkId: mode === 'create', usedIds })
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onApply({
      working: filled,
      fields: active,
      image,
      imageChanged: JSON.stringify(image) !== JSON.stringify(initial.image),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {list.courseDetails && (
        <div className="inline-flex self-start rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist">
          {[
            ['card', 'Thông tin thẻ'],
            ['details', 'Popup chi tiết'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              disabled={value === 'details' && !canEditDetails}
              title={value === 'details' && !canEditDetails ? 'Lưu khóa học lên trang trước, rồi mới sửa popup.' : undefined}
              onClick={() => setTab(value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                tab === value ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'details' && canEditDetails ? (
        <CourseDetailPanel courseId={itemId} />
      ) : (
        <>
          {mode === 'create' ? (
            <div>
              <Label htmlFor="item-id" hint="không đổi được sau khi tạo">
                Id
              </Label>
              <Input
                id="item-id"
                value={current.id}
                onChange={(event) => {
                  setIdTouched(true)
                  setWorking({ ...working, id: event.target.value.trim() })
                }}
                className="font-mono"
                invalid={Boolean(errors.id)}
              />
              <FieldHelp>
                Tự gợi ý từ {titleField?.label.toLowerCase() ?? 'tiêu đề'}. {list.idHint}
              </FieldHelp>
              <FieldError>{errors.id}</FieldError>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Id</span>
              <Badge color="gray" className="font-mono">
                {itemId}
              </Badge>
              <span className="text-theme-xs">— đã khoá: id là khoá tra ảnh, icon và neo.</span>
              {list.idHint && <FieldHelp>{list.idHint}</FieldHelp>}
            </div>
          )}

          {list.variants && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">{list.variants.label}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.variants.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                      variant === option.value
                        ? 'border-brand-500 bg-brand-25 dark:bg-brand-500/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={option.value}
                      checked={variant === option.value}
                      onChange={() => setVariant(option.value)}
                      className="mt-1 accent-brand-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-800 dark:text-white/90">{option.label}</span>
                      <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {active.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              working={current}
              onChange={setWorking}
              errors={errors}
              serverIssues={serverIssues}
              ctx={ctx}
              idPrefix="item"
            />
          ))}

          {list.image && (
            <ImageField label={list.image.label} hint={list.image.hint} optional={list.image.optional} image={image} onChange={setImage} />
          )}

          <div className="sticky -bottom-5 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:-mx-6 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">Áp dụng vào bản nháp — lên trang khi bấm Lưu.</span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>
                Thôi
              </Button>
              <Button icon="check" onClick={apply}>
                Áp dụng
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Form tạo / sửa một mục. Nội dung chỉ dựng khi mở (xem Modal), nên mỗi lần mở là
 * một bản làm việc mới lấy từ bản nháp hiện tại.
 */
export function ItemModal({ open, list, mode, itemId, onClose, ...rest }) {
  const guardRef = useRef(() => false)

  const requestClose = () => {
    if (guardRef.current() && !window.confirm('Bỏ các thay đổi trong form này?')) return
    onClose()
  }

  const title = mode === 'create' ? `Thêm ${list.itemName}` : `Sửa ${list.itemName}`

  return (
    <Modal open={open} onClose={requestClose} title={title} description="Mọi thay đổi áp dụng cho cả tiếng Việt và tiếng Anh." size="lg">
      <ItemForm list={list} mode={mode} itemId={itemId} onCancel={requestClose} guardRef={guardRef} {...rest} />
    </Modal>
  )
}
