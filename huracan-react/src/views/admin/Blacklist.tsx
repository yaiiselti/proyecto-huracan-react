import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { BookingService, type BlacklistedUser } from '../../services/bookingService';
import AdminDialog, { type DialogConfig } from '../../components/AdminDialog';

import '../../styles/views/Blacklist.css';

const Blacklist = () => {
  // Estados (Siguiendo tu estructura original)
  const [blacklist, setBlacklist] = useState<BlacklistedUser[]>([]);
  const [identificador, setIdentificador] = useState('');
  const [motivo, setMotivo] = useState('');

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({ isOpen: false, type: 'alert', title: '', message: '' });
  const showConfirm = (title: string, message: string, action: () => void) => {
    setDialogConfig({ isOpen: true, type: 'confirm', title, message, action, confirmText: 'SÍ, LIBERAR' });
  };
  const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));

  // Función de inicialización
  const loadBlacklist = () => {
    setBlacklist(BookingService.getBlacklist());
  };

  useEffect(() => {
    loadBlacklist();
  }, []);

  // Funciones de lógica de negocio
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identificador.trim() || !motivo.trim()) return;

    BookingService.addToBlacklist(identificador.trim(), motivo.trim());
    setIdentificador('');
    setMotivo('');
    loadBlacklist();
  };

  const handleRemove = (id: string) => {
    showConfirm(
      "Liberar Usuario",
      "¿Estás seguro de quitar este castigo? El usuario podrá volver a agendar horas en el club.",
      () => {
        BookingService.removeFromBlacklist(id);
        loadBlacklist();
        closeDialog();
      }
    );
  };

  return (
    <div className="admin-layout-root">
      <Sidebar />
      <main className="admin-main-panel fade-in">
        <header className="dashboard-header">
          <h1>Gestión de <span style={{ color: '#ef4444' }}>Restricciones</span></h1>
          <p>Bloquea correos o números de teléfono de clientes problemáticos (Lista Negra).</p>
        </header>

        <div className="blacklist-layout">
          
          {/* Formulario de Agregado Manual */}
          <section className="blacklist-card">
            <h3 className="blacklist-title">Agregar Castigo Manual</h3>
            <form onSubmit={handleAdd} className="blacklist-form">
              <input type="text" placeholder="Ej: troll@correo.com o +56912345678" value={identificador} onChange={e => setIdentificador(e.target.value)} className="blacklist-input" required />
              <input type="text" placeholder="Motivo: Ej. No se presentó sin avisar" value={motivo} onChange={e => setMotivo(e.target.value)} className="blacklist-input" required />
              <button type="submit" className="blacklist-btn-add">
                BLOQUEAR USUARIO
              </button>
            </form>
          </section>

          {/* Lista de bloqueados interactiva */}
          <section className="blacklist-card">
            <h3 className="blacklist-title">Usuarios Bloqueados ({blacklist.length})</h3>
            <div className="blacklist-list">
              {blacklist.length > 0 ? blacklist.map(user => (
                <div key={user.id} className="blacklist-item">
                  <div>
                    <strong>{user.identificador}</strong>
                    <span>{user.motivo} ({user.fecha})</span>
                  </div>
                  <button onClick={() => handleRemove(user.id)} className="blacklist-btn-remove">Liberar</button>
                </div>
              )) : <p style={{ color: '#64748b', fontWeight: 600 }}>No hay usuarios en la lista negra.</p>}
            </div>
          </section>
        </div>
        
        <AdminDialog config={dialogConfig} onClose={closeDialog} />
      </main>
    </div>
  );
};

export default Blacklist;