import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Target, Plus, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-safe
        `}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MG</span>
            </div>
            <span className="font-semibold text-slate-900">Mr Gutter</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-2 p-4 border-b border-slate-200">
          <div className="w-10 h-10 bg-brand-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">MG</span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Mr Gutter</div>
            <div className="text-xs text-slate-500">Production Tracker</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick action */}
        <div className="p-4 border-t border-slate-200 mt-auto">
          <NavLink
            to="/jobs/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full btn-primary py-2.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add Job</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}