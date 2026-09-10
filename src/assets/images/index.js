/**
 * Ảnh thật của FabLab EIU, tải từ fablab.eiu.edu.vn rồi cắt/nén sẵn về đúng kích
 * thước hiển thị (xem bảng trong README). Import qua ES module để Vite gắn hash
 * nội dung vào tên file — đổi ảnh là cache tự động mất hiệu lực.
 *
 * Ảnh nào KHÔNG đúng chủ đề khóa học được đánh dấu `// ~` bên dưới: đó là ảnh
 * thật của FabLab nhưng chụp hoạt động khác, dùng tạm vì thư viện ảnh của trường
 * không có ảnh riêng cho khóa đó. Thay được thì nên thay.
 */
import heroStemWorkshop from './hero-stem-workshop.jpg'
import logoMark from './logo-mark.png'

import lab3dPrinters from './lab-3d-printers.jpg'
import labLaserCutter from './lab-laser-cutter.jpg'
import labMachineShop from './lab-machine-shop.jpg'
import labWorkbenches from './lab-workbenches.jpg'

import courseAutomation from './course-automation.jpg'
import courseCnc from './course-cnc.jpg'
import courseElectrical from './course-electrical.jpg'
import courseElectronics from './course-electronics.jpg'
import courseEnergy from './course-energy.jpg'
import courseHumanoid from './course-humanoid.jpg'
import courseMechanics from './course-mechanics.jpg'
import courseMechatronics from './course-mechatronics.jpg'
import coursePhotonics from './course-photonics.jpg'
import coursePlastics from './course-plastics.jpg'
import courseProcess from './course-process.jpg'
import courseRobotCar from './course-robot-car.jpg'
import courseRoboticArm from './course-robotic-arm.jpg'
import courseScratch from './course-scratch.jpg'
import courseStress from './course-stress.jpg'
import courseWater from './course-water.jpg'

import partnerBbi from './partner-bbi.png'
import partnerBecamex from './partner-becamex.png'
import partnerEiu from './partner-eiu.png'
import partnerHoasen from './partner-hoasen.png'
import partnerVietanh from './partner-vietanh.png'
import partnerLittlepeo from './partner-littlepeo.png'
import partnerTvbd from './partner-tvbd.png'
import partnerTvtphcm from './partner-tvtphcm.png'
import partnerPetrusky from './partner-petrusky.png'
import partnerTalent from './partner-talent.png'

import activityDesign3d from './activity-design-3d.jpg'
import activityDesignWorkshop from './activity-design-workshop.jpg'
import activityDroneSoccer from './activity-drone-soccer.jpg'
import activityIndustrialDesign from './activity-industrial-design.jpg'
import activityLaserCnc from './activity-laser-cnc.jpg'
import activityMachineLearning from './activity-machine-learning.jpg'
import activityMcr2026 from './activity-mcr-2026.jpg'
import activityNano from './activity-nano.jpg'
import activityPrint3d from './activity-print-3d.jpg'
import activityRacingCup from './activity-racing-cup.jpg'
import activityVietAnh from './activity-viet-anh.jpg'

import teamHien from './team-hien.jpg'
import teamHuan from './team-huan.jpg'
import teamHung from './team-hung.jpg'
import teamLinh from './team-linh.jpg'
import teamManh from './team-manh.jpg'
import teamMinh from './team-minh.jpg'
import teamNgan from './team-ngan.jpg'
import teamNhat from './team-nhat.jpg'
import teamNhi from './team-nhi.jpg'
import teamPhuoc from './team-phuoc.jpg'
import teamThy from './team-thy.jpg'
import teamTinh from './team-tinh.jpg'
import teamTran from './team-tran.jpg'
import teamTuan from './team-tuan.jpg'

export const HERO_IMAGE = { src: heroStemWorkshop, width: 1200, height: 900 }

/**
 * Logo chính thức của FabLab EIU.
 *
 * File nguồn `Logo-Fablab.png` (100×118) gồm mark tròn Ở TRÊN và dòng chữ
 * "EIU FABLAB" ở dưới. `logo-mark.png` là phần mark cắt ra từ chính file đó
 * (vùng 3,3–96,93 đặt giữa khung vuông 94×94, nền trong suốt).
 *
 * Vì sao chỉ dùng mark: ở navbar logo cao khoảng 36px, dòng chữ nằm sẵn trong
 * file sẽ chỉ còn chừng 4px — không đọc nổi. Chữ "EIU FabLab" bên cạnh vì thế
 * vẫn để dạng text, vừa sắc nét vừa ăn theo font của trang.
 */
export const LOGO_MARK = { src: logoMark, width: 94, height: 94 }

/** Khớp với `facilities.items[].id` trong i18n. */
export const FACILITY_IMAGES = {
  'printer-3d': { src: lab3dPrinters, width: 1000, height: 600 },
  cnc: { src: labMachineShop, width: 760, height: 560 },
  laser: { src: labLaserCutter, width: 679, height: 500 },
  'electronics-lab': { src: labWorkbenches, width: 1000, height: 600 }, // ~ ảnh xưởng chung
}

/**
 * Khớp với `courses.items[].id` trong i18n. Mọi ảnh đều 760×320.
 *
 * **Thiếu một id là card hiện ảnh vỡ** — không có ảnh mặc định, cũng không có
 * cảnh báo lúc build. Thêm chương trình thì phải thêm ở đây.
 *
 * Kho ảnh phong cảnh dùng được cho card chỉ có 20 tấm, trong khi có 34 khóa. Nên:
 * - `// ~` đánh dấu ảnh thật của FabLab nhưng **chụp hoạt động khác**;
 * - `// ↺` đánh dấu ảnh **dùng lại** của một card khác trong cùng trang.
 * Cả hai đều là ảnh thật, không có ảnh stock. README liệt kê đầy đủ để thay dần.
 */
export const COURSE_IMAGES = {
  // --- Khoa học tự nhiên và Sự sống ---------------------------------------
  'thien-nhien': courseEnergy, // ~ ảnh năng lượng, không phải thời tiết/thiên tai
  'nang-luong-cuoc-song': courseEnergy, // ↺
  'am-thanh': labWorkbenches, // ~ ảnh xưởng chung
  'nam-cham': courseElectrical, // ~ phòng STEM trống
  'cap-quang': labLaserCutter,
  polymer: coursePlastics,
  'nang-luong-tai-tao': courseEnergy, // ↺
  'moi-truong-nuoc': courseWater, // ~ giảng viên đứng lớp
  'nganh-nhua': coursePlastics, // ↺

  // --- Kỹ thuật và công nghệ Robot ----------------------------------------
  'xe-robot': courseRobotCar,
  drone: courseMechanics, // ~ sân thi robot, không phải drone
  'canh-tay-robot': courseRoboticArm,
  'robot-sinh-hoc': courseHumanoid,
  'kham-pha-dien': courseElectronics,
  'thiet-ke-co-khi': labMachineShop,
  'co-dien-tu': courseMechatronics,
  'co-hoc-sang-tao': courseStress,
  cnc: courseCnc, // ~ ảnh tập thể trong xưởng
  'in-3d': lab3dPrinters,
  'muc-nuoc-thong-minh': courseWater, // ↺ ~

  // --- AIoT & Công nghệ số -------------------------------------------------
  'lam-quen-ai': courseScratch, // ~ ảnh lớp lập trình
  'the-gioi-ao': courseScratch, // ↺
  'noi-dung-so': coursePhotonics, // ~ sinh viên làm việc trên máy tính
  'cau-truc-may-tinh': labWorkbenches, // ↺ ~
  'thiet-ke-3d': lab3dPrinters, // ↺
  blockchain: coursePhotonics, // ↺ ~
  iot: courseAutomation, // ~ ảnh hệ thống tự động
  'thi-giac-may-tinh': courseProcess, // ~ ảnh kỹ thuật quá trình
  'xac-suat-hoc-may': courseProcess, // ↺ ~
  'thiet-ke-website': labWorkbenches, // ↺ ~

  // --- Khóa học STEM -------------------------------------------------------
  'robotic-arm': courseRoboticArm, // ↺ dùng chung với chương trình trải nghiệm
  humanoid: courseHumanoid, // ↺
  scratch: courseScratch, // ↺
  'robot-car': courseRobotCar, // ↺
}

export const COURSE_IMAGE_SIZE = { width: 760, height: 320 }

/**
 * Ảnh chân dung đội ngũ, khớp với `team.members[].id` trong i18n. Mọi ảnh 240×240.
 *
 * **14/15 người có ảnh.** Ảnh do người dùng tự tải về từ trang Google Sites lúc
 * đang đăng nhập (agent tải từ ngoài chỉ nhận 403), rồi cắt vuông quanh đầu + vai
 * ở đây. Nguồn là chân dung dọc tỷ lệ 0,56–0,73 nên **không cắt giữa được** —
 * mỗi ảnh có khung cắt riêng đọc từ vị trí mặt thật.
 *
 * Cả 14 ảnh cắt theo cùng một luật: **đầu chiếm đúng 46% cạnh khung**, đường mắt
 * ở 40% chiều cao. Nhờ vậy các avatar cùng cỡ mặt thay vì mỗi ảnh một kiểu, và
 * cằm không rơi vào bốn góc bị hình tròn cắt mất. Thay ảnh thì cắt lại theo đúng
 * luật đó (script ở scratchpad nhận vào ba số ĐO ĐƯỢC: đỉnh tóc, cằm, tâm mặt).
 *
 * `linh` là ngoại lệ: không còn ảnh gốc, phải cắt vào từ chính bản 200×200 cũ nên
 * mềm nét hơn 13 ảnh kia. Có ảnh chụp mới thì nên thay.
 *
 * Còn thiếu: `phuong` (Hoàng Ngọc Phương). Thiếu key thì component dựng avatar
 * chữ cái đầu. **Đừng gán bừa ảnh người khác hay ảnh stock** — đây là người có
 * thật, gán sai mặt là bịa danh tính.
 */
export const TEAM_IMAGES = {
  hung: teamHung,
  tuan: teamTuan,
  ngan: teamNgan,
  phuoc: teamPhuoc,
  hien: teamHien,
  minh: teamMinh,
  manh: teamManh,
  thy: teamThy,
  tran: teamTran,
  huan: teamHuan,
  linh: teamLinh,
  nhat: teamNhat,
  tinh: teamTinh,
  nhi: teamNhi,
}

export const TEAM_IMAGE_SIZE = { width: 240, height: 240 }

/**
 * Logo đối tác, khớp với `partners.items[].id` trong i18n.
 *
 * Chỉ ba tổ chức này có logo thật trên site của trường. Đối tác thứ tư (Hệ thống
 * trường Việt Anh, có lễ ký kết ngày 19/7/2022) **không có logo** nên trong i18n
 * nó không có key ở đây — component hiển thị bằng chữ. Đừng đi tìm logo ở nguồn
 * khác rồi gán vào: logo sai còn tệ hơn không có logo.
 */
export const PARTNER_LOGOS = {
  hoasen: { src: partnerHoasen, width: 194, height: 120 },
  vietanh: { src: partnerVietanh, width: 194, height: 120 },
  little: { src: partnerLittlepeo, width: 194, height: 120 },
  tvbd: { src: partnerTvbd, width: 194, height: 120 },
  tvtphcm: { src: partnerTvtphcm, width: 194, height: 120 },
  petrusky: { src: partnerPetrusky, width: 194, height: 120 },
  talent: { src: partnerTalent, width: 194, height: 120 },
  eiu: { src: partnerEiu, width: 149, height: 120 },
  becamex: { src: partnerBecamex, width: 320, height: 68 },
  bbi: { src: partnerBbi, width: 194, height: 120 },
}

/**
 * Ảnh hoạt động, khớp với `activities.items[].id` trong i18n.
 *
 * Tỷ lệ rất lệch nhau (poster dọc 0.7 đến ảnh ngang 2.05) vì nguồn vốn trộn poster
 * và ảnh chụp — vì thế carousel dùng `object-contain` trên nền pastel chứ không
 * `object-cover`, kẻo cắt mất tiêu đề poster hoặc mặt người.
 *
 * Ba hoạt động cuối không có ảnh riêng trên trang gốc nên dùng lại ảnh thật khác
 * của FabLab, đánh dấu `// ~` như quy ước ở các map trên.
 */
export const ACTIVITY_IMAGES = {
  'drone-soccer': activityDroneSoccer,
  'mcr-2026': activityMcr2026,
  'racing-cup': activityRacingCup,
  'print-3d': activityPrint3d,
  'viet-anh': activityVietAnh,
  'laser-cnc': activityLaserCnc,
  'industrial-design': activityIndustrialDesign,
  nano: activityNano,
  'machine-learning': activityMachineLearning,
  'design-workshop': activityDesignWorkshop,
  'design-3d': activityDesign3d,
  stm32: courseElectronics, // ~ ảnh khóa điện tử, trang gốc không có ảnh
  'print-3d-medical': courseWater, // ~ ảnh một buổi hội thảo khác tại FabLab
  pcb: labWorkbenches, // ~ ảnh xưởng chung
}
