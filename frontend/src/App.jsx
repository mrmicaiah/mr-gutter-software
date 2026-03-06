import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobsList from './pages/JobsList';
import JobForm from './pages/JobForm';
import AddWeekForm from './pages/AddWeekForm';
import Goals from './pages/Goals';
import EstimatesPipeline from './pages/EstimatesPipeline';
import EstimateFormPage from './pages/EstimateFormPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="estimates" element={<EstimatesPipeline />} />
              <Route path="estimates/new" element={<EstimateFormPage />} />
              <Route path="estimates/:id/edit" element={<EstimateFormPage />} />
              <Route path="jobs" element={<JobsList />} />
              <Route path="jobs/new" element={<JobForm />} />
              <Route path="jobs/week" element={<AddWeekForm />} />
              <Route path="jobs/:id/edit" element={<JobForm />} />
              <Route path="goals" element={<Goals />} />
              <Route path="*" element={<div className="p-8 text-center"><h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1><p style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p></div>} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
