const crypto = require('crypto');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

/**
 * Helper to generate a unique 6-character uppercase PNR string
 */
const generateUniquePNR = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like 0, O, 1, I
  let pnr = '';
  let isUnique = false;

  while (!isUnique) {
    pnr = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      pnr += chars[bytes[i] % chars.length];
    }

    const existing = await Booking.findOne({ pnr });
    if (!existing) {
      isUnique = true;
    }
  }

  return pnr;
};

/**
 * @desc    Book flight tickets
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { flightId, passengers } = req.body;

    if (!flightId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide flightId',
      });
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one passenger details',
      });
    }

    const seatsRequested = passengers.length;

    // First check if flight exists
    const existingFlight = await Flight.findById(flightId);
    if (!existingFlight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with id ${flightId}`,
      });
    }

    // Atomically decrement seats if enough are available (prevents race conditions)
    const updatedFlight = await Flight.findOneAndUpdate(
      {
        _id: flightId,
        availableSeats: { $gte: seatsRequested },
      },
      {
        $inc: { availableSeats: -seatsRequested },
      },
      { new: true }
    );

    if (!updatedFlight) {
      return res.status(400).json({
        success: false,
        message: `Booking failed. Requested ${seatsRequested} seat(s), but only ${existingFlight.availableSeats} seat(s) remain available.`,
        availableSeats: existingFlight.availableSeats,
      });
    }

    // Generate unique PNR
    const pnr = await generateUniquePNR();
    const totalAmount = updatedFlight.price * seatsRequested;

    // Create booking record
    const booking = await Booking.create({
      pnr,
      user: req.user._id,
      flight: updatedFlight._id,
      passengers,
      seatsBooked: seatsRequested,
      totalAmount,
      status: 'CONFIRMED',
    });

    // Populate flight and user details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight', 'flightNumber airline source destination departureTime arrivalTime price')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Flight booked successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking and restore seat availability
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (User who owns booking or Admin)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with id ${req.params.id}`,
      });
    }

    // Ensure the booking belongs to the logged-in user, or the user is an admin
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled',
      });
    }

    // Update booking status
    booking.status = 'CANCELLED';
    await booking.save();

    // Increment seats back to the flight
    await Flight.findByIdAndUpdate(booking.flight, {
      $inc: { availableSeats: booking.seatsBooked },
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('flight', 'flightNumber airline source destination departureTime arrivalTime')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been restored.',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings of the logged-in user
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight', 'flightNumber airline source destination departureTime arrivalTime price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking details by PNR code
 * @route   GET /api/bookings/pnr/:pnr
 * @access  Private
 */
const getBookingByPNR = async (req, res, next) => {
  try {
    const { pnr } = req.params;

    const booking = await Booking.findOne({ pnr: pnr.trim().toUpperCase() })
      .populate('flight', 'flightNumber airline source destination departureTime arrivalTime price')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with PNR ${pnr.toUpperCase()} not found`,
      });
    }

    // Ensure only the owner or an admin can access
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings across system
 * @route   GET /api/bookings/admin/all
 * @access  Private/Admin
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('flight', 'flightNumber airline source destination departureTime arrivalTime price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getMyBookings,
  getBookingByPNR,
  getAllBookings,
};
