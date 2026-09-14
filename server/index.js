/**
 * Khởi động máy chủ. File DUY NHẤT mở cổng.
 *
 * Nghe trên 127.0.0.1 chứ không 0.0.0.0: trên máy chủ thật nginx sẽ đứng trước để
 * lo TLS, còn tiến trình Node thì không nên phơi thẳng ra internet.
 */
import { createApp } from './app.js'
import { config, paths } from './config.js'
import { getDb } from './db/index.js'

const db = getDb()
const sections = db.prepare('SELECT COUNT(*) AS n FROM section').get().n

if (sections === 0) {
  console.error('Database chua co noi dung. Chay `npm run seed` truoc.')
  process.exit(1)
}

createApp().listen(config.port, '127.0.0.1', () => {
  console.log(`FabLab API  http://127.0.0.1:${config.port}`)
  console.log(`  database  ${paths.db}`)
  console.log(`  anh       ${paths.media}`)
  console.log(`  ${sections} section trong database`)
})
