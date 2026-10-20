-- Thêm `pillars.vision` và `pillars.values` vào database ĐÃ seed trước ngày có hai
-- khoá này (vd. máy chủ thật). Database mới nhận chúng từ seed; trên database trống
-- hai câu UPDATE dưới đây không khớp dòng nào nên tự là no-op.
--
-- Chỉ THÊM khoá còn thiếu, không đụng `title`/`description`/`items` mà admin có thể
-- đã sửa. Chốt theo TỪNG ngôn ngữ (xem bài học ở 004): thiếu ở bản nào thì vá bản đó.
-- Bản nào đã có một trong hai khoá thì để yên — đó là bản admin đã tự soạn.
--
-- JSON là bản ĐÓNG BĂNG của `vi.pillars` / `en.pillars` lúc viết migration, sinh
-- bằng máy từ `src/i18n/*.js`. `rev + 1` trên mỗi dòng để bộ đệm, ETag và
-- contentStore của người xem tự làm mới.

UPDATE section
   SET json = json_set(json,
         '$.vision', json('{"title":"Tầm nhìn","body":"Trở thành xưởng chế tác số điển hình với công nghệ hiện đại, không gian mở năng động – sáng tạo, hỗ trợ tốt nhất để hiện thực hóa ý tưởng và thúc đẩy khởi nghiệp, tạo giá trị tích cực cho cộng đồng."}'),
         '$.values', json('[{"id":"open-space","title":"Không gian công nghệ mở"},{"id":"experiment","title":"Thử nghiệm"},{"id":"problem-solving","title":"Giải quyết vấn đề"},{"id":"creativity","title":"Sáng tạo"},{"id":"collaboration","title":"Chia sẻ và hợp tác"},{"id":"achievement","title":"Thành tựu"}]')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pillars' AND locale = 'vi'
   AND json_extract(json, '$.vision') IS NULL
   AND json_extract(json, '$.values') IS NULL;

UPDATE section
   SET json = json_set(json,
         '$.vision', json('{"title":"Vision","body":"To become a model digital fabrication workshop with modern technology, a dynamic and creative open space, the best support for turning ideas into reality, and a driver of entrepreneurship that creates positive value for the community."}'),
         '$.values', json('[{"id":"open-space","title":"Open technology space"},{"id":"experiment","title":"Experimentation"},{"id":"problem-solving","title":"Problem solving"},{"id":"creativity","title":"Creativity"},{"id":"collaboration","title":"Sharing and collaboration"},{"id":"achievement","title":"Achievement"}]')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pillars' AND locale = 'en'
   AND json_extract(json, '$.vision') IS NULL
   AND json_extract(json, '$.values') IS NULL;
