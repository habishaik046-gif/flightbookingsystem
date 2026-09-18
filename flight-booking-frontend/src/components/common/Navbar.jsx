import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plane, User, LogOut, ShieldAlert, Ticket, Menu, X, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div
            style={{
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              padding: '8px',
              borderRadius: '12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plane size={22} />
          </div>
          <span>SkyWings</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <NavLink to="/flights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Search Flights
          </NavLink>
          <NavLink to="/pnr" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Check PNR
          </NavLink>

          {user ? (
            <>
              <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Bookings
              </NavLink>

              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{
                    color: '#9333ea',
                    fontWeight: 700,
                  }}
                >
                  Admin Console
                </NavLink>
              )}

              {/* User Pill & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <div className="user-badge">
                  <User size={15} color="var(--primary)" />
                  <span>{user.name}</span>
                  {isAdmin && (
                    <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Log out"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          className="mobile-toggle"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border)',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link to="/flights" className="nav-link" onClick={closeMenu}>
            Search Flights
          </Link>
          <Link to="/pnr" className="nav-link" onClick={closeMenu}>
            Check PNR
          </Link>

          {user ? (
            <>
              <Link to="/my-bookings" className="nav-link" onClick={closeMenu}>
                My Bookings
              </Link>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link" onClick={closeMenu} style={{ color: '#7e22ce' }}>
                  Admin Console
                </Link>
              )}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
                  Signed in as {user.name} ({user.role})
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
