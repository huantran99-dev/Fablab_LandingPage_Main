-- Đăng ký khóa học và thống kê truy cập.
--
-- Hai nhóm bảng này KHÔNG liên kết với nhau: đăng ký không mang mã băm khách,
-- sự kiện không mang dữ liệu cá nhân. Xoá một đăng ký (quyền yêu cầu xoá dữ liệu)
-- vì thế không để lại dấu vết nào dẫn ngược về người đó.
--
-- Cũng không bảng nào ở đây chạm tới `section` hay `content_counter`: ghi đăng ký
-- hay sự kiện mà làm đổi `rev` nội dung là phá bộ đệm của mọi người đang xem trang.

CREATE TABLE registration (
  id            INTEGER PRIMARY KEY,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'enrolled', 'cancelled')),
  status_at     TEXT,
  -- NULL = chưa chọn khóa, cần tư vấn.
  course_id     TEXT,
  -- Tên khóa (bản VI) chụp lại lúc gửi, do máy chủ tra — khóa bị xoá về sau vẫn đọc được.
  course_title  TEXT,
  locale        TEXT NOT NULL CHECK (locale IN ('vi', 'en')),
  student_name  TEXT NOT NULL,
  student_grade TEXT,
  school        TEXT,
  parent_name   TEXT NOT NULL,
  -- Đã chuẩn hoá về dạng 0xxxxxxxxx.
  phone         TEXT NOT NULL,
  email         TEXT,
  note          TEXT,
  admin_note    TEXT,
  source        TEXT NOT NULL CHECK (source IN ('course-modal', 'final-cta', 'nav', 'nav-drawer')),
  referrer_host TEXT,
  consent_at    TEXT NOT NULL,
  -- Nguyên văn câu đồng ý người gửi đã thấy: bằng chứng theo Nghị định 13/2023.
  consent_text  TEXT NOT NULL
);

CREATE INDEX registration_created ON registration (created_at DESC);
CREATE INDEX registration_status ON registration (status, created_at DESC);
CREATE INDEX registration_course ON registration (course_id, created_at DESC);
CREATE INDEX registration_phone ON registration (phone, created_at DESC);

CREATE TABLE event (
  id       INTEGER PRIMARY KEY,
  -- Ngày theo giờ Việt Nam (UTC+7): người đọc thống kê nghĩ theo ngày Việt Nam.
  day      TEXT NOT NULL,
  at       TEXT NOT NULL,
  name     TEXT NOT NULL
           CHECK (name IN ('pageview', 'course_open', 'cta_click', 'register_open', 'register_submit')),
  -- 16 ký tự đầu của sha256(muối trong ngày | IP | UA). KHÔNG BAO GIỜ lưu IP.
  visitor  TEXT NOT NULL,
  target   TEXT,
  ref_host TEXT,
  device   TEXT NOT NULL CHECK (device IN ('mobile', 'tablet', 'desktop')),
  lang     TEXT CHECK (lang IN ('vi', 'en'))
);

CREATE INDEX event_name_day ON event (name, day, visitor);
CREATE INDEX event_target ON event (name, target, day);
CREATE INDEX event_day ON event (day);

-- Chỉ giữ muối của HÔM NAY. Xoá muối cũ là thứ làm mã băm của những ngày trước
-- không còn cách nào nối ngược về một người.
CREATE TABLE analytics_salt (
  day  TEXT PRIMARY KEY,
  salt BLOB NOT NULL
);

-- Tổng hợp theo ngày của sự kiện đã quá hạn giữ bản thô.
CREATE TABLE stat_daily (
  day    TEXT NOT NULL,
  metric TEXT NOT NULL,
  dim    TEXT NOT NULL DEFAULT '',
  value  INTEGER NOT NULL,
  PRIMARY KEY (day, metric, dim)
) WITHOUT ROWID;
