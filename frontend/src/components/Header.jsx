import { Menu } from 'lucide-react';

export default function Header({ onMenuClick, title = 'Mr Gutter' }) {
  return (
    <header className="bg-brand-700 text-white sticky top-0 z-40 pt-safe">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Menu button - visible on mobile when sidebar is hidden */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-brand-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-brand-700 font-bold text-sm">MG</span>
            </div>
          </div>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        {/* Right side - placeholder for future actions */}
        <div className="w-10 lg:w-auto">
          {/* Future: notifications, user menu, etc. */}
        </div>
      </div>
    </header>
  );
}