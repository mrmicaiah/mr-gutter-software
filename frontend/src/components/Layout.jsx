import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

// Page titles based on route
const pageTitles = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/jobs/new': 'Add Job',
  '/goals': 'Goals',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title - handle dynamic routes like /jobs/:id/edit
  const getPageTitle = () => {
    if (location.pathname.includes('/edit')) {
      return 'Edit Job';
    }
    return pageTitles[location.pathname] || 'Mr Gutter';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - desktop always visible, mobile as overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Header - mobile only (desktop uses sidebar) */}
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-4">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom navigation - mobile only */}
      <BottomNav />
    </div>
  );
}