import './Icon.css'

const icons = {
  home: (
    <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1V9.5z" />
  ),
  book: (
    <>
      <path d="M4 4.5A2.5 2.5 0 016.5 2H18v16H6.5A2.5 2.5 0 014 15.5v-11z" />
      <path d="M4 15.5A2.5 2.5 0 016.5 13H18" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="16" height="11" rx="1" />
      <path d="M7 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    </>
  ),
  'shopping-bag': (
    <>
      <path d="M3.5 6h13l-1.5 11H5L3.5 6z" />
      <path d="M7 6V4a3 3 0 016 0v2" />
    </>
  ),
  gift: (
    <>
      <rect x="2" y="8" width="16" height="3" rx="0.5" />
      <path d="M10 8V3" />
      <path d="M10 11v7" />
      <rect x="3" y="11" width="14" height="7" rx="0.5" />
      <path d="M6 3c0 2.5 4 5 4 5" />
      <path d="M14 3c0 2.5-4 5-4 5" />
    </>
  ),
  star: (
    <path d="M10 2l2.4 5.2L18 8l-4 4 1 5.8L10 15l-5 2.8 1-5.8-4-4 5.6-.8z" />
  ),
  diamond: (
    <path d="M10 2L2 10l8 8 8-8-8-8zM2 10h16" />
  ),
  search: (
    <>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4.5 4.5" />
    </>
  ),
  heart: (
    <path d="M10 17S2 12.5 2 7.5C2 4.5 4.5 2 7 2c1.5 0 2.5.8 3 1.5C10.5 2.8 11.5 2 13 2c2.5 0 5 2.5 5 5.5C18 12.5 10 17 10 17z" />
  ),
  'heart-filled': (
    <path d="M10 17S2 12.5 2 7.5C2 4.5 4.5 2 7 2c1.5 0 2.5.8 3 1.5C10.5 2.8 11.5 2 13 2c2.5 0 5 2.5 5 5.5C18 12.5 10 17 10 17z" fill="currentColor" />
  ),
  'chevron-right': (
    <path d="M7 4l6 6-6 6" />
  ),
  'chevron-down': (
    <path d="M4 7l6 6 6-6" />
  ),
  copy: (
    <>
      <rect x="6" y="6" width="10" height="12" rx="1" />
      <path d="M4 14V4a1 1 0 011-1h8" />
    </>
  ),
  check: (
    <path d="M4 10l4 4 8-8" />
  ),
  x: (
    <>
      <path d="M5 5l10 10" />
      <path d="M15 5L5 15" />
    </>
  ),
  menu: (
    <>
      <path d="M3 5h14" />
      <path d="M3 10h14" />
      <path d="M3 15h14" />
    </>
  ),
  logout: (
    <>
      <path d="M12 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4" />
      <path d="M8 10h-6" />
      <path d="M5 7L2 10l3 3" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1v3M10 16v3M18.5 5.5l-2.1 2.1M3.6 12.4l-2.1 2.1M19 10h-3M4 10H1M14.5 18.5l-2.1-2.1M7.6 7.6L5.5 5.5M14.5 1.5l-2.1 2.1M7.6 12.4l-2.1 2.1" />
    </>
  ),
  plus: (
    <>
      <path d="M10 4v12" />
      <path d="M4 10h12" />
    </>
  ),
  trash: (
    <>
      <path d="M3 5h14" />
      <path d="M7 5V3a1 1 0 011-1h4a1 1 0 011 1v2" />
      <path d="M4.5 5l1 12a1 1 0 001 1h7a1 1 0 001-1l1-12" />
    </>
  ),
  edit: (
    <>
      <path d="M12.5 2.5l3 3L6 15H3v-3L12.5 2.5z" />
    </>
  ),
  eye: (
    <>
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M1 10s3.5-6 9-6c1.2 0 2.3.3 3.3.7" />
      <path d="M17.5 7.5C18.6 9 19 10 19 10s-3.5 6-9 6c-.8 0-1.6-.1-2.3-.4" />
      <path d="M2 2l16 16" />
    </>
  ),
  play: (
    <path d="M5 3l12 7-12 7V3z" />
  ),
  image: (
    <>
      <rect x="2" y="2" width="16" height="16" rx="1" />
      <circle cx="7" cy="7" r="2" />
      <path d="M18 13l-4-4-8 9" />
    </>
  ),
  filter: (
    <path d="M2 3h16l-6 7v5l-4 2V10L2 3z" />
  ),
  sparkles: (
    <>
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
      <path d="M16 12l.75 2.25L19 15l-2.25.75L16 18l-.75-2.25L13 15l2.25-.75L16 12z" />
    </>
  ),
}

export default function Icon({ name, size = 20, className = '' }) {
  const svgContent = icons[name]

  if (!svgContent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <span className={`icon ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        {svgContent}
      </svg>
    </span>
  )
}
