/**
 * Vòng xoay "đang làm" — kế thừa màu chữ (`currentColor`) nên đặt được trên nút đặc
 * lẫn nút viền. Tắt chuyển động thì đứng yên (`motion-safe:`): vẫn đọc được là đang
 * bận, không quay.
 */
export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin ${className}`}
    />
  )
}
