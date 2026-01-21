// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; 

import Header from './components/Header';
import Footer from './components/Footer'; 
import Home from './views/Home';
import Reserva from './views/Reserva'; 
import Club from './views/Club'; 
import Login from './views/Login';

// --- NUEVOS COMPONENTES DE SEGURIDAD ---
import { RutaProtegida } from './components/RutaProtegida';
import AdminDashboard from './views/admin/AdminDashboard';
function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/reserva" element={<Reserva />} />
            <Route path="/club" element={<Club />} />
            
            {/* Puerta de Acceso Admin con PIN Dinámico */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Administrativas Protegidas */}
            <Route 
              path="/admin/dashboard" 
              element={
                <RutaProtegida>

                  <AdminDashboard />
                </RutaProtegida>
              } 
            />

            {/* Redirección opcional para el login admin anterior */}
            <Route path="/admin/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;