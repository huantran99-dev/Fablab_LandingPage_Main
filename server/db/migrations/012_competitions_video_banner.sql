-- Bật banner video tràn màn hình cho khối `competitions` của section Hoạt động
-- (`activities.groups[].videoBanner = true`), trên database đã seed. Database mới nhận cờ
-- từ seed; trên database trống câu dưới không khớp dòng nào nên là no-op.
--
-- Cờ nằm TRÊN PHẦN TỬ của mảng `groups`, nên đường dẫn JSON phải tìm chỉ số của khối
-- theo `id` (json_each), không viết cứng `[0]`: admin có thể đã đổi thứ tự khối.
-- Chỉ đặt khi cờ còn vắng; migration chạy đúng một lần nên admin tắt cờ về sau (công tắc
-- ghi "vắng") không bị bật lại. Theo từng dòng ngôn ngữ, `rev + 1` mỗi dòng.
UPDATE section
   SET json = json_set(
         json,
         '$.groups[' || (
           SELECT g.key FROM json_each(section.json, '$.groups') AS g
            WHERE json_extract(g.value, '$.id') = 'competitions'
         ) || '].videoBanner',
         json('true')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities'
   AND EXISTS (
     SELECT 1 FROM json_each(section.json, '$.groups') AS g
      WHERE json_extract(g.value, '$.id') = 'competitions'
        AND json_type(g.value, '$.videoBanner') IS NULL
   );
