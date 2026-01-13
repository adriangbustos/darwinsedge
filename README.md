# Darwin's Edge - Luxury Hotel Booking System

A premium hotel booking application for Darwin's Edge, a regenerative sanctuary in the Galápagos Islands.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **State Management**: React Context
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Payments**: Stripe Checkout
- **Backend**: Node.js + Express

## Room Tiers & Pricing

| Tier | Price/Night | Key Inclusions |
|------|-------------|----------------|
| The Lodge Suites | $1,150 | Breakfast, Airport Transfer, Infinity Solarium |
| Scalesia Bungalows | $1,850 | + Premium Alcohol, Daily Excursion, Private Dining |
| Aqua Villas | $3,200 | + Private Butler, Unlimited Excursions, $200 Park Fee |

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Firebase Project (with Auth + Firestore enabled)
- Stripe Account (test mode)

### 1. Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend** - Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001
```

**Backend** - Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Fill in your credentials:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

### 4. Set Up Stripe Webhook (Development)

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3001/api/webhook
```

Copy the webhook signing secret to your `server/.env` file.

## Booking Flow

1. **Home** → Select dates & guests in booking bar
2. **Booking** → Browse room tiers and select
3. **Login** → Create account or sign in (required)
4. **Stripe** → Complete payment
5. **Dashboard** → View reservation with confetti celebration 🎉

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-checkout-session` | Create Stripe checkout session |
| GET | `/api/verify-session/:sessionId` | Verify payment status |
| POST | `/api/webhook` | Stripe webhook handler |
| GET | `/api/reservations/:userId` | Get user's reservations |
| GET | `/api/health` | Health check |

## Project Structure

```
DARWIN'S EDGE/
├── src/
│   ├── components/
│   │   ├── BookingBar.tsx      # Date/guest selector
│   │   ├── RoomCard.tsx        # Luxury room cards
│   │   ├── Confetti.tsx        # Celebration animation
│   │   └── ProtectedRoute.tsx  # Auth guard
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Firebase auth state
│   │   └── BookingContext.tsx  # Booking state
│   ├── pages/
│   │   ├── Index.tsx           # Homepage
│   │   ├── Booking.tsx         # Room selection
│   │   ├── Login.tsx           # Authentication
│   │   └── Dashboard.tsx       # User reservations
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── server/
│   ├── index.js                # Express server
│   └── .env.example            # Backend env template
└── .env.example                # Frontend env template
```

## Deployment

### Frontend (Netlify)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Backend

Deploy to your preferred Node.js host (Render, Railway, etc.)
Update `VITE_API_URL` in frontend to point to deployed backend.

## License

Private - Darwin's Edge
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
