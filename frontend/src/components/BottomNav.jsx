import { NavLink } from 'react-router-dom';

const DashboardIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
const FunnelIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
const JobsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const GoalsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);

const NAV_ITEMS = [
  { to: '/', icon: DashboardIcon, label: 'Home' },
  { to: '/estimates', icon: FunnelIcon, label: 'Pipeline' },
  { to: '/jobs', icon: JobsIcon, label: 'Jobs' },
  { to: '/goals', icon: GoalsIcon, label: 'Goals' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-primary)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors">
            {({ isActive }) => (<><div style={{ color: isActive ? 'var(--blue)' : 'var(--text-muted)' }}><Icon /></div><span className="text-xs font-semibold" style={{ color: isActive ? 'var(--blue)' : 'var(--text-muted)' }}>{label}</span></>)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}