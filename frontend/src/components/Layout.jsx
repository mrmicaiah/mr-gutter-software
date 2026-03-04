import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      <div className="lg:hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      </div>
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-screen">
          <div className="pb-20 lg:pb-0"><Outlet /></div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}