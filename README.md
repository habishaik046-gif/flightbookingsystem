# SkyWings - Flight Booking System

A full-stack, production-ready **Flight Booking System** built with **Node.js, Express.js, MongoDB (Mongoose)** for the backend and **React.js + Vite** for the frontend.

---

## ✈️ System Overview

- **Backend**: RESTful API with JWT authentication, bcrypt password encryption, role-based access control (User/Admin), atomic seat availability management, 6-character cryptographic PNR generation, and flight CRUD.
- **Frontend**: Responsive React 18 + Vite single-page application with real-time flight search, multi-passenger booking engine, boarding pass views, cancellation workflow, PNR tracking, and an admin management console.

---

## 📁 Repository Structure

```text
flightbookingsystem/
├── flight-booking-backend/       # Node.js + Express + MongoDB REST API
│   ├── config/                   # Database connection (Mongoose)
│   ├── controllers/              # Auth, Flight, and Booking controllers
│   ├── middleware/               # JWT Protect, Admin RBAC, Error Handler
│   ├── models/                   # User, Flight, and Booking schemas
│   ├── routes/                   # /api/auth, /api/flights, /api/bookings
│   ├── seed.js                   # Database seeder with sample data
│   ├── server.js                 # Express app entry point
│   └── package.json
│
├── flight-booking-frontend/      # React.js + Vite Web Application
│   ├── src/
│   │   ├── api/                  # Axios instance with JWT interceptors
│   │   ├── components/           # Navbar, Footer, Route Guards, Flight Cards
│   │   ├── context/              # AuthContext (login, register, session)
│   │   ├── pages/                # Home, Search, Book, MyBookings, PNR, Admin
│   │   └── styles/               # Modern CSS design system
│   ├── vite.config.js            # Vite config with backend proxy
│   └── package.json
│
└── README.md                     # Root project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas)

---

### 2. Backend Setup

```bash
cd flight-booking-backend
npm install

# Seed sample admin, users, and flights (optional)
npm run seed

# Run in development mode
npm run dev
```

*Backend runs on: `http://localhost:5000/api`*

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd flight-booking-frontend
npm install

# Run frontend development server
npm run dev
```

*Frontend runs on: `http://localhost:5173`*

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@flightbooking.com` | `AdminPassword123!` | Flight CRUD, View All Bookings, Admin Dashboard |
| **User** | `john@example.com` | `UserPassword123!` | Search Flights, Seat Booking, My Bookings, PNR Lookup |

---

## 🛠️ API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/profile` | Private | Get logged-in user details |
| `GET` | `/api/flights` | Public | Search flights by source, destination, date |
| `GET` | `/api/flights/:id` | Public | View flight schedule & seat inventory |
| `POST` | `/api/flights` | Admin | Create a new scheduled flight |
| `PUT` | `/api/flights/:id` | Admin | Update flight schedule or total seats |
| `DELETE` | `/api/flights/:id` | Admin | Remove flight (safeguarded against active bookings) |
| `POST` | `/api/bookings` | Private | Atomically reserve seats & generate unique PNR |
| `GET` | `/api/bookings/my-bookings` | Private | Retrieve user's booking history |
| `GET` | `/api/bookings/pnr/:pnr` | Private | Lookup reservation details by PNR |
| `PUT` | `/api/bookings/:id/cancel` | Private | Cancel ticket & restore flight seats |
| `GET` | `/api/bookings/admin/all` | Admin | View all bookings across system |
