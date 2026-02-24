// src/services/authService.ts

export interface AdminUser {
  id: string;
  user: string;
  role: 'ADMIN_MASTER' | 'STAFF';
  email: string;
  password?: string; // Opcional para las pruebas
}

const ADMIN_LIST_KEY = 'huracan_admins';
const SESSION_KEY = 'huracan_admin_session';

export const AuthService = {
  // 1. Obtener la lista completa de admins
  getAllAdmins: (): AdminUser[] => {
    const data = localStorage.getItem(ADMIN_LIST_KEY);
    // Si no hay datos, devolvemos el admin maestro por defecto
    return data ? JSON.parse(data) : [
      { id: 'master-01', user: 'admin', email: 'admin@huracan.cl', role: 'ADMIN_MASTER' }
    ];
  },

  // 2. VERIFICACIÓN CORREGIDA: Busca en la lista y el hardcoded
  verifyCredentials: (username: string, pass: string): AdminUser | null => {
    // Caso especial: Admin Maestro inicial
    if (username === 'admin' && pass === 'elite2026') {
      return { id: 'master-01', user: 'admin', email: 'admin@huracan.cl', role: 'ADMIN_MASTER' };
    }

    // Buscar en la lista de administradores creados
    const admins = AuthService.getAllAdmins();
    const found = admins.find(a => a.user === username);
    
    // NOTA: Como aún no gestionamos contraseñas individuales, 
    // permitimos entrar a los nuevos con la contraseña maestra por ahora
    if (found && pass === 'elite2026') {
      return found;
    }

    return null;
  },

  verifyPIN: (pin: string) => pin === '1910',

  // 3. PERSISTENCIA COMPLETA: Guardamos el objeto de usuario entero
  saveSession: (adminData: AdminUser) => {
    const sessionInfo = {
      ...adminData,
      token: crypto.randomUUID(), // Generación de ID única para la sesión
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
  },

  isLoggedIn: () => localStorage.getItem(SESSION_KEY) !== null,

  getSession: (): AdminUser | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/login';
  },

  // Gestión de equipo
  addAdmin: (admin: Omit<AdminUser, 'id'>) => {
    const admins = AuthService.getAllAdmins();
    const newAdmin = { ...admin, id: crypto.randomUUID() };
    admins.push(newAdmin);
    localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify(admins));
  },

  deleteAdmin: (id: string) => {
    const admins = AuthService.getAllAdmins().filter(a => a.id !== id);
    localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify(admins));
  }
};