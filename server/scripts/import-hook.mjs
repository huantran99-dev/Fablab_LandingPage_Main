/**
 * Hook phân giải module, để Node thuần nạp được các file i18n vốn viết cho Vite.
 *
 * Hai chỗ Node ESM không tự làm được, còn Vite thì làm giúp:
 *
 * 1. **Specifier thiếu đuôi.** `src/i18n/vi.js` viết `from './courseDetails.vi'`.
 *    Vite tự thử `.js`; Node ESM thì không, theo đúng đặc tả. Hook thử lại với
 *    `.js` khi và chỉ khi lần phân giải đầu thất bại.
 * 2. **Import file ảnh.** `src/assets/images/index.js` import thẳng `.jpg`/`.png`.
 *    Vite biến chúng thành URL có băm nội dung. Ở đây trả về **tên file** — đó
 *    đúng là thứ script seed cần để lần ra file gốc trên đĩa.
 *
 * Dùng qua `module.register('./import-hook.mjs', import.meta.url)` TRƯỚC khi
 * `await import()` bất kỳ module i18n nào. Hook chạy ở luồng riêng nên bắt buộc
 * phải là file tách rời — không gộp vào script gọi nó được.
 */
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const IMAGE_EXT = /\.(jpe?g|png|svg|gif|webp|avif)$/i

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    // Đừng lọc theo `extname()`: `'./courseDetails.vi'` có "đuôi" là `.vi`, nên
    // điều kiện "không có đuôi" sẽ bỏ sót đúng những file cần vá. Cứ thất bại
    // trên specifier tương đối thì thử thêm `.js`, không đoán trước.
    const isRelative = specifier.startsWith('./') || specifier.startsWith('../')
    if (error.code === 'ERR_MODULE_NOT_FOUND' && isRelative && !specifier.endsWith('.js')) {
      return nextResolve(`${specifier}.js`, context)
    }
    throw error
  }
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:') && IMAGE_EXT.test(url)) {
    const filename = basename(fileURLToPath(url))
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(filename)}`,
    }
  }
  return nextLoad(url, context)
}
