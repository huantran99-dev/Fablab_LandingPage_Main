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

export const vi = {
  nav: {
    brandTagline: 'Xưởng chế tạo số',
    links: [
      { id: 'about', label: 'Về chúng tôi', href: '#about' },
      { id: 'courses', label: 'Khóa học', href: '#courses' },
      { id: 'facilities', label: 'Thiết bị', href: '#facilities' },
      { id: 'process', label: 'Quy trình', href: '#process' },
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
      'FabLab EIU là xưởng chế tạo số mở, nơi mọi ý tưởng đều có thể trở thành sản phẩm thật. Chúng tôi mang công nghệ, thiết bị và tri thức đến gần hơn với học sinh, sinh viên và cộng đồng.',
    primaryCta: 'Khám phá khóa học',
    secondaryCta: 'Tham quan FabLab',
    imageAlt:
      'Giảng viên FabLab EIU hướng dẫn ba em nhỏ lắp bộ kit STEM trên bàn thực hành.',
    floatingBadges: [
      { id: 'open', label: 'Mở cửa cho cộng đồng' },
      { id: 'hands-on', label: '100% học qua thực hành' },
    ],
  },

  stats: {
    // TODO: thay bằng số liệu thật của FabLab EIU
    items: [
      { id: 'learners', value: 2400, suffix: '+', label: 'Học viên đã tham gia' },
      { id: 'courses', value: 16, suffix: '', label: 'Khóa học STEM' },
      { id: 'machines', value: 40, suffix: '+', label: 'Thiết bị chế tạo số' },
      { id: 'projects', value: 180, suffix: '+', label: 'Dự án cộng đồng' },
    ],
  },

  pillars: {
    eyebrow: 'Về chúng tôi',
    title: 'Ba trụ cột của FabLab EIU',
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
          'Khóa ngắn 3–6 tuần, đi thẳng vào một lĩnh vực kỹ thuật để thử sức trước khi chọn học sâu.',
      },
    ],
    levels: {
      basic: 'Cơ bản',
      intermediate: 'Trung cấp',
      advanced: 'Nâng cao',
    },
    ageLabel: 'Độ tuổi',
    cardCta: 'Tìm hiểu thêm',
    // `{title}` được thay bằng tên khóa học lúc render.
    imageAlt: 'Ảnh hoạt động tại FabLab EIU minh hoạ cho khóa {title}',

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

    /** Nội dung chi tiết bóc từ trang khóa học thật — xem courseDetails.vi.js */
    details: courseDetailsVi,
    showMore: 'Xem thêm khóa học',
    showLess: 'Thu gọn',
    emptyState: 'Chưa có khóa học nào trong nhóm này.',

    // `duration` và `age` là số thật, lấy từ trang khóa học của trường.
    // TODO: riêng `age` của khóa Scratch ('8+') trang gốc không ghi — vẫn là giả định.
    items: [
      {
        id: 'automation',
        group: 'experience',
        level: 'advanced',
        duration: '5 tuần · 15 giờ',
        age: '16–18',
        title: 'Tự động hóa & Robotics',
        description:
          'Thiết kế và lập trình hệ thống tự động, từ cảm biến, PLC đến cánh tay robot công nghiệp.',
      },
      {
        id: 'plastics',
        group: 'experience',
        level: 'intermediate',
        duration: '5 tuần · 15 giờ',
        age: '12–18',
        title: 'Công nghiệp Nhựa',
        description:
          'Tìm hiểu vật liệu polymer, khuôn mẫu và quy trình ép phun trong sản xuất công nghiệp.',
      },
      {
        id: 'process',
        group: 'experience',
        level: 'advanced',
        duration: '4 tuần · 12 giờ',
        age: '12–18',
        title: 'Kỹ thuật Quá trình',
        description:
          'Vận hành và tối ưu các quá trình công nghệ, đo lường và điều khiển thông số dây chuyền.',
      },
      {
        id: 'photonics',
        group: 'experience',
        level: 'advanced',
        duration: '4 tuần · 12 giờ',
        age: '12–18',
        title: 'Quang sợi & Laser',
        description:
          'Nguyên lý truyền dẫn quang, hàn nối sợi quang và ứng dụng laser trong gia công vật liệu.',
      },
      {
        id: 'mechatronics',
        group: 'experience',
        level: 'advanced',
        duration: '3 tuần · 9 giờ',
        age: '16–18',
        title: 'Cơ điện tử',
        description:
          'Kết hợp cơ khí, điện tử và lập trình để xây dựng hệ thống thông minh hoàn chỉnh.',
      },
      {
        id: 'mechanics',
        group: 'experience',
        level: 'intermediate',
        duration: '5 tuần · 20 giờ',
        age: '16–18',
        title: 'Cơ khí',
        description:
          'Đọc bản vẽ kỹ thuật, thiết kế chi tiết máy và nguyên lý truyền động trong máy móc.',
      },
      {
        id: 'electrical',
        group: 'experience',
        level: 'intermediate',
        duration: '6 tuần · 18 giờ',
        age: '16–18',
        title: 'Hệ thống Điện',
        description:
          'Thiết kế tủ điện, đấu nối an toàn và vận hành hệ thống phân phối điện công nghiệp.',
      },
      {
        id: 'electronics',
        group: 'experience',
        level: 'basic',
        duration: '5 tuần · 15 giờ',
        age: '16–18',
        title: 'Điện tử',
        description:
          'Từ linh kiện cơ bản đến thiết kế mạch in, hàn mạch và đo kiểm bằng thiết bị chuyên dụng.',
      },
      {
        id: 'water',
        group: 'experience',
        level: 'intermediate',
        duration: '5 tuần · 15 giờ',
        age: '6–18',
        title: 'Công nghệ Môi trường Nước',
        description:
          'Xử lý và giám sát chất lượng nước, thiết kế hệ thống lọc phục vụ cộng đồng.',
      },
      {
        id: 'stress',
        group: 'experience',
        level: 'advanced',
        duration: '4 tuần · 12 giờ',
        age: '12–18',
        title: 'Phân tích Ứng suất',
        description:
          'Mô phỏng và kiểm nghiệm độ bền kết cấu bằng phương pháp phần tử hữu hạn.',
      },
      {
        id: 'cnc',
        group: 'experience',
        level: 'advanced',
        duration: '3 tuần · 9 giờ',
        age: '16–18',
        title: 'Gia công CNC',
        description:
          'Lập trình G-code, vận hành máy phay tiện CNC và gia công chi tiết đạt dung sai cao.',
      },
      {
        id: 'energy',
        group: 'experience',
        level: 'intermediate',
        duration: '4 tuần · 12 giờ',
        age: '11–18',
        title: 'Năng lượng Thay thế',
        description:
          'Khai thác năng lượng mặt trời và gió, thiết kế hệ thống lưu trữ và hòa lưới.',
      },
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
    imageAlt: 'Ảnh chụp {title} tại xưởng FabLab EIU',
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

  process: {
    eyebrow: 'Quy trình tham gia',
    title: 'Bốn bước để bắt đầu',
    description: 'Không cần kinh nghiệm trước. Bạn chỉ cần mang theo một ý tưởng.',
    steps: [
      { id: 'register', title: 'Đăng ký', description: 'Chọn khóa học phù hợp và gửi thông tin đăng ký trực tuyến.' },
      { id: 'orientation', title: 'Định hướng', description: 'Gặp gỡ giảng viên, tham quan xưởng và nhận lộ trình học.' },
      { id: 'practice', title: 'Thực hành', description: 'Trực tiếp vận hành thiết bị và xây dựng nguyên mẫu đầu tiên.' },
      { id: 'project', title: 'Hoàn thiện dự án', description: 'Trình bày sản phẩm và nhận chứng nhận từ FabLab EIU.' },
    ],
  },

  team: {
    eyebrow: 'Đội ngũ',
    title: 'Đội ngũ của chúng tôi',
    description:
      'Kỹ sư, chuyên viên STEM và giảng viên trực tiếp đứng lớp, vận hành thiết bị và đồng hành cùng bạn trong từng dự án.',
    joinCta: 'Cơ hội làm việc tại EIU',
    joinHref: 'https://eiu.edu.vn/career.aspx',
    // `{name}` được thay bằng tên thành viên lúc render.
    photoAlt: 'Ảnh chân dung {name}',

    /**
     * Tên và chức danh lấy nguyên văn từ trang "Về chúng tôi" của trường
     * (fablab.eiu.edu.vn/vi/ve-chung-toi/). `id` là định danh ổn định, không
     * dịch — dùng làm React key và khóa tra ảnh.
     */
    members: [
      { id: 'hung', name: 'Nguyễn Xuân Hùng', role: 'Tiến sĩ · Trưởng FabLab / STEM Lab' },
      { id: 'hien', name: 'Lư Thị Thu Hiền', role: 'Thạc sĩ · Chuyên viên STEM' },
      { id: 'phuoc', name: 'Nguyễn Hữu Phước', role: 'Thạc sĩ · Chuyên viên STEM' },
      { id: 'ngan', name: 'Trần Ngọc Kim Ngân', role: 'Cử nhân Giáo dục học' },
      { id: 'nhat', name: 'Trần Duy Nhất', role: 'Chuyên viên FabLab' },
      { id: 'linh', name: 'Võ Đoàn Linh', role: 'Chuyên viên FabLab' },
      { id: 'tuan', name: 'Đỗ Nguyễn Anh Tuấn', role: 'Kỹ sư phần mềm' },
      { id: 'minh', name: 'Trần Hán Minh', role: 'Kỹ thuật phần mềm' },
      { id: 'manh', name: 'Đinh Thế Mạnh', role: 'Cử nhân Kỹ thuật Điện – Điện tử' },
      { id: 'uyen', name: 'Võ Phạm Mai Uyên', role: 'Kỹ sư Kỹ thuật Tự động hóa' },
    ],
  },

  testimonials: {
    eyebrow: 'Cảm nhận',
    title: 'Người học nói gì về FabLab EIU',
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
      'Đăng ký một khóa học, hoặc đơn giản là ghé thăm xưởng để xem chúng tôi đang làm gì. Cửa FabLab EIU luôn mở.',
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
          { id: 'courses', label: 'Khóa học STEM', href: '#courses' },
          { id: 'facilities', label: 'Thiết bị', href: '#facilities' },
          { id: 'process', label: 'Quy trình tham gia', href: '#process' },
        ],
      },
      {
        id: 'programs',
        title: 'Chương trình',
        links: [
          { id: 'stem', label: 'Khóa học STEM', href: '#courses' },
          { id: 'experience', label: 'Chương trình trải nghiệm STEM', href: '#courses' },
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
    copyright: 'FabLab EIU. Tự hào phục vụ cộng đồng.',
  },
}
