import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Ticket, Plane, Calendar, ArrowRight, CheckCircle, Ban, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { FullPageLoader } from '../components/common/Loader';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/bookings/my-bookings');
        if (res.data?.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <FullPageLoader text="Loading your dashboard..." />;

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Welcome Header */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: 'white',
            padding: '2.5rem',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={32} />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                Hello, {user?.name}!
              </h1>
              <p style={{ color: '#bfdbfe', margin: 0 }}>
                {user?.email} &bull; Account Role: <strong>{user?.role?.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Reservations</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.25rem 0' }}>
              {bookings.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>All-time booking history</span>
          </div>

          <div className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Confirmed</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {confirmedBookings.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Ready for departure</span>
          </div>

          <div className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cancelled Tickets</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-muted)', margin: '0.25rem 0' }}>
              {cancelledBookings.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Seats refunded</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/flights" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plane size={18} /> Book a New Flight
          </Link>
          <Link to="/my-bookings" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <Ticket size={18} /> View All My Bookings
          </Link>
          <Link to="/pnr" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            Lookup PNR Status
          </Link>
        </div>

        {/* Recent Bookings Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ fontSize: '1.35rem' }}>Recent Bookings</h2>
            <Link to="/my-bookings" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All &rarr;
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p>No recent bookings to display.</p>
              <Link to="/flights" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Search Flights Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        padding: '10px',
                        background: 'var(--primary-light)',
                        borderRadius: '10px',
                        color: 'var(--primary)',
                      }}
                    >
                      <Plane size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {b.flight?.airline} ({b.flight?.flightNumber})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {b.flight?.source} &rarr; {b.flight?.destination} &bull;{' '}
                        {new Date(b.flight?.departureTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNR</span>
                    <div style={{ fontWeight: 800, letterSpacing: '0.05em' }}>{b.pnr}</div>
                  </div>

                  <div>
                    {b.status === 'CONFIRMED' ? (
                      <span className="badge badge-success">Confirmed</span>
                    ) : (
                      <span className="badge badge-danger">Cancelled</span>
                    )}
                  </div>

                  <Link to="/my-bookings" className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
