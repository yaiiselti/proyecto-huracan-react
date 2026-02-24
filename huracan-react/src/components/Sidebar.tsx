import { AuthService } from '../services/authService';
import './index.css';

const Sidebar = () => {
  const admin = AuthService.getSession();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <img src="/logo_huracan.png" alt="Logo" />
        <h3>HURACÁN <span>HUB</span></h3>
      </div>

      <nav className="sidebar-nav">
        {/* Marcamos Dashboard como activo por ser la primera vista */}
        <button className="active">Dashboard</button>
        <button>Reservas</button>
        <button>Agenda Semanal</button>
        <button>Informes</button>
        <button>Equipo</button>
      </nav>

      <div className="sidebar-profile">
        <div className="profile-pill">
          <div className="avatar-circle">{admin?.user.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <strong>{admin?.user}</strong>
            <span>{admin?.email}</span>
          </div>
        </div>
        <button onClick={() => AuthService.logout()} className="logout-btn">SALIR</button>
      </div>
    </aside>
  );
};

export default Sidebar;