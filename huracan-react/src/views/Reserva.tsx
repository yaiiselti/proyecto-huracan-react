import { useState, useEffect } from 'react';
import { BookingService } from '../services/bookingService';
import { useNotification } from '../context/NotificationContext';

// CONSTANTES DE VALIDACIÓN (Senior Style - Reglas de Cliente)
const MIN_CHAR = 2;
const MAX_CHAR = 25;

// Configuración de Teléfono
const PHONE_MIN_LENGTH = 8;
const PHONE_MAX_LENGTH = 9; // El "tope" para evitar que pongan mil números

const CHILE_CONFIG = { id: 'CL', bandera: '🇨🇱', prefijo: '+56 9' };
// Icono minimalista de billete para la seriedad del pago
const CashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="12" cy="14" r="2" />
  </svg>
);

function Reserva() {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState('');
  const [occupiedHours, setOccupiedHours] = useState<string[]>([]);

  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '', email: '' });
  const [errors, setErrors] = useState<any>({});
  const [pais, setPais] = useState(CHILE_CONFIG); useEffect(() => {
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
    const soloNumeros = /^\d+$/;

    if (!formData.telefono) {
      e.telefono = "Ingrese su número";
    } else if (!soloNumeros.test(cleanPhone)) {
      e.telefono = "Solo use números";
    } else if (cleanPhone.length < PHONE_MIN_LENGTH) {
      e.telefono = `Mínimo ${PHONE_MIN_LENGTH} dígitos`;
    } else if (cleanPhone.length > PHONE_MAX_LENGTH) {
      e.telefono = `Máximo ${PHONE_MAX_LENGTH} dígitos`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFinalizar = () => {
  if (validateForm()) {
    // Pegamos el prefijo de Chile al número ingresado
    const telefonoCompleto = `${CHILE_CONFIG.prefijo}${formData.telefono.replace(/\s/g, '')}`;

    BookingService.saveBooking({
      ...formData,
      telefono: telefonoCompleto,
      fecha: selectedDate.toLocaleDateString(),
      hora: selectedHour,
    });
    
    setStep(3);
    showNotification("¡Reserva confirmada!");
  } else {
    showNotification("Corrige los errores", "error");
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
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, index) => <div key={`${d}-${index}`} className="weekday">{d}</div>)}                {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="day empty"></div>)}
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                  const isSelected = selectedDate.toDateString() === dateObj.toDateString();
                  return (
                    <div key={day} className={`day-cell ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isPast && setSelectedDate(dateObj)}>{day}</div>
                  );
                })}
              </div>
            </div>

            <div className="horas-section mt-5">
              <h3 className="section-title-elite">Bloques Disponibles</h3>
              <div className="horas-grid">
                {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(hora => (
                  <button key={hora} disabled={occupiedHours.includes(hora) || !BookingService.isTimeValid(selectedDate, hora)}
                    className={`btn-hora ${selectedHour === hora ? 'selected' : ''} ${occupiedHours.includes(hora) ? 'occupied' : ''}`}
                    onClick={() => setSelectedHour(hora)}>{hora}</button>
                ))}
              </div>
              <div className="btn-center-wrapper mt-5">
                <button className="btn-huracan-elite" disabled={!selectedHour} onClick={() => setStep(2)}>
                  SIGUIENTE PASO
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content fade-in grid-reserva-datos">
            <div className="formulario-wrapper">
              <div className="formulario-card-elite">
                <h2 className="section-title-form">Información del Capitán</h2>
                <p className="section-subtitle-form">Por favor, completa tus datos de contacto.</p>
                <div className="form-group-grid">
                  <div className="input-group-elite">
                    <input type="text" placeholder="Nombre" className={`input-elite ${errors.nombre ? 'error' : ''}`}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                    {errors.nombre && <span className="error-msg-form">{errors.nombre}</span>}
                  </div>
                  <div className="input-group-elite">
                    <input type="text" placeholder="Apellido" className={`input-elite ${errors.apellido ? 'error' : ''}`}
                      onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                    {errors.apellido && <span className="error-msg-form">{errors.apellido}</span>}
                  </div>
                </div>
                <div className="input-group-elite mt-3">
                  <input type="email" placeholder="Correo Electrónico" className={`input-elite ${errors.email ? 'error' : ''}`}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  {errors.email && <span className="error-msg-form">{errors.email}</span>}
                </div>
                <div className="input-group-elite mt-3">
                  <div className={`phone-container-elite ${errors.telefono ? 'error' : ''}`}>
                    <div className="paises-display-static">
                      <span className="bandera-estatica">{CHILE_CONFIG.bandera}</span>
                    </div>
                    <span className="prefijo-texto">{CHILE_CONFIG.prefijo}</span>
                    <input
                      type="tel"
                      placeholder="Número (ej: 12345678)"
                      className="input-phone-field"
                      maxLength={PHONE_MAX_LENGTH}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  {errors.telefono && <span className="error-msg-form">{errors.telefono}</span>}
                </div>
                <div className="payment-box-elite mt-5">
                  <div className="payment-header">
                    <CashIcon />
                    <h4>Pago: Efectivo al llegar</h4>
                  </div>
                  <p>Para tu comodidad, el pago de <strong>$25.000</strong> se realiza directamente en el recinto el día de tu reserva.</p>
                </div>
              </div>
            </div>

            <aside className="resumen-rock-container">
              <div className="resumen-card-elite">
                <h4 className="resumen-title">Resumen de Reserva</h4>
                <div className="resumen-body">
                  <div className="resumen-item"><span>Día:</span> <strong>{selectedDate.toLocaleDateString()}</strong></div>
                  <div className="resumen-item"><span>Bloque:</span> <strong>{selectedHour}</strong></div>
                  <div className="total-box-elite"><span>Total:</span> <span>$25.000</span></div>
                </div>

                <div className="resumen-actions-group">
                  <button className="btn-confirmar-elite w-100" onClick={handleFinalizar}>
                    CONFIRMAR RESERVA
                  </button>
                  <button className="btn-ghost-elite w-100" onClick={() => setStep(1)}>
                    CAMBIAR HORARIO
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="step-content fade-in success-box">
            <div className="success-circle">✓</div>
            <h2>¡Reserva Registrada!</h2>
            <button className="btn-huracan-elite mt-5" onClick={() => window.location.href = '/'}>SALIR AL INICIO</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reserva;