import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <p>{message}</p>
      {onClose && (
        <button 
          className="notification-close" 
          onClick={onClose}
          aria-label="Închide notificarea"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Notification; 