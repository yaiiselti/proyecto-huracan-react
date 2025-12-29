import { useState, useEffect } from 'react';
import { BookingService } from '../services/bookingService';
import { useNotification } from '../context/NotificationContext';

// CONSTANTES DE VALIDACIÓN (Senior Style)
const MIN_CHAR = 2;
const MAX_CHAR = 25;
const CHILE_PHONE_REGEX = /^(\+?56|0?9)(\d{8})$/; // Chile
const NEIGHBOR_PHONE_REGEX = /^(\+?54|\+?51|\+?591)(\d{8,10})$/; // Arg, Per, Bol

function Reserva() {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState('');
  const [occupiedHours, setOccupiedHours] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '', email: '' });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const dateStr = selectedDate.toLocaleDateString();
    setOccupiedHours(BookingService.getOccupiedSlots(dateStr));
    setSelectedHour('');
  }, [selectedDate]);

  // VALIDACIÓN QUIRÚRGICA EN LA VISTA
  const validateForm = () => {
    const e: any = {};
    if (!formData.nombre.trim()) e.nombre = "Ingrese su nombre";
    else if (formData.nombre.length < MIN_CHAR) e.nombre = `Mínimo ${MIN_CHAR} caracteres`;
    else if (formData.nombre.length > MAX_CHAR) e.nombre = `Máximo ${MAX_CHAR} caracteres`;

    if (!formData.apellido.trim()) e.apellido = "Ingrese su apellido";
    else if (formData.apellido.length < MIN_CHAR) e.apellido = `Mínimo ${MIN_CHAR} caracteres`;

    if (!formData.email) e.email = "Ingrese su correo electrónico";
    else if (!BookingService.validateEmail(formData.email)) e.email = "Formato de correo no válido";

    const cleanPhone = formData.telefono.replace(/\s/g, '');
    if (!formData.telefono) e.telefono = "Ingrese su número de teléfono";
    else if (!CHILE_PHONE_REGEX.test(cleanPhone) && !NEIGHBOR_PHONE_REGEX.test(cleanPhone)) {
      e.telefono = "Ingrese un número válido (Ej: +569...)";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFinalizar = () => {
    if (validateForm()) {
      BookingService.saveBooking({
        ...formData,
        fecha: selectedDate.toLocaleDateString(),
        hora: selectedHour,
      });
      setStep(3);
      showNotification("¡Reserva confirmada con éxito!");
    } else {
      showNotification("Por favor, corrige los errores en el formulario", "error");
    }
  };

  // Lógica de Calendario
  const { days, firstDay } = (() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    return {
      days: new Date(year, month + 1, 0).getDate(),
      firstDay: new Date(year, month, 1).getDay()
    };
  })();

  return (
    <div className="reserva-wrapper fade-in">
      <section className="reserva-hero">
        <div className="container">
          <h1 className="reserva-title">CANCHA <span className="text-yellow">HURACÁN</span></h1>
          <p className="reserva-subtitle">Reserva mínima con 5 horas de antelación.</p>
        </div>
      </section>

      <main className="container reserva-main">
        {/* INDICADOR DE PASOS RECUPERADO */}
        <div className="reserva-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Horario</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Contacto</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Ticket</div>
        </div>

        {step === 1 && (
          <div className="step-content fade-in">
            <div className="calendar-container">
              <div className="calendar-header">
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}>‹</button>
                <h3 className="text-capitalize">{viewDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}>›</button>
              </div>
              <div className="calendar-grid-month">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d} className="weekday">{d}</div>)}
                {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="day empty"></div>)}
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                  const isSelected = selectedDate.toDateString() === dateObj.toDateString();
                  return (
                    <div key={day} className={`day-cell ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                         onClick={() => !isPast && setSelectedDate(dateObj)}>{day}</div>
                  );
                })}
              </div>
            </div>

            <div className="horas-section mt-5">
              <h3 className="section-title text-center">Bloques Disponibles</h3>
              <div className="horas-grid">
                {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(hora => (
                  <button key={hora} disabled={occupiedHours.includes(hora) || !BookingService.isTimeValid(selectedDate, hora)}
                          className={`btn-hora ${selectedHour === hora ? 'selected' : ''} ${occupiedHours.includes(hora) ? 'occupied' : ''}`}
                          onClick={() => setSelectedHour(hora)}>{hora}</button>
                ))}
              </div>
              <div className="text-center mt-5">
                <button className="btn-huracan btn-xl" disabled={!selectedHour} onClick={() => setStep(2)}>SIGUIENTE PASO</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content fade-in grid-reserva-datos">
            <div className="formulario-datos">
              <h2 className="section-title">Información del Capitán</h2>
              <div className="form-group-grid">
                <div className="input-group-elite">
                  <input type="text" placeholder="Nombre" className={`input-elite ${errors.nombre ? 'error' : ''}`} 
                         onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  {errors.nombre && <span className="error-msg-form">{errors.nombre}</span>}
                </div>
                <div className="input-group-elite">
                  <input type="text" placeholder="Apellido" className={`input-elite ${errors.apellido ? 'error' : ''}`} 
                         onChange={e => setFormData({...formData, apellido: e.target.value})} />
                  {errors.apellido && <span className="error-msg-form">{errors.apellido}</span>}
                </div>
              </div>
              <div className="input-group-elite mt-3">
                <input type="email" placeholder="Correo Electrónico" className={`input-elite ${errors.email ? 'error' : ''}`} 
                       onChange={e => setFormData({...formData, email: e.target.value})} />
                {errors.email && <span className="error-msg-form">{errors.email}</span>}
              </div>
              <div className="input-group-elite mt-3">
                <input type="tel" placeholder="WhatsApp (Ej: +569...)" className={`input-elite ${errors.telefono ? 'error' : ''}`} 
                       onChange={e => setFormData({...formData, telefono: e.target.value})} />
                {errors.telefono && <span className="error-msg-form">{errors.telefono}</span>}
              </div>

              <div className="payment-info-box mt-4">
                <h4>Pago: Efectivo al llegar</h4>
                <p>Cancela el arriendo directamente en el recinto.</p>
              </div>
            </div>

            {/* RESUMEN "ROCA" FIJO */}
            <aside className="resumen-rock-fixed">
              <div className="resumen-card">
                <h4>Resumen</h4>
                <div className="resumen-item"><span>Día:</span> <strong>{selectedDate.toLocaleDateString()}</strong></div>
                <div className="resumen-item"><span>Bloque:</span> <strong>{selectedHour}</strong></div>
                <div className="total-box"><span>Total:</span> <span>$25.000</span></div>
                
                <button className="btn-confirmar-elite w-100" onClick={handleFinalizar}>
                  CONFIRMAR RESERVA
                </button>
                <button className="btn-secondary-huracan w-100 mt-2" onClick={() => setStep(1)}>
                  CAMBIAR HORARIO
                </button>
              </div>
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="step-content fade-in success-box">
            <div className="success-circle">✓</div>
            <h2>¡Reserva Registrada!</h2>
            <button className="btn-huracan mt-5" onClick={() => window.location.href = '/'}>SALIR AL INICIO</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reserva;