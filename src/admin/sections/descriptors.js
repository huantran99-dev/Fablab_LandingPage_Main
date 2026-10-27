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
    key: 'activities',
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
    key: 'register',
    label: 'Form đăng ký',
    icon: 'register',
    description: 'Chữ của form đăng ký (popup mở từ nút "Đăng ký"): hai tab Thành viên FabLab và Khóa học.',
    notes: [
      '{email} và {phone} được thay bằng email / số điện thoại ở mục Liên hệ của Chân trang; {count} là số mục còn lỗi. Giữ nguyên các dấu ngoặc nhọn.',
      'Đoạn "Thông báo quyền riêng tư" là thông báo xử lý dữ liệu cá nhân theo Nghị định 13/2023 — nêu mục đích, bên quản lý, thời hạn lưu, quyền yêu cầu xoá. Thời hạn ghi ở đây phải khớp REGISTRATION_RETENTION_DAYS trên máy chủ (mặc định 365 ngày).',
      'Chữ đồng ý người gửi nhìn thấy được lưu nguyên văn vào từng lượt đăng ký, làm bằng chứng — sửa câu chữ không làm đổi các lượt đã gửi.',
      'Tab Thành viên dành cho người từ 16 tuổi (máy chủ kiểm năm sinh). Hai bảng "Đối tượng" và "Lĩnh vực quan tâm" chỉ sửa được nhãn — lựa chọn cố định trong mã.',
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
]

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((section) => [section.key, section]))
