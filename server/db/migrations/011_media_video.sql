-- Thư viện media nhận thêm video (nền banner Cuộc thi).
--
-- Video dùng chung bảng `media` (tên file mang băm, `binding` trỏ tới, xoá bị chặn khi
-- đang dùng — y như ảnh). Phân biệt bằng `mime` (`video/…`), không cần cột mới cho việc đó.
-- `duration` (giây) chỉ video có: banner dùng nó để mỗi slide đứng đủ lâu cho video chạy,
-- dashboard hiện nó cạnh kích thước. Ảnh để NULL.
ALTER TABLE media ADD COLUMN duration REAL;
