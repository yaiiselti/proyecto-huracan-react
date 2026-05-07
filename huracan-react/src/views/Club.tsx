
// Iconos minimalistas para las secciones
const HistoryIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" />
    </svg>
);

const TargetIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const Club = () => {
    return (
        <div className="club-wrapper fade-in">
            {/* HERO SECTION ELITE */}
            <section className="club-hero">
                <div className="container">
                    <h1 className="club-title">NUESTRO <span className="text-yellow">CLUB</span></h1>
                    <p className="club-subtitle">Más que un equipo, somos una familia en el corazón del desierto.</p>
                </div>
            </section>

            <main className="container club-content">
                {/* SECCIÓN HISTORIA Y MISIÓN */}
                <div className="club-grid">
                    <div className="club-card-elite anim-float-huracan" style={{animationDelay: '0s'}}>
                        <div className="card-header">
                            <div className="anim-spin-hover"><HistoryIcon /></div>
                            <h2>Nuestra Historia</h2>
                        </div>
                        <p>
                            Fundado en el corazón de <strong>San Pedro de Atacama</strong>, el Club Deportivo Huracán
                            nació de la pasión de un grupo de vecinos que buscaban un espacio para fomentar el deporte
                            y la camaradería. Desde nuestros inicios, hemos crecido junto a la comunidad, convirtiéndonos
                            en un referente de esfuerzo y compromiso deportivo.
                        </p>
                    </div>

                    <div className="club-card-elite anim-float-huracan" style={{animationDelay: '1s'}}>
                        <div className="card-header">
                            <div className="anim-spin-hover"><TargetIcon /></div>
                            <h2>¿A qué nos dedicamos?</h2>
                        </div>
                        <p>
                            Nuestra misión es profesionalizar la práctica del fútbol amateur, ofreciendo instalaciones
                            de primer nivel y un ambiente seguro. Nos dedicamos a organizar torneos, fomentar las ligas
                            juveniles y mantener viva la llama del deporte rey en nuestra región.
                        </p>
                    </div>
                </div>

                <section className="club-gallery-section mt-5">
                    <h2 className="section-title-elite text-center">Nuestras Instalaciones</h2>
                    <p className="section-subtitle-gallery text-center">Conoce el campo donde se vive la pasión del Huracán.</p>

                    <div className="gallery-grid-elite">
                        <div className="gallery-item-main">
                            <img src="/src/assets/img/cancha1.jpeg" alt="Cancha Principal" />
                            <div className="gallery-overlay"><span>Cancha Principal</span></div>
                        </div>
                        <div className="gallery-item-secondary">
                            <img src="/src/assets/img/cancha2.jpeg" alt="Iluminación nocturna" />
                            <div className="gallery-overlay"><span>Iluminación LED</span></div>
                        </div>
                        <div className="gallery-item-secondary">
                            {/* Aquí puedes usar el logo o una foto de los jugadores */}
                            <img src="/src/assets/img/logo_huracan.png" alt="Escudo del Club" className="img-contain" />
                            <div className="gallery-overlay"><span>Identidad Huracán</span></div>
                        </div>
                    </div>
                </section>


                {/* SECCIÓN UBICACIÓN CON MAPA */}
                <section className="location-section mt-5">
                    <div className="location-info">
                        <h2 className="section-title-elite">¿Dónde encontrarnos?</h2>
                        <p className="location-text">
                            Estamos ubicados en la zona deportiva de San Pedro de Atacama,
                            rodeados del paisaje único de la región de Antofagasta.
                            ¡Te esperamos para vivir el fútbol como nunca antes!
                        </p>
                        <div className="address-capsule">
                            📍 Calle El Cobre S/N, San Pedro de Atacama, Chile
                        </div>
                    </div>

                    <div className="map-container-elite">
                        <iframe
                            title="Mapa Club Huracán"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3644.026442436854!2d-68.20141682375842!3d-22.91241193859065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91024b4344499427%3A0x6731e09710375960!2sEstadio%20Municipal%20de%20San%20Pedro%20de%20Atacama!5e0!3m2!1ses!2scl!4v1704144000000!5m2!1ses!2scl"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                        ></iframe>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Club;