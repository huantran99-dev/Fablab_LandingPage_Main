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
