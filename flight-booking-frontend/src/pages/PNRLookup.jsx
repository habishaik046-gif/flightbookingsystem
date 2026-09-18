import React, { useState } from 'react';
import { Search, Ticket, Plane, CheckCircle2, Ban, Calendar, User, Printer } from 'lucide-react';
import API from '../api/axios';
import { Alert } from '../components/common/Alert';
import { Spinner } from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

export const PNRLookup = () => {
  const { user } = useAuth();
  const [pnrInput, setPnrInput] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      setError('Please enter a 6-character PNR code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setBooking(null);

    try {
      const res = await API.get(`/bookings/pnr/${pnrInput.trim().toUpperCase()}`);
      if (res.data?.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to your account to view this booking.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view this booking.');
      } else {
        setError(err.response?.data?.message || 'No booking found with this PNR code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!window.confirm(`Are you sure you want to cancel PNR ${booking.pnr}?`)) return;

    setCancelling(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await API.put(`/bookings/${booking._id}/cancel`);
      if (res.data?.success) {
        setSuccessMsg('Booking cancelled successfully and seats have been restored.');
        setBooking(res.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const isConfirmed = booking?.status === 'CONFIRMED';
  const canCancel =
    isConfirmed &&
    user &&
    (booking?.user?._id === user._id || booking?.user === user._id || user.role === 'admin');

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Check PNR Status</h1>
          <p style={{ maxWidth: '520px', margin: '0 auto' }}>
            Enter your 6-character booking reference code to check real-time ticket confirmation and flight status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                maxLength="6"
                className="form-control"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  paddingLeft: '1rem',
                  height: '52px',
                }}
                placeholder="e.g. 8HSSMM"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              {loading ? (
                <>
                  <Spinner size="sm" light /> Checking...
                </>
              ) : (
                <>
                  <Search size={18} /> Lookup PNR
                </>
              )}
            </button>
          </form>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* Boarding Pass Result */}
        {booking && (
          <div className="ticket-card" id="printable-ticket">
            {/* Header */}
            <div className="ticket-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Plane size={24} />
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>
                    {booking.flight?.airline || 'SkyWings Airline'}
                  </h3>
                  <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Flight No: {booking.flight?.flightNumber || 'N/A'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>BOOKING STATUS</span>
                <div>
                  {isConfirmed ? (
                    <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534' }}>
                      CONFIRMED
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ background: '#fee2e2', color: '#991b1b' }}>
                      CANCELLED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="ticket-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passenger Count</span>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{booking.seatsBooked} Person(s)</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNR Reference</span>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '0.1em' }}>
                    {booking.pnr}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)' }}>
                    ${booking.totalAmount}
                  </div>
                </div>
              </div>

              {/* Route */}
              {booking.flight && (
                <div className="flight-route" style={{ margin: '1.5rem 0' }}>
                  <div className="route-endpoint">
                    <div className="route-city">{booking.flight.source}</div>
                    <div className="route-time">
                      {new Date(booking.flight.departureTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(booking.flight.departureTime).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="route-path">
                    <div className="route-duration">Non-Stop Flight</div>
                    <div className="route-line">
                      <span className="route-plane-icon">
                        <Plane size={16} style={{ transform: 'rotate(90deg)' }} />
                      </span>
                    </div>
                  </div>

                  <div className="route-endpoint">
                    <div className="route-city">{booking.flight.destination}</div>
                    <div className="route-time">
                      {new Date(booking.flight.arrivalTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(booking.flight.arrivalTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="ticket-perforation" />

              {/* Passenger List */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  PASSENGER MANIFEST
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {booking.passengers.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-alt)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.gender} &bull; {p.age} years &bull; Seat: <strong>{p.seatNumber || 'N/A'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print / Cancel buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                  <Printer size={15} /> Print Boarding Pass
                </button>

                {canCancel && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="btn btn-outline-danger btn-sm"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel This Reservation'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
