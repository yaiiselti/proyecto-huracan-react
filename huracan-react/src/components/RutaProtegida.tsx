import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

interface Props {
  children: React.ReactNode; // Cambiamos JSX.Element por React.ReactNode
}

/**
 * RUTA PROTEGIDA (Sentinel Component)
 * Verifica si existe una sesión activa en el AuthService.
 */
export const RutaProtegida = ({ children }: Props) => {
  const isAuthenticated = AuthService.isLoggedIn();

  if (!isAuthenticated) {
    // Redirección forzada si no hay token de sesión
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // Envolvemos en un fragment por seguridad de tipado
};