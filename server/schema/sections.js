/**
 * Hợp lệ hoá nội dung bằng Zod — đủ cả 13 section.
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

import { BUILTIN_MOTIFS, MOTIF_GLYPHS } from '../content/motifs.js'
import { MEMBER_INTERESTS, MEMBER_ROLES } from './registration.js'

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

/**
 * Nút do admin tạo (từ API 23): Hero, thanh menu, cuối trang, nút trong popup tự tạo.
 *
 * `style` là NGỮ NGHĨA (chính / phụ), không phải tên class — component đổi sang variant
 * theo nền nó đứng (FinalCTA nền tối → inverted). Tên class trong dữ liệu thì Tailwind không
 * sinh CSS. Các trường của hành động đều tuỳ chọn ở đây; "hành động nào cần trường nào" và
 * tham chiếu (form / popup / khóa học có thật) là luật cắt ngang section ở invariants.js.
 */
export const BUTTON_STYLES = ['primary', 'secondary']
export const BUTTON_ACTIONS = ['register', 'form', 'popup', 'link']
export const REGISTER_KINDS = ['member', 'course']
export const buttonSchema = z.strictObject({
  id: idSchema,
  label: text(40),
  style: z.enum(BUTTON_STYLES, 'chon kieu nut'),
  arrow: z.literal(true).optional(),
  action: z.enum(BUTTON_ACTIONS, 'chon chuc nang cho nut'),
  // register: vắng = mở tab dùng lần trước; courseId vắng = "chưa chọn khóa, cần tư vấn".
  registerKind: z.enum(REGISTER_KINDS, 'chon loai form dang ky').optional(),
  courseId: idSchema.optional(),
  formId: idSchema.optional(),
  popupId: idSchema.optional(),
  href: hrefSchema.optional(),
})
const buttonList = (max) => z.array(buttonSchema).max(max, `toi da ${max} nut`)

/**
 * Các khối của trang bật/tắt được từ dashboard, theo đúng thứ tự trên trang. Mỗi khối mang
 * khoá `hidden: true` ở cấp trên cùng khi đang tắt; vắng khoá = hiện, nên bản cũ (seed,
 * snapshot, lịch sử) vẫn hợp lệ. Thanh menu, footer, form đăng ký không nằm trong danh sách.
 */
export const TOGGLEABLE_SECTIONS = [
  'hero',
  'stats',
  'facilities',
  'projects',
  'pillars',
  'courses',
  'activities',
  'team',
  'partners',
  'testimonials',
  'finalCta',
]
const visibility = { hidden: z.literal(true, 'chi true hoac vang').optional() }

export const heroSchema = z.strictObject({
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  // Nút cũ (trước API 23): chỉ còn để bản lịch sử cũ vẫn hợp lệ — trang dựng nút từ đây
  // khi vắng `buttons` (legacyButtons trong src/lib/actions.js).
  primaryCta: text(40).optional(),
  secondaryCta: text(40).optional(),
  buttons: buttonList(3).optional(),
  imageAlt: text(200),
  // Badge nằm tuyệt đối trên khung ảnh; quá bốn là tràn ra ngoài khung.
  floatingBadges: z.array(idLabel(40)).max(4, 'toi da 4 nhan noi'),
})

export const pillarsSchema = z.strictObject({
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  // Tiêu đề khối Sứ mệnh (h3, ngang cấp Tầm nhìn / Giá trị cốt lõi). Từ API 11.
  missionTitle: text(80),
  // Tầm nhìn — một câu, hiện trong thẻ pastel.
  vision: z.strictObject({ title: text(80), body: text(400) }),
  // Điểm nhấn dưới câu tầm nhìn. Ở cấp trên cùng chứ không trong `vision` để bản lịch sử
  // cũ (vision chỉ có title/body) vẫn hợp lệ. Từ API 11.
  visionHighlights: z.array(idLabel(60)).max(4, 'toi da 4 diem nhan').optional(),
  valuesTitle: text(80),
  // Giá trị cốt lõi dạng accordion: tên ngắn + mô tả hiện khi bấm mở (từ API 11). Bắt buộc
  // khi ghi (ô dịch để trống thì dashboard gửi "" chứ không bỏ khoá); component vẫn chịu
  // được mục thiếu mô tả từ bản lịch sử cũ — dòng đó thành chữ thường, không bấm được.
  values: z
    .array(z.strictObject({ id: idSchema, title: text(40), description: text(300) }))
    .min(1, 'phai co it nhat mot gia tri cot loi'),
  items: z.array(z.strictObject({ id: idSchema, title: text(80), description: text(400) })),
})

export const statsSchema = z.strictObject({
  ...visibility,
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
// `comingSoon`: khóa đã công bố nhưng chưa mở lớp (nhãn "Sắp ra mắt"). Từ API 21; chỉ `true` hoặc vắng.
const stageCourse = z.strictObject({
  ...courseBase,
  stage: idSchema,
  topic: idSchema,
  icon: idSchema,
  comingSoon: z.literal(true, 'chi true hoac vang').optional(),
})

export const coursesSchema = z.strictObject({
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  cardCta: text(40),
  // Nhãn của khóa có `comingSoon` (từ API 21). Tuỳ chọn: bản lịch sử cũ không có — vắng thì
  // không vẽ nhãn.
  comingSoon: text(40).optional(),
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
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  items: z.array(z.strictObject({ id: idSchema, title: text(80), description: text(400) })),
})

/**
 * Popup thông số từng máy. Máy hiện thành nút trong ô `facilities.items[]` mà
 * `facility` trỏ tới — id ô có thật hay không là luật cắt ngang section, do
 * invariants kiểm (schema chỉ thấy một section).
 *
 * `specs` ĐƯỢC rỗng: ba máy điện tử không có thông số trên trang gốc, popup hiện câu
 * `noSpecs` thay vì bịa số.
 */
export const equipmentSchema = z.strictObject({
  listLabel: text(80),
  openLabel: text(80),
  specsTitle: text(80),
  noSpecs: text(300),
  close: text(40),
  imageAlt: text(200),
  source: text(80),
  sourceUrl: z.url({ protocol: /^https?$/, error: 'phai la duong dan https://...' }),
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        facility: idSchema,
        name: text(120),
        type: text(80),
        specs: z.array(z.strictObject({ id: idSchema, label: text(80), detail: text(300) })).max(30),
      }),
    )
    .min(1, 'phai co it nhat mot thiet bi'),
})

/**
 * Dự án của FabLab. `status` tuỳ chọn, là khoá của `statuses` (khoá có thật hay không
 * do invariants kiểm). Vắng là có chủ đích: trang gốc không ghi trạng thái, và vắng thì
 * card không hiện nhãn — đừng "sửa" thành bắt buộc.
 */
export const projectsSchema = z.strictObject({
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  // Nhãn trợ năng của vòng xoay 3D (nút trước/sau, chấm tròn). Từ API 8.
  previous: text(80),
  next: text(80),
  goTo: text(80),
  statuses: z.record(idSchema, text(40)),
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        title: text(120),
        description: text(400),
        status: idSchema.optional(),
      }),
    )
    .min(1, 'phai co it nhat mot du an'),
})

export const partnersSchema = z.strictObject({
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  logoAlt: text(200),
  items: z.array(z.strictObject({ id: idSchema, name: text(160) })),
})

export const activitiesSchema = z.strictObject({
  ...visibility,
  eyebrow: text(80),
  title: text(120),
  description: text(400),
  imageAlt: text(200),
  previous: text(60),
  next: text(60),
  goTo: text(60),
  // Nút dừng/phát của banner tự chạy (WCAG 2.2.2). Từ API 9.
  pause: text(60),
  play: text(60),
  // Nút "Trở thành thành viên FabLab ngay" (API 18–21). Trang KHÔNG còn dùng từ API 22 (thay
  // bằng `registerCta`); giữ tuỳ chọn để khôi phục bản lịch sử cũ vẫn qua được schema.
  joinMember: text(60).optional(),
  // Nhãn nút đăng ký sự kiện theo `kind` (từ API 22): "Đăng ký cuộc thi / Workshop / hội
  // thảo". Loại không có nhãn thì không có nút. Tuỳ chọn vì bản lịch sử cũ không có.
  registerCta: z.record(idSchema, text(60)).optional(),
  // Popup chi tiết của banner Cuộc thi (từ API 19). Tuỳ chọn cùng lý do: vắng `viewDetails`
  // thì không vẽ nút "Xem chi tiết", vắng `closeDetails` thì mượn nhãn đóng của popup khóa học.
  viewDetails: text(60).optional(),
  detailLink: text(60).optional(),
  closeDetails: text(60).optional(),
  kinds: z.record(idSchema, text(40)),
  groups: z
    .array(
      z.strictObject({
        id: idSchema,
        title: text(120),
        description: text(400),
        kinds: z.array(idSchema),
        // Khối hiện dạng banner video tràn màn hình. Từ API 9. Chỉ `true` hoặc vắng.
        videoBanner: z.boolean().optional(),
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
      // Popup "Xem chi tiết" (từ API 19). Cả hai tuỳ chọn và để trống ở bản seed: trang gốc
      // không có nội dung dài cho cuộc thi — đừng bịa. `details` là chữ dịch, đoạn cách nhau
      // bằng dòng trống; `link` dùng chung (KHÔNG tên `href` — `href` bị buộc trỏ neo có thật).
      details: z.string().trim().max(3000, 'toi da 3000 ky tu').optional(),
      link: z.url({ protocol: /^https?$/, error: 'phai la duong dan https://...' }).optional(),
      // Đóng đăng ký (từ API 22): `true` = ẩn nút đăng ký, máy chủ từ chối lượt gửi. Vắng = đang
      // nhận — mặc định BẬT theo yêu cầu người dùng, sự kiện đã qua thì admin tắt. Dùng chung.
      registerClosed: z.literal(true, 'chi true hoac vang').optional(),
    }),
  ),
})

export const teamSchema = z.strictObject({
  ...visibility,
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
  ...visibility,
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
  ...visibility,
  title: text(120),
  description: text(400),
  // Như hero: hai khoá cũ chỉ còn cho bản lịch sử; từ API 23 nút nằm ở `buttons`.
  primaryCta: text(40).optional(),
  secondaryCta: text(40).optional(),
  buttons: buttonList(3).optional(),
})

/**
 * Chữ của form đăng ký. Section riêng chứ không nằm trong `courses.modal` hay
 * `finalCta`: khôi phục lịch sử ghi lại bản cũ nguyên khối, nên một bản `courses`
 * trước ngày có form sẽ xoá mất các khoá này và trang sập ở `t.register.*`.
 */
export const registerSchema = z.strictObject({
  title: text(80),
  description: text(300),
  course: text(60),
  courseNone: text(80),
  studentHeading: text(60),
  studentName: text(60),
  studentGrade: text(60),
  studentGradeHint: text(80),
  school: text(60),
  parentHeading: text(60),
  parentName: text(60),
  phone: text(60),
  email: text(60),
  note: text(60),
  notePlaceholder: text(120),
  required: text(30),
  optional: text(30),
  consent: text(300),
  privacy: text(800),
  submit: text(40),
  submitting: text(40),
  close: text(30),
  errorSummary: text(120),
  errors: z.strictObject({
    required: text(120),
    phone: text(120),
    email: text(120),
    consent: text(120),
    tooLong: text(120),
    rateLimited: text(200),
    paused: text(200),
    network: text(200),
    // Ba mã của tab Thành viên — từ API 12.
    age: text(200),
    birthYear: text(120),
    role: text(120),
    // Form sự kiện — từ API 22, tuỳ chọn vì bản lịch sử cũ không có.
    event: text(200).optional(),
  }),
  success: z.strictObject({ title: text(80), message: text(300), close: text(30) }),
  // Hai tab của form (từ API 12). Các khoá cấp một phía trên là của tab Khóa học.
  tabs: z.strictObject({ label: text(60), member: text(40), course: text(40) }),
  member: z.strictObject({
    description: text(300),
    ageNote: text(200),
    heading: text(60),
    fullName: text(60),
    birthYear: text(60),
    birthYearHint: text(80),
    role: text(60),
    roleNone: text(60),
    organization: text(60),
    interests: text(60),
    notePlaceholder: text(120),
    consent: text(300),
    privacy: text(800),
  }),
  // Form đăng ký sự kiện (từ API 22). Tuỳ chọn: bản lịch sử cũ không có — thiếu thì trang
  // không vẽ nút đăng ký sự kiện.
  event: z
    .strictObject({
      description: text(300),
      eventLabel: text(60),
      heading: text(60),
      fullName: text(60),
      birthYear: text(60),
      birthYearHint: text(80),
      organization: text(60),
      parentName: text(60),
      parentNote: text(300),
      notePlaceholder: text(120),
      consent: text(400),
      privacy: text(800),
    })
    .optional(),
  // Khoá là id CỐ ĐỊNH trong mã (MEMBER_ROLES / MEMBER_INTERESTS) — strictObject đúng các
  // khoá đó: admin sửa được nhãn, không thêm/bớt được lựa chọn (máy chủ không nhận id lạ).
  memberRoles: z.strictObject(Object.fromEntries(MEMBER_ROLES.map((id) => [id, text(60)]))),
  memberInterests: z.strictObject(Object.fromEntries(MEMBER_INTERESTS.map((id) => [id, text(60)]))),
})

/** Mục menu cấp một: hoặc là link (`href`), hoặc là nhánh (`children`) — không bao giờ cả hai. */
const navLink = z.union([
  z.strictObject({ id: idSchema, label: text(60), href: hrefSchema }),
  z.strictObject({ id: idSchema, label: text(60), children: z.array(link).min(1, 'nhanh phai co it nhat mot muc con') }),
])

export const navSchema = z.strictObject({
  brandTagline: text(80),
  // Nút "Đăng ký ngay" cũ — từ API 23 là `buttons` (tối đa 2: thanh menu hẹp).
  cta: text(40).optional(),
  buttons: buttonList(2).optional(),
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

/** Ngày `YYYY-MM-DD` có thật (31/02 bị từ chối). */
export const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'ngay phai dang YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'ngay khong ton tai')

/** Màu `#rrggbb` — giá trị cho biến CSS, KHÔNG phải tên class (Tailwind không sinh CSS từ dữ liệu). */
export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'mau phai dang #rrggbb')
  .transform((value) => value.toLowerCase())

/**
 * Bộ họa tiết vẽ sẵn bằng mã (src/lib/motifs.js): hạt rơi + vật trang trí trên nút. Bản
 * chép nằm ở server/content/motifs.js (check:content so với `MOTIFS`); ô chọn trong
 * descriptors.js cũng liệt kê — thêm bộ là sửa cả ba.
 */
export const SEASON_MOTIFS = BUILTIN_MOTIFS

/**
 * Sự kiện mùa (Tết, Trung Thu, Noel…): popup quảng cáo + bảng màu của cả trang trong
 * khoảng `start`–`end` (giờ Việt Nam, gồm cả hai đầu). Trang chọn mục ĐẦU TIÊN đang bật
 * và đang trong khoảng ngày. Ảnh popup và ảnh trang trí đi qua bảng `binding` (khe
 * `images` / `decors`), không nằm ở đây. Luật cắt ngang (start ≤ end, nhãn nút khi có
 * nút, tương phản) ở invariants.js.
 */
export const seasonalSchema = z.strictObject({
  close: text(40),
  dismiss: text(40),
  // Nhãn (aria-label) nút bật/tắt hạt rơi ở góc trang.
  effectOff: text(40),
  effectOn: text(40),
  items: z.array(
    z.strictObject({
      id: idSchema,
      name: text(80),
      // Chỉ `true` hoặc vắng hẳn — như `lead` / `filterable`.
      enabled: z.literal(true).optional(),
      // "Hiện ngay, không chờ ngày bắt đầu": bật là trang chính đổi ngay, hết sau `end`.
      now: z.literal(true).optional(),
      popup: z.literal(true).optional(),
      start: dateSchema,
      end: dateSchema,
      title: text(120),
      body: text(500),
      // 'form' / 'popup' từ API 23: mở form / popup tự tạo (`formId` / `popupId`).
      ctaAction: z.enum(['none', 'register', 'link', 'form', 'popup'], 'chon mot hanh dong cho nut'),
      formId: idSchema.optional(),
      popupId: idSchema.optional(),
      // Được rỗng khi không có nút (`ctaAction: 'none'`) — invariants đòi có chữ khi có nút.
      ctaLabel: z.string().trim().max(40, 'toi da 40 ky tu'),
      href: hrefSchema,
      colorPrimary: hexColorSchema.optional(),
      colorSurface: hexColorSchema.optional(),
      colorDark: hexColorSchema.optional(),
      colorAccent: hexColorSchema.optional(),
      // Vắng = không trang trí. `fall` tách riêng: trang trí nút mà không cho hạt rơi.
      // Bộ có sẵn (SEASON_MOTIFS) HOẶC id một họa tiết tự tạo trong `motifs.items` (từ API
      // 17) — luật tồn tại là luật cắt ngang section, nằm ở invariants.js.
      motif: idSchema.optional(),
      fall: z.literal(true).optional(),
    }),
  ),
})

const intIn = (min, max) =>
  z.number('phai la so').int('phai la so nguyen').min(min, `toi thieu ${min}`).max(max, `toi da ${max}`)

/** Hình của một loại hạt: id hình có sẵn (MOTIF_GLYPHS) hoặc `img:<id ảnh>` — tra cứu ở invariants. */
const shapeRefSchema = z.string().regex(/^(img:[a-z0-9][a-z0-9-]*|[a-z][a-zA-Z0-9]*)$/, 'hinh khong hop le')

export const MOTIF_DIRECTIONS = ['down', 'up']
export const MOTIF_MOTIONS = ['spin', 'tilt', 'flip', 'drift']
export const MOTIF_CORNERS = ['left', 'right', 'both']
export { MOTIF_GLYPHS }

/**
 * Thư viện họa tiết tự tạo (từ API 17). Không hiện thành khối nào trên trang: sự kiện mùa
 * trỏ tới một mục ở đây qua `motif`, và trang dựng hạt rơi + vật trang trí từ nó.
 *
 *   shapes  ảnh tải lên (PNG nền trong suốt) — ảnh qua bảng binding, scope `motif-shape`
 *   items   họa tiết: 1–6 loại hạt trộn theo tỉ lệ, mỗi loại là hình có sẵn hoặc ảnh, cộng
 *           cách rơi và vật trang trí trên nút
 *
 * Mọi trường trừ `name` là dùng chung (SHARED_FIELDS). `min ≤ max` và tham chiếu hình kiểm
 * ở invariants.js.
 */
export const motifsSchema = z.strictObject({
  shapes: z.array(z.strictObject({ id: idSchema, name: text(60) })).max(40, 'toi da 40 anh'),
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        name: text(60),
        particles: z
          .array(
            z.strictObject({
              id: idSchema,
              shape: shapeRefSchema,
              // Tỉ lệ tương đối giữa các loại hạt (không cần cộng lại thành 100).
              weight: intIn(1, 100),
              sizeMin: intIn(4, 64),
              sizeMax: intIn(4, 64),
              flap: z.literal(true).optional(),
            }),
          )
          .min(1, 'can it nhat mot loai hat')
          .max(6, 'toi da 6 loai hat'),
        direction: z.enum(MOTIF_DIRECTIONS, 'chon huong roi'),
        motion: z.enum(MOTIF_MOTIONS, 'chon kieu chuyen dong'),
        // px / giây
        speedMin: intIn(2, 200),
        speedMax: intIn(2, 200),
        // Biên độ lắc ngang, px.
        sway: intIn(0, 80),
        // % số hạt so với chuẩn (100 = như bộ có sẵn).
        density: intIn(10, 300),
        // Vắng = không có vật trang trí trên nút.
        ornamentShape: shapeRefSchema.optional(),
        ornamentCorner: z.enum(MOTIF_CORNERS, 'chon goc dat'),
        ornamentSize: intIn(12, 32),
      }),
    )
    .max(40, 'toi da 40 hoa tiet'),
})

/**
 * Popup tự tạo (từ API 23). Chỉ mở khi người xem bấm một nút trỏ tới nó — tự hiện khi vào
 * trang là việc của popup sự kiện mùa. Ảnh qua bảng binding, scope `popup`.
 */
export const popupsSchema = z.strictObject({
  close: text(40),
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        title: text(120),
        // Được rỗng: popup chỉ có ảnh + nút.
        body: z.string().trim().max(1000, 'toi da 1000 ky tu'),
        buttons: buttonList(2),
      }),
    )
    .max(30, 'toi da 30 popup'),
})

/**
 * Form tự tạo (từ API 23). Bài gửi vào bảng `form_submission`, câu trả lời dạng JSON theo
 * id ô — máy chủ dựng schema kiểm động từ chính định nghĩa ở đây (formSubmission.js).
 *
 * Mọi form đều có sẵn ô năm sinh (không nằm trong `fields`): tắt `allowMinors` thì chặn
 * người dưới 16 tuổi, bật thì dưới 16 phải có tên phụ huynh (Nghị định 13/2023).
 */
export const FORM_FIELD_TYPES = ['text', 'textarea', 'phone', 'email', 'number', 'date', 'select', 'multiselect', 'checkbox']
const formFieldSchema = z.strictObject({
  id: idSchema,
  label: text(120),
  help: z.string().trim().max(200, 'toi da 200 ky tu'),
  fieldType: z.enum(FORM_FIELD_TYPES, 'chon loai o'),
  required: z.literal(true).optional(),
  // Chỉ ô chọn một / chọn nhiều — luật "phải có lựa chọn" ở invariants.js.
  options: z.array(idLabel(80)).max(30, 'toi da 30 lua chon').optional(),
})
export const formsSchema = z.strictObject({
  birthYear: text(60),
  birthYearHint: text(120),
  parentName: text(60),
  parentNote: text(300),
  adultOnly: text(200),
  closedMessage: text(200),
  invalid: text(120),
  selectPlaceholder: text(60),
  items: z
    .array(
      z.strictObject({
        id: idSchema,
        title: text(120),
        description: z.string().trim().max(500, 'toi da 500 ky tu'),
        submitLabel: text(40),
        successTitle: text(120),
        successBody: text(500),
        consent: text(400),
        privacy: text(800),
        allowMinors: z.literal(true).optional(),
        closed: z.literal(true).optional(),
        fields: z.array(formFieldSchema).min(1, 'form phai co it nhat mot o').max(20, 'toi da 20 o'),
      }),
    )
    .max(30, 'toi da 30 form'),
})

/** Theo thứ tự xuất hiện trên trang — dashboard dùng thứ tự này cho sidebar. */
export const SECTION_SCHEMAS = {
  nav: navSchema,
  hero: heroSchema,
  stats: statsSchema,
  facilities: facilitiesSchema,
  equipment: equipmentSchema,
  projects: projectsSchema,
  pillars: pillarsSchema,
  courses: coursesSchema,
  activities: activitiesSchema,
  team: teamSchema,
  partners: partnersSchema,
  testimonials: testimonialsSchema,
  finalCta: finalCtaSchema,
  register: registerSchema,
  footer: footerSchema,
  // Không phải một khối trên trang mà là lớp phủ toàn trang (popup + màu) — đứng cuối.
  seasonal: seasonalSchema,
  // Thư viện họa tiết của sự kiện mùa — không hiện thành khối nào, đứng sau cùng.
  motifs: motifsSchema,
  // Nút trỏ tới popup / form tự tạo (API 23) — không phải khối trên trang.
  popups: popupsSchema,
  forms: formsSchema,
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
