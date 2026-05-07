import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Bloquear el scroll de la página de fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // SEGURIDAD / UX: Ocultar el Header público si estamos en el panel de administrador o login
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')) {
    return null;
  }

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="header-elite">
        <div className="header-glow-bar"></div>
        <div className="header-container">
          <Link to="/" className="header-logo" onClick={closeMenu}>
            <img src="/logo_huracan.png" alt="Logo Huracán" className="header-logo-img" />
            <span className="logo-text">HURACÁN</span>
          </Link>

          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <div className="nav-menu-inner">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'header-link-active' : ''}`} onClick={closeMenu}>Inicio</Link>
              <Link to="/club" className={`nav-link ${location.pathname === '/club' ? 'header-link-active' : ''}`} onClick={closeMenu}>El Club</Link>
              <Link to="/reserva" className={`nav-link ${location.pathname === '/reserva' ? 'header-link-active' : ''}`} onClick={closeMenu}>Reservar Cancha</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Overlay movido AFUERA para que desenfoque toda la página libremente */}
      {isMenuOpen && <div className="menu-blur-overlay" onClick={closeMenu}></div>}
    </>
  );
}

export default Header;