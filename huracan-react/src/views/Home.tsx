import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importación manual de 6 imágenes específicas
import img1 from '../assets/img/cancha1.jpeg';
import img2 from '../assets/img/cancha2.jpeg';
import img3 from '../assets/img/cancha1.jpeg';
import img4 from '../assets/img/cancha2.jpeg';
import img5 from '../assets/img/cancha1.jpeg';
import img6 from '../assets/img/cancha2.jpeg';

const heroImages = [img1, img2, img3, img4, img5, img6];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="home-wrapper">
      <section className="home-hero">
        {heroImages.map((img, index) => (
          <div 
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="hero-overlay"></div>

        <div className="container home-hero-content">
          <h1 className="home-hero-title">
            CLUB <br />
            <span className="text-blue">DEPORTIVO</span> <span className="text-yellow">HURACAN</span>
          </h1>
          <p className="lead mb-4">CALIDAD PROFECIONAL.</p>
          <Link to="/Reserva" className="btn-huracan btn-reserva-home">
            RESERVAR AHORA
          </Link>
        </div>
      </section>

      {/* --- SECCIÓN: CUADRADOS ANIMADOS ELITE (Sin cambios) --- */}
      <section className="seccion-cuadrados-huracan">
        <div className="container">
          <div className="fila-cuadrados-elite">
            <div className="cuadrado-elite">
              <div className="cuadrado-contenido">
                <span className="cuadrado-icono">⚽</span>
                <h4 className="cuadrado-titulo">Campo<br/>de futbol</h4>
                <p className="cuadrado-texto">Pasto sintetico de primera calidad.</p>
              </div>
            </div>
            <div className="cuadrado-elite">
              <div className="cuadrado-contenido">
                <span className="cuadrado-icono">💡</span>
                <h4 className="cuadrado-titulo">Luz</h4>
                <p className="cuadrado-texto">luz completamente implementada para una experiencia nocturna de primera.</p>
              </div>
            </div>
            <div className="cuadrado-elite">
              <div className="cuadrado-contenido">
                <span className="cuadrado-icono">🛡️</span>
                <h4 className="cuadrado-titulo">Club<br/>huracan</h4>
                <p className="cuadrado-texto">Ubicado en sequitor, san pedro de atacama</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;