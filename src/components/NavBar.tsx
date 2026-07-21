import { NavLink, useLocation } from 'react-router-dom';

const icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  learn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5V5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 0-2 2z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  ),
  practice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-6M21 20H3" />
    </svg>
  ),
  swap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8h13M17 4l4 4-4 4" />
      <path d="M17 16H4M7 12l-4 4 4 4" />
    </svg>
  ),
};

const TRACH_ITEMS = [
  { to: '/trachtenberg', label: 'Home', icon: icons.home, end: true },
  { to: '/learn', label: 'Learn', icon: icons.learn, end: false },
  { to: '/practice', label: 'Practice', icon: icons.practice, end: false },
  { to: '/stats', label: 'Stats', icon: icons.stats, end: false },
];

const MATH_ITEMS = [
  { to: '/math', label: 'Grades', icon: icons.learn, end: true },
  { to: '/math/practice', label: 'Practice', icon: icons.practice, end: false },
  { to: '/math/stats', label: 'Stats', icon: icons.stats, end: false },
  { to: '/', label: 'Mode', icon: icons.swap, end: true },
];

export default function NavBar() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  const items = pathname.startsWith('/math') ? MATH_ITEMS : TRACH_ITEMS;

  return (
    <nav className="nav">
      <div className="nav-inner">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
