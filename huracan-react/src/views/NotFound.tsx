import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="notfound-wrapper fade-in">
      <div className="notfound-content">
        <div className="notfound-error-code">404</div>
        <h1 className="notfound-title">
          ¡Fuera de <span className="text-yellow">Juego</span>!
        </h1>
        <p className="notfound-subtitle">
          La página que buscas no existe, ha sido movida o escribiste mal la dirección. 
          Parece que la pelota se fue fuera de la cancha.
        </p>
        <Link to="/" className="btn-reserva-home mt-4">
          VOLVER AL INICIO
        </Link>
      </div>
    </div>
  );
};

export default NotFound;