/**
 * Mô tả 12 section cho bộ soạn thảo chung.
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

const text = (key, label, extra = {}) => ({ key, label, type: 'text', translated: true, ...extra })
const area = (key, label, extra = {}) => ({ key, label, type: 'textarea', translated: true, ...extra })
const href = { key: 'href', label: 'Đường dẫn', type: 'href' }

const eyebrow = text('eyebrow', 'Nhãn nhỏ phía trên tiêu đề')
const title = text('title', 'Tiêu đề')
const description = area('description', 'Mô tả')
const altHelp = (token, what) => `${token} được thay bằng ${what}.`

const courseGroupOptions = (ctx) => (ctx.vi?.groups ?? []).map((group) => ({ value: group.id, label: group.title }))
const kindOptions = (ctx) => Object.entries(ctx.vi?.kinds ?? {}).map(([id, label]) => ({ value: id, label }))

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
      { title: 'Chữ chung', fields: [text('brandTagline', 'Dòng chữ cạnh logo'), text('cta', 'Nút kêu gọi')] },
      {
        title: 'Nhãn trợ năng',
        description: 'Trình đọc màn hình đọc các nhãn này; chúng không hiện ra trên trang.',
        fields: [text('openMenu', 'Mở menu'), text('closeMenu', 'Đóng menu'), text('switchLanguage', 'Chuyển ngôn ngữ')],
      },
    ],
    lists: [
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
          text('primaryCta', 'Nút chính'),
          text('secondaryCta', 'Nút phụ'),
          area('imageAlt', 'Mô tả ảnh (alt)', { rows: 2 }),
        ],
      },
    ],
    lists: [
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
    key: 'pillars',
    label: 'Trụ cột',
    icon: 'pillars',
    description: 'Ba thẻ giới thiệu hoạt động chính (Về chúng tôi).',
    groups: [{ title: 'Chữ chung', fields: [eyebrow, title, description] }],
    lists: [
      {
        path: 'items',
        title: 'Trụ cột',
        itemName: 'trụ cột',
        titleField: 'title',
        preview: 'pillar',
        idHint: 'Icon và màu thẻ tra theo id. Id mới không có icon riêng và lấy màu theo vòng lặp.',
        fields: [text('title', 'Tên'), area('description', 'Mô tả')],
      },
    ],
  },
  {
    key: 'stats',
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
    key: 'courses',
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
    key: 'facilities',
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
    key: 'partners',
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
    key: 'activities',
    label: 'Hoạt động',
    icon: 'activities',
    description: 'Cuộc thi, sự kiện và hội thảo — hai carousel.',
    groups: [
      {
        title: 'Chữ chung',
        fields: [
          eyebrow,
          title,
          description,
          text('previous', 'Nút lùi'),
          text('next', 'Nút tiến'),
          text('goTo', 'Nhãn chấm tròn'),
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
        filter: { label: 'Loại', field: 'kind', options: kindOptions },
        columns: [
          { label: 'Loại', value: (item, ctx) => ctx.vi?.kinds?.[item.kind] ?? item.kind },
          { label: 'Ngày', value: (item) => item.date || '—' },
        ],
        fields: [
          { key: 'kind', label: 'Loại', type: 'select', options: kindOptions, help: 'Hoạt động hiện ở khối nào là do loại quyết định.' },
          text('title', 'Tên hoạt động'),
          text('date', 'Ngày', { optional: true, placeholder: '6/6/2026', help: 'Để trống nếu nguồn không ghi ngày — đừng đoán.' }),
          area('description', 'Mô tả'),
        ],
      },
      {
        path: 'groups',
        title: 'Khối',
        itemName: 'khối',
        titleField: 'title',
        minItems: 1,
        idHint: 'Id khối là neo trên trang (ví dụ #competitions) và menu có thể đang trỏ tới.',
        columns: [{ label: 'Gồm loại', value: (item, ctx) => (item.kinds ?? []).map((kind) => ctx.vi?.kinds?.[kind] ?? kind).join(', ') || '—' }],
        fields: [
          text('title', 'Tên khối'),
          area('description', 'Mô tả'),
          { key: 'kinds', label: 'Loại hoạt động thuộc khối này', type: 'multiselect', options: kindOptions, optional: true },
        ],
      },
    ],
    records: [{ path: 'kinds', title: 'Loại hoạt động', description: 'Nhãn chip trên từng hoạt động.', itemName: 'loại' }],
  },
  {
    key: 'team',
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
    key: 'testimonials',
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
    label: 'Kêu gọi cuối trang',
    icon: 'finalCta',
    description: 'Khối kêu gọi đăng ký phía trên chân trang.',
    groups: [
      {
        title: 'Nội dung',
        fields: [title, description, text('primaryCta', 'Nút chính'), text('secondaryCta', 'Nút phụ')],
      },
    ],
    lists: [],
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
]

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((section) => [section.key, section]))
