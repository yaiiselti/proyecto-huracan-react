import React, { createContext, useState, useContext } from 'react';

interface Notification { msg: string; type: 'success' | 'error' | 'info'; }
interface ContextType { showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void; }

const NotificationContext = createContext<ContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notif, setNotif] = useState<Notification | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notif && (
        <div className={`huracan-toast ${notif.type}`}>
          {notif.type === 'success' ? '✓' : '✕'} {notif.msg}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification debe estar dentro de NotificationProvider');
  return context;
};