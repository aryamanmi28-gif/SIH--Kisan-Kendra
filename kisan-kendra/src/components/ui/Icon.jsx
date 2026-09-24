// A small hand-picked icon set, kept in-repo instead of pulling an icon package
// so the bundle stays light on a slow connection at the mandi.
// Each entry is a list of path definitions drawn on a 24x24 grid.
const PATHS = {
  home: ['M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  'map-pin': ['M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z', 'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  ticket: ['M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z', 'M14 6v12'],
  rupee: ['M7 4h10', 'M7 9h10', 'M7 4c5 0 7 1.5 7 4s-2 4-7 4h1l7 8'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  calendar: ['M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  check: ['m5 13 4 4L19 7'],
  'check-circle': ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'm8.5 12 2.5 2.5L16 9'],
  'alert-circle': ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 8v5', 'M12 16.5h.01'],
  'alert-triangle': ['M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 16.5h.01'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5', 'M12 7.5h.01'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  'chevron-right': ['m9 5 7 7-7 7'],
  'chevron-left': ['m15 5-7 7 7 7'],
  'chevron-down': ['m5 9 7 7 7-7'],
  'arrow-left': ['M20 12H4', 'm10 6-6 6 6 6'],
  'arrow-right': ['M4 12h16', 'm14 6 6 6-6 6'],
  phone: ['M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'm21 21-4.3-4.3'],
  plus: ['M12 5v14', 'M5 12h14'],
  edit: ['M4 20h4L20 8l-4-4L4 16z', 'M14 6l4 4'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'],
  print: ['M7 9V3h10v6', 'M7 19H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2', 'M7 15h10v6H7z'],
  refresh: ['M20 11a8 8 0 0 0-13.7-5L4 8', 'M4 4v4h4', 'M4 13a8 8 0 0 0 13.7 5L20 16', 'M20 20v-4h-4'],
  logout: ['M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3', 'M10 8l-4 4 4 4', 'M6 12h9'],
  wheat: ['M12 22V9', 'M12 9c0-3 2-5 4-5 0 3-1.5 5-4 5z', 'M12 9c0-3-2-5-4-5 0 3 1.5 5 4 5z', 'M12 15c0-3 2-5 4-5 0 3-1.5 5-4 5z', 'M12 15c0-3-2-5-4-5 0 3 1.5 5 4 5z'],
  scale: ['M12 4v16', 'M6 20h12', 'M12 7 5 15h14z'],
  bank: ['M3 10 12 4l9 6', 'M5 10v9', 'M9 10v9', 'M15 10v9', 'M19 10v9', 'M3 20h18'],
  truck: ['M3 6h11v10H3z', 'M14 9h4l3 3v4h-7', 'M7.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3.5 6h.01', 'M3.5 12h.01', 'M3.5 18h.01'],
  shield: ['M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z', 'm9.5 11.5 1.5 1.5 3.5-3.5'],
  help: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.8-1.2 1.6v.5', 'M12 17h.01'],
  download: ['M12 4v11', 'm8 11 4 4 4-4', 'M5 20h14'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2', 'M12 20v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M2 12h2', 'M20 12h2', 'm4.9 19.1 1.4-1.4', 'm17.7 6.3 1.4-1.4'],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'],
  language: ['M4 5h9', 'M8.5 3v2', 'M11 5c-.8 4-3.5 7-7 8.5', 'M6 8.5c1 2 3 3.8 5.5 4.5', 'm13 21 4-9 4 9', 'M14.3 18h5.4'],
  users: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M17 11.5a3 3 0 1 0 0-6', 'M18 14.6a5.5 5.5 0 0 1 3.5 5.4'],
}

export default function Icon({ name, className = 'h-5 w-5', title, strokeWidth = 1.7, ...rest }) {
  const paths = PATHS[name]
  if (!paths) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths.map((definition) => (
        <path key={definition} d={definition} />
      ))}
    </svg>
  )
}
