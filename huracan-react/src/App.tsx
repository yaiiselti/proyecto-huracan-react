import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

// Componentes Globales
import Header from './components/Header';
import Footer from './components/Footer';

// Vistas Públicas
import Home from './views/Home';
import Club from './views/Club';
import Reserva from './views/Reserva';
import Login from './views/Login';
import NotFound from './views/NotFound';

// Vistas de Administración
import AdminDashboard from './views/admin/AdminDashboard';
import Bookings from './views/admin/Bookings';
import Reports from './views/admin/Reports';
import Admins from './views/admin/Admins';
import Blacklist from './views/admin/Blacklist';

// Servicios de Seguridad
import { AuthService } from './services/authService';

// COMPONENTE ELITE: Guardián de Rutas Privadas
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const session = AuthService.getSession();
  
  // Si no hay sesión activa, expulsamos al usuario al Login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // ANTI-TAMPERING: Validamos que el usuario no haya modificado su rol manualmente en el navegador
  // Excepción de seguridad: La cuenta maestra es invulnerable y no se verifica contra la base local
  if (session.email !== 'yaiiselti258@gmail.com') {
    const staffData = localStorage.getItem('huracan_staff');
    if (staffData) {
      const staffList = JSON.parse(staffData);
      const realUser = staffList.find((s: any) => s.nombre === session.user);
      if (!realUser || realUser.rol !== session.role) {
        AuthService.logout(); // Destruimos la sesión corrupta
        return <Navigate to="/login" replace />;
      }
    }
  }

  // RBAC: Verificamos si el rol del usuario tiene permiso para ver esta ruta
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Si hay sesión, lo dejamos pasar al componente solicitado
  return <>{children}</>;
};

function App() {
  // SINCRONIZACIÓN DE PESTAÑAS: Si se cierra sesión en otra pestaña, cerramos esta también.
  useEffect(() => {
    const syncTabs = (e: StorageEvent) => {
      if (e.key === 'huracan_session' && !e.newValue) {
        window.location.href = '/login';
      }
    };
    window.addEventListener('storage', syncTabs);
    return () => window.removeEventListener('storage', syncTabs);
  }, []);

  // ATAJO DE TECLADO SECRETO PARA ADMINS (Ctrl + Shift + L)
  useEffect(() => {
    const handleSecretLogin = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        window.location.href = '/login';
      }
    };
    window.addEventListener('keydown', handleSecretLogin);
    return () => window.removeEventListener('keydown', handleSecretLogin);
  }, []);

  return (
    <Router>
      {/* El Header es inteligente: se oculta solo en /admin y /login */}
      <Header />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Home />} />
        <Route path="/club" element={<Club />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS PRIVADAS (ADMIN) --- */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/admin/blacklist" element={<ProtectedRoute><Blacklist /></ProtectedRoute>} />
        
        {/* RUTAS ULTRA-PRIVADAS (Solo Admins y SuperAdmins, Moderadores bloqueados) */}
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['SuperAdmin', 'Admin']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={['SuperAdmin', 'Admin']}><Admins /></ProtectedRoute>} />

        {/* --- RUTA DE CAPTURA (404) --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* El Footer también es inteligente y desaparece en el panel de control */}
      <Footer />
    </Router>
  );
}

export default App;