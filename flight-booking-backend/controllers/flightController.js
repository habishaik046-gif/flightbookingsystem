const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

/**
 * @desc    Search and get all flights with optional query filters (source, destination, date)
 * @route   GET /api/flights
 * @access  Public
 */
const getFlights = async (req, res, next) => {
  try {
    const { source, destination, date, airline, minPrice, maxPrice } = req.query;
    const query = {};

    // Source matching (case-insensitive substring or exact match)
    if (source) {
      query.source = { $regex: new RegExp(`^${source.trim()}$`, 'i') };
    }

    // Destination matching (case-insensitive substring or exact match)
    if (destination) {
      query.destination = { $regex: new RegExp(`^${destination.trim()}$`, 'i') };
    }

    // Airline matching
    if (airline) {
      query.airline = { $regex: new RegExp(airline.trim(), 'i') };
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Date filtering (e.g. 2026-09-20 or full ISO string)
    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(searchDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        query.departureTime = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    const flights = await Flight.find(query).sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      flights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single flight details by ID
 * @route   GET /api/flights/:id
 * @access  Public
 */
const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      flight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new flight
 * @route   POST /api/flights
 * @access  Private/Admin
 */
const createFlight = async (req, res, next) => {
  try {
    const {
      flightNumber,
      airline,
      source,
      destination,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      availableSeats,
    } = req.body;

    if (
      !flightNumber ||
      !airline ||
      !source ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      price === undefined ||
      totalSeats === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required flight fields: flightNumber, airline, source, destination, departureTime, arrivalTime, price, totalSeats',
      });
    }

    const existingFlight = await Flight.findOne({
      flightNumber: flightNumber.trim().toUpperCase(),
    });

    if (existingFlight) {
      return res.status(400).json({
        success: false,
        message: `Flight with number ${flightNumber.toUpperCase()} already exists`,
      });
    }

    const flight = await Flight.create({
      flightNumber: flightNumber.trim().toUpperCase(),
      airline: airline.trim(),
      source: source.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      price: Number(price),
      totalSeats: Number(totalSeats),
      availableSeats:
        availableSeats !== undefined ? Number(availableSeats) : Number(totalSeats),
    });

    res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      flight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update flight details
 * @route   PUT /api/flights/:id
 * @access  Private/Admin
 */
const updateFlight = async (req, res, next) => {
  try {
    let flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with id ${req.params.id}`,
      });
    }

    const updates = { ...req.body };

    // Standardize text fields if present
    if (updates.flightNumber) updates.flightNumber = updates.flightNumber.trim().toUpperCase();
    if (updates.source) updates.source = updates.source.trim().toUpperCase();
    if (updates.destination) updates.destination = updates.destination.trim().toUpperCase();

    // If totalSeats is updated, ensure availableSeats does not exceed new totalSeats
    if (updates.totalSeats !== undefined) {
      const newTotal = Number(updates.totalSeats);
      const currentlyBooked = flight.totalSeats - flight.availableSeats;

      if (newTotal < currentlyBooked) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total seats to ${newTotal}. There are already ${currentlyBooked} seats booked on this flight.`,
        });
      }

      if (updates.availableSeats === undefined) {
        updates.availableSeats = newTotal - currentlyBooked;
      }
    }

    flight = await Flight.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Flight updated successfully',
      flight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a flight
 * @route   DELETE /api/flights/:id
 * @access  Private/Admin
 */
const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with id ${req.params.id}`,
      });
    }

    // Check for active bookings on this flight
    const activeBookings = await Booking.countDocuments({
      flight: req.params.id,
      status: 'CONFIRMED',
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete flight. There are ${activeBookings} active confirmed booking(s) associated with this flight.`,
      });
    }

    await flight.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Flight deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
};
