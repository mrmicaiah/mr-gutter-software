import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Target } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-brand-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`}
                />
                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}