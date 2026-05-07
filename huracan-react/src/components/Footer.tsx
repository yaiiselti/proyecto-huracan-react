// src/components/Footer.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  // LÓGICA SECRETA PARA MÓVILES (5 Toques rápidos para entrar al Admin)
  useEffect(() => {
    if (tapCount === 0) return;
    
    if (tapCount >= 5) {
      navigate('/login');
      setTapCount(0); // Reiniciar contador
    } else {
      // Si no toca de nuevo en menos de 1.5 segundos, se reinicia la cuenta
      const timer = setTimeout(() => setTapCount(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [tapCount, navigate]);

  // CAMBIO QUIRÚRGICO: Ocultar solo si es una ruta de administración
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer-elite">
      <div className="container">
        <div className="footer-main-grid">
          
          {/* IDENTIDAD */}
          <div className="footer-section section-branding">
            {/* Se aplica el evento de toque secreto al logo del footer */}
            <h3 
              className="footer-logo" 
              onClick={() => setTapCount(prev => prev + 1)}
              style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'pointer' }}
            >
              HURACÁN<span className="text-blue">.</span>
            </h3>
            <p className="footer-tagline">
              La mejor opción para incentivar el deporte.
            </p>
          </div>

          {/* REDES SOCIALES */}
          <div className="footer-section section-socials">
            <h4 className="footer-heading">SÍGUENOS</h4>
            <div className="social-icon-group">
              <a href="https://instagram.com/club_huracan_sequitor" className="social-icon-link" aria-label="Instagram">
                <span>Instagram</span>
              </a>
              <a href="https://facebook.com/club_huracan_sequitor" className="social-icon-link" aria-label="Facebook">
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* UBICACIÓN */}
          <div className="footer-section section-contact">
            <h4 className="footer-heading">UBICACIÓN</h4>
            <p>📍 Ayllu de sequitor, San Pedro de Atacama, Complejo Deportivo Huracán de Sequitor</p>
            <p>📞 +56 9 8765 4321</p>
          </div>

        </div>

        {/* CRÉDITOS */}
        <div className="footer-credits">
          <div className="credits-content">
            <span>© DERECHOS RESERVADOS. 2025 CLUB DEPORTIVO HURACÁN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;