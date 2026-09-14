import { useState } from 'react'

import { ID_PATTERN, getPath, setPath } from '../lib/paths'
import { Button, IconButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { FieldError, FieldHelp, Input } from '../ui/Field'
import { omitKey } from './model'

/**
 * Bảng khoá → nhãn (cấp độ khóa học, loại hoạt động). Dữ liệu là object chứ không
 * phải mảng, nên khoá chính là id: thêm/xoá khoá áp lên cả hai ngôn ngữ, nhãn thì dịch.
 */
export function RecordEditor({ record, draft, onChangeDraft, issues }) {
  const viMap = getPath(draft.vi, record.path) ?? {}
  const enMap = getPath(draft.en, record.path) ?? {}
  const ids = Object.keys(viMap)

  const [newId, setNewId] = useState('')
  const [error, setError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const setLabel = (locale, id, value) =>
    onChangeDraft({ ...draft, [locale]: setPath(draft[locale], `${record.path}.${id}`, value) })

  const add = () => {
    const id = newId.trim()
    if (!ID_PATTERN.test(id)) {
      setError('Id chỉ gồm chữ thường không dấu, số và dấu gạch ngang.')
      return
    }
    if (Object.hasOwn(viMap, id)) {
      setError('Id này đã có.')
      return
    }
    onChangeDraft({
      vi: setPath(draft.vi, `${record.path}.${id}`, ''),
      en: setPath(draft.en, `${record.path}.${id}`, ''),
    })
    setNewId('')
    setError(null)
  }

  const remove = (id) => {
    onChangeDraft({
      vi: setPath(draft.vi, record.path, omitKey(viMap, id)),
      en: setPath(draft.en, record.path, omitKey(enMap, id)),
    })
    setPendingDelete(null)
  }

  const issueAt = (locale, id) => issues?.[locale]?.find((issue) => issue.path === `${record.path}.${id}`)?.message

  return (
    <Card title={`${record.title} (${ids.length})`} description={record.description} bodyClassName="p-0!">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th scope="col" className="px-5 py-3 text-theme-xs font-medium text-gray-500 sm:px-6">
                Id
              </th>
              <th scope="col" className="py-3 pr-3 text-theme-xs font-medium text-gray-500">
                Tiếng Việt
              </th>
              <th scope="col" className="py-3 pr-3 text-theme-xs font-medium text-gray-500">
                English
              </th>
              <th scope="col" className="py-3 pr-5 sm:pr-6">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => (
              <tr key={id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-5 py-3 font-mono text-theme-xs text-gray-500 sm:px-6">{id}</td>
                {[
                  ['vi', viMap],
                  ['en', enMap],
                ].map(([locale, map]) => (
                  <td key={locale} className="min-w-48 py-2 pr-3 align-top">
                    <Input
                      value={map[id] ?? ''}
                      onChange={(event) => setLabel(locale, id, event.target.value)}
                      aria-label={`${record.itemName} ${id} (${locale.toUpperCase()})`}
                      invalid={Boolean(issueAt(locale, id))}
                    />
                    <FieldError>{issueAt(locale, id)}</FieldError>
                  </td>
                ))}
                <td className="py-2 pr-5 text-right align-top sm:pr-6">
                  <IconButton icon="trash" variant="ghost-danger" label={`Xoá ${record.itemName} ${id}`} onClick={() => setPendingDelete(id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1 basis-48">
            <Input
              value={newId}
              onChange={(event) => setNewId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  add()
                }
              }}
              placeholder={`id ${record.itemName} mới`}
              aria-label={`Id ${record.itemName} mới`}
              className="font-mono"
              invalid={Boolean(error)}
            />
            <FieldError>{error}</FieldError>
          </div>
          <Button variant="soft" icon="plus" size="md" onClick={add}>
            Thêm {record.itemName}
          </Button>
        </div>
        <FieldHelp>Xoá một {record.itemName} đang có mục dùng tới sẽ bị máy chủ từ chối khi lưu.</FieldHelp>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Xoá ${record.itemName}?`}
        confirmLabel="Xoá khỏi bản nháp"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete)}
        message={
          <p>
            Xoá <code className="font-mono">{pendingDelete}</code> khỏi cả hai ngôn ngữ? Trang thật chỉ đổi khi bấm Lưu.
          </p>
        }
      />
    </Card>
  )
}
