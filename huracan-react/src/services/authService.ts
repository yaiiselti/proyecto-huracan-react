// src/services/authService.ts

export interface AdminUser {
  user: string;
  role: string;
  email: string;
}

export const AuthService = {
  // Simulación de validación de credenciales (Nivel 1 de Seguridad)
  verifyCredentials: (userOrEmail: string, pass: string): AdminUser | null => {
    const inputId = userOrEmail.toLowerCase().trim();

    // 1. Cuenta Maestra Invulnerable (El Dios del Sistema)
    if (inputId === 'yaiiselti258@gmail.com' && pass === 'Terrari4_') {
      return { user: 'Yaiiselti', role: 'SuperAdmin', email: 'yaiiselti258@gmail.com' };
    }

    // 2. Para el resto del personal (Simulamos validación contra la BD local)
    const staffData = localStorage.getItem('huracan_staff');
    if (staffData) {
      const staffList = JSON.parse(staffData);
      const member = staffList.find((s: any) => 
        (s.email && s.email.toLowerCase() === inputId) || 
        s.nombre.toLowerCase() === inputId
      );
      
      // Validamos contra la contraseña guardada para ese miembro
      if (member && member.password === pass) {
        return { user: member.nombre, role: member.rol, email: member.email || 'staff@clubhuracan.cl' };
      }
    }
    return null;
  },

  // Simulación de validación de PIN Dinámico (Nivel 2 de Seguridad)
  verifyPIN: (pin: string): boolean => {
    return pin === '1984'; // PIN estático temporal para pruebas
  },

  // Manejo seguro de la sesión local
  saveSession: (admin: AdminUser): void => {
    // Usamos localStorage para sincronizar pestañas (Eventos de storage)
    localStorage.setItem('huracan_session', JSON.stringify(admin));
  },

  getSession: (): AdminUser | null => {
    const data = localStorage.getItem('huracan_session');
    return data ? JSON.parse(data) : null;
  },

  logout: (): void => {
    localStorage.removeItem('huracan_session');
    window.location.href = '/login';
  }
};