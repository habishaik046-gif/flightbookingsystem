const express = require('express');
const router = express.Router();
const {
  createBooking,
  cancelBooking,
  getMyBookings,
  getBookingByPNR,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User booking routes (protected)
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/pnr/:pnr', protect, getBookingByPNR);
router.put('/:id/cancel', protect, cancelBooking);

// Admin booking routes (protected & admin-only)
router.get('/admin/all', protect, adminOnly, getAllBookings);

module.exports = router;
