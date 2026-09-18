import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plane, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import API from '../api/axios';
import { FlightCard } from '../components/flights/FlightCard';
import { FlightSearchForm } from '../components/flights/FlightSearchForm';
import { Alert } from '../components/common/Alert';
import { FullPageLoader } from '../components/common/Loader';

export const FlightResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & sorting
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [sortBy, setSortBy] = useState('price_asc');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const source = searchParams.get('source') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (source) queryParams.append('source', source);
        if (destination) queryParams.append('destination', destination);
        if (date) queryParams.append('date', date);

        const res = await API.get(`/flights?${queryParams.toString()}`);
        if (res.data?.success) {
          setFlights(res.data.flights);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load flights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [source, destination, date]);

  // Extract unique airlines for filter dropdown
  const airlines = ['ALL', ...new Set(flights.map((f) => f.airline))];

  // Apply in-memory filtering and sorting
  let filteredFlights = flights.filter((flight) => {
    if (selectedAirline !== 'ALL' && flight.airline !== selectedAirline) return false;
    if (onlyAvailable && flight.availableSeats <= 0) return false;
    return true;
  });

  filteredFlights.sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'dep_asc') return new Date(a.departureTime) - new Date(b.departureTime);
    return 0;
  });

  return (
    <div className="main-content">
      <div className="container">
        {/* Modify Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <FlightSearchForm
            initialValues={{ source, destination, date }}
            onSearch={({ source: s, destination: d, date: dt }) => {
              const nextParams = new URLSearchParams();
              if (s) nextParams.append('source', s);
              if (d) nextParams.append('destination', d);
              if (dt) nextParams.append('date', dt);
              setSearchParams(nextParams);
            }}
          />
        </div>

        {/* Results Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              {source || destination ? (
                <>
                  Flights from <span style={{ color: 'var(--primary)' }}>{source || 'Anywhere'}</span> to{' '}
                  <span style={{ color: 'var(--primary)' }}>{destination || 'Anywhere'}</span>
                </>
              ) : (
                'All Available Flights'
              )}
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              Found {filteredFlights.length} flight{filteredFlights.length === 1 ? '' : 's'} matching your criteria
            </p>
          </div>

          {/* Filters & Sorting Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Airline filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                className="form-control"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem', width: 'auto' }}
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
              >
                {airlines.map((a) => (
                  <option key={a} value={a}>
                    {a === 'ALL' ? 'All Airlines' : a}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                className="form-control"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem', width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="dep_asc">Departure: Earliest</option>
              </select>
            </div>

            {/* Only Available Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              <span>Available Only</span>
            </label>
          </div>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        {loading ? (
          <FullPageLoader text="Finding best flight itineraries..." />
        ) : filteredFlights.length > 0 ? (
          <div>
            {filteredFlights.map((flight) => (
              <FlightCard key={flight._id} flight={flight} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Plane size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No flights found matching your search</h3>
            <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Try searching with broader dates or without city filters to see all available upcoming scheduled flights.
            </p>
            <button
              onClick={() => {
                setSelectedAirline('ALL');
                setOnlyAvailable(false);
                setSearchParams(new URLSearchParams());
              }}
              className="btn btn-secondary"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
