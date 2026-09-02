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
import activityIndustrialDesign from './activity-industrial-design.jpg'
import activityLaserCnc from './activity-laser-cnc.jpg'
import activityMachineLearning from './activity-machine-learning.jpg'
import activityMcr2023 from './activity-mcr-2023.jpg'
import activityNano from './activity-nano.jpg'
import activityPrint3d from './activity-print-3d.jpg'
import activityRacingCup from './activity-racing-cup.jpg'
import activityVietAnh from './activity-viet-anh.jpg'

import teamHien from './team-hien.jpg'
import teamHung from './team-hung.jpg'
import teamLinh from './team-linh.jpg'
import teamNgan from './team-ngan.jpg'
import teamNhat from './team-nhat.jpg'
import teamPhuoc from './team-phuoc.jpg'

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

/** Khớp với `courses.items[].id` trong i18n. Mọi ảnh đều 760×320. */
export const COURSE_IMAGES = {
  automation: courseAutomation,
  plastics: coursePlastics,
  process: courseProcess,
  photonics: coursePhotonics, // ~ sinh viên làm việc trên máy, không phải quang sợi
  mechatronics: courseMechatronics,
  mechanics: courseMechanics, // ~ sân thi robot, không phải xưởng cơ khí
  electrical: courseElectrical, // ~ phòng STEM trống
  electronics: courseElectronics,
  water: courseWater, // ~ giảng viên đứng lớp
  stress: courseStress,
  cnc: courseCnc, // ~ ảnh tập thể trong xưởng
  energy: courseEnergy,
  'robotic-arm': courseRoboticArm,
  humanoid: courseHumanoid,
  scratch: courseScratch,
  'robot-car': courseRobotCar,
}

export const COURSE_IMAGE_SIZE = { width: 760, height: 320 }

/**
 * Ảnh chân dung đội ngũ, khớp với `team.members[].id` trong i18n.
 *
 * **Chỉ 6/10 người có ảnh.** Trang "Về chúng tôi" của trường để ảnh mẫu
 * (`demo_image.jpg`) cho bốn người còn lại, nên ở đây họ không có key — component
 * dựng avatar chữ cái đầu thay vì gán bừa ảnh của người khác.
 */
export const TEAM_IMAGES = {
  hung: teamHung,
  hien: teamHien,
  ngan: teamNgan,
  nhat: teamNhat,
  linh: teamLinh,
  phuoc: teamPhuoc,
}

export const TEAM_IMAGE_SIZE = { width: 200, height: 200 }

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
  'mcr-2023': activityMcr2023,
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
