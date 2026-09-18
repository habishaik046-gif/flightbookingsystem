import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, Calendar, Search, ArrowRightLeft } from 'lucide-react';

export const FlightSearchForm = ({ initialValues = {}, onSearch }) => {
  const navigate = useNavigate();
  const [source, setSource] = useState(initialValues.source || '');
  const [destination, setDestination] = useState(initialValues.destination || '');
  const [date, setDate] = useState(initialValues.date || '');

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (source.trim()) params.append('source', source.trim().toUpperCase());
    if (destination.trim()) params.append('destination', destination.trim().toUpperCase());
    if (date) params.append('date', date);

    if (onSearch) {
      onSearch({ source, destination, date });
    } else {
      navigate(`/flights?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '1.75rem',
        borderRadius: 'var(--radius-xl)',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        {/* Source */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlaneTakeoff size={16} color="var(--primary)" />
            <span>Origin City or Airport</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. DEL or Delhi"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        {/* Swap Button (desktop) */}
        <div style={{ paddingBottom: '4px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleSwap}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
            title="Swap Origin and Destination"
          >
            <ArrowRightLeft size={16} />
          </button>
        </div>

        {/* Destination */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlaneLanding size={16} color="var(--primary)" />
            <span>Destination City or Airport</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. BOM or Mumbai"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} color="var(--primary)" />
            <span>Departure Date</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div style={{ paddingBottom: '2px' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', height: '48px', gap: '0.6rem' }}
          >
            <Search size={18} />
            <span>Search Flights</span>
          </button>
        </div>
      </div>
    </form>
  );
};
