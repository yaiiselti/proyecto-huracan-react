import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { AuthService } from '../services/authService'; 
import type { AdminUser } from '../services/authService';// Importamos el tipo AdminUser
import { useNavigate, Link } from 'react-router-dom';
import '../styles/views/Login.css';

const Login = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [loginStep, setLoginStep] = useState(1);
  const [credentials, setCredentials] = useState({ user: '', pass: '' });
  
  const [tempAdmin, setTempAdmin] = useState<AdminUser | null>(null);
  
  // SEGURIDAD: 2FA (Código OTP)
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminFound = AuthService.verifyCredentials(credentials.user, credentials.pass);
    
    if (adminFound) {
      setTempAdmin(adminFound);
      setLoginStep(2);
      
      // Generar código OTP simulado de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      
      showNotification("Identidad verificada. Se ha enviado un código a su correo.");
      alert(`[SIMULADOR DE EMAIL]\n\nAsunto: Código de Verificación\n\nTu código de acceso temporal es: ${code}\n\n(En producción este aviso no aparece y el código llega al correo real)`);
    } else {
      showNotification("Usuario o contraseña incorrectos", "error");
    }
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificamos el Código de Seguridad
    if (otp === generatedOtp && tempAdmin) {
      AuthService.saveSession(tempAdmin);
      showNotification("Acceso concedido. Cargando panel...");
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } else {
      showNotification("El código ingresado es incorrecto o ha expirado.", "error");
      setOtp('');
    }
  };

  return (
    <div className="login-wrapper fade-in">
      
      {/* BOTÓN DE ESCAPE SEGURO */}
      <Link to="/" className="btn-back-home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Volver al Inicio
      </Link>

      <div className="login-container">
        <div className="login-card-elite">
          <div className="login-header">
            <img src="/logo_huracan.png" alt="Logo Huracán" className="login-logo" />
            <h2>CONTROL <span className="text-yellow">ADMIN</span></h2>
            <p>{loginStep === 1 ? 'Área Restringida - Inicie Sesión' : `Hola ${tempAdmin?.user}, ingresa el código enviado a tu correo`}</p>
          </div>

          {loginStep === 1 ? (
            <form className="login-form" onSubmit={handleNextStep}>
              <div className="input-group-elite">
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  className="input-elite"
                  onChange={e => setCredentials({...credentials, user: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group-elite mt-3">
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="input-elite"
                  onChange={e => setCredentials({...credentials, pass: e.target.value})}
                  required 
                />
              </div>
              <button type="submit" className="btn-huracan-elite w-100 mt-4">
                ENVIAR CÓDIGO
              </button>
            </form>
          ) : (
            <form className="pin-section fade-in" onSubmit={handleAccess}>
              <div className="input-group-elite mb-4">
                <input 
                  type="text" 
                  placeholder="123456" 
                  maxLength={6}
                  className="otp-input"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} /* Solo permite números */
                  required 
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="btn-huracan-elite w-100 mt-4" 
                disabled={otp.length < 6}
              >
                ENTRAR AL SISTEMA
              </button>
              <button type="button" className="btn-login-cancel mt-3" onClick={() => { setLoginStep(1); setOtp(''); setGeneratedOtp(''); }}>
                Cancelar y volver
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;