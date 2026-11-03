/**
 * Bộ máy hạt rơi — dùng chung cho trang công khai (SeasonFall.jsx, cả cửa sổ) và khung xem
 * trước của dashboard (MotifPreview.jsx, một ô nhỏ). Không React: nơi gọi đưa canvas,
 * cấu hình (dạng `PARTICLES`, từ `resolveMotif`) và cách đo kích thước vùng vẽ.
 *
 * - Mỗi loại hạt (× mỗi màu, với pháo giấy) vẽ sẵn MỘT lần ra canvas phụ ở cỡ lớn nhất,
 *   mỗi khung hình chỉ `drawImage`. Hình có sẵn vẽ bằng `Path2D`; ảnh tải lên nạp bằng
 *   `Image` rồi vẽ "contain" vào ô vuông. Ảnh nạp lỗi thì loại hạt đó bị bỏ, không sập.
 * - Vòng lặp chỉ bắt đầu khi sprite đã sẵn; dừng hẳn khi tab ẩn.
 * - Giảm chuyển động / tiết kiệm dữ liệu do NƠI GỌI quyết định (không gọi là không chạy).
 */
import { confettiColors, drawGlyph } from './motifs'

/** Số hạt chuẩn cho khung 1280×800; khung nhỏ hơn tự ít hơn theo diện tích. */
const BASE_COUNT = 34
const MIN_COUNT = 10
const MAX_DPR = 2

const between = ([min, max]) => min + Math.random() * (max - min)

function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image.naturalWidth > 0 ? image : null)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

function blankSprite(px) {
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = px
  return canvas
}

/** `Map<loại hạt, canvas[]>` — loại nào không vẽ được thì vắng mặt. */
async function makeSprites(config, accent, dpr) {
  const colors = config.coloured ? confettiColors(accent) : [undefined]
  const sprites = new Map()
  await Promise.all(
    config.kinds.map(async (kind) => {
      const px = Math.max(1, Math.ceil(kind.size[1] * dpr))
      if (kind.image) {
        const image = await loadImage(kind.image.url)
        if (!image) return
        const canvas = blankSprite(px)
        const scale = Math.min(px / image.naturalWidth, px / image.naturalHeight)
        const w = image.naturalWidth * scale
        const h = image.naturalHeight * scale
        canvas.getContext('2d').drawImage(image, (px - w) / 2, (px - h) / 2, w, h)
        sprites.set(kind, [canvas])
        return
      }
      sprites.set(
        kind,
        colors.map((color) => {
          const canvas = blankSprite(px)
          const ctx = canvas.getContext('2d')
          ctx.scale(px / 24, px / 24)
          drawGlyph(ctx, kind.glyph, color)
          return canvas
        }),
      )
    }),
  )
  return sprites
}

function pickKind(kinds) {
  const total = kinds.reduce((sum, kind) => sum + kind.weight, 0)
  let roll = Math.random() * total
  for (const kind of kinds) {
    roll -= kind.weight
    if (roll <= 0) return kind
  }
  return kinds[kinds.length - 1]
}

/**
 * Chạy hạt rơi trên `canvas`. `measure()` trả `{ width, height }` (px CSS) của vùng vẽ.
 * Trả `{ resize, stop }`: gọi `resize()` khi vùng vẽ đổi cỡ, `stop()` khi gỡ.
 */
export function startFall(canvas, config, { accent, measure }) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  let stopped = false
  let ready = false
  let sprites = new Map()
  let kinds = []
  let width = 0
  let height = 0
  let particles = []
  let frame = 0
  let last = 0

  const spawn = (anywhere) => {
    const kind = pickKind(kinds)
    const list = sprites.get(kind)
    const size = between(kind.size)
    const y = anywhere
      ? Math.random() * height
      : config.direction > 0
        ? -size - Math.random() * 40
        : height + size + Math.random() * 40
    return {
      sprite: list[Math.floor(Math.random() * list.length)],
      size,
      x: Math.random() * width,
      y,
      speed: between(config.speed),
      sway: between(config.sway),
      swaySpeed: 0.5 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      rotation: config.upright ? 0 : Math.random() * Math.PI * 2,
      spin: config.spin ? between(config.spin) : 0,
      flipSpeed: config.flip ? 2 + Math.random() * 4 : 0,
      flapSpeed: kind.flap ? 8 + Math.random() * 4 : 0,
    }
  }

  const resize = () => {
    const size = measure()
    width = size.width
    height = size.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    if (!ready) return
    const area = (width * height) / (1280 * 800)
    const count = Math.round(Math.max(MIN_COUNT, Math.min(BASE_COUNT, BASE_COUNT * area)) * config.density)
    while (particles.length < count) particles.push(spawn(true))
    particles.length = count
    for (const p of particles) p.x = Math.min(p.x, width)
  }

  const step = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i]
      p.y += config.direction * p.speed * dt
      p.phase += p.swaySpeed * dt
      p.rotation += p.spin * dt
      const gone = config.direction > 0 ? p.y > height + p.size : p.y < -p.size
      if (gone) p = particles[i] = spawn(false)

      const x = p.x + Math.sin(p.phase) * p.sway
      const angle = config.tilt ? Math.sin(p.phase * 1.3) * config.tilt : p.rotation
      // Hạt bay lên mờ dần khi gần mép trên, để không "biến mất" đột ngột sau navbar.
      ctx.globalAlpha = config.direction < 0 ? Math.max(0, Math.min(1, p.y / (height * 0.3))) : 0.9
      ctx.setTransform(dpr, 0, 0, dpr, x * dpr, p.y * dpr)
      ctx.rotate(angle)
      if (p.flipSpeed) ctx.scale(Math.cos(p.phase * p.flipSpeed), 1)
      // Vỗ cánh: co giãn theo chiều dọc, không bao giờ dẹt hẳn.
      if (p.flapSpeed) ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.phase * p.flapSpeed)))
      ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size)
    }
    frame = requestAnimationFrame(step)
  }

  const start = () => {
    cancelAnimationFrame(frame)
    if (!ready || stopped || document.visibilityState !== 'visible') return
    last = performance.now()
    frame = requestAnimationFrame(step)
  }
  const onVisibility = () => {
    if (document.visibilityState === 'visible') start()
    else cancelAnimationFrame(frame)
  }

  resize()
  document.addEventListener('visibilitychange', onVisibility)
  makeSprites(config, accent, dpr).then((made) => {
    if (stopped) return
    sprites = made
    kinds = config.kinds.filter((kind) => made.has(kind))
    if (kinds.length === 0) return
    ready = true
    resize()
    start()
  })

  return {
    resize,
    stop() {
      stopped = true
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
