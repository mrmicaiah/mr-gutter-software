import { useTheme } from '../context/ThemeContext';

const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const SunIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);

const MR_GUTTER_LOGO = 'https://res.cloudinary.com/dxzw1zwez/image/upload/v1768790415/mr_gutter_blue_complete_vr9fak.png';

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40" style={{ background: 'var(--bg-primary)', borderBottom: '2px solid var(--blue)', boxShadow: '0 2px 20px var(--blue-glow)' }}>
      <div className="flex items-center justify-between px-4 h-14">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} aria-label="Open menu"><MenuIcon /></button>
        <div className="flex items-center gap-3">
          <img src={MR_GUTTER_LOGO} alt="Mr Gutter" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>
        </div>
      </div>
    </header>
  );
}
