import { useState } from 'react'

import { Button } from '../ui/Button'
import { FieldHelp } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { MediaPicker } from './MediaPicker'

/**
 * Ảnh của một mục. Chỉ đổi BẢN NHÁP: ảnh đi cùng lượt Lưu của section, nên "Bỏ thay
 * đổi" huỷ luôn việc thay ảnh, và lịch sử khôi phục trả lại cả ảnh.
 */
export function ImageField({ label, hint, optional = false, image, onChange }) {
  const [picking, setPicking] = useState(false)

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">{label}</span>
        {optional && <span className="text-theme-xs text-gray-400">Không bắt buộc</span>}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="bg-checker flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 sm:w-56 dark:border-gray-800">
          {image ? (
            <img src={image.url} alt="" width={image.width} height={image.height} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-theme-xs text-gray-400">
              <Icon name="image" size={28} />
              Chưa có ảnh
            </span>
          )}
        </div>
        <div className="space-y-2 text-sm">
          {image && (
            <p className="text-gray-500 dark:text-gray-400">
              {image.width}×{image.height}px
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" icon="image" onClick={() => setPicking(true)}>
              {image ? 'Đổi ảnh' : 'Chọn ảnh'}
            </Button>
            {image && (
              <Button variant="ghost-danger" icon="trash" onClick={() => onChange(null)}>
                Gỡ ảnh
              </Button>
            )}
          </div>
          <FieldHelp>{hint}</FieldHelp>
        </div>
      </div>

      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        currentId={image?.mediaId}
        onPick={(media) => {
          onChange({ mediaId: media.id, url: media.url, width: media.width, height: media.height })
          setPicking(false)
        }}
      />
    </div>
  )
}
