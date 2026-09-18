import { useEffect, useRef, useState } from 'react'

/**
 * Biểu đồ SVG vẽ tay cho trang Thống kê — không kéo thư viện biểu đồ nào vào bundle.
 *
 * Quy ước (theo hướng dẫn dataviz đã dùng khi dựng):
 *   - Một trục y duy nhất. Hai đại lượng khác thang thì hai biểu đồ.
 *   - Nét mảnh: đường 2px, cột bo 4px ở đầu dữ liệu, lưới và trục nhạt.
 *   - Có lớp hover: đường dóng + chú giải cho biểu đồ đường, chú giải theo từng cột
 *     cho biểu đồ cột; bàn phím dùng mũi tên trái/phải được y như chuột.
 *   - Chữ mang màu chữ, không mang màu chuỗi dữ liệu; màu chỉ nằm ở nét/cột.
 *   - Luôn có bảng số liệu trong `<details>` cho trình đọc màn hình và người cần số.
 *
 * Màu chuỗi: xanh / cam của bảng màu tham chiếu, đã chạy bộ kiểm (CVD ΔE ~25 cả hai
 * chế độ). Tông tối là bước riêng cho nền tối, không phải đảo màu tự động.
 */
const SERIES_COLORS = [
  'text-[#2a78d6] dark:text-[#3987e5]',
  'text-[#eb6834] dark:text-[#d95926]',
]

const HEIGHT = 240
const MARGIN = { top: 16, right: 16, bottom: 28, left: 40 }

/** Bề rộng thật của khung chứa, để SVG vẽ đúng pixel thay vì kéo giãn chữ. */
function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

/** Trần trục y tròn số và bước lưới — số đếm nên bước tối thiểu là 1. */
function niceScale(max, ticks = 4) {
  if (max <= ticks) return { top: ticks, step: 1 }
  const raw = max / ticks
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const ratio = raw / magnitude
  const step = (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10) * magnitude
  const rounded = Math.max(1, Math.ceil(step))
  return { top: rounded * ticks, step: rounded }
}

const shortDay = (day) => `${day.slice(8, 10)}/${day.slice(5, 7)}`
const fullDay = (day) => `${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}`
const number = (value) => value.toLocaleString('vi-VN')

/** Nhãn trục x thưa: đủ để định vị, không chồng lên nhau. */
function xTicks(count, width) {
  const room = Math.max(2, Math.floor(width / 70))
  const every = Math.max(1, Math.ceil(count / room))
  const out = []
  for (let index = 0; index < count; index += every) out.push(index)
  if (out.at(-1) !== count - 1 && count - 1 - out.at(-1) >= every / 2) out.push(count - 1)
  return out
}

function Grid({ scale, innerWidth, y }) {
  const lines = []
  for (let value = 0; value <= scale.top; value += scale.step) lines.push(value)
  return (
    <g>
      {lines.map((value) => (
        <g key={value} transform={`translate(0 ${y(value)})`}>
          <line x1={0} x2={innerWidth} className="stroke-gray-100 dark:stroke-gray-800" strokeWidth={1} />
          <text x={-8} dy="0.32em" textAnchor="end" className="fill-gray-500 text-[11px] tabular-nums dark:fill-gray-400">
            {number(value)}
          </text>
        </g>
      ))}
    </g>
  )
}

/** Chú giải nổi. Giá trị đứng trước và đậm; tên chuỗi đi sau, kèm một vạch màu ngắn. */
function Tooltip({ left, width, title, rows }) {
  const flip = left > width - 170
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-2 z-10 min-w-[150px] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-theme-md dark:border-gray-700 dark:bg-gray-800"
      style={flip ? { right: width - left + 12 } : { left: left + 12 }}
    >
      <p className="mb-1 text-theme-xs text-gray-500 dark:text-gray-400">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center gap-2 text-theme-sm">
          <span className={`h-0.5 w-3 rounded-full bg-current ${row.color}`} aria-hidden="true" />
          <span className="font-semibold text-gray-800 tabular-nums dark:text-white/90">{number(row.value)}</span>
          <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
        </p>
      ))}
    </div>
  )
}

/** Bàn phím và chuột cùng một chỉ số đang chọn. */
function useHover(count) {
  const [index, setIndex] = useState(null)
  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    setIndex((current) => {
      const base = current ?? (event.key === 'ArrowLeft' ? count : -1)
      return Math.min(count - 1, Math.max(0, base + (event.key === 'ArrowRight' ? 1 : -1)))
    })
  }
  return { index, setIndex, onKeyDown, clear: () => setIndex(null) }
}

export function Legend({ series }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1">
      {series.map((entry, position) => (
        <li key={entry.key} className="flex items-center gap-2 text-theme-sm text-gray-600 dark:text-gray-300">
          <span className={`h-0.5 w-4 rounded-full bg-current ${SERIES_COLORS[position]}`} aria-hidden="true" />
          {entry.label}
        </li>
      ))}
    </ul>
  )
}

/** Bảng số liệu đi kèm mọi biểu đồ theo ngày. */
function DataTable({ days, series }) {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-theme-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">Xem bảng số liệu</summary>
      <div className="scrollbar-thin mt-2 max-h-64 overflow-auto">
        <table className="min-w-full text-left text-theme-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th scope="col" className="py-2 pr-4 font-medium text-gray-500">
                Ngày
              </th>
              {series.map((entry) => (
                <th key={entry.key} scope="col" className="py-2 pr-4 text-right font-medium text-gray-500">
                  {entry.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.day} className="border-b border-gray-50 last:border-0 dark:border-gray-800/60">
                <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-300">{fullDay(day.day)}</td>
                {series.map((entry) => (
                  <td key={entry.key} className="py-1.5 pr-4 text-right text-gray-800 tabular-nums dark:text-white/90">
                    {number(day[entry.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

/**
 * Biểu đồ đường theo ngày, nhiều chuỗi CÙNG ĐƠN VỊ (ví dụ lượt xem và lượt khách).
 * `series`: `[{ key, label }]` — màu theo thứ tự cố định, không theo thứ hạng.
 */
export function LineChart({ days, series, label }) {
  const [ref, width] = useWidth()
  const hover = useHover(days.length)

  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const max = Math.max(0, ...days.flatMap((day) => series.map((entry) => day[entry.key])))
  const scale = niceScale(max)
  const x = (index) => (days.length <= 1 ? innerWidth / 2 : (index / (days.length - 1)) * innerWidth)
  const y = (value) => innerHeight - (value / scale.top) * innerHeight

  const onPointerMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect()
    const position = event.clientX - box.left - MARGIN.left
    const index = Math.round((position / Math.max(1, innerWidth)) * (days.length - 1))
    hover.setIndex(Math.min(days.length - 1, Math.max(0, index)))
  }

  const active = hover.index
  return (
    <div>
      <Legend series={series} />
      <div ref={ref} className="relative mt-3">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${label}. Dùng phím mũi tên trái, phải để đọc từng ngày.`}
            tabIndex={0}
            onKeyDown={hover.onKeyDown}
            onBlur={hover.clear}
            onPointerMove={onPointerMove}
            onPointerLeave={hover.clear}
            className="block touch-pan-y focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <g transform={`translate(${MARGIN.left} ${MARGIN.top})`}>
              <Grid scale={scale} innerWidth={innerWidth} y={y} />
              {xTicks(days.length, innerWidth).map((index) => (
                <text
                  key={index}
                  x={x(index)}
                  y={innerHeight + 18}
                  textAnchor="middle"
                  className="fill-gray-500 text-[11px] dark:fill-gray-400"
                >
                  {shortDay(days[index].day)}
                </text>
              ))}
              {active !== null && (
                <line x1={x(active)} x2={x(active)} y1={0} y2={innerHeight} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth={1} />
              )}
              {series.map((entry, position) => (
                <g key={entry.key} className={SERIES_COLORS[position]}>
                  <path
                    d={days.map((day, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(day[entry.key])}`).join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {active !== null && (
                    <circle
                      cx={x(active)}
                      cy={y(days[active][entry.key])}
                      r={4.5}
                      fill="currentColor"
                      strokeWidth={2}
                      className="stroke-white dark:stroke-gray-900"
                    />
                  )}
                </g>
              ))}
            </g>
          </svg>
        )}
        {active !== null && (
          <Tooltip
            left={MARGIN.left + x(active)}
            width={width}
            title={fullDay(days[active].day)}
            rows={series.map((entry, position) => ({ label: entry.label, value: days[active][entry.key], color: SERIES_COLORS[position] }))}
          />
        )}
      </div>
      <DataTable days={days} series={series} />
    </div>
  )
}

/** Biểu đồ cột theo ngày, một chuỗi. Mỗi cột là vùng hover của chính nó (cả chiều cao). */
export function BarChart({ days, valueKey, label, seriesLabel }) {
  const [ref, width] = useWidth()
  const hover = useHover(days.length)

  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const scale = niceScale(Math.max(0, ...days.map((day) => day[valueKey])))
  const slot = days.length > 0 ? innerWidth / days.length : 0
  // Khe 2px giữa các cột; cột không mảnh quá 2px hay béo quá 28px.
  const barWidth = Math.max(2, Math.min(28, slot - 2))
  const y = (value) => innerHeight - (value / scale.top) * innerHeight
  const active = hover.index

  return (
    <div>
      <div ref={ref} className="relative">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${label}. Dùng phím mũi tên trái, phải để đọc từng ngày.`}
            tabIndex={0}
            onKeyDown={hover.onKeyDown}
            onBlur={hover.clear}
            onPointerLeave={hover.clear}
            className="block touch-pan-y focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <g transform={`translate(${MARGIN.left} ${MARGIN.top})`}>
              <Grid scale={scale} innerWidth={innerWidth} y={y} />
              {xTicks(days.length, innerWidth).map((index) => (
                <text
                  key={index}
                  x={slot * index + slot / 2}
                  y={innerHeight + 18}
                  textAnchor="middle"
                  className="fill-gray-500 text-[11px] dark:fill-gray-400"
                >
                  {shortDay(days[index].day)}
                </text>
              ))}
              {days.map((day, index) => {
                const value = day[valueKey]
                const top = y(value)
                const height = innerHeight - top
                const left = slot * index + (slot - barWidth) / 2
                const radius = Math.min(4, barWidth / 2, height)
                return (
                  <g key={day.day} onPointerEnter={() => hover.setIndex(index)}>
                    {/* Vùng bắt chuột: cả cột dọc, rộng hơn thân cột. */}
                    <rect x={slot * index} y={0} width={slot} height={innerHeight} fill="transparent" />
                    {value > 0 && (
                      <path
                        d={`M${left},${innerHeight} V${top + radius} Q${left},${top} ${left + radius},${top} H${left + barWidth - radius} Q${left + barWidth},${top} ${left + barWidth},${top + radius} V${innerHeight} Z`}
                        fill="currentColor"
                        className={`${SERIES_COLORS[0]} ${active !== null && active !== index ? 'opacity-60' : ''}`}
                      />
                    )}
                  </g>
                )
              })}
              <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} className="stroke-gray-200 dark:stroke-gray-700" />
            </g>
          </svg>
        )}
        {active !== null && (
          <Tooltip
            left={MARGIN.left + slot * active + slot / 2}
            width={width}
            title={fullDay(days[active].day)}
            rows={[{ label: seriesLabel, value: days[active][valueKey], color: SERIES_COLORS[0] }]}
          />
        )}
      </div>
      <DataTable days={days} series={[{ key: valueKey, label: seriesLabel }]} />
    </div>
  )
}

/**
 * Danh sách thanh ngang: nhãn, thanh, con số. Giá trị luôn in ra cạnh thanh nên
 * không cần chú giải nổi — thanh chỉ giúp so độ lớn bằng mắt.
 */
export function BarList({ rows, emptyText = 'Chưa có số liệu.' }) {
  if (rows.length === 0) return <p className="text-sm text-gray-500">{emptyText}</p>
  const max = Math.max(1, ...rows.map((row) => row.value))
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex items-baseline justify-between gap-3 text-theme-sm">
            <span className="min-w-0 truncate text-gray-700 dark:text-gray-300" title={row.label}>
              {row.label}
            </span>
            <span className="shrink-0 font-medium text-gray-800 tabular-nums dark:text-white/90">
              {number(row.value)}
              {row.share !== undefined && <span className="ml-1.5 text-theme-xs font-normal text-gray-400">{row.share}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className={`h-2 rounded-full bg-current ${SERIES_COLORS[0]}`} style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
