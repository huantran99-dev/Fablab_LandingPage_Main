import { useEffect, useMemo, useRef, useState } from 'react'

import { ImageField } from '../editor/ImageField'
import { ItemList } from '../editor/ItemList'
import { RecordEditor } from '../editor/RecordEditor'
import { SectionFields } from '../editor/SectionFields'
import { describePath } from '../editor/model'
import { PageHeader } from '../layout/PageHeader'
import { ApiError, api, describeError } from '../lib/api'
import { formatDateTime, getPath } from '../lib/paths'
import { Alert } from '../ui/Alert'
import { Button, LinkButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/toastContext'

/** Id các mục được phép mang ảnh trong bản nháp hiện tại. */
function imageItemIds(descriptor, vi) {
  if (descriptor.image) return [descriptor.image.itemId]
  const list = descriptor.lists.find((entry) => entry.image)
  return list ? (getPath(vi, list.path) ?? []).map((item) => item.id) : []
}

/**
 * Trang soạn một section: bản nháp hai ngôn ngữ + ảnh, lưu một lượt.
 *
 * Mọi thao tác trên trang chỉ đổi bản nháp. Nút Lưu gửi `{ vi, en, rev, images }`;
 * máy chủ kiểm schema, đối xứng và bất biến rồi mới ghi. `rev` sai (tab khác đã lưu)
 * thì 409 — không bao giờ lặng lẽ ghi đè.
 *
 * Trang được App dựng lại theo `key` mỗi khi đổi section, nên mọi state bắt đầu sạch.
 */
export function SectionPage({ descriptor, meta, onDirtyChange, onSaved }) {
  const toast = useToast()
  const { key } = descriptor

  const [loaded, setLoaded] = useState(null)
  const [draft, setDraft] = useState(null)
  const [images, setImages] = useState({})
  const [history, setHistory] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [issues, setIssues] = useState(null)
  const [invariants, setInvariants] = useState([])
  const [conflict, setConflict] = useState(false)
  const [saving, setSaving] = useState(false)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [restoring, setRestoring] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [pair, log] = await Promise.all([api.readSection(key), api.history(key)])
        if (cancelled) return
        setLoaded(pair)
        setDraft({ vi: pair.vi, en: pair.en })
        setImages(pair.images ?? {})
        setHistory(log.entries.filter((entry) => entry.locale === 'vi'))
        setIssues(null)
        setInvariants([])
        setConflict(false)
        setLoadError(null)
      } catch (caught) {
        if (!cancelled) setLoadError(describeError(caught))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [key, reloadToken])

  const imageDiff = useMemo(() => {
    if (!loaded || !draft) return {}
    const out = {}
    for (const id of imageItemIds(descriptor, draft.vi)) {
      const before = loaded.images?.[id]?.mediaId ?? null
      const after = images[id]?.mediaId ?? null
      if (before !== after) out[id] = after
    }
    return out
  }, [loaded, draft, images, descriptor])

  const dirty = useMemo(
    () =>
      Boolean(loaded && draft) &&
      (JSON.stringify(draft) !== JSON.stringify({ vi: loaded.vi, en: loaded.en }) || Object.keys(imageDiff).length > 0),
    [loaded, draft, imageDiff],
  )

  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])
  useEffect(() => () => onDirtyChange(false), [onDirtyChange])

  // Khóa học đã có trên máy chủ mới sửa được popup (route từ chối id chưa lưu).
  const savedIds = useMemo(
    () =>
      new Set(
        descriptor.lists
          .filter((list) => list.courseDetails)
          .flatMap((list) => (getPath(loaded?.vi, list.path) ?? []).map((item) => item.id)),
      ),
    [descriptor, loaded],
  )

  async function save() {
    if (!dirty || saving || !loaded) return
    setSaving(true)
    setIssues(null)
    setInvariants([])
    try {
      const body = { vi: draft.vi, en: draft.en, rev: loaded.rev }
      if (Object.keys(imageDiff).length > 0) body.images = imageDiff
      const result = await api.writeSection(key, body)

      if (result.warnings?.length > 0) {
        toast({
          tone: 'warning',
          title: `Đã lưu ${descriptor.label} — có điểm nên xem lại`,
          message: (
            <ul className="list-disc space-y-1 pl-4">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ),
        })
      } else {
        toast({ tone: 'success', title: `Đã lưu ${descriptor.label}`, message: 'Trang công khai thấy bản mới ở lần tải trang kế tiếp.' })
      }
      setReloadToken((token) => token + 1)
      onSaved()
    } catch (caught) {
      if (!(caught instanceof ApiError)) {
        toast({ tone: 'error', title: 'Không lưu được', message: describeError(caught) })
      } else if (caught.status === 422 && (caught.body.vi || caught.body.en)) {
        const found = { vi: caught.body.vi ?? [], en: caught.body.en ?? [] }
        setIssues(found)
        const all = [...found.vi.map((issue) => ({ ...issue, locale: 'VI' })), ...found.en.map((issue) => ({ ...issue, locale: 'EN' }))]
        toast({
          tone: 'error',
          title: `Có ${all.length} chỗ chưa hợp lệ`,
          message: (
            <ul className="list-disc space-y-1 pl-4">
              {all.slice(0, 6).map((issue) => (
                <li key={`${issue.locale}-${issue.path}-${issue.message}`}>
                  {issue.locale} · {describePath(descriptor, draft, issue.path)}: {issue.message}
                </li>
              ))}
            </ul>
          ),
        })
      } else if (caught.status === 422 && caught.body.invariants) {
        setInvariants(caught.body.invariants)
        toast({ tone: 'error', title: 'Máy chủ từ chối lượt lưu', message: 'Thay đổi này sẽ làm hỏng một phần của trang — xem danh sách ở đầu trang.' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (caught.status === 422) {
        const missing = [...(caught.body.missingInEn ?? []), ...(caught.body.missingInVi ?? [])]
        toast({ tone: 'error', title: 'Hai ngôn ngữ không cùng cấu trúc', message: missing.slice(0, 5).join(', ') })
      } else if (caught.status === 409) {
        setConflict(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast({ tone: 'error', title: 'Không lưu được', message: describeError(caught) })
      }
    } finally {
      setSaving(false)
    }
  }

  // Ctrl/⌘ + S. Ref giữ bản `save` mới nhất để listener gắn một lần mà không đọc state cũ.
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function restore() {
    const target = restoreTarget
    setRestoring(true)
    try {
      const result = await api.restore(target.id)
      toast({
        tone: result.warnings?.length ? 'warning' : 'success',
        title: 'Đã khôi phục',
        message: result.warnings?.length ? result.warnings.join(' · ') : `Về nội dung ngay trước lần lưu lúc ${formatDateTime(target.saved_at)}.`,
      })
      setRestoreTarget(null)
      setHistoryOpen(false)
      setReloadToken((token) => token + 1)
      onSaved()
    } catch (caught) {
      toast({
        tone: 'error',
        title: 'Không khôi phục được',
        message: caught.body?.invariants ? caught.body.invariants.join(' · ') : describeError(caught),
      })
    } finally {
      setRestoring(false)
    }
  }

  function discard() {
    setDraft({ vi: loaded.vi, en: loaded.en })
    setImages(loaded.images ?? {})
    setIssues(null)
    setInvariants([])
    setDiscardOpen(false)
  }

  const header = (
    <PageHeader
      title={descriptor.label}
      description={descriptor.description}
      breadcrumb={[{ label: 'Nội dung trang' }, { label: descriptor.label }]}
      actions={
        loaded && (
          <>
            <Button variant="outline" icon="history" onClick={() => setHistoryOpen(true)}>
              Lịch sử{history.length > 0 ? ` (${history.length})` : ''}
            </Button>
            <LinkButton href="/" target="_blank" rel="noreferrer" iconRight="external">
              Xem trang
            </LinkButton>
          </>
        )
      }
    />
  )

  if (loadError) {
    return (
      <>
        {header}
        <Alert
          tone="error"
          title="Không tải được section"
          action={
            <Button variant="outline" icon="refresh" onClick={() => setReloadToken((token) => token + 1)}>
              Thử lại
            </Button>
          }
        >
          {loadError}
        </Alert>
      </>
    )
  }

  if (!loaded || !draft) {
    return (
      <>
        {header}
        <Card>
          <p className="py-6 text-center text-sm text-gray-500">Đang tải nội dung…</p>
        </Card>
      </>
    )
  }

  const ctx = { vi: draft.vi, en: draft.en, meta }

  return (
    <>
      {header}

      <div className="space-y-6">
        {conflict && (
          <Alert
            tone="error"
            title="Nội dung đã bị sửa ở nơi khác"
            action={
              <Button variant="danger" icon="refresh" onClick={() => setReloadToken((token) => token + 1)}>
                Tải bản mới (bỏ thay đổi đang soạn)
              </Button>
            }
          >
            Một tab khác (hoặc người khác) đã lưu section này sau khi bạn mở nó. Máy chủ chặn lượt lưu để không xoá mất việc của họ.
          </Alert>
        )}

        {invariants.length > 0 && (
          <Alert tone="error" title="Máy chủ từ chối: thay đổi này làm hỏng một phần của trang">
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {invariants.map((message) => (
                <li key={message} className="font-mono text-theme-xs break-words">
                  {message}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {descriptor.notes?.map((note) => (
          <Alert key={note} tone="info">
            {note}
          </Alert>
        ))}

        {descriptor.groups.map((group, index) => (
          <SectionFields key={group.title} group={group} draft={draft} onChangeDraft={setDraft} issues={issues} idPrefix={`${key}-g${index}`} />
        ))}

        {descriptor.image && (
          <Card title={descriptor.image.label}>
            <ImageField
              label="Ảnh đang dùng"
              hint={descriptor.image.hint}
              image={images[descriptor.image.itemId] ?? null}
              onChange={(image) => setImages((current) => ({ ...current, [descriptor.image.itemId]: image }))}
            />
          </Card>
        )}

        {descriptor.lists.map((list) => (
          <ItemList
            key={list.path}
            list={list}
            draft={draft}
            onChangeDraft={setDraft}
            images={images}
            onChangeImages={setImages}
            issues={issues}
            ctx={ctx}
            savedIds={savedIds}
          />
        ))}

        {descriptor.records?.map((record) => (
          <RecordEditor key={record.path} record={record} draft={draft} onChangeDraft={setDraft} issues={issues} />
        ))}
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-gray-200 bg-white/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 dark:border-gray-800 dark:bg-gray-900/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            {dirty ? (
              <>
                <span className="size-2 rounded-full bg-warning-500" aria-hidden="true" />
                Có thay đổi chưa lưu
              </>
            ) : (
              <>
                <Icon name="check" size={16} className="text-success-500" />
                Đã lưu tất cả
              </>
            )}
            <kbd className="ml-1 hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-500 sm:inline dark:border-gray-700 dark:bg-white/5">
              Ctrl S
            </kbd>
          </span>
          <div className="flex gap-3">
            <Button variant="outline" icon="refresh" disabled={!dirty || saving} onClick={() => setDiscardOpen(true)}>
              Bỏ thay đổi
            </Button>
            <Button icon="save" disabled={!dirty || saving} onClick={save}>
              {saving ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={`Lịch sử — ${descriptor.label}`}
        description="Mỗi dòng là nội dung (chữ và ảnh, cả hai ngôn ngữ) ngay TRƯỚC lần lưu lúc đó."
        size="md"
      >
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">Chưa có lần lưu nào.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formatDateTime(entry.saved_at)}</p>
                  {entry.note && <p className="truncate text-theme-xs text-gray-500">{entry.note}</p>}
                </div>
                <Button size="xs" variant="outline" icon="history" onClick={() => setRestoreTarget(entry)}>
                  Khôi phục
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="Khôi phục bản này?"
        tone="primary"
        confirmLabel="Khôi phục"
        busy={restoring}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={restore}
        message={
          restoreTarget && (
            <>
              <p>Đưa {descriptor.label} về nội dung ngay trước lần lưu lúc {formatDateTime(restoreTarget.saved_at)} — ghi thẳng lên trang.</p>
              <p className="mt-2">Bản hiện tại được lưu vào lịch sử trước, nên vẫn quay lại được.</p>
              {dirty && <p className="mt-2 font-medium text-error-600">Các thay đổi chưa lưu trên trang này sẽ mất.</p>}
            </>
          )
        }
      />

      <ConfirmDialog
        open={discardOpen}
        title="Bỏ mọi thay đổi chưa lưu?"
        confirmLabel="Bỏ thay đổi"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={discard}
        message="Bản nháp quay về đúng nội dung đang có trên trang."
      />
    </>
  )
}
