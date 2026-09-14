/**
 * Hợp lệ hoá nội dung bằng Zod — đủ cả 12 section.
 *
 * **Bao nhiêu section có schema là bấy nhiêu section sửa được.** Route từ chối ghi
 * vào section không có mặt ở `SECTION_SCHEMAS`, chứ không im lặng cho qua.
 *
 * Schema chỉ lo HÌNH DẠNG của một section. Những luật cắt ngang nhiều section
 * (stage tra được, href trỏ tới neo có thật, đúng một `lead`, trường không dịch
 * bằng nhau giữa hai bản) nằm ở `content/invariants.js` và chạy trên toàn bộ từ
 * điển sau khi ghi — schema không nhìn thấy section khác nên không kiểm nổi.
 *
 * Không schema nào có trường `image`: ảnh không nằm trong JSON section mà ở bảng
 * `binding`, gửi kèm lượt lưu qua trường `images` riêng.
 *
 * `.strict()` ở mọi nơi là có chủ đích: một trường thừa gần như luôn là lỗi đánh
 * máy, và bỏ qua im lặng thì nó nằm trong database mãi mãi mà không ai thấy.
 */
import { z } from 'zod'

// Thông báo mặc định của Zod hiện thẳng dưới ô nhập của dashboard, nên dùng bản
// tiếng Việt có sẵn trong Zod. Cấu hình toàn cục, nhưng chỉ tiến trình máy chủ
// import file này.
z.config(z.locales.vi())

/** `id` là khoá tra cứu và React key, không bao giờ dịch. */
export const idSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'id chi duoc dung chu thuong, so va dau gach ngang')

const text = (max = 400) =>
  z.string().trim().min(1, 'khong duoc de trong').max(max, `toi da ${max} ky tu`)

/** `#` (chưa có đích), `#neo`, link ngoài, email, điện thoại. Neo có thật hay không do invariants kiểm. */
export const hrefSchema = z
  .string()
  .trim()
  .regex(
    /^(#([a-z0-9][a-z0-9-]*)?|https?:\/\/\S+|mailto:\S+|tel:[+\d\s().-]+)$/,
    'href phai la #neo, https://..., mailto: hoac tel:',
  )

const link = z.strictObject({ id: idSchema, label: text(80), href: hrefSchema })
const idLabel = (max = 80) => z.strictObject({ id: idSchema, label: text(max) })

export const heroSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  primaryCta: text(40),
  secondaryCta: text(40),
  imageAlt: text(200),
  // Badge nằm tuyệt đối trên khung ảnh; quá bốn là tràn ra ngoài khung.
  floatingBadges: z.array(idLabel(40)).max(4, 'toi da 4 nhan noi'),
})

export const pillarsSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  items: z.array(z.strictObject({ id: idSchema, title: text(80), description: text(400) })),
})

export const statsSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        label: text(80),
        // Chuỗi đi qua ô nhập text sẽ làm CountUp tính rác — bắt buộc là số.
        value: z.number('phai la so').int('phai la so nguyen').nonnegative('khong duoc am').max(1e9),
        suffix: z.string().trim().max(4, 'toi da 4 ky tu'),
      }),
    )
    .min(1, 'phai co it nhat mot so lieu'),
})

const courseBase = {
  id: idSchema,
  group: idSchema,
  title: text(200),
  description: text(600),
}

/**
 * Hai kiểu thẻ khóa học, render theo trường nào CÓ MẶT (xem CourseCard.jsx):
 * thẻ cấp độ mang `level`/`duration`/`age`, thẻ cấp học mang `stage`/`topic`/`icon`.
 */
const levelCourse = z.strictObject({ ...courseBase, level: idSchema, duration: text(80), age: text(40) })
const stageCourse = z.strictObject({ ...courseBase, stage: idSchema, topic: idSchema, icon: idSchema })

export const coursesSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  cardCta: text(40),
  ageLabel: text(40),
  emptyState: text(200),
  showMore: text(40),
  showLess: text(40),
  filters: z.strictObject({ all: text(40), empty: text(200), stage: text(40), topic: text(40) }),
  modal: z.strictObject({
    overview: text(60),
    knowledge: text(60),
    skills: text(60),
    curriculum: text(60),
    audience: text(60),
    source: text(80),
    register: text(60),
    close: text(40),
    empty: text(200),
    viOnly: text(200),
  }),
  levels: z.record(idSchema, text(40)),
  groups: z
    .array(
      z.strictObject({
        id: idSchema,
        title: text(120),
        description: text(400),
        filterable: z.boolean().optional(),
      }),
    )
    .min(1, 'phai co it nhat mot nhom'),
  stages: z.array(z.strictObject({ id: idSchema, label: text(80), short: text(20) })),
  topics: z.array(idLabel(80)),
  items: z.array(z.union([levelCourse, stageCourse])),
})

export const facilitiesSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  items: z.array(z.strictObject({ id: idSchema, title: text(80), description: text(400) })),
})

export const partnersSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  logoAlt: text(200),
  items: z.array(z.strictObject({ id: idSchema, name: text(160) })),
})

export const activitiesSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  previous: text(60),
  next: text(60),
  goTo: text(60),
  kinds: z.record(idSchema, text(40)),
  groups: z
    .array(
      z.strictObject({
        id: idSchema,
        title: text(120),
        description: text(400),
        kinds: z.array(idSchema),
      }),
    )
    .min(1, 'phai co it nhat mot khoi'),
  items: z.array(
    z.strictObject({
      id: idSchema,
      title: text(200),
      description: text(600),
      // Được để trống: 4 hoạt động thật không có ngày trên trang nguồn, và bịa ra
      // một ngày là sai sự thật. Component đã tự ẩn dòng ngày khi rỗng.
      date: z.string().trim().max(60, 'toi da 60 ky tu'),
      kind: idSchema,
    }),
  ),
})

export const teamSchema = z.strictObject({
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  photoAlt: text(200),
  members: z
    .array(
      z.strictObject({
        id: idSchema,
        name: text(120),
        role: text(120),
        education: text(160),
        // Chỉ `true` hoặc vắng hẳn — giữ hình dạng dữ liệu y như bản seed.
        lead: z.literal(true).optional(),
      }),
    )
    .min(1, 'phai co it nhat mot thanh vien'),
})

export const testimonialsSchema = z.strictObject({
  eyebrow: text(80),
  title: text(200),
  previous: text(80),
  next: text(80),
  goTo: text(80),
  items: z
    .array(z.strictObject({ id: idSchema, quote: text(600), name: text(120), role: text(160) }))
    .min(1, 'phai co it nhat mot cam nhan'),
})

export const finalCtaSchema = z.strictObject({
  title: text(120),
  description: text(400),
  primaryCta: text(40),
  secondaryCta: text(40),
})

/** Mục menu cấp một: hoặc là link (`href`), hoặc là nhánh (`children`) — không bao giờ cả hai. */
const navLink = z.union([
  z.strictObject({ id: idSchema, label: text(60), href: hrefSchema }),
  z.strictObject({ id: idSchema, label: text(60), children: z.array(link).min(1, 'nhanh phai co it nhat mot muc con') }),
])

export const navSchema = z.strictObject({
  brandTagline: text(80),
  cta: text(40),
  openMenu: text(40),
  closeMenu: text(40),
  switchLanguage: text(40),
  links: z.array(navLink).min(1, 'menu phai co it nhat mot muc'),
})

export const footerSchema = z.strictObject({
  description: text(400),
  copyright: text(200),
  columns: z.array(z.strictObject({ id: idSchema, title: text(60), links: z.array(link) })),
  contact: z.strictObject({ title: text(60), address: text(200), email: text(120), phone: text(60) }),
  social: z.strictObject({ title: text(60), items: z.array(link) }),
})

/** Theo thứ tự xuất hiện trên trang — dashboard dùng thứ tự này cho sidebar. */
export const SECTION_SCHEMAS = {
  nav: navSchema,
  hero: heroSchema,
  pillars: pillarsSchema,
  stats: statsSchema,
  courses: coursesSchema,
  facilities: facilitiesSchema,
  partners: partnersSchema,
  activities: activitiesSchema,
  team: teamSchema,
  testimonials: testimonialsSchema,
  finalCta: finalCtaSchema,
  footer: footerSchema,
}

export function schemaFor(section) {
  return Object.hasOwn(SECTION_SCHEMAS, section) ? SECTION_SCHEMAS[section] : null
}

export const EDITABLE_SECTIONS = Object.keys(SECTION_SCHEMAS)

/**
 * Chọn nhánh union "gần đúng nhất" để báo lỗi.
 *
 * Zod báo lỗi union bằng MỌI nhánh lồng nhau. Với khóa học, một thẻ cấp học sai
 * `topic` sẽ kéo theo cả lỗi "thiếu level / thừa stage" của nhánh thẻ cấp độ — đúng
 * về lý thuyết, vô dụng với người sửa. Nhánh ít `unrecognized_keys` nhất là nhánh
 * người dùng định viết; trong số đó lấy nhánh ít lỗi nhất.
 */
function closestBranch(branches) {
  const score = (issues) =>
    issues.filter((issue) => issue.code === 'unrecognized_keys').length * 1000 + issues.length
  return branches.reduce((best, branch) => (score(branch) < score(best) ? branch : best))
}

function flattenIssues(issues, prefix = []) {
  const out = []
  for (const issue of issues) {
    const path = [...prefix, ...issue.path]
    if (issue.code === 'invalid_union' && Array.isArray(issue.errors) && issue.errors.length > 0) {
      out.push(...flattenIssues(closestBranch(issue.errors), path))
      continue
    }
    out.push({ path: path.join('.'), message: issue.message })
  }
  return out
}

/** Gom lỗi Zod thành dạng dashboard gắn được vào từng ô nhập. */
export function formatIssues(error) {
  return flattenIssues(error.issues)
}
