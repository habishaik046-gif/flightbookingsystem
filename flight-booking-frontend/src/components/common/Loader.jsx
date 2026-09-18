import React from 'react';

export const Spinner = ({ size = 'md', light = false }) => {
  const sizeMap = {
    sm: { width: '16px', height: '16px', borderWidth: '2px' },
    md: { width: '28px', height: '28px', borderWidth: '3px' },
    lg: { width: '42px', height: '42px', borderWidth: '4px' },
  };

  return (
    <div
      className={`spinner ${light ? 'spinner-light' : ''}`}
      style={sizeMap[size] || sizeMap.md}
    />
  );
};

export const FullPageLoader = ({ text = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
      }}
    >
      <Spinner size="lg" />
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{text}</p>
    </div>
  );
};
