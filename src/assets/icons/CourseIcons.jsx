/**
 * Icon riêng cho từng khóa học, tra theo `id` trong file ngôn ngữ.
 *
 * Tất cả dùng chung khung 24×24, nét stroke `currentColor` độ dày 1.6 và đầu
 * nét bo tròn — đúng mô tả "flat monochrome iconography, moderate stroke
 * weight" của style reference. Vẽ tay hoàn toàn nên không phụ thuộc mạng.
 */

const PATHS = {
  // --- Nhóm định hướng nghề nghiệp ---------------------------------------
  automation: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 3.5V8H16" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 8.4V7M12 17v-1.4M15.6 12H17M7 12h1.4" />
    </>
  ),
  plastics: (
    <>
      <path d="M4.5 3.5h15l-5.5 6.5v6.5l-4 2.5v-9z" />
      <path d="M4 20.5h16" />
    </>
  ),
  process: (
    <>
      <rect x="3" y="3.5" width="6.5" height="5" rx="1.6" />
      <rect x="14.5" y="15.5" width="6.5" height="5" rx="1.6" />
      <path d="M6.25 8.5v6a3 3 0 0 0 3 3h5.25" />
      <path d="M12.5 16l2 2-2 2" />
    </>
  ),
  photonics: (
    <>
      <path d="M3 21l7.5-7.5" />
      <path d="M17 7l-3.7 3.7" />
      <circle cx="17" cy="7" r="1.3" />
      <path d="M17 2.5V5M17 9v2.5M12.5 7H15M21.5 7H19" />
    </>
  ),
  mechatronics: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2.6v1.5M8 11.9v1.5M13.4 8h-1.5M4.1 8H2.6M11.8 4.2l-1 1M5.2 10.8l-1 1M11.8 11.8l-1-1M5.2 5.2l-1-1" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
      <path d="M16.2 13.5v-2M18.6 13.5v-2M13.5 16.2h-2M13.5 18.6h-2" />
    </>
  ),
  mechanics: (
    <>
      <circle cx="9" cy="9" r="4" />
      <path d="M9 3.2v1.5M9 13.3v1.5M14.8 9h-1.5M4.7 9H3.2M13.1 4.9l-1.1 1.1M6 12l-1.1 1.1M13.1 13.1L12 12M6 6L4.9 4.9" />
      <circle cx="17.5" cy="17.5" r="2.6" />
      <path d="M17.5 13.9v1M17.5 20.1v1M21.1 17.5h-1M14.9 17.5h-1" />
    </>
  ),
  electrical: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M13.2 6.5L9.5 12.5H12L10.8 17.5l3.7-6H12z" />
    </>
  ),
  electronics: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 7V3.5M14 7V3.5M10 20.5V17M14 20.5V17M7 10H3.5M7 14H3.5M20.5 10H17M20.5 14H17" />
    </>
  ),
  water: (
    <>
      <path d="M12 2.6c3 3.4 4.9 5.9 4.9 8.1a4.9 4.9 0 1 1-9.8 0c0-2.2 1.9-4.7 4.9-8.1z" />
      <path d="M3 19.5c1.5 0 1.5 1.4 3 1.4s1.5-1.4 3-1.4 1.5 1.4 3 1.4 1.5-1.4 3-1.4 1.5 1.4 3 1.4 1.5-1.4 3-1.4" />
    </>
  ),
  stress: (
    <>
      <path d="M3 13.5h18" />
      <path d="M7 4v5.2M7 9.6L5.6 8.2M7 9.6l1.4-1.4" />
      <path d="M12 4v5.2M12 9.6l-1.4-1.4M12 9.6l1.4-1.4" />
      <path d="M17 4v5.2M17 9.6l-1.4-1.4M17 9.6l1.4-1.4" />
      <path d="M5.5 20.5L8 15.5M18.5 20.5L16 15.5" />
    </>
  ),
  cnc: (
    <>
      <path d="M9 2.5h6v5H9z" />
      <path d="M12 7.5v3.5" />
      <path d="M10.4 11h3.2L12 14.5z" />
      <rect x="3.5" y="16" width="17" height="5" rx="1.5" />
    </>
  ),
  energy: (
    <>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M12 1.6v1.4M12 11v1.4M17.4 7H16M8 7H6.6M15.8 3.2l-1 1M9.2 9.8l-1 1M15.8 10.8l-1-1M9.2 4.2l-1-1" />
      <path d="M4.5 21l1.8-5h11.4l1.8 5z" />
      <path d="M12 16v5M5.4 18.5h13.2" />
    </>
  ),

  // --- Nhóm phát triển tư duy --------------------------------------------
  'robotic-arm': (
    <>
      <path d="M3.5 20.5h7.5" />
      <path d="M7 20.5v-4" />
      <circle cx="7" cy="15.2" r="1.6" />
      <path d="M8.2 14l3.6-3" />
      <circle cx="13" cy="10" r="1.6" />
      <path d="M14.3 9l3.2-2.4" />
      <path d="M17.5 6.6l-.8-2.6M17.5 6.6l2.7.3" />
    </>
  ),
  humanoid: (
    <>
      <rect x="7" y="8" width="10" height="8" rx="2.5" />
      <circle cx="10" cy="11.6" r="1" />
      <circle cx="14" cy="11.6" r="1" />
      <path d="M12 8V5.6" />
      <circle cx="12" cy="4.2" r="1.4" />
      <path d="M7 12.5H4.6M17 12.5h2.4" />
      <path d="M9.6 16v4.5M14.4 16v4.5" />
    </>
  ),
  scratch: (
    <>
      <rect x="3" y="3.5" width="12.5" height="5" rx="1.6" />
      <rect x="6.5" y="9.5" width="14.5" height="5" rx="1.6" />
      <rect x="3" y="15.5" width="12.5" height="5" rx="1.6" />
    </>
  ),
  'robot-car': (
    <>
      <path d="M4 15.5v-3a2 2 0 0 1 2-2h1.6L9.6 7.5h4.8l2 3h1.6a2 2 0 0 1 2 2v3z" />
      <path d="M4 15.5h16" />
      <circle cx="8" cy="18" r="2.2" />
      <circle cx="16" cy="18" r="2.2" />
      <path d="M12 7.5V4.8" />
      <circle cx="12" cy="3.6" r="1.1" />
    </>
  ),
}

export function CourseIcon({ id, className = '', size = 28 }) {
  const paths = PATHS[id]
  if (!paths) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}
