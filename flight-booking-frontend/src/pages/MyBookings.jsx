import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Plane, Calendar, Clock, AlertTriangle, CheckCircle, Ban, ArrowRight } from 'lucide-react';
import API from '../api/axios';
import { FullPageLoader, Spinner } from '../components/common/Loader';
import { Alert } from '../components/common/Alert';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cancellation modal state
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;

    setCancelling(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await API.put(`/bookings/${cancelModalBooking._id}/cancel`);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Booking cancelled successfully');
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === cancelModalBooking._id ? { ...b, status: 'CANCELLED' } : b))
        );
        setCancelModalBooking(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <FullPageLoader text="Loading your reservations..." />;

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '960px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>My Bookings</h1>
            <p>Manage your flight itineraries and active boarding passes</p>
          </div>

          <Link to="/flights" className="btn btn-primary btn-sm">
            Book Another Flight
          </Link>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Ticket size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Bookings Found</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              You haven't made any flight bookings yet. Search for flights and start your journey!
            </p>
            <Link to="/flights" className="btn btn-primary">
              Explore Available Flights
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map((booking) => {
              const flight = booking.flight;
              const isCancelled = booking.status === 'CANCELLED';

              return (
                <div key={booking._id} className="ticket-card">
                  {/* Ticket Header */}
                  <div className="ticket-header" style={{ opacity: isCancelled ? 0.8 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '8px',
                          borderRadius: '8px',
                        }}
                      >
                        <Plane size={20} />
                      </div>
                      <div>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem' }}>
                          {flight?.airline || 'Commercial Airline'}
                        </h3>
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                          Flight: {flight?.flightNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        PNR CODE
                      </span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                        {booking.pnr}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="ticket-body">
                    {/* Status & Date */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div>
                        {isCancelled ? (
                          <span className="badge badge-danger">
                            <Ban size={13} /> Cancelled
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle size={13} /> Confirmed
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Route Details */}
                    {flight && (
                      <div className="flight-route" style={{ margin: '1rem 0 1.5rem' }}>
                        <div className="route-endpoint">
                          <div className="route-city">{flight.source}</div>
                          <div className="route-time">
                            {new Date(flight.departureTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {new Date(flight.departureTime).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="route-path">
                          <div className="route-duration">Non-Stop</div>
                          <div className="route-line">
                            <span className="route-plane-icon">
                              <Plane size={15} style={{ transform: 'rotate(90deg)' }} />
                            </span>
                          </div>
                        </div>

                        <div className="route-endpoint">
                          <div className="route-city">{flight.destination}</div>
                          <div className="route-time">
                            {new Date(flight.arrivalTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {new Date(flight.arrivalTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="ticket-perforation" />

                    {/* Passenger Manifest */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        PASSENGERS ({booking.seatsBooked})
                      </h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '0.75rem',
                        }}
                      >
                        {booking.passengers.map((p, i) => (
                          <div
                            key={i}
                            style={{
                              background: 'var(--bg-alt)',
                              padding: '0.65rem 0.85rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.85rem',
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {p.gender}, {p.age} yrs | Seat: {p.seatNumber || 'Auto-Assigned'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ticket Footer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Fare</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          ${booking.totalAmount}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link to={`/pnr`} className="btn btn-secondary btn-sm">
                          Track PNR
                        </Link>
                        {!isCancelled && (
                          <button
                            onClick={() => setCancelModalBooking(booking)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Cancel Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalBooking && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                  <AlertTriangle size={20} /> Confirm Cancellation
                </h3>
                <button
                  onClick={() => setCancelModalBooking(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Are you sure you want to cancel booking with PNR{' '}
                  <strong style={{ letterSpacing: '0.05em' }}>{cancelModalBooking.pnr}</strong>?
                </p>
                <div
                  style={{
                    background: 'var(--danger-light)',
                    border: '1px solid #fecaca',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#991b1b',
                    fontSize: '0.875rem',
                  }}
                >
                  Your {cancelModalBooking.seatsBooked} reserved seat(s) will be immediately released and restored back
                  to the flight inventory.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setCancelModalBooking(null)}
                  className="btn btn-secondary"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="btn btn-danger"
                  disabled={cancelling}
                  style={{ gap: '0.4rem' }}
                >
                  {cancelling ? (
                    <>
                      <Spinner size="sm" light /> Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
