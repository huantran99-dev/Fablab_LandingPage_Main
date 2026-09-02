/**
 * Người dùng đã tắt hiệu ứng chuyển động ở cấp hệ điều hành.
 *
 * Đọc một lần lúc nạp module: giá trị này quyết định có dựng hiệu ứng hay không
 * chứ không phải style của một lần render, nên không cần theo dõi thay đổi giữa
 * chừng — đổi thiết lập rồi tải lại trang là đủ.
 *
 * Với người bị rối loạn tiền đình, tắt chuyển động là nhu cầu thật, nên mọi hiệu
 * ứng của trang đều phải đi qua đây.
 */
export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
