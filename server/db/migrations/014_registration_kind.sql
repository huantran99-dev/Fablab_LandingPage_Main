-- Hai loại đăng ký: khóa học (phụ huynh đăng ký cho con) và thành viên FabLab (người từ
-- 16 tuổi tự đăng ký). SQLite không đổi được ràng buộc của cột có sẵn (`parent_name NOT
-- NULL`), nên DỰNG LẠI bảng: tạo bảng mới → chép → xoá cũ → đổi tên → dựng lại index.
-- Migration chạy trong một giao dịch (db/index.js): hỏng giữa chừng thì bảng cũ còn nguyên.
--
-- Quy ước cột cho `kind = 'member'`:
--   student_name = họ tên thành viên (cột hiểu là "người tham gia")
--   school       = trường / đơn vị
--   parent_name, student_grade, course_id, course_title = NULL
--   birth_year, member_role, interests (mảng id dạng JSON) = chỉ thành viên có
-- `kind = 'course'` vẫn bắt buộc có phụ huynh — CHECK ở dưới giữ đúng luật cũ.

CREATE TABLE registration_new (
  id            INTEGER PRIMARY KEY,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'course' CHECK (kind IN ('course', 'member')),
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'enrolled', 'cancelled')),
  status_at     TEXT,
  -- NULL = chưa chọn khóa, cần tư vấn (chỉ có nghĩa với kind = 'course').
  course_id     TEXT,
  -- Tên khóa (bản VI) chụp lại lúc gửi, do máy chủ tra — khóa bị xoá về sau vẫn đọc được.
  course_title  TEXT,
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
  source        TEXT NOT NULL CHECK (source IN ('course-modal', 'final-cta', 'nav', 'nav-drawer')),
  referrer_host TEXT,
  consent_at    TEXT NOT NULL,
  -- Nguyên văn câu đồng ý người gửi đã thấy: bằng chứng theo Nghị định 13/2023.
  consent_text  TEXT NOT NULL,
  CHECK (kind = 'member' OR parent_name IS NOT NULL)
);

INSERT INTO registration_new
  (id, created_at, updated_at, kind, status, status_at, course_id, course_title, locale,
   student_name, student_grade, school, parent_name, phone, email, note, admin_note,
   source, referrer_host, consent_at, consent_text)
SELECT id, created_at, updated_at, 'course', status, status_at, course_id, course_title, locale,
       student_name, student_grade, school, parent_name, phone, email, note, admin_note,
       source, referrer_host, consent_at, consent_text
  FROM registration;

DROP TABLE registration;
ALTER TABLE registration_new RENAME TO registration;

CREATE INDEX registration_created ON registration (created_at DESC);
CREATE INDEX registration_status ON registration (status, created_at DESC);
CREATE INDEX registration_course ON registration (course_id, created_at DESC);
CREATE INDEX registration_phone ON registration (phone, created_at DESC);
CREATE INDEX registration_kind ON registration (kind, created_at DESC);
