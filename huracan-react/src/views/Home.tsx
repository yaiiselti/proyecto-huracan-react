import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-wrapper">

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="container">
          <h1 className="home-hero-title">
            CLUB <br />
            <span className="text-blue">DEPORTIVO</span> <span className="text-yellow">HURACAN</span>
          </h1>
          <p className="lead mb-4">CALIDAD PROFECIONAL.</p>
          <Link to="/reservar" className="btn-huracan" style={{ backgroundColor: 'var(--amarillo-club)', color: 'var(--azul-club)' }}>
            RESERVAR AHORA
          </Link>
        </div>
      </section>

      {/* --- SECCIÓN: CUADRADOS ANIMADOS ELITE --- */}
<section className="seccion-cuadrados-huracan">
  <div className="container">
    <div className="fila-cuadrados-elite">
      
      {/* Cuadrado 1 */}
      <div className="cuadrado-elite">
        <div className="cuadrado-contenido">
          <span className="cuadrado-icono">⚽</span>
          <h4 className="cuadrado-titulo">Campo<br/>de futbol</h4>
          <p className="cuadrado-texto">Pasto sintetico de primera calidad.</p>
        </div>
      </div>

      {/* Cuadrado 2 */}
      <div className="cuadrado-elite">
        <div className="cuadrado-contenido">
          <span className="cuadrado-icono">💡</span>
          <h4 className="cuadrado-titulo">Luz</h4>
          <p className="cuadrado-texto">luz completamente implementada para una experiencia nocturna de primera.</p>
        </div>
      </div>

      {/* Cuadrado 3 */}
      <div className="cuadrado-elite">
        <div className="cuadrado-contenido">
          <span className="cuadrado-icono">🛡️</span>
          <h4 className="cuadrado-titulo">Club <br/>huracan</h4>
          <p className="cuadrado-texto">ubicado en sequitor, san pedro de atacama </p>
        </div>
      </div>

    </div>
  </div>
</section>

    </div>
  );
}

export default Home;