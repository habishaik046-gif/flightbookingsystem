import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Clock, Armchair, ArrowRight } from 'lucide-react';

export const FlightCard = ({ flight }) => {
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  // Calculate duration in hours and minutes
  const durationMs = arrTime - depTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const isSoldOut = flight.availableSeats <= 0;
  const isLowSeats = flight.availableSeats > 0 && flight.availableSeats <= 8;

  return (
    <div className="card card-hover" style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Airline & Flight Number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plane size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{flight.airline}</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
              Flight No: {flight.flightNumber}
            </span>
          </div>
        </div>

        {/* Seat Availability Badge */}
        <div>
          {isSoldOut ? (
            <span className="badge badge-danger">Sold Out</span>
          ) : isLowSeats ? (
            <span className="badge badge-seats-low">
              <Armchair size={14} /> Only {flight.availableSeats} seats left!
            </span>
          ) : (
            <span className="badge badge-seats-high">
              <Armchair size={14} /> {flight.availableSeats} seats available
            </span>
          )}
        </div>
      </div>

      {/* Flight Route Diagram */}
      <div className="flight-route">
        {/* Source */}
        <div className="route-endpoint">
          <div className="route-city">{flight.source}</div>
          <div className="route-time">{formatTime(depTime)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{formatDate(depTime)}</div>
        </div>

        {/* Path Indicator */}
        <div className="route-path">
          <div className="route-duration" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {durationStr} (Direct)
          </div>
          <div className="route-line">
            <span className="route-plane-icon">
              <Plane size={15} style={{ transform: 'rotate(90deg)' }} />
            </span>
          </div>
        </div>

        {/* Destination */}
        <div className="route-endpoint">
          <div className="route-city">{flight.destination}</div>
          <div className="route-time">{formatTime(arrTime)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{formatDate(arrTime)}</div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price per passenger</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
            ${flight.price}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/flights/${flight._id}`} className="btn btn-secondary btn-sm">
            Details
          </Link>
          <Link
            to={`/book/${flight._id}`}
            className={`btn btn-primary ${isSoldOut ? 'disabled' : ''}`}
            style={{ pointerEvents: isSoldOut ? 'none' : 'auto' }}
          >
            <span>Book Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
