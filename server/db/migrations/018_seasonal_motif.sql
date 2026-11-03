-- Sự kiện mùa, phần 2: bộ họa tiết (`motif`: hạt rơi + vật trang trí trên nút) và công
-- tắc hạt rơi (`fall`) cho database đã có section `seasonal` (migration 016). Database
-- mới nhận các khoá này từ seed; trên database chưa có section, hai câu không khớp dòng nào.
--
-- Mỗi ngôn ngữ MỘT câu UPDATE → `rev` của seasonal tăng đúng 2. Chốt theo TỪNG ngôn ngữ
-- (bài học 004) bằng `effectOff IS NULL`. Trong câu:
--   - thêm nhãn nút bật/tắt hiệu ứng (`effectOff` / `effectOn`);
--   - dựng lại `items` giữ nguyên thứ tự (ORDER BY key), gắn `motif` + `fall` CHỈ cho ba
--     mục mẫu của 016 còn đúng id và chưa có `motif`. Mục admin tự thêm thì không đụng.
-- `motif` / `fall` là trường dùng chung → hai bản nhận đúng cùng giá trị.

UPDATE section
   SET json = json_set(json,
         '$.effectOff', 'Tắt hiệu ứng',
         '$.effectOn', 'Bật hiệu ứng',
         '$.items', (SELECT json_group_array(json(
                       CASE WHEN json_extract(v.value, '$.motif') IS NULL
                              AND json_extract(v.value, '$.id') IN ('tet-2027', 'trung-thu-2027', 'noel-2026')
                            THEN json_set(v.value,
                                   '$.motif', CASE json_extract(v.value, '$.id')
                                                WHEN 'tet-2027' THEN 'mai'
                                                WHEN 'trung-thu-2027' THEN 'lantern'
                                                ELSE 'snow' END,
                                   '$.fall', json('true'))
                            ELSE v.value END) ORDER BY v.key)
                       FROM json_each(section.json, '$.items') v)),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'seasonal' AND locale = 'vi'
   AND json_extract(json, '$.effectOff') IS NULL
   AND json_type(json, '$.items') = 'array';

UPDATE section
   SET json = json_set(json,
         '$.effectOff', 'Turn off effects',
         '$.effectOn', 'Turn on effects',
         '$.items', (SELECT json_group_array(json(
                       CASE WHEN json_extract(v.value, '$.motif') IS NULL
                              AND json_extract(v.value, '$.id') IN ('tet-2027', 'trung-thu-2027', 'noel-2026')
                            THEN json_set(v.value,
                                   '$.motif', CASE json_extract(v.value, '$.id')
                                                WHEN 'tet-2027' THEN 'mai'
                                                WHEN 'trung-thu-2027' THEN 'lantern'
                                                ELSE 'snow' END,
                                   '$.fall', json('true'))
                            ELSE v.value END) ORDER BY v.key)
                       FROM json_each(section.json, '$.items') v)),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'seasonal' AND locale = 'en'
   AND json_extract(json, '$.effectOff') IS NULL
   AND json_type(json, '$.items') = 'array';
