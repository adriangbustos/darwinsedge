// ============================================
// DARWIN'S EDGE - Express Backend Server
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// ROOM PRICING - SERVER-SIDE SOURCE OF TRUTH
// ============================================
const ROOM_PRICING = {
  'lodge-suites': {
    pricePerNight: 1150,
    name: 'The Lodge Suites',
  },
  'scalesia-bungalows': {
    pricePerNight: 1850,
    name: 'Scalesia Bungalows',
  },
  'aqua-villas': {
    pricePerNight: 3200,
    name: 'Aqua Villas',
  },
};

// ============================================
// HIGH SEASON PRICING - 20% increase
// ============================================
const HIGH_SEASON_MULTIPLIER = 1.20;

/**
 * Check if a date falls within high season
 * High seasons:
 * - July (entire month)
 * - August (entire month)
 * - Dec 15 - Jan 10 (Christmas/New Year)
 * - March 15 - April 15 (Easter)
 */
function isHighSeason(date) {
  const d = new Date(date);
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();
  
  // July (month 6) or August (month 7)
  if (month === 6 || month === 7) {
    return true;
  }
  
  // Dec 15 - Dec 31 (month 11)
  if (month === 11 && day >= 15) {
    return true;
  }
  
  // Jan 1 - Jan 10 (month 0)
  if (month === 0 && day <= 10) {
    return true;
  }
  
  // March 15 - March 31 (month 2)
  if (month === 2 && day >= 15) {
    return true;
  }
  
  // April 1 - April 15 (month 3)
  if (month === 3 && day <= 15) {
    return true;
  }
  
  return false;
}

/**
 * Calculate total price with dynamic seasonal pricing
 * Returns total price accounting for high/low season per night
 */
function calculateTotalPrice(checkIn, checkOut, basePricePerNight) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let totalPrice = 0;
  let currentDate = new Date(start);
  
  // Iterate through each night
  while (currentDate < end) {
    const nightPrice = isHighSeason(currentDate) 
      ? Math.round(basePricePerNight * HIGH_SEASON_MULTIPLIER)
      : basePricePerNight;
    totalPrice += nightPrice;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return totalPrice;
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8080',
    'http://localhost:8081',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// JSON parsing for all routes except webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
}

function validateBookingDates(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (checkInDate < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }

  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out must be after check-in' };
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1) {
    return { valid: false, error: 'Minimum stay is 1 night' };
  }

  if (nights > 30) {
    return { valid: false, error: 'Maximum stay is 30 nights' };
  }

  return { valid: true, nights };
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Calculate price endpoint (for frontend to show dynamic pricing)
app.post('/api/calculate-price', (req, res) => {
  const { roomTier, checkIn, checkOut } = req.body;
  
  if (!roomTier || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const room = ROOM_PRICING[roomTier];
  if (!room) {
    return res.status(400).json({ error: 'Invalid room tier' });
  }
  
  const dateValidation = validateBookingDates(checkIn, checkOut);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }
  
  const nights = dateValidation.nights;
  const totalPrice = calculateTotalPrice(checkIn, checkOut, room.pricePerNight);
  const hasHighSeasonNights = (() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    let currentDate = new Date(start);
    while (currentDate < end) {
      if (isHighSeason(currentDate)) return true;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  })();
  
  res.json({
    roomTier,
    roomName: room.name,
    basePricePerNight: room.pricePerNight,
    nights,
    totalPrice,
    hasHighSeasonNights,
    highSeasonMultiplier: HIGH_SEASON_MULTIPLIER,
  });
});

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  const { roomTier, checkIn, checkOut, guests, userId, userEmail, userName } = req.body;

  // Validate required fields
  if (!roomTier || !checkIn || !checkOut || !guests || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate room tier
  const room = ROOM_PRICING[roomTier];
  if (!room) {
    return res.status(400).json({ error: 'Invalid room tier' });
  }

  // Validate guests (max 4)
  if (guests < 1 || guests > 4) {
    return res.status(400).json({ error: 'Guests must be between 1 and 4' });
  }

  // Validate dates
  const dateValidation = validateBookingDates(checkIn, checkOut);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }

  const nights = dateValidation.nights;
  // Use dynamic pricing based on season
  const totalPrice = calculateTotalPrice(checkIn, checkOut, room.pricePerNight);
  const effectivePricePerNight = Math.round(totalPrice / nights); // Average for display

  try {
    // Create pending reservation in Firestore
    const reservationRef = db.collection('reservations').doc();
    const reservationData = {
      userId,
      userEmail,
      userName: userName || 'Guest',
      checkIn,
      checkOut,
      guests,
      roomTier,
      roomName: room.name,
      nights,
      basePricePerNight: room.pricePerNight,
      pricePerNight: effectivePricePerNight, // Effective average rate
      totalPrice,
      stripeSessionId: '', // Will be updated after session creation
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: room.name,
              description: `${nights} night${nights > 1 ? 's' : ''} • ${guests} guest${guests > 1 ? 's' : ''} • ${checkIn} to ${checkOut}`,
            },
            unit_amount: totalPrice * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/booking?canceled=true`,
      customer_email: userEmail,
      metadata: {
        reservationId: reservationRef.id,
        userId,
        roomTier,
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        totalPrice: String(totalPrice),
      },
    });

    // Update reservation with Stripe session ID
    reservationData.stripeSessionId = session.id;
    await reservationRef.set(reservationData);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Session (also updates reservation as fallback for webhook)
app.get('/api/verify-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    console.log('🔍 Verifying session:', req.params.sessionId);
    console.log('💳 Payment status:', session.payment_status);

    if (session.payment_status === 'paid') {
      // Find the reservation by session ID
      const reservationsSnapshot = await db
        .collection('reservations')
        .where('stripeSessionId', '==', req.params.sessionId)
        .limit(1)
        .get();

      if (!reservationsSnapshot.empty) {
        const reservationDoc = reservationsSnapshot.docs[0];
        const reservationData = reservationDoc.data();
        
        // If payment is completed but reservation isn't marked as completed, update it
        if (reservationData.paymentStatus !== 'completed') {
          console.log('🔄 Updating reservation status to completed:', reservationDoc.id);
          await reservationDoc.ref.update({
            paymentStatus: 'completed',
            updatedAt: new Date().toISOString(),
          });
        }
        
        res.json({
          verified: true,
          reservation: {
            id: reservationDoc.id,
            ...reservationData,
            paymentStatus: 'completed', // Return updated status
          },
        });
      } else {
        // No reservation found - try to create one from session metadata
        console.log('⚠️ No reservation found, creating from session metadata');
        const { reservationId, userId, roomTier, checkIn, checkOut, guests, nights, totalPrice } = session.metadata || {};
        
        if (reservationId && userId && roomTier) {
          const room = ROOM_PRICING[roomTier];
          const reservationRef = db.collection('reservations').doc(reservationId);
          
          const newReservation = {
            userId,
            userEmail: session.customer_email || '',
            userName: 'Guest',
            checkIn,
            checkOut,
            guests: parseInt(guests) || 1,
            roomTier,
            roomName: room?.name || roomTier,
            nights: parseInt(nights) || 1,
            pricePerNight: room?.pricePerNight || 0,
            totalPrice: parseInt(totalPrice) || 0,
            stripeSessionId: session.id,
            paymentStatus: 'completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await reservationRef.set(newReservation);
          console.log('✅ Created reservation from session:', reservationId);
          
          res.json({
            verified: true,
            reservation: {
              id: reservationId,
              ...newReservation,
            },
          });
        } else {
          res.json({ verified: true, message: 'Payment verified but reservation details incomplete' });
        }
      }
    } else {
      res.status(400).json({ error: 'Payment not completed', verified: false });
    }
  } catch (error) {
    console.error('❌ Error verifying session:', error);
    res.status(500).json({ error: error.message, verified: false });
  }
});

// Stripe Webhook
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  console.log('🔔 Webhook received');
  console.log('Signature:', sig?.substring(0, 50) + '...');
  console.log('Endpoint secret configured:', !!endpointSecret);

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('Make sure STRIPE_WEBHOOK_SECRET matches your stripe listen output');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📦 Event type:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Checkout session completed:', session.id);
      console.log('📋 Session metadata:', session.metadata);

      // Update reservation status in Firestore
      try {
        const { reservationId } = session.metadata || {};
        if (reservationId) {
          console.log('🔄 Updating reservation:', reservationId);
          const reservationRef = db.collection('reservations').doc(reservationId);
          const doc = await reservationRef.get();
          
          if (doc.exists) {
            await reservationRef.update({
              paymentStatus: 'completed',
              updatedAt: new Date().toISOString(),
            });
            console.log('✅ Reservation updated to completed:', reservationId);
          } else {
            console.error('❌ Reservation document not found:', reservationId);
            // Create the reservation if it doesn't exist
            const { userId, roomTier, checkIn, checkOut, guests, nights, totalPrice } = session.metadata || {};
            if (userId && roomTier) {
              const room = ROOM_PRICING[roomTier];
              await reservationRef.set({
                userId,
                userEmail: session.customer_email || '',
                userName: 'Guest',
                checkIn,
                checkOut,
                guests: parseInt(guests) || 1,
                roomTier,
                roomName: room?.name || roomTier,
                nights: parseInt(nights) || 1,
                pricePerNight: room?.pricePerNight || 0,
                totalPrice: parseInt(totalPrice) || 0,
                stripeSessionId: session.id,
                paymentStatus: 'completed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              console.log('✅ Reservation created from webhook:', reservationId);
            }
          }
        } else {
          console.error('❌ No reservationId in session metadata');
        }
      } catch (error) {
        console.error('❌ Error updating reservation:', error.message);
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      console.log('❌ Checkout session expired:', session.id);

      // Update reservation status
      try {
        const { reservationId } = session.metadata || {};
        if (reservationId) {
          await db.collection('reservations').doc(reservationId).update({
            paymentStatus: 'failed',
            updatedAt: new Date().toISOString(),
          });
          console.log('✅ Reservation marked as failed:', reservationId);
        }
      } catch (error) {
        console.error('❌ Error updating expired reservation:', error.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('❌ Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get user reservations
app.get('/api/reservations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeAll } = req.query; // ?includeAll=true for debugging
    
    console.log('📋 Fetching reservations for userId:', userId);
    
    // Simple query - filter completed status in code to avoid index requirement
    const reservationsSnapshot = await db
      .collection('reservations')
      .where('userId', '==', userId)
      .get();

    console.log('📊 Total documents found:', reservationsSnapshot.size);

    const allReservations = reservationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log('📊 Reservation statuses:', allReservations.map(r => ({ id: r.id, status: r.paymentStatus })));

    const reservations = allReservations
      .filter(r => includeAll === 'true' || r.paymentStatus === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('✅ Returning', reservations.length, 'reservations');
    res.json({ reservations });
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check all reservations
app.get('/api/debug/reservations', async (req, res) => {
  try {
    const snapshot = await db.collection('reservations').limit(20).get();
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({ count: docs.length, reservations: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏝️  DARWIN'S EDGE BOOKING SERVER                         ║
║                                                            ║
║   Server running on port ${PORT}                             ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                            ║
║   Endpoints:                                               ║
║   • POST /api/create-checkout-session                      ║
║   • GET  /api/verify-session/:sessionId                    ║
║   • POST /api/webhook                                      ║
║   • GET  /api/reservations/:userId                         ║
║   • GET  /api/health                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
