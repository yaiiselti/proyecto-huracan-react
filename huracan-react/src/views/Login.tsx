import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { AuthService } from '../services/authService'; // Importación vital
import '../styles/views/Login.css';

const Login = () => {
  const { showNotification } = useNotification();
  const [loginStep, setLoginStep] = useState(1);
  const [credentials, setCredentials] = useState({ user: '', pass: '' });
  const [pin, setPin] = useState('');
  const [keypad, setKeypad] = useState<number[]>([]);

  // Generar teclado aleatorio cada vez que entramos al paso 2
  useEffect(() => {
    if (loginStep === 2) {
      const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      setKeypad(numbers);
    }
  }, [loginStep]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // CAMBIO QUIRÚRGICO: Ahora consultamos al AuthService
    if (AuthService.verifyCredentials(credentials.user, credentials.pass)) {
      setLoginStep(2);
      showNotification("Identidad verificada. Ingrese su PIN dinámico.");
    } else {
      showNotification("Usuario o contraseña incorrectos", "error");
    }
  };

  const handlePinClick = (num: number) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleAccess = () => {
    // CAMBIO QUIRÚRGICO: Verificamos el PIN y guardamos la sesión
    if (AuthService.verifyPIN(pin)) {
      AuthService.saveSession(credentials.user); // Crea el token UUID
      showNotification("Acceso concedido. Cargando panel...");
      
      // Redirección al Dashboard Protegido
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
    } else {
      showNotification("PIN de seguridad incorrecto", "error");
      setPin('');
    }
  };

  return (
    <div className="login-wrapper fade-in">
      <div className="login-container">
        <div className="login-card-elite">
          <div className="login-header">
             {/* Asegúrate de que la ruta del logo sea correcta */}
            <img src="/logo_huracan.png" alt="Logo Huracán" className="login-logo" />
            <h2>CONTROL <span className="text-yellow">ADMIN</span></h2>
            <p>{loginStep === 1 ? 'Área Restringida - Inicie Sesión' : 'Factor de Doble Seguridad'}</p>
          </div>

          {loginStep === 1 ? (
            <form className="login-form" onSubmit={handleNextStep}>
              <div className="input-group-elite">
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  className="input-elite"
                  autoComplete="username"
                  onChange={e => setCredentials({...credentials, user: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group-elite mt-3">
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="input-elite"
                  autoComplete="current-password"
                  onChange={e => setCredentials({...credentials, pass: e.target.value})}
                  required 
                />
              </div>
              <button type="submit" className="btn-huracan-elite w-100 mt-4">SIGUIENTE PASO</button>
            </form>
          ) : (
            <div className="pin-section fade-in">
              <div className="pin-display">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`pin-dot ${pin.length > i ? 'active' : ''}`}></div>
                ))}
              </div>
              
              <div className="dynamic-keypad">
                {keypad.map(num => (
                  <button key={num} onClick={() => handlePinClick(num)} className="key-btn">
                    {num}
                  </button>
                ))}
                <button className="key-btn clear" onClick={() => setPin('')}>Borrar</button>
              </div>

              <button 
                className="btn-huracan-elite w-100 mt-4" 
                disabled={pin.length < 4}
                onClick={handleAccess}
              >
                ENTRAR AL SISTEMA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;