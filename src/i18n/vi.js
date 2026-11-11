/**
 * Nội dung tiếng Việt.
 *
 * File này và `en.js` phải luôn có CÙNG MỘT SHAPE — component chỉ đọc theo
 * đường dẫn khóa, không hardcode chữ. Khi thêm một chuỗi ở đây, nhớ thêm
 * chuỗi tương ứng ở `en.js`.
 *
 * Các `id` của khóa học là định danh ổn định, không dịch: chúng được dùng làm
 * React key và làm khóa tra icon, nên phải giống hệt nhau ở cả hai ngôn ngữ.
 */
import { courseDetailsVi } from './courseDetails.vi'
import { experienceDetailsVi } from './experienceDetails.vi'
import { intensiveDetailsVi } from './intensiveDetails.vi'

export const vi = {
  nav: {
    brandTagline: 'Xưởng chế tạo số',
    /**
     * Menu hai cấp. Mục nào có `children` là nhánh mở ra submenu và KHÔNG có
     * `href` — nó là nút bật/tắt chứ không phải link, vì hai nhánh này không
     * ứng với section nào của riêng chúng.
     *
     * Mọi `href` phải trỏ tới một `id` có thật trong DOM; bốn neo được dựng riêng
     * cho menu này (hai nhóm khóa học và hai khối hoạt động).
     */
    links: [
      { id: 'about', label: 'Về chúng tôi', href: '#about' },
      {
        id: 'fablab',
        label: 'FabLab',
        children: [
          { id: 'facilities', label: 'Thiết bị', href: '#facilities' },
          { id: 'projects', label: 'Dự án', href: '#projects' },
          { id: 'competitions', label: 'Cuộc thi', href: '#competitions' },
        ],
      },
      {
        id: 'stemlab',
        label: 'StemLab',
        children: [
          { id: 'courses-stem', label: 'Khóa học STEM', href: '#courses-stem' },
          {
            id: 'courses-experience',
            label: 'Khóa học trải nghiệm',
            href: '#courses-experience',
          },
        ],
      },
      // Đứng riêng ở cấp một chứ không nằm trong FabLab: đây là mục hay được tìm
      // nhất nên không nên giấu sau một lần bấm. Vẫn trỏ tới khối "Sự kiện & hội
      // thảo" trong section Hoạt động.
      { id: 'events', label: 'Sự kiện', href: '#events' },
    ],
    // Nút trên thanh menu (tối đa 2). Hành động do admin chọn — xem buttonSchema.
    buttons: [{ id: 'register', label: 'Đăng ký ngay', style: 'primary', action: 'register' }],
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    switchLanguage: 'Chuyển ngôn ngữ',
  },

  hero: {
    eyebrow: 'Đại học Quốc tế Miền Đông',
    title: 'Tự Hào Phục Vụ Cộng Đồng',
    description:
      'EIU FabLab là một xưởng chế tác số điển hình với nhiều công nghệ, máy móc thiết bị hiện đại, không gian mở năng động - sáng tạo và các hoạt động đa dạng nhằm phục vụ cộng đồng. ',
    // Nút có hành động do admin chọn (API 23): mở form đăng ký / form / popup tự tạo, hoặc link.
    buttons: [
      { id: 'primary', label: 'Khám phá khóa học', style: 'primary', arrow: true, action: 'link', href: '#courses' },
      { id: 'secondary', label: 'Tham quan FabLab', style: 'secondary', action: 'link', href: '#facilities' },
    ],
    imageAlt:
      'Giảng viên EIU FabLab hướng dẫn ba em nhỏ lắp bộ kit STEM trên bàn thực hành.',
    floatingBadges: [
      { id: 'open', label: 'Mở cửa cho cộng đồng' },
      { id: 'hands-on', label: '100% học qua thực hành' },
    ],
  },

  stats: {
    // TODO: thay bằng số liệu thật của EIU FabLab
    items: [
      { id: 'visitors', value: 20000, suffix: '+', label: 'Học sinh đã tham quan' },
      { id: 'courses', value: 30, suffix: '+', label: 'Chủ đề trải nghiệm' },
      { id: 'learners', value: 12000, suffix: '+', label: 'Học sinh tham gia lớp học' },
      { id: 'partners', value: 20, suffix: '+', label: 'Đối tác' },
    ],
  },

  pillars: {
    eyebrow: 'Về chúng tôi',
    // "Về EIU FabLab" là tên mục trên trang gốc. Sứ mệnh / Tầm nhìn / Giá trị cốt lõi là
    // ba khối NGANG CẤP bên dưới (mỗi khối một h3), không còn Sứ mệnh làm tiêu đề section.
    title: 'Về EIU FabLab',
    description:
      'Phòng thí nghiệm chế tác, mang cơ hội tiếp cận và sử dụng thiết bị, kỹ thuật và công nghệ cho cộng đồng — nơi mọi người cùng học, cùng nghiên cứu, cùng thiết kế, cùng sáng tạo và cùng khởi nghiệp.',
    missionTitle: 'Sứ mệnh',
    vision: {
      title: 'Tầm nhìn',
      body:
        'Trở thành xưởng chế tác số điển hình với công nghệ hiện đại, không gian mở năng động – sáng tạo, hỗ trợ tốt nhất để hiện thực hóa ý tưởng và thúc đẩy khởi nghiệp, tạo giá trị tích cực cho cộng đồng.',
    },
    // Ba điểm nhấn tách từ chính câu tầm nhìn — không thêm ý mới.
    visionHighlights: [
      { id: 'technology', label: 'Công nghệ, thiết bị hiện đại' },
      { id: 'open-space', label: 'Không gian mở năng động – sáng tạo' },
      { id: 'startup', label: 'Hiện thực hóa ý tưởng, thúc đẩy khởi nghiệp' },
    ],
    valuesTitle: 'Giá trị cốt lõi',
    // Mô tả rút gọn từ khối "GIÁ TRỊ CỐT LÕI" trên fablab.eiu.edu.vn/vi/.
    values: [
      {
        id: 'open-space',
        title: 'Không gian công nghệ mở',
        description:
          'Dễ dàng tiếp cận và sử dụng thiết bị công nghệ để hiện thực hóa ý tưởng — động lực cho học tập và sáng tạo trong cộng đồng.',
      },
      {
        id: 'experiment',
        title: 'Thử nghiệm',
        description: 'Mạnh dạn thử nghiệm để học thêm kiến thức, từ đó cải tiến và hoàn thiện sản phẩm.',
      },
      {
        id: 'problem-solving',
        title: 'Giải quyết vấn đề',
        description: 'Kỹ năng giải quyết vấn đề là yếu tố quan trọng để dự án thành công.',
      },
      {
        id: 'creativity',
        title: 'Sáng tạo',
        description: 'Sáng tạo để nâng cao giá trị sản phẩm, mang lại giá trị tích cực cho xã hội.',
      },
      {
        id: 'collaboration',
        title: 'Chia sẻ và hợp tác',
        description: 'Chia sẻ kiến thức, kinh nghiệm và hợp tác giúp chúng ta đi nhanh và xa hơn.',
      },
      {
        id: 'achievement',
        title: 'Thành tựu',
        description:
          'Điều EIU FabLab hướng đến: tiếp thêm động lực đổi mới, sáng tạo cho cộng đồng để tạo ra giá trị tích cực cho xã hội.',
      },
    ],
    items: [
      {
        id: 'education',
        title: 'Giáo dục – Đào tạo',
        description:
          'Tiếp cận các kỹ thuật, công nghệ để hiện thực hóa ý tưởng; nâng cao kiến thức và kỹ năng qua học đi đôi với hành.',
      },
      {
        id: 'research',
        title: 'Nghiên cứu – Phát triển',
        description:
          'Tìm kiếm ý tưởng mới, tạo ra sản phẩm sáng tạo phục vụ cộng đồng.',
      },
      {
        id: 'entrepreneurship',
        title: 'Khởi nghiệp',
        description:
          'Thúc đẩy thương mại hóa sản phẩm từ các dự án thử nghiệm thành công.',
      },
    ],
  },

  courses: {
    eyebrow: 'Khóa học STEM',
    title: 'Chọn hành trình phù hợp với bạn',
    description:
      'Từ những bước lập trình đầu tiên đến kỹ năng vận hành máy công nghiệp — mỗi khóa học đều bắt đầu bằng việc bắt tay vào làm.',
    /**
     * Hai nhóm khóa học, xếp đúng thứ tự hiển thị trên trang.
     *
     * `id` khớp với `group` của từng khóa ở `items` bên dưới và **không dịch** —
     * đây là hai chuyên mục thật trên fablab.eiu.edu.vn, đọc được từ breadcrumb
     * của từng trang khóa học.
     */
    groups: [
      {
        id: 'stem',
        title: 'Khóa học STEM',
        description:
          'Khóa học 8 buổi đi sâu một chủ đề robot hoặc AIoT, cho học sinh tiểu học – THCS và THPT.',
      },
      {
        id: 'experience',
        title: 'Chương trình trải nghiệm STEM',
        description:
          'Ba mươi chương trình ngắn, đi thẳng vào một lĩnh vực để thử sức. Lọc theo cấp học và nhóm chủ đề để tìm nhanh chương trình phù hợp.',
        // Chỉ nhóm này hiện bộ lọc — bật bằng cờ chứ không suy đoán theo số lượng.
        filterable: true,
      },
    ],

    /**
     * Hai chiều phân loại của nhóm trải nghiệm, theo đúng catalogue chính thức
     * của FabLab EIU. Thứ tự trong mảng là thứ tự chip trên hàng lọc; `id` không
     * dịch vì dùng làm khóa đối chiếu với `stage`/`topic` của từng chương trình.
     *
     * `short` là chữ hiện trên card (chỗ hẹp), `label` là chữ đầy đủ trên hàng lọc.
     */
    stages: [
      { id: 'th', short: 'TH', label: 'Tiểu học' },
      { id: 'thcs', short: 'THCS', label: 'Trung học cơ sở' },
      { id: 'thpt', short: 'THPT', label: 'Trung học phổ thông' },
      // Khóa học chuyên sâu dành cho cả tiểu học lẫn THCS (slide 36–39). Bộ lọc của nhóm
      // trải nghiệm chỉ hiện cấp học có trong chính nhóm đó, nên mục này không lọt vào đó.
      { id: 'th-thcs', short: 'TH/THCS', label: 'Tiểu học – THCS' },
    ],
    topics: [
      { id: 'science', label: 'Khoa học tự nhiên và Sự sống' },
      { id: 'robotics', label: 'Kỹ thuật và công nghệ Robot' },
      { id: 'aiot', label: 'AIoT & Công nghệ số' },
    ],
    filters: {
      all: 'Tất cả',
      stage: 'Cấp học',
      topic: 'Nhóm chủ đề',
      empty: 'Không có chương trình nào khớp với lựa chọn này.',
    },

    // Chỉ bốn khóa nhóm `stem` dùng `levels` / `duration` / `age`; nhóm trải
    // nghiệm dùng `stage` / `topic` thay thế. Card render theo trường nào có mặt.
    levels: {
      basic: 'Cơ bản',
      intermediate: 'Trung cấp',
      advanced: 'Nâng cao',
    },
    ageLabel: 'Độ tuổi',
    cardCta: 'Tìm hiểu thêm',
    // Nhãn của khóa có cờ `comingSoon` (từ API 21).
    comingSoon: 'Sắp ra mắt',
    // `{title}` được thay bằng tên khóa học lúc render.
    imageAlt: 'Ảnh hoạt động tại EIU FabLab minh hoạ cho khóa {title}',

    // Nhãn cho popup chi tiết khóa học. Nội dung thật nằm ở `details` bên dưới.
    modal: {
      close: 'Đóng',
      overview: 'Giới thiệu khóa học',
      audience: 'Đối tượng',
      knowledge: 'Kiến thức đạt được',
      skills: 'Kỹ năng đạt được',
      curriculum: 'Nội dung khóa học',
      source: 'Xem trang khóa học gốc',
      register: 'Đăng ký khóa học này',
      empty: 'Khóa học này chưa công bố nội dung chi tiết.',
      viOnly: 'Nội dung chi tiết của khóa này hiện chỉ có bản tiếng Việt.',
    },

    /**
     * Hai nguồn, trộn lại:
     * - `courseDetailsVi` — SINH RA từ bộ scraper các trang LearnPress (4 khóa STEM)
     * - `experienceDetailsVi` — VIẾT TAY từ catalogue chính thức (30 chương trình)
     * Xem đầu mỗi file để biết cái nào được phép sửa tay.
     */
    details: { ...courseDetailsVi, ...experienceDetailsVi, ...intensiveDetailsVi },
    showMore: 'Xem thêm khóa học',
    showLess: 'Thu gọn',
    emptyState: 'Chưa có khóa học nào trong nhóm này.',

    // `duration` và `age` là số thật, lấy từ trang khóa học của trường.
    // TODO: riêng `age` của khóa Scratch ('8+') trang gốc không ghi — vẫn là giả định.
    items: [
      // --- Khoa học tự nhiên và Sự sống -----------------------------------
      {
        id: 'thien-nhien',
        group: 'experience',
        stage: 'th',
        topic: 'science',
        icon: 'energy',
        title: 'Sức mạnh của thiên nhiên',
        description:
          'Tìm hiểu các mùa, hiện tượng thời tiết và thiên tai, rồi dựng mô hình mô phỏng để hiểu cách phòng tránh.',
      },
      {
        id: 'nang-luong-cuoc-song',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'energy',
        title: 'Năng lượng và cuộc sống',
        description:
          'Các dạng và nguồn năng lượng, cách năng lượng truyền và chuyển đổi, qua thử thách "Cỗ máy một chạm".',
      },
      {
        id: 'am-thanh',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'electronics',
        title: 'Bí mật âm thanh',
        description:
          'Từ nguồn âm và dao động đến cách tai người tiếp nhận âm thanh, thực hành truyền âm bằng trò chơi tương tác.',
      },
      {
        id: 'nam-cham',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'electrical',
        title: 'Nam châm và từ trường',
        description:
          'Từ trường và nam châm trong tự nhiên, thí nghiệm về tính chất cơ bản và thử thách "Ma lực của nam châm".',
      },
      {
        id: 'cap-quang',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'photonics',
        title: 'Cáp quang và Laser',
        description:
          'Khúc xạ ánh sáng và phản xạ toàn phần, nguyên lý truyền ánh sáng trong cáp quang, khép lại bằng thử thách mã Morse.',
      },
      {
        id: 'polymer',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'plastics',
        title: 'Giải mã Polymer',
        description:
          'Đặc điểm và ứng dụng của các nhóm vật liệu polymer, thí nghiệm thực hành và thử thách chế tạo nhựa biopolymer.',
      },
      {
        id: 'nang-luong-tai-tao',
        group: 'experience',
        stage: 'thpt',
        topic: 'science',
        icon: 'energy',
        title: 'Năng lượng tái tạo',
        description:
          'Các nguồn năng lượng tái tạo và nguyên lý tuabin gió, thực hành đo điện năng tạo ra từ mô hình.',
      },
      {
        id: 'moi-truong-nuoc',
        group: 'experience',
        stage: 'thpt',
        topic: 'science',
        icon: 'water',
        title: 'Công nghệ môi trường nước',
        description:
          'Nguyên nhân ô nhiễm nước và các phương pháp xử lý; thực hành đo pH, khử trùng, khử màu và kiểm tra nước bể bơi.',
      },
      {
        id: 'nganh-nhua',
        group: 'experience',
        stage: 'thpt',
        topic: 'science',
        icon: 'plastics',
        title: 'Khám phá ngành nhựa',
        description:
          'Phân loại polymer, tính chất vật lý và hóa học, phân biệt tổng hợp với gia công, kèm thí nghiệm chế tạo.',
      },

      // --- Kỹ thuật và công nghệ Robot ------------------------------------
      {
        id: 'xe-robot',
        group: 'experience',
        stage: 'th',
        topic: 'robotics',
        icon: 'robot-car',
        title: 'Khám phá xe robot',
        description:
          'Cấu tạo và cách điều khiển xe robot bằng giọng nói và điều khiển từ xa, khép lại bằng thử thách "Đường đua robot".',
      },
      {
        id: 'drone',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'automation',
        title: 'Lập trình Drone',
        description:
          'Nguyên lý bay và ứng dụng của drone, thực hành lập trình điều khiển và trải nghiệm thử thách Drone Soccer.',
      },
      {
        id: 'canh-tay-robot',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'robotic-arm',
        title: 'Cánh tay robot trong sản xuất',
        description:
          'Cấu tạo và nguyên lý làm việc của cánh tay robot, thực hành lập trình qua trò chơi "Trạm hàng sắc màu".',
      },
      {
        id: 'robot-sinh-hoc',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'humanoid',
        title: 'Robot sinh học',
        description:
          'Nhận biết loài động thực vật, lắp ráp và vận hành mô hình robot sinh học, rồi chơi cùng chính mô hình đó.',
      },
      {
        id: 'kham-pha-dien',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'electronics',
        title: 'Khám phá điện',
        description:
          'Nguồn điện, linh kiện và nguyên tắc an toàn điện; thực hành lắp ráp và kiểm tra mạch điện cơ bản.',
      },
      {
        id: 'thiet-ke-co-khi',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'mechanics',
        title: 'Khám phá thiết kế cơ khí',
        description:
          'Đọc và phân tích bản vẽ kỹ thuật, hình chiếu và quy ước biểu diễn; thực hành thiết kế, gia công và lắp ráp.',
      },
      {
        id: 'co-dien-tu',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'mechatronics',
        title: 'Khám phá cơ điện tử',
        description:
          'Dây chuyền sản xuất và linh kiện cơ điện tử, phần mềm lập trình và thực hành điều khiển các module.',
      },
      {
        id: 'co-hoc-sang-tao',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'stress',
        title: 'Cơ học sáng tạo',
        description:
          'Lực và momen lực, nguyên lý các máy cơ đơn giản, vận dụng vào mô hình nâng hạ vật và thang máy.',
      },
      {
        id: 'cnc',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'cnc',
        title: 'Công nghệ gia công cắt gọt CNC',
        description:
          'Cấu tạo và nguyên lý máy phay CNC, thiết kế bản vẽ cơ khí đơn giản rồi vận hành máy để gia công sản phẩm.',
      },
      {
        id: 'in-3d',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'process',
        title: 'Công nghệ gia công bồi đắp in 3D',
        description:
          'Cấu tạo và nguyên lý máy in 3D, chuẩn bị tệp và điều chỉnh thông số in, vận hành máy để in sản phẩm.',
      },
      {
        id: 'muc-nuoc-thong-minh',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'water',
        title: 'Giám sát & điều khiển mức nước thông minh',
        description:
          'Điều khiển động cơ bơm và đọc dữ liệu cảm biến, dùng điều khiển hồi tiếp và nhận dạng giọng nói để quản lý mức nước.',
      },

      // --- AIoT & Công nghệ số ---------------------------------------------
      {
        id: 'lam-quen-ai',
        group: 'experience',
        stage: 'th',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Làm quen trí tuệ nhân tạo',
        description:
          'AI là gì và có mặt ở đâu trong đời sống; mô phỏng quá trình AI học dữ liệu qua trò chơi "AI đã học gì?".',
      },
      {
        id: 'the-gioi-ao',
        group: 'experience',
        stage: 'thcs',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Thế giới ảo và robot',
        description:
          'Vai trò của lập trình trong điều khiển robot, lập trình robot di chuyển trong sa bàn qua dự án "Kỹ sư nông trại tài ba".',
      },
      {
        id: 'noi-dung-so',
        group: 'experience',
        stage: 'thcs',
        topic: 'aiot',
        icon: 'photonics',
        title: 'Nhà sáng tạo nội dung số',
        description:
          'Phân biệt AI tạo sinh với AI truyền thống, viết prompt tạo hình ảnh và dựng video thành một câu chuyện ngắn.',
      },
      {
        id: 'cau-truc-may-tinh',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'electronics',
        title: 'Cấu trúc máy tính',
        description:
          'Vai trò của CPU, mainboard, RAM, SSD/HDD và cách chọn linh kiện phần cứng phù hợp với nhu cầu sử dụng.',
      },
      {
        id: 'thiet-ke-3d',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'process',
        title: 'Thiết kế 3D',
        description:
          'Hệ trục tọa độ trong không gian ba chiều và công cụ thiết kế in 3D, thực hành với phần mềm chuyên dụng.',
      },
      {
        id: 'blockchain',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'process',
        title: 'Blockchain và bí mật dữ liệu số',
        description:
          'Từ lịch sử tiền tệ đến công nghệ Blockchain, hiểu cơ chế bảo mật qua liên kết mã Hash và mô phỏng xác thực khối.',
      },
      {
        id: 'iot',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'automation',
        title: 'Kết nối dữ liệu thông minh',
        description:
          'Nguyên lý kết nối và điều khiển thiết bị IoT, thiết kế giao diện ứng dụng và điều khiển mô hình qua nền tảng đám mây.',
      },
      {
        id: 'thi-giac-may-tinh',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'photonics',
        title: 'Làm quen thị giác máy tính',
        description:
          'Vai trò và phân loại học máy, thực hành quy trình học máy với mạng nơron tích chập để nhận diện vật thể.',
      },
      {
        id: 'xac-suat-hoc-may',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'process',
        title: 'Ứng dụng xác suất trong học máy',
        description:
          'Định lý Naïve Bayes áp dụng vào dữ liệu lịch sử khách hàng để dự đoán hành vi, rồi đánh giá độ chính xác.',
      },
      {
        id: 'thiet-ke-website',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Thiết kế website',
        description:
          'Khái niệm giao diện và trải nghiệm người dùng, quy trình thiết kế và thực hành dựng một website đơn giản.',
      },

      // --- Khóa học STEM: các khóa học chuyên sâu (slide 35–42 "Giới thiệu STEMLab") ---
      {
        id: 'the-gioi-robot',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'robotics',
        icon: 'humanoid',
        title: 'Thế giới robot',
        description:
          'Tám buổi đi từ robot hình người, mobile robot đến cánh tay robot trong sản xuất, khép lại bằng dự án cuối khóa.',
      },
      {
        id: 'xe-robot-chuyen-sau',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'robotics',
        icon: 'robot-car',
        title: 'Khám phá xe robot',
        description:
          'Lập trình xe robot với mBlock qua cảm biến, màu sắc, âm thanh và chuyển động, khép lại bằng dự án cuối khóa.',
      },
      {
        id: 'lap-trinh-ai',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Lập trình cùng AI',
        description:
          'Làm quen Pictoblox, lập trình trò chơi và AI cơ bản, rồi điều khiển nhân vật, tạo trợ lý ảo và xe tự hành.',
      },
      {
        id: 'the-gioi-3d',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'aiot',
        icon: 'process',
        title: 'Chinh phục thế giới 3D',
        description:
          'Thiết kế 3D từ kiến trúc, nội thất đến con lắc Newton và nhân vật chuyển động với SimLab, khép lại bằng dự án cuối khóa.',
      },
      {
        id: 'website-chuyen-sau',
        group: 'stem',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Thiết kế website',
        description:
          'Thiết kế giao diện trong Figma với Gestalt, Grid, màu sắc, Typography, Component, AutoLayout và Prototype, hoàn thiện một Landing Page.',
      },
      {
        id: 'ai-khoa-hoc-du-lieu',
        group: 'stem',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'photonics',
        title: 'AI và khoa học dữ liệu',
        description:
          'Từ trí tuệ nhân tạo và Python đến nhận diện vật thể với YOLO: huấn luyện, đánh giá mô hình và xây dựng ứng dụng AI.',
      },
      {
        id: 'the-gioi-dien-tu',
        group: 'stem',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'electronics',
        comingSoon: true,
        title: 'Thế giới điện tử',
        description:
          'Ba module Mini Drone, Mini Robot và IoT smart kit.',
      },
    ],
  },

  facilities: {
    eyebrow: 'Thiết bị & Không gian',
    title: 'Xưởng mở với công nghệ chế tạo số',
    description:
      'Toàn bộ thiết bị đều mở cho học viên và cộng đồng sử dụng, có kỹ thuật viên hướng dẫn trực tiếp.',
    // `{title}` được thay bằng tên thiết bị lúc render.
    imageAlt: 'Ảnh chụp {title} tại xưởng EIU FabLab',
    items: [
      {
        id: 'printer-3d',
        title: 'Máy in 3D',
        description:
          'Hiện thực hóa mô hình từ bản thiết kế số chỉ trong vài giờ, với nhiều loại vật liệu khác nhau.',
      },
      { id: 'cnc', title: 'Máy CNC', description: 'Phay và tiện chính xác trên gỗ, nhựa và kim loại.' },
      { id: 'laser', title: 'Máy cắt laser', description: 'Cắt và khắc tinh xảo trên nhiều chất liệu tấm.' },
      { id: 'electronics-lab', title: 'Khu điện tử', description: 'Trạm hàn, đo kiểm và thiết kế mạch in.' },
    ],
  },

  // Popup thông số từng máy trong section Thiết bị. Nguồn: fablab.eiu.edu.vn/vi/thiet-bi/.
  // `facility` trỏ về `facilities.items[].id` — máy hiện thành nút trong đúng ô đó.
  // Sửa theo bản EN hai lỗi đánh máy của trang VI: Form 3 là 145x145x185 mm (không
  // phải micrometer), đầu in Cubicon 210F là 0.4 mm. Ba máy điện tử: trang gốc KHÔNG
  // có thông số — để `specs` rỗng, đừng điền từ nguồn khác.
  equipment: {
    listLabel: 'Các máy trong khu này',
    openLabel: 'Xem thông số',
    specsTitle: 'Thông số kỹ thuật',
    noSpecs: 'Trang thiết bị của FabLab chưa công bố thông số chi tiết cho máy này.',
    close: 'Đóng',
    imageAlt: 'Ảnh {name}',
    source: 'Xem trang thiết bị của FabLab',
    sourceUrl: 'https://fablab.eiu.edu.vn/vi/thiet-bi/',
    items: [
      {
        id: 'form-3',
        facility: 'printer-3d',
        name: 'Formlabs Form 3',
        type: 'Máy in 3D resin',
        specs: [
          { id: 'technology', label: 'Công nghệ in', detail: 'SLA – Stereolithography Apparatus; LFS – Low Force Stereolithography' },
          { id: 'print-size', label: 'Kích thước vật in', detail: '145x145x185 mm (Ngang – Dọc – Cao)' },
          { id: 'layer', label: 'Độ dày lớp in', detail: '25 – 300 µm' },
          { id: 'material', label: 'Vật liệu', detail: 'Resin' },
        ],
      },
      {
        id: 'cubicon-210f',
        facility: 'printer-3d',
        name: 'Cubicon 210F',
        type: 'Máy in 3D',
        specs: [
          { id: 'technology', label: 'Công nghệ in', detail: 'FFF – Fused Filament Fabrication' },
          { id: 'print-size', label: 'Kích thước vật in', detail: '150x150x150 mm (Ngang – Dọc – Cao)' },
          { id: 'layer', label: 'Độ dày lớp in', detail: '150 – 300 µm (nhỏ nhất 100 µm)' },
          { id: 'material-diameter', label: 'Đường kính vật liệu', detail: '1.75 mm' },
          { id: 'material', label: 'Vật liệu', detail: 'ABS, PLA, TPU' },
          { id: 'nozzle', label: 'Đường kính đầu in', detail: '0.4 mm' },
          { id: 'accuracy-xy', label: 'Độ chính xác trục XY', detail: '6.25 µm' },
          { id: 'accuracy-z', label: 'Độ chính xác trục Z', detail: '1.25 µm' },
          { id: 'nozzle-temp', label: 'Nhiệt độ đầu in (tối đa)', detail: '260 °C' },
          { id: 'bed-temp', label: 'Nhiệt độ bàn in (tối đa)', detail: '120 °C' },
        ],
      },
      {
        id: 'cubicon-310f',
        facility: 'printer-3d',
        name: 'Cubicon 310F',
        type: 'Máy in 3D',
        specs: [
          { id: 'technology', label: 'Công nghệ in', detail: 'FFF – Fused Filament Fabrication' },
          { id: 'print-size', label: 'Kích thước vật in', detail: '240x190x200 mm (Ngang – Dọc – Cao)' },
          { id: 'layer', label: 'Độ dày lớp in', detail: '150 – 300 µm (nhỏ nhất 100 µm)' },
          { id: 'material-diameter', label: 'Đường kính vật liệu', detail: '1.75 mm' },
          { id: 'material', label: 'Vật liệu', detail: 'ABS, PLA, TPU' },
          { id: 'nozzle', label: 'Đường kính đầu in', detail: '0.4 mm' },
          { id: 'accuracy-xy', label: 'Độ chính xác trục XY', detail: '6.25 µm' },
          { id: 'accuracy-z', label: 'Độ chính xác trục Z', detail: '1.25 µm' },
          { id: 'nozzle-temp', label: 'Nhiệt độ đầu in (tối đa)', detail: '260 °C' },
          { id: 'bed-temp', label: 'Nhiệt độ bàn in (tối đa)', detail: '120 °C' },
        ],
      },
      {
        id: 'shining-3d',
        facility: 'printer-3d',
        name: 'Shining 3D',
        type: 'Máy scan 3D',
        specs: [
          { id: 'mode', label: 'Chế độ', detail: 'Scan cố định – Scan tự động' },
          { id: 'min-size', label: 'Kích thước vật nhỏ nhất', detail: '30x30x30 mm' },
          { id: 'max-size', label: 'Kích thước vật lớn nhất', detail: '200x200x200 mm' },
          { id: 'speed', label: 'Tốc độ scan', detail: '4 giây' },
          { id: 'formats', label: 'Định dạng xuất', detail: 'OBJ, STL, ASC, PLY' },
          { id: 'camera', label: 'Độ phân giải camera', detail: '1.3 megapixel' },
          { id: 'light', label: 'Nguồn sáng', detail: 'Ánh sáng trắng' },
          { id: 'connection', label: 'Kết nối', detail: 'USB' },
        ],
      },
      {
        id: 'epilog-mini-helix-18',
        facility: 'laser',
        name: 'Epilog Mini Helix 18',
        type: 'Máy cắt laser',
        specs: [
          { id: 'table-size', label: 'Kích thước bàn cắt', detail: '18″ x 12″ (457 x 305 mm)' },
          { id: 'thickness', label: 'Độ dày vật liệu (tối đa)', detail: '4″ (102 mm)' },
          { id: 'power', label: 'Công suất đầu phóng', detail: '40 W' },
          { id: 'resolution', label: 'Độ phân giải', detail: '75 – 1200 DPI' },
          { id: 'connection', label: 'Kết nối', detail: 'Cáp Ethernet T-Base hoặc USB' },
        ],
      },
      {
        id: 'roland-srm-20',
        facility: 'cnc',
        name: 'Roland SRM-20',
        type: 'Máy phay CNC',
        specs: [
          { id: 'table-size', label: 'Kích thước bàn cắt', detail: '100 x 100 mm' },
          { id: 'connection', label: 'Kết nối', detail: 'Cáp Ethernet T-Base hoặc USB' },
        ],
      },
      {
        id: 'proxxon-ff500',
        facility: 'cnc',
        name: 'Proxxon FF500',
        type: 'Máy phay',
        specs: [
          { id: 'machine-size', label: 'Kích thước máy', detail: '400 x 125 mm, cao 780 mm' },
          { id: 'workpiece-size', label: 'Kích thước vật gia công', detail: 'Dài 450 x Rộng 270 x Cao 60 mm' },
          { id: 'power', label: 'Công suất động cơ', detail: 'BLDC 400 W' },
        ],
      },
      {
        id: 'proxxon-pd400',
        facility: 'cnc',
        name: 'Proxxon PD400',
        type: 'Máy tiện',
        specs: [
          { id: 'machine-size', label: 'Kích thước máy', detail: 'Dài 900 x Ngang 400 x Cao 300 mm' },
          { id: 'workpiece-size', label: 'Kích thước vật gia công', detail: 'Dài 450 x Ngang 270 x Cao 60 mm' },
          { id: 'power', label: 'Công suất động cơ', detail: '550 W' },
        ],
      },
      {
        id: 'proxxon-ds460',
        facility: 'cnc',
        name: 'Proxxon DS460',
        type: 'Máy cưa lọng',
        specs: [
          { id: 'machine-size', label: 'Kích thước máy', detail: 'Dài 900 x Ngang 400 x Cao 300 mm' },
          { id: 'workpiece-size', label: 'Kích thước vật gia công', detail: 'Dài 450 x Ngang 270 x Cao 60 mm' },
          { id: 'power', label: 'Công suất động cơ', detail: '550 W' },
        ],
      },
      {
        id: 'gwinstek-gfg-8255a',
        facility: 'electronics-lab',
        name: 'GW Instek GFG-8255A',
        type: 'Máy phát xung',
        specs: [],
      },
      {
        id: 'gwinstek-gds-2204a',
        facility: 'electronics-lab',
        name: 'GW Instek GDS-2204A',
        type: 'Máy hiện sóng số',
        specs: [],
      },
      {
        id: 'gwinstek-gpd-2303s',
        facility: 'electronics-lab',
        name: 'GW Instek GPD-2303S',
        type: 'Bộ nguồn DC 2 kênh',
        specs: [],
      },
    ],
  },

  // Dự án của FabLab. Nguồn: fablab.eiu.edu.vn/vi/du-an/. Trang gốc KHÔNG ghi trạng
  // thái, nên `status` (khoá của `statuses`) cố ý vắng trên mọi mục — vắng thì không
  // hiện nhãn. Admin tự đánh dấu "đang thực hiện" / "đã hoàn thành" trong dashboard.
  projects: {
    eyebrow: 'Dự án',
    title: 'Sản phẩm làm ra từ xưởng',
    description: 'Những mô hình và sản phẩm được thiết kế, chế tạo tại FabLab EIU — từ học cụ STEM tới robot và mô hình y tế.',
    imageAlt: 'Ảnh dự án {title}',
    previous: 'Dự án trước',
    next: 'Dự án tiếp theo',
    goTo: 'Xem dự án số',
    statuses: {
      ongoing: 'Đang thực hiện',
      done: 'Đã hoàn thành',
    },
    items: [
      {
        id: 'cobot',
        title: 'Mô hình Cobot',
        description:
          'Cobot là mô hình robot đa chức năng nhằm thực hiện các tác vụ hỗ trợ con người (vận chuyển, giám sát an ninh,…) ở nơi công cộng.',
      },
      {
        id: 'plane',
        title: 'Mô hình máy bay',
        description:
          'Mô hình máy bay được thiết kế đơn giản, dễ dàng lắp ráp và áp dụng vào trong lớp học STEM.',
      },
      {
        id: 'microbit-kit',
        title: 'Bộ kit micro:bit mở rộng',
        description:
          'Giúp học sinh tiếp cận công nghệ, lập trình, thúc đẩy các hoạt động nghiên cứu khoa học kĩ thuật cho sinh viên.',
      },
      {
        id: 'jaw-model',
        title: 'Mô hình xương hàm cho phẫu thuật nha',
        description:
          'Mô hình xương sọ thực hiện bằng phương pháp in 3D giúp hỗ trợ cho bác sĩ làm thí nghiệm trong phẫu thuật tạo hình.',
      },
      {
        id: 'smart-light',
        title: 'Đèn thông minh',
        description:
          'Đèn thay đổi màu sắc, độ sáng bằng nút nhấn, qua điện thoại hoặc để đèn chạy tự động bật nếu có người trong điều kiện ánh sáng yếu.',
      },
      {
        id: 'refraction-model',
        title: 'Mô hình khúc xạ ánh sáng',
        description:
          'Mô hình học cụ vật lý ứng dụng vào chương trình trải nghiệm Quang học trong chuỗi chương trình trải nghiệm STEM của STEM Lab.',
      },
      {
        id: 'mcr-racing-car',
        title: 'Xe đua MCR – EIU',
        description:
          'Mô hình xe đua MCR giúp sinh viên nâng cao kiến thức chuyên ngành thông qua sản phẩm.',
      },
      {
        id: 'hydroponic-garden',
        title: 'Vườn thủy canh',
        description:
          'Mô hình trồng rau thủy canh có các chức năng tự động như hẹn giờ phun sương, điều khiển từ xa, đèn mô phỏng ánh sáng mặt trời, bón phân theo lịch trình hay cảm biến.',
      },
    ],
  },

  partners: {
    eyebrow: 'Đối tác',
    title: 'Đồng hành cùng EIU FabLab',
    description:
      'Những tổ chức và trường học hợp tác cùng EIU FabLab đưa công nghệ đến gần cộng đồng hơn.',
    // `{name}` được thay bằng tên đối tác lúc render.
    logoAlt: 'Logo {name}',

    /**
     * Chỉ gồm tổ chức có căn cứ trên chính website của trường. Đối tác nào không
     * có logo thì bỏ trống `id` trong PARTNER_LOGOS và hiển thị bằng chữ —
     * KHÔNG đi tìm logo ở nguồn khác rồi gán vào.
     */
    items: [
      { id: 'eiu', name: 'Trường Đại học Quốc tế Miền Đông' },
      // { id: 'becamex', name: 'Becamex' },
      // { id: 'bbi', name: 'Becamex Business Incubator' },
      { id: 'vietanh', name: 'Hệ thống trường Việt Anh' },
      { id: 'little', name: 'Trường mầm non Little People' },
      { id: 'tvbd', name: 'Thư viện tỉnh Bình Dương' },
      { id: 'tvtphcm', name: 'Thư viện Khoa học tổng hợp thành phố Hồ Chí Minh' },
      { id: 'hoasen', name: 'Trường THCS-THPT Hoa Sen' },
      { id: 'petrusky', name: 'Trường THCS-THPT Pétrus Ký' },
      { id: 'talent', name: 'Talent Academy' },
    ],
  },

  activities: {
    eyebrow: 'Sự kiện',
    title: 'Hoạt động & cuộc thi thường niên',
    description:
      'Sân chơi, hội thảo và workshop do EIU FabLab tổ chức cho sinh viên, học sinh và cộng đồng.',
    previous: 'Hoạt động trước',
    next: 'Hoạt động tiếp theo',
    goTo: 'Xem hoạt động số',
    pause: 'Tạm dừng trình chiếu',
    play: 'Phát trình chiếu',
    // Nút đăng ký trên từng slide, theo `kind` (từ API 22). Loại không có nhãn ở đây thì
    // không có nút — `partnership` (lễ ký kết) cố ý không có.
    registerCta: {
      competition: 'Đăng ký cuộc thi',
      workshop: 'Đăng ký Workshop',
      seminar: 'Đăng ký hội thảo',
    },
    // Popup chi tiết của banner Cuộc thi (từ API 19).
    viewDetails: 'Xem chi tiết',
    detailLink: 'Xem trang cuộc thi',
    closeDetails: 'Đóng',
    // `{title}` được thay bằng tên hoạt động lúc render.
    imageAlt: 'Ảnh của {title}',
    // Nhãn trợ năng cho dòng giờ · phòng · chi phí trên thẻ sự kiện (từ API 24).
    timeLabel: 'Thời gian',
    venueLabel: 'Địa điểm',
    feeLabel: 'Chi phí',
    kinds: {
      competition: 'Cuộc thi',
      seminar: 'Hội thảo',
      workshop: 'Workshop',
      partnership: 'Hợp tác',
    },

    /**
     * Hai khối hiển thị song song, THỨ TỰ TRONG MẢNG LÀ THỨ TỰ TRÊN TRANG — cùng
     * quy ước với `courses.groups`.
     *
     * Mục nào thuộc khối nào KHÔNG ghi ở đây: nó suy thẳng từ `kind` của từng
     * hoạt động (xem `KIND_GROUP` trong Activities.jsx). `kind` đã quyết định
     * điều đó rồi, thêm một trường nữa chỉ mở đường cho hai chỗ lệch nhau.
     */
    groups: [
      {
        id: 'competitions',
        title: 'Cuộc thi',
        description:
          'Hai sân chơi thường niên do EIU FabLab tổ chức, mở cho sinh viên và học sinh khu vực phía Nam.',
        kinds: ['competition'],
        // Banner video tràn màn hình (video gắn từng cuộc thi qua dashboard).
        videoBanner: true,
      },
      {
        id: 'events',
        title: 'Sự kiện & hội thảo',
        description:
          'Workshop kỹ thuật cho sinh viên, workshop thủ công DIY và buổi hướng dẫn sử dụng FabLab trong năm 2026.',
        kinds: ['seminar', 'workshop', 'partnership'],
      },
    ],

    /**
     * Cuộc thi lấy từ trang "Sự kiện" của trường (fablab.eiu.edu.vn/vi/su-kien/) và poster
     * chính thức do FabLab cung cấp — mọi ngày tháng, giờ và địa điểm đọc thẳng từ poster.
     *
     * 11 workshop 2026 (từ 2026-11-11, thay các workshop / hội thảo 2019–2022) lấy từ tài liệu
     * "Workshop EIU FabLab 2026" người dùng soạn từ fanpage FabLab – EIU. `time` / `venue` /
     * `fee` chỉ có khi bài đăng ghi — vắng là nguồn không ghi, đừng đoán.
     *
     * Cuộc thi xếp trước, trong mỗi loại thì mới nhất trước.
     */
    items: [
      {
        id: 'drone-soccer',
        kind: 'competition',
        date: '6/6/2026',
        title: 'EIU Drone Soccer Championship 2026',
        description:
          'Giải đấu bóng đá bằng drone do EIU FabLab tổ chức. Thi đấu chính thức từ 07:00 đến 12:00 tại phòng 101, toà B3 — Đại học Quốc tế Miền Đông.',
      },
      {
        id: 'mcr-2026',
        kind: 'competition',
        date: '21–29/3/2026',
        title: 'EIU MCR 2026 — Lập trình xe đua tự động',
        description:
          'EIU Microcontroller Car Rally mùa 2026: vòng loại 1 ngày 21/3, vòng loại 2 ngày 22/3 và chung kết tổng ngày 29/3. Nhận đăng ký từ 4/1 đến 28/2/2026.',
      },
      {
        id: 'racing-cup',
        kind: 'competition',
        date: '',
        title: 'FabLab Racing Cup',
        description:
          'Cuộc thi đua xe mô hình do EIU FabLab phối hợp với khoa Kỹ thuật EIU tổ chức cho sinh viên khoa Kỹ thuật.',
      },
      {
        id: 'ws26-fablab-intro',
        kind: 'workshop',
        date: '21/10/2026',
        title: 'Hướng dẫn sử dụng FabLab',
        description:
          'Buổi giới thiệu không gian sáng tạo FabLab cho sinh viên. Người tham gia làm quen với các thiết bị công nghệ, tìm hiểu quy trình sử dụng và cách ứng dụng chúng trong học tập, nghiên cứu, thực hành, để biến ý tưởng thành sản phẩm thực tế.',
        venue: 'EIU FabLab, Block B11',
        registerClosed: true,
      },
      {
        id: 'ws26-lantern',
        kind: 'workshop',
        date: '23/9/2026',
        title: 'Làm lồng đèn Trung thu',
        description:
          'Workshop tự làm đèn lồng Trung thu bằng gỗ và mica, có dùng máy cắt/khắc laser. Người tham gia được hướng dẫn lên ý tưởng và chọn mẫu, lắp ráp theo mẫu, rồi trang trí và hoàn thiện sản phẩm.',
        time: 'Thứ Tư, 14:00–16:00',
        venue: 'Phòng 204.B11, FabLab EIU',
        fee: '60.000 đ',
        registerClosed: true,
      },
      {
        id: 'ws26-bouquet',
        kind: 'workshop',
        date: '12/8/2026',
        title: 'Bó hoa thanh xuân',
        description:
          'Workshop DIY làm bó hoa handmade tặng người thân hoặc tặng chính mình. Người tham gia kết hợp những cành hoa nhỏ và các nhân vật tự nặn bằng tay thành một bó hoa mang dấu ấn riêng, kèm lời chúc gửi gắm qua từng chi tiết.',
        time: 'Thứ Tư, 14:00–16:00',
        venue: 'Phòng 202.B11, FabLab EIU',
        registerClosed: true,
      },
      {
        id: 'ws26-decoden',
        kind: 'workshop',
        date: '22/7/2026',
        title: 'Trang trí kem keo',
        description:
          'Workshop DIY trang trí đồ dùng bằng kem keo và charm. Người tham gia tự trang trí lược chải tóc, ốp lưng điện thoại, gương và các phụ kiện khác, mỗi món mang cá tính riêng.',
        time: 'Thứ Tư, ca sáng 9:00–11:00, ca chiều 14:00–16:00',
        venue: 'Phòng 202.B11, FabLab EIU',
        fee: '35.000 đ/người',
        registerClosed: true,
      },
      {
        id: 'ws26-beads',
        kind: 'workshop',
        date: '1/7/2026',
        title: 'Xỏ hạt đan vòng',
        description:
          'Workshop DIY trong chuỗi workshop thủ công. Người tham gia tự thiết kế và xỏ các hạt cườm thành chiếc vòng của riêng mình, tự do chọn màu sắc và chi tiết, làm xong được mang về. Mỗi sản phẩm là một món quà nhỏ thể hiện sự tỉ mỉ và cá tính của người làm.',
        time: 'Thứ Tư, chia ca sáng và ca chiều',
        venue: 'Phòng 305.B11, FabLab EIU',
        registerClosed: true,
      },
      {
        id: 'ws26-glass',
        kind: 'workshop',
        date: '10/6/2026',
        title: 'Trang trí ly thủy tinh',
        description:
          'Workshop DIY tạo không khí vui vẻ, thư giãn cho sinh viên sau giờ học. Mỗi người tự thiết kế và trang trí một chiếc ly thủy tinh theo phong cách riêng. Buổi học diễn ra sôi nổi, mỗi chiếc ly là một tác phẩm mang dấu ấn của người làm.',
        time: 'Thứ Tư, ca sáng 9:00–11:00, ca chiều 14:00–16:00',
        venue: 'Phòng 305.B11, FabLab EIU',
        fee: '35.000 đ/người (đã gồm vật tư)',
        registerClosed: true,
      },
      {
        id: 'ws26-clay',
        kind: 'workshop',
        date: '27/5/2026',
        title: 'Creating with Clay – tạo hình đất sét',
        description:
          'Workshop DIY giúp sinh viên thư giãn và kết nối sau giờ học. Người tham gia dùng đất sét tự khô Mont Marte và màu acrylic để nặn các sản phẩm nhỏ xinh, làm xong được mang về. Sinh viên và cả chuyên viên của trường cùng tham gia.',
        time: 'Thứ Tư, ca 1 9:00–11:00, ca 2 14:00–16:00',
        venue: 'Phòng 209.B11, FabLab EIU',
        fee: '35.000 đ/người (đã gồm vật tư)',
        registerClosed: true,
      },
      {
        id: 'ws26-git',
        kind: 'workshop',
        date: '20/5/2026',
        title: 'Hướng dẫn sử dụng Git, GitHub',
        description:
          'Workshop giúp sinh viên quản lý mã nguồn, làm việc nhóm và “cứu hộ code” cho đồ án. Người tham gia học Git và GitHub từ con số 0, quy trình pull → add → commit → push, làm việc với nhánh (branch, merge) và thực hành làm việc nhóm trực tiếp. Buổi học thu hút đông đảo sinh viên yêu thích lập trình.',
        time: 'Thứ Tư, 14:00–16:00',
        venue: 'Phòng 305.B11, FabLab EIU',
        registerClosed: true,
      },
      {
        id: 'ws26-mech-design',
        kind: 'workshop',
        date: '15/4/2026',
        title: 'Thiết kế cơ khí cơ bản',
        description:
          'Workshop cho sinh viên đam mê kỹ thuật, cần tìm hiểu thiết kế cơ khí cho đồ án hoặc dự án cá nhân. Nội dung gồm tư duy thiết kế cơ khí, các tiêu chuẩn kỹ thuật và thực hành thiết kế trên phần mềm, với phần chia sẻ và nhiều giờ thực hành tập trung.',
        time: 'Thứ Tư, 14:00–16:00',
        venue: 'Phòng 305.B11, FabLab EIU',
        registerClosed: true,
      },
      {
        id: 'uav-f1tenth',
        kind: 'workshop',
        date: '27/1/2026',
        title: 'Chuỗi workshop UAV & F1TENTH',
        description:
          'Chuỗi workshop dài hạn cho sinh viên quan tâm đến robot tự hành, bắt đầu từ 27/01/2026. Giai đoạn 1 trang bị kiến thức nền tảng: Ubuntu và Linux, toán nền tảng, ROS 2 và các khái niệm cốt lõi, lập trình ROS 2 trên mô phỏng rồi kết nối với drone và xe F1TENTH thật — chuẩn bị cho phần chuyên sâu ở giai đoạn 2.',
        details:
          'Làm quen Ubuntu và môi trường Linux.\n\nÔn toán nền tảng: giải tích, đại số tuyến tính, xác suất – thống kê.\n\nROS 2 và các khái niệm cốt lõi: Workspace, Package, Node, Topic, Service, Action.\n\nLập trình ROS 2 trên môi trường mô phỏng, rồi kết nối với mô hình thực tế như drone và xe F1TENTH.',
        registerClosed: true,
      },
      {
        id: 'ws26-machines',
        kind: 'workshop',
        date: '14/1/2026',
        title: 'Hướng dẫn sử dụng máy móc tại xưởng FabLab',
        description:
          'Workshop dành cho sinh viên thích chế tạo, kỹ thuật, DIY hoặc cần dùng máy móc cho đồ án và dự án cá nhân. Người tham gia được học quy trình và quy định an toàn khi làm việc tại FabLab, thực hành trực tiếp với các máy cơ khí cơ bản, để tự tin dùng máy cho học tập, nghiên cứu và làm sản phẩm.',
        time: 'Thứ Tư, ca sáng 9:00–11:00, ca chiều 14:00–16:00',
        venue: 'Phòng 204.B11, FabLab EIU',
        registerClosed: true,
      },
    ],
  },

  team: {
    eyebrow: 'Đội ngũ',
    title: 'Đội ngũ của chúng tôi',
    description:
      'Kỹ sư, chuyên viên STEM và giảng viên trực tiếp đứng lớp, vận hành thiết bị và đồng hành cùng bạn trong từng dự án.',
    // `{name}` được thay bằng tên thành viên lúc render.
    photoAlt: 'Ảnh chân dung {name}',

    /**
     * Tên và chức danh lấy NGUYÊN VĂN từ trang "Về chúng tôi" trên Google Sites
     * của FabLab: sites.google.com/eiu.edu.vn/fablab (mục "Về chúng tôi").
     *
     * Thứ tự và cách chia giữ đúng như trang gốc: Cơ cấu tổ chức → Thành viên
     * STEM Lab (10) → Thành viên FabLab (4). Không dựng tiêu đề nhóm riêng vì
     * chức danh đã tự phân biệt.
     *
     * `id` là định danh ổn định, không dịch — dùng làm React key và khóa tra ảnh.
     *
     * `education` cũng lấy từ chính trang đó. Chỉ **rút gọn cho vừa thẻ**: bỏ chữ
     * nối "ngành", còn bậc học và tên ngành giữ nguyên văn. Riêng anh Hùng trang
     * ghi cả ba bằng kèm trường và năm — ở đây chỉ hiện bằng cao nhất.
     *
     * ⚠️ Trang gốc còn MỘT chỗ khuyết, cố ý không tự điền: nhóm FabLab có một ô
     * thứ năm chỉ có ảnh, không có tên lẫn chức danh — nên ở đây chỉ liệt kê 4
     * người có tên.
     *
     * Riêng "Hoàng Ngọc Phương" (tên đầy đủ và bằng Thạc sĩ Cơ điện tử) do người
     * dùng bổ sung trực tiếp, không có trên trang gốc — trang đó chỉ ghi "Phương"
     * kèm "Kỹ sư ngành Kỹ thuật phần mềm".
     */
    members: [
      // `lead` tách người này ra một thẻ riêng phía trên hai dải chạy. Đánh dấu
      // bằng cờ trong dữ liệu chứ không viết cứng `id` trong component — đổi
      // người phụ trách thì chuyển cờ là xong.
      { id: 'hung', name: 'Nguyễn Xuân Hùng', role: 'Giám đốc FabLab', education: 'Tiến sĩ Kỹ thuật Năng lượng', lead: true },
      { id: 'tuan', name: 'Đỗ Nguyễn Anh Tuấn', role: 'Chuyên viên STEM', education: 'Thạc sĩ Công nghệ thông tin' },
      { id: 'ngan', name: 'Trần Ngọc Kim Ngân', role: 'Chuyên viên STEM', education: 'Thạc sĩ Quản lý giáo dục' },
      { id: 'phuoc', name: 'Nguyễn Hữu Phước', role: 'Chuyên viên STEM', education: 'Thạc sĩ Khoa học vật chất' },
      { id: 'hien', name: 'Lư Thị Thu Hiền', role: 'Chuyên viên STEM', education: 'Thạc sĩ Hóa vô cơ' },
      { id: 'minh', name: 'Trần Hán Minh', role: 'Chuyên viên STEM', education: 'Kỹ sư Kỹ thuật phần mềm' },
      { id: 'manh', name: 'Đinh Thế Mạnh', role: 'Chuyên viên STEM', education: 'Cử nhân Kỹ thuật điện – điện tử' },
      { id: 'thy', name: 'Nguyễn Nam Thy', role: 'Chuyên viên STEM', education: 'Cử nhân Khoa học Vật lý' },
      { id: 'tran', name: 'Thạch Thị Huyền Trân', role: 'Chuyên viên STEM', education: 'Cử nhân Vật lý lý thuyết' },
      { id: 'huan', name: 'Trần Khắc Huân', role: 'Chuyên viên STEM', education: 'Kỹ sư Kỹ thuật phần mềm' },
      { id: 'phuong', name: 'Hoàng Ngọc Phương', role: 'Chuyên viên STEM', education: 'Thạc sĩ Cơ điện tử' },
      { id: 'linh', name: 'Võ Đoàn Linh', role: 'Kỹ thuật viên', education: 'Kỹ sư Kỹ thuật Tự động hóa' },
      { id: 'nhat', name: 'Trần Duy Nhất', role: 'Kỹ thuật viên', education: 'Kỹ sư Kỹ thuật Tự động hóa' },
      { id: 'tinh', name: 'Đỗ Trung Tính', role: 'Kỹ thuật viên', education: 'Kỹ sư Điện – Điện tử' },
      { id: 'nhi', name: 'Võ Hoàng Yến Nhi', role: 'Kỹ thuật viên', education: 'Kỹ sư Kỹ thuật Tự động hóa' },
    ],
  },

  testimonials: {
    eyebrow: 'Cảm nhận',
    title: 'Người học nói gì về EIU FabLab',
    previous: 'Cảm nhận trước',
    next: 'Cảm nhận tiếp theo',
    goTo: 'Xem cảm nhận số',
    // TODO: nội dung hư cấu — thay bằng cảm nhận thật của học viên
    items: [
      {
        id: 't1',
        quote:
          'Lần đầu tiên em thấy bản vẽ của mình biến thành một vật thể cầm được trên tay. Cảm giác đó khiến em muốn theo đuổi ngành kỹ thuật.',
        name: 'Nguyễn Minh Anh',
        role: 'Học viên khóa Gia công CNC',
      },
      {
        id: 't2',
        quote:
          'FabLab không dạy lý thuyết suông. Ngày đầu tiên chúng tôi đã được đứng máy, và sai ở đâu thì sửa ngay ở đó.',
        name: 'Trần Quốc Bảo',
        role: 'Sinh viên năm 3, ngành Cơ điện tử',
      },
      {
        id: 't3',
        quote:
          'Con tôi bắt đầu từ Scratch, giờ cháu tự lắp được xe robot dò đường. Điều quý nhất là cháu học được cách kiên nhẫn thử lại.',
        name: 'Lê Thu Hà',
        role: 'Phụ huynh học viên',
      },
    ],
  },

  finalCta: {
    title: 'Ý tưởng của bạn xứng đáng được chế tạo',
    description:
      'Đăng ký một khóa học, hoặc đơn giản là ghé thăm xưởng để xem chúng tôi đang làm gì. Cửa EIU FabLab luôn mở.',
    buttons: [
      { id: 'primary', label: 'Đăng ký khóa học', style: 'primary', arrow: true, action: 'register' },
      { id: 'secondary', label: 'Liên hệ với chúng tôi', style: 'secondary', action: 'link', href: '#contact' },
    ],
  },

  // Form đăng ký khóa học. {email}, {phone}, {count} được thay lúc render.
  // Đoạn `privacy` là thông báo xử lý dữ liệu cá nhân — FabLab cần duyệt câu chữ.
  register: {
    // Form có hai loại (hai tab): đăng ký khóa học (phụ huynh cho con) và đăng ký thành
    // viên FabLab (người từ 16 tuổi tự đăng ký). Các khoá cấp một bên dưới là của tab
    // Khóa học như trước; tab Thành viên nằm trong `member`.
    title: 'Đăng ký',
    description: 'Để lại thông tin, EIU FabLab sẽ liên hệ lại để tư vấn khóa học phù hợp.',
    tabs: {
      label: 'Loại đăng ký',
      member: 'Thành viên FabLab',
      course: 'Khóa học',
    },
    course: 'Khóa học quan tâm',
    courseNone: 'Chưa chọn — cần tư vấn thêm',
    studentHeading: 'Thông tin học viên',
    studentName: 'Họ và tên học viên',
    studentGrade: 'Năm sinh hoặc lớp',
    studentGradeHint: 'Ví dụ: 2014 hoặc lớp 6',
    school: 'Trường đang học',
    parentHeading: 'Thông tin phụ huynh',
    parentName: 'Họ và tên phụ huynh',
    phone: 'Số điện thoại',
    email: 'Email',
    note: 'Ghi chú',
    notePlaceholder: 'Lịch học mong muốn, câu hỏi cho FabLab…',
    required: 'bắt buộc',
    optional: 'không bắt buộc',
    consent: 'Tôi đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ tư vấn khóa học.',
    privacy:
      'Thông tin chỉ dùng để tư vấn và xếp lớp, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP).',
    submit: 'Gửi đăng ký',
    submitting: 'Đang gửi…',
    close: 'Đóng',
    errorSummary: 'Vui lòng kiểm tra lại {count} mục bên dưới.',
    errors: {
      required: 'Vui lòng điền mục này.',
      phone: 'Số điện thoại chưa đúng (ví dụ 0912 345 678).',
      email: 'Email chưa đúng định dạng.',
      consent: 'Cần đồng ý để FabLab có thể liên hệ với bạn.',
      tooLong: 'Nội dung quá dài.',
      rateLimited: 'Bạn đã gửi nhiều lần liên tiếp. Vui lòng thử lại sau ít phút.',
      paused: 'Hệ thống tạm ngưng nhận đăng ký trực tuyến. Vui lòng gọi {phone}.',
      network: 'Chưa gửi được. Vui lòng thử lại hoặc gọi {phone}.',
      age: 'Thành viên cần từ 16 tuổi trở lên. Học sinh nhỏ hơn vui lòng đăng ký khóa học.',
      birthYear: 'Năm sinh chưa đúng (ví dụ 2004).',
      role: 'Vui lòng chọn một mục.',
      // Form sự kiện (từ API 22): sự kiện đã đóng đăng ký hoặc vừa bị gỡ khỏi trang.
      event: 'Sự kiện này hiện không nhận đăng ký trực tuyến. Vui lòng tải lại trang hoặc liên hệ FabLab.',
    },
    success: {
      title: 'Đã nhận đăng ký!',
      message: 'Cảm ơn bạn. EIU FabLab sẽ liên hệ qua số điện thoại bạn đã cung cấp.',
      close: 'Đóng',
    },
    // Tab Thành viên. Trang gốc không có trang thành viên — câu chữ cố ý không hứa quyền
    // lợi cụ thể nào; FabLab bổ sung từ dashboard khi có.
    member: {
      description:
        'Thành viên được sử dụng không gian và thiết bị của xưởng. Để lại thông tin, EIU FabLab sẽ liên hệ hướng dẫn thủ tục.',
      ageNote: 'Dành cho người từ 16 tuổi trở lên. Học sinh nhỏ hơn vui lòng để phụ huynh đăng ký khóa học.',
      heading: 'Thông tin của bạn',
      fullName: 'Họ và tên',
      birthYear: 'Năm sinh',
      birthYearHint: 'Ví dụ: 2004',
      role: 'Bạn là',
      roleNone: 'Chọn một mục',
      organization: 'Trường hoặc đơn vị',
      interests: 'Lĩnh vực quan tâm',
      notePlaceholder: 'Dự án bạn muốn làm, thời gian có thể đến xưởng…',
      consent: 'Tôi đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ về việc đăng ký thành viên.',
      privacy:
        'Thông tin chỉ dùng để liên hệ và quản lý thành viên, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP).',
    },
    // Form đăng ký sự kiện (từ API 22) — mở từ nút "Đăng ký cuộc thi / Workshop / hội thảo"
    // trên từng slide của section Hoạt động. Không có tab: sự kiện đã chọn sẵn. Tiêu đề form
    // là chính nhãn nút (`activities.registerCta`). Mọi lứa tuổi; dưới 16 tuổi thì phụ huynh
    // điền và đồng ý thay — nên câu đồng ý là MỘT câu phủ cả hai trường hợp.
    event: {
      description: 'Để lại thông tin, EIU FabLab sẽ liên hệ xác nhận việc tham gia.',
      eventLabel: 'Sự kiện đăng ký',
      heading: 'Thông tin người tham gia',
      fullName: 'Họ và tên người tham gia',
      birthYear: 'Năm sinh',
      birthYearHint: 'Ví dụ: 2008',
      organization: 'Trường hoặc đơn vị',
      parentName: 'Họ và tên phụ huynh',
      parentNote:
        'Người tham gia dưới 16 tuổi: phụ huynh hoặc người giám hộ điền họ tên, số điện thoại liên hệ của mình và đồng ý thay.',
      notePlaceholder: 'Câu hỏi cho FabLab, nhu cầu hỗ trợ…',
      consent:
        'Tôi là người tham gia từ 16 tuổi trở lên, hoặc là cha mẹ / người giám hộ của người tham gia, và đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ về sự kiện.',
      privacy:
        'Thông tin chỉ dùng để liên hệ và tổ chức sự kiện, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP).',
    },
    // Khoá (id) cố định trong mã — xem MEMBER_ROLES / MEMBER_INTERESTS ở
    // server/schema/registration.js. Chỉ sửa nhãn, không thêm/bớt khoá.
    memberRoles: {
      'eiu-student': 'Sinh viên EIU',
      'eiu-staff': 'Giảng viên – cán bộ EIU',
      student: 'Học sinh',
      worker: 'Người đi làm',
      other: 'Khác',
    },
    memberInterests: {
      '3d-printing': 'In 3D',
      laser: 'Cắt khắc laser',
      cnc: 'Gia công CNC',
      electronics: 'Điện tử – lập trình',
      robotics: 'Robot – tự động hoá',
      other: 'Khác',
    },
  },

  footer: {
    description:
      'Xưởng chế tạo số của Đại học Quốc tế Miền Đông — mở cho giáo dục, nghiên cứu và khởi nghiệp.',
    columns: [
      {
        id: 'explore',
        title: 'Khám phá',
        links: [
          { id: 'about', label: 'Về chúng tôi', href: '#about' },
          // Trỏ cả section; nhãn phải là tên chung, kẻo trùng nhãn với link
          // "Khóa học STEM" ở cột Chương trình vốn trỏ riêng neo `#courses-stem`.
          { id: 'courses', label: 'Khóa học', href: '#courses' },
          { id: 'facilities', label: 'Thiết bị', href: '#facilities' },
          { id: 'projects', label: 'Dự án', href: '#projects' },
          { id: 'activities', label: 'Hoạt động & cuộc thi', href: '#activities' },
        ],
      },
      {
        id: 'programs',
        title: 'Chương trình',
        links: [
          { id: 'stem', label: 'Khóa học STEM', href: '#courses-stem' },
          {
            id: 'experience',
            label: 'Chương trình trải nghiệm STEM',
            href: '#courses-experience',
          },
          { id: 'community', label: 'Dự án cộng đồng', href: '#about' },
          { id: 'research', label: 'Nghiên cứu & Khởi nghiệp', href: '#about' },
        ],
      },
    ],
    // TODO: xác nhận lại thông tin liên hệ chính thức
    contact: {
      title: 'Liên hệ',
      address: 'Đại học Quốc tế Miền Đông, Thành phố mới Bình Dương, Việt Nam',
      email: 'fablab@eiu.edu.vn',
      phone: '(0274) 222 0176',
    },
    social: {
      title: 'Kết nối',
      items: [
        { id: 'facebook', label: 'Facebook', href: '#' },
        { id: 'youtube', label: 'YouTube', href: '#' },
        { id: 'website', label: 'Website EIU', href: '#' },
      ],
    },
    copyright: 'EIU FabLab. Tự hào phục vụ cộng đồng.',
  },
  // Sự kiện mùa: popup + bảng màu cả trang trong khoảng ngày (giờ VN). Ba mục MẪU, đang
  // TẮT (không có `enabled`) — khuôn cho admin sửa ngày, chữ, ảnh rồi bật trên dashboard.
  // Màu đã kiểm tương phản WCAG ≥ 4.5:1 (chữ trên nút, chữ màu chủ đạo trên nền pastel).
  seasonal: {
    close: 'Đóng',
    dismiss: 'Để sau',
    effectOff: 'Tắt hiệu ứng',
    effectOn: 'Bật hiệu ứng',
    items: [
      {
        id: 'tet-2027',
        name: 'Tết Nguyên Đán',
        popup: true,
        start: '2027-01-28',
        end: '2027-02-14',
        title: 'Chào Xuân Đinh Mùi 2027',
        body: 'EIU FabLab chúc bạn và gia đình một năm mới an khang, nhiều ý tưởng mới. Bắt đầu năm mới bằng một khóa học sáng tạo cùng FabLab.',
        ctaAction: 'register',
        ctaLabel: 'Đăng ký khóa học',
        href: '#',
        colorPrimary: '#c8102e',
        colorSurface: '#fff3d6',
        colorDark: '#7a0c1e',
        colorAccent: '#e8a317',
        motif: 'mai',
        fall: true,
      },
      {
        id: 'trung-thu-2027',
        name: 'Tết Trung Thu',
        popup: true,
        start: '2027-09-08',
        end: '2027-09-16',
        title: 'Trung Thu vui tươi cùng EIU FabLab',
        body: 'Chúc các bạn nhỏ một mùa trăng thật vui. Cùng xem các chương trình trải nghiệm STEM dành cho học sinh.',
        ctaAction: 'link',
        ctaLabel: 'Xem chương trình',
        href: '#courses-experience',
        colorPrimary: '#b34700',
        colorSurface: '#fff1dc',
        colorDark: '#3b2a5c',
        colorAccent: '#f2b134',
        motif: 'lantern',
        fall: true,
      },
      {
        id: 'noel-2026',
        name: 'Giáng sinh',
        popup: true,
        start: '2026-12-15',
        end: '2026-12-26',
        title: 'Giáng sinh an lành',
        body: 'EIU FabLab chúc bạn một mùa Giáng sinh ấm áp. Ghé xem những dự án được làm ra từ xưởng.',
        ctaAction: 'link',
        ctaLabel: 'Xem dự án',
        href: '#projects',
        colorPrimary: '#1f7a4d',
        colorSurface: '#eef7f0',
        colorDark: '#7f1d1d',
        colorAccent: '#c0392b',
        motif: 'snow',
        fall: true,
      },
      {
        id: 'halloween-2026',
        name: 'Halloween',
        popup: true,
        start: '2026-10-25',
        end: '2026-11-01',
        title: 'Halloween sáng tạo cùng EIU FabLab',
        body: 'EIU FabLab chúc bạn một mùa Halloween thật vui. Cùng khám phá các chương trình trải nghiệm STEM và tự tay làm ra sản phẩm của riêng mình.',
        ctaAction: 'link',
        ctaLabel: 'Xem chương trình',
        href: '#courses-experience',
        colorPrimary: '#c2410c',
        colorSurface: '#fff7ed',
        colorDark: '#3b0764',
        colorAccent: '#7c3aed',
        motif: 'halloween',
        fall: true,
      },
    ],
  },
  // Thư viện họa tiết tự tạo cho sự kiện mùa (dashboard "Họa tiết"). Không hiện thành khối
  // nào; sự kiện trỏ tới mục ở đây qua `motif`. Ảnh tải lên nằm ở `shapes` (ảnh qua binding).
  motifs: {
    shapes: [],
    items: [
      {
        id: 'tuyet-day',
        name: 'Tuyết dày (mẫu)',
        particles: [
          { id: 'snowflake', shape: 'snowflake', weight: 45, sizeMin: 11, sizeMax: 18 },
          { id: 'snowdot', shape: 'snowdot', weight: 55, sizeMin: 5, sizeMax: 9 },
        ],
        direction: 'down',
        motion: 'spin',
        speedMin: 18,
        speedMax: 40,
        sway: 26,
        density: 200,
        ornamentShape: 'snowflake',
        ornamentCorner: 'right',
        ornamentSize: 16,
      },
    ],
  },
  // Popup tự tạo (dashboard "Popup"). Chỉ mở khi người xem bấm một nút trỏ tới nó (hành động
  // "Mở popup" của nút ở Hero / thanh menu / cuối trang / popup khác / sự kiện mùa).
  // Ảnh qua binding, scope `popup`. Mục mẫu không nút nào trỏ tới.
  popups: {
    close: 'Đóng',
    items: [
      {
        id: 'popup-mau',
        title: 'Popup mẫu',
        body: 'Đây là popup mẫu. Sửa tiêu đề, nội dung, thêm ảnh và nút, rồi chọn "Mở popup" cho một nút trên trang để người xem mở được nó.',
        buttons: [
          { id: 'courses', label: 'Xem khóa học', style: 'primary', action: 'link', href: '#courses' },
        ],
      },
    ],
  },
  // Form tự tạo (dashboard "Form"). Bài gửi xem ở dashboard → "Bài gửi form". Mọi form có sẵn
  // ô năm sinh (không nằm trong `fields`); `allowMinors` bật thì dưới 16 tuổi phải có tên
  // phụ huynh, tắt thì chặn người dưới 16. Chữ lỗi chung, nút gửi… mượn `register`.
  // {email} trong `privacy` được thay lúc render. Mục mẫu đang đóng nhận.
  forms: {
    birthYear: 'Năm sinh',
    birthYearHint: 'Ví dụ: 2004',
    parentName: 'Họ và tên phụ huynh',
    parentNote:
      'Người dưới 16 tuổi: phụ huynh hoặc người giám hộ điền họ tên của mình và đồng ý thay.',
    adultOnly: 'Form này dành cho người từ 16 tuổi trở lên.',
    closedMessage: 'Form này đã ngừng nhận bài gửi.',
    invalid: 'Giá trị chưa hợp lệ.',
    selectPlaceholder: 'Chọn một mục',
    items: [
      {
        id: 'gop-y',
        title: 'Góp ý / Liên hệ',
        description:
          'Gửi câu hỏi hoặc góp ý cho EIU FabLab. Chúng tôi sẽ liên hệ lại qua số điện thoại hoặc email bạn để lại.',
        submitLabel: 'Gửi',
        successTitle: 'Đã gửi',
        successBody: 'Cảm ơn bạn. EIU FabLab sẽ liên hệ lại sớm.',
        consent: 'Tôi đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ lại với tôi.',
        privacy:
          'Thông tin chỉ dùng để liên hệ lại, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP).',
        closed: true,
        fields: [
          { id: 'ho-ten', label: 'Họ và tên', help: '', fieldType: 'text', required: true },
          { id: 'dien-thoai', label: 'Số điện thoại', help: '', fieldType: 'phone', required: true },
          { id: 'email', label: 'Email', help: '', fieldType: 'email' },
          { id: 'noi-dung', label: 'Nội dung', help: '', fieldType: 'textarea', required: true },
        ],
      },
    ],
  },
}
