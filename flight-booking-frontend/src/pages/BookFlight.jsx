import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Plus, Trash2, ShieldCheck, CheckCircle2, Ticket, ArrowLeft } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader, Spinner } from '../components/common/Loader';
import { Alert } from '../components/common/Alert';

export const BookFlight = () => {
  const { id: flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [loadingFlight, setLoadingFlight] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Passenger state array
  const [passengers, setPassengers] = useState([
    {
      name: user ? user.name : '',
      age: '',
      gender: 'Male',
      seatNumber: '',
    },
  ]);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await API.get(`/flights/${flightId}`);
        if (res.data?.success) {
          setFlight(res.data.flight);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load flight details');
      } finally {
        setLoadingFlight(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const addPassenger = () => {
    if (flight && passengers.length >= flight.availableSeats) {
      setError(`Cannot add more passengers. Only ${flight.availableSeats} seat(s) remain available.`);
      return;
    }
    setPassengers([
      ...passengers,
      { name: '', age: '', gender: 'Male', seatNumber: '' },
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) return;
    const updated = passengers.filter((_, i) => i !== index);
    setPassengers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input validations
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        setError(`Please enter passenger #${i + 1}'s full name`);
        return;
      }
      if (!p.age || isNaN(p.age) || Number(p.age) <= 0) {
        setError(`Please enter a valid age for passenger #${i + 1}`);
        return;
      }
    }

    if (flight && passengers.length > flight.availableSeats) {
      setError(`Only ${flight.availableSeats} seat(s) available. You requested ${passengers.length}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/bookings', {
        flightId,
        passengers: passengers.map((p) => ({
          ...p,
          age: Number(p.age),
          name: p.name.trim(),
        })),
      });

      if (res.data?.success) {
        setBookingSuccess(res.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFlight) return <FullPageLoader text="Preparing booking engine..." />;

  // Success Confirmation View
  if (bookingSuccess) {
    return (
      <div className="main-content">
        <div className="container" style={{ maxWidth: '680px' }}>
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
            <p style={{ marginBottom: '1.5rem' }}>
              Your flight ticket has been successfully issued. Save your unique PNR code below.
            </p>

            <div
              style={{
                background: 'var(--primary-light)',
                border: '2px dashed var(--primary-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Booking Reference (PNR)
              </span>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  color: 'var(--primary)',
                  margin: '0.5rem 0',
                }}
              >
                {bookingSuccess.pnr}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Total Paid: <strong>${bookingSuccess.totalAmount}</strong> for {bookingSuccess.seatsBooked} passenger(s)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/my-bookings" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
                <Ticket size={18} /> View in My Bookings
              </Link>
              <Link to={`/pnr`} className="btn btn-secondary btn-lg">
                Track by PNR
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = (flight?.price || 0) * passengers.length;

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '960px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Back to Flight
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Passenger Form */}
          <div>
            <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <h2 style={{ fontSize: '1.4rem' }}>Passenger Details</h2>
                <span className="badge badge-info">
                  {flight?.availableSeats} Seats Available
                </span>
              </div>

              {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

              <form onSubmit={handleSubmit}>
                {passengers.map((passenger, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--bg-alt)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={16} color="var(--primary)" /> Passenger #{index + 1}
                      </h4>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePassenger(index)}
                          className="btn btn-sm btn-outline-danger"
                          title="Remove passenger"
                          style={{ padding: '0.2rem 0.5rem' }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="As shown on passport / ID"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Age *</label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          required
                          className="form-control"
                          placeholder="e.g. 28"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Gender *</label>
                        <select
                          className="form-control"
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Preferred Seat (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 14A, 14B"
                        value={passenger.seatNumber}
                        onChange={(e) => handlePassengerChange(index, 'seatNumber', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPassenger}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: '1.5rem', gap: '0.4rem' }}
                >
                  <Plus size={16} /> Add Another Passenger
                </button>

                <button
                  type="submit"
                  disabled={submitting || (flight && flight.availableSeats <= 0)}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', gap: '0.6rem' }}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" light /> Reserving Seats...
                    </>
                  ) : (
                    <>Confirm & Book Flight (${totalPrice})</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div>
            <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Flight Summary</h3>

              {flight && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{flight.airline}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Flight: {flight.flightNumber}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '1rem 0',
                      borderTop: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Route</span>
                      <strong>
                        {flight.source} &rarr; {flight.destination}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Departure</span>
                      <span>{new Date(flight.departureTime).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Passengers</span>
                      <span>{passengers.length} Person(s)</span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ticket Base Fare</span>
                      <span>
                        ${flight.price} &times; {passengers.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Taxes & Aviation Fees</span>
                      <span>$0.00 (Included)</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--primary)',
                      }}
                    >
                      <span>Total Due</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#ecfdf5',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>Guaranteed seat reservation upon submission</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
