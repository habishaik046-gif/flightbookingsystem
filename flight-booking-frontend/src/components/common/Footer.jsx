import React from 'react';
import { Plane, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        padding: '3rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  background: 'var(--primary)',
                  padding: '6px',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                }}
              >
                <Plane size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>SkyWings</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              Next-generation flight booking experience. Effortless reservations, real-time seat inventory, and transparent flight management.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/flights" style={{ color: 'var(--text-muted)' }}>Search Flights</Link></li>
              <li><Link to="/pnr" style={{ color: 'var(--text-muted)' }}>PNR Status Check</Link></li>
              <li><Link to="/my-bookings" style={{ color: 'var(--text-muted)' }}>Manage My Bookings</Link></li>
              <li><Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>Customer Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System & APIs
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><span style={{ color: 'var(--text-muted)' }}>API Status: <strong>Online</strong></span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Backend: Express + MongoDB</span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Frontend: React + Vite</span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Authentication: JWT + bcrypt</span></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-light)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} SkyWings Aviation Systems. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with React & Express
          </div>
        </div>
      </div>
    </footer>
  );
};
