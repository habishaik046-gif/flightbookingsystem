import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Armchair, Ticket, Plane, Sparkles, ArrowRight } from 'lucide-react';
import { FlightSearchForm } from '../components/flights/FlightSearchForm';
import API from '../api/axios';
import { FlightCard } from '../components/flights/FlightCard';

export const Home = () => {
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get('/flights');
        if (res.data?.success) {
          // Take first 3 flights
          setFeaturedFlights(res.data.flights.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load featured flights:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
          color: 'white',
          padding: '4.5rem 0 7rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} color="#38bdf8" />
              <span>Smart Real-Time Flight Booking Engine</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: 'white',
                marginBottom: '1rem',
                letterSpacing: '-0.03em',
              }}
            >
              Fly Anywhere with Absolute Confidence
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '620px',
                margin: '0 auto',
              }}
            >
              Explore top domestic and international destinations. Lock in live seat inventory, instant PNR issuance, and effortless cancellations.
            </p>
          </div>

          {/* Search Box floating over hero */}
          <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
            <FlightSearchForm />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '12px',
                  borderRadius: '12px',
                  flexShrink: 0,
                }}
              >
                <Zap size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Instant PNR Confirmation</h4>
                <p style={{ fontSize: '0.9rem' }}>
                  Unique 6-character cryptographic booking ID generated the instant you confirm your reservation.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '12px',
                  borderRadius: '12px',
                  flexShrink: 0,
                }}
              >
                <Armchair size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Live Seat Guarantee</h4>
                <p style={{ fontSize: '0.9rem' }}>
                  Real-time atomic seat tracking guarantees you never suffer from oversold or ghost bookings.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: '#fef3c7',
                  color: '#d97706',
                  padding: '12px',
                  borderRadius: '12px',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Effortless Cancellations</h4>
                <p style={{ fontSize: '0.9rem' }}>
                  Need to change plans? Cancel in one click with instant status updates and seat release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Flights */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
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
              <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Popular Flight Departures</h2>
              <p>Top scheduled routes available for immediate booking</p>
            </div>

            <Link to="/flights" className="btn btn-secondary btn-sm" style={{ gap: '0.5rem' }}>
              <span>View All Flights</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : featuredFlights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {featuredFlights.map((flight) => (
                <FlightCard key={flight._id} flight={flight} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Plane size={40} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
              <h3>No Scheduled Flights Found</h3>
              <p style={{ marginBottom: '1.5rem' }}>Run the database seed script to populate sample flights.</p>
              <Link to="/flights" className="btn btn-primary">
                Browse Flights Catalog
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
