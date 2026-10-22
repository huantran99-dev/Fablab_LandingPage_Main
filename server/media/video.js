/**
 * Xử lý video tải lên (nền banner Cuộc thi): kiểm, XOÁ METADATA VỊ TRÍ, đo, băm.
 *
 * Máy chủ không có ffmpeg, nên KHÔNG chuyển mã — video được phục vụ đúng như người
 * dùng tải lên. Vì vậy:
 *
 * 1. **Chỉ nhận MP4 với hình H.264** (`avc1`/`avc3`). Đó là định dạng duy nhất mọi
 *    trình duyệt (kể cả Safari iPhone cũ và Chrome trên Windows chưa cài tiện ích HEVC)
 *    đều phát được. Video iPhone mặc định là HEVC (`hvc1`) trong `.mov` — từ chối kèm
 *    hướng dẫn xuất lại, thay vì nhận vào rồi để nửa số người xem thấy ô đen.
 *
 * 2. **Xoá metadata, giữ nguyên mọi offset.** Video điện thoại mang toạ độ GPS nơi quay
 *    (Android: `moov/udta/©xyz`; iPhone: `moov/meta` khoá
 *    `com.apple.quicktime.location.ISO6709`) — cùng lý do ảnh phải bỏ EXIF. Xoá hẳn hộp
 *    sẽ dịch vị trí `mdat` và làm sai bảng offset (`stco`/`co64`) → video hỏng. Thay
 *    vào đó hộp được ĐỔI TÊN thành `free` và ghi đè 0 lên nội dung: kích thước file y
 *    nguyên, trình phát bỏ qua hộp `free` theo chuẩn ISO BMFF.
 *
 * 3. **Băm SAU khi xoá metadata** — tên file mang băm của đúng những byte được phục vụ.
 */
import { createHash } from 'node:crypto'

import { MediaError } from './process.js'

export const VIDEO_TYPES = ['video/mp4']
/** Video nền nên ngắn và nhẹ; quá mức này gần như chắc chắn là video gốc chưa nén. */
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024

/** Hộp mang metadata người dùng — trung hoà ở cấp file, trong `moov` và trong từng `trak`. */
const METADATA_BOXES = new Set(['udta', 'meta', 'uuid'])
const H264 = new Set(['avc1', 'avc3'])

const type = (buffer, offset) => buffer.toString('latin1', offset + 4, offset + 8)

/** Liệt kê hộp con trong khoảng [start, end): `{ type, start, end, body }`. */
function boxes(buffer, start, end) {
  const out = []
  let offset = start
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset)
    let header = 8
    if (size === 1) {
      if (offset + 16 > end) break
      size = Number(buffer.readBigUInt64BE(offset + 8))
      header = 16
    } else if (size === 0) {
      size = end - offset
    }
    if (size < header || offset + size > end) {
      throw new MediaError(415, 'file MP4 hong cau truc (hop vuot qua cuoi file)')
    }
    out.push({ type: type(buffer, offset), start: offset, end: offset + size, body: offset + header })
    offset += size
  }
  return out
}

const child = (buffer, box, name) => boxes(buffer, box.body, box.end).find((entry) => entry.type === name)

/** Đổi hộp thành `free` và xoá trắng nội dung — giữ nguyên kích thước. */
function neutralize(buffer, box) {
  buffer.write('free', box.start + 4, 'latin1')
  buffer.fill(0, box.body, box.end)
}

/** Kích thước HIỂN THỊ của track hình, đã tính xoay (video quay dọc lưu ngang + ma trận 90°). */
function trackSize(buffer, tkhd) {
  const version = buffer[tkhd.body]
  const fields = tkhd.body + 4
  const matrix = fields + (version === 1 ? 32 : 20) + 16
  const a = buffer.readInt32BE(matrix)
  const d = buffer.readInt32BE(matrix + 16)
  const width = Math.round(buffer.readUInt32BE(matrix + 36) / 65536)
  const height = Math.round(buffer.readUInt32BE(matrix + 40) / 65536)
  return a === 0 && d === 0 ? { width: height, height: width } : { width, height }
}

/**
 * Độ dài (giây) từ `mvhd`. MP4 phân mảnh (MediaRecorder, một số app quay màn hình) ghi 0
 * ở đó và để độ dài thật trong `mvex/mehd` — thử cả hai. Không đọc được thì `null`: banner
 * chỉ dùng số này để chọn thời gian mỗi slide, có giá trị mặc định.
 */
function movieDuration(buffer, moov) {
  const mvhd = child(buffer, moov, 'mvhd')
  if (!mvhd) return null
  const version = buffer[mvhd.body]
  const fields = mvhd.body + 4
  const timescale = buffer.readUInt32BE(fields + (version === 1 ? 16 : 8))
  let duration = version === 1 ? Number(buffer.readBigUInt64BE(fields + 20)) : buffer.readUInt32BE(fields + 12)

  if (!duration) {
    const mvex = child(buffer, moov, 'mvex')
    const mehd = mvex && child(buffer, mvex, 'mehd')
    if (mehd) {
      duration = buffer[mehd.body] === 1 ? Number(buffer.readBigUInt64BE(mehd.body + 4)) : buffer.readUInt32BE(mehd.body + 4)
    }
  }
  return timescale > 0 && duration > 0 ? Math.round((duration / timescale) * 10) / 10 : null
}

/** Mã hình của track: loại hộp mẫu đầu tiên trong `stsd`. */
function codecOf(buffer, trak) {
  const stbl = ['mdia', 'minf', 'stbl'].reduce((box, name) => box && child(buffer, box, name), trak)
  const stsd = stbl && child(buffer, stbl, 'stsd')
  if (!stsd || stsd.body + 16 > stsd.end) return null
  return type(buffer, stsd.body + 8)
}

function handlerOf(buffer, trak) {
  const mdia = child(buffer, trak, 'mdia')
  const hdlr = mdia && child(buffer, mdia, 'hdlr')
  return hdlr ? buffer.toString('latin1', hdlr.body + 8, hdlr.body + 12) : null
}

export function processVideo(input) {
  if (input.length > MAX_VIDEO_BYTES) {
    throw new MediaError(413, `video qua lon (toi da ${MAX_VIDEO_BYTES / 1024 / 1024} MB) — cat ngan hoac nen lai truoc khi tai len`)
  }
  // Bản sao: sửa tại chỗ trên buffer của request là sửa luôn dữ liệu người khác đang giữ.
  const buffer = Buffer.from(input)

  if (buffer.length < 16 || type(buffer, 0) !== 'ftyp') {
    throw new MediaError(415, 'khong phai file MP4 hop le')
  }
  const brand = buffer.toString('latin1', 8, 12)
  if (brand === 'qt  ') {
    throw new MediaError(415, 'file .mov (QuickTime) — xuat lai thanh MP4 H.264 truoc khi tai len')
  }

  const top = boxes(buffer, 0, buffer.length)
  const moov = top.find((box) => box.type === 'moov')
  if (!moov || !top.some((box) => box.type === 'mdat')) {
    throw new MediaError(415, 'file MP4 thieu du lieu hinh (moov/mdat)')
  }

  const traks = boxes(buffer, moov.body, moov.end).filter((box) => box.type === 'trak')
  const video = traks.find((trak) => handlerOf(buffer, trak) === 'vide')
  if (!video) throw new MediaError(415, 'file MP4 khong co hinh')

  const codec = codecOf(buffer, video)
  if (!H264.has(codec)) {
    throw new MediaError(
      415,
      `ma hinh '${codec ?? '?'}' khong phat duoc tren moi trinh duyet — xuat lai thanh MP4 H.264` +
        (codec === 'hvc1' || codec === 'hev1' ? ' (video iPhone mac dinh la HEVC)' : ''),
    )
  }

  const tkhd = child(buffer, video, 'tkhd')
  const { width, height } = tkhd ? trackSize(buffer, tkhd) : { width: 0, height: 0 }
  if (!width || !height) throw new MediaError(415, 'khong doc duoc kich thuoc video')
  const duration = movieDuration(buffer, moov)

  // Trung hoà metadata ở cả ba tầng. Đi trên danh sách đã liệt kê TRƯỚC khi sửa, và
  // `free` không phải tên nào trong METADATA_BOXES nên không có gì bị duyệt hai lần.
  for (const box of top) if (METADATA_BOXES.has(box.type)) neutralize(buffer, box)
  for (const box of boxes(buffer, moov.body, moov.end)) if (METADATA_BOXES.has(box.type)) neutralize(buffer, box)
  for (const trak of traks) {
    for (const box of boxes(buffer, trak.body, trak.end)) if (METADATA_BOXES.has(box.type)) neutralize(buffer, box)
  }

  return {
    data: buffer,
    width,
    height,
    duration,
    ext: 'mp4',
    mime: 'video/mp4',
    sha256: createHash('sha256').update(buffer).digest('hex'),
  }
}
