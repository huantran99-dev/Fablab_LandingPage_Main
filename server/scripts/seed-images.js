/**
 * Đưa ảnh đóng gói của một scope MỚI vào database đã seed: `npm run seed:images`
 *
 * `npm run seed` chỉ chạy trên database trống, còn migration SQL thì không xử lý được
 * file ảnh. Thêm một scope ảnh sau ngày seed (vd. `equipment`) thì section vào bằng
 * migration, ảnh vào bằng script này.
 *
 * **Chỉ điền scope CHƯA CÓ ẢNH NÀO trong database.** Scope đã có dù chỉ một binding
 * là scope admin đang quản lý từ dashboard: điền "mục còn thiếu" vào đó sẽ gắn lại
 * đúng những ảnh admin vừa cố ý gỡ. Nhờ chốt này, chạy lại bao nhiêu lần cũng an toàn.
 *
 * Ảnh đi qua `processImage` y như ảnh tải lên từ dashboard: xoay đúng chiều, xoá
 * metadata, thu cạnh dài. Xong thì tăng `content_counter` — thiếu bước đó thì `rev`
 * đứng yên và ảnh không bao giờ lên trang (xem migration 002).
 *
 * Kiểm thử thì chạy trên BẢN SAO: `DATA_DIR=<thư mục khác> npm run seed:images`.
 */
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { ROOT } from '../config.js'
import { closeDb, getDb } from '../db/index.js'
import { processImage, storeImage } from '../media/process.js'
import { SRC_IMAGES, filenameOf, imageScopes, readImageNotes } from './image-sources.js'

register('./import-hook.mjs', import.meta.url)

const images = await import(pathToFileURL(join(ROOT, 'src', 'assets', 'images', 'index.js')).href)
const notes = readImageNotes()
const db = getDb()

if (db.prepare('SELECT COUNT(*) AS n FROM section').get().n === 0) {
  console.error('Database trong. Chay `npm run seed` — no da gom ca anh.')
  process.exitCode = 1
} else {
  const hasAny = db.prepare('SELECT 1 FROM binding WHERE scope = ? LIMIT 1')

  // Xử lý ảnh (bất đồng bộ) TRƯỚC, rồi mới ghi binding trong một giao dịch đồng bộ.
  const pending = []
  for (const [scope, map] of imageScopes(images)) {
    if (hasAny.get(scope)) {
      console.log(`  ${scope}: da co anh trong database, bo qua`)
      continue
    }
    for (const [itemId, value] of Object.entries(map ?? {})) {
      const filename = filenameOf(value)
      if (!filename) continue
      const processed = await processImage(readFileSync(join(SRC_IMAGES, filename)))
      pending.push({ scope, itemId, filename, processed })
    }
  }

  if (pending.length === 0) {
    console.log('Khong co gi de them.')
  } else {
    const insertBinding = db.prepare('INSERT INTO binding (scope, item_id, media_id, note) VALUES (?, ?, ?, ?)')
    db.transaction(() => {
      for (const { scope, itemId, filename, processed } of pending) {
        const { row } = storeImage(db, processed, filename)
        insertBinding.run(scope, itemId, row.id, notes.get(itemId) ?? null)
        console.log(`  ${scope}/${itemId} <- ${row.filename}`)
      }
      db.prepare('UPDATE content_counter SET value = value + 1 WHERE id = 1').run()
    })()
    console.log(`Da them ${pending.length} anh. Chay \`npm run snapshot\` de ban offline co anh moi.`)
  }
}

closeDb()
