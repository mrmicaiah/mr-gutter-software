import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Alice from './Alice';
import api from '../utils/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    // Fetch data for Alice's context
    const fetchData = async () => {
      try {
        const [estRes, jobsRes, goalsRes] = await Promise.allSettled([
          api.getEstimates(),
          api.getJobs(),
          api.getGoals(new Date().getFullYear()),
        ]);
        if (estRes.status === 'fulfilled') setEstimates(estRes.value.data || []);
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
        if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data || null);
      } catch (e) {
        console.error('Failed to load Alice context:', e);
      }
    };
    fetchData();
  }, []);

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
      <Alice estimates={estimates} jobs={jobs} goals={goals} />
    </div>
  );
}
