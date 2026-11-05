/**
 * Nhãn nút đăng ký của một hoạt động ("Đăng ký cuộc thi / Workshop / hội thảo"), hoặc `null`
 * khi KHÔNG vẽ nút. Dùng chung cho thẻ Sự kiện, banner Cuộc thi và popup chi tiết — ba chỗ
 * phải cùng một luật, và cùng luật máy chủ dùng để nhận / từ chối lượt gửi
 * (server/routes/public.write.js):
 *
 * - loại của mục có nhãn trong `activities.registerCta` (loại `partnership` cố ý không có);
 * - mục không bật "Đóng đăng ký" (`registerClosed`);
 * - nội dung có chữ của form sự kiện (`register.event`) — bản lịch sử cũ khôi phục lại thì
 *   không có, và nút mở ra một form thiếu chữ còn tệ hơn không có nút.
 */
export function eventRegisterLabel(t, item) {
  if (!item || item.registerClosed || !t.register?.event) return null
  return t.activities?.registerCta?.[item.kind] || null
}
