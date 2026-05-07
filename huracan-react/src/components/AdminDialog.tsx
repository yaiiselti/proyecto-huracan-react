import React from 'react';
import '../styles/components/AdminDialog.css';

export interface DialogConfig {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  action?: () => void;
}

interface AdminDialogProps {
  config: DialogConfig;
  onClose: () => void;
}

const AdminDialog: React.FC<AdminDialogProps> = ({ config, onClose }) => {
  if (!config.isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-card" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">{config.title}</h3>
        <p className="dialog-desc">{config.message}</p>
        
        <div className="dialog-buttons" style={{ gridTemplateColumns: config.type === 'confirm' ? '1fr 1fr' : '1fr' }}>
          {config.type === 'confirm' ? (
            <>
              <button className="dialog-btn-confirm" onClick={() => { if (config.action) config.action(); }}>
                {config.confirmText || 'CONFIRMAR'}
              </button>
              <button className="dialog-btn-cancel" onClick={onClose}>
                {config.cancelText || 'CANCELAR'}
              </button>
            </>
          ) : (
            <button className="dialog-btn-alert" onClick={onClose}>ENTENDIDO</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDialog;