import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const icons = {
    danger: <XCircle size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`alert alert-${type}`}>
      <span style={{ flexShrink: 0, marginTop: '2px' }}>{icons[type] || icons.info}</span>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
            color: 'inherit',
            opacity: 0.7,
            padding: 0,
            marginLeft: '0.5rem',
          }}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};
