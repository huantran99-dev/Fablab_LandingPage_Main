-- Thêm nhãn trợ năng của vòng xoay 3D (`projects.previous` / `next` / `goTo`) vào
-- database đã có section `projects`. Database mới nhận chúng từ seed; trên database
-- trống hai câu dưới đây không khớp dòng nào nên là no-op.
--
-- Chỉ THÊM khi còn thiếu (`previous` vắng), theo TỪNG ngôn ngữ (bài học của 004) —
-- không đè chữ admin đã sửa. Chuỗi đóng băng từ `src/i18n/*.js`. `rev + 1` để bộ đệm
-- và ETag của người xem tự làm mới.

UPDATE section
   SET json = json_set(json,
         '$.previous', 'Dự án trước',
         '$.next', 'Dự án tiếp theo',
         '$.goTo', 'Xem dự án số'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'projects' AND locale = 'vi'
   AND json_extract(json, '$.previous') IS NULL;

UPDATE section
   SET json = json_set(json,
         '$.previous', 'Previous project',
         '$.next', 'Next project',
         '$.goTo', 'Go to project'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'projects' AND locale = 'en'
   AND json_extract(json, '$.previous') IS NULL;
