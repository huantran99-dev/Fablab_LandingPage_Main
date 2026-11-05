-- Nút đăng ký sự kiện + loại đăng ký thứ ba `event` (API 22). SINH BẰNG MÁY: phần JSON lấy từ
-- src/i18n (vi.js / en.js) — sửa chữ ở đó rồi sinh lại, đừng sửa tay ở đây.
--
-- 1. Bảng `registration` DỰNG LẠI y như 014 / 017 / 021 (SQLite không sửa được CHECK của cột có
--    sẵn): `kind` thêm 'event'; hai cột mới `event_id` (id hoạt động) và `event_title` (tên bản VI
--    chụp lúc gửi — hoạt động bị xoá về sau vẫn đọc được); luật phụ huynh đổi thành "khóa học
--    phải có phụ huynh" (sự kiện chỉ cần khi dưới 16 tuổi — máy chủ kiểm). Mọi cột cũ giữ nguyên.
--    Bảng có tên trẻ em thật: đã thử trên bản sao, so số dòng và mã băm các cột cũ trước/sau.
-- 2. `activities`: nhãn nút theo loại `registerCta`; bỏ `joinMember` (nút thành viên, trang không còn
--    dùng từ API 22 — để lại thì dashboard không có ô sửa và check:admin báo lỗi).
-- 3. `register`: chữ của form sự kiện `event` + mã lỗi `errors.event`.
-- Mỗi ngôn ngữ một câu UPDATE (`rev` +1 mỗi câu → +2 mỗi section), chốt theo TỪNG ngôn ngữ bằng
-- khoá mới IS NULL: chạy lại không đổi gì, admin đã tự đặt chữ thì giữ nguyên.

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
                CHECK (source IN ('course-modal', 'final-cta', 'nav', 'nav-drawer', 'seasonal-popup', 'events')),
  referrer_host TEXT,
  consent_at    TEXT NOT NULL,
  -- Nguyên văn câu đồng ý người gửi đã thấy: bằng chứng theo Nghị định 13/2023.
  consent_text  TEXT NOT NULL,
  CHECK (kind <> 'course' OR parent_name IS NOT NULL),
  CHECK (kind <> 'event' OR event_id IS NOT NULL)
);

INSERT INTO registration_new
  (id, created_at, updated_at, kind, status, status_at, course_id, course_title, locale,
   student_name, student_grade, school, parent_name, phone, email, note, admin_note,
   birth_year, member_role, interests, source, referrer_host, consent_at, consent_text)
SELECT id, created_at, updated_at, kind, status, status_at, course_id, course_title, locale,
       student_name, student_grade, school, parent_name, phone, email, note, admin_note,
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

UPDATE section
   SET json = json_set(
         json_remove(json, '$.joinMember'),
         '$.registerCta', json('{"competition":"Đăng ký cuộc thi","workshop":"Đăng ký Workshop","seminar":"Đăng ký hội thảo"}')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'vi'
   AND json_extract(json, '$.registerCta') IS NULL;

UPDATE section
   SET json = json_set(
         json_remove(json, '$.joinMember'),
         '$.registerCta', json('{"competition":"Register for the competition","workshop":"Register for the workshop","seminar":"Register for the seminar"}')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'en'
   AND json_extract(json, '$.registerCta') IS NULL;

UPDATE section
   SET json = json_set(json,
         '$.event', json('{"description":"Để lại thông tin, EIU FabLab sẽ liên hệ xác nhận việc tham gia.","eventLabel":"Sự kiện đăng ký","heading":"Thông tin người tham gia","fullName":"Họ và tên người tham gia","birthYear":"Năm sinh","birthYearHint":"Ví dụ: 2008","organization":"Trường hoặc đơn vị","parentName":"Họ và tên phụ huynh","parentNote":"Người tham gia dưới 16 tuổi: phụ huynh hoặc người giám hộ điền họ tên, số điện thoại liên hệ của mình và đồng ý thay.","notePlaceholder":"Câu hỏi cho FabLab, nhu cầu hỗ trợ…","consent":"Tôi là người tham gia từ 16 tuổi trở lên, hoặc là cha mẹ / người giám hộ của người tham gia, và đồng ý để EIU FabLab xử lý các thông tin trên nhằm liên hệ về sự kiện.","privacy":"Thông tin chỉ dùng để liên hệ và tổ chức sự kiện, do EIU FabLab (Đại học Quốc tế Miền Đông) quản lý và lưu tối đa 12 tháng. Bạn có thể rút lại đồng ý hoặc yêu cầu xoá dữ liệu qua {email} (Nghị định 13/2023/NĐ-CP)."}'),
         '$.errors.event', 'Sự kiện này hiện không nhận đăng ký trực tuyến. Vui lòng tải lại trang hoặc liên hệ FabLab.'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'register' AND locale = 'vi'
   AND json_extract(json, '$.event') IS NULL;

UPDATE section
   SET json = json_set(json,
         '$.event', json('{"description":"Leave your details and EIU FabLab will contact you to confirm your place.","eventLabel":"Registering for","heading":"Participant","fullName":"Participant full name","birthYear":"Year of birth","birthYearHint":"E.g. 2008","organization":"School or organisation","parentName":"Parent or guardian full name","parentNote":"Participants under 16: a parent or guardian fills in their own name and phone number and gives consent on their behalf.","notePlaceholder":"Questions for FabLab, support you need…","consent":"I am the participant and aged 16 or over, or the parent / guardian of the participant, and I agree that EIU FabLab may process the information above to contact me about the event.","privacy":"Your information is used only for contacting you and running the event, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP)."}'),
         '$.errors.event', 'This event is not taking online registrations right now. Please reload the page or contact FabLab.'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'register' AND locale = 'en'
   AND json_extract(json, '$.event') IS NULL;
