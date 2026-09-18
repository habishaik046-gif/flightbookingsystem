const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: [true, 'Please provide a flight number'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    airline: {
      type: String,
      required: [true, 'Please provide the airline name'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Please provide origin source city or airport code'],
      uppercase: true,
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please provide destination city or airport code'],
      uppercase: true,
      trim: true,
    },
    departureTime: {
      type: Date,
      required: [true, 'Please provide the departure date and time'],
    },
    arrivalTime: {
      type: Date,
      required: [true, 'Please provide the arrival date and time'],
      validate: {
        validator: function (value) {
          return this.departureTime ? value > this.departureTime : true;
        },
        message: 'Arrival time must be after departure time',
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide ticket price per seat'],
      min: [0, 'Price cannot be negative'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please specify total seats on this flight'],
      min: [1, 'Flight must have at least 1 seat'],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Please specify available seats'],
      min: [0, 'Available seats cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to optimize flight searching by route and date
flightSchema.index({ source: 1, destination: 1, departureTime: 1 });

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
