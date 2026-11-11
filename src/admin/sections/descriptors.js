/**
 * Mô tả 15 section cho bộ soạn thảo chung, theo đúng thứ tự trên trang (sidebar dùng thứ tự này).
 *
 * Mỗi section là DỮ LIỆU chứ không phải một editor viết tay: trường nào dịch (hai ô
 * VI | EN), trường nào dùng chung (một ô, ghi vào cả hai), danh sách nào thêm/xoá
 * được, mục nào có ảnh. `SectionPage` + `ItemList` dựng mọi thứ từ đây.
 *
 * **Trường dùng chung phải khớp `SHARED_FIELDS` trong server/content/invariants.js.**
 * Máy chủ từ chối lượt lưu có trường không dịch khác nhau giữa hai bản; để một
 * trường như vậy thành hai ô là dựng ra một form chỉ dẫn tới lỗi.
 *
 * Mọi khoá của mục phải được mô tả ở đây: form dựng lại mục CHỈ từ những trường nó
 * biết, nên một khoá thiếu mô tả sẽ bị rơi mất ở lượt lưu kế tiếp (và schema strict
 * của máy chủ sẽ báo nếu thiếu khoá bắt buộc).
 */
import { PARTICLES } from '../../lib/motifs'

const text = (key, label, extra = {}) => ({ key, label, type: 'text', translated: true, ...extra })
const area = (key, label, extra = {}) => ({ key, label, type: 'textarea', translated: true, ...extra })
const href = { key: 'href', label: 'Đường dẫn', type: 'href' }

const eyebrow = text('eyebrow', 'Nhãn nhỏ phía trên tiêu đề')
const title = text('title', 'Tiêu đề')
const description = area('description', 'Mô tả')
const altHelp = (token, what) => `${token} được thay bằng ${what}.`

const courseGroupOptions = (ctx) => (ctx.vi?.groups ?? []).map((group) => ({ value: group.id, label: group.title }))
/** Ô của section Thiết bị — section khác nên phải lấy qua `/meta`, không qua `ctx.vi`. */
const facilityOptions = (ctx) => (ctx.meta?.facilities ?? []).map((facility) => ({ value: facility.id, label: facility.title }))
const statusOptions = (ctx) => Object.entries(ctx.vi?.statuses ?? {}).map(([id, label]) => ({ value: id, label }))

/**
 * Sự kiện mùa. Ngày theo giờ Việt Nam, cùng cách tính với trang (`src/lib/season.js`) —
 * không import file đó vì `check:admin` nạp descriptor bằng Node thuần.
 */
const vnToday = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)
const viDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '—')
/** Trạng thái THẬT trên trang chính — cùng luật `pickSeason` (src/lib/season.js). */
function seasonStatus(item) {
  if (!item.enabled) return 'Đang tắt'
  const today = vnToday()
  if (today > item.end) return 'Đã qua ngày kết thúc'
  if (!item.now && today < item.start) return `Tự hiện từ ${viDate(item.start)}`
  return 'Đang hiện trên trang'
}
/** Màu mặc định của trang (`@theme` trong src/index.css) — chỉ để hiện mẫu khi ô màu trống. */
export const DEFAULT_SEASON_COLORS = {
  colorPrimary: '#1868db',
  colorSurface: '#e9f2fe',
  colorDark: '#123263',
  colorAccent: '#ff613d',
}
const colorField = (key, label, help) => ({ key, label, type: 'color', optional: true, fallback: DEFAULT_SEASON_COLORS[key], help })

/**
 * Họa tiết. Id bộ có sẵn chép ở MOTIFS (src/lib/motifs.js) và server/content/motifs.js —
 * `check:content` so hai bản kia; danh sách này là nhãn tiếng Việt cho ô chọn.
 */
export const BUILTIN_MOTIF_LABELS = {
  snow: 'Tuyết',
  mai: 'Hoa mai vàng',
  dao: 'Hoa đào hồng',
  lantern: 'Đèn lồng (bay lên)',
  confetti: 'Pháo giấy',
  halloween: 'Halloween (dơi, bí ngô)',
}
/** Tên tiếng Anh gợi ý cho bản sao (ô tên EN) khi tạo họa tiết "Bắt đầu từ" bộ có sẵn. */
const BUILTIN_MOTIF_EN = {
  snow: 'Snow',
  mai: 'Apricot blossom',
  dao: 'Peach blossom',
  lantern: 'Lanterns',
  confetti: 'Confetti',
  halloween: 'Halloween',
}
/** Nhãn cho từng hình có sẵn (khoá của `GLYPHS`). */
export const GLYPH_LABELS = {
  snowflake: 'Bông tuyết',
  snowdot: 'Hạt tuyết tròn',
  mai: 'Hoa mai',
  maiPetal: 'Cánh hoa mai',
  dao: 'Hoa đào',
  daoPetal: 'Cánh hoa đào',
  lantern: 'Đèn lồng',
  confettiRect: 'Pháo giấy — mảnh dài (màu phụ)',
  confettiDot: 'Pháo giấy — chấm tròn (màu phụ)',
  confettiCurl: 'Pháo giấy — sợi xoăn (màu phụ)',
  bat: 'Con dơi',
  pumpkin: 'Bí ngô',
}
/** Ô chọn họa tiết của sự kiện: 6 bộ có sẵn + mục của thư viện (qua `/meta` — section khác). */
const seasonMotifOptions = (ctx) => [
  ...Object.entries(BUILTIN_MOTIF_LABELS).map(([value, label]) => ({ value, label, group: 'Có sẵn' })),
  ...(ctx.meta?.motifs?.items ?? []).map((item) => ({ value: item.id, label: item.name, group: 'Tự tạo (mục "Họa tiết")' })),
]
/** Ô chọn hình của loại hạt / vật trang trí: hình có sẵn + ảnh trong CHÍNH bản nháp (cả ảnh chưa lưu). */
const shapeOptions = (ctx) => [
  ...Object.entries(GLYPH_LABELS).map(([value, label]) => ({ value, label, group: 'Hình có sẵn' })),
  ...(ctx.vi?.shapes ?? []).map((shape) => ({ value: `img:${shape.id}`, label: shape.name || shape.id, group: 'Ảnh của bạn (danh sách "Ảnh họa tiết")' })),
]
const usesShape = (motif, id) =>
  (motif.particles ?? []).some((particle) => particle.shape === `img:${id}`) || motif.ornamentShape === `img:${id}`
const number = (key, label, help) => ({ key, label, type: 'number', help })

/** Thông số mặc định của họa tiết mới — trong khoảng schema cho phép, chưa có loại hạt nào. */
const MOTIF_DEFAULTS = {
  particles: [],
  direction: 'down',
  motion: 'spin',
  speedMin: 20,
  speedMax: 40,
  sway: 20,
  density: 100,
  ornamentCorner: 'right',
  ornamentSize: 18,
}

/**
 * Bản sao của một bộ có sẵn ở dạng mục thư viện — "Bắt đầu từ" khi tạo họa tiết mới. Đây là
 * cách "chỉnh bộ có sẵn": 6 bộ gốc không đổi, admin sửa bản sao. Đổi số đo lấy từ
 * `PARTICLES` (tỉ lệ 0–1 → 1–100, mật độ 0–1 → %).
 */
function presetFromBuiltin(id) {
  const config = PARTICLES[id]
  const motion = config.flip ? 'flip' : config.tilt ? 'tilt' : config.spin ? 'spin' : 'drift'
  const lead = config.kinds.find((kind) => kind.toggle) ?? config.kinds[0]
  return {
    particles: config.kinds.map((kind) => ({
      id: slugifyId(kind.glyph),
      shape: kind.glyph,
      weight: Math.max(1, Math.round(kind.weight * 100)),
      sizeMin: kind.size[0],
      sizeMax: kind.size[1],
      ...(kind.flap ? { flap: true } : {}),
    })),
    direction: config.direction < 0 ? 'up' : 'down',
    motion,
    speedMin: config.speed[0],
    speedMax: config.speed[1],
    sway: config.sway[1],
    density: Math.round(config.density * 100),
    ornamentShape: lead.glyph,
    ornamentCorner: 'right',
    ornamentSize: 18,
  }
}
const slugifyId = (glyph) => glyph.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
const kindOptions = (ctx) => Object.entries(ctx.vi?.kinds ?? {}).map(([id, label]) => ({ value: id, label }))

/*
 * Nút do admin tạo (API 23) — một bộ ô cho mọi chỗ có nút: Hero, thanh menu, cuối trang, nút
 * trong popup. Khớp `buttonSchema` (server/schema/sections.js). Ô của hành động chỉ hiện khi
 * đúng hành động (`when`), và ô đang ẩn bị bỏ khoá lúc lưu.
 *
 * Form / popup / khóa học là section KHÁC nên lấy qua `/meta` (dashboard nạp lại sau mỗi lượt
 * Lưu). Riêng nút trong popup chọn popup đích từ CHÍNH bản nháp, để thấy cả popup chưa lưu.
 */
export const BUTTON_ACTION_LABELS = {
  register: 'Mở form đăng ký có sẵn',
  form: 'Mở form tự tạo',
  popup: 'Mở popup',
  link: 'Mở đường dẫn',
}
const formOptions = (ctx) =>
  (ctx.meta?.forms ?? []).map((form) => ({ value: form.id, label: form.closed ? `${form.title} (đang đóng nhận — nút tự ẩn)` : form.title }))
const metaPopupOptions = (ctx) => (ctx.meta?.popups ?? []).map((popup) => ({ value: popup.id, label: popup.title }))
const draftPopupOptions = (ctx) =>
  (ctx.vi?.items ?? []).filter((popup) => popup.id).map((popup) => ({ value: popup.id, label: popup.title || popup.id }))
const metaCourseOptions = (ctx) =>
  (ctx.meta?.courses ?? []).map((course) => ({ value: course.id, label: course.title, group: course.group }))

/** Mô tả ngắn hành động của một nút — cột "Chức năng" của danh sách nút. */
function describeAction(button, ctx) {
  const name = (list, id) => list?.find((entry) => entry.id === id)?.title ?? id
  switch (button.action) {
    case 'register': {
      const course = button.courseId ? ` · ${name(ctx.meta?.courses, button.courseId)}` : ''
      const tab = { course: 'khóa học', member: 'thành viên' }[button.registerKind] ?? 'tab lần trước'
      return `Form đăng ký (${tab})${course}`
    }
    case 'form':
      return `Form: ${name(ctx.meta?.forms, button.formId)}`
    case 'popup':
      return `Popup: ${name(ctx.meta?.popups ?? ctx.vi?.items, button.popupId)}`
    case 'link':
      return button.href
    default:
      return '—'
  }
}

/**
 * @param {{ popupOptions?: (ctx: object) => object[] }} [options]
 */
function buttonFields({ popupOptions = metaPopupOptions } = {}) {
  return [
    text('label', 'Chữ trên nút'),
    {
      key: 'style',
      label: 'Kiểu nút',
      type: 'select',
      options: () => [
        { value: 'primary', label: 'Nút chính (nền đậm)' },
        { value: 'secondary', label: 'Nút phụ (viền)' },
      ],
    },
    { key: 'arrow', label: 'Mũi tên sau chữ', type: 'switch', description: 'Thêm mũi tên → ở cuối nút.' },
    {
      key: 'action',
      label: 'Chức năng khi bấm',
      type: 'select',
      options: () => Object.entries(BUTTON_ACTION_LABELS).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'registerKind',
      label: 'Mở form đăng ký ở tab',
      type: 'select',
      optional: true,
      placeholder: '— Tab người xem dùng lần trước —',
      options: () => [
        { value: 'course', label: 'Đăng ký khóa học' },
        { value: 'member', label: 'Đăng ký thành viên FabLab' },
      ],
      when: { action: ['register'] },
    },
    {
      key: 'courseId',
      label: 'Chọn sẵn khóa học',
      type: 'select',
      optional: true,
      placeholder: '— Không chọn sẵn (người xem tự chọn / cần tư vấn) —',
      options: metaCourseOptions,
      when: { action: ['register'], registerKind: ['course'] },
    },
    {
      key: 'formId',
      label: 'Form mở ra',
      type: 'select',
      options: formOptions,
      help: 'Tạo form ở mục "Form tự tạo". Form đang đóng nhận thì nút tự ẩn khỏi trang.',
      when: { action: ['form'] },
    },
    {
      key: 'popupId',
      label: 'Popup mở ra',
      type: 'select',
      options: popupOptions,
      help: 'Tạo popup ở mục "Popup".',
      when: { action: ['popup'] },
    },
    { ...href, help: 'Neo trên trang (#…) hoặc trang ngoài (https://… — mở ở tab mới).', when: { action: ['link'] } },
  ]
}

/** Danh sách nút của một section. */
const buttonList = ({ maxItems, description }) => ({
  path: 'buttons',
  title: 'Nút',
  description,
  itemName: 'nút',
  titleField: 'label',
  maxItems,
  idHint: 'Id nằm trong số liệu thống kê lượt bấm — đặt ngắn, không đổi được sau khi tạo.',
  createDefaults: { style: 'primary', action: 'register' },
  columns: [
    { label: 'Kiểu', value: (item) => (item.style === 'secondary' ? 'Phụ' : 'Chính') },
    { label: 'Chức năng', value: describeAction },
  ],
  fields: buttonFields(),
})

const FIELD_TYPE_LABELS = {
  text: 'Chữ một dòng',
  textarea: 'Đoạn văn',
  phone: 'Số điện thoại',
  email: 'Email',
  number: 'Số',
  date: 'Ngày',
  select: 'Chọn một',
  multiselect: 'Chọn nhiều',
  checkbox: 'Ô tích (có / không)',
}

export const SECTIONS = [
  {
    key: 'nav',
    label: 'Menu điều hướng',
    icon: 'nav',
    description: 'Thanh menu trên cùng và menu trượt trên điện thoại.',
    notes: [
      'Thêm nhóm khóa học hay khối hoạt động thì neo trên trang tự có, nhưng KHÔNG tự lên menu — phải thêm mục ở đây.',
    ],
    groups: [
      { title: 'Chữ chung', fields: [text('brandTagline', 'Dòng chữ cạnh logo')] },
      {
        title: 'Nhãn trợ năng',
        description: 'Trình đọc màn hình đọc các nhãn này; chúng không hiện ra trên trang.',
        fields: [text('openMenu', 'Mở menu'), text('closeMenu', 'Đóng menu'), text('switchLanguage', 'Chuyển ngôn ngữ')],
      },
    ],
    lists: [
      buttonList({
        maxItems: 2,
        description: 'Nút ở góc phải thanh menu (máy tính, từ màn hình vừa trở lên) và cuối menu trượt trên điện thoại. Tối đa 2 — thanh menu hẹp.',
      }),
      {
        path: 'links',
        title: 'Mục menu',
        itemName: 'mục menu',
        titleField: 'label',
        minItems: 1,
        columns: [
          {
            label: 'Loại',
            value: (item) => (Array.isArray(item.children) ? `Nhánh · ${item.children.length} mục con` : item.href),
          },
        ],
        fields: [text('label', 'Nhãn')],
        variants: {
          label: 'Loại mục',
          detect: (item) => (Array.isArray(item.children) ? 'branch' : 'link'),
          options: [
            { value: 'link', label: 'Link', description: 'Trỏ thẳng tới một neo trên trang hoặc trang ngoài.', fields: [href] },
            {
              value: 'branch',
              label: 'Nhánh có menu con',
              description: 'Không có đường dẫn riêng, chỉ mở ra danh sách mục con.',
              fields: [
                { key: 'children', label: 'Mục con', type: 'sublist', minItems: 1, itemFields: [text('label', 'Nhãn'), href] },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    key: 'hero',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Hero',
    icon: 'hero',
    description: 'Khối đầu tiên người xem nhìn thấy.',
    image: {
      itemId: 'hero',
      label: 'Ảnh hero',
      hint: 'Ảnh ngang khoảng 4:3. Đây là ảnh tải đầu tiên của trang — nên nhẹ.',
    },
    groups: [
      {
        title: 'Nội dung',
        fields: [
          eyebrow,
          title,
          description,
          area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2 }),
        ],
      },
    ],
    lists: [
      buttonList({ maxItems: 3, description: 'Nút dưới đoạn mô tả. Tối đa 3.' }),
      {
        path: 'floatingBadges',
        title: 'Nhãn nổi trên ảnh',
        description: 'Tối đa 4 nhãn — nhiều hơn sẽ tràn khỏi khung ảnh.',
        itemName: 'nhãn',
        titleField: 'label',
        maxItems: 4,
        fields: [text('label', 'Nhãn')],
      },
    ],
  },
  {
    key: 'stats',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Số liệu',
    icon: 'stats',
    description: 'Các con số tự đếm lên khi cuộn tới.',
    groups: [],
    lists: [
      {
        path: 'items',
        title: 'Số liệu',
        itemName: 'số liệu',
        titleField: 'label',
        minItems: 1,
        columns: [{ label: 'Giá trị', value: (item) => `${Number(item.value).toLocaleString('vi-VN')}${item.suffix ?? ''}` }],
        fields: [
          text('label', 'Nhãn'),
          { key: 'value', label: 'Giá trị', type: 'number' },
          { key: 'suffix', label: 'Hậu tố', type: 'text', optional: true, placeholder: '+', help: 'Tối đa 4 ký tự, ví dụ "+" hoặc "%". Có thể để trống.' },
        ],
      },
    ],
  },
  {
    key: 'facilities',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Thiết bị',
    icon: 'facilities',
    description: 'Lưới thiết bị của xưởng.',
    groups: [
      {
        title: 'Chữ chung',
        fields: [eyebrow, title, description, area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2, help: altHelp('{title}', 'tên thiết bị') })],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Thiết bị',
        itemName: 'thiết bị',
        titleField: 'title',
        image: { label: 'Ảnh' },
        idHint: 'Icon và bố cục ô tra theo id. Id mới lấy bố cục theo vòng lặp.',
        fields: [text('title', 'Tên'), area('description', 'Mô tả')],
      },
    ],
  },
  {
    key: 'equipment',
    label: 'Thông số thiết bị',
    icon: 'facilities',
    description: 'Từng máy hiện thành nút trong ô ở section Thiết bị; bấm vào mở popup thông số.',
    notes: [
      'Ô chứa máy chọn ở trường "Thuộc ô". Xoá một ô ở trang Thiết bị khi còn máy trỏ tới là máy chủ từ chối — chuyển máy sang ô khác trước.',
      'Máy không có thông số công bố thì để trống danh sách thông số: popup hiện câu "chưa công bố" thay vì một bảng rỗng. Đừng điền số từ nguồn không chính thức.',
    ],
    groups: [
      {
        title: 'Chữ trên nút',
        fields: [
          text('listLabel', 'Nhãn nhóm nút (trợ năng)', { help: 'Trình đọc màn hình đọc nhãn này cho hàng nút tên máy.' }),
          text('openLabel', 'Tiền tố nút (trợ năng)', { help: 'Đọc trước tên máy, vd. "Xem thông số Cubicon 210F".' }),
        ],
      },
      {
        title: 'Popup',
        fields: [
          text('specsTitle', 'Tiêu đề bảng thông số'),
          area('noSpecs', 'Câu khi máy chưa có thông số', { rows: 2 }),
          text('close', 'Nút đóng (trợ năng)'),
          area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2, help: altHelp('{name}', 'tên máy') }),
          text('source', 'Chữ của link trang gốc'),
          text('sourceUrl', 'Link trang gốc', { help: 'Mỗi ngôn ngữ trỏ tới trang của ngôn ngữ đó.' }),
        ],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Máy',
        itemName: 'máy',
        titleField: 'name',
        minItems: 1,
        image: { label: 'Ảnh máy' },
        idHint: 'Id là khoá tra ảnh. Đặt theo mã máy, vd. cubicon-210f.',
        columns: [
          {
            label: 'Thuộc ô',
            value: (item, ctx) => ctx.meta?.facilities?.find((facility) => facility.id === item.facility)?.title ?? item.facility,
          },
          { label: 'Thông số', value: (item) => (item.specs?.length ? `${item.specs.length} dòng` : 'chưa có') },
        ],
        filter: { label: 'Ô', field: 'facility', options: facilityOptions },
        fields: [
          { key: 'facility', label: 'Thuộc ô', type: 'select', options: facilityOptions, help: 'Máy hiện thành nút trong ô này ở section Thiết bị.' },
          text('name', 'Tên máy'),
          text('type', 'Loại máy'),
          {
            key: 'specs',
            label: 'Thông số kỹ thuật',
            type: 'sublist',
            itemFields: [text('label', 'Tên thông số'), text('detail', 'Giá trị')],
          },
        ],
      },
    ],
  },
  {
    key: 'projects',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Dự án',
    icon: 'grid',
    description: 'Lưới dự án làm ra từ xưởng, ngay sau section Thiết bị.',
    notes: [
      'Trạng thái để trống thì card không hiện nhãn. Trang gốc của trường không ghi dự án nào đang làm hay đã xong — chỉ đánh dấu khi chắc chắn.',
    ],
    groups: [
      {
        title: 'Chữ chung',
        fields: [eyebrow, title, description, area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2, help: altHelp('{title}', 'tên dự án') })],
      },
      {
        title: 'Nhãn trợ năng',
        description: 'Trình đọc màn hình đọc các nhãn này cho nút xoay và chấm tròn của vòng dự án 3D.',
        fields: [text('previous', 'Nút lùi'), text('next', 'Nút tiến'), text('goTo', 'Nhãn chấm tròn', { help: 'Đọc kèm số thứ tự, vd. "Xem dự án số 3".' })],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Dự án',
        itemName: 'dự án',
        titleField: 'title',
        minItems: 1,
        image: { label: 'Ảnh' },
        idHint: 'Id là khoá tra ảnh. Đặt theo tên dự án không dấu, vd. vuon-thuy-canh.',
        columns: [{ label: 'Trạng thái', value: (item, ctx) => (item.status ? (ctx.vi?.statuses?.[item.status] ?? item.status) : '—') }],
        filter: { label: 'Trạng thái', field: 'status', options: statusOptions },
        fields: [
          text('title', 'Tên dự án'),
          area('description', 'Mô tả'),
          {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            optional: true,
            placeholder: '— Không hiện nhãn —',
            options: statusOptions,
            help: 'Để trống nếu chưa chắc. Danh sách trạng thái sửa ở mục "Trạng thái" bên dưới.',
          },
        ],
      },
    ],
    records: [{ path: 'statuses', title: 'Trạng thái', description: 'Nhãn hiện trên card dự án.', itemName: 'trạng thái' }],
  },
  {
    key: 'pillars',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Trụ cột',
    icon: 'pillars',
    description: 'Section Về chúng tôi: ba khối ngang cấp Sứ mệnh (3 trụ cột), Tầm nhìn và Giá trị cốt lõi.',
    groups: [
      {
        title: 'Chữ chung',
        fields: [eyebrow, title, description],
      },
      {
        title: 'Sứ mệnh',
        description: 'Tiêu đề khối đứng trên ba thẻ trụ cột. Các trụ cột sửa ở danh sách bên dưới.',
        fields: [text('missionTitle', 'Tiêu đề khối')],
      },
      {
        title: 'Tầm nhìn',
        description: 'Điểm nhấn dưới câu tầm nhìn sửa ở danh sách bên dưới.',
        fields: [text('vision.title', 'Tiêu đề khối'), area('vision.body', 'Câu tầm nhìn', { rows: 2 })],
      },
      {
        title: 'Giá trị cốt lõi',
        description: 'Các giá trị sửa ở danh sách bên dưới.',
        fields: [text('valuesTitle', 'Tiêu đề khối')],
      },
    ],
    lists: [
      {
        path: 'visionHighlights',
        title: 'Điểm nhấn tầm nhìn',
        itemName: 'điểm nhấn',
        titleField: 'label',
        columns: [{ label: 'Id', value: (item) => item.id }],
        fields: [text('label', 'Nhãn ngắn')],
      },
      {
        path: 'items',
        title: 'Trụ cột sứ mạng',
        itemName: 'trụ cột',
        titleField: 'title',
        preview: 'pillar',
        idHint: 'Icon và màu thẻ tra theo id. Id mới không có icon riêng và lấy màu theo vòng lặp.',
        fields: [text('title', 'Tên'), area('description', 'Mô tả')],
      },
      {
        path: 'values',
        title: 'Giá trị cốt lõi',
        itemName: 'giá trị',
        titleField: 'title',
        columns: [{ label: 'Id', value: (item) => item.id }],
        fields: [text('title', 'Tên ngắn (1 cụm từ)'), area('description', 'Mô tả (hiện khi bấm mở)', { rows: 3 })],
      },
    ],
  },
  {
    key: 'courses',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Khóa học',
    icon: 'courses',
    description: 'Hai nhóm khóa học, bộ lọc và nội dung popup chi tiết.',
    groups: [
      {
        title: 'Chữ chung',
        fields: [
          eyebrow,
          title,
          description,
          text('cardCta', 'Nút trên thẻ'),
          text('comingSoon', 'Nhãn "Sắp ra mắt"', { help: 'Hiện trên thẻ và popup của khóa bật "Sắp ra mắt".' }),
          text('ageLabel', 'Nhãn độ tuổi'),
          text('showMore', 'Nút xem thêm'),
          text('showLess', 'Nút thu gọn'),
          text('emptyState', 'Khi nhóm không có khóa học'),
          area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2, help: altHelp('{title}', 'tên khóa học') }),
        ],
      },
      {
        title: 'Bộ lọc',
        fields: [
          text('filters.all', 'Chip "tất cả"'),
          text('filters.stage', 'Nhãn hàng cấp học'),
          text('filters.topic', 'Nhãn hàng chủ đề'),
          text('filters.empty', 'Khi lọc không ra kết quả'),
        ],
      },
      {
        title: 'Nhãn trong popup chi tiết',
        collapsible: true,
        fields: [
          text('modal.overview', 'Tổng quan'),
          text('modal.knowledge', 'Kiến thức'),
          text('modal.skills', 'Kỹ năng'),
          text('modal.curriculum', 'Giáo trình'),
          text('modal.audience', 'Đối tượng'),
          text('modal.source', 'Liên kết nguồn'),
          text('modal.register', 'Nút đăng ký'),
          text('modal.close', 'Nút đóng'),
          text('modal.empty', 'Khi chưa có nội dung'),
          text('modal.viOnly', 'Khi chỉ có tiếng Việt'),
        ],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Khóa học',
        itemName: 'khóa học',
        titleField: 'title',
        image: { label: 'Ảnh thẻ', hint: 'Khung thẻ 760×320 (khoảng 2,4:1), ảnh bị cắt giữa để lấp khung.' },
        courseDetails: true,
        filter: { label: 'Nhóm', field: 'group', options: courseGroupOptions },
        columns: [
          { label: 'Nhóm', value: (item, ctx) => ctx.vi?.groups?.find((group) => group.id === item.group)?.title ?? item.group },
          {
            label: 'Phân loại',
            value: (item, ctx) =>
              item.stage
                ? (ctx.vi?.stages?.find((stage) => stage.id === item.stage)?.short ?? item.stage)
                : (ctx.vi?.levels?.[item.level] ?? item.level),
          },
        ],
        fields: [
          { key: 'group', label: 'Nhóm', type: 'select', options: courseGroupOptions },
          text('title', 'Tên khóa học'),
          area('description', 'Mô tả ngắn trên thẻ'),
        ],
        variants: {
          label: 'Kiểu thẻ',
          detect: (item) => ('stage' in item || 'topic' in item || 'icon' in item ? 'stage' : 'level'),
          options: [
            {
              value: 'stage',
              label: 'Thẻ cấp học',
              description: 'Chip TH / THCS / THPT, chip chủ đề và icon tự chọn.',
              fields: [
                {
                  key: 'stage',
                  label: 'Cấp học',
                  type: 'select',
                  options: (ctx) => (ctx.vi?.stages ?? []).map((stage) => ({ value: stage.id, label: `${stage.short} — ${stage.label}` })),
                },
                {
                  key: 'topic',
                  label: 'Chủ đề',
                  type: 'select',
                  options: (ctx) => (ctx.vi?.topics ?? []).map((topic) => ({ value: topic.id, label: topic.label })),
                },
                { key: 'icon', label: 'Icon', type: 'icon' },
                {
                  key: 'comingSoon',
                  label: 'Sắp ra mắt',
                  type: 'switch',
                  description: 'Khóa đã công bố nhưng chưa mở lớp: thẻ và popup có nhãn "Sắp ra mắt". Vẫn nhận đăng ký.',
                },
              ],
            },
            {
              value: 'level',
              label: 'Thẻ cấp độ',
              description: 'Chip cấp độ, thời lượng và độ tuổi. Icon tra theo id khóa học.',
              fields: [
                {
                  key: 'level',
                  label: 'Cấp độ',
                  type: 'select',
                  options: (ctx) => Object.entries(ctx.vi?.levels ?? {}).map(([id, label]) => ({ value: id, label })),
                },
                text('duration', 'Thời lượng'),
                text('age', 'Độ tuổi'),
              ],
            },
          ],
        },
      },
      {
        path: 'groups',
        title: 'Nhóm khóa học',
        itemName: 'nhóm',
        titleField: 'title',
        minItems: 1,
        idHint: 'Neo #courses-<id> sinh từ id nhóm. Thêm nhóm KHÔNG tự lên menu.',
        columns: [{ label: 'Bộ lọc', value: (item) => (item.filterable ? 'Có' : 'Không') }],
        fields: [
          text('title', 'Tên nhóm'),
          area('description', 'Mô tả'),
          { key: 'filterable', label: 'Có bộ lọc', type: 'switch', description: 'Hiện hai hàng chip cấp học / chủ đề phía trên nhóm.' },
        ],
      },
      {
        path: 'stages',
        title: 'Cấp học',
        itemName: 'cấp học',
        titleField: 'label',
        columns: [{ label: 'Chip', value: (item) => item.short }],
        fields: [text('label', 'Tên đầy đủ'), text('short', 'Tên viết tắt trên chip')],
      },
      {
        path: 'topics',
        title: 'Chủ đề',
        itemName: 'chủ đề',
        titleField: 'label',
        fields: [text('label', 'Tên chủ đề')],
      },
    ],
    records: [{ path: 'levels', title: 'Cấp độ', description: 'Dùng cho thẻ cấp độ.', itemName: 'cấp độ' }],
  },
  {
    key: 'activities',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Hoạt động',
    icon: 'activities',
    description: 'Cuộc thi (banner video tràn màn hình) và sự kiện, hội thảo (banner ảnh) — tự chạy.',
    groups: [
      {
        title: 'Chữ chung',
        fields: [
          eyebrow,
          title,
          description,
          text('previous', 'Nút lùi'),
          text('next', 'Nút tiến'),
          text('goTo', 'Nhãn vạch tiến trình'),
          text('pause', 'Nút tạm dừng'),
          text('play', 'Nút phát'),
          text('viewDetails', 'Nút "Xem chi tiết" (banner Cuộc thi)', { help: 'Bấm vào mở popup chi tiết của cuộc thi đang hiện.' }),
          text('detailLink', 'Link trang ngoài trong popup cuộc thi', { help: 'Chỉ hiện khi cuộc thi có "Link trang cuộc thi".' }),
          text('closeDetails', 'Nút đóng popup cuộc thi'),
          text('timeLabel', 'Nhãn đọc của dòng thời gian', { help: 'Đọc cho trình đọc màn hình trước giờ diễn ra trên thẻ sự kiện (mắt thường thấy icon đồng hồ).' }),
          text('venueLabel', 'Nhãn đọc của dòng địa điểm'),
          text('feeLabel', 'Nhãn đọc của dòng chi phí'),
          area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2, help: altHelp('{title}', 'tên hoạt động') }),
        ],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Hoạt động',
        itemName: 'hoạt động',
        titleField: 'title',
        image: { label: 'Ảnh / poster', hint: 'Hiển thị trọn khung, không cắt — poster dọc vẫn ổn. Đọc nội dung poster, đừng tin tên file.' },
        video: {
          label: 'Video nền',
          optional: true,
          hint: 'Chỉ hiện ở khối bật "Banner video" (Cuộc thi). MP4 H.264, nên 10–30 giây, dưới ~15 MB; tiếng bị tắt. Không có video thì banner dùng ảnh poster làm nền.',
        },
        filter: { label: 'Loại', field: 'kind', options: kindOptions },
        columns: [
          { label: 'Loại', value: (item, ctx) => ctx.vi?.kinds?.[item.kind] ?? item.kind },
          { label: 'Ngày', value: (item) => item.date || '—' },
          {
            label: 'Đăng ký',
            value: (item, ctx) => (!ctx.vi?.registerCta?.[item.kind] ? '—' : item.registerClosed ? 'Đóng' : 'Mở'),
          },
        ],
        fields: [
          { key: 'kind', label: 'Loại', type: 'select', options: kindOptions, help: 'Hoạt động hiện ở khối nào là do loại quyết định.' },
          text('title', 'Tên hoạt động'),
          text('date', 'Ngày', { optional: true, placeholder: '6/6/2026', help: 'Để trống nếu nguồn không ghi ngày — đừng đoán.' }),
          area('description', 'Mô tả'),
          text('time', 'Thời gian', {
            optional: true,
            omitEmpty: true,
            placeholder: 'Thứ Tư, 14:00–16:00',
            help: 'Hiện dưới mô tả kèm icon đồng hồ (khối Sự kiện). Ngày đã nằm ở ô "Ngày". Để trống nếu nguồn không ghi — đừng đoán.',
          }),
          text('venue', 'Địa điểm', { optional: true, omitEmpty: true, placeholder: 'Phòng 305.B11, EIU FabLab', help: 'Để trống nếu không có.' }),
          text('fee', 'Chi phí', { optional: true, omitEmpty: true, placeholder: '35.000 đ/người (đã gồm vật tư)', help: 'Để trống nếu miễn phí hoặc nguồn không ghi.' }),
          area('details', 'Nội dung chi tiết (popup "Xem chi tiết")', {
            optional: true,
            omitEmpty: true,
            rows: 6,
            help: 'Chỉ hiện ở khối Cuộc thi. Mỗi đoạn cách nhau một dòng trống. Để trống nếu chưa có — đừng đoán; popup vẫn hiện poster và mô tả.',
          }),
          {
            key: 'link',
            label: 'Link trang cuộc thi',
            type: 'text',
            optional: true,
            omitEmpty: true,
            placeholder: 'https://…',
            help: 'Bài đăng hoặc form đăng ký cuộc thi. Một link cho cả hai ngôn ngữ, mở ở tab mới.',
          },
          {
            key: 'registerClosed',
            label: 'Đóng đăng ký',
            type: 'switch',
            description:
              'Bật khi sự kiện đã qua hoặc đã đủ người: ẩn nút "Đăng ký…" trên slide và trong popup, máy chủ từ chối lượt gửi. Tắt (mặc định) = đang nhận đăng ký.',
          },
        ],
      },
      {
        path: 'groups',
        title: 'Khối',
        itemName: 'khối',
        titleField: 'title',
        minItems: 1,
        idHint: 'Id khối là neo trên trang (ví dụ #competitions) và menu có thể đang trỏ tới.',
        columns: [
          { label: 'Gồm loại', value: (item, ctx) => (item.kinds ?? []).map((kind) => ctx.vi?.kinds?.[kind] ?? kind).join(', ') || '—' },
          { label: 'Dạng', value: (item) => (item.videoBanner ? 'Banner video' : 'Banner ảnh') },
        ],
        fields: [
          text('title', 'Tên khối'),
          area('description', 'Mô tả'),
          { key: 'kinds', label: 'Loại hoạt động thuộc khối này', type: 'multiselect', options: kindOptions, optional: true },
          {
            key: 'videoBanner',
            label: 'Banner video tràn màn hình',
            type: 'switch',
            description: 'Nền là video gắn ở từng hoạt động (mục "Video nền"); hoạt động chưa có video dùng ảnh poster.',
          },
        ],
      },
    ],
    records: [
      { path: 'kinds', title: 'Loại hoạt động', description: 'Nhãn chip trên từng hoạt động.', itemName: 'loại' },
      {
        path: 'registerCta',
        title: 'Nút đăng ký theo loại',
        description:
          'Khoá là id loại hoạt động (competition, workshop, seminar…), chữ là nhãn nút trên từng slide — cũng là tiêu đề form đăng ký. Loại không có dòng ở đây thì không có nút (lễ hợp tác cố ý không có).',
        itemName: 'nút',
        deleteHelp: 'Xoá một dòng là ẩn nút đăng ký của mọi hoạt động thuộc loại đó (form không còn mở được cho loại này).',
      },
    ],
  },
  {
    key: 'team',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Đội ngũ',
    icon: 'team',
    description: 'Thẻ giám đốc và hai dải thành viên chạy ngang.',
    notes: [
      'Người thật: chỉ dùng ảnh của chính người đó. Không có ảnh thì để trống — trang hiện chữ cái đầu. Gán nhầm ảnh là bịa danh tính.',
    ],
    groups: [
      { title: 'Chữ chung', fields: [eyebrow, title, description, text('photoAlt', 'Mô tả ảnh (alt)', { help: altHelp('{name}', 'họ tên') })] },
    ],
    lists: [
      {
        path: 'members',
        title: 'Thành viên',
        itemName: 'thành viên',
        titleField: 'name',
        image: { label: 'Ảnh chân dung', optional: true, hint: 'Ảnh vuông, mặt ở giữa, cắt sẵn trước khi tải lên — khung hiển thị bo tròn.' },
        columns: [
          { label: 'Chức danh', value: (item) => item.role },
          { label: '', value: (item) => (item.lead ? 'Giám đốc' : ''), badge: true },
        ],
        fields: [
          { key: 'name', label: 'Họ tên', type: 'text', help: 'Tên người không dịch — một ô dùng cho cả hai ngôn ngữ.' },
          text('role', 'Chức danh'),
          text('education', 'Học vị / chuyên ngành'),
          {
            key: 'lead',
            label: 'Thẻ riêng phía trên (giám đốc)',
            type: 'exclusive',
            description: 'Chỉ một người. Bật ở đây sẽ tắt ở người đang giữ.',
          },
        ],
      },
    ],
  },
  {
    key: 'partners',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Đối tác',
    icon: 'partners',
    description: 'Dải logo đối tác chạy ngang.',
    notes: [
      'Chỉ gắn logo lấy từ nguồn chính thức của chính tổ chức đó. Không có logo thì để trống — trang hiện tên bằng chữ. Gán nhầm logo là gán sai nhận diện một tổ chức có thật.',
    ],
    groups: [
      {
        title: 'Chữ chung',
        fields: [eyebrow, title, description, text('logoAlt', 'Mô tả logo (alt)', { help: altHelp('{name}', 'tên đối tác') })],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Đối tác',
        itemName: 'đối tác',
        titleField: 'name',
        image: { label: 'Logo', optional: true, hint: 'PNG nền trong suốt, cao tối thiểu 64px.' },
        fields: [text('name', 'Tên tổ chức')],
      },
    ],
  },
  {
    key: 'testimonials',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Cảm nhận',
    icon: 'testimonials',
    description: 'Carousel trích dẫn.',
    groups: [
      {
        title: 'Chữ chung',
        fields: [eyebrow, title, text('previous', 'Nút lùi'), text('next', 'Nút tiến'), text('goTo', 'Nhãn chấm tròn')],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Cảm nhận',
        itemName: 'cảm nhận',
        titleField: 'name',
        subtitleField: 'quote',
        minItems: 1,
        fields: [area('quote', 'Trích dẫn', { rows: 4 }), text('name', 'Người nói'), text('role', 'Vai trò')],
      },
    ],
  },
  {
    key: 'finalCta',
    // Công tắc hiện / ẩn khối trên trang (thẻ "Hiển thị" — SectionVisibility).
    toggleable: true,
    label: 'Kêu gọi cuối trang',
    icon: 'finalCta',
    description: 'Khối kêu gọi đăng ký phía trên chân trang.',
    groups: [
      {
        title: 'Nội dung',
        fields: [title, description],
      },
    ],
    lists: [
      buttonList({
        maxItems: 3,
        description: 'Tối đa 3. Khối này nền tối: nút chính là nền trắng, nút phụ là viền trắng.',
      }),
    ],
  },
  {
    key: 'register',
    label: 'Form đăng ký',
    icon: 'register',
    description:
      'Chữ của form đăng ký (popup mở từ nút "Đăng ký"): hai tab Thành viên FabLab và Khóa học, cộng form sự kiện mở từ nút "Đăng ký cuộc thi / Workshop / hội thảo".',
    notes: [
      '{email} và {phone} được thay bằng email / số điện thoại ở mục Liên hệ của Chân trang; {count} là số mục còn lỗi. Giữ nguyên các dấu ngoặc nhọn.',
      'Đoạn "Thông báo quyền riêng tư" là thông báo xử lý dữ liệu cá nhân theo Nghị định 13/2023 — nêu mục đích, bên quản lý, thời hạn lưu, quyền yêu cầu xoá. Thời hạn ghi ở đây phải khớp REGISTRATION_RETENTION_DAYS trên máy chủ (mặc định 365 ngày).',
      'Chữ đồng ý người gửi nhìn thấy được lưu nguyên văn vào từng lượt đăng ký, làm bằng chứng — sửa câu chữ không làm đổi các lượt đã gửi.',
      'Tab Thành viên dành cho người từ 16 tuổi (máy chủ kiểm năm sinh). Hai bảng "Đối tượng" và "Lĩnh vực quan tâm" chỉ sửa được nhãn — lựa chọn cố định trong mã.',
      'Form sự kiện nhận mọi lứa tuổi: người tham gia dưới 16 tuổi thì form hiện thêm ô "Họ tên phụ huynh" (bắt buộc) — phụ huynh điền và đồng ý thay. Tiêu đề form là nhãn nút ở section Hoạt động.',
    ],
    groups: [
      {
        title: 'Tiêu đề và tab',
        fields: [
          title,
          text('tabs.label', 'Tên nhóm tab (trình đọc màn hình)'),
          text('tabs.member', 'Tab thành viên'),
          text('tabs.course', 'Tab khóa học'),
        ],
      },
      {
        title: 'Tab Khóa học — mô tả, khóa học và học viên',
        fields: [
          area('description', 'Mô tả ngắn', { rows: 2 }),
          text('course', 'Nhãn ô chọn khóa học'),
          text('courseNone', 'Lựa chọn "chưa chọn khóa"'),
          text('studentHeading', 'Tiêu đề nhóm học viên'),
          text('studentName', 'Nhãn: họ tên học viên'),
          text('studentGrade', 'Nhãn: năm sinh / lớp'),
          text('studentGradeHint', 'Gợi ý dưới ô năm sinh / lớp'),
          text('school', 'Nhãn: trường'),
        ],
      },
      {
        title: 'Phụ huynh',
        fields: [
          text('parentHeading', 'Tiêu đề nhóm phụ huynh'),
          text('parentName', 'Nhãn: họ tên phụ huynh'),
          text('phone', 'Nhãn: số điện thoại'),
          text('email', 'Nhãn: email'),
          text('note', 'Nhãn: ghi chú'),
          text('notePlaceholder', 'Chữ mờ trong ô ghi chú'),
        ],
      },
      {
        title: 'Đồng ý và quyền riêng tư',
        fields: [
          area('consent', 'Câu đồng ý (cạnh ô tích)', { rows: 2 }),
          area('privacy', 'Thông báo quyền riêng tư', { rows: 4, help: altHelp('{email}', 'email liên hệ') }),
        ],
      },
      {
        title: 'Tab Thành viên FabLab',
        fields: [
          area('member.description', 'Mô tả ngắn', { rows: 2 }),
          area('member.ageNote', 'Ghi chú độ tuổi', { rows: 2 }),
          text('member.heading', 'Tiêu đề nhóm thông tin'),
          text('member.fullName', 'Nhãn: họ tên'),
          text('member.birthYear', 'Nhãn: năm sinh'),
          text('member.birthYearHint', 'Gợi ý dưới ô năm sinh'),
          text('member.role', 'Nhãn: đối tượng'),
          text('member.roleNone', 'Lựa chọn trống của ô đối tượng'),
          text('member.organization', 'Nhãn: trường / đơn vị'),
          text('member.interests', 'Tiêu đề nhóm lĩnh vực quan tâm'),
          text('member.notePlaceholder', 'Chữ mờ trong ô ghi chú'),
          area('member.consent', 'Câu đồng ý (cạnh ô tích)', { rows: 2 }),
          area('member.privacy', 'Thông báo quyền riêng tư', { rows: 4, help: altHelp('{email}', 'email liên hệ') }),
        ],
      },
      {
        title: 'Form sự kiện (cuộc thi, workshop, hội thảo)',
        fields: [
          area('event.description', 'Mô tả ngắn', { rows: 2 }),
          text('event.eventLabel', 'Nhãn trên ô tên sự kiện'),
          text('event.heading', 'Tiêu đề nhóm thông tin'),
          text('event.fullName', 'Nhãn: họ tên người tham gia'),
          text('event.birthYear', 'Nhãn: năm sinh'),
          text('event.birthYearHint', 'Gợi ý dưới ô năm sinh'),
          text('event.organization', 'Nhãn: trường / đơn vị'),
          text('event.parentName', 'Nhãn: họ tên phụ huynh (dưới 16 tuổi)'),
          area('event.parentNote', 'Ghi chú cho phụ huynh (dưới 16 tuổi)', { rows: 2 }),
          text('event.notePlaceholder', 'Chữ mờ trong ô ghi chú'),
          area('event.consent', 'Câu đồng ý (cạnh ô tích)', {
            rows: 3,
            help: 'Một câu cho cả người tự đăng ký lẫn phụ huynh đăng ký thay — câu này được lưu nguyên văn làm bằng chứng.',
          }),
          area('event.privacy', 'Thông báo quyền riêng tư', { rows: 4, help: altHelp('{email}', 'email liên hệ') }),
        ],
      },
      {
        title: 'Nút và nhãn chung',
        fields: [
          text('submit', 'Nút gửi'),
          text('submitting', 'Nút gửi — lúc đang gửi'),
          text('close', 'Nhãn nút đóng (trình đọc màn hình)'),
          text('required', 'Chữ "bắt buộc"'),
          text('optional', 'Chữ "không bắt buộc"'),
        ],
      },
      {
        title: 'Thông báo lỗi',
        collapsible: true,
        fields: [
          text('errorSummary', 'Hộp tóm tắt lỗi', { help: altHelp('{count}', 'số mục còn lỗi') }),
          text('errors.required', 'Bỏ trống ô bắt buộc'),
          text('errors.phone', 'Số điện thoại sai'),
          text('errors.email', 'Email sai'),
          text('errors.consent', 'Chưa tích đồng ý'),
          text('errors.tooLong', 'Nội dung quá dài'),
          text('errors.rateLimited', 'Gửi quá nhiều lần'),
          text('errors.paused', 'Tạm ngưng nhận đăng ký', { help: altHelp('{phone}', 'số điện thoại liên hệ') }),
          text('errors.network', 'Lỗi mạng / máy chủ', { help: altHelp('{phone}', 'số điện thoại liên hệ') }),
          text('errors.age', 'Thành viên chưa đủ 16 tuổi'),
          text('errors.birthYear', 'Năm sinh sai'),
          text('errors.role', 'Chưa chọn đối tượng'),
          text('errors.event', 'Sự kiện đã đóng đăng ký'),
        ],
      },
      {
        title: 'Gửi thành công',
        fields: [text('success.title', 'Tiêu đề'), area('success.message', 'Lời nhắn', { rows: 2 }), text('success.close', 'Nút đóng')],
      },
    ],
    lists: [],
    records: [
      { path: 'memberRoles', title: 'Đối tượng (tab Thành viên)', description: 'Ô "Bạn là". Lựa chọn cố định, chỉ sửa nhãn.', itemName: 'đối tượng', fixed: true },
      { path: 'memberInterests', title: 'Lĩnh vực quan tâm (tab Thành viên)', description: 'Các ô tích chọn nhiều. Lựa chọn cố định, chỉ sửa nhãn.', itemName: 'lĩnh vực', fixed: true },
    ],
  },
  {
    key: 'footer',
    label: 'Chân trang',
    icon: 'footer',
    description: 'Cột liên kết, liên hệ và mạng xã hội.',
    groups: [
      { title: 'Chữ chung', fields: [area('description', 'Mô tả'), text('copyright', 'Dòng bản quyền')] },
      {
        title: 'Liên hệ',
        fields: [
          text('contact.title', 'Tiêu đề cột'),
          area('contact.address', 'Địa chỉ', { rows: 2 }),
          text('contact.email', 'Email'),
          text('contact.phone', 'Điện thoại'),
        ],
      },
      { title: 'Mạng xã hội', fields: [text('social.title', 'Tiêu đề cột')] },
    ],
    lists: [
      {
        path: 'columns',
        title: 'Cột liên kết',
        itemName: 'cột',
        titleField: 'title',
        columns: [{ label: 'Liên kết', value: (item) => `${item.links?.length ?? 0} liên kết` }],
        fields: [
          text('title', 'Tiêu đề cột'),
          { key: 'links', label: 'Liên kết', type: 'sublist', itemFields: [text('label', 'Nhãn'), href] },
        ],
      },
      {
        path: 'social.items',
        title: 'Kênh mạng xã hội',
        itemName: 'kênh',
        titleField: 'label',
        columns: [{ label: 'Đường dẫn', value: (item) => item.href }],
        fields: [text('label', 'Tên kênh'), href],
      },
    ],
  },
  {
    key: 'seasonal',
    label: 'Sự kiện mùa',
    icon: 'sparkles',
    description: 'Tết, Trung Thu, Noel…: popup quảng cáo khi vào trang và bảng màu của cả trang trong khoảng ngày diễn ra.',
    notes: [
      'Trang chính dùng sự kiện ĐẦU TIÊN trong danh sách đang bật và đang trong khoảng ngày (giờ Việt Nam, gồm cả ngày bắt đầu và ngày kết thúc). Muốn trang đổi NGAY mà không chờ tới ngày bắt đầu, bật thêm "Hiện ngay" — sự kiện vẫn tự hết sau ngày kết thúc. Hai sự kiện cùng đang hiện thì mục đứng trước thắng — đổi thứ tự bằng mũi tên.',
      'Popup hiện MỘT LẦN cho mỗi sự kiện trên một trình duyệt. Sửa tiêu đề, nội dung, nút hoặc ảnh popup thì người đã xem sẽ thấy lại một lần.',
      'Nút "Xem thử trên trang" (trong form sửa, sau khi đã Lưu) mở trang với sự kiện đó — kể cả khi đang tắt hoặc chưa tới ngày — để kiểm tra trước khi bật. Đó chỉ là bản xem thử: trang chính chỉ đổi khi cột trạng thái ghi "Đang hiện trên trang".',
      'Họa tiết (tuyết, hoa mai, hoa đào, đèn lồng, pháo giấy, dơi và bí ngô Halloween — hoặc họa tiết bạn tự tạo ở mục "Họa tiết") vừa đậu trên các nút chính của trang, vừa là hạt rơi nếu bật "Hạt rơi trên trang". Người xem tắt được hạt rơi bằng nút tròn ở góc dưới-trái; máy bật giảm chuyển động thì không có hạt rơi.',
      'Ô màu để trống là giữ màu mặc định. Chữ trên nút tự chọn trắng hoặc đen cho đủ tương phản; dashboard và máy chủ cảnh báo khi màu nền nhạt hoặc khối tối làm chữ khó đọc.',
    ],
    groups: [
      {
        title: 'Chữ chung của popup',
        fields: [text('dismiss', 'Nút phụ (đóng popup)', { help: 'Ví dụ "Để sau".' }), text('close', 'Nhãn nút × (trình đọc màn hình)'),
          text('effectOff', 'Nhãn nút tắt hạt rơi (trình đọc màn hình)', { help: 'Ví dụ "Tắt hiệu ứng".' }),
          text('effectOn', 'Nhãn nút bật lại hạt rơi (trình đọc màn hình)', { help: 'Ví dụ "Bật hiệu ứng".' }),
        ],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Sự kiện',
        itemName: 'sự kiện',
        titleField: 'name',
        image: {
          label: 'Ảnh popup',
          optional: true,
          hint: 'Poster hoặc ảnh chúc mừng, hiện trọn khung (không cắt). Không có ảnh thì popup chỉ có chữ.',
        },
        decor: {
          label: 'Ảnh trang trí (góc khối Hero)',
          optional: true,
          hint: 'PNG nền trong suốt (cành mai, đèn lồng, cây thông…), đặt đè lên góc trên-phải ảnh đầu trang. Vuông hoặc gần vuông, cạnh ≥ 360px.',
        },
        seasonPreview: true,
        previewHref: (id) => `/?season=${encodeURIComponent(id)}`,
        idHint: 'Đặt kèm năm, vd. tet-2028 — popup nhớ "đã xem" theo id.',
        columns: [
          { label: 'Thời gian', value: (item) => `${viDate(item.start)} → ${viDate(item.end)}` },
          { label: '', value: seasonStatus, badge: true },
        ],
        fields: [
          text('name', 'Tên sự kiện', { help: 'Hiện thành nhãn nhỏ trên popup, vd. "Tết Nguyên Đán".' }),
          { key: 'enabled', label: 'Bật sự kiện', type: 'switch', description: 'Tắt thì trang không đổi màu và không hiện popup, kể cả khi đang trong khoảng ngày.' },
          {
            key: 'now',
            label: 'Hiện ngay, không chờ ngày bắt đầu',
            type: 'switch',
            description: 'Trang chính đổi ngay sau khi Lưu (cần bật sự kiện); tự hết sau ngày kết thúc. Tắt thì sự kiện tự hiện từ ngày bắt đầu.',
          },
          { key: 'start', label: 'Ngày bắt đầu', type: 'date' },
          { key: 'end', label: 'Ngày kết thúc', type: 'date', help: 'Gồm cả ngày này.' },
          { key: 'popup', label: 'Hiện popup quảng cáo', type: 'switch', description: 'Tắt thì chỉ đổi màu trang.' },
          text('title', 'Tiêu đề popup'),
          area('body', 'Nội dung popup', { rows: 3 }),
          {
            key: 'ctaAction',
            label: 'Nút chính của popup',
            type: 'select',
            options: () => [
              { value: 'register', label: 'Mở form đăng ký' },
              { value: 'form', label: 'Mở form tự tạo' },
              { value: 'popup', label: 'Mở popup' },
              { value: 'link', label: 'Mở đường dẫn' },
              { value: 'none', label: 'Không có nút chính' },
            ],
          },
          { key: 'formId', label: 'Form mở ra', type: 'select', options: formOptions, when: { ctaAction: ['form'] } },
          { key: 'popupId', label: 'Popup mở ra', type: 'select', options: metaPopupOptions, when: { ctaAction: ['popup'] } },
          text('ctaLabel', 'Chữ trên nút chính', { optional: true, help: 'Để trống khi không có nút chính.' }),
          { ...href, help: 'Chỉ dùng khi nút chính là "Mở đường dẫn".' },
          colorField('colorPrimary', 'Màu chủ đạo', 'Nút, link, nhãn, mục menu đang chọn.'),
          colorField('colorSurface', 'Màu nền nhạt', 'Nền pastel của nhãn và các thẻ.'),
          colorField('colorDark', 'Màu khối tối', 'Khối kêu gọi cuối trang — chữ trên đó luôn trắng.'),
          colorField('colorAccent', 'Màu phụ', 'Một số biểu tượng và điểm nhấn; cũng là một màu của pháo giấy.'),
          {
            key: 'motif',
            label: 'Họa tiết',
            type: 'select',
            optional: true,
            placeholder: '— Không trang trí —',
            options: seasonMotifOptions,
            help: 'Đậu trên các nút chính của trang (nút cỡ nhỏ như chip lọc thì không). Muốn hình riêng (ảnh PNG của bạn) hay chỉnh mật độ, tốc độ: tạo ở mục "Họa tiết" rồi chọn ở đây.',
          },
          { key: 'fall', label: 'Hạt rơi trên trang', type: 'switch', description: 'Họa tiết rơi nhẹ trên cả trang (đèn lồng thì bay lên). Cần chọn họa tiết.' },
        ],
      },
    ],
  },
  {
    key: 'motifs',
    label: 'Họa tiết',
    icon: 'image',
    description: 'Tự tạo họa tiết cho sự kiện mùa: ảnh PNG của bạn và hình có sẵn rơi trên trang, kèm vật trang trí trên nút.',
    notes: [
      'Bước 1: tải ảnh PNG nền trong suốt vào "Ảnh họa tiết" (bông hoa, ngôi sao, logo…). Bước 2: tạo họa tiết, chọn các loại hạt — trộn được ảnh của bạn với hình có sẵn, mỗi loại một tỉ lệ. Bước 3: ở mục "Sự kiện mùa", chọn họa tiết đó trong ô "Họa tiết".',
      'Muốn chỉnh một bộ có sẵn (ví dụ tuyết rơi dày hơn): tạo họa tiết mới, chọn "Bắt đầu từ: Tuyết" rồi sửa. Bộ gốc không bị đổi.',
      'Không xoá được họa tiết hay ảnh đang được dùng — đổi họa tiết của sự kiện trước.',
    ],
    groups: [],
    lists: [
      {
        path: 'shapes',
        title: 'Ảnh họa tiết',
        itemName: 'ảnh',
        titleField: 'name',
        image: {
          label: 'Ảnh',
          hint: 'PNG nền trong suốt, vuông hoặc gần vuông, cạnh ≥ 128px. Ảnh JPG có nền sẽ rơi thành ô vuông.',
        },
        columns: [
          {
            label: 'Dùng trong',
            value: (item, ctx) => {
              const count = (ctx.vi?.items ?? []).filter((motif) => usesShape(motif, item.id)).length
              return count > 0 ? `${count} họa tiết` : 'Chưa dùng'
            },
          },
        ],
        fields: [text('name', 'Tên ảnh', { help: 'Để bạn nhận ra trong ô chọn, vd. "Sao vàng".' })],
      },
      {
        path: 'items',
        title: 'Họa tiết tự tạo',
        itemName: 'họa tiết',
        titleField: 'name',
        idHint: 'Id hiện trong ô chọn của sự kiện; không trùng tên bộ có sẵn (snow, mai…).',
        motifPreview: true,
        createDefaults: MOTIF_DEFAULTS,
        presets: {
          label: 'Bắt đầu từ',
          blank: 'Trống — tự chọn từng loại hạt',
          options: Object.entries(BUILTIN_MOTIF_LABELS).map(([value, label]) => ({
            value,
            label,
            enLabel: BUILTIN_MOTIF_EN[value],
            item: presetFromBuiltin(value),
          })),
        },
        columns: [
          { label: 'Loại hạt', value: (item) => `${item.particles?.length ?? 0} loại` },
          { label: 'Hướng', value: (item) => (item.direction === 'up' ? 'Bay lên' : 'Rơi xuống') },
        ],
        fields: [
          text('name', 'Tên họa tiết', { help: 'Hiện trong ô chọn của sự kiện mùa.' }),
          {
            key: 'particles',
            label: 'Loại hạt (trộn theo tỉ lệ)',
            type: 'sublist',
            minItems: 1,
            idFrom: 'shape',
            rowDefaults: { shape: 'snowflake', weight: 50, sizeMin: 10, sizeMax: 18 },
            itemFields: [
              { key: 'shape', label: 'Hình', type: 'select', options: shapeOptions },
              number('weight', 'Tỉ lệ', '1–100, so với các loại khác. Hai loại 50 và 50 = mỗi loại một nửa.'),
              number('sizeMin', 'Cỡ nhỏ nhất (px)', '4–64.'),
              number('sizeMax', 'Cỡ lớn nhất (px)', '4–64, không nhỏ hơn cỡ nhỏ nhất.'),
              { key: 'flap', label: 'Vỗ cánh', type: 'switch', description: 'Co giãn theo chiều dọc như dơi, bướm.' },
            ],
          },
          {
            key: 'direction',
            label: 'Hướng',
            type: 'select',
            options: () => [
              { value: 'down', label: 'Rơi xuống' },
              { value: 'up', label: 'Bay lên (như đèn lồng, bong bóng)' },
            ],
          },
          {
            key: 'motion',
            label: 'Kiểu chuyển động',
            type: 'select',
            options: () => [
              { value: 'spin', label: 'Xoay tròn chậm' },
              { value: 'tilt', label: 'Lắc nghiêng qua lại' },
              { value: 'flip', label: 'Lật như mảnh giấy' },
              { value: 'drift', label: 'Chỉ trôi, đứng thẳng' },
            ],
          },
          number('speedMin', 'Tốc độ chậm nhất (px/giây)', '2–200. Tuyết có sẵn: 18.'),
          number('speedMax', 'Tốc độ nhanh nhất (px/giây)', '2–200, không nhỏ hơn tốc độ chậm nhất. Tuyết có sẵn: 40.'),
          number('sway', 'Độ lắc ngang (px)', '0–80. 0 = rơi thẳng.'),
          number('density', 'Mật độ (%)', '10–300. 100 = như bộ có sẵn, 200 = dày gấp đôi.'),
          {
            key: 'ornamentShape',
            label: 'Vật trang trí trên nút',
            type: 'select',
            optional: true,
            placeholder: '— Không trang trí nút —',
            options: shapeOptions,
          },
          {
            key: 'ornamentCorner',
            label: 'Góc đặt trên nút',
            type: 'select',
            options: () => [
              { value: 'right', label: 'Góc trên-phải' },
              { value: 'left', label: 'Góc trên-trái' },
              { value: 'both', label: 'Cả hai góc' },
            ],
          },
          number('ornamentSize', 'Cỡ vật trang trí (px)', '12–32.'),
        ],
      },
    ],
  },
  {
    key: 'popups',
    label: 'Popup',
    icon: 'external',
    description: 'Popup tự tạo: chỉ mở khi người xem bấm một nút có chức năng "Mở popup".',
    notes: [
      'Popup không tự hiện khi vào trang — muốn vậy, dùng mục "Sự kiện mùa". Gắn popup vào nút ở Hero, thanh menu, cuối trang, nút của popup khác hoặc nút chính của popup sự kiện mùa.',
      'Không xoá được popup đang có nút trỏ tới: đổi chức năng của nút đó trước.',
    ],
    groups: [{ title: 'Chữ chung', fields: [text('close', 'Nhãn nút × (trình đọc màn hình)')] }],
    lists: [
      {
        path: 'items',
        title: 'Popup',
        itemName: 'popup',
        titleField: 'title',
        image: { label: 'Ảnh', optional: true, hint: 'Hiện trọn khung (không cắt) phía trên tiêu đề. Không có ảnh thì popup chỉ có chữ.' },
        columns: [{ label: 'Nút', value: (item) => (item.buttons?.length ? item.buttons.map((button) => button.label).join(' · ') : '—') }],
        fields: [
          text('title', 'Tiêu đề'),
          area('body', 'Nội dung', { rows: 4, optional: true, help: 'Chữ thường; xuống dòng hai lần để tách đoạn.' }),
          {
            key: 'buttons',
            label: 'Nút (tối đa 2)',
            type: 'sublist',
            maxItems: 2,
            rowDefaults: { style: 'primary', action: 'register' },
            itemFields: buttonFields({ popupOptions: draftPopupOptions }),
          },
        ],
      },
    ],
  },
  {
    key: 'forms',
    label: 'Form tự tạo',
    icon: 'pencil',
    description: 'Form do bạn tạo: tự thêm ô, gắn vào nút có chức năng "Mở form tự tạo". Bài gửi xem ở "Bài gửi form".',
    notes: [
      'Mọi form đều có sẵn ô năm sinh và ô đồng ý (không cần thêm). Tắt "Nhận người dưới 16 tuổi" thì form chặn người dưới 16; bật thì người dưới 16 phải có phụ huynh điền tên và đồng ý thay (Nghị định 13/2023).',
      'Nên có ít nhất một ô số điện thoại hoặc email — không có thì không liên lạc lại được người gửi.',
      'Sửa nhãn hay xoá ô không làm hỏng bài gửi cũ: mỗi bài lưu kèm nhãn của ô tại lúc gửi. Bài gửi tự xoá sau 12 tháng, như đăng ký khóa học.',
      'Không xoá được form đang có nút trỏ tới: đổi chức năng của nút đó, hoặc bật "Đóng nhận bài" để ẩn nút.',
    ],
    groups: [
      {
        title: 'Chữ chung của mọi form',
        description: 'Nút gửi xong, chữ lỗi chung và chữ "bắt buộc" lấy từ mục "Form đăng ký".',
        fields: [
          text('birthYear', 'Nhãn ô năm sinh'),
          text('birthYearHint', 'Gợi ý ô năm sinh'),
          text('parentName', 'Nhãn ô tên phụ huynh'),
          area('parentNote', 'Ghi chú cho người dưới 16 tuổi', { rows: 2 }),
          text('adultOnly', 'Dòng ghi chú của form chỉ nhận từ 16 tuổi'),
          text('closedMessage', 'Báo khi form đã đóng nhận'),
          text('invalid', 'Lỗi: giá trị không hợp lệ'),
          text('selectPlaceholder', 'Chữ mặc định của ô chọn'),
        ],
      },
    ],
    lists: [
      {
        path: 'items',
        title: 'Form',
        itemName: 'form',
        titleField: 'title',
        idHint: 'Id nằm trong bài gửi và số liệu — không đổi được sau khi tạo.',
        columns: [
          { label: 'Ô', value: (item) => `${item.fields?.length ?? 0} ô` },
          { label: 'Bài gửi', value: (item, ctx) => String(ctx.meta?.forms?.find((form) => form.id === item.id)?.submissions ?? 0) },
          { label: '', value: (item) => (item.closed ? 'Đóng nhận' : 'Đang nhận'), badge: true },
        ],
        fields: [
          text('title', 'Tiêu đề form'),
          area('description', 'Mô tả ngắn', { rows: 2, optional: true }),
          { key: 'closed', label: 'Đóng nhận bài', type: 'switch', description: 'Ẩn mọi nút mở form này; máy chủ từ chối bài gửi.' },
          {
            key: 'allowMinors',
            label: 'Nhận người dưới 16 tuổi',
            type: 'switch',
            description: 'Bật: người dưới 16 phải có phụ huynh điền tên và đồng ý thay. Tắt: chỉ nhận người từ 16 tuổi.',
          },
          {
            key: 'fields',
            label: 'Các ô của form',
            type: 'sublist',
            minItems: 1,
            rowDefaults: { fieldType: 'text' },
            itemFields: [
              text('label', 'Nhãn ô'),
              text('help', 'Gợi ý dưới ô', { optional: true }),
              {
                key: 'fieldType',
                label: 'Loại ô',
                type: 'select',
                options: () => Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => ({ value, label })),
              },
              { key: 'required', label: 'Bắt buộc', type: 'switch' },
              {
                key: 'options',
                label: 'Các lựa chọn',
                type: 'sublist',
                minItems: 1,
                itemFields: [text('label', 'Lựa chọn')],
                when: { fieldType: ['select', 'multiselect'] },
              },
            ],
          },
          text('submitLabel', 'Chữ trên nút gửi'),
          area('consent', 'Câu đồng ý (ô tích bắt buộc)', { rows: 2 }),
          area('privacy', 'Thông báo xử lý dữ liệu', { rows: 3, help: '{email} được thay bằng email liên hệ ở chân trang.' }),
          text('successTitle', 'Tiêu đề khi gửi xong'),
          area('successBody', 'Lời nhắn khi gửi xong', { rows: 2 }),
        ],
      },
    ],
  },
]

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((section) => [section.key, section]))
