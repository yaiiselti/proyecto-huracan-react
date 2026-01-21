import { useState, useEffect } from 'react';
import { BookingService } from '../../services/bookingService';
import type{ Booking } from '../../services/bookingService';
import { AuthService } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';
import '../../styles/views/AdminDashboard.css';

const AdminDashboard = () => {
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const admin = AuthService.getSession();

  // Función para refrescar los datos desde el LocalStorage
  const refreshData = () => {
    const data = BookingService.getBookings();
    setBookings(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    showNotification("Sesión cerrada correctamente");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Seguro que desea eliminar esta reserva?")) {
      BookingService.deleteBooking(id);
      refreshData();
      showNotification("Reserva eliminada definitivamente", "error");
    }
  };

  const handleComplete = (id: string) => {
    BookingService.completeBooking(id);
    refreshData();
    showNotification("Reserva marcada como pagada/completada");
  };

  return (
    <div className="admin-wrapper fade-in">
      {/* HEADER DE CABINA */}
      <header className="admin-header-elite">
        <div className="admin-info">
          <h2>PANEL DE <span className="text-yellow">CONTROL</span></h2>
          <p>Operador: <strong>{admin?.user}</strong></p>
        </div>
        <button onClick={handleLogout} className="btn-logout-elite">
          CERRAR SESIÓN
        </button>
      </header>

      <main className="admin-content">
        {/* TARJETAS DE MÉTRICAS */}
        <div className="metrics-grid">
          <div className="metric-card">
            <span>Total Reservas</span>
            <h3>{bookings.length}</h3>
          </div>
          <div className="metric-card">
            <span>Hoy</span>
            <h3>{bookings.filter(b => b.fecha === new Date().toLocaleDateString()).length}</h3>
          </div>
          <div className="metric-card highlight">
            <span>Ingresos Est.</span>
            <h3>${(bookings.filter(b => b.status === 'completada').length * 25000).toLocaleString()}</h3>
          </div>
        </div>

        {/* TABLA DE GESTIÓN */}
        <section className="table-container-elite mt-5">
          <div className="table-header-flex">
            <h3 className="section-title-elite">Gestión de Reservas</h3>
            <span className="count-badge">{bookings.length} registros</span>
          </div>
          
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Capitán</th>
                  <th>Contacto</th>
                  <th>Fecha</th>
                  <th>Bloque</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((reserva) => (
                    <tr key={reserva.id} className={reserva.status}>
                      <td className="fw-bold">{reserva.nombre} {reserva.apellido}</td>
                      <td>{reserva.telefono}</td>
                      <td>{reserva.fecha}</td>
                      <td><span className="badge-hour">{reserva.hora}</span></td>
                      <td>
                        <span className={`status-pill ${reserva.status}`}>
                          {reserva.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {reserva.status === 'pendiente' && (
                          <button 
                            onClick={() => handleComplete(reserva.id)} 
                            className="btn-table-check"
                            title="Completar Pago"
                          >
                            ✓
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(reserva.id)} 
                          className="btn-table-delete"
                          title="Eliminar Reserva"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-5 no-data">
                      No hay reservas registradas en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;