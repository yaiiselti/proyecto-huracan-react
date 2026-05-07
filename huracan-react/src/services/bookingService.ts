// src/services/bookingService.ts

export interface Booking {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha: string; // Formato local (ej: "25/2/2026")
  hora: string;
  status: 'pendiente' | 'completada' | 'cancelada';
  metodoPago?: 'webpay' | 'transferencia' | 'efectivo' | 'pendiente';
  estadoPago?: 'pagado' | 'pendiente' | 'reembolsado';
}

export interface BlockedSlot {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
}

// --- INTERFAZ LISTA NEGRA ---
export interface BlacklistedUser {
  id: string;
  identificador: string; // Email o Teléfono
  motivo: string;
  fecha: string;
}

export const BookingService = {
  
  // --- GESTIÓN DE HORARIOS GLOBALES ---
  getTimeSlots: (): string[] => {
    const data = localStorage.getItem('huracan_time_slots');
    if (data) return JSON.parse(data);
    return ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  },
  
  addTimeSlot: (hora: string) => {
    const slots = BookingService.getTimeSlots();
    if (!slots.includes(hora)) {
      slots.push(hora);
      slots.sort(); // Mantiene el orden cronológico
      localStorage.setItem('huracan_time_slots', JSON.stringify(slots));
    }
  },
  
  removeTimeSlot: (hora: string) => {
    const slots = BookingService.getTimeSlots();
    const filtered = slots.filter(s => s !== hora);
    localStorage.setItem('huracan_time_slots', JSON.stringify(filtered));
  },

  // --- GESTIÓN DE RESERVAS ---
  
  /** Obtiene todas las reservas del sistema */
  getBookings: (): Booking[] => {
    const data = localStorage.getItem('huracan_bookings');
    return data ? JSON.parse(data) : [];
  },

  /** Guarda una nueva reserva (usada por el usuario) */
  saveBooking: (data: Omit<Booking, 'id' | 'status'>): Booking => {
    const bookings = BookingService.getBookings();
    const newBooking: Booking = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pendiente'
    };
    bookings.push(newBooking);
    localStorage.setItem('huracan_bookings', JSON.stringify(bookings));
    return newBooking;
  },

  /** Marca una reserva como completada */
  completeBooking: (id: string): void => {
    const bookings = BookingService.getBookings();
    const updated = bookings.map(b => 
      b.id === id ? { ...b, status: 'completada' as const } : b
    );
    localStorage.setItem('huracan_bookings', JSON.stringify(updated));
  },

  /** Cancela una reserva sin borrarla (mantiene historial) */
  cancelBooking: (id: string): void => {
    const bookings = BookingService.getBookings();
    const updated = bookings.map(b => 
      b.id === id ? { ...b, status: 'cancelada' as const } : b
    );
    localStorage.setItem('huracan_bookings', JSON.stringify(updated));
  },

  /** Actualiza el estado de pago de una reserva (Ej: de pendiente a pagado) */
  updatePaymentStatus: (id: string, estadoPago: 'pagado' | 'pendiente' | 'reembolsado'): void => {
    const bookings = BookingService.getBookings();
    const updated = bookings.map(b => 
      b.id === id ? { ...b, estadoPago } : b
    );
    localStorage.setItem('huracan_bookings', JSON.stringify(updated));
  },

  /** Elimina físicamente una reserva del almacenamiento */
  deleteBooking: (id: string): void => {
    const bookings = BookingService.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    localStorage.setItem('huracan_bookings', JSON.stringify(filtered));
  },


  // --- GESTIÓN DE BLOQUEOS (ADMIN) ---

  /** Obtiene todos los bloqueos manuales (mantenimiento, etc.) */
  getBlockedSlots: (): BlockedSlot[] => {
    const data = localStorage.getItem('huracan_blocks');
    return data ? JSON.parse(data) : [];
  },

  /** * BLOQUEO TEMPORAL: Bloquea un bloque específico por N cantidad de días 
   * (Ejem: bloqueas las 17:00 durante 7 días seguidos)
   */
  blockTimeSlot: (fechaInicio: Date, hora: string, motivo: string, duracionDias: number) => {
    const blocks = BookingService.getBlockedSlots();
    
    for (let i = 0; i < duracionDias; i++) {
      const current = new Date(fechaInicio);
      current.setDate(current.getDate() + i);
      const dateStr = current.toLocaleDateString();
      
      // Solo añade si no existe ya un bloqueo para esa fecha/hora
      if (!blocks.some(b => b.fecha === dateStr && b.hora === hora)) {
        blocks.push({ id: crypto.randomUUID(), fecha: dateStr, hora, motivo });
      }
    }
    localStorage.setItem('huracan_blocks', JSON.stringify(blocks));
  },

  /** Alterna (On/Off) un bloqueo para una sola fecha específica */
  toggleSingleBlock: (fechaStr: string, hora: string, motivo: string = "Mantenimiento") => {
    const blocks = BookingService.getBlockedSlots();
    const index = blocks.findIndex(b => b.fecha === fechaStr && b.hora === hora);
    
    if (index > -1) {
      blocks.splice(index, 1); // Desbloquea
    } else {
      blocks.push({ id: crypto.randomUUID(), fecha: fechaStr, hora, motivo }); // Bloquea
    }
    localStorage.setItem('huracan_blocks', JSON.stringify(blocks));
  },

  /** Bloquea todos los bloques de un día específico (Cierre total) */
  blockFullDay: (fechaStr: string, motivo: string) => {
    const slots = BookingService.getTimeSlots();
    const blocks = BookingService.getBlockedSlots();
    let modified = false;

    slots.forEach(hora => {
      if (!blocks.some(b => b.fecha === fechaStr && b.hora === hora)) {
        blocks.push({ id: crypto.randomUUID(), fecha: fechaStr, hora, motivo });
        modified = true;
      }
    });

    if (modified) {
      localStorage.setItem('huracan_blocks', JSON.stringify(blocks));
    }
  },

  /** Libera todos los bloqueos manuales de un día específico */
  unblockFullDay: (fechaStr: string) => {
    const blocks = BookingService.getBlockedSlots();
    const filtered = blocks.filter(b => b.fecha !== fechaStr);
    localStorage.setItem('huracan_blocks', JSON.stringify(filtered));
  },

  /** Libera todos los bloqueos manuales de un mes completo */
  unblockFullMonth: (targetDate: Date) => {
    const blocks = BookingService.getBlockedSlots();
    
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Creamos un mapa (Set) con todas las fechas del mes generadas en el formato exacto del sistema
    const monthDateStrings = new Set<string>();
    for (let i = 1; i <= daysInMonth; i++) {
      monthDateStrings.add(new Date(year, month, i).toLocaleDateString());
    }

    const filtered = blocks.filter(b => !monthDateStrings.has(b.fecha));
    localStorage.setItem('huracan_blocks', JSON.stringify(filtered));
  },

  // --- GESTIÓN DE LISTA NEGRA (BLACKLIST) ---
  
  getBlacklist: (): BlacklistedUser[] => {
    const data = localStorage.getItem('huracan_blacklist');
    return data ? JSON.parse(data) : [];
  },

  addToBlacklist: (identificador: string, motivo: string) => {
    const list = BookingService.getBlacklist();
    if (!list.some(b => b.identificador === identificador)) {
      list.push({ id: crypto.randomUUID(), identificador, motivo, fecha: new Date().toLocaleDateString() });
      localStorage.setItem('huracan_blacklist', JSON.stringify(list));
    }
  },

  removeFromBlacklist: (id: string) => {
    const list = BookingService.getBlacklist();
    localStorage.setItem('huracan_blacklist', JSON.stringify(list.filter(b => b.id !== id)));
  },

  isUserBlacklisted: (email: string, telefono: string): boolean => {
    const list = BookingService.getBlacklist();
    return list.some(b => b.identificador === email || b.identificador === telefono);
  },

  // --- LÓGICA DE DISPONIBILIDAD (ELITE) ---

  /** * FUNCIÓN MAESTRA: Devuelve todas las horas NO DISPONIBLES para una fecha.
   * Suma Reservas Activas + Bloqueos Manuales.
   */
  getOccupiedSlots: (fechaStr: string): string[] => {
    const bookings = BookingService.getBookings();
    const blocks = BookingService.getBlockedSlots();

    // 1. Horas de reservas que no han sido canceladas
    const reservedHours = bookings
      .filter(b => b.fecha === fechaStr && b.status !== 'cancelada')
      .map(b => b.hora);
    
    // 2. Horas bloqueadas por el administrador
    const blockedHours = blocks
      .filter(b => b.fecha === fechaStr)
      .map(b => b.hora);

    // Unimos ambos arrays y eliminamos duplicados porsiacaso
    return Array.from(new Set([...reservedHours, ...blockedHours]));
  },


  // --- VALIDACIONES DE NEGOCIO ---

  /** Valida si el correo tiene formato correcto */
  validateEmail: (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /** * Valida si el bloque cumple con la antelación de 5 horas 
   */
  isTimeValid: (selectedDate: Date, hourStr: string): boolean => {
    const now = new Date();
    const [hours, minutes] = hourStr.split(':').map(Number);
    
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    // Si la fecha es pasada, no es válida
    if (bookingDateTime < now) return false;
    
    // Regla de las 5 horas de antelación
    const diffInHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours >= 5;
  }
};