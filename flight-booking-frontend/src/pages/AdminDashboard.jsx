import React, { useEffect, useState } from 'react';
import {
  Plane,
  Plus,
  Edit2,
  Trash2,
  Ticket,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import API from '../api/axios';
import { FullPageLoader, Spinner } from '../components/common/Loader';
import { Alert } from '../components/common/Alert';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('flights'); // 'flights' or 'bookings'
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Flight Modal State
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [flightFormData, setFlightFormData] = useState({
    flightNumber: '',
    airline: '',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flightsRes, bookingsRes] = await Promise.all([
        API.get('/flights'),
        API.get('/bookings/admin/all'),
      ]);

      if (flightsRes.data?.success) setFlights(flightsRes.data.flights);
      if (bookingsRes.data?.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for new flight
  const openCreateModal = () => {
    setEditingFlight(null);
    setFlightFormData({
      flightNumber: '',
      airline: '',
      source: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      price: '',
      totalSeats: '',
    });
    setIsFlightModalOpen(true);
  };

  // Open modal for editing flight
  const openEditModal = (flight) => {
    setEditingFlight(flight);
    // Format dates to datetime-local string (YYYY-MM-DDTHH:mm)
    const toInputDate = (d) => new Date(d).toISOString().slice(0, 16);
    setFlightFormData({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      source: flight.source,
      destination: flight.destination,
      departureTime: toInputDate(flight.departureTime),
      arrivalTime: toInputDate(flight.arrivalTime),
      price: flight.price,
      totalSeats: flight.totalSeats,
    });
    setIsFlightModalOpen(true);
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        ...flightFormData,
        price: Number(flightFormData.price),
        totalSeats: Number(flightFormData.totalSeats),
      };

      if (editingFlight) {
        // Update flight
        const res = await API.put(`/flights/${editingFlight._id}`, payload);
        if (res.data?.success) {
          setSuccessMsg(`Flight ${payload.flightNumber} updated successfully`);
          setIsFlightModalOpen(false);
          fetchData();
        }
      } else {
        // Create flight
        const res = await API.post('/flights', payload);
        if (res.data?.success) {
          setSuccessMsg(`Flight ${payload.flightNumber} created successfully`);
          setIsFlightModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving flight');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteFlight = async (flightId, flightNumber) => {
    if (!window.confirm(`Are you sure you want to delete flight ${flightNumber}?`)) return;

    setError('');
    setSuccessMsg('');

    try {
      const res = await API.delete(`/flights/${flightId}`);
      if (res.data?.success) {
        setSuccessMsg(`Flight ${flightNumber} deleted successfully`);
        setFlights((prev) => prev.filter((f) => f._id !== flightId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete flight');
    }
  };

  if (loading) return <FullPageLoader text="Loading administration console..." />;

  // Calculate Metrics
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <div className="main-content">
      <div className="container">
        {/* Admin Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                ADMINISTRATOR PANEL
              </span>
            </div>
            <h1 style={{ fontSize: '2rem' }}>Flight & Booking Control Center</h1>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} /> Schedule New Flight
          </button>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Scheduled Flights</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.25rem 0' }}>
              {flights.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Airways in catalog</span>
          </div>

          <div className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confirmed Bookings</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {activeBookingsCount}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              Out of {bookings.length} total orders
            </span>
          </div>

          <div className="card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Revenue Processed</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f766e', margin: '0.25rem 0' }}>
              ${totalRevenue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>From confirmed tickets</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid var(--border)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('flights')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              color: activeTab === 'flights' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'flights' ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Plane size={18} /> Flights Catalog ({flights.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'bookings' ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Ticket size={18} /> Global System Bookings ({bookings.length})
          </button>
        </div>

        {/* Tab 1: Flights Table */}
        {activeTab === 'flights' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Flight No.</th>
                    <th>Airline</th>
                    <th>Route</th>
                    <th>Departure / Arrival</th>
                    <th>Price</th>
                    <th>Seats (Avail / Total)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((f) => (
                    <tr key={f._id}>
                      <td style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{f.flightNumber}</td>
                      <td>{f.airline}</td>
                      <td>
                        <strong>{f.source}</strong> &rarr; <strong>{f.destination}</strong>
                      </td>
                      <td>
                        <div>{new Date(f.departureTime).toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          arr: {new Date(f.arrivalTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${f.price}</td>
                      <td>
                        <span
                          className={`badge ${
                            f.availableSeats <= 5 ? 'badge-danger' : 'badge-success'
                          }`}
                        >
                          {f.availableSeats} / {f.totalSeats}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditModal(f)}
                            className="btn btn-secondary btn-sm"
                            title="Edit flight"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteFlight(f._id, f.flightNumber)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete flight"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Global Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Passenger / User</th>
                    <th>Flight Route</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                        {b.pnr}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.user?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                      </td>
                      <td>
                        <div>
                          {b.flight?.airline} ({b.flight?.flightNumber})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {b.flight?.source} &rarr; {b.flight?.destination}
                        </div>
                      </td>
                      <td>{b.seatsBooked} Seat(s)</td>
                      <td style={{ fontWeight: 700 }}>${b.totalAmount}</td>
                      <td>
                        {b.status === 'CONFIRMED' ? (
                          <span className="badge badge-success">Confirmed</span>
                        ) : (
                          <span className="badge badge-danger">Cancelled</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(b.bookingDate || b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit Flight Modal */}
        {isFlightModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingFlight ? `Edit Flight ${editingFlight.flightNumber}` : 'Create New Scheduled Flight'}</h3>
                <button
                  onClick={() => setIsFlightModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleFlightSubmit}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Flight Number *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. AI-202"
                        value={flightFormData.flightNumber}
                        onChange={(e) =>
                          setFlightFormData({ ...flightFormData, flightNumber: e.target.value.toUpperCase() })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Airline Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Air India"
                        value={flightFormData.airline}
                        onChange={(e) => setFlightFormData({ ...flightFormData, airline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Origin City / Code *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. DEL"
                        value={flightFormData.source}
                        onChange={(e) =>
                          setFlightFormData({ ...flightFormData, source: e.target.value.toUpperCase() })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Destination City / Code *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. BOM"
                        value={flightFormData.destination}
                        onChange={(e) =>
                          setFlightFormData({ ...flightFormData, destination: e.target.value.toUpperCase() })
                        }
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Departure Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        className="form-control"
                        value={flightFormData.departureTime}
                        onChange={(e) =>
                          setFlightFormData({ ...flightFormData, departureTime: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Arrival Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        className="form-control"
                        value={flightFormData.arrivalTime}
                        onChange={(e) =>
                          setFlightFormData({ ...flightFormData, arrivalTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Price per Seat ($) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control"
                        placeholder="e.g. 150"
                        value={flightFormData.price}
                        onChange={(e) => setFlightFormData({ ...flightFormData, price: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Seats Capacity *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control"
                        placeholder="e.g. 180"
                        value={flightFormData.totalSeats}
                        onChange={(e) =>
                          setFlightFormData({ ...flightFormData, totalSeats: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsFlightModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={modalSubmitting} className="btn btn-primary">
                    {modalSubmitting ? (
                      <>
                        <Spinner size="sm" light /> Saving Flight...
                      </>
                    ) : (
                      <>{editingFlight ? 'Save Changes' : 'Create Flight'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
