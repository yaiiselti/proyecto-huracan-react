import { useState, useEffect } from 'react';
import { BookingService, type Booking } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import '../../styles/views/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const CalendarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MoneyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="2" x2="12" y2="6"/></svg>;
const HourglassIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const LockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    reservasHoy: 0,
    ingresosHoy: 0,
    bloqueos: 0,
    pendientes: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const bookings = BookingService.getBookings();
    const blocks = BookingService.getBlockedSlots();

    const hoyBookings = bookings.filter(b => b.fecha === today && b.status !== 'cancelada');
    const hoyBlocks = blocks.filter(b => b.fecha === today);

    // Filtrar próximas reservas (para la actividad reciente)
    const upcoming = bookings.filter(b => b.status !== 'cancelada').reverse().slice(0, 4);
    setRecentBookings(upcoming);

    setStats({
      reservasHoy: hoyBookings.length,
      ingresosHoy: hoyBookings.length * 25000,
      bloqueos: hoyBlocks.length,
      pendientes: hoyBookings.filter(b => b.status === 'pendiente').length
    });
  }, []);

  return (
    <div className="admin-layout-root">
      <Sidebar />
      <main className="admin-main-panel fade-in">
        <header className="dashboard-header">
          <h1>Resumen <span className="text-yellow">Huracán</span></h1>
          <p>Actividad del día: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue"><CalendarIcon /></div>
            <div className="stat-info">
              <h3>Reservas Hoy</h3>
              <p className="stat-number">{stats.reservasHoy}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green"><MoneyIcon /></div>
            <div className="stat-info">
              <h3>Ingresos Proyectados</h3>
              <p className="stat-number">${stats.ingresosHoy.toLocaleString('es-CL')}</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/admin/bookings')} style={{cursor: 'pointer'}}>
            <div className="stat-icon" style={{background: '#fef3c7', color: '#d97706'}}><HourglassIcon /></div>
            <div className="stat-info">
              <h3>Pendientes de Pago</h3>
              <p className="stat-number">{stats.pendientes}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red"><LockIcon /></div>
            <div className="stat-info">
              <h3>Bloqueos Activos</h3>
              <p className="stat-number">{stats.bloqueos}</p>
            </div>
          </div>
        </section>

        {/* Lista de próximas actividades refactorizada */}
        <section className="dashboard-activity-card">
          <div className="activity-header">
            <h3 className="activity-title">Actividad Reciente</h3>
            <button className="activity-link" onClick={() => navigate('/admin/bookings')}>Ver Agenda ➔</button>
          </div>
          <div className="dashboard-list">
            {recentBookings.length > 0 ? recentBookings.map(b => (
              <div key={b.id} className="dashboard-item">
                <div>
                  <strong>{b.nombre} {b.apellido}</strong>
                  <span>{b.fecha} - Bloque: {b.hora}</span>
                </div>
                <span className={`status-dashboard-badge badge-${b.status}`}>{b.status.toUpperCase()}</span>
              </div>
            )) : <p style={{ color: '#64748b', fontWeight: 600 }}>No hay reservas recientes en el sistema.</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;