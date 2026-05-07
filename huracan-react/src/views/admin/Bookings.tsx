import { useState, useEffect, useRef, useMemo } from 'react';
import { BookingService, type Booking, type BlockedSlot } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import AdminDialog, { type DialogConfig } from '../../components/AdminDialog';
import { AuthService } from '../../services/authService';

// Sincronización de estilos
import '../../index.css';
import '../../styles/views/Bookings.css';

const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const Bookings = () => {
  // 1. ESTADOS DE CONTROL
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [occupiedHours, setOccupiedHours] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [allBlocks, setAllBlocks] = useState<BlockedSlot[]>([]);

  // Estados para Modales y Menús
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [blockingSlot, setBlockingSlot] = useState<string | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotHour, setNewSlotHour] = useState('12:00');

  // ESTADOS DEL DIALOGO
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({ isOpen: false, type: 'alert', title: '', message: '' });

  // Sesión actual
  const adminSession = AuthService.getSession();
  const isAdmin = adminSession?.role === 'SuperAdmin' || adminSession?.role === 'Admin';

  const showConfirm = (title: string, message: string, action: () => void, confirmText = 'CONFIRMAR', cancelText = 'CANCELAR') => {
    setDialogConfig({ isOpen: true, type: 'confirm', title, message, confirmText, cancelText, action });
  };
  const showAlert = (title: string, message: string) => {
    setDialogConfig({ isOpen: true, type: 'alert', title, message });
  };
  const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));

  // 2. CARGA DE DATOS (Sincronizada con Reserva.tsx)
  const loadData = () => {
    const dateStr = selectedDateObj.toLocaleDateString();
    const allBookings = BookingService.getBookings();
    setBookings(allBookings);
    setOccupiedHours(BookingService.getOccupiedSlots(dateStr));
    setTimeSlots(BookingService.getTimeSlots());
    setAllBlocks(BookingService.getBlockedSlots());
  };

  // 1. Creamos la referencia para el contenedor del menú
  const menuRef = useRef<HTMLDivElement>(null);

  // 2. Lógica para cerrar al tocar fuera (Solo en móvil)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Detectamos si es versión móvil (ancho menor a 768px)
      if (window.innerWidth <= 768) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setShowBulkMenu(false);
        }
      }
    };

    if (showBulkMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBulkMenu]);

  useEffect(() => {
    loadData();
  }, [selectedDateObj]);

  // 3. ACCIONES DE GESTIÓN
  const handleCancel = (id: string) => {
    BookingService.cancelBooking(id);
    setSelectedBooking(null);
    loadData();
  };

  const handleMarkAsPaid = (id: string) => {
    showConfirm(
      "Confirmar Pago",
      "¿Confirmas que el cliente ha entregado el efectivo o mostrado el comprobante de transferencia?",
      () => {
        BookingService.updatePaymentStatus(id, 'pagado');
        loadData();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, estadoPago: 'pagado' });
        }
        closeDialog();
      },
      "SÍ, CONFIRMAR PAGO"
    );
  };

  const handleBulkBlock = (dias: number) => {
    if (!blockingSlot) return;
    BookingService.blockTimeSlot(selectedDateObj, blockingSlot, "Bloqueo Administrativo", dias);
    setBlockingSlot(null);
    loadData();
  };

  // Compara la fecha y hora exacta para saber si el bloque ya expiró y protegerlo
  const checkIsPastSlot = (horaStr: string) => {
    const now = new Date();
    const [h, m] = horaStr.split(':').map(Number);
    const slotTime = new Date(selectedDateObj);
    slotTime.setHours(h, m, 0, 0);
    return slotTime < now;
  };

  // Lógica de Bloqueo Recurrente (Ej. Todos los viernes por 1 mes)
  const handleRecurringBlock = (weeks: number) => {
    if (!blockingSlot) return;
    for (let i = 0; i < weeks; i++) {
      const d = new Date(selectedDateObj);
      d.setDate(d.getDate() + (i * 7));
      const dateStr = d.toLocaleDateString();
      const isAlreadyBlocked = BookingService.getBlockedSlots().some(b => b.fecha === dateStr && b.hora === blockingSlot);
      if (!isAlreadyBlocked) {
         BookingService.toggleSingleBlock(dateStr, blockingSlot, "Bloqueo Recurrente");
      }
    }
    setBlockingSlot(null);
    loadData();
  };

  // MÉTODOS DE CREACIÓN DE BLOQUES
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    BookingService.addTimeSlot(newSlotHour);
    setShowAddSlotModal(false);
    loadData();
  };

  const handleDeleteSlot = (hora: string) => {
    showConfirm(
      "Eliminar Bloque Horario",
      `¿Seguro que deseas eliminar globalmente el bloque de las ${hora}? Se dejará de mostrar en el sistema.`,
      () => {
        BookingService.removeTimeSlot(hora);
        loadData();
        closeDialog();
      }
    );
  };

  // ========================================================
  // LÓGICA DEL CALENDARIO MENSUAL FUSIONADO
  // ========================================================
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1));
  const changeMonth = (offset: number) => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + offset, 1));

  const monthDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Lunes = 0
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null); // Espacios vacíos
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toLocaleDateString();
      const reservasDelDia = bookings.filter(b => b.fecha === dateStr && b.status !== 'cancelada');
      const blocksDelDia = allBlocks.filter(b => b.fecha === dateStr);
      days.push({ date, dateStr, dayNum: i, reservas: reservasDelDia.length, ingresos: reservasDelDia.length * 25000, bloqueos: blocksDelDia.length });
    }
    return days;
  }, [currentMonthDate, bookings, allBlocks]);

  const selectedDayStats = useMemo(() => {
    const dateStr = selectedDateObj.toLocaleDateString();
    const reservasDelDia = bookings.filter(b => b.fecha === dateStr && b.status !== 'cancelada');
    const bloquesDelDia = allBlocks.filter(b => b.fecha === dateStr);
    return { reservas: reservasDelDia.length, ingresos: reservasDelDia.length * 25000, bloqueos: bloquesDelDia.length };
  }, [selectedDateObj, bookings]);

  // 4. BUSCADOR FILTRADO
  const filteredBookings = bookings.filter(b =>
    `${b.nombre} ${b.apellido} ${b.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isCurrentlyBlocked = blockingSlot ? occupiedHours.includes(blockingSlot) : false;

  function handleBlockClient(selectedBooking: Booking): void {
    showConfirm(
      "Bloquear Cliente",
      `¿Deseas bloquear a ${selectedBooking.nombre} ${selectedBooking.apellido} (${selectedBooking.email})? Se cancelará su reserva y pasará a Lista Negra.`,
      () => {
        BookingService.cancelBooking(selectedBooking.id);
        BookingService.addToBlacklist(selectedBooking.email, "Bloqueado desde la agenda por inasistencia/mal comportamiento");
        BookingService.addToBlacklist(selectedBooking.telefono, "Bloqueado desde la agenda por inasistencia/mal comportamiento");
        setSelectedBooking(null);
        loadData();
        showAlert("Cliente Bloqueado", "El cliente ha sido añadido a la lista negra exitosamente.");
      },
      "BLOQUEAR CLIENTE"
    );
  }

  return (
    <div className="admin-layout-root">
      <Sidebar />

      <main className="admin-main-panel">
        <header className="bookings-header-elite">
          <div className="title-stack">
            <h1>Calendario y <span className="text-yellow">Agenda</span></h1>
            <div className="header-controls">
              <div className="search-bar-elite">
                <span className="icon" style={{display:'flex'}}><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="fast-actions-container" ref={menuRef}>
            <button className="btn-actions-trigger" onClick={() => setShowBulkMenu(!showBulkMenu)}>
              Acciones de Día {showBulkMenu ? '▲' : '▼'}
            </button>
            {showBulkMenu && (
              <div className="fast-actions-dropdown">
                <button onClick={() => { BookingService.blockFullDay(selectedDateObj.toLocaleDateString(), "Cerrado"); loadData(); setShowBulkMenu(false); }}>
                  Bloquear Todo el Día
                </button>
                <button className="danger" onClick={() => { 
                  showConfirm(
                    "Limpiar Bloqueos del Día",
                    "¿Seguro que deseas eliminar todos los bloqueos de agenda para este día?",
                    () => {
                      BookingService.unblockFullDay(selectedDateObj.toLocaleDateString()); 
                      loadData(); 
                      setShowBulkMenu(false);
                      closeDialog();
                    },
                    "SÍ, LIMPIAR"
                  );
                }}>
                  Limpiar Bloqueos (Día)
                </button>
                <button className="danger" onClick={() => { 
                  showConfirm(
                    "Limpiar Mes Completo",
                    "¿Seguro que deseas eliminar TODOS los bloqueos de agenda programados para este mes?",
                    () => {
                      BookingService.unblockFullMonth(selectedDateObj); 
                      loadData(); 
                      setShowBulkMenu(false);
                      closeDialog();
                    },
                    "SÍ, LIMPIAR"
                  );
                }}>
                  Limpiar Bloqueos (Mes)
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CALENDARIO MENSUAL FUSIONADO */}
        <section className="calendar-fusion-container">
          <div className="calendar-fusion-header">
            <button className="btn-cal-nav" onClick={() => changeMonth(-1)}>&lt;</button>
            <h2>{currentMonthDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</h2>
            <button className="btn-cal-nav" onClick={() => changeMonth(1)}>&gt;</button>
          </div>
          <div className="calendar-fusion-grid">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
            {monthDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="cal-day-cell empty"></div>;
              const isSelected = selectedDateObj.toLocaleDateString() === day.dateStr;
              const isToday = new Date().toLocaleDateString() === day.dateStr;
              return (
                <div 
                  key={day.dateStr} 
                  className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDateObj(day.date)}
                >
                  <span className="day-number">{day.dayNum}</span>
                  <div className="day-stats-badges">
                    {day.reservas > 0 && <span className="badge-res">{day.reservas} Res</span>}
                    {day.bloqueos > 0 && <span className="badge-blk">🔒 {day.bloqueos} Bloq</span>}
                    {day.ingresos > 0 && <span className="badge-ing">${day.ingresos.toLocaleString('es-CL')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AGENDA DIARIA DE BLOQUES */}
        <div className="daily-agenda-header">
           <h3>Agenda del {selectedDateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
           <div className="daily-summary-stats hide-on-mobile">
              <span className="status-label free-label">{selectedDayStats.reservas} Reservas Activas</span>
              {selectedDayStats.bloqueos > 0 && <span className="status-label blocked-label">🔒 {selectedDayStats.bloqueos} Bloqueados</span>}
              <span className="status-label" style={{background: '#dcfce7', color: '#166534'}}>${selectedDayStats.ingresos.toLocaleString('es-CL')} Proyectados</span>
           </div>
        </div>

        {/* AGENDA DE BLOQUES (Con Protección Fantasma para Reservas o Bloqueos de horarios eliminados) */}
        <section className="agenda-grid-pro">
          {Array.from(new Set([
            ...timeSlots, 
            ...bookings.filter(b => b.fecha === selectedDateObj.toLocaleDateString() && b.status !== 'cancelada').map(b => b.hora),
            ...allBlocks.filter(b => b.fecha === selectedDateObj.toLocaleDateString()).map(b => b.hora)
          ])).sort().map(hora => {
            const reserva = bookings.find(b => b.fecha === selectedDateObj.toLocaleDateString() && b.hora === hora && b.status !== 'cancelada');
            const isBlocked = !reserva && occupiedHours.includes(hora);
            const isPast = checkIsPastSlot(hora);

            return (
              <div key={hora} className={`slot-item ${reserva ? 'reserved' : isBlocked ? 'blocked' : isPast ? 'past' : 'free'}`}>
                <div className="slot-time-box">{hora}</div>
                <div className="slot-info">
                  {reserva ? (
                    <div className="reserva-tag">
                      <strong>{reserva.nombre}</strong>
                      <button className="btn-details" onClick={() => setSelectedBooking(reserva)}>Ver Detalles</button>
                    </div>
                  ) : (
                    <div className="free-tag">
                      {isPast ? (
                        <span className="past-no-activity">{isBlocked ? 'Bloqueo Expirado' : 'Turno Finalizado'}</span>
                      ) : (
                        <>
                          <span className={`status-label ${isBlocked ? 'blocked-label' : 'free-label'}`}>
                            {isBlocked ? 'BLOQUEADO' : 'LIBRE'}
                          </span>
                          <div className="slot-actions">
                            {isAdmin && !isBlocked && (
                               <button className="btn-details btn-delete-slot" onClick={() => handleDeleteSlot(hora)}>Eliminar</button>
                            )}
                            <button className={`btn-block-trigger ${isBlocked ? 'unlock' : 'lock'}`} onClick={() => setBlockingSlot(hora)}>
                              {isBlocked ? 'Liberar' : 'Bloquear'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* TARJETA CREAR NUEVO BLOQUE */}
          {isAdmin && (
             <div className="slot-item add-slot-card" onClick={() => setShowAddSlotModal(true)}>
               <div className="slot-time-box" style={{ background: '#f8fafc', color: '#002D57', border: '2px dashed #cbd5e1' }}>+</div>
               <div className="slot-info">
                 <strong style={{ color: '#002D57' }}>Crear Nuevo Bloque</strong>
                 <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Añadir horario a la agenda</span>
               </div>
             </div>
          )}
        </section>

        {/* BUSCADOR: RESULTADOS RÁPIDOS (Solo si hay búsqueda activa) */}
        {searchTerm && (
          <section className="search-results-overlay">
            <h3>Resultados de búsqueda: "{searchTerm}"</h3>
            <div className="results-list">
              {filteredBookings.length > 0 ? filteredBookings.map(b => (
                <div key={b.id} className="result-item" onClick={() => setSelectedBooking(b)}>
                  <span>{b.fecha} — {b.hora}</span>
                  <strong>{b.nombre} {b.apellido}</strong>
                  <small className={`status ${b.status}`}>{b.status}</small>
                </div>
              )) : <p>No se encontraron clientes.</p>}
            </div>
          </section>
        )}

        {/* MODAL: GESTIÓN DE BLOQUEO TEMPORAL */}
        {blockingSlot && (
          <div className="modal-overlay" onClick={() => setBlockingSlot(null)}>
            <div className="modal-card-compact" onClick={e => e.stopPropagation()}>
              <div className="modal-header-simple">
                <h3>{isCurrentlyBlocked ? 'Liberar Horario' : 'Bloquear Horario'}</h3>
                <span className="hour-focus">{blockingSlot}</span>
              </div>

              <p className="modal-desc">
                {isCurrentlyBlocked
                  ? 'Este horario está cerrado. ¿Deseas habilitarlo para que los clientes puedan volver a reservar?'
                  : 'Selecciona cómo deseas aplicar este cierre en la agenda.'}
              </p>
              
              {!isCurrentlyBlocked && (
                <p className="modal-warning">
                  <strong>Nota:</strong> Si aplicas un bloqueo de mes o semana, deberás desbloquear esos días manualmente uno por uno si deseas revertirlo.
                </p>
              )}

              <div className="action-grid-buttons">
                {isCurrentlyBlocked ? (
                  <>
                    <button className="btn-confirm-unlock" onClick={() => { BookingService.toggleSingleBlock(selectedDateObj.toLocaleDateString(), blockingSlot); setBlockingSlot(null); loadData(); }}>
                      CONFIRMAR LIBERACIÓN
                    </button>
                    <button className="btn-secondary-outline" onClick={() => setBlockingSlot(null)}>CANCELAR</button>
                  </>
                ) : (
                  <div className="block-options-container">
                    <button className="btn-block-option" onClick={() => { BookingService.toggleSingleBlock(selectedDateObj.toLocaleDateString(), blockingSlot); setBlockingSlot(null); loadData(); }}>
                      <strong>Solo Hoy</strong>
                      <small>Cierra este horario únicamente por hoy.</small>
                    </button>
                    <button className="btn-block-option" onClick={() => handleRecurringBlock(4)}>
                      <strong>Todo el mes (4 semanas)</strong>
                      <small>Bloquea todos los {selectedDateObj.toLocaleDateString('es-CL', {weekday: 'long'})} a esta hora.</small>
                    </button>
                    <button className="btn-block-option" onClick={() => handleBulkBlock(7)}>
                      <strong>Toda la semana (7 días)</strong>
                      <small>Bloquea este horario todos los días consecutivos.</small>
                    </button>
                  </div>
                )}
              </div>
              {!isCurrentlyBlocked && (
                <button className="btn-cancel-outline" onClick={() => setBlockingSlot(null)}>CANCELAR</button>
              )}
            </div>
          </div>
        )}

        {/* MODAL: AÑADIR BLOQUE HORARIO GLOBAR */}
        {showAddSlotModal && (
          <div className="modal-overlay" onClick={() => setShowAddSlotModal(false)}>
            <div className="modal-card-compact" onClick={e => e.stopPropagation()}>
              <div className="modal-header-simple">
                <h3>Crear Nuevo Bloque</h3>
              </div>
              <p className="modal-desc">
                Ingresa la hora de inicio del bloque. El bloque tendrá una duración predeterminada de 1 hora y se replicará en la agenda de los clientes.
              </p>
              <form onSubmit={handleAddSlot} style={{width: '100%'}}>
                <input 
                   type="time" 
                   value={newSlotHour}
                   onChange={(e) => setNewSlotHour(e.target.value)}
                   required
                   style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '1.2rem', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}
                />
                <button type="submit" className="btn-huracan-elite w-100">CREAR BLOQUE</button>
                <button type="button" className="btn-cancel-outline" onClick={() => setShowAddSlotModal(false)}>CANCELAR</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: DETALLE DE RESERVA */}
        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="modal-card-details" onClick={e => e.stopPropagation()}>
              <header className="modal-header-pro">
                <h3>Detalle de la Reserva</h3>
                <button className="close-x" onClick={() => setSelectedBooking(null)}>✕</button>
              </header>
              <div className="modal-body-pro">
                <div className="info-row"><span>ID:</span> <strong>{selectedBooking.id.slice(0, 8)}</strong></div>
                <div className="info-row"><span>Cliente:</span> <strong>{selectedBooking.nombre} {selectedBooking.apellido}</strong></div>
                <div className="info-row"><span>Email:</span> <strong>{selectedBooking.email}</strong></div>
                <div className="info-row"><span>Teléfono:</span> <strong>{selectedBooking.telefono}</strong></div>
                <div className="info-row"><span>Bloque:</span> <strong>{selectedBooking.hora} ({selectedBooking.fecha})</strong></div>
                <div className="info-row"><span>Estado:</span> <span className={`status-badge ${selectedBooking.status}`}>{selectedBooking.status.toUpperCase()}</span></div>
                <div className="info-row"><span>Estado Pago:</span> <span className={`status-badge ${selectedBooking.estadoPago === 'pagado' ? 'completada' : 'pendiente'}`}>{(selectedBooking.estadoPago || 'pendiente').toUpperCase()}</span></div>
                <div className="info-row"><span>Método Pago:</span> <strong>{selectedBooking.metodoPago ? selectedBooking.metodoPago.toUpperCase() : 'NO ESPECIFICADO'}</strong></div>
              </div>
              <footer className="modal-actions-footer">
                {selectedBooking.estadoPago === 'pendiente' && selectedBooking.status !== 'cancelada' && (
                  <button className="btn-details" style={{ width: '100%', padding: '15px', borderRadius: '0', background: '#10b981', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }} onClick={() => handleMarkAsPaid(selectedBooking.id)}>
                    ✓ MARCAR COMO PAGADO
                  </button>
                )}

                {selectedBooking.status !== 'cancelada' && (
                  <button className="btn-cancel-reserva" onClick={() => handleCancel(selectedBooking.id)}>
                    CANCELAR ESTA RESERVA
                  </button>
                )}

                {/* Botón de Castigo / Lista Negra */}
                <button className="btn-delete-db" onClick={() => handleBlockClient(selectedBooking)} style={{ color: '#ea580c', background: '#fff7ed', borderTop: '1px solid #ffedd5' }}>
                  BLOQUEAR CLIENTE (LISTA NEGRA)
                </button>

                <button className="btn-close-footer" onClick={() => setSelectedBooking(null)}>Cerrar</button>
              </footer>
            </div>
          </div>
        )}

        <AdminDialog config={dialogConfig} onClose={closeDialog} />
      </main>
    </div>
  );
};

export default Bookings;