// verify_syntax.js - Checks that all modules, models, controllers, and routes load cleanly
try {
  console.log('Testing modules...');
  require('dotenv').config();
  
  const User = require('./models/User');
  console.log('✔ User model loaded successfully');
  
  const Flight = require('./models/Flight');
  console.log('✔ Flight model loaded successfully');
  
  const Booking = require('./models/Booking');
  console.log('✔ Booking model loaded successfully');
  
  const authController = require('./controllers/authController');
  console.log('✔ authController loaded successfully');
  
  const flightController = require('./controllers/flightController');
  console.log('✔ flightController loaded successfully');
  
  const bookingController = require('./controllers/bookingController');
  console.log('✔ bookingController loaded successfully');
  
  const authMiddleware = require('./middleware/authMiddleware');
  console.log('✔ authMiddleware loaded successfully');
  
  const errorMiddleware = require('./middleware/errorMiddleware');
  console.log('✔ errorMiddleware loaded successfully');
  
  const authRoutes = require('./routes/authRoutes');
  console.log('✔ authRoutes loaded successfully');
  
  const flightRoutes = require('./routes/flightRoutes');
  console.log('✔ flightRoutes loaded successfully');
  
  const bookingRoutes = require('./routes/bookingRoutes');
  console.log('✔ bookingRoutes loaded successfully');

  console.log('\nAll backend modules, controllers, routes, and models compiled without error!');
} catch (error) {
  console.error('Module compilation error:', error);
  process.exit(1);
}
