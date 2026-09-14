-- Bộ đếm phiên bản cho những thay đổi KHÔNG nằm trong bảng `section`.
--
-- `rev` công khai từng là `SUM(section.rev)`. Sửa popup chi tiết khoá học ghi vào
-- `course_detail`, không đụng `section`, nên `rev` đứng yên: bộ đệm trả bản cũ,
-- ETag trả 304, và `contentStore` ở trình duyệt bỏ qua vì "cùng rev". Nội dung đã
-- lưu mà trang không bao giờ đổi — không lỗi nào báo. Bộ đếm này cộng vào `rev`.
CREATE TABLE content_counter (
  id    INTEGER PRIMARY KEY CHECK (id = 1),
  value INTEGER NOT NULL DEFAULT 0
);

INSERT INTO content_counter (id, value) VALUES (1, 0);

-- Ảnh của section tại thời điểm lưu. Không có cột này thì khôi phục lịch sử trả lại
-- chữ nhưng giữ ảnh hiện tại — một nửa của bản cũ. Dòng lịch sử có từ trước
-- migration này mang NULL: khôi phục chúng thì giữ nguyên ảnh đang gắn.
ALTER TABLE section_history ADD COLUMN bindings_json TEXT;
