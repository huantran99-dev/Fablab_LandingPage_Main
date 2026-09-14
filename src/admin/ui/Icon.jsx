/**
 * Bộ icon nét của dashboard. SVG vẽ tay, cùng tinh thần với icon của trang công
 * khai: không kéo thư viện icon nào vào bundle chỉ để lấy vài chục hình.
 *
 * Mọi hình dùng lưới 24×24, nét `currentColor` — màu theo chữ của phần tử cha.
 */
const ICONS = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="14" y2="17" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
    </>
  ),
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  'chevron-down': <polyline points="6 9 12 15 18 9" />,
  'chevron-right': <polyline points="9 6 15 12 9 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="16" y1="16" x2="20.5" y2="20.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2.5" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="21.5" y2="12" />
      <line x1="5.3" y1="5.3" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="18.7" y2="18.7" />
      <line x1="5.3" y1="18.7" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="18.7" y2="5.3" />
    </>
  ),
  moon: <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4" />
      <path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <polyline points="9 16 4 12 9 8" />
      <line x1="4" y1="12" x2="15" y2="12" />
    </>
  ),
  external: (
    <>
      <polyline points="14 4 20 4 20 10" />
      <line x1="20" y1="4" x2="11" y2="13" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
    </>
  ),
  trash: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6.5 7l1 13h9l1-13" />
      <line x1="10" y1="11" x2="10" y2="16" />
      <line x1="14" y1="11" x2="14" y2="16" />
    </>
  ),
  'arrow-up': (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="6 11 12 5 18 11" />
    </>
  ),
  'arrow-down': (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="6 13 12 19 18 13" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <polyline points="3.5 4 3.5 8.5 8 8.5" />
      <polyline points="12 7.5 12 12 15 14" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <polyline points="20 4 20 9 15 9" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <polyline points="21 16 15.5 10.5 5 20" />
    </>
  ),
  upload: (
    <>
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <polyline points="7 9 12 4 17 9" />
      <line x1="12" y1="4" x2="12" y2="16" />
    </>
  ),
  check: <polyline points="5 12.5 10 17.5 19 7" />,
  alert: (
    <>
      <path d="M12 3.5 2.5 20h19L12 3.5z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <line x1="12" y1="7.5" x2="12" y2="7.51" />
    </>
  ),
  save: (
    <>
      <path d="M5 3.5h11l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z" />
      <rect x="7.5" y="13" width="9" height="7.5" />
      <polyline points="7.5 3.5 7.5 8 14.5 8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <line x1="11.2" y1="11.8" x2="20" y2="3" />
      <line x1="16" y1="7" x2="19" y2="10" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  // --- Icon theo section ---------------------------------------------------
  nav: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="6.5" y1="6.5" x2="9.5" y2="6.5" />
    </>
  ),
  hero: <path d="M12 3.5l2.3 6.2 6.2 2.3-6.2 2.3L12 20.5l-2.3-6.2L3.5 12l6.2-2.3L12 3.5z" />,
  pillars: (
    <>
      <rect x="3.5" y="4" width="4.5" height="16" rx="1" />
      <rect x="9.75" y="4" width="4.5" height="16" rx="1" />
      <rect x="16" y="4" width="4.5" height="16" rx="1" />
    </>
  ),
  stats: (
    <>
      <line x1="3.5" y1="20" x2="20.5" y2="20" />
      <rect x="5.5" y="11" width="3" height="6.5" rx="0.5" />
      <rect x="10.5" y="5.5" width="3" height="12" rx="0.5" />
      <rect x="15.5" y="13.5" width="3" height="4" rx="0.5" />
    </>
  ),
  courses: (
    <>
      <path d="M4.5 5A2 2 0 0 1 6.5 3h13v15h-13a2 2 0 0 0-2 2V5z" />
      <path d="M4.5 20a2 2 0 0 1 2-2h13v3h-13a2 2 0 0 1-2-1z" />
    </>
  ),
  facilities: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <line x1="10" y1="3.5" x2="10" y2="7" />
      <line x1="14" y1="3.5" x2="14" y2="7" />
      <line x1="10" y1="17" x2="10" y2="20.5" />
      <line x1="14" y1="17" x2="14" y2="20.5" />
      <line x1="3.5" y1="10" x2="7" y2="10" />
      <line x1="3.5" y1="14" x2="7" y2="14" />
      <line x1="17" y1="10" x2="20.5" y2="10" />
      <line x1="17" y1="14" x2="20.5" y2="14" />
    </>
  ),
  partners: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <path d="M12 3.5a13 13 0 0 1 0 17 13 13 0 0 1 0-17z" />
    </>
  ),
  activities: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <line x1="3.5" y1="10" x2="20.5" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4" />
      <path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </>
  ),
  testimonials: (
    <>
      <path d="M4 5h16v11H9.5L4 20V5z" />
      <line x1="8" y1="9.5" x2="16" y2="9.5" />
      <line x1="8" y1="12.5" x2="13" y2="12.5" />
    </>
  ),
  finalCta: (
    <>
      <path d="M3.5 10v4H7l6 4.5v-13L7 10H3.5z" />
      <path d="M16.5 9a4 4 0 0 1 0 6" />
      <path d="M19 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  footer: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="6.5" y1="17.5" x2="11" y2="17.5" />
    </>
  ),
}

export function Icon({ name, size = 20, className = '', strokeWidth = 1.7 }) {
  const shape = ICONS[name]
  if (!shape) return null
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
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  )
}
