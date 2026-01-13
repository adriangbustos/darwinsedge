// ============================================
// DARWIN'S EDGE - Type Definitions
// ============================================

// Import room images
import lodgeSuiteImg from '@/assets/lodge-suite.jpg';
import forestBungalowImg from '@/assets/forest-bungalow.jpg';
import aquaVillaImg from '@/assets/aqua-villa.jpg';

// Room Tier Configuration
export type RoomTier = 'lodge-suites' | 'scalesia-bungalows' | 'aqua-villas';

export interface RoomInclusion {
  name: string;
  description: string;
}

export interface Room {
  id: RoomTier;
  name: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  size: string;
  inclusions: RoomInclusion[];
  features: string[];
  image: string;
}

// Room pricing and data (STRICT - must match server)
export const ROOM_DATA: Record<RoomTier, Room> = {
  'lodge-suites': {
    id: 'lodge-suites',
    name: 'The Lodge Suites',
    tagline: 'Classic Elegance',
    description: 'Nestled within the volcanic landscape, our Lodge Suites offer an intimate connection with Galápagos nature through floor-to-ceiling windows and private terraces.',
    pricePerNight: 1150,
    maxGuests: 4,
    size: '55 m²',
    inclusions: [
      { name: 'Gourmet Breakfast', description: 'Daily artisanal breakfast featuring local ingredients' },
      { name: 'Airport Transfer', description: 'Private luxury transfer from Baltra Airport' },
      { name: 'Infinity Solarium', description: 'Exclusive access to our panoramic relaxation deck' },
    ],
    features: ['King bed or twin configuration', 'Private terrace', 'Rainfall shower', 'Mini bar'],
    image: lodgeSuiteImg,
  },
  'scalesia-bungalows': {
    id: 'scalesia-bungalows',
    name: 'Scalesia Bungalows',
    tagline: 'Refined Seclusion',
    description: 'Inspired by the endemic Scalesia forests, these standalone bungalows offer enhanced privacy with dedicated outdoor living spaces and premium amenities.',
    pricePerNight: 1850,
    maxGuests: 4,
    size: '85 m²',
    inclusions: [
      { name: 'Everything in Lodge Suites', description: 'All inclusions from our signature suites' },
      { name: 'Premium Alcohol Package', description: 'Curated selection of fine spirits and wines' },
      { name: 'Daily Excursion', description: 'One guided expedition per day included' },
      { name: 'Private Dining Setup', description: 'Bespoke dining experience in your bungalow' },
    ],
    features: ['Separate living area', 'Outdoor shower', 'Private plunge pool', 'Butler call service'],
    image: forestBungalowImg,
  },
  'aqua-villas': {
    id: 'aqua-villas',
    name: 'Aqua Villas',
    tagline: 'Ultimate Immersion',
    description: 'Our most exclusive accommodation, the Aqua Villas are architectural masterpieces positioned at the water\'s edge, offering unparalleled views and absolute privacy.',
    pricePerNight: 3200,
    maxGuests: 4,
    size: '140 m²',
    inclusions: [
      { name: 'Everything in Scalesia Bungalows', description: 'All inclusions from our premium bungalows' },
      { name: 'Private Butler', description: 'Dedicated butler service 24/7' },
      { name: 'Unlimited Excursions', description: 'Access to any and all expeditions during your stay' },
      { name: 'Premium Liquors', description: 'Top-shelf spirits and vintage selections' },
      { name: 'National Park Fee Coverage', description: '$200 park entrance fee included' },
    ],
    features: ['Master suite with ocean view', 'Private infinity pool', 'In-villa spa room', 'Personal chef available'],
    image: aquaVillaImg,
  },
};

// Booking State
export interface BookingState {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  selectedRoom: RoomTier | null;
}

export interface BookingContextType {
  booking: BookingState;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setGuests: (guests: number) => void;
  setSelectedRoom: (room: RoomTier | null) => void;
  clearBooking: () => void;
  getNights: () => number;
  getTotalPrice: () => number;
}

// User & Authentication
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Reservation (Firestore document)
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Reservation {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  guests: number;
  roomTier: RoomTier;
  roomName: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  stripeSessionId: string;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// API Request/Response Types
export interface CreateCheckoutRequest {
  roomTier: RoomTier;
  checkIn: string;
  checkOut: string;
  guests: number;
  userId: string;
  userEmail: string;
  userName: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface VerifySessionResponse {
  verified: boolean;
  reservation?: Reservation;
}
