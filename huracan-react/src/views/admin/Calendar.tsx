import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { BookingService } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import '../../styles/views/Calendar.css';

const Calendar = () => {
  const navigate = useNavigate();
  const [weekDays, setWeekDays] = useState<{ fechaStr: string; nombreDia: string; reservas: number; ingresos: number }[]>([]);

  useEffect(() => {
    const bookings = BookingService.getBookings();
    const next7Days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const fechaStr = date.toLocaleDateString();
      const nombreDia = date.toLocaleDateString('es-CL', { weekday: 'long' });
      
      const reservasDelDia = bookings.filter(b => b.fecha === fechaStr && b.status !== 'cancelada');
      
      next7Days.push({
        fechaStr,
        nombreDia: nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1),
        reservas: reservasDelDia.length,
        ingresos: reservasDelDia.length * 25000
      });
    }
    setWeekDays(next7Days);
  }, []);

  return (
    <div className="admin-layout-root">
      <Sidebar />
      <main className="admin-main-panel fade-in">
        <header className="dashboard-header">
          <h1>Agenda <span className="text-yellow">Semanal</span></h1>
          <p>Proyección de reservas e ingresos para los próximos 7 días.</p>
        </header>

        <div className="calendar-layout-grid">
          {weekDays.map((day, index) => (
            <div key={index} onClick={() => navigate('/admin/bookings')} className={`calendar-day-card ${index === 0 ? 'today-card' : ''}`}>
              <h3 className="calendar-day-title">{index === 0 ? 'Hoy' : day.nombreDia}</h3>
              <p className="calendar-day-date">{day.fechaStr}</p>
              <div className="calendar-day-stats">
                <span className="calendar-stat-reservas">{day.reservas} Reservas</span>
                <span className="calendar-stat-ingresos">${day.ingresos.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
export default Calendar;