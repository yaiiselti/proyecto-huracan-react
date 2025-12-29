// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; 

import Header from './components/Header';
import Footer from './components/Footer'; // Importamos el footer
import Home from './views/Home';
import Reserva from './views/Reserva';  

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
            
            {/* Rutas Administrativas */}
            <Route path="/admin/login" element={<div>Página de Login Admin</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;