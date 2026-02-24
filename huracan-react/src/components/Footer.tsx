import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Footer() {
  const location = useLocation();

  // Escondemos el footer en el panel de control y login
  if (location.pathname.startsWith('/admin') || location.pathname === '/login') {
    return null;
  }

  return (
    <footer className="footer-elite">
      {/* Tu código actual del Footer aquí... */}
    </footer>
  );

  return (
    <footer className="footer-elite">
      <div className="container">
        <div className="footer-main-grid">
          
          {/* Bloque 1: Identidad */}
          <div className="footer-section section-branding">
            <h3 className="footer-logo">HURACÁN<span className="text-blue">.</span></h3>
            <p className="footer-tagline">
              La mejor opcion para incentivar el deporte.
            </p>
          </div>

          {/* Bloque 2: Redes Sociales con Iconos Reales */}
          <div className="footer-section section-socials">
            <h4 className="footer-heading">SÍGUENOS</h4>
            <div className="social-icon-group">
              <a href="https://www.instagram.com/club_huracan_sequitor?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="social-icon-link" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span>Instagram</span>
              </a>
              <a href="https://www.facebook.com/share/1JzVQBvwon/" className="social-icon-link" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Bloque 3: Ubicación */}
          <div className="footer-section section-contact">
            <h4 className="footer-heading">UBICACIÓN</h4>
            <p>📍 Ayllu de sequitor, San Pedro de Atacama, Complejo Deportivo Huracan de Sequitor</p>
            <p>📞 +56 9 8765 4321</p>
          </div>

        </div>

        {/* Línea de Cierre Perfectamente Cuadrada */}
        <div className="footer-credits">
          <div className="credits-content">
            <span>© DERECHOS RESERVADOS. 2025 CLUB DEPORTIVO HURACÁN</span>
            <Link to="/Login" className="admin-silent-link">Acceso Administrador</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;