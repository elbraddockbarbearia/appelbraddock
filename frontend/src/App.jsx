import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Scissors } from 'lucide-react';

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-barber-black text-barber-gold">
    <img 
      src="/logos/Logo-ElBraddock-Dourado.png" 
      alt="El Braddock" 
      className="w-32 animate-pulse mb-4" 
    />
  </div>
);

// Lazy Loaded Client Pages
const Home = lazy(() => import('./pages/Client/Home'));
const Schedule = lazy(() => import('./pages/Client/Schedule'));
const ClientHistory = lazy(() => import('./pages/Client/History'));
const ClientProfile = lazy(() => import('./pages/Client/Profile'));
const Login = lazy(() => import('./pages/Client/Login'));
const Register = lazy(() => import('./pages/Client/Register'));
const Subscription = lazy(() => import('./pages/Client/Subscription'));

// Lazy Loaded Admin Pages
const AdminLogin = lazy(() => import('./pages/Admin/Login'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminAgenda = lazy(() => import('./pages/Admin/Agenda'));
const AdminMensalidade = lazy(() => import('./pages/Admin/Mensalidade'));
const AdminCashier = lazy(() => import('./pages/Admin/Cashier'));
const AdminRanking = lazy(() => import('./pages/Admin/Ranking'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings'));
const AdminServicos = lazy(() => import('./pages/Admin/Servicos'));
const AdminBarbeiros = lazy(() => import('./pages/Admin/Barbeiros'));
const AdminComissao = lazy(() => import('./pages/Admin/Comissao'));
const AdminRetencao = lazy(() => import('./pages/Admin/Retention'));

// Lazy Loaded Barber Portal Pages
const BarberLogin = lazy(() => import('./pages/Barber/Login'));
const BarberDashboard = lazy(() => import('./pages/Barber/Dashboard'));
const BarberAgenda = lazy(() => import('./pages/Barber/Agenda'));
const BarberNotificacoes = lazy(() => import('./pages/Barber/Notificacoes'));

// Components
import AdminRoute from './components/AdminRoute';
import BarberRoute from './components/BarberRoute';
import OfflineBanner from './components/OfflineBanner';

function App() {
  return (
    <Router>
        <div className="min-h-screen font-sans text-white" style={{ backgroundColor: 'var(--color-barber-black)' }}>
          <OfflineBanner />
          <Routes>
            {/* Client Routes */}
            <Route path="/"          element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
            <Route path="/schedule"  element={<Suspense fallback={<PageLoader />}><Schedule /></Suspense>} />
            <Route path="/history"   element={<Suspense fallback={<PageLoader />}><ClientHistory /></Suspense>} />
            <Route path="/profile"   element={<Suspense fallback={<PageLoader />}><ClientProfile /></Suspense>} />
            <Route path="/login"     element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
            <Route path="/register"  element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
            <Route path="/subscription" element={<Suspense fallback={<PageLoader />}><Subscription /></Suspense>} />

            {/* Admin Public Route */}
            <Route path="/admin/login"     element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />

            {/* Admin Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"             element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
              <Route path="/admin/agenda"      element={<Suspense fallback={<PageLoader />}><AdminAgenda /></Suspense>} />
              <Route path="/admin/mensalidade" element={<Suspense fallback={<PageLoader />}><AdminMensalidade /></Suspense>} />
              <Route path="/admin/ranking"     element={<Suspense fallback={<PageLoader />}><AdminRanking /></Suspense>} />
              <Route path="/admin/servicos"    element={<Suspense fallback={<PageLoader />}><AdminServicos /></Suspense>} />
              <Route path="/admin/barbeiros"   element={<Suspense fallback={<PageLoader />}><AdminBarbeiros /></Suspense>} />
              <Route path="/admin/comissao"    element={<Suspense fallback={<PageLoader />}><AdminComissao /></Suspense>} />
              <Route path="/admin/cashier"     element={<Suspense fallback={<PageLoader />}><AdminCashier /></Suspense>} />
              <Route path="/admin/retencao"    element={<Suspense fallback={<PageLoader />}><AdminRetencao /></Suspense>} />
              <Route path="/admin/settings"    element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
            </Route>

            {/* Barber Portal */}
            <Route path="/barber/login" element={<Suspense fallback={<PageLoader />}><BarberLogin /></Suspense>} />
            <Route element={<BarberRoute />}>
              <Route path="/barber"                element={<Suspense fallback={<PageLoader />}><BarberDashboard /></Suspense>} />
              <Route path="/barber/agenda"          element={<Suspense fallback={<PageLoader />}><BarberAgenda /></Suspense>} />
              <Route path="/barber/comissao"        element={<Suspense fallback={<PageLoader />}><AdminComissao /></Suspense>} />
              <Route path="/barber/notificacoes"    element={<Suspense fallback={<PageLoader />}><BarberNotificacoes /></Suspense>} />
            </Route>
          </Routes>
        </div>
      </Router>
  );
}

export default App;
