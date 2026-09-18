const express = require('express');
const router = express.Router();
const {
  getFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getFlights);
router.get('/:id', getFlightById);

// Admin-only routes
router.post('/', protect, adminOnly, createFlight);
router.put('/:id', protect, adminOnly, updateFlight);
router.delete('/:id', protect, adminOnly, deleteFlight);

module.exports = router;
