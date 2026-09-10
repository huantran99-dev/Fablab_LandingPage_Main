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
    cta: 'Đăng ký ngay',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    switchLanguage: 'Chuyển ngôn ngữ',
  },

  hero: {
    eyebrow: 'Đại học Quốc tế Miền Đông',
    title: 'Tự Hào Phục Vụ Cộng Đồng',
    description:
      'EIU FabLab là một xưởng chế tác số điển hình với nhiều công nghệ, máy móc thiết bị hiện đại, không gian mở năng động - sáng tạo và các hoạt động đa dạng nhằm phục vụ cộng đồng. ',
    primaryCta: 'Khám phá khóa học',
    secondaryCta: 'Tham quan FabLab',
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
    title: 'Sứ mệnh của EIU FabLab',
    description:
      'Một không gian mở, năng động, nơi công nghệ được chia sẻ để tạo ra giá trị cho xã hội.',
    items: [
      {
        id: 'education',
        title: 'Giáo dục',
        description:
          'Học qua thực hành với thiết bị hiện đại. Người học tự tay thiết kế, gia công và hoàn thiện sản phẩm của chính mình.',
      },
      {
        id: 'research',
        title: 'Nghiên cứu',
        description:
          'Phát triển sản phẩm từ những ý tưởng sáng tạo, biến nguyên mẫu thành giải pháp kỹ thuật hoàn chỉnh.',
      },
      {
        id: 'entrepreneurship',
        title: 'Khởi nghiệp',
        description:
          'Đồng hành cùng bạn thương mại hóa nguyên mẫu thành công, đưa sản phẩm từ xưởng ra thị trường.',
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
          'Chương trình đầy đủ 5–10 tuần, theo một dự án từ bản phác đầu tiên đến sản phẩm hoàn thiện.',
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
    details: { ...courseDetailsVi, ...experienceDetailsVi },
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

      // --- Khóa học STEM ---------------------------------------------------
      {
        id: 'robotic-arm',
        group: 'stem',
        level: 'intermediate',
        duration: '10 tuần · 30 giờ',
        age: '15–18',
        title: 'Cánh tay Robot',
        description:
          'Tự tay lắp ráp và lập trình cánh tay robot thực hiện chuỗi thao tác gắp — thả.',
      },
      {
        id: 'humanoid',
        group: 'stem',
        level: 'intermediate',
        duration: '5 tuần · 15 giờ',
        age: '6–12',
        title: 'Robot Hình người',
        description:
          'Khám phá cách robot giữ thăng bằng, di chuyển và tương tác với con người.',
      },
      {
        id: 'scratch',
        group: 'stem',
        level: 'basic',
        duration: '7 tuần · 24 giờ',
        age: '8+',
        title: 'Lập trình Scratch',
        description:
          'Bước đầu tiên vào lập trình bằng khối lệnh trực quan — kể chuyện, làm game và hoạt hình.',
      },
      {
        id: 'robot-car',
        group: 'stem',
        level: 'basic',
        duration: '8 tuần · 24 giờ',
        age: '12–15',
        title: 'Xe Robot',
        description:
          'Chế tạo xe tự hành biết dò đường, tránh vật cản và điều khiển từ điện thoại.',
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
    // `{title}` được thay bằng tên hoạt động lúc render.
    imageAlt: 'Ảnh của {title}',
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
      },
      {
        id: 'events',
        title: 'Sự kiện & hội thảo',
        description:
          'Hội thảo chuyên đề, workshop thực hành và lễ hợp tác diễn ra tại FabLab trong khoảng 2019–2023.',
        kinds: ['seminar', 'workshop', 'partnership'],
      },
    ],

    /**
     * Phần lớn lấy từ trang "Sự kiện" của trường (fablab.eiu.edu.vn/vi/su-kien/).
     * Hai cuộc thi 2026 lấy từ poster chính thức do FabLab cung cấp — mọi ngày
     * tháng, giờ và địa điểm đều đọc thẳng từ poster, không suy đoán.
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
        id: 'stm32',
        kind: 'seminar',
        date: 'Chiều thứ 4 hàng tuần',
        title: 'Lập trình STM32 căn bản',
        description:
          'Hướng dẫn sinh viên sử dụng các chức năng ngoại vi của vi điều khiển như ADC, PWM, I2C. Tại phòng 202, block 11.',
      },
      {
        id: 'print-3d',
        kind: 'workshop',
        date: '20/7/2022',
        title: 'Công nghệ và ứng dụng in 3D',
        description:
          'Tìm hiểu công nghệ in 3D, các loại máy in 3D và cách vận hành. Phụ trách: Võ Đoàn Linh. Tại Thư viện EIU.',
      },
      {
        id: 'viet-anh',
        kind: 'partnership',
        date: '19/7/2022',
        title: 'Ký kết hợp tác chiến lược EIU – Việt Anh',
        description:
          'Thiết lập quan hệ đối tác chiến lược với Hệ thống trường Việt Anh: tổ chức trải nghiệm STEM, hỗ trợ nghiên cứu và đưa học sinh tham gia các cuộc thi khoa học công nghệ.',
      },
      {
        id: 'laser-cnc',
        kind: 'workshop',
        date: '21/6/2022',
        title: 'Sáng tạo với máy in 3D và máy CNC laser',
        description:
          'Cắt gỗ và mica bằng máy laser, khắc mạch in, thiết kế và in 3D. Phụ trách: Bùi Quang Tiến.',
      },
      {
        id: 'industrial-design',
        kind: 'seminar',
        date: '20/6/2022',
        title: 'Vai trò của kiểu dáng công nghiệp',
        description:
          'Trao đổi về thiết kế kỹ thuật và tạo mẫu sản phẩm công nghiệp. Diễn giả: Nguyễn Trần Bảo Hiền, Công ty Anco – Bình Dương.',
      },
      {
        id: 'print-3d-medical',
        kind: 'seminar',
        date: '',
        title: 'Ứng dụng công nghệ in 3D trong y tế',
        description:
          'Ứng dụng in 3D trong phẫu thuật định hình răng hàm mặt. Diễn giả: TS.BS Trần Tuấn Anh, Bệnh viện quốc tế Becamex.',
      },
      {
        id: 'nano',
        kind: 'seminar',
        date: '15/3',
        title: 'Ứng dụng vật liệu nano vào y tế',
        description:
          'Chế tạo cảm biến đo lực căng từ vật liệu nano, ứng dụng trong y khoa. Diễn giả: TS Trần Quang Trung, Đại học Sungkyunkwan (Hàn Quốc).',
      },
      {
        id: 'machine-learning',
        kind: 'seminar',
        date: '23/8',
        title: 'Công nghệ học máy — Machine Learning',
        description:
          'Mạng nơ-ron, TensorFlow, mạng tích chập và hướng đi của deep learning. Diễn giả: TS Cường Phạm.',
      },
      {
        id: 'design-workshop',
        kind: 'workshop',
        date: '7/8/2019',
        title: 'Thiết kế công nghiệp',
        description:
          'Quy trình tạo ra một sản phẩm từ ý tưởng, phác thảo đến chế tạo mẫu thử, kèm phần thực hành phác thảo.',
      },
      {
        id: 'pcb',
        kind: 'workshop',
        date: '',
        title: 'Thiết kế và gia công thử nghiệm mạch điện',
        description:
          'Dùng điện trở, diode, transistor, FET, opto để thiết kế ứng dụng thực tế; các kỹ thuật layout mạch in cơ bản.',
      },
      {
        id: 'design-3d',
        kind: 'workshop',
        date: '',
        title: 'Thiết kế 3D với SolidWorks',
        description:
          'Quy trình thiết kế 3D và các yếu tố ảnh hưởng tới sản phẩm từ khâu thiết kế đến khi chế tạo thành phẩm.',
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
    primaryCta: 'Đăng ký khóa học',
    secondaryCta: 'Liên hệ với chúng tôi',
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
}
