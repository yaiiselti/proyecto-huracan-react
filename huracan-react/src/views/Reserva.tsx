import { useState, useEffect } from 'react';
import { BookingService } from '../services/bookingService';
import { useNotification } from '../context/NotificationContext';

// CONSTANTES DE VALIDACIÓN (Senior Style - Reglas de Cliente)
const MIN_CHAR = 2;
const MAX_CHAR = 25;

// Configuración de Teléfono
const PHONE_MIN_LENGTH = 9; // En Chile los números celulares tienen 9 dígitos (ej: 9 1234 5678)
const PHONE_MAX_LENGTH = 9; // El "tope" para evitar que pongan mil números

const CHILE_CONFIG = { id: 'CL', bandera: '🇨🇱', prefijo: '+56' };
// Icono minimalista de billete para la seriedad del pago
const CashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="12" cy="14" r="2" />
  </svg>
);
const CreditCardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const BankIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="21" width="18" height="2"/><rect x="4" y="9" width="4" height="10"/><rect x="10" y="9" width="4" height="10"/><rect x="16" y="9" width="4" height="10"/><polygon points="12 2 2 7 22 7 12 2"/></svg>;
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TrashIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const ShirtIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a8.5 8.5 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;

function Reserva() {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState('');
  const [occupiedHours, setOccupiedHours] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState<{
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    metodoPago: 'webpay' | 'transferencia' | 'efectivo';
  }>({ nombre: '', apellido: '', telefono: '', email: '', metodoPago: 'webpay' });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [pais, setPais] = useState(CHILE_CONFIG); 
  
  useEffect(() => {
    const dateStr = selectedDate.toLocaleDateString();
    setOccupiedHours(BookingService.getOccupiedSlots(dateStr));
    setSelectedHour('');
    setTimeSlots(BookingService.getTimeSlots());
  }, [selectedDate]);

  // SINCRONIZACIÓN EN TIEMPO REAL: Si el admin borra/bloquea el horario mientras el usuario está reservando
  useEffect(() => {
    const syncSlots = (e: StorageEvent) => {
      if (e.key === 'huracan_blocks' || e.key === 'huracan_time_slots' || e.key === 'huracan_bookings') {
        const dateStr = selectedDate.toLocaleDateString();
        const newOccupied = BookingService.getOccupiedSlots(dateStr);
        const newSlots = BookingService.getTimeSlots();
        
        setOccupiedHours(newOccupied);
        setTimeSlots(newSlots);
        
        // Si el usuario tenía seleccionada una hora que acaba de ser eliminada o bloqueada
        if (selectedHour && (newOccupied.includes(selectedHour) || !newSlots.includes(selectedHour))) {
           setSelectedHour('');
           if (step > 1) {
              setStep(1); // Lo devolvemos al calendario
              showNotification("El bloque seleccionado ya no está disponible. Por favor escoge otro.", "error");
           }
        }
      }
    };
    window.addEventListener('storage', syncSlots);
    return () => window.removeEventListener('storage', syncSlots);
  }, [selectedDate, selectedHour, step, showNotification]);

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

    if (!aceptaTerminos) e.terminos = "Debes aceptar las políticas y el envío de notificaciones.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFinalizar = () => {
  if (validateForm()) {
    // Pegamos el prefijo de Chile al número ingresado
    const telefonoCompleto = `${CHILE_CONFIG.prefijo}${formData.telefono.replace(/\s/g, '')}`;

    // SEGURIDAD: Verificar si el usuario está en Lista Negra
    if (BookingService.isUserBlacklisted(formData.email, telefonoCompleto)) {
      showNotification("Por políticas del club, no puedes realizar reservas. Contáctanos para más información.", "error");
      return; // Detiene la reserva instantáneamente
    }

    // DOBLE VERIFICACIÓN: Nos aseguramos de que justo al hacer clic, el bloque siga existiendo y esté libre
    const currentOccupied = BookingService.getOccupiedSlots(selectedDate.toLocaleDateString());
    const currentSlots = BookingService.getTimeSlots();
    
    if (currentOccupied.includes(selectedHour) || !currentSlots.includes(selectedHour)) {
      showNotification("Lo sentimos, este bloque acaba de ser ocupado o eliminado por administración. Elige otro.", "error");
      setStep(1);
      setSelectedHour('');
      return; // Detiene la reserva
    }

    BookingService.saveBooking({
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim().toLowerCase(),
      telefono: telefonoCompleto,
      fecha: selectedDate.toLocaleDateString(),
      hora: selectedHour,
      metodoPago: formData.metodoPago,
      estadoPago: formData.metodoPago === 'webpay' ? 'pagado' : 'pendiente'
    });
    
    // 📲 SIMULADOR DE BOT DE NOTIFICACIONES (WhatsApp / Email)
    // Cuando exista un Backend, aquí se dispara el webhook hacia Twilio o Resend.
    console.info(`%c[BOT HURACÁN] 💬 Mensaje de WhatsApp simulado a ${telefonoCompleto}: "¡Hola ${formData.nombre.trim()}! Tu reserva para las ${selectedHour} está confirmada."`, 'color: #25D366; font-weight: bold;');
    console.info(`%c[BOT HURACÁN] 📧 Correo enviado a ${formData.email.trim()} con el comprobante de reserva.`, 'color: #3b82f6; font-weight: bold;');

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
                {timeSlots.map(hora => (
                  <button key={hora} disabled={occupiedHours.includes(hora) || !BookingService.isTimeValid(selectedDate, hora)}
                    className={`btn-hora ${selectedHour === hora ? 'selected' : ''} ${occupiedHours.includes(hora) ? 'occupied' : ''}`}
                    onClick={() => setSelectedHour(hora)}>{hora}</button>
                ))}
              </div>
              <div className="btn-center-wrapper mt-5">
                <button className="btn-huracan-elite anim-pulse-huracan" disabled={!selectedHour} onClick={() => setStep(2)}>
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
                      placeholder="Número (ej: 912345678)"
                      className="input-phone-field"
                      maxLength={PHONE_MAX_LENGTH}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  {errors.telefono && <span className="error-msg-form">{errors.telefono}</span>}
                </div>

                <h3 className="section-title-form" style={{ fontSize: '1.2rem', marginTop: '40px' }}>Método de Pago</h3>
                <div className="payment-methods-grid">
                  <button type="button" className={`payment-card-option ${formData.metodoPago === 'webpay' ? 'active' : ''}`} onClick={() => setFormData({...formData, metodoPago: 'webpay'})}>
                    <CreditCardIcon /><span>Webpay</span>
                  </button>
                  <button type="button" className={`payment-card-option ${formData.metodoPago === 'transferencia' ? 'active' : ''}`} onClick={() => setFormData({...formData, metodoPago: 'transferencia'})}>
                    <BankIcon /><span>Transferencia</span>
                  </button>
                  <button type="button" className={`payment-card-option ${formData.metodoPago === 'efectivo' ? 'active' : ''}`} onClick={() => setFormData({...formData, metodoPago: 'efectivo'})}>
                    <CashIcon /><span>Efectivo</span>
                  </button>
                </div>

                <div className={`payment-box-elite mt-4 ${formData.metodoPago}`}>
                  {formData.metodoPago === 'webpay' && (
                    <><div className="payment-header"><CreditCardIcon /><h4>Pago Online Seguro</h4></div>
                <p>Al confirmar, accederás a la pasarela segura de Webpay. Tu bloque quedará confirmado automáticamente de forma inmediata una vez aprobado el pago.</p></>
                  )}
                  {formData.metodoPago === 'transferencia' && (
                    <><div className="payment-header"><BankIcon /><h4>Transferencia Bancaria</h4></div>
                <p>Tu reserva quedará agendada. Deberás transferir el monto total y mostrarle el comprobante al encargado del recinto <strong>justo antes de ingresar a la cancha</strong>.</p></>
                  )}
                  {formData.metodoPago === 'efectivo' && (
                    <><div className="payment-header"><CashIcon /><h4>Pago en Caja (Efectivo)</h4></div>
                <p>Tu reserva quedará agendada. Por favor, asegúrate de llevar el dinero en efectivo para cancelarle directamente al encargado del recinto <strong>justo antes de ingresar a la cancha</strong>.</p></>
                  )}
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '25px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={aceptaTerminos} 
                    onChange={e => setAceptaTerminos(e.target.checked)} 
                    style={{ marginTop: '4px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', fontWeight: 600 }}>
                    Acepto las reglas del club y consiento recibir recordatorios y comprobantes por correo electrónico o WhatsApp.
                  </span>
                </label>
                {errors.terminos && <span className="error-msg-form">{errors.terminos}</span>}
              </div>
            </div>

            <aside className="resumen-rock-container anim-float-huracan">
              <div className="resumen-card-elite">
                <h4 className="resumen-title">Resumen de Reserva</h4>
                <div className="resumen-body">
                  <div className="resumen-item"><span>Día:</span> <strong>{selectedDate.toLocaleDateString()}</strong></div>
                  <div className="resumen-item"><span>Bloque:</span> <strong>{selectedHour}</strong></div>
                  <div className="total-box-elite"><span>Total:</span> <span>$25.000</span></div>
                </div>

                <div className="resumen-actions-group">
                  <button className="btn-confirmar-elite w-100 anim-pulse-huracan" onClick={handleFinalizar}>
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
            <h2 className="step-title" style={{color: '#002D57', fontWeight: 900}}>¡Reserva Confirmada!</h2>
            <p className="step-subtitle">Tu bloque de las <strong>{selectedHour}</strong> ({selectedDate.toLocaleDateString()}) ha sido agendado exitosamente.</p>
            
            {formData.metodoPago === 'transferencia' && (
              <div className="post-payment-instructions" style={{background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '2px dashed #cbd5e1', margin: '30px auto', maxWidth: '400px'}}>
                <h4 style={{color: '#002D57', fontWeight: 900, marginBottom: '10px'}}>Datos de Transferencia</h4>
                <p style={{margin: '5px 0', color: '#475569', fontWeight: 600}}><strong>Banco:</strong> Banco Estado (Cuenta RUT)</p>
                <p style={{margin: '5px 0', color: '#475569', fontWeight: 600}}><strong>RUT:</strong> 12.345.678-9</p>
                <p style={{margin: '5px 0', color: '#475569', fontWeight: 600}}><strong>Nombre:</strong> Club Deportivo Huracán</p>
                <p style={{marginTop: '15px', color: '#002D57', fontSize: '0.9rem'}}>Muestra tu comprobante al encargado al llegar, o envíalo a nuestro WhatsApp: <strong>+56 9 1234 5678</strong></p>
              </div>
            )}

            <div className="rules-container mt-5" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'left'}}>
              <h3 style={{color: '#002D57', fontWeight: 900, marginBottom: '20px', textAlign: 'center'}}>Cultura Huracán para un Buen Juego:</h3>
              <div className="rules-grid">
                <div className="rule-card">
                  <div className="rule-icon"><ClockIcon /></div>
                  <h4>Llega con Anticipación</h4>
                  <p>Te recomendamos llegar <strong>10 a 15 minutos antes</strong>. Así tu equipo estará completo y no perderán tiempo valioso de juego.</p>
                </div>
                <div className="rule-card">
                  <div className="rule-icon"><ShirtIcon /></div>
                  <h4>Vístanse Afuera</h4>
                  <p>Deben vestirse y alistarse <strong>fuera de la cancha</strong> mientras esperan su turno. El tiempo en cancha es exclusivo para jugar.</p>
                </div>
                <div className="rule-card">
                  <div className="rule-icon"><TrashIcon /></div>
                  <h4>Cuida la Limpieza</h4>
                  <p>Por favor, <strong>no dejes botellas ni basura</strong> dentro de la cancha ni tirada en las bancas. Ayúdanos a cuidar nuestro club.</p>
                </div>
              </div>
            </div>
            <button className="btn-huracan-elite mt-5" onClick={() => window.location.href = '/'}>VOLVER AL INICIO</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reserva;