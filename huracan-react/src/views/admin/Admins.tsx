import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminDialog, { type DialogConfig } from '../../components/AdminDialog';
import { AuthService } from '../../services/authService';

import '../../styles/views/Admins.css';

const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

interface StaffMember { 
  id: string; 
  nombre: string; 
  email: string;
  password?: string; // La contraseña es opcional para no exponerla
  rol: 'SuperAdmin' | 'Admin' | 'Moderador'; 
  isProtected?: boolean; 
}

const Admins = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'SuperAdmin' | 'Admin' | 'Moderador'>('Moderador');
  const [isProtected, setIsProtected] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ESTADOS DE VERIFICACIÓN DE CORREO
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingUser, setPendingUser] = useState<StaffMember | null>(null);

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({ isOpen: false, type: 'alert', title: '', message: '' });
  const showConfirm = (title: string, message: string, action: () => void) => {
    setDialogConfig({ isOpen: true, type: 'confirm', title, message, action, confirmText: 'SÍ, REMOVER' });
  };
  const showAlert = (title: string, message: string) => {
    setDialogConfig({ isOpen: true, type: 'alert', title, message });
  };
  const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));

  // Sesión actual para Validaciones de Jerarquía
  const currentUser = AuthService.getSession();
  const isCurrentUserSuperAdmin = currentUser?.role === 'SuperAdmin';

  useEffect(() => {
    const guardado = localStorage.getItem('huracan_staff');
    if (guardado) {
      // Migración o actualización forzosa del perfil maestro por seguridad
      const parsedStaff = JSON.parse(guardado).map((s: any) => {
        if (s.id === '1' || s.email === 'yaiiselti258@gmail.com') {
          return { ...s, id: '1', nombre: 'Yaiiselti', email: 'yaiiselti258@gmail.com', rol: 'SuperAdmin', isProtected: true };
        }
        return { ...s, email: s.email || '' };
      });
      setStaff(parsedStaff);
      localStorage.setItem('huracan_staff', JSON.stringify(parsedStaff));
    } else {
      // El creador original siempre es SuperAdmin protegido e invulnerable
      const defaultStaff: StaffMember[] = [{ id: '1', nombre: 'Yaiiselti', email: 'yaiiselti258@gmail.com', rol: 'SuperAdmin', isProtected: true }];
      setStaff(defaultStaff);
      localStorage.setItem('huracan_staff', JSON.stringify(defaultStaff));
    }
  }, []);

  // Cambio de rol inteligente
  const handleRoleChange = (newRole: 'SuperAdmin' | 'Admin' | 'Moderador') => {
    setRol(newRole);
    if (newRole === 'SuperAdmin') {
      setIsProtected(true); // Auto-protección para SuperAdmins
    }
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || (!editingId && !password)) return;

    if (editingId) {
      // LÓGICA DE ACTUALIZACIÓN
      const actualizados = staff.map(s => {
        if (s.id === editingId) {
          // Proteger la cuenta maestra de auto-sabotajes
          const finalRol = s.id === '1' ? 'SuperAdmin' : rol;
          const finalProtected = s.id === '1' ? true : isProtected;
          const updatedUser = { ...s, nombre: nombre.trim(), email: email.trim(), rol: finalRol, isProtected: finalProtected };
          // Solo actualizamos la contraseña si se escribió una nueva
          if (password) {
            updatedUser.password = password;
          }
          return updatedUser;
        }
        return s;
      });
      setStaff(actualizados);
      localStorage.setItem('huracan_staff', JSON.stringify(actualizados));
      showAlert("Personal Actualizado", "Los permisos y datos han sido actualizados con éxito.");
      resetForm();
    } else {
      // LÓGICA DE CREACIÓN CON VERIFICACIÓN DE CORREO
      const nuevo: StaffMember = { id: crypto.randomUUID(), nombre: nombre.trim(), email: email.trim(), password, rol, isProtected };
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setPendingUser(nuevo);
      setShowVerification(true);
      
      alert(`[SIMULADOR DE EMAIL]\n\nPara: ${email.trim()}\nAsunto: Código de Verificación de Cuenta\n\nTu código de verificación como administrador de Huracán es: ${code}\n\n(En producción este aviso no aparece y el código llega al correo real)`);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedCode && pendingUser) {
      const actualizados = [...staff, pendingUser];
      setStaff(actualizados);
      localStorage.setItem('huracan_staff', JSON.stringify(actualizados));
      
      setShowVerification(false);
      setVerificationCode('');
      setGeneratedCode('');
      setPendingUser(null);
      resetForm();
      
      showAlert("Personal Verificado", "El correo ha sido validado y el administrador se creó con éxito.");
    } else {
      showAlert("Código Incorrecto", "El código ingresado no coincide con el enviado al correo.");
    }
  };

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setRol('Moderador');
    setIsProtected(false);
    setEditingId(null);
  };

  const handleEdit = (user: StaffMember) => {
    if (!isCurrentUserSuperAdmin && user.rol === 'SuperAdmin') {
      showAlert('Acceso Denegado', 'Tu nivel de Administrador no te permite modificar cuentas de Super Administradores.');
      return;
    }
    if (!isCurrentUserSuperAdmin && user.isProtected) {
      showAlert('Acceso Denegado', 'Esta cuenta está blindada. Solo un Super Administrador puede modificarla.');
      return;
    }
    setNombre(user.nombre);
    setEmail(user.email || '');
    setRol(user.rol);
    setIsProtected(user.isProtected || false);
    setEditingId(user.id);
  };

  const handleRemove = (id: string) => {
    const targetUser = staff.find(s => s.id === id);
    
    if (targetUser?.isProtected) {
      showAlert('Acción Denegada', 'Este usuario es INVULNERABLE y está protegido por el sistema. No puede ser eliminado.');
      return;
    }

    showConfirm(
      "Remover Personal",
      `¿Seguro que deseas remover a ${targetUser?.nombre} del sistema permanentemente?`,
      () => {
        const filtrados = staff.filter(s => s.id !== id);
        setStaff(filtrados);
        localStorage.setItem('huracan_staff', JSON.stringify(filtrados));
        closeDialog();
      }
    );
  };

  return (
    <div className="admin-layout-root">
      <Sidebar />
      <main className="admin-main-panel fade-in">
        <header className="dashboard-header">
          <h1>Equipo <span className="text-yellow">Staff</span></h1>
          <p>Gestiona los permisos y al personal administrativo del club.</p>
        </header>

        <div className="admins-layout">
          <section className="admins-card">
            <h3 className="admins-title">{editingId ? 'Editar Personal' : 'Añadir Nuevo Personal'}</h3>
            <form onSubmit={handleAdd} className="admins-form">
              <input type="text" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} className="admins-input" required />
              <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="admins-input" required />
              <input type="password" placeholder={editingId ? "Nueva contraseña (opcional)" : "Contraseña"} value={password} onChange={e => setPassword(e.target.value)} className="admins-input" required={!editingId} />
              
              <select value={rol} onChange={e => handleRoleChange(e.target.value as 'SuperAdmin' | 'Admin' | 'Moderador')} className="admins-input" disabled={editingId === '1'}>
                <option value="Moderador">Moderador (Atención cliente)</option>
                <option value="Admin">Administrador (Control total)</option>
                {isCurrentUserSuperAdmin && <option value="SuperAdmin">SuperAdmin (Dueño / Creador)</option>}
              </select>

              {isCurrentUserSuperAdmin && (
                <label className="checkbox-group" title="Protege la cuenta para que no pueda ser eliminada">
                  <input type="checkbox" checked={isProtected} onChange={e => setIsProtected(e.target.checked)} disabled={editingId === '1'} style={{marginRight: '8px'}} />
                  <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><ShieldIcon /> Hacer Invulnerable</span>
                </label>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="admins-btn-add" style={{ flex: 1 }}>{editingId ? 'GUARDAR' : 'AGREGAR'}</button>
                {editingId && <button type="button" onClick={resetForm} className="admins-btn-add" style={{ flex: 1, background: '#64748b' }}>CANCELAR</button>}
              </div>
            </form>
          </section>

          <section className="admins-card">
            <h3 className="admins-title">Personal Activo ({staff.length})</h3>
            <div className="admins-list">
              {staff.map(user => (
                <div key={user.id} className={`admins-item ${user.rol === 'SuperAdmin' ? 'super' : ''} ${user.isProtected ? 'protected' : ''}`}>
                  <div>
                    <strong style={{display: 'flex', alignItems: 'center', gap: '8px'}}>{user.nombre} {user.isProtected && <span style={{ color: '#FFD100', display: 'flex' }} title="Cuenta Invulnerable"><ShieldIcon /></span>}</strong>
                    <span>{user.rol} {user.email && `• ${user.email.toLowerCase()}`}</span>
                  </div>
                  <div className="actions-group">
                    <button onClick={() => handleEdit(user)} className="admins-btn-edit">Editar</button>
                    <button onClick={() => handleRemove(user.id)} className="admins-btn-remove" disabled={user.isProtected}>Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* MODAL DE VERIFICACIÓN DE CORREO */}
        {showVerification && (
          <div className="modal-overlay">
            <div className="modal-card-compact">
              <div className="modal-header-simple">
                <h3>Verificar Correo</h3>
              </div>
              <p className="modal-desc">
                Hemos enviado un código de 6 dígitos a <strong>{pendingUser?.email}</strong>. Ingrésalo para confirmar la identidad del nuevo administrador.
              </p>
              <form onSubmit={handleVerifyCode} style={{width: '100%'}}>
                <input 
                  type="text" 
                  placeholder="123456" 
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))} // Solo números
                  required
                  autoFocus
                  className="otp-input-admin"
                />
                <button type="submit" className="btn-verify-submit">VERIFICAR Y CREAR</button>
                <button type="button" className="btn-cancel-outline" onClick={() => { setShowVerification(false); setVerificationCode(''); setGeneratedCode(''); }}>CANCELAR</button>
              </form>
            </div>
          </div>
        )}

        <AdminDialog config={dialogConfig} onClose={closeDialog} />
      </main>
    </div>
  );
};
export default Admins;