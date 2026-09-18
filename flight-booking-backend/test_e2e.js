// test_e2e.js - Complete end-to-end integration test of the Flight Booking System
const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: headers,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING FLIGHT BOOKING E2E INTEGRATION TESTS ---\n');

  try {
    // 1. Health check
    console.log('[Test 1] Health Check...');
    const health = await request('GET', '/api/health');
    console.log(`Status: ${health.status}, Message: ${health.data.message}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. User Registration
    console.log('\n[Test 2] Register New User...');
    const regEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Alice Wonder',
      email: regEmail,
      password: 'SecurePassword123!',
      role: 'user',
    });
    console.log(`Status: ${regRes.status}, User ID: ${regRes.data.user?._id}`);
    if (regRes.status !== 201 || !regRes.data.token) throw new Error('User registration failed');
    const userToken = regRes.data.token;

    // 3. User Login
    console.log('\n[Test 3] User Login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: regEmail,
      password: 'SecurePassword123!',
    });
    console.log(`Status: ${loginRes.status}, Name: ${loginRes.data.user?.name}`);
    if (loginRes.status !== 200) throw new Error('User login failed');

    // 4. Admin Login (from seeded database)
    console.log('\n[Test 4] Admin Login...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@flightbooking.com',
      password: 'AdminPassword123!',
    });
    console.log(`Status: ${adminLogin.status}, Role: ${adminLogin.data.user?.role}`);
    if (adminLogin.status !== 200 || adminLogin.data.user?.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLogin.data.token;

    // 5. Admin creates a flight with limited seats (e.g. 5 seats) to test seat availability
    console.log('\n[Test 5] Admin Create Flight...');
    const flightNum = `FL-${Math.floor(100 + Math.random() * 900)}`;
    const createFlightRes = await request(
      'POST',
      '/api/flights',
      {
        flightNumber: flightNum,
        airline: 'Aero Test Lines',
        source: 'SFO',
        destination: 'NRT',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 36000000).toISOString(),
        price: 850,
        totalSeats: 5,
        availableSeats: 5,
      },
      adminToken
    );
    console.log(`Status: ${createFlightRes.status}, Flight Number: ${createFlightRes.data.flight?.flightNumber}`);
    if (createFlightRes.status !== 201) throw new Error('Flight creation failed');
    const testFlight = createFlightRes.data.flight;

    // 6. Search flights by source and destination
    console.log('\n[Test 6] Search Flights by Route (SFO to NRT)...');
    const searchRes = await request('GET', '/api/flights?source=sfo&destination=nrt');
    console.log(`Status: ${searchRes.status}, Found: ${searchRes.data.count} flight(s)`);
    if (searchRes.status !== 200 || searchRes.data.count === 0) throw new Error('Flight search failed');

    // 7. Book 2 seats on the flight
    console.log('\n[Test 7] Book 2 Seats on Flight...');
    const bookingRes = await request(
      'POST',
      '/api/bookings',
      {
        flightId: testFlight._id,
        passengers: [
          { name: 'Alice Wonder', age: 28, gender: 'Female', seatNumber: '1A' },
          { name: 'Bob Wonder', age: 30, gender: 'Male', seatNumber: '1B' },
        ],
      },
      userToken
    );
    console.log(
      `Status: ${bookingRes.status}, PNR: ${bookingRes.data.booking?.pnr}, Total Amount: $${bookingRes.data.booking?.totalAmount}`
    );
    if (bookingRes.status !== 201 || !bookingRes.data.booking?.pnr) throw new Error('Booking failed');
    const booking = bookingRes.data.booking;

    // 8. Verify seat availability decreased from 5 to 3
    console.log('\n[Test 8] Check Seat Availability Decreased...');
    const checkFlight = await request('GET', `/api/flights/${testFlight._id}`);
    console.log(`Available Seats remaining: ${checkFlight.data.flight.availableSeats} (Expected: 3)`);
    if (checkFlight.data.flight.availableSeats !== 3) throw new Error('Seat decrement mismatch');

    // 9. Attempt overbooking (request 4 seats when only 3 are available)
    console.log('\n[Test 9] Test Overbooking Prevention (Request 4 seats when 3 available)...');
    const overbookRes = await request(
      'POST',
      '/api/bookings',
      {
        flightId: testFlight._id,
        passengers: [
          { name: 'P1', age: 20, gender: 'Male' },
          { name: 'P2', age: 21, gender: 'Female' },
          { name: 'P3', age: 22, gender: 'Male' },
          { name: 'P4', age: 23, gender: 'Female' },
        ],
      },
      userToken
    );
    console.log(`Status: ${overbookRes.status}, Expected 400. Message: "${overbookRes.data.message}"`);
    if (overbookRes.status !== 400) throw new Error('Overbooking should have been prevented');

    // 10. User gets their own bookings
    console.log('\n[Test 10] View My Bookings...');
    const myBookings = await request('GET', '/api/bookings/my-bookings', null, userToken);
    console.log(`Status: ${myBookings.status}, Count: ${myBookings.data.count}`);
    if (myBookings.status !== 200 || myBookings.data.count === 0) throw new Error('Failed to get user bookings');

    // 11. Lookup booking by PNR
    console.log(`\n[Test 11] Lookup Booking by PNR (${booking.pnr})...`);
    const pnrLookup = await request('GET', `/api/bookings/pnr/${booking.pnr}`, null, userToken);
    console.log(`Status: ${pnrLookup.status}, Status: ${pnrLookup.data.booking?.status}`);
    if (pnrLookup.status !== 200) throw new Error('PNR lookup failed');

    // 12. Cancel booking and verify seat restoration
    console.log('\n[Test 12] Cancel Booking & Restore Seats...');
    const cancelRes = await request('PUT', `/api/bookings/${booking._id}/cancel`, null, userToken);
    console.log(`Status: ${cancelRes.status}, Message: "${cancelRes.data.message}"`);
    if (cancelRes.status !== 200 || cancelRes.data.booking?.status !== 'CANCELLED') {
      throw new Error('Booking cancellation failed');
    }

    const checkRestoredFlight = await request('GET', `/api/flights/${testFlight._id}`);
    console.log(`Available Seats after cancellation: ${checkRestoredFlight.data.flight.availableSeats} (Expected: 5)`);
    if (checkRestoredFlight.data.flight.availableSeats !== 5) throw new Error('Seats were not restored properly');

    // 13. Admin views all bookings
    console.log('\n[Test 13] Admin View All Bookings...');
    const allBookings = await request('GET', '/api/bookings/admin/all', null, adminToken);
    console.log(`Status: ${allBookings.status}, Total System Bookings: ${allBookings.data.count}`);
    if (allBookings.status !== 200) throw new Error('Admin view all bookings failed');

    // 14. RBAC Check: Regular user blocked from admin endpoints
    console.log('\n[Test 14] RBAC Verification: Regular user blocked from Admin endpoint...');
    const rbacTest = await request('GET', '/api/bookings/admin/all', null, userToken);
    console.log(`Status: ${rbacTest.status} (Expected 403 Forbidden). Message: "${rbacTest.data.message}"`);
    if (rbacTest.status !== 403) throw new Error('RBAC authorization failed to block regular user');

    console.log('\n======================================================');
    console.log(' ALL 14 E2E INTEGRATION TESTS PASSED SUCCESSFULLY! ');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
