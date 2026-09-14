import { useEffect, useState } from 'react'

import { api, describeError } from '../lib/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/toastContext'

/** Nút tải ảnh lên dạng nhãn bọc `<input type=file>` — dùng chung cho bộ chọn và trang Thư viện. */
export function UploadButton({ onFiles, busy = false, multiple = false, label = 'Tải ảnh lên' }) {
  return (
    <label
      className={`inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-500 ${
        busy ? 'pointer-events-none opacity-70' : ''
      }`}
    >
      <Icon name="upload" size={18} />
      {busy ? 'Đang tải lên…' : label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])]
          event.target.value = ''
          if (files.length > 0) onFiles(files)
        }}
      />
    </label>
  )
}

function PickerBody({ onPick, currentId }) {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(currentId ?? null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.media()
        if (!cancelled) setItems(result.items)
      } catch (caught) {
        if (!cancelled) setError(describeError(caught))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function upload([file]) {
    setUploading(true)
    try {
      const result = await api.uploadMedia(file)
      setItems((list) => [result.item, ...(list ?? []).filter((media) => media.id !== result.item.id)])
      setSelected(result.item.id)
      if (!result.created) {
        toast({ tone: 'info', title: 'Ảnh này đã có trong thư viện', message: 'Đã chọn ảnh sẵn có thay vì tạo bản sao.' })
      }
    } catch (caught) {
      toast({ tone: 'error', title: 'Không tải lên được', message: describeError(caught) })
    } finally {
      setUploading(false)
    }
  }

  const needle = query.trim().toLowerCase()
  const visible = (items ?? []).filter((media) => media.filename.toLowerCase().includes(needle))
  const chosen = items?.find((media) => media.id === selected)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-56">
          <Icon name="search" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên file…" className="pl-10" aria-label="Tìm ảnh" />
        </div>
        <UploadButton onFiles={upload} busy={uploading} />
      </div>
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        JPEG, PNG, WebP, tối đa 15 MB. Máy chủ tự xoay đúng chiều, thu về cạnh dài 1600px và xoá thông tin vị trí chụp (EXIF).
      </p>

      {error && <p className="text-sm text-error-600">{error}</p>}
      {!items && !error && <p className="py-10 text-center text-sm text-gray-500">Đang tải thư viện…</p>}

      {items && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((media) => {
            const isSelected = selected === media.id
            return (
              <button
                key={media.id}
                type="button"
                onClick={() => setSelected(media.id)}
                onDoubleClick={() => onPick(media)}
                aria-pressed={isSelected}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  isSelected ? 'border-brand-500 ring-3 ring-brand-500/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                }`}
              >
                <div className="bg-checker flex aspect-[4/3] items-center justify-center">
                  <img src={media.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="p-2">
                  <p className="truncate text-theme-xs font-medium text-gray-700 dark:text-gray-300" title={media.filename}>
                    {media.filename}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {media.width}×{media.height} · {media.usages.length > 0 ? `dùng ${media.usages.length} chỗ` : 'chưa dùng'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
      {items && visible.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Không có ảnh nào khớp.</p>}

      <div className="sticky -bottom-5 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:-mx-6 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
        <span className="min-w-0 truncate text-sm text-gray-500">{chosen ? chosen.filename : 'Chưa chọn ảnh'}</span>
        <Button icon="check" disabled={!chosen} onClick={() => onPick(chosen)}>
          Dùng ảnh này
        </Button>
      </div>
    </div>
  )
}

export function MediaPicker({ open, onClose, onPick, currentId }) {
  return (
    <Modal open={open} onClose={onClose} title="Chọn ảnh" description="Chọn từ thư viện hoặc tải ảnh mới lên. Nhấp đúp để chọn nhanh." size="xl">
      <PickerBody onPick={onPick} currentId={currentId} />
    </Modal>
  )
}
