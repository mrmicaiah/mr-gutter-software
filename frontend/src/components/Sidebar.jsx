import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const DashboardIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
const FunnelIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
const JobsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const PlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const GoalsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
const SunIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>);
const MoonIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>);
const GutterIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);

const NAV_ITEMS = [
  { to: '/', icon: DashboardIcon, label: 'Command Center' },
  { to: '/estimates', icon: FunnelIcon, label: 'Estimates' },
  { to: '/jobs', icon: JobsIcon, label: 'Jobs' },
  { to: '/jobs/new', icon: PlusIcon, label: 'Add Job' },
  { to: '/goals', icon: GoalsIcon, label: 'Goals' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-primary)' }}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue)', color: 'white' }}><GutterIcon /></div><div><h1 className="font-display text-lg font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>MR GUTTER</h1><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Production Tracker</p></div></div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}><CloseIcon /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors">
                {({ isActive }) => (<><div style={{ color: isActive ? 'var(--blue)' : 'var(--text-muted)' }}><Icon /></div><span style={{ color: isActive ? 'var(--blue)' : 'var(--text-secondary)' }}>{label}</span></>)}
              </NavLink>
            ))}
          </nav>
          <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}