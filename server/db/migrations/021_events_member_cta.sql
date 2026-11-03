-- Nút "Trở thành thành viên FabLab ngay" dưới carousel Sự kiện (API 18). Hai phần:
--
-- 1. Nguồn đăng ký mới `events`. Cột `source` có CHECK liệt kê nguồn, và SQLite không sửa
--    được ràng buộc của cột có sẵn, nên DỰNG LẠI bảng y như 014 / 017: tạo bảng mới → chép
--    → xoá cũ → đổi tên → dựng lại index. Migration chạy trong một giao dịch (db/index.js):
--    hỏng giữa chừng thì bảng cũ còn nguyên. Cột và ràng buộc giữ ĐÚNG như 017, chỉ thêm
--    'events' vào CHECK của `source`. Bảng có dữ liệu cá nhân (tên trẻ em): đã thử trên bản
--    sao, so số dòng và mã băm nội dung trước/sau.
--
-- 2. Nhãn nút `activities.joinMember` cho database đã seed. Mỗi ngôn ngữ một câu UPDATE
--    (`rev` +1 mỗi câu → +2), chốt `joinMember IS NULL` theo TỪNG ngôn ngữ: admin đã tự đặt
--    chữ thì giữ nguyên. Database chưa có section `activities` thì không khớp dòng nào.

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
  source        TEXT NOT NULL
                CHECK (source IN ('course-modal', 'final-cta', 'nav', 'nav-drawer', 'seasonal-popup', 'events')),
  referrer_host TEXT,
  consent_at    TEXT NOT NULL,
  -- Nguyên văn câu đồng ý người gửi đã thấy: bằng chứng theo Nghị định 13/2023.
  consent_text  TEXT NOT NULL,
  CHECK (kind = 'member' OR parent_name IS NOT NULL)
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

UPDATE section
   SET json = json_set(json, '$.joinMember', 'Trở thành thành viên FabLab ngay'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'vi'
   AND json_extract(json, '$.joinMember') IS NULL;

UPDATE section
   SET json = json_set(json, '$.joinMember', 'Become a FabLab member today'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'en'
   AND json_extract(json, '$.joinMember') IS NULL;
