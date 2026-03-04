import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobsList from './pages/JobsList';
import JobForm from './pages/JobForm';
import Goals from './pages/Goals';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<JobsList />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/:id/edit" element={<JobForm />} />
            <Route path="goals" element={<Goals />} />
            <Route path="*" element={<div className="p-8 text-center"><h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1><p style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p></div>} />
          </Route>
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}