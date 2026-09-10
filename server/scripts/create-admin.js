/**
 * Tạo tài khoản admin. `npm run admin:create`
 *
 * **Cố ý hỏi trực tiếp chứ không đọc biến môi trường.** `.gitignore` của repo này
 * vốn không có mục `.env` nào cho tới rất gần đây, nên một mật khẩu khởi tạo đặt
 * trong `.env` chỉ cách `git add -A` đúng một bước là lên GitHub. Cũng cố ý không
 * làm trang cài đặt lần đầu trên web — đó là cuộc đua với bất kỳ con bot nào tìm
 * thấy host trước người dùng.
 *
 * ## Hai chế độ, vì một chế độ là không đủ
 *
 * Bản đầu mở một `readline` MỚI cho mỗi câu hỏi trên cùng một stdin. Câu đầu chạy,
 * rồi `rl.close()` đóng luôn stdin, và câu thứ hai treo vĩnh viễn — script dừng
 * ngay sau dòng hỏi mật khẩu mà vẫn thoát mã 0, nên nhìn như "không có gì xảy ra".
 *
 * Giờ dùng ĐÚNG MỘT `readline` cho cả ba câu, và:
 *
 *   - stdin là TTY  -> hỏi trực tiếp, mật khẩu không hiện ra khi gõ;
 *   - không phải TTY -> đọc ba dòng từ đầu vào được nối ống.
 *
 * Đường lui thứ hai không phải cho máy tự động, mà cho **Git Bash trên Windows**:
 * ở đó Node thường không nhận được TTY thật, và mọi mẹo che chữ đều hỏng.
 */
import { createInterface } from 'node:readline'
import { stdin, stdout } from 'node:process'

import { hashPassword } from '../auth/password.js'
import { closeDb, getDb } from '../db/index.js'

const force = process.argv.includes('--force')

/**
 * Đọc trọn stdin rồi tách dòng. Dùng khi không có TTY.
 *
 * Phải báo TRƯỚC khi đọc, không phải sau: hàm này chờ tới khi stdin đóng, nên nếu
 * người dùng đang ngồi gõ tay mà màn hình trống trơn thì trông y hệt bị treo.
 */
async function readPipedLines() {
  console.log('Khong co TTY — dang doc tu dau vao.')
  console.log('Neu ban dang go tay: nhap 3 dong (ten, mat khau, nhap lai),')
  console.log('roi bam Ctrl+Z va Enter (Windows) hoac Ctrl+D (Linux/macOS) de ket thuc.\n')

  const chunks = []
  for await (const chunk of stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8').split(/\r?\n/)
}

async function collectInteractive() {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true })

  // Một cờ duy nhất điều khiển việc readline có in lại ký tự vừa gõ hay không.
  // Dòng hỏi do chính chúng ta ghi ra, nên khi tắt echo thì nó vẫn hiện.
  let muted = false
  const write = rl._writeToOutput.bind(rl)
  rl._writeToOutput = (text) => {
    if (!muted) write(text)
  }

  const ask = (question, { mask = false } = {}) =>
    new Promise((resolve) => {
      stdout.write(question)
      muted = mask
      rl.question('', (answer) => {
        muted = false
        if (mask) stdout.write('\n')
        resolve(answer)
      })
    })

  try {
    const username = await ask('Ten dang nhap: ')
    const password = await ask('Mat khau (it nhat 12 ky tu): ', { mask: true })
    const again = await ask('Nhap lai mat khau: ', { mask: true })
    return [username, password, again]
  } finally {
    rl.close()
  }
}

function bail(message, hint) {
  console.error(`\n${message}`)
  if (hint) console.error(hint)
  closeDb()
  process.exit(1)
}

const db = getDb()
const existing = db.prepare('SELECT username FROM admin_user WHERE id = 1').get()

if (existing && !force) {
  bail(
    `Da co tai khoan '${existing.username}'.`,
    'Doi mat khau tu dashboard, hoac dat lai bang:  npm run admin:create -- --force',
  )
}

const [rawUsername, password, again] = stdin.isTTY ? await collectInteractive() : await readPipedLines()

const username = (rawUsername ?? '').trim()

if (!username) {
  bail(
    'Ten dang nhap khong duoc rong.',
    stdin.isTTY
      ? null
      : 'Cach dung khi noi ong:\n  printf "ten\\nmatkhau\\nmatkhau\\n" | npm run admin:create',
  )
}
if (!password || password.length < 12) {
  bail('Mat khau phai it nhat 12 ky tu.')
}
if (password !== again) {
  bail('Hai lan nhap khong khop.')
}

const hash = await hashPassword(password)
const now = new Date().toISOString()

db.prepare(
  `INSERT INTO admin_user (id, username, password_hash, failed_count, locked_until, updated_at)
   VALUES (1, ?, ?, 0, NULL, ?)
   ON CONFLICT (id) DO UPDATE SET
     username = excluded.username,
     password_hash = excluded.password_hash,
     failed_count = 0,
     locked_until = NULL,
     updated_at = excluded.updated_at`,
).run(username, hash, now)

console.log(`\nDa tao tai khoan '${username}'.`)
console.log('Dang nhap tai http://localhost:5173/admin.html (can chay ca `npm run server`).')
closeDb()
