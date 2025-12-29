// src/services/BookingService.ts
export interface Booking {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  status: 'pendiente';
}

export const BookingService = {
  getBookings: (): Booking[] => {
    const data = localStorage.getItem('huracan_bookings');
    return data ? JSON.parse(data) : [];
  },

  // Acepta los datos sin ID y lo genera internamente para evitar errores de tipo
  saveBooking: (data: Omit<Booking, 'id' | 'status'>): Booking => {
    const bookings = BookingService.getBookings();
    const newBooking: Booking = {
      ...data,
      id: crypto.randomUUID(), // Generación automática del ID
      status: 'pendiente'
    };
    bookings.push(newBooking);
    localStorage.setItem('huracan_bookings', JSON.stringify(bookings));
    return newBooking;
  },

  // Simulación para ver horas ocupadas
  getOccupiedSlots: (fecha: string): string[] => {
    const bookings = BookingService.getBookings();
    return bookings.filter(b => b.fecha === fecha).map(b => b.hora);
  },

  // Validador de tiempo (se mantiene aquí por ser lógica de negocio compartida)
  isTimeValid: (selectedDate: Date, hourStr: string): boolean => {
    const now = new Date();
    const [hours, minutes] = hourStr.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    if (bookingDateTime < now) return false;
    return (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60) >= 5;
  },

  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
};