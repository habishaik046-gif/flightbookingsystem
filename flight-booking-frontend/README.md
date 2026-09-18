# SkyWings Flight Booking System - Frontend (React + Vite)

Modern, responsive web application for the Flight Booking System built with **React 18**, **Vite**, **React Router 6**, and **Axios**.

---

## Features

- **Modern & Responsive UI**: Clean typography (Plus Jakarta Sans), glassmorphic elements, flight timeline indicators, and mobile-friendly layouts.
- **Flight Search & Route Visualizer**: Search by origin, destination, and departure date with interactive city swap.
- **Dynamic Filters & Sorting**: Filter by airline, sort by price (low to high, high to low), sort by earliest departure, and toggle "Available Seats Only".
- **Real-Time Seat Availability**: Badges indicating live seat counts and low-seat warnings.
- **Multi-Passenger Booking Engine**: Add multiple passengers with individual name, age, gender, and seat preference. Automatic price calculation.
- **Unique PNR Generation & E-Ticket**: Instant 6-character PNR generation with boarding pass view and print support.
- **Booking Cancellation**: One-click cancellation with confirmation modal and dynamic seat restoration.
- **PNR Lookup**: Search any booking by PNR code to inspect ticket confirmation and passenger manifests.
- **Role-Based Protected Routes**:
  - Customer routes: `/dashboard`, `/my-bookings`, `/book/:id`
  - Admin-only routes: `/admin` (Flight CRUD + all system bookings)
- **JWT Session Persistence**: Automatic token injection in Axios requests, persistent session across reloads, and automatic cleanup on 401 unauthenticated errors.

---

## Directory Structure

```text
flight-booking-frontend/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── api/
│   │   └── axios.js               # Axios instance with JWT interceptors
│   ├── components/
│   │   ├── common/
│   │   │   ├── Alert.jsx          # Notification alerts
│   │   │   ├── Footer.jsx         # Footer component
│   │   │   ├── Loader.jsx         # Spinners and full page loaders
│   │   │   ├── Navbar.jsx         # Navigation bar with role links & mobile drawer
│   │   │   └── ProtectedRoute.jsx # Route guards for authenticated/admin users
│   │   └── flights/
│   │       ├── FlightCard.jsx     # Route timeline, seat badge, & price
│   │       └── FlightSearchForm.jsx # Origin, destination, date picker
│   ├── context/
│   │   └── AuthContext.jsx        # User state, JWT storage, login, register, logout
│   ├── pages/
│   │   ├── AdminDashboard.jsx     # Add/Edit/Delete flights & all bookings table
│   │   ├── BookFlight.jsx         # Multi-passenger form & ticket confirmation
│   │   ├── FlightDetails.jsx      # Timetable, route diagram, seat availability
│   │   ├── FlightResults.jsx      # Search results with airline filters & sorting
│   │   ├── Home.jsx               # Hero search & popular departures
│   │   ├── Login.jsx              # User/Admin sign in with demo accounts
│   │   ├── MyBookings.jsx         # Boarding pass list with cancellation modal
│   │   ├── NotFound.jsx           # 404 page
│   │   ├── PNRLookup.jsx          # Search and print ticket by PNR
│   │   ├── Register.jsx           # User registration
│   │   └── UserDashboard.jsx      # Personal booking statistics & trip history
│   ├── styles/
│   │   └── index.css              # Modern design system
│   ├── App.jsx                    # Routing configuration
│   └── main.jsx                   # React DOM entry point
└── public/
    └── plane.svg                  # Favicon
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd flight-booking-frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will run at:
```text
http://localhost:5173
```

### 3. Build for Production

```bash
npm run build
```

---

## Demo Credentials

You can use the pre-configured buttons on the Login page or enter:

- **Admin Account**:
  - Email: `admin@flightbooking.com`
  - Password: `AdminPassword123!`
- **User Account**:
  - Email: `john@example.com`
  - Password: `UserPassword123!`
