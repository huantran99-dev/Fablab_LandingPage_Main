-- Đưa section `register` (chữ của form đăng ký) vào database ĐÃ seed.
--
-- `npm run seed` chỉ chạy được trên database trống, nên section thêm sau ngày seed
-- phải đi đường này. Hai chốt, đều bắt buộc:
--
--   * `WHERE EXISTS (SELECT 1 FROM section)`: trên database TRỐNG, migration chạy
--     trước seed (getDb() áp migration ngay khi mở). Chèn vào lúc đó là seed sẽ từ
--     chối chạy vì "database đã có nội dung". Database mới nhận `register` từ seed.
--   * `NOT EXISTS (... key = 'register' AND locale = ...)`: không chèn đè bản admin
--     đã sửa. Chốt PHẢI theo từng ngôn ngữ: chốt theo key thôi thì dòng `vi` vừa
--     chèn làm câu thứ hai thấy "đã có", và `en` không bao giờ vào (đã xảy ra lúc thử).
--
-- JSON dưới đây là bản ĐÓNG BĂNG của `vi.register` / `en.register` lúc viết
-- migration, sinh bằng máy chứ không gõ tay. Từ sau lượt này database là nguồn sự
-- thật; sửa `src/i18n/*.js` không cập nhật file này và cũng không cần.
--
-- Hai dòng mới cộng thêm 2 vào SUM(section.rev), nên bộ đệm, ETag và contentStore
-- của người xem tự làm mới.

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'vi', 'register', '{"title":"Đăng ký khóa học","description":"Để lại thông tin, EIU FabLab sẽ liên hệ lại để tư vấn khóa học phù hợp.","course":"Khóa học quan tâm","courseNone":"Chưa chọn — cần tư vấn thêm","studentHeading":"Thông tin học viên","studentName":"Họ và tên học viên","studentGrade":"Năm sinh hoặc lớp","studentGradeHint":"Ví dụ: 2014 hoặc lớp 6","school":"Trường đang học","parentHeading":"Thông tin phụ huynh","parentName":"Họ và tên phụ huynh","phone":"Số điện thoại","email":"Email","note":"Ghi chú","notePlaceholder":"Lịch học mong muốn, câu hỏi cho FabLab…","required":"bắt buộc","optional":"không bắt buộc","consent":"Tôi đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ tư vấn khóa học.","privacy":"Thông tin chỉ dùng để tư vấn và xếp lớp, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP).","submit":"Gửi đăng ký","submitting":"Đang gửi…","close":"Đóng","errorSummary":"Vui lòng kiểm tra lại {count} mục bên dưới.","errors":{"required":"Vui lòng điền mục này.","phone":"Số điện thoại chưa đúng (ví dụ 0912 345 678).","email":"Email chưa đúng định dạng.","consent":"Cần đồng ý để FabLab có thể liên hệ với bạn.","tooLong":"Nội dung quá dài.","rateLimited":"Bạn đã gửi nhiều lần liên tiếp. Vui lòng thử lại sau ít phút.","paused":"Hệ thống tạm ngưng nhận đăng ký trực tuyến. Vui lòng gọi {phone}.","network":"Chưa gửi được. Vui lòng thử lại hoặc gọi {phone}."},"success":{"title":"Đã nhận đăng ký!","message":"Cảm ơn bạn. EIU FabLab sẽ liên hệ qua số điện thoại bạn đã cung cấp.","close":"Đóng"}}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'register' AND locale = 'vi');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'en', 'register', '{"title":"Course registration","description":"Leave your details and EIU FabLab will get back to you with advice on a suitable course.","course":"Course of interest","courseNone":"Not sure yet — please advise","studentHeading":"Student","studentName":"Student full name","studentGrade":"Year of birth or grade","studentGradeHint":"E.g. 2014 or grade 6","school":"Current school","parentHeading":"Parent or guardian","parentName":"Parent full name","phone":"Phone number","email":"Email","note":"Note","notePlaceholder":"Preferred schedule, questions for FabLab…","required":"required","optional":"optional","consent":"I agree that EIU FabLab may process the information above to contact me about courses.","privacy":"Your information is used only for course advice and class placement, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP).","submit":"Send registration","submitting":"Sending…","close":"Close","errorSummary":"Please check {count} fields below.","errors":{"required":"Please fill in this field.","phone":"Phone number looks wrong (e.g. 0912 345 678).","email":"Email address looks wrong.","consent":"We need your consent to contact you.","tooLong":"This is too long.","rateLimited":"Too many attempts in a row. Please try again in a few minutes.","paused":"Online registration is paused. Please call {phone}.","network":"Could not send. Please try again or call {phone}."},"success":{"title":"Registration received!","message":"Thank you. EIU FabLab will contact you on the phone number you provided.","close":"Close"}}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'register' AND locale = 'en');
