import { useState, useEffect } from 'react';
import { BookingService, type Booking } from '../../services/bookingService';
import { AuthService } from '../../services/authService';
import Sidebar from '../../components/Sidebar';

// CORRECCIÓN: Ruta relativa para llegar a src/index.css
import '../../index.css'; 
// Opcional: Importar también su CSS directo si prefieres redundancia
import './AdminDashboard.css'; 

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const admin = AuthService.getSession();

  useEffect(() => {
    setBookings(BookingService.getBookings());
  }, []);

  return (
    <div className="admin-layout-root">
      {/* MENÚ LATERAL (Sidebar) SIEMPRE PRESENTE */}
      <Sidebar />

      <main className="admin-main-panel">
        <header className="admin-hero-header">
          <h1>Panel de <span className="text-yellow">Control</span></h1>
          <p>Bienvenido, <strong>{admin?.user}</strong>. Resumen operativo del club.</p>
        </header>

        <section className="summary-grid-elite">
          <div className="summary-item-card">
            <span className="label">Reservas Activas</span>
            <h2 className="value">{bookings.length}</h2>
          </div>
          <div className="summary-item-card">
            <span className="label">Ingresos del Mes</span>
            <h2 className="value">${(bookings.filter(b => b.status === 'completada').length * 25000).toLocaleString()}</h2>
          </div>
        </section>

        <section className="dashboard-activity-preview">
           <h3>Próxima Actividad</h3>
           <div className="preview-list">
              {bookings.slice(0, 3).map(b => (
                <div key={b.id} className="preview-row">
                  <span>{b.fecha} - {b.hora}</span>
                  <strong>{b.nombre} {b.apellido}</strong>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;