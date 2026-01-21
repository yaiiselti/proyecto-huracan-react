// src/services/authService.ts

export interface AdminUser {
  user: string;
  role: 'ADMIN_MASTER';
  token: string;
}

const ADMIN_STORAGE_KEY = 'huracan_admin_session';

/**
 * SERVICIO DE AUTENTICACIÓN (Mudo)
 * Encargado de la persistencia y validación técnica de la sesión.
 */
export const AuthService = {
  
  // CREDENCIALES DE PRUEBA (Hardcoded para desarrollo)
  verifyCredentials: (user: string, pass: string): boolean => {
    // Usuario único definido para las pruebas de acceso
    const TEST_USER = "admin_huracan@gmail.cl";
    const TEST_PASS = "elite_2026";
    
    return user === TEST_USER && pass === TEST_PASS;
  },

  // PIN DE SEGURIDAD (Segundo Factor Único)
  verifyPIN: (pin: string): boolean => {
    const TEST_PIN = "1910"; // Año de ejemplo/fundación
    return pin === TEST_PIN;
  },

  // Gestión de Sesión (Persistence)
  saveSession: (username: string) => {
    const sessionData: AdminUser = {
      user: username,
      role: 'ADMIN_MASTER',
      token: crypto.randomUUID() // Cumplimos la regla de generación automática de IDs
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) !== null;
  },

  getSession: (): AdminUser | null => {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.location.href = '/login';
  }
};