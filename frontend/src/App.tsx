import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataScraper from './pages/tools/DataScraper';
import VendingFinder from './pages/tools/VendingFinder';
import AIContent from './pages/tools/AIContent';
import SiteAuditor from './pages/tools/SiteAuditor';
import LeadMessenger from './pages/tools/LeadMessenger';
import SiteManager from './pages/SiteManager';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tools/data-scraper" element={<DataScraper />} />
          <Route path="tools/vending-finder" element={<VendingFinder />} />
          <Route path="tools/ai-content" element={<AIContent />} />
          <Route path="tools/site-auditor" element={<SiteAuditor />} />
          <Route path="tools/lead-messenger" element={<LeadMessenger />} />
          <Route path="sites" element={<SiteManager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
