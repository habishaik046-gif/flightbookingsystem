import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Compass, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '540px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <Compass size={44} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Destination Not Found</h2>
        <p style={{ marginBottom: '2rem' }}>
          The flight route or page you are looking for has flown off radar or does not exist.
        </p>

        <Link to="/" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Return to Home Flight Search
        </Link>
      </div>
    </div>
  );
};
