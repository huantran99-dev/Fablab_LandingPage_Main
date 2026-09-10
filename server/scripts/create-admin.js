/**
 * Tạo tài khoản admin đầu tiên. `npm run admin:create`
 *
 * **Cố ý hỏi trực tiếp chứ không đọc biến môi trường.** `.gitignore` của repo này
 * vốn không có mục `.env` nào cho tới rất gần đây, nên một mật khẩu khởi tạo đặt
 * trong `.env` chỉ cách `git add -A` đúng một bước là lên GitHub.
 *
 * **Cũng cố ý không làm trang cài đặt lần đầu trên web.** Trang kiểu đó là một
 * cuộc đua với bất kỳ con bot nào tìm thấy host trước người dùng.
 */
import { createInterface } from 'node:readline'
import { stdin, stdout } from 'node:process'

import { hashPassword } from '../auth/password.js'
import { closeDb, getDb } from '../db/index.js'

/** Hỏi một dòng, có thể tắt hiện chữ khi gõ mật khẩu. */
function ask(question, { mask = false } = {}) {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true })

  if (mask) {
    // `_writeToOutput` là chỗ duy nhất chặn được việc readline in lại ký tự vừa gõ.
    rl._writeToOutput = (text) => {
      if (text.includes(question)) stdout.write(question)
    }
  }

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      if (mask) stdout.write('\n')
      rl.close()
      resolve(answer)
    })
  })
}

const force = process.argv.includes('--force')
const db = getDb()
const existing = db.prepare('SELECT username FROM admin_user WHERE id = 1').get()

if (existing && !force) {
  console.error(`Da co tai khoan '${existing.username}'.`)
  console.error('Doi mat khau tu dashboard, hoac chay lai voi --force de ghi de.')
  closeDb()
  process.exit(1)
}

const username = (await ask('Ten dang nhap: ')).trim()
if (!username) {
  console.error('Ten dang nhap khong duoc rong.')
  closeDb()
  process.exit(1)
}

const password = await ask('Mat khau (it nhat 12 ky tu): ', { mask: true })
if (password.length < 12) {
  console.error('Mat khau qua ngan.')
  closeDb()
  process.exit(1)
}

const again = await ask('Nhap lai mat khau: ', { mask: true })
if (again !== password) {
  console.error('Hai lan nhap khong khop.')
  closeDb()
  process.exit(1)
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

console.log(`\nDa tao tai khoan '${username}'. Dang nhap tai /admin.html`)
closeDb()
