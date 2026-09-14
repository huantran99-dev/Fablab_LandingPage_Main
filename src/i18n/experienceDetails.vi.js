/**
 * Nội dung chi tiết của 30 chương trình trải nghiệm STEM.
 *
 * KHÁC với `courseDetails.vi.js`: file kia là file SINH RA từ bộ scraper các trang
 * LearnPress, còn file này **viết tay** từ catalogue chính thức do FabLab EIU cung
 * cấp. Vì thế nó nằm riêng — chạy lại bộ scraper không được đụng tới đây.
 *
 * Mỗi chương trình có đúng bốn dòng `curriculum`, chép nguyên văn từ catalogue.
 * Không có `overview` / `knowledge` / `skills` / `sourceUrl`: catalogue không cung
 * cấp những mục đó, và popup chỉ render mục nào thật sự có dữ liệu.
 */
export const experienceDetailsVi = {
  // --- Khoa học tự nhiên và Sự sống ---------------------------------------
  'thien-nhien': {
    curriculum: [
      'Tìm hiểu các mùa trong năm.',
      'Tìm hiểu các hiện tượng thời tiết, thiên tai và nguyên nhân hình thành.',
      'Khám phá tác động của thiên tai và các biện pháp phòng tránh, ứng phó.',
      'Thực hành xây dựng mô hình mô phỏng thiên tai.',
    ],
  },
  'nang-luong-cuoc-song': {
    curriculum: [
      'Tìm hiểu về các dạng năng lượng và các nguồn năng lượng khác nhau.',
      'Tìm hiểu sự truyền năng lượng.',
      'Khám phá quá trình chuyển đổi năng lượng.',
      'Tham gia thử thách trò chơi "Cỗ máy một chạm".',
    ],
  },
  'am-thanh': {
    curriculum: [
      'Tìm hiểu nguồn âm và sự dao động tạo ra âm thanh.',
      'Tìm hiểu sự truyền âm và các môi trường truyền âm.',
      'Khám phá quá trình âm thanh được tai tiếp nhận và truyền tín hiệu đến não bộ.',
      'Thực hành truyền âm thông qua trò chơi tương tác.',
    ],
  },
  'nam-cham': {
    curriculum: [
      'Tìm hiểu về từ trường và vai trò của từ trường trong tự nhiên và đời sống.',
      'Khám phá mối liên hệ giữa nam châm và từ trường.',
      'Thực hành thí nghiệm về các tính chất cơ bản của nam châm.',
      'Tham gia thử thách trò chơi "Ma lực của nam châm".',
    ],
  },
  'cap-quang': {
    curriculum: [
      'Tìm hiểu hiện tượng khúc xạ ánh sáng và phản xạ toàn phần.',
      'Khám phá nguyên lý truyền ánh sáng trong cáp quang.',
      'Thực hành thí nghiệm truyền ánh sáng thông qua các hiện tượng khúc xạ và phản xạ toàn phần.',
      'Tham gia thử thách truyền tin qua mã Morse.',
    ],
  },
  polymer: {
    curriculum: [
      'Tìm hiểu về polymer và vai trò của polymer trong đời sống.',
      'Khám phá đặc điểm và ứng dụng của các nhóm vật liệu polymer.',
      'Thực hành các thí nghiệm với vật liệu polymer.',
      'Thử thách chế tạo nhựa biopolymer.',
    ],
  },
  'nang-luong-tai-tao': {
    curriculum: [
      'Tìm hiểu các nguồn năng lượng tái tạo.',
      'Tìm hiểu về quy trình chuyển đổi từ năng lượng gió đến điện năng.',
      'Khám phá nguyên lý hoạt động của tuabin gió.',
      'Thực hành đo lường điện năng tạo ra từ mô hình năng lượng tái tạo.',
    ],
  },
  'moi-truong-nuoc': {
    curriculum: [
      'Tìm hiểu nguyên nhân gây ô nhiễm môi trường nước.',
      'Khám phá các phương pháp xử lý nước thải.',
      'Thực hành thí nghiệm: đo pH, khử trùng và khử màu nước, kiểm tra nước bể bơi.',
      'Ứng dụng bộ thí nghiệm để xử lý nước.',
    ],
  },
  'nganh-nhua': {
    curriculum: [
      'Tìm hiểu khái niệm và phân loại polymer.',
      'Tìm hiểu các tính chất vật lý và hóa học của polymer.',
      'Khám phá sự khác nhau giữa phương pháp tổng hợp và gia công polymer.',
      'Thực hành phân loại nhựa và các thí nghiệm chế tạo polymer.',
    ],
  },

  // --- Kỹ thuật và công nghệ Robot ----------------------------------------
  'xe-robot': {
    curriculum: [
      'Tìm hiểu cấu tạo và chức năng của xe robot.',
      'Khám phá cách điều khiển xe robot bằng giọng nói và điều khiển từ xa.',
      'Thực hành điều khiển xe robot trên đường đua và vượt chướng ngại vật.',
      'Tham gia thử thách "Đường đua robot".',
    ],
  },
  drone: {
    curriculum: [
      'Tìm hiểu về drone và ứng dụng của drone trong thực tế.',
      'Khám phá nguyên lý bay của drone.',
      'Thực hành lập trình điều khiển drone.',
      'Tham gia trải nghiệm thử thách Drone Soccer.',
    ],
  },
  'canh-tay-robot': {
    curriculum: [
      'Tìm hiểu về đặc điểm và ứng dụng của cánh tay robot trong sản xuất.',
      'Khám phá về cấu tạo và nguyên lí làm việc của cánh tay robot.',
      'Thực hành lập trình điều khiển cánh tay robot.',
      'Tham gia thử thách trò chơi "Trạm hàng sắc màu".',
    ],
  },
  'robot-sinh-hoc': {
    curriculum: [
      'Tìm hiểu và nhận biết về loài động thực vật.',
      'Khám phá nguyên lý hoạt động của mô hình robot sinh học.',
      'Thực hành lắp ráp và vận hành mô hình robot sinh học.',
      'Tham gia trò chơi với mô hình robot sinh học.',
    ],
  },
  'kham-pha-dien': {
    curriculum: [
      'Tìm hiểu khái niệm nguồn điện và linh kiện điện.',
      'Tìm hiểu các nguyên tắc an toàn khi sử dụng điện.',
      'Khám phá chức năng của một số thiết bị điện và linh kiện điện tử cơ bản.',
      'Thực hành lắp ráp và kiểm tra hoạt động của mạch điện cơ bản.',
    ],
  },
  'thiet-ke-co-khi': {
    curriculum: [
      'Tìm hiểu bản vẽ kỹ thuật, hình chiếu và các quy ước biểu diễn.',
      'Khám phá cách đọc và phân tích bản vẽ kỹ thuật.',
      'Thực hành thiết kế sản phẩm mẫu.',
      'Thực hành gia công, lắp ráp sản phẩm theo bản vẽ.',
    ],
  },
  'co-dien-tu': {
    curriculum: [
      'Tìm hiểu về cơ điện tử và các ứng dụng trong thực tiễn.',
      'Tìm hiểu dây chuyền sản xuất và các linh kiện cơ bản.',
      'Khám phá phần mềm lập trình và các khối lệnh điều khiển.',
      'Thực hành lập trình điều khiển các module cơ điện tử.',
    ],
  },
  'co-hoc-sang-tao': {
    curriculum: [
      'Tìm hiểu về lực và momen lực.',
      'Khám phá nguyên lý hoạt động của một số máy cơ đơn giản.',
      'Thực hành sử dụng máy cơ đơn giản trong mô hình nâng hạ vật.',
      'Vận dụng kiến thức về lực và máy cơ để giải thích nguyên lý hoạt động của mô hình thang máy.',
    ],
  },
  cnc: {
    curriculum: [
      'Tìm hiểu về gia công cơ khí.',
      'Khám phá cấu tạo và nguyên lý hoạt động máy phay CNC.',
      'Thực hành thiết kế bản vẽ cơ khí đơn giản.',
      'Vận hành máy CNC để gia công sản phẩm.',
    ],
  },
  'in-3d': {
    curriculum: [
      'Tìm hiểu về công nghệ gia công bồi đắp - in 3D.',
      'Khám phá cấu tạo và nguyên lý hoạt động của máy in 3D.',
      'Thực hành chuẩn bị tệp và điều chỉnh các thông số in phù hợp với từng mẫu sản phẩm.',
      'Vận hành máy in 3D để in sản phẩm.',
    ],
  },
  'muc-nuoc-thong-minh': {
    curriculum: [
      'Tìm hiểu tổng quan về hệ thống điều khiển mức nước và ứng dụng thực tế.',
      'Khám phá điều khiển động cơ bơm, đọc dữ liệu các cảm biến.',
      'Ứng dụng điều khiển hồi tiếp để điều khiển mức nước theo mục tiêu.',
      'Ứng dụng nhận dạng giọng nói nhằm ra lệnh điều khiển mức nước và truy vấn thông tin của hệ thống.',
    ],
  },

  // --- AIoT & Công nghệ số -------------------------------------------------
  'lam-quen-ai': {
    curriculum: [
      'Tìm hiểu về trí tuệ nhân tạo (AI).',
      'Khám phá các ứng dụng của AI trong đời sống.',
      'Thực hành mô phỏng quá trình AI học dữ liệu.',
      'Tham gia thử thách trò chơi "AI đã học gì?".',
    ],
  },
  'the-gioi-ao': {
    curriculum: [
      'Tìm hiểu về vai trò của lập trình trong điều khiển robot.',
      'Khám phá phần mềm lập trình và các khối lệnh cơ bản.',
      'Thực hành lập trình robot di chuyển trong sa bàn mô phỏng.',
      'Vận dụng kiến thức lập trình để thực hiện dự án "Kỹ sư nông trại tài ba".',
    ],
  },
  'noi-dung-so': {
    curriculum: [
      'Tìm hiểu AI tạo sinh và AI truyền thống.',
      'Khám phá cách sử dụng mô tả chuẩn (prompt) để tạo hình ảnh với AI.',
      'Tìm hiểu cách dựng video với hình ảnh và âm thanh.',
      'Thực hành xây dựng câu chuyện ngắn với công cụ chuyên dụng.',
    ],
  },
  'cau-truc-may-tinh': {
    curriculum: [
      'Tìm hiểu cấu trúc và chức năng các linh kiện chính của máy tính.',
      'Tìm hiểu vai trò của linh kiện máy tính: CPU, mainboard, RAM, SSD/HDD…',
      'Khám phá cách lựa chọn linh kiện và phần cứng phù hợp với nhu cầu.',
      'Thực hành lựa chọn linh kiện phù hợp với mục đích sử dụng.',
    ],
  },
  'thiet-ke-3d': {
    curriculum: [
      'Tìm hiểu về thiết kế 3D.',
      'Tìm hiểu hệ trục tọa độ trong không gian 3 chiều.',
      'Khám phá công cụ thiết kế in 3D.',
      'Thực hành thiết kế 3D với phần mềm chuyên dụng.',
    ],
  },
  blockchain: {
    curriculum: [
      'Tìm hiểu về lịch sử của tiền tệ từ sơ khai cho đến kỷ nguyên số.',
      'Tìm hiểu về công nghệ Blockchain qua tiền điện tử.',
      'Hiểu rõ cơ chế bảo mật của Blockchain thông qua liên kết mã Hash giữa các khối.',
      'Thực hành mô phỏng xác thực khối trong Blockchain.',
    ],
  },
  iot: {
    curriculum: [
      'Tìm hiểu nguyên lý kết nối và điều khiển thiết bị IoT.',
      'Khám phá lập trình giao diện ứng dụng và vai trò của nền tảng lưu trữ đám mây.',
      'Thực hành thiết kế giao diện ứng dụng điều khiển.',
      'Lập trình và điều khiển mô hình IoT bằng giao diện thông minh.',
    ],
  },
  'thi-giac-may-tinh': {
    curriculum: [
      'Tìm hiểu sơ lược về học máy.',
      'Khám phá vai trò và phân loại học máy trong thực tế.',
      'Thực hành quy trình học máy cùng mạng nơron tích chập.',
      'Ứng dụng học máy trong nhận diện vật thể.',
    ],
  },
  'xac-suat-hoc-may': {
    curriculum: [
      'Tìm hiểu định lý Naïve Bayes.',
      'Thực hành thu thập và phân tích dữ liệu về lịch sử khách hàng.',
      'Áp dụng thuật toán Naïve Bayes để dự đoán hành vi của khách hàng dựa trên dữ liệu.',
      'Đánh giá hiệu suất dựa trên độ chính xác.',
    ],
  },
  'thiet-ke-website': {
    curriculum: [
      'Tìm hiểu các khái niệm cơ bản về giao diện người dùng và trải nghiệm người dùng.',
      'Khám phá quy trình thiết kế giao diện website.',
      'Khám phá các chức năng cơ bản của công cụ chuyên dụng trong thiết kế website.',
      'Thực hành thiết kế một website đơn giản.',
    ],
  },
}
