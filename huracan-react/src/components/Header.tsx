import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Control de scroll natural: Bloquea el fondo solo en móvil
  useEffect(() => {
    if (isMenuOpen && window.innerWidth <= 768) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    // Limpieza al desmontar el componente
    return () => document.body.classList.remove('lock-scroll');
  }, [isMenuOpen]);

  const getActiveClass = (path: string) => 
    location.pathname === path ? "header-link-active" : "";

  return (
    <header className="header-elite">
      <div className="header-glow-bar"></div>

      <div className="header-container">
        {/* LOGO - Z-index bajo para quedar tras el menú */}
        <Link to="/" className="header-logo" onClick={() => setIsMenuOpen(false)}>
          HURACÁN<span className="text-blue">.</span>
        </Link>
        
        {/* BOTÓN HAMBURGUESA - Z-index alto para estar siempre arriba */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* MENÚ LATERAL - Ahora con posición FIJA absoluta */}
        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <div className="nav-menu-inner">
            <Link to="/" className={`nav-link ${getActiveClass('/')}`} onClick={() => setIsMenuOpen(false)}>
              Inicio
            </Link>
            <Link to="/reservar" className={`nav-link ${getActiveClass('/reservar')}`} onClick={() => setIsMenuOpen(false)}>
              Arrendar
            </Link>
            <Link to="/nosotros" className={`nav-link ${getActiveClass('/nosotros')}`} onClick={() => setIsMenuOpen(false)}>
              Club
            </Link>
          </div>
        </nav>
      </div>

      {/* OVERLAY: Al tocar la zona oscura, el menú se guarda solo */}
      {isMenuOpen && <div className="menu-blur-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </header>
  );
}

export default Header;