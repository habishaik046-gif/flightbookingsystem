# Flight Booking System - Backend API

Production-ready backend for a Flight Booking System built using **Node.js**, **Express.js**, and **MongoDB (Mongoose)** with JWT Authentication, Role-Based Access Control (RBAC), and Atomic Seat Management.

---

## Features

- **User Authentication**: Register & Login with encrypted passwords (bcryptjs).
- **JWT Authorization**: Token-based authentication with expiration.
- **Role-Based Access Control (RBAC)**: Separate permissions for `user` and `admin`.
- **Flight Management (Admin)**: Full CRUD operations on flights (Create, Read, Update, Delete).
- **Flight Search & Filter**: Search by `source`, `destination`, `date`, `airline`, and price range.
- **Seat Availability Management**: Concurrency-safe, atomic seat decrement on booking and seat restoration on cancellation.
- **Unique PNR Generation**: Generates 6-character unique alphanumeric PNR codes.
- **Booking Management**:
  - Users can view their own booking history.
  - Users can cancel their bookings.
  - Search booking by PNR.
  - Admins can monitor and view all system bookings with user and flight population.
- **Centralized Error Handling**: Detailed validation errors, duplicate key handler, and 404 handler.
- **CORS & Environment Configurations**: Ready to plug into React frontends.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Auth**: JSON Web Tokens (jsonwebtoken) & bcryptjs
- **Environment**: dotenv
- **Cross-Origin**: cors

---

## Directory Structure

```text
flight-booking-backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # User registration, login, profile
│   ├── flightController.js   # Flight search, CRUD APIs
│   └── bookingController.js  # Bookings, cancellation, PNR generation
├── middleware/
│   ├── authMiddleware.js     # JWT verification & role authorization
│   └── errorMiddleware.js    # 404 & Centralized error handler
├── models/
│   ├── Booking.js            # Booking schema (PNR, seats, passengers)
│   ├── Flight.js             # Flight schema (availability, routes, pricing)
│   └── User.js               # User schema (roles, bcrypt hooks)
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── flightRoutes.js       # /api/flights
│   └── bookingRoutes.js      # /api/bookings
├── .env                      # Local configuration
├── .env.example              # Configuration template
├── package.json              # Dependencies and scripts
├── seed.js                   # Database seed script
└── server.js                 # Application entry point
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Installation

```bash
cd flight-booking-backend
npm install
```

### 3. Environment Configuration

Check `.env` file (or copy `.env.example` to `.env`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/flight_booking_db
JWT_SECRET=supersecretjwtkey_flightbooking_2026_change_in_production
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Seed Initial Data (Optional, Recommended)

Populates sample admin, users, and flights:

```bash
npm run seed
```

Default credentials:
- **Admin**: `admin@flightbooking.com` / `AdminPassword123!`
- **User**: `john@example.com` / `UserPassword123!`

### 5. Run the Server

Development mode with nodemon:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Base URL:
```text
http://localhost:5000/api
```

---

## API Endpoints Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user or admin (`{ name, email, password, role }`) |
| `POST` | `/api/auth/login` | Public | Log in user (`{ email, password }`) |
| `GET` | `/api/auth/profile` | Private | Get currently authenticated user's profile |

### 2. Flights (`/api/flights`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/flights` | Public | Search flights by `source`, `destination`, `date`, `airline`, `minPrice`, `maxPrice` |
| `GET` | `/api/flights/:id` | Public | Get single flight details |
| `POST` | `/api/flights` | Private (Admin) | Create a new flight |
| `PUT` | `/api/flights/:id` | Private (Admin) | Update flight details |
| `DELETE` | `/api/flights/:id` | Private (Admin) | Delete a flight (blocked if active bookings exist) |

### 3. Bookings (`/api/bookings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private (User) | Book seats (`{ flightId, passengers: [{ name, age, gender, seatNumber }] }`) |
| `GET` | `/api/bookings/my-bookings` | Private (User) | View logged-in user's bookings |
| `GET` | `/api/bookings/pnr/:pnr` | Private (User/Admin) | Look up booking details by PNR |
| `PUT` | `/api/bookings/:id/cancel` | Private (User/Admin) | Cancel booking & restore flight seats |
| `GET` | `/api/bookings/admin/all` | Private (Admin) | View all system bookings |

---

## Connecting with React Frontend

In your React project (e.g., `axios` or `fetch`):

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```
