/**
 * Icon dùng chung: ba trụ cột, bốn nhóm thiết bị và các icon giao diện
 * (mũi tên, hamburger, đóng). Cùng khung 24×24 và nét 1.6 như CourseIcons để
 * toàn trang nhất quán một ngôn ngữ đồ họa.
 */

function Svg({ children, className, size = 28, strokeWidth = 1.6 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/* --- Ba trụ cột --------------------------------------------------------- */
const PILLAR_PATHS = {
  education: (
    <>
      <path d="M2.5 8.5L12 4l9.5 4.5L12 13z" />
      <path d="M6.5 10.6v4.9c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.9" />
      <path d="M21.5 8.5v6" />
    </>
  ),
  research: (
    <>
      <path d="M9.5 3v6.3L4.6 17.9A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3.1L14.5 9.3V3" />
      <path d="M8 3h8" />
      <path d="M7.2 15.5h9.6" />
    </>
  ),
  entrepreneurship: (
    <>
      <path d="M12 2.6c3 2.5 4.6 5.7 4.6 9.4L14 15.2h-4L7.4 12c0-3.7 1.6-6.9 4.6-9.4z" />
      <circle cx="12" cy="10" r="1.8" />
      <path d="M9.6 15.6c-1.6 1.5-2.2 3.5-2.2 5.8 2-.4 3.6-1.2 4.6-2.4M14.4 15.6c1.6 1.5 2.2 3.5 2.2 5.8-2-.4-3.6-1.2-4.6-2.4" />
    </>
  ),
}

export function PillarIcon({ id, className = '', size = 32 }) {
  return (
    <Svg className={className} size={size}>
      {PILLAR_PATHS[id] ?? null}
    </Svg>
  )
}

/* --- Thiết bị ----------------------------------------------------------- */
const FACILITY_PATHS = {
  'printer-3d': (
    <>
      <path d="M3.5 3.5v13.5M20.5 3.5v13.5" />
      <path d="M3.5 7h17" />
      <path d="M12 7v2.8" />
      <path d="M8.5 17l3.5-5.6L15.5 17z" />
      <path d="M2.5 20.5h19" />
    </>
  ),
  cnc: (
    <>
      <rect x="4" y="3" width="16" height="5.5" rx="1.5" />
      <path d="M12 8.5v3" />
      <path d="M10.2 11.5h3.6L12 15z" />
      <rect x="2.5" y="17" width="19" height="4" rx="1.5" />
    </>
  ),
  laser: (
    <>
      <rect x="3.5" y="3" width="17" height="6" rx="1.8" />
      <path d="M12 9v4.5" />
      <path d="M8.8 20.5c1.1-3.2 2.1-5 3.2-6.6 1.1 1.6 2.1 3.4 3.2 6.6" />
      <path d="M3.5 20.5h17" />
    </>
  ),
  'electronics-lab': (
    <>
      <rect x="2.5" y="10" width="12.5" height="10.5" rx="2" />
      <circle cx="6.6" cy="14" r=".9" />
      <circle cx="10.9" cy="14" r=".9" />
      <circle cx="6.6" cy="17.2" r=".9" />
      <circle cx="10.9" cy="17.2" r=".9" />
      <path d="M15.6 9.4l3.4-3.4" />
      <path d="M18.6 3.2l2.5 2.5-2 2-2.5-2.5z" />
    </>
  ),
}

export function FacilityIcon({ id, className = '', size = 32 }) {
  return (
    <Svg className={className} size={size}>
      {FACILITY_PATHS[id] ?? null}
    </Svg>
  )
}

/* --- Icon giao diện ----------------------------------------------------- */
export function ArrowRightIcon({ className = '', size = 18 }) {
  return (
    <Svg className={className} size={size} strokeWidth={1.8}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </Svg>
  )
}

export function ArrowLeftIcon({ className = '', size = 18 }) {
  return (
    <Svg className={className} size={size} strokeWidth={1.8}>
      <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
    </Svg>
  )
}

export function MenuIcon({ className = '', size = 22 }) {
  return (
    <Svg className={className} size={size} strokeWidth={1.8}>
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </Svg>
  )
}

export function CloseIcon({ className = '', size = 22 }) {
  return (
    <Svg className={className} size={size} strokeWidth={1.8}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  )
}

export function QuoteIcon({ className = '', size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.2 5.5c-3.4 1.4-5.7 4.5-5.7 8.3 0 2.9 1.8 4.7 4.1 4.7 2.1 0 3.7-1.6 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8.1-1 .2.5-1.8 2-3.3 3.8-4.1zm10.3 0c-3.4 1.4-5.7 4.5-5.7 8.3 0 2.9 1.8 4.7 4.1 4.7 2.1 0 3.7-1.6 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8.1-1 .2.5-1.8 2-3.3 3.8-4.1z" />
    </svg>
  )
}
