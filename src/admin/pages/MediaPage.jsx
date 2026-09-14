import { useEffect, useState } from 'react'

import { UploadButton } from '../editor/MediaPicker'
import { PageHeader } from '../layout/PageHeader'
import { api, describeError } from '../lib/api'
import { formatBytes, formatDateTime } from '../lib/paths'
import { SECTION_BY_KEY } from '../sections/descriptors'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Input } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { useToast } from '../ui/toastContext'

const FILTERS = [
  ['all', 'Tất cả'],
  ['used', 'Đang dùng'],
  ['unused', 'Chưa dùng'],
]

function usageLabel(usage) {
  if (!usage.section) return usage.label === 'logo' ? 'Logo (navbar)' : usage.label
  const section = SECTION_BY_KEY[usage.section]?.label ?? usage.section
  return usage.section === 'hero' ? section : `${section} › ${usage.label}`
}

/**
 * Thư viện ảnh. Xoá chỉ được khi không mục nào dùng — máy chủ trả danh sách chỗ
 * đang dùng thay vì một lỗi khoá ngoại khó hiểu, và nút xoá tắt sẵn cho những ảnh đó.
 */
export function MediaPage({ onChanged }) {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.media()
        if (cancelled) return
        setItems(result.items)
        setLoadError(null)
      } catch (caught) {
        if (!cancelled) setLoadError(describeError(caught))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  async function upload(files) {
    setUploading(true)
    let created = 0
    let duplicates = 0
    for (const file of files) {
      try {
        const result = await api.uploadMedia(file)
        if (result.created) created += 1
        else duplicates += 1
      } catch (caught) {
        toast({ tone: 'error', title: `Không tải lên được ${file.name}`, message: describeError(caught) })
      }
    }
    setUploading(false)
    if (created + duplicates > 0) {
      toast({
        tone: 'success',
        title: `Đã tải lên ${created} ảnh`,
        message: duplicates > 0 ? `${duplicates} ảnh đã có sẵn trong thư viện nên không tạo bản sao.` : 'Gắn ảnh vào mục trong trang section tương ứng.',
      })
      setReloadToken((token) => token + 1)
      onChanged()
    }
  }

  async function saveNote() {
    try {
      const result = await api.updateMedia(editing.id, editing.value.trim() || null)
      setItems((list) => list.map((media) => (media.id === result.item.id ? result.item : media)))
      setEditing(null)
    } catch (caught) {
      toast({ tone: 'error', title: 'Không lưu được ghi chú', message: describeError(caught) })
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.deleteMedia(pendingDelete.id)
      setItems((list) => list.filter((media) => media.id !== pendingDelete.id))
      toast({ tone: 'success', title: 'Đã xoá ảnh', message: pendingDelete.filename })
      setPendingDelete(null)
      onChanged()
    } catch (caught) {
      const usages = caught.body?.usages
      toast({
        tone: 'error',
        title: 'Không xoá được',
        message: usages ? `Đang dùng ở: ${usages.map(usageLabel).join(', ')}` : describeError(caught),
      })
    } finally {
      setDeleting(false)
    }
  }

  const needle = query.trim().toLowerCase()
  const counts = {
    all: items?.length ?? 0,
    used: items?.filter((media) => media.usages.length > 0).length ?? 0,
    unused: items?.filter((media) => media.usages.length === 0).length ?? 0,
  }
  const visible = (items ?? []).filter((media) => {
    if (filter === 'used' && media.usages.length === 0) return false
    if (filter === 'unused' && media.usages.length > 0) return false
    return !needle || media.filename.toLowerCase().includes(needle) || (media.sourceNote ?? '').toLowerCase().includes(needle)
  })

  return (
    <>
      <PageHeader
        title="Thư viện ảnh"
        description="Mọi ảnh trang đang dùng hoặc từng được tải lên."
        breadcrumb={[{ label: 'Hệ thống' }, { label: 'Thư viện ảnh' }]}
        actions={<UploadButton onFiles={upload} busy={uploading} multiple label="Tải ảnh lên" />}
      />

      <div className="space-y-6">
        <Alert tone="info">
          Máy chủ tự xoay ảnh đúng chiều, thu về cạnh dài 1600px và xoá thông tin vị trí chụp (EXIF). Ảnh mới có trên trang ngay khi được gắn và lưu; riêng bản chạy
          offline (<code>dist/</code>) chỉ có ảnh mới sau lần <code>npm run build</code> kế tiếp.
        </Alert>

        <Card bodyClassName="p-4! sm:p-5!">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  onClick={() => setFilter(value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === value ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {label} <span className="text-theme-xs text-gray-400">{counts[value]}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Icon name="search" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên file, ghi chú…" className="pl-10" aria-label="Tìm ảnh" />
            </div>
          </div>
        </Card>

        {loadError && <Alert tone="error" title="Không tải được thư viện">{loadError}</Alert>}
        {!items && !loadError && <p className="py-10 text-center text-sm text-gray-500">Đang tải thư viện…</p>}

        {items && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
            {visible.map((media) => (
              <article key={media.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <a href={media.url} target="_blank" rel="noreferrer" className="bg-checker flex aspect-[4/3] items-center justify-center" title="Mở ảnh gốc">
                  <img src={media.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                </a>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90" title={media.filename}>
                      {media.filename}
                    </p>
                    <p className="mt-0.5 text-theme-xs text-gray-500">
                      {media.width}×{media.height} · {formatBytes(media.bytes)} · {media.origin === 'seed' ? 'ảnh gốc của trang' : `tải lên ${formatDateTime(media.createdAt)}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {media.usages.length === 0 ? (
                      <Badge color="warning">Chưa dùng</Badge>
                    ) : (
                      media.usages.map((usage) =>
                        usage.section ? (
                          <a key={`${usage.scope}-${usage.itemId}`} href={`#/sections/${usage.section}`}>
                            <Badge color="brand" title={usageLabel(usage)}>
                              {usageLabel(usage)}
                            </Badge>
                          </a>
                        ) : (
                          <Badge key={`${usage.scope}-${usage.itemId}`} color="gray">
                            {usageLabel(usage)}
                          </Badge>
                        ),
                      )
                    )}
                  </div>

                  {editing?.id === media.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editing.value}
                        onChange={(event) => setEditing({ ...editing, value: event.target.value })}
                        placeholder="Nguồn ảnh, ví dụ: thư viện media fablab.eiu.edu.vn"
                        aria-label="Ghi chú nguồn"
                        maxLength={300}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="xs" variant="outline" onClick={() => setEditing(null)}>
                          Thôi
                        </Button>
                        <Button size="xs" icon="check" onClick={saveNote}>
                          Lưu ghi chú
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditing({ id: media.id, value: media.sourceNote ?? '' })}
                      className="text-left text-theme-xs text-gray-500 hover:text-brand-500 dark:text-gray-400"
                    >
                      {media.sourceNote ? `Nguồn: ${media.sourceNote}` : '+ Ghi chú nguồn ảnh'}
                    </button>
                  )}

                  <div className="mt-auto flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                    <Button
                      size="xs"
                      variant="ghost-danger"
                      icon="trash"
                      disabled={media.usages.length > 0}
                      title={media.usages.length > 0 ? 'Gỡ ảnh khỏi các mục đang dùng trước' : undefined}
                      onClick={() => setPendingDelete(media)}
                    >
                      Xoá
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {items && visible.length === 0 && <p className="py-10 text-center text-sm text-gray-500">Không có ảnh nào khớp.</p>}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xoá ảnh khỏi thư viện?"
        confirmLabel="Xoá vĩnh viễn"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        message={
          pendingDelete && (
            <>
              <p>
                Xoá <strong className="text-gray-800 dark:text-white/90">{pendingDelete.filename}</strong>? Không hoàn tác được.
              </p>
              <p className="mt-2">Nếu một bản trong lịch sử từng dùng ảnh này, khôi phục bản đó sẽ để trống ảnh.</p>
            </>
          )
        }
      />
    </>
  )
}
