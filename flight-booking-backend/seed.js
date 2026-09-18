const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Flight = require('./models/Flight');
const Booking = require('./models/Booking');

dotenv.config();

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@flightbooking.com',
    password: 'AdminPassword123!',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'UserPassword123!',
    role: 'user',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'UserPassword123!',
    role: 'user',
  },
];

const sampleFlights = [
  {
    flightNumber: 'AI-101',
    airline: 'Air India',
    source: 'DEL',
    destination: 'BOM',
    departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    arrivalTime: new Date(Date.now() + 26 * 60 * 60 * 1000),   // Tomorrow + 2 hrs
    price: 120,
    totalSeats: 180,
    availableSeats: 180,
  },
  {
    flightNumber: '6E-505',
    airline: 'IndiGo',
    source: 'DEL',
    destination: 'BLR',
    departureTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + 33 * 60 * 60 * 1000),
    price: 95,
    totalSeats: 150,
    availableSeats: 150,
  },
  {
    flightNumber: 'EK-202',
    airline: 'Emirates',
    source: 'JFK',
    destination: 'DXB',
    departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + 61 * 60 * 60 * 1000),
    price: 750,
    totalSeats: 300,
    availableSeats: 300,
  },
  {
    flightNumber: 'BA-178',
    airline: 'British Airways',
    source: 'LHR',
    destination: 'JFK',
    departureTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + 80 * 60 * 60 * 1000),
    price: 620,
    totalSeats: 250,
    availableSeats: 250,
  },
  {
    flightNumber: 'SQ-402',
    airline: 'Singapore Airlines',
    source: 'SIN',
    destination: 'SYD',
    departureTime: new Date(Date.now() + 96 * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + 104 * 60 * 60 * 1000),
    price: 520,
    totalSeats: 220,
    availableSeats: 220,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Connected to MongoDB');

    // Clean existing data
    await User.deleteMany();
    await Flight.deleteMany();
    await Booking.deleteMany();
    console.log('[Seeder] Cleared previous database collections');

    // Seed users (using User.create so pre-save bcrypt hook executes)
    for (const u of sampleUsers) {
      await User.create(u);
    }
    console.log(`[Seeder] Seeded ${sampleUsers.length} users`);

    // Seed flights
    await Flight.insertMany(sampleFlights);
    console.log(`[Seeder] Seeded ${sampleFlights.length} flights`);

    console.log('\n--- Sample Accounts Created ---');
    console.log('Admin: admin@flightbooking.com | Password: AdminPassword123!');
    console.log('User:  john@example.com         | Password: UserPassword123!');
    console.log('------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
