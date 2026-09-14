import { useState } from 'react'

import { PILLAR_ICON_IDS, PillarIcon } from '../../assets/icons/Icons'
import { getPath } from '../lib/paths'
import { Badge } from '../ui/Badge'
import { Button, IconButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Icon } from '../ui/Icon'
import { ItemModal } from './ItemModal'
import { fromWorking, hasIssuesUnder, issuesUnder, mapBoth, omitKey } from './model'

function Thumb({ list, item, image }) {
  if (list.image) {
    return (
      <div className="bg-checker flex size-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        {image ? (
          <img src={image.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <Icon name="image" size={18} className="text-gray-400" />
        )}
      </div>
    )
  }
  if (list.preview === 'pillar') {
    return (
      <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300">
        {PILLAR_ICON_IDS.has(item.id) ? <PillarIcon id={item.id} size={24} /> : <Icon name="pillars" size={20} className="text-gray-400" />}
      </div>
    )
  }
  return null
}

/**
 * Bảng CRUD cho một danh sách trong section.
 *
 * Thêm, sửa, xoá, đổi thứ tự đều đi qua `mapBoth` — cùng một phép biến đổi trên cả
 * hai ngôn ngữ. Tất cả chỉ đổi BẢN NHÁP; trang thật đổi khi bấm Lưu.
 */
export function ItemList({ list, draft, onChangeDraft, images, onChangeImages, issues, ctx, savedIds }) {
  const items = getPath(draft.vi, list.path) ?? []
  const [filter, setFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const filterOptions = list.filter ? list.filter.options(ctx) : []
  const rows = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !filter || item[list.filter.field] === filter)
  const canAdd = !list.maxItems || items.length < list.maxItems
  const canDelete = items.length > (list.minItems ?? 0)
  const titleOf = (item) => item[list.titleField] || item.id
  const hasThumb = Boolean(list.image || list.preview)

  const move = (id, delta) =>
    onChangeDraft(
      mapBoth(draft, list.path, (entries) => {
        const index = entries.findIndex((entry) => entry.id === id)
        const target = index + delta
        if (index < 0 || target < 0 || target >= entries.length) return entries
        const next = [...entries]
        ;[next[index], next[target]] = [next[target], next[index]]
        return next
      }),
    )

  const remove = (id) => {
    onChangeDraft(mapBoth(draft, list.path, (entries) => entries.filter((entry) => entry.id !== id)))
    setPendingDelete(null)
  }

  function handleApply({ working, fields, image, imageChanged }) {
    const built = { vi: fromWorking(fields, working, 'vi'), en: fromWorking(fields, working, 'en') }
    const exclusive = fields.filter((field) => field.type === 'exclusive' && built.vi[field.key])

    onChangeDraft(
      mapBoth(draft, list.path, (entries, locale) => {
        const item = built[locale]
        let next = modal.mode === 'create' ? [...entries, item] : entries.map((entry) => (entry.id === item.id ? item : entry))
        // Cờ độc quyền (giám đốc): bật ở mục này là tắt ở mọi mục khác, trong cả hai bản.
        for (const field of exclusive) {
          next = next.map((entry) => (entry.id === item.id ? entry : omitKey(entry, field.key)))
        }
        return next
      }),
    )
    if (list.image && imageChanged) onChangeImages({ ...images, [working.id]: image })
    setModal(null)
  }

  const editingIndex = modal?.mode === 'edit' ? items.findIndex((item) => item.id === modal.id) : -1

  return (
    <Card
      title={`${list.title} (${items.length})`}
      description={list.description}
      bodyClassName="p-0!"
      actions={
        <Button
          icon="plus"
          onClick={() => setModal({ mode: 'create' })}
          disabled={!canAdd}
          title={canAdd ? undefined : `Tối đa ${list.maxItems} ${list.itemName}`}
        >
          Thêm {list.itemName}
        </Button>
      }
    >
      {list.filter && filterOptions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3 sm:px-6 dark:border-gray-800">
          <span className="mr-1 text-theme-xs text-gray-500">{list.filter.label}:</span>
          {[{ value: '', label: 'Tất cả' }, ...filterOptions].map((option) => (
            <button
              key={option.value || 'tat-ca'}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`h-8 rounded-full px-3 text-theme-xs font-medium transition-colors ${
                filter === option.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="scrollbar-thin overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th scope="col" className="w-12 px-5 py-3 text-theme-xs font-medium text-gray-500 sm:px-6">
                #
              </th>
              {hasThumb && (
                <th scope="col" className="w-16 py-3 pr-3 text-theme-xs font-medium text-gray-500">
                  <span className="sr-only">Ảnh</span>
                </th>
              )}
              <th scope="col" className="py-3 pr-4 text-theme-xs font-medium text-gray-500">
                Tên
              </th>
              {list.columns?.map((column) => (
                <th key={column.label || 'nhan'} scope="col" className="py-3 pr-4 text-theme-xs font-medium whitespace-nowrap text-gray-500">
                  {column.label}
                </th>
              ))}
              <th scope="col" className="py-3 pr-5 text-right text-theme-xs font-medium text-gray-500 sm:pr-6">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, index }) => {
              const broken = hasIssuesUnder(issues, `${list.path}.${index}`)
              return (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 last:border-0 dark:border-gray-800 ${broken ? 'bg-error-50/60 dark:bg-error-500/5' : ''}`}
                >
                  <td className="px-5 py-3 text-theme-xs text-gray-400 sm:px-6">{index + 1}</td>
                  {hasThumb && (
                    <td className="py-3 pr-3">
                      <Thumb list={list} item={item} image={images[item.id]} />
                    </td>
                  )}
                  <td className="min-w-52 py-3 pr-4">
                    <button type="button" onClick={() => setModal({ mode: 'edit', id: item.id })} className="group block max-w-md text-left">
                      <span className="block text-theme-sm font-medium text-gray-800 group-hover:text-brand-500 dark:text-white/90">
                        {titleOf(item)}
                      </span>
                      {list.subtitleField && item[list.subtitleField] && (
                        <span className="mt-0.5 line-clamp-1 block text-theme-xs text-gray-500 dark:text-gray-400">{item[list.subtitleField]}</span>
                      )}
                      <span className="font-mono text-theme-xs text-gray-400">{item.id}</span>
                    </button>
                    {broken && (
                      <Badge color="error" className="mt-1">
                        Có lỗi — mở để xem
                      </Badge>
                    )}
                  </td>
                  {list.columns?.map((column) => {
                    const value = column.value(item, ctx)
                    return (
                      <td key={column.label || 'nhan'} className="py-3 pr-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {column.badge ? value && <Badge color="brand">{value}</Badge> : value}
                      </td>
                    )
                  })}
                  <td className="py-3 pr-5 sm:pr-6">
                    <div className="flex justify-end gap-1">
                      <IconButton
                        size="xs"
                        icon="arrow-up"
                        label={filter ? 'Bỏ lọc để đổi thứ tự' : 'Đưa lên'}
                        onClick={() => move(item.id, -1)}
                        disabled={index === 0 || Boolean(filter)}
                      />
                      <IconButton
                        size="xs"
                        icon="arrow-down"
                        label={filter ? 'Bỏ lọc để đổi thứ tự' : 'Đưa xuống'}
                        onClick={() => move(item.id, 1)}
                        disabled={index === items.length - 1 || Boolean(filter)}
                      />
                      <IconButton size="xs" icon="pencil" label="Sửa" onClick={() => setModal({ mode: 'edit', id: item.id })} />
                      <IconButton
                        size="xs"
                        icon="trash"
                        variant="ghost-danger"
                        label={canDelete ? 'Xoá' : `Phải còn ít nhất ${list.minItems} ${list.itemName}`}
                        disabled={!canDelete}
                        onClick={() => setPendingDelete(item)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-gray-500">
          <Icon name="grid" size={28} className="text-gray-300 dark:text-gray-700" />
          {items.length === 0 ? `Chưa có ${list.itemName} nào.` : 'Không có mục nào khớp bộ lọc.'}
        </div>
      )}

      {modal && (
        <ItemModal
          open
          list={list}
          mode={modal.mode}
          itemId={modal.id}
          onClose={() => setModal(null)}
          onApply={handleApply}
          draft={draft}
          images={images}
          ctx={ctx}
          savedIds={savedIds}
          serverIssues={editingIndex >= 0 ? issuesUnder(issues, `${list.path}.${editingIndex}`) : {}}
          initialShared={modal.mode === 'create' && filter && list.filter ? { [list.filter.field]: filter } : {}}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Xoá ${list.itemName}?`}
        confirmLabel="Xoá khỏi bản nháp"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete.id)}
        message={
          pendingDelete && (
            <>
              <p>
                Xoá <strong className="text-gray-800 dark:text-white/90">{titleOf(pendingDelete)}</strong> khỏi cả bản tiếng Việt và tiếng Anh?
              </p>
              {list.image && <p className="mt-2">Ảnh gắn với mục này cũng được gỡ khi lưu (ảnh vẫn còn trong thư viện).</p>}
              {list.courseDetails && <p className="mt-2">Nội dung popup gốc của khóa học vẫn được giữ trong database.</p>}
              <p className="mt-2">Trang thật chỉ đổi khi bấm Lưu.</p>
            </>
          )
        }
      />
    </Card>
  )
}
