import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { Switch } from '../ui/Field'

/** Bỏ khoá `hidden` (bật lại) — vắng khoá = hiện, giữ đúng hình dạng bản seed. */
function withoutHidden(dict) {
  const { hidden: _hidden, ...rest } = dict
  return rest
}

/**
 * Công tắc hiện / ẩn một khối của trang (descriptor có `toggleable: true`).
 *
 * Ghi `hidden: true` vào CẢ HAI bản trong bản nháp — một công tắc, không có chuyện tiếng Việt
 * ẩn còn tiếng Anh hiện (máy chủ cũng chặn, invariants mục 3f). Chỉ áp khi bấm Lưu, nên "Bỏ
 * thay đổi" huỷ được như mọi chỉnh sửa khác.
 */
export function SectionVisibility({ sectionKey, draft, onChangeDraft }) {
  const shown = draft.vi?.hidden !== true

  const setShown = (next) => {
    onChangeDraft({
      ...draft,
      vi: next ? withoutHidden(draft.vi) : { ...draft.vi, hidden: true },
      en: next ? withoutHidden(draft.en) : { ...draft.en, hidden: true },
    })
  }

  return (
    <Card title="Hiển thị">
      <div className="space-y-4">
        <Switch
          id={`${sectionKey}-visible`}
          checked={shown}
          onChange={setShown}
          label="Hiện section này trên trang công khai"
          description="Tắt để tạm ẩn khối khỏi trang mà không xoá nội dung. Bấm Lưu để áp dụng."
        />
        {!shown && (
          <Alert tone="warning" title="Section đang ẩn">
            Link trong menu, footer và các nút trỏ tới khối này cũng tự ẩn theo. Nội dung vẫn giữ nguyên — bật lại là hiện như cũ.
            {sectionKey === 'hero' && ' Trang sẽ bắt đầu thẳng từ khối kế tiếp.'}
          </Alert>
        )}
      </div>
    </Card>
  )
}
