-- Nút, popup và form do admin tạo (API 23). SINH BẰNG MÁY: phần JSON của hai section mới lấy từ
-- src/i18n (vi.js / en.js) — sửa chữ ở đó rồi sinh lại, đừng sửa tay ở đây.
--
-- 1. `hero` / `finalCta` / `nav`: nút cũ (chỉ có chữ, hành động viết cứng trong component) thành
--    danh sách `buttons` có hành động — dựng từ CHỮ ĐANG CÓ trong database (admin đã sửa chữ thì
--    giữ nguyên), hành động y như mã cũ: Hero → #courses / #facilities, cuối trang → mở form đăng
--    ký / #contact, thanh menu → mở form đăng ký. Bỏ khoá cũ. Chốt: `buttons` IS NULL và khoá cũ
--    còn đó. Mỗi câu chạm hai dòng (vi + en) → `rev` +2 mỗi section.
-- 2. Section mới `popups` và `forms` (mục mẫu, không nút nào trỏ tới; form mẫu đang đóng nhận).
--    Chốt theo TỪNG ngôn ngữ như 004 / 020.
-- 3. Bảng `registration` DỰNG LẠI y như 014 / 017 / 021 / 024: CHECK của `source` thêm 'hero' và
--    'popup' (nút do admin tạo ở Hero / trong popup mở được form đăng ký). Mọi cột giữ nguyên.
-- 4. Bảng mới `form_submission`: bài gửi của form tự tạo, câu trả lời dạng JSON theo id ô kèm nhãn
--    tiếng Việt chụp lúc gửi (form sửa / xoá về sau vẫn đọc được bài cũ). `source` không có CHECK
--    (Zod kiểm) để thêm chỗ đặt nút không phải dựng lại bảng.

UPDATE section
   SET json = json_set(
         json_remove(json, '$.primaryCta', '$.secondaryCta'),
         '$.buttons', json_array(
           json_object('id', 'primary', 'label', json_extract(json, '$.primaryCta'), 'style', 'primary', 'arrow', json('true'), 'action', 'link', 'href', '#courses'),
           json_object('id', 'secondary', 'label', json_extract(json, '$.secondaryCta'), 'style', 'secondary', 'action', 'link', 'href', '#facilities'))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'hero'
   AND json_extract(json, '$.buttons') IS NULL
   AND json_extract(json, '$.primaryCta') IS NOT NULL;

UPDATE section
   SET json = json_set(
         json_remove(json, '$.primaryCta', '$.secondaryCta'),
         '$.buttons', json_array(
           json_object('id', 'primary', 'label', json_extract(json, '$.primaryCta'), 'style', 'primary', 'arrow', json('true'), 'action', 'register'),
           json_object('id', 'secondary', 'label', json_extract(json, '$.secondaryCta'), 'style', 'secondary', 'action', 'link', 'href', '#contact'))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'finalCta'
   AND json_extract(json, '$.buttons') IS NULL
   AND json_extract(json, '$.primaryCta') IS NOT NULL;

UPDATE section
   SET json = json_set(
         json_remove(json, '$.cta'),
         '$.buttons', json_array(
           json_object('id', 'register', 'label', json_extract(json, '$.cta'), 'style', 'primary', 'action', 'register'))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'nav'
   AND json_extract(json, '$.buttons') IS NULL
   AND json_extract(json, '$.cta') IS NOT NULL;

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'vi', 'popups', '{"close":"Đóng","items":[{"id":"popup-mau","title":"Popup mẫu","body":"Đây là popup mẫu. Sửa tiêu đề, nội dung, thêm ảnh và nút, rồi chọn \"Mở popup\" cho một nút trên trang để người xem mở được nó.","buttons":[{"id":"courses","label":"Xem khóa học","style":"primary","action":"link","href":"#courses"}]}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'popups' AND locale = 'vi');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'en', 'popups', '{"close":"Close","items":[{"id":"popup-mau","title":"Sample popup","body":"This is a sample popup. Edit the title and text, add an image and buttons, then set a button on the page to \"Open popup\" so visitors can open it.","buttons":[{"id":"courses","label":"See courses","style":"primary","action":"link","href":"#courses"}]}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'popups' AND locale = 'en');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'vi', 'forms', '{"birthYear":"Năm sinh","birthYearHint":"Ví dụ: 2004","parentName":"Họ và tên phụ huynh","parentNote":"Người dưới 16 tuổi: phụ huynh hoặc người giám hộ điền họ tên của mình và đồng ý thay.","adultOnly":"Form này dành cho người từ 16 tuổi trở lên.","closedMessage":"Form này đã ngừng nhận bài gửi.","invalid":"Giá trị chưa hợp lệ.","selectPlaceholder":"Chọn một mục","items":[{"id":"gop-y","title":"Góp ý / Liên hệ","description":"Gửi câu hỏi hoặc góp ý cho EIU FabLab. Chúng tôi sẽ liên hệ lại qua số điện thoại hoặc email bạn để lại.","submitLabel":"Gửi","successTitle":"Đã gửi","successBody":"Cảm ơn bạn. EIU FabLab sẽ liên hệ lại sớm.","consent":"Tôi đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ lại với tôi.","privacy":"Thông tin chỉ dùng để liên hệ lại, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP).","closed":true,"fields":[{"id":"ho-ten","label":"Họ và tên","help":"","fieldType":"text","required":true},{"id":"dien-thoai","label":"Số điện thoại","help":"","fieldType":"phone","required":true},{"id":"email","label":"Email","help":"","fieldType":"email"},{"id":"noi-dung","label":"Nội dung","help":"","fieldType":"textarea","required":true}]}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'forms' AND locale = 'vi');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'en', 'forms', '{"birthYear":"Year of birth","birthYearHint":"E.g. 2004","parentName":"Parent or guardian full name","parentNote":"Under 16: a parent or guardian fills in their own name and gives consent on their behalf.","adultOnly":"This form is for people aged 16 or over.","closedMessage":"This form is no longer accepting submissions.","invalid":"This value is not valid.","selectPlaceholder":"Choose one","items":[{"id":"gop-y","title":"Feedback / Contact","description":"Send EIU FabLab a question or feedback. We will get back to you by the phone number or email you leave.","submitLabel":"Send","successTitle":"Sent","successBody":"Thank you. EIU FabLab will get back to you soon.","consent":"I agree that EIU FabLab may process the information above to get back to me.","privacy":"Your information is used only to get back to you, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP).","closed":true,"fields":[{"id":"ho-ten","label":"Full name","help":"","fieldType":"text","required":true},{"id":"dien-thoai","label":"Phone number","help":"","fieldType":"phone","required":true},{"id":"email","label":"Email","help":"","fieldType":"email"},{"id":"noi-dung","label":"Message","help":"","fieldType":"textarea","required":true}]}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'forms' AND locale = 'en');

CREATE TABLE registration_new (
  id            INTEGER PRIMARY KEY,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'course' CHECK (kind IN ('course', 'member', 'event')),
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'enrolled', 'cancelled')),
  status_at     TEXT,
  -- NULL = chưa chọn khóa, cần tư vấn (chỉ có nghĩa với kind = 'course').
  course_id     TEXT,
  -- Tên khóa (bản VI) chụp lại lúc gửi, do máy chủ tra — khóa bị xoá về sau vẫn đọc được.
  course_title  TEXT,
  -- Hoạt động (kind = 'event') và tên bản VI chụp lúc gửi, cùng lý do với course_title.
  event_id      TEXT,
  event_title   TEXT,
  locale        TEXT NOT NULL CHECK (locale IN ('vi', 'en')),
  student_name  TEXT NOT NULL,
  student_grade TEXT,
  school        TEXT,
  parent_name   TEXT,
  -- Đã chuẩn hoá về dạng 0xxxxxxxxx.
  phone         TEXT NOT NULL,
  email         TEXT,
  note          TEXT,
  admin_note    TEXT,
  birth_year    INTEGER,
  member_role   TEXT,
  interests     TEXT,
  source        TEXT NOT NULL
                CHECK (source IN ('course-modal', 'final-cta', 'nav', 'nav-drawer', 'seasonal-popup', 'events', 'hero', 'popup')),
  referrer_host TEXT,
  consent_at    TEXT NOT NULL,
  -- Nguyên văn câu đồng ý người gửi đã thấy: bằng chứng theo Nghị định 13/2023.
  consent_text  TEXT NOT NULL,
  CHECK (kind <> 'course' OR parent_name IS NOT NULL),
  CHECK (kind <> 'event' OR event_id IS NOT NULL)
);

INSERT INTO registration_new
  (id, created_at, updated_at, kind, status, status_at, course_id, course_title, event_id, event_title,
   locale, student_name, student_grade, school, parent_name, phone, email, note, admin_note,
   birth_year, member_role, interests, source, referrer_host, consent_at, consent_text)
SELECT id, created_at, updated_at, kind, status, status_at, course_id, course_title, event_id, event_title,
       locale, student_name, student_grade, school, parent_name, phone, email, note, admin_note,
       birth_year, member_role, interests, source, referrer_host, consent_at, consent_text
  FROM registration;

DROP TABLE registration;
ALTER TABLE registration_new RENAME TO registration;

CREATE INDEX registration_created ON registration (created_at DESC);
CREATE INDEX registration_status ON registration (status, created_at DESC);
CREATE INDEX registration_course ON registration (course_id, created_at DESC);
CREATE INDEX registration_phone ON registration (phone, created_at DESC);
CREATE INDEX registration_kind ON registration (kind, created_at DESC);
CREATE INDEX registration_event ON registration (event_id, created_at DESC);

CREATE TABLE form_submission (
  id            INTEGER PRIMARY KEY,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  form_id       TEXT NOT NULL,
  -- Tên form (bản VI) chụp lúc gửi — form bị xoá / đổi tên về sau vẫn đọc được.
  form_title    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'done', 'cancelled')),
  status_at     TEXT,
  locale        TEXT NOT NULL CHECK (locale IN ('vi', 'en')),
  -- [{ id, label, type, value }] theo thứ tự ô của form lúc gửi; nhãn là bản VI chụp lúc gửi.
  answers_json  TEXT NOT NULL,
  birth_year    INTEGER NOT NULL,
  -- Bắt buộc khi người gửi dưới 16 tuổi (form bật allowMinors) — máy chủ kiểm.
  parent_name   TEXT,
  -- Ô điện thoại / email ĐẦU TIÊN của form, chép ra để tìm kiếm và liên lạc. Điện thoại đã
  -- chuẩn hoá về 0xxxxxxxxx.
  phone         TEXT,
  email         TEXT,
  source        TEXT NOT NULL,
  referrer_host TEXT,
  admin_note    TEXT,
  consent_at    TEXT NOT NULL,
  -- Nguyên văn câu đồng ý + thông báo xử lý dữ liệu người gửi đã thấy (Nghị định 13/2023).
  consent_text  TEXT NOT NULL
);

CREATE INDEX form_submission_created ON form_submission (created_at DESC);
CREATE INDEX form_submission_form ON form_submission (form_id, created_at DESC);
CREATE INDEX form_submission_status ON form_submission (status, created_at DESC);
CREATE INDEX form_submission_phone ON form_submission (phone, created_at DESC);
