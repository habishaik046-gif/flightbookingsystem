const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Passenger age is required'],
      min: [0, 'Age must be a positive number'],
    },
    gender: {
      type: String,
      required: [true, 'Passenger gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a valid gender (must be Male, Female, or Other)',
      },
    },
    seatNumber: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
      index: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: [true, 'Booking must be associated with a flight'],
    },
    passengers: {
      type: [passengerSchema],
      validate: {
        validator: function (passengers) {
          return Array.isArray(passengers) && passengers.length > 0;
        },
        message: 'At least one passenger must be provided',
      },
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Number of booked seats is required'],
      min: [1, 'Must book at least 1 seat'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total booking amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['CONFIRMED', 'CANCELLED'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'CONFIRMED',
      index: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
