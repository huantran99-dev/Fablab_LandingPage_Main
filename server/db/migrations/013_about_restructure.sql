-- "Về chúng tôi" thành ba khối ngang cấp (Sứ mệnh / Tầm nhìn / Giá trị cốt lõi) cho
-- database ĐÃ seed. Database mới nhận các khoá này từ seed; trên database trống hai câu
-- UPDATE không khớp dòng nào nên là no-op.
--
-- Mỗi ngôn ngữ MỘT câu UPDATE → `rev` của pillars tăng đúng 2. Chốt theo TỪNG ngôn ngữ
-- (bài học 004) bằng `missionTitle IS NULL`: chưa áp thì áp, đã có (seed mới hoặc admin
-- đã soạn) thì để yên. Trong câu:
--   - `title` chỉ đổi khi còn đúng nguyên văn cũ — admin đã sửa thì giữ;
--   - thêm `missionTitle`, và `visionHighlights` nếu chưa có;
--   - dựng lại `values` giữ nguyên thứ tự (ORDER BY key), chỉ gắn `description` cho id
--     đã biết mà còn thiếu mô tả. Giá trị admin tự thêm thì không đụng.
--
-- JSON đóng băng, sinh bằng máy từ `src/i18n/*.js`. Mô tả giá trị rút gọn từ khối
-- "GIÁ TRỊ CỐT LÕI" / "Core Values" trên fablab.eiu.edu.vn/vi/ và /en/.

UPDATE section
   SET json = json_set(json,
         '$.title', CASE WHEN json_extract(json, '$.title') = 'Sứ mệnh của EIU FabLab'
                         THEN 'Về EIU FabLab' ELSE json_extract(json, '$.title') END,
         '$.missionTitle', 'Sứ mệnh',
         '$.visionHighlights', COALESCE(json(json_extract(json, '$.visionHighlights')), json('[{"id":"technology","label":"Công nghệ, thiết bị hiện đại"},{"id":"open-space","label":"Không gian mở năng động – sáng tạo"},{"id":"startup","label":"Hiện thực hóa ý tưởng, thúc đẩy khởi nghiệp"}]')),
         '$.values', (SELECT json_group_array(json(
                        CASE WHEN json_extract(v.value, '$.description') IS NULL
                               AND json_extract('{"open-space":"Dễ dàng tiếp cận và sử dụng thiết bị công nghệ để hiện thực hóa ý tưởng — động lực cho học tập và sáng tạo trong cộng đồng.","experiment":"Mạnh dạn thử nghiệm để học thêm kiến thức, từ đó cải tiến và hoàn thiện sản phẩm.","problem-solving":"Kỹ năng giải quyết vấn đề là yếu tố quan trọng để dự án thành công.","creativity":"Sáng tạo để nâng cao giá trị sản phẩm, mang lại giá trị tích cực cho xã hội.","collaboration":"Chia sẻ kiến thức, kinh nghiệm và hợp tác giúp chúng ta đi nhanh và xa hơn.","achievement":"Điều EIU FabLab hướng đến: tiếp thêm động lực đổi mới, sáng tạo cho cộng đồng để tạo ra giá trị tích cực cho xã hội."}', '$."' || json_extract(v.value, '$.id') || '"') IS NOT NULL
                             THEN json_set(v.value, '$.description', json_extract('{"open-space":"Dễ dàng tiếp cận và sử dụng thiết bị công nghệ để hiện thực hóa ý tưởng — động lực cho học tập và sáng tạo trong cộng đồng.","experiment":"Mạnh dạn thử nghiệm để học thêm kiến thức, từ đó cải tiến và hoàn thiện sản phẩm.","problem-solving":"Kỹ năng giải quyết vấn đề là yếu tố quan trọng để dự án thành công.","creativity":"Sáng tạo để nâng cao giá trị sản phẩm, mang lại giá trị tích cực cho xã hội.","collaboration":"Chia sẻ kiến thức, kinh nghiệm và hợp tác giúp chúng ta đi nhanh và xa hơn.","achievement":"Điều EIU FabLab hướng đến: tiếp thêm động lực đổi mới, sáng tạo cho cộng đồng để tạo ra giá trị tích cực cho xã hội."}', '$."' || json_extract(v.value, '$.id') || '"'))
                             ELSE v.value END) ORDER BY v.key)
                        FROM json_each(section.json, '$.values') v)),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pillars' AND locale = 'vi'
   AND json_extract(json, '$.missionTitle') IS NULL
   AND json_type(json, '$.values') = 'array';

UPDATE section
   SET json = json_set(json,
         '$.title', CASE WHEN json_extract(json, '$.title') = 'Mission of EIU FabLab'
                         THEN 'About EIU FabLab' ELSE json_extract(json, '$.title') END,
         '$.missionTitle', 'Mission',
         '$.visionHighlights', COALESCE(json(json_extract(json, '$.visionHighlights')), json('[{"id":"technology","label":"Modern technology and equipment"},{"id":"open-space","label":"A dynamic, creative open space"},{"id":"startup","label":"Turning ideas into reality and start-ups"}]')),
         '$.values', (SELECT json_group_array(json(
                        CASE WHEN json_extract(v.value, '$.description') IS NULL
                               AND json_extract('{"open-space":"Easy access to modern equipment helps turn early ideas into reality and drives learning and innovation in the community.","experiment":"Daring to experiment builds knowledge and leads to better, more refined products.","problem-solving":"Problem-solving skills are a key to success in any project.","creativity":"Creativity adds value to products and brings positive value to society.","collaboration":"Sharing knowledge and experience, and working together, helps us go faster and farther.","achievement":"What EIU FabLab aims for: boosting creativity, development and positive values in the community."}', '$."' || json_extract(v.value, '$.id') || '"') IS NOT NULL
                             THEN json_set(v.value, '$.description', json_extract('{"open-space":"Easy access to modern equipment helps turn early ideas into reality and drives learning and innovation in the community.","experiment":"Daring to experiment builds knowledge and leads to better, more refined products.","problem-solving":"Problem-solving skills are a key to success in any project.","creativity":"Creativity adds value to products and brings positive value to society.","collaboration":"Sharing knowledge and experience, and working together, helps us go faster and farther.","achievement":"What EIU FabLab aims for: boosting creativity, development and positive values in the community."}', '$."' || json_extract(v.value, '$.id') || '"'))
                             ELSE v.value END) ORDER BY v.key)
                        FROM json_each(section.json, '$.values') v)),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pillars' AND locale = 'en'
   AND json_extract(json, '$.missionTitle') IS NULL
   AND json_type(json, '$.values') = 'array';
