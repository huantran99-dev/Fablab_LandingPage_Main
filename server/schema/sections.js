/**
 * Hợp lệ hoá nội dung bằng Zod.
 *
 * Vì sao Zod chứ không tự viết: `courses.items` là **union phân biệt theo `group`**
 * (nhóm STEM mang `level`/`duration`/`age`, nhóm trải nghiệm mang
 * `stage`/`topic`/`icon`) — `z.discriminatedUnion` diễn tả đúng điều đó, còn tay
 * viết thì sẽ rữa ngay lần đầu có người thêm trường. Ngoài ra `error.issues[].path`
 * khớp thẳng vào ô nhập của form, và `src/admin/` import CÙNG file này nên không
 * có hai định nghĩa trôi lệch nhau.
 *
 * **Bao nhiêu section có schema chặt là bấy nhiêu section sửa được.** Đợt này chỉ
 * mở `testimonials`; các section còn lại cố tình chưa có schema và route sẽ từ chối
 * ghi vào chúng, chứ không im lặng cho qua.
 */
import { z } from 'zod'

/** `id` là khoá tra cứu và React key, không bao giờ dịch. */
export const idSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'id chi duoc dung chu thuong, so va dau gach ngang')

const text = (max = 400) => z.string().trim().min(1, 'khong duoc de trong').max(max)

export const testimonialsSchema = z
  .object({
    eyebrow: text(80),
    title: text(200),
    previous: text(80),
    next: text(80),
    goTo: text(80),
    items: z
      .array(
        z
          .object({
            id: idSchema,
            quote: text(600),
            name: text(120),
            role: text(160),
          })
          .strict(),
      )
      .min(1, 'phai co it nhat mot cam nhan'),
  })
  .strict()

/**
 * `.strict()` ở mọi nơi là có chủ đích: một trường thừa gần như luôn là lỗi đánh
 * máy, và bỏ qua im lặng thì nó nằm trong database mãi mãi mà không ai thấy.
 */
export const SECTION_SCHEMAS = {
  testimonials: testimonialsSchema,
}

export function schemaFor(section) {
  return SECTION_SCHEMAS[section] ?? null
}

/** Danh sách section hiện đã sửa được, dashboard hỏi qua `/api/meta/schema`. */
export const EDITABLE_SECTIONS = Object.keys(SECTION_SCHEMAS)

/** Gom lỗi Zod thành dạng dashboard gắn được vào từng ô nhập. */
export function formatIssues(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}
