-- Form đăng ký có hai tab (Thành viên FabLab | Khóa học) cho database ĐÃ seed: thêm
-- `tabs`, `member`, `memberRoles`, `memberInterests` và ba mã lỗi `errors.age` /
-- `errors.birthYear` / `errors.role` vào section `register`. Database mới nhận chúng từ
-- seed; trên database trống hai câu UPDATE không khớp dòng nào nên là no-op.
--
-- Mỗi ngôn ngữ MỘT câu UPDATE → `rev` của register tăng đúng 2. Chốt theo TỪNG ngôn ngữ
-- bằng `member IS NULL` (bài học 004). `title` chỉ đổi khi còn đúng nguyên văn cũ;
-- `errors.*` mới chỉ thêm khi chưa có — chữ admin đã sửa giữ nguyên.
--
-- JSON đóng băng, sinh bằng máy từ `src/i18n/*.js` (đã qua registerSchema).

UPDATE section
   SET json = json_set(json,
         '$.title', CASE WHEN json_extract(json, '$.title') = 'Đăng ký khóa học'
                         THEN 'Đăng ký' ELSE json_extract(json, '$.title') END,
         '$.tabs', json('{"label":"Loại đăng ký","member":"Thành viên FabLab","course":"Khóa học"}'),
         '$.member', json('{"description":"Thành viên được sử dụng không gian và thiết bị của xưởng. Để lại thông tin, EIU FabLab sẽ liên hệ hướng dẫn thủ tục.","ageNote":"Dành cho người từ 16 tuổi trở lên. Học sinh nhỏ hơn vui lòng để phụ huynh đăng ký khóa học.","heading":"Thông tin của bạn","fullName":"Họ và tên","birthYear":"Năm sinh","birthYearHint":"Ví dụ: 2004","role":"Bạn là","roleNone":"Chọn một mục","organization":"Trường hoặc đơn vị","interests":"Lĩnh vực quan tâm","notePlaceholder":"Dự án bạn muốn làm, thời gian có thể đến xưởng…","consent":"Tôi đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ về việc đăng ký thành viên.","privacy":"Thông tin chỉ dùng để liên hệ và quản lý thành viên, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP)."}'),
         '$.memberRoles', json('{"eiu-student":"Sinh viên EIU","eiu-staff":"Giảng viên – cán bộ EIU","student":"Học sinh","worker":"Người đi làm","other":"Khác"}'),
         '$.memberInterests', json('{"3d-printing":"In 3D","laser":"Cắt khắc laser","cnc":"Gia công CNC","electronics":"Điện tử – lập trình","robotics":"Robot – tự động hoá","other":"Khác"}'),
         '$.errors.age', COALESCE(json_extract(json, '$.errors.age'), 'Thành viên cần từ 16 tuổi trở lên. Học sinh nhỏ hơn vui lòng đăng ký khóa học.'),
         '$.errors.birthYear', COALESCE(json_extract(json, '$.errors.birthYear'), 'Năm sinh chưa đúng (ví dụ 2004).'),
         '$.errors.role', COALESCE(json_extract(json, '$.errors.role'), 'Vui lòng chọn một mục.')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'register' AND locale = 'vi'
   AND json_extract(json, '$.member') IS NULL;

UPDATE section
   SET json = json_set(json,
         '$.title', CASE WHEN json_extract(json, '$.title') = 'Course registration'
                         THEN 'Register' ELSE json_extract(json, '$.title') END,
         '$.tabs', json('{"label":"Registration type","member":"FabLab membership","course":"Courses"}'),
         '$.member', json('{"description":"Members can use the workshop space and equipment. Leave your details and EIU FabLab will contact you about the next steps.","ageNote":"For people aged 16 and over. Younger students, please ask a parent to register for a course.","heading":"About you","fullName":"Full name","birthYear":"Year of birth","birthYearHint":"E.g. 2004","role":"You are","roleNone":"Choose one","organization":"School or organisation","interests":"Areas of interest","notePlaceholder":"Projects you want to build, when you can come to the lab…","consent":"I agree that EIU FabLab may process the information above to contact me about membership.","privacy":"Your information is used only for contacting you and managing membership, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP)."}'),
         '$.memberRoles', json('{"eiu-student":"EIU student","eiu-staff":"EIU lecturer or staff","student":"School student","worker":"Working professional","other":"Other"}'),
         '$.memberInterests', json('{"3d-printing":"3D printing","laser":"Laser cutting and engraving","cnc":"CNC machining","electronics":"Electronics and programming","robotics":"Robotics and automation","other":"Other"}'),
         '$.errors.age', COALESCE(json_extract(json, '$.errors.age'), 'Members must be 16 or older. Younger students, please register for a course.'),
         '$.errors.birthYear', COALESCE(json_extract(json, '$.errors.birthYear'), 'Year of birth looks wrong (e.g. 2004).'),
         '$.errors.role', COALESCE(json_extract(json, '$.errors.role'), 'Please choose one.')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'register' AND locale = 'en'
   AND json_extract(json, '$.member') IS NULL;
