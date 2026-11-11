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

import activityDroneSoccer from './activity-drone-soccer.jpg'
import activityMcr2026 from './activity-mcr-2026.jpg'
import activityRacingCup from './activity-racing-cup.jpg'
import activityWs26FablabIntro from './activity-ws26-fablab-intro.jpg'
import activityWs26Lantern from './activity-ws26-lantern.jpg'
import activityWs26Bouquet from './activity-ws26-bouquet.jpg'
import activityWs26Decoden from './activity-ws26-decoden.jpg'
import activityWs26Beads from './activity-ws26-beads.jpg'
import activityWs26Glass from './activity-ws26-glass.jpg'
import activityWs26Clay from './activity-ws26-clay.jpg'
import activityWs26Git from './activity-ws26-git.jpg'
import activityWs26MechDesign from './activity-ws26-mech-design.jpg'
import activityUavF1tenth from './activity-uav-f1tenth.jpg'
import activityWs26Machines from './activity-ws26-machines.jpg'

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
import equipForm3 from './equipment-form-3.jpg'
import equipCubicon210f from './equipment-cubicon-210f.jpg'
import equipCubicon310f from './equipment-cubicon-310f.jpg'
import equipShining3d from './equipment-shining-3d.jpg'
import equipEpilogMiniHelix18 from './equipment-epilog-mini-helix-18.jpg'
import equipRolandSrm20 from './equipment-roland-srm-20.jpg'
import equipProxxonFf500 from './equipment-proxxon-ff500.jpg'
import equipProxxonPd400 from './equipment-proxxon-pd400.jpg'
import equipProxxonDs460 from './equipment-proxxon-ds460.jpg'
import equipGwinstekGfg8255a from './equipment-gwinstek-gfg-8255a.jpg'
import equipGwinstekGds2204a from './equipment-gwinstek-gds-2204a.jpg'
import equipGwinstekGpd2303s from './equipment-gwinstek-gpd-2303s.jpg'
import projectCobot from './project-cobot.jpg'
import projectPlane from './project-plane.jpg'
import projectMicrobitKit from './project-microbit-kit.jpg'
import projectJawModel from './project-jaw-model.jpg'
import projectSmartLight from './project-smart-light.jpg'
import projectRefractionModel from './project-refraction-model.jpg'
import projectMcrRacingCar from './project-mcr-racing-car.jpg'
import projectHydroponicGarden from './project-hydroponic-garden.jpg'
// Ảnh thẻ khóa học — cắt từ bộ slide chính thức "Giới thiệu STEMLab" (xem COURSE_IMAGES).
import stemlabThienNhien from './stemlab-thien-nhien.jpg'
import stemlabNangLuongCuocSong from './stemlab-nang-luong-cuoc-song.jpg'
import stemlabAmThanh from './stemlab-am-thanh.jpg'
import stemlabNamCham from './stemlab-nam-cham.jpg'
import stemlabCapQuang from './stemlab-cap-quang.jpg'
import stemlabPolymer from './stemlab-polymer.jpg'
import stemlabNangLuongTaiTao from './stemlab-nang-luong-tai-tao.jpg'
import stemlabMoiTruongNuoc from './stemlab-moi-truong-nuoc.jpg'
import stemlabNganhNhua from './stemlab-nganh-nhua.jpg'
import stemlabXeRobot from './stemlab-xe-robot.jpg'
import stemlabDrone from './stemlab-drone.jpg'
import stemlabCanhTayRobot from './stemlab-canh-tay-robot.jpg'
import stemlabRobotSinhHoc from './stemlab-robot-sinh-hoc.jpg'
import stemlabKhamPhaDien from './stemlab-kham-pha-dien.jpg'
import stemlabThietKeCoKhi from './stemlab-thiet-ke-co-khi.jpg'
import stemlabCoDienTu from './stemlab-co-dien-tu.jpg'
import stemlabCoHocSangTao from './stemlab-co-hoc-sang-tao.jpg'
import stemlabCnc from './stemlab-cnc.jpg'
import stemlabIn3d from './stemlab-in-3d.jpg'
import stemlabMucNuocThongMinh from './stemlab-muc-nuoc-thong-minh.jpg'
import stemlabLamQuenAi from './stemlab-lam-quen-ai.jpg'
import stemlabTheGioiAo from './stemlab-the-gioi-ao.jpg'
import stemlabNoiDungSo from './stemlab-noi-dung-so.jpg'
import stemlabCauTrucMayTinh from './stemlab-cau-truc-may-tinh.jpg'
import stemlabThietKe3d from './stemlab-thiet-ke-3d.jpg'
import stemlabBlockchain from './stemlab-blockchain.jpg'
import stemlabIot from './stemlab-iot.jpg'
import stemlabThiGiacMayTinh from './stemlab-thi-giac-may-tinh.jpg'
import stemlabXacSuatHocMay from './stemlab-xac-suat-hoc-may.jpg'
import stemlabThietKeWebsite from './stemlab-thiet-ke-website.jpg'
import stemlabTheGioiRobot from './stemlab-the-gioi-robot.jpg'
import stemlabXeRobotChuyenSau from './stemlab-xe-robot-chuyen-sau.jpg'
import stemlabLapTrinhAi from './stemlab-lap-trinh-ai.jpg'
import stemlabTheGioi3d from './stemlab-the-gioi-3d.jpg'
import stemlabWebsiteChuyenSau from './stemlab-website-chuyen-sau.jpg'
import stemlabAiKhoaHocDuLieu from './stemlab-ai-khoa-hoc-du-lieu.jpg'
import stemlabTheGioiDienTu from './stemlab-the-gioi-dien-tu.jpg'

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
 * Khớp với `equipment.items[].id` trong i18n — ảnh trong popup thông số thiết bị.
 *
 * Đây là ảnh SẢN PHẨM (nền trắng) đăng trên trang Thiết bị của FabLab
 * (`fablab.eiu.edu.vn/vi/thiet-bi/`), không phải ảnh chụp tại xưởng — nên mọi dòng
 * đều mang `// ~`. Gán bằng cách mở từng ảnh ra xem và khớp chữ in trên máy, KHÔNG
 * theo thứ tự trong HTML. Đã làm phẳng nền trong suốt sang trắng và thu về ≤ 800px.
 */
export const EQUIPMENT_IMAGES = {
  'form-3': { src: equipForm3, width: 339, height: 414 }, // ~ ảnh sản phẩm
  'cubicon-210f': { src: equipCubicon210f, width: 300, height: 300 }, // ~ ảnh sản phẩm
  'cubicon-310f': { src: equipCubicon310f, width: 800, height: 790 }, // ~ ảnh sản phẩm
  'shining-3d': { src: equipShining3d, width: 800, height: 737 }, // ~ ảnh sản phẩm
  'epilog-mini-helix-18': { src: equipEpilogMiniHelix18, width: 800, height: 545 }, // ~ ảnh sản phẩm
  'roland-srm-20': { src: equipRolandSrm20, width: 480, height: 360 }, // ~ ảnh sản phẩm
  'proxxon-ff500': { src: equipProxxonFf500, width: 663, height: 800 }, // ~ ảnh sản phẩm
  'proxxon-pd400': { src: equipProxxonPd400, width: 800, height: 436 }, // ~ ảnh sản phẩm
  'proxxon-ds460': { src: equipProxxonDs460, width: 800, height: 623 }, // ~ ảnh sản phẩm
  'gwinstek-gfg-8255a': { src: equipGwinstekGfg8255a, width: 800, height: 480 }, // ~ ảnh sản phẩm
  'gwinstek-gds-2204a': { src: equipGwinstekGds2204a, width: 378, height: 378 }, // ~ ảnh sản phẩm
  'gwinstek-gpd-2303s': { src: equipGwinstekGpd2303s, width: 378, height: 378 }, // ~ ảnh sản phẩm
}

/**
 * Khớp với `projects.items[].id` trong i18n.
 *
 * Ảnh dự án thật đăng trên trang Dự án của FabLab (`fablab.eiu.edu.vn/vi/du-an/`),
 * gán bằng cách mở từng ảnh ra xem chứ không theo thứ tự HTML. Phần lớn là ảnh đã
 * tách nền — đã làm phẳng nền trong suốt sang trắng. Bản VI và EN dùng hai file khác
 * nhau cho kit micro:bit, máy bay và đèn thông minh nhưng cùng một ảnh; lấy bản lớn hơn.
 */
export const PROJECT_IMAGES = {
  cobot: { src: projectCobot, width: 278, height: 681 },
  plane: { src: projectPlane, width: 577, height: 433 },
  'microbit-kit': { src: projectMicrobitKit, width: 617, height: 404 },
  'jaw-model': { src: projectJawModel, width: 317, height: 453 },
  'smart-light': { src: projectSmartLight, width: 530, height: 471 },
  'refraction-model': { src: projectRefractionModel, width: 483, height: 449 },
  'mcr-racing-car': { src: projectMcrRacingCar, width: 517, height: 229 },
  'hydroponic-garden': { src: projectHydroponicGarden, width: 598, height: 417 },
}

/**
 * Khớp với `courses.items[].id` trong i18n. Mọi ảnh đều 760×320.
 *
 * **Thiếu một id là card hiện ảnh vỡ** — không có ảnh mặc định, cũng không có
 * cảnh báo lúc build. Thêm chương trình thì phải thêm ở đây.
 *
 * Từ 2026-11-05 mỗi khóa một ảnh RIÊNG, cắt từ chính slide của khóa đó trong bộ slide
 * chính thức "Giới thiệu STEMLab" (số slide ghi ở comment; ghi chú này cũng thành ghi chú
 * nguồn của binding). Chọn bằng mắt — ưu tiên ảnh chụp thật buổi học — rồi cắt về 760×320;
 * quy trình ở CLAUDE.md, mục "Hình ảnh". Ảnh cũ (`course-*.jpg`) còn trong thư mục cho các
 * section khác, không còn khóa nào dùng.
 */
export const COURSE_IMAGES = {
  // --- Khoa học tự nhiên và Sự sống ------------------------------------------
  'thien-nhien': stemlabThienNhien, // slide 5
  'nang-luong-cuoc-song': stemlabNangLuongCuocSong, // slide 8
  'am-thanh': stemlabAmThanh, // slide 9
  'nam-cham': stemlabNamCham, // slide 10
  'cap-quang': stemlabCapQuang, // slide 11
  polymer: stemlabPolymer, // slide 12
  'nang-luong-tai-tao': stemlabNangLuongTaiTao, // slide 19
  'moi-truong-nuoc': stemlabMoiTruongNuoc, // slide 20
  'nganh-nhua': stemlabNganhNhua, // slide 21

  // --- Kỹ thuật và công nghệ Robot -------------------------------------------
  'xe-robot': stemlabXeRobot, // slide 6
  drone: stemlabDrone, // slide 13
  'canh-tay-robot': stemlabCanhTayRobot, // slide 14
  'robot-sinh-hoc': stemlabRobotSinhHoc, // slide 15
  'kham-pha-dien': stemlabKhamPhaDien, // slide 16
  'thiet-ke-co-khi': stemlabThietKeCoKhi, // slide 22
  'co-dien-tu': stemlabCoDienTu, // slide 23
  'co-hoc-sang-tao': stemlabCoHocSangTao, // slide 24
  cnc: stemlabCnc, // slide 25
  'in-3d': stemlabIn3d, // slide 26
  'muc-nuoc-thong-minh': stemlabMucNuocThongMinh, // slide 27

  // --- AIoT & Công nghệ số ---------------------------------------------------
  'lam-quen-ai': stemlabLamQuenAi, // slide 7
  'the-gioi-ao': stemlabTheGioiAo, // slide 17
  'noi-dung-so': stemlabNoiDungSo, // slide 18
  'cau-truc-may-tinh': stemlabCauTrucMayTinh, // slide 28
  'thiet-ke-3d': stemlabThietKe3d, // slide 29
  blockchain: stemlabBlockchain, // slide 30
  iot: stemlabIot, // slide 31
  'thi-giac-may-tinh': stemlabThiGiacMayTinh, // slide 32
  'xac-suat-hoc-may': stemlabXacSuatHocMay, // slide 33
  'thiet-ke-website': stemlabThietKeWebsite, // slide 34

  // --- Khóa học chuyên sâu (nhóm STEM) ---------------------------------------
  'the-gioi-robot': stemlabTheGioiRobot, // slide 36
  'xe-robot-chuyen-sau': stemlabXeRobotChuyenSau, // slide 37
  'lap-trinh-ai': stemlabLapTrinhAi, // slide 38
  'the-gioi-3d': stemlabTheGioi3d, // slide 39
  'website-chuyen-sau': stemlabWebsiteChuyenSau, // slide 40
  'ai-khoa-hoc-du-lieu': stemlabAiKhoaHocDuLieu, // slide 41
  'the-gioi-dien-tu': stemlabTheGioiDienTu, // slide 42
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
 * 11 workshop 2026: ảnh / poster đầu tiên của bài đăng trên fanpage, lấy từ tài liệu
 * "Workshop EIU FabLab 2026" (qua bản export .docx — cao ~489px). Đã mở từng ảnh ra xem,
 * khớp tên và ngày in trên poster / màn hình.
 */
export const ACTIVITY_IMAGES = {
  'drone-soccer': activityDroneSoccer,
  'mcr-2026': activityMcr2026,
  'racing-cup': activityRacingCup,
  'ws26-fablab-intro': activityWs26FablabIntro,
  'ws26-lantern': activityWs26Lantern,
  'ws26-bouquet': activityWs26Bouquet,
  'ws26-decoden': activityWs26Decoden,
  'ws26-beads': activityWs26Beads,
  'ws26-glass': activityWs26Glass,
  'ws26-clay': activityWs26Clay,
  'ws26-git': activityWs26Git,
  'ws26-mech-design': activityWs26MechDesign,
  'uav-f1tenth': activityUavF1tenth,
  'ws26-machines': activityWs26Machines,
}
