import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthService } from '../services/authService';
import '../styles/components/Sidebar.css';

// Iconos profesionales SVG
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ReportIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const BanIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const Sidebar = () => {
  const location = useLocation();
  // Recuperamos la información del administrador validado
  const admin = AuthService.getSession();
  // Estado para contraer la barra (solo escritorio)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <aside className={`sidebar-elite ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <img src="/logo_huracan.png" alt="Logo" className="sidebar-logo" />
        <h2 className="sidebar-title">ADMIN<span className="text-yellow">.</span></h2>
        <button className="btn-collapse-sidebar hide-on-mobile" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      <div className="sidebar-user-card">
        <div className="avatar">{admin?.user?.charAt(0) || 'A'}</div>
        <div className="user-info">
          <span className="user-name">{admin?.user || 'Administrador'}</span>
          <span className="user-role">{admin?.role || 'Sistema'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/admin/dashboard" className={`sidebar-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
          <span className="icon"><DashboardIcon /></span>
          <span className="text">Dashboard</span>
        </Link>
        <Link to="/admin/bookings" className={`sidebar-link ${location.pathname === '/admin/bookings' ? 'active' : ''}`}>
          <span className="icon"><CalendarIcon /></span>
          <span className="text">Calendario y Agenda</span>
        </Link>
        {admin?.role !== 'Moderador' && (
          <Link to="/admin/reports" className={`sidebar-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
            <span className="icon"><ReportIcon /></span>
            <span className="text">Informes</span>
          </Link>
        )}
        <Link to="/admin/blacklist" className={`sidebar-link ${location.pathname === '/admin/blacklist' ? 'active' : ''}`}>
          <span className="icon"><BanIcon /></span>
          <span className="text">Restricciones</span>
        </Link>
        {admin?.role !== 'Moderador' && (
          <Link to="/admin/admins" className={`sidebar-link ${location.pathname === '/admin/admins' ? 'active' : ''}`}>
            <span className="icon"><UsersIcon /></span>
            <span className="text">Staff</span>
          </Link>
        )}
        {/* Botón exclusivo para versión móvil de cerrar sesión rápida */}
        <button onClick={handleLogout} className="sidebar-link mobile-only-logout">
          <span className="icon"><LogoutIcon /></span>
          <span className="text">Salir</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout-elite">
          <span className="icon" style={{marginRight: isCollapsed ? '0' : '8px', verticalAlign: 'middle'}}><LogoutIcon /></span> 
          <span className="text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;