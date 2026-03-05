import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Target, Plus, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);

const MR_GUTTER_LOGO = 'https://res.cloudinary.com/dxzw1zwez/image/upload/v1768790415/mr_gutter_blue_complete_vr9fak.png';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ 
          background: 'var(--bg-primary)', 
          borderRight: '1px solid var(--border-primary)' 
        }}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <img src={MR_GUTTER_LOGO} alt="Mr Gutter" className="h-10 w-auto" />
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <img src={MR_GUTTER_LOGO} alt="Mr Gutter" className="h-12 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className="nav-link"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                background: isActive ? 'var(--blue-light)' : 'transparent',
                color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400',
              })}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg transition-colors"
            style={{ 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span className="text-sm font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        {/* Quick action */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <NavLink
            to="/jobs/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-white transition-colors"
            style={{ background: 'var(--blue)', boxShadow: 'var(--shadow-brand)' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Job</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
