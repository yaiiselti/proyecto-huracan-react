import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingService, type Booking } from '../../services/bookingService';
import { AuthService } from '../../services/authService';
import Sidebar from '../../components/Sidebar';

// IMPORTACIONES DE ESTILO
import '../../index.css'; 
import '../../styles/views/AdminDashboard.css'; 

// Iconos profesionales SVG
const ClipboardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><polyline points="9 14 11 16 15 11"/></svg>;
const DollarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const TrendingIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const admin = AuthService.getSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Carga de datos iniciales
    const data = BookingService.getBookings();
    setBookings(data);
  }, []);

  // 1. Filtrar estrictamente las reservas futuras (Próxima actividad)
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(b => b.status !== 'cancelada')
      .map(b => {
        const parts = b.fecha.split(/[-/]/);
        const [hours, minutes] = b.hora.split(':').map(Number);
        // Construimos el objeto Date con la hora exacta del bloque
        const dateObj = parts.length === 3
          ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), hours, minutes)
          : new Date(0);
        return { ...b, dateObj };
      })
      .filter(b => b.dateObj >= now) // Solo del presente hacia el futuro
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [bookings]);

  // 2. Cálculos rápidos y precisos para el mes actual
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const activasMes = bookings.filter(b => {
      if (b.status === 'cancelada') return false;
      const parts = b.fecha.split(/[-/]/);
      return parts.length === 3 && parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentYear;
    });

    const ingresosMes = activasMes.filter(b => b.status === 'completada').length * 25000;
    let rendimiento = Math.round((activasMes.length / 210) * 100); // 210 aprox bloques en un mes

    return { activasMes: activasMes.length, ingresosMes, rendimiento: rendimiento > 100 ? 100 : rendimiento };
  }, [bookings]);

  // Configuración de las secciones de navegación rápida
  const isAdmin = admin?.role === 'SuperAdmin' || admin?.role === 'Admin';
  const quickStats = [
    { label: 'Reservas del Mes', value: stats.activasMes, icon: <ClipboardIcon />, path: '/admin/bookings' },
    ...(isAdmin ? [{ label: 'Ingresos del Mes', value: `$${stats.ingresosMes.toLocaleString('es-CL')}`, icon: <DollarIcon />, path: '/admin/reports' }] : []),
    { label: 'Próximas Activas', value: upcomingBookings.length, icon: <ClockIcon />, path: '/admin/bookings' },
    ...(isAdmin ? [
      { label: 'Equipo Staff', value: 'Gestionar', icon: <UsersIcon />, path: '/admin/admins' },
      { label: 'Ocupación Mes', value: `${stats.rendimiento}%`, icon: <TrendingIcon />, path: '/admin/reports' }
    ] : [])
  ];

  return (
    <div className="admin-layout-root">
      <Sidebar />

      <main className="admin-main-panel">
        <header className="admin-hero-header">
          <h1>Panel de <span className="text-yellow">Control</span></h1>
          <p>Bienvenido, <strong>{admin?.user}</strong>. Gestiona el club con un toque.</p>
        </header>

        {/* GRID DE SECCIONES NAVEGABLES */}
        <section className="summary-grid-elite">
          {quickStats.map((stat, index) => (
            <div 
              key={index} 
              className="summary-item-card clickable" 
              onClick={() => navigate(stat.path)}
            >
              <div className="card-header-flex">
                <span className="label">{stat.label}</span>
                <span className="card-icon-ref">{stat.icon}</span>
              </div>
              <h2 className="value">{stat.value}</h2>
              <span className="tap-hint">Toca para ir →</span>
            </div>
          ))}
        </section>

        {/* ACTIVIDAD RECIENTE */}
        <section className="dashboard-activity-preview">
           <div className="card-top">
             <h3>Próxima Actividad</h3>
             <button className="btn-link" onClick={() => navigate('/admin/bookings')}>Ver agenda</button>
           </div>
           <div className="preview-list">
              {upcomingBookings.length > 0 ? (
                <>
                  {upcomingBookings.slice(0, 2).map(b => (
                    <div key={b.id} className="preview-row" onClick={() => navigate('/admin/bookings')} style={{ cursor: 'pointer' }}>
                      <span>{b.fecha} — {b.hora}</span>
                      <strong>{b.nombre} {b.apellido}</strong>
                    </div>
                  ))}
                  
                  {upcomingBookings.length > 2 && (
                    <div className="preview-row" onClick={() => navigate('/admin/bookings')} style={{ cursor: 'pointer', background: '#eff6ff', border: '1px dashed #3b82f6', justifyContent: 'center' }}>
                      <strong style={{ color: '#3b82f6' }}>+{upcomingBookings.length - 2} reservas próximas. Ir a la agenda ➔</strong>
                    </div>
                  )}
                </>
              ) : (
                <div className="preview-row" style={{ justifyContent: 'center', color: '#64748b' }}>No hay actividad programada próximamente.</div>
              )}
           </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;