# Backend Architecture Blueprint - Flight Booking System

Comprehensive architectural blueprint, data models, workflows, API contracts, and security mechanisms of the Flight Booking System backend.

---

## 1. High-Level Architectural Flow

```mermaid
flowchart TD
    subgraph Client["Client Tier"]
        C1["React Frontend (Vite)"]
        C2["Mobile Client / API Consumer"]
    end

    subgraph Network["Network & Entry Tier"]
        CORS["CORS Policy Engine"]
        Parser["Body Parsers (JSON / URL Encoded)"]
    end

    subgraph Middleware["Middleware Tier"]
        AuthMiddleware["JWT Authentication (protect)"]
        RBAC["Role-Based Access Control (adminOnly)"]
        ErrorHandler["Global Error & 404 Interceptor"]
    end

    subgraph Controllers["Controller Tier"]
        AuthController["Auth Controller"]
        FlightController["Flight Controller"]
        BookingController["Booking Controller"]
    end

    subgraph Models["Data Access Tier (Mongoose ODM)"]
        UserModel["User Model (bcrypt pre-save)"]
        FlightModel["Flight Model (Indexes & Limits)"]
        BookingModel["Booking Model (PNR & Embedded Passengers)"]
    end

    subgraph Database["Persistence Tier (MongoDB)"]
        DB_Users[("users collection")]
        DB_Flights[("flights collection")]
        DB_Bookings[("bookings collection")]
    end

    Client --> Network
    Network --> Middleware
    Middleware --> Controllers
    Controllers --> Models
    Models --> Database
    Database -.-> Models
    Models -.-> Controllers
    Controllers -.-> ErrorHandler
    ErrorHandler -.-> Client
```

---

## 2. Database Entity-Relationship (ER) Blueprint

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places"
    FLIGHT ||--o{ BOOKING : "contains"
    
    USER {
        ObjectId _id PK
        String name
        String email UK "Indexed, Lowercase"
        String password "Hashed (bcrypt)"
        String role "user | admin"
        Date createdAt
        Date updatedAt
    }

    FLIGHT {
        ObjectId _id PK
        String flightNumber UK "e.g. AI-202"
        String airline "Airline Company"
        String source "Compound Indexed"
        String destination "Compound Indexed"
        Date departureTime "Compound Indexed"
        Date arrivalTime
        Number price "Per Passenger"
        Number totalSeats
        Number availableSeats "Atomically Decremented"
        Date createdAt
        Date updatedAt
    }

    BOOKING {
        ObjectId _id PK
        String pnr UK "6-char Unique Code"
        ObjectId user FK "References USER"
        ObjectId flight FK "References FLIGHT"
        Array passengers "Embedded Subdocuments"
        Number seatsBooked
        Number totalAmount
        String status "CONFIRMED | CANCELLED"
        Date bookingDate
        Date createdAt
        Date updatedAt
    }
```

---

## 3. Core Operational Workflows

### 3.1. Atomic Flight Booking & Concurrency Protection

To prevent race conditions, double bookings, and seat over-allocation under concurrent traffic, the backend avoids reading and writing seats in two separate steps. Instead, it utilizes an atomic query condition:

```mermaid
sequenceDiagram
    autonumber
    actor Passenger as Customer (React)
    participant API as Booking Controller
    participant DB as MongoDB (Mongoose)

    Passenger->>API: POST /api/bookings { flightId, passengers: [...] }
    API->>API: Validate passenger counts and input details
    API->>DB: findOneAndUpdate({ _id: flightId, availableSeats: { $gte: count } }, { $inc: { availableSeats: -count } })
    
    alt Seats Not Available (or Flight Not Found)
        DB-->>API: null (Condition not met)
        API-->>Passenger: 400 Bad Request ("Requested X seats, but only Y remain")
    else Seats Successfully Reserved
        DB-->>API: updatedFlight document
        API->>API: Generate 6-Character Cryptographic PNR (crypto.randomBytes)
        API->>API: Calculate totalAmount = flight.price * seatsBooked
        API->>DB: Booking.create({ pnr, user, flight, passengers, ... })
        DB-->>API: Saved booking record
        API->>DB: Populate('flight', 'user')
        DB-->>API: Populated Document
        API-->>Passenger: 201 Created { success: true, booking, pnr }
    end
```

---

### 3.2. Booking Cancellation & Seat Restoration

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Admin
    participant API as Booking Controller
    participant DB as MongoDB (Mongoose)

    Customer->>API: PUT /api/bookings/:id/cancel
    API->>DB: Booking.findById(id)
    DB-->>API: booking
    API->>API: Verify Ownership (user._id === req.user._id OR role === 'admin')
    API->>API: Verify status !== 'CANCELLED'
    
    API->>DB: Booking.updateOne({ status: 'CANCELLED' })
    API->>DB: Flight.findByIdAndUpdate(flightId, { $inc: { availableSeats: +seatsBooked } })
    DB-->>API: Flight seats restored
    API-->>Customer: 200 OK ("Booking cancelled successfully. Seats have been restored.")
```

---

## 4. Complete API Contract & Routing Specifications

Base URL: `http://localhost:5000/api`

### 4.1 Authentication (`/api/auth`)

| Method | Endpoint | Access | Request Body | Success Response |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` | `201 Created` `{ success: true, token, user }` |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `200 OK` `{ success: true, token, user }` |
| `GET` | `/api/auth/profile` | Protected (User/Admin) | None (Bearer Token header) | `200 OK` `{ success: true, user }` |

### 4.2 Flight Management (`/api/flights`)

| Method | Endpoint | Access | Query / Request Body | Success Response |
|---|---|---|---|---|
| `GET` | `/api/flights` | Public | Query: `?source=DEL&destination=BOM&date=YYYY-MM-DD` | `200 OK` `{ success: true, count, flights: [...] }` |
| `GET` | `/api/flights/:id` | Public | None | `200 OK` `{ success: true, flight }` |
| `POST` | `/api/flights` | Admin Only | `{ flightNumber, airline, source, destination, departureTime, arrivalTime, price, totalSeats }` | `201 Created` `{ success: true, flight }` |
| `PUT` | `/api/flights/:id` | Admin Only | `{ price, totalSeats, departureTime, ... }` | `200 OK` `{ success: true, flight }` |
| `DELETE` | `/api/flights/:id` | Admin Only | None (Checks active bookings before delete) | `200 OK` `{ success: true, message }` |

### 4.3 Bookings Engine (`/api/bookings`)

| Method | Endpoint | Access | Request Body | Success Response |
|---|---|---|---|---|
| `POST` | `/api/bookings` | Protected (User) | `{ flightId, passengers: [{ name, age, gender, seatNumber }] }` | `201 Created` `{ success: true, booking }` |
| `GET` | `/api/bookings/my-bookings` | Protected (User) | None | `200 OK` `{ success: true, count, bookings: [...] }` |
| `GET` | `/api/bookings/pnr/:pnr` | Protected (User/Admin) | None (PNR in route parameter) | `200 OK` `{ success: true, booking }` |
| `PUT` | `/api/bookings/:id/cancel` | Protected (User/Admin) | None | `200 OK` `{ success: true, message, booking }` |
| `GET` | `/api/bookings/admin/all` | Admin Only | None | `200 OK` `{ success: true, count, bookings: [...] }` |

---

## 5. Security & Data Integrity Blueprint

1. **Authentication (JWT)**:
   - Secret signed using HMAC SHA-256 (`process.env.JWT_SECRET`).
   - Token payload: `{ id: user._id, role: user.role }`.
   - Lifespan: Default 30 days (`JWT_EXPIRES_IN=30d`).
2. **Password Security (bcryptjs)**:
   - Salts generated with 10 rounds before storing hash in MongoDB.
   - Plaintext passwords never stored or returned in serialized responses.
3. **Role-Based Access Control (RBAC)**:
   - Granular middleware `authorize('admin')` validates `req.user.role === 'admin'`.
   - Non-admin attempts return standard `403 Forbidden` JSON.
4. **Database Indexing**:
   - Compound index: `{ source: 1, destination: 1, departureTime: 1 }` on `Flight` collection for $O(\log N)$ route lookups.
   - Unique sparse index on `flightNumber` and `pnr`.
5. **Centralized Error Handling**:
   - Mongoose `CastError` translated to standard `404 Not Found`.
   - Duplicate key error (`code 11000`) translated to `400 Bad Request`.
   - Mongoose schema `ValidationError` mapped into clean human-readable validation messages.
