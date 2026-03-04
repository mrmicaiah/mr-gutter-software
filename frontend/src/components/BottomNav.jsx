import { NavLink } from 'react-router-dom';

const DashboardIcon = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>);
const JobsIcon = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const GoalsIcon = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>);

const navItems = [{ to: '/', icon: DashboardIcon, label: 'Command' }, { to: '/jobs', icon: JobsIcon, label: 'Jobs' }, { to: '/goals', icon: GoalsIcon, label: 'Goals' }];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-primary)' }}>
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="flex flex-col items-center justify-center flex-1 h-full transition-colors">
            {({ isActive }) => (<><div style={{ color: isActive ? 'var(--blue)' : 'var(--text-muted)' }}><Icon active={isActive} /></div><span className="text-xs mt-1 font-semibold uppercase tracking-wide" style={{ color: isActive ? 'var(--blue)' : 'var(--text-muted)', fontFamily: "'Rajdhani', sans-serif" }}>{label}</span></>)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}