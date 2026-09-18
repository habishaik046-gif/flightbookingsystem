import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plane, Calendar, Clock, Armchair, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../api/axios';
import { FullPageLoader } from '../components/common/Loader';
import { Alert } from '../components/common/Alert';

export const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await API.get(`/flights/${id}`);
        if (res.data?.success) {
          setFlight(res.data.flight);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Flight details not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [id]);

  if (loading) return <FullPageLoader text="Loading flight details..." />;
  if (error || !flight) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <Alert type="danger" message={error || 'Flight not found'} />
        <Link to="/flights" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Flights List
        </Link>
      </div>
    );
  }

  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);
  const durationMs = arrTime - depTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const isSoldOut = flight.availableSeats <= 0;

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '900px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Back to Search Results
        </button>

        <div className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1.5rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                Non-Stop Direct Flight
              </span>
              <h1 style={{ fontSize: '1.85rem' }}>{flight.airline}</h1>
              <p style={{ fontWeight: 600 }}>Flight Number: {flight.flightNumber}</p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price per ticket</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                ${flight.price}
              </div>
            </div>
          </div>

          {/* Route details */}
          <div
            style={{
              background: 'var(--bg-alt)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
            }}
          >
            <div className="flight-route" style={{ margin: 0 }}>
              <div className="route-endpoint">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Departure</div>
                <div className="route-city">{flight.source}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  {depTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="route-path">
                <div className="route-duration">
                  <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {hours}h {minutes > 0 ? `${minutes}m` : ''} duration
                </div>
                <div className="route-line">
                  <span className="route-plane-icon">
                    <Plane size={18} style={{ transform: 'rotate(90deg)' }} />
                  </span>
                </div>
              </div>

              <div className="route-endpoint">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Arrival</div>
                <div className="route-city">{flight.destination}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  {arrTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Seat Status Information */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="card" style={{ background: '#f8fafc', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Aircraft Capacity</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{flight.totalSeats} Seats</div>
            </div>

            <div className="card" style={{ background: '#f8fafc', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available Seats Remaining</span>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: flight.availableSeats <= 5 ? 'var(--danger)' : 'var(--success)',
                }}
              >
                {flight.availableSeats} Seats
              </div>
            </div>

            <div className="card" style={{ background: '#f8fafc', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Baggage Allowance</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>1 Cabin + 1 Check-in</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {isSoldOut ? (
              <div className="alert alert-danger" style={{ margin: 0 }}>
                This flight is currently sold out. Please select another flight.
              </div>
            ) : (
              <Link to={`/book/${flight._id}`} className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                <span>Proceed to Passenger Details</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
