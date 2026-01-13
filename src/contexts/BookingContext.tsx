// ============================================
// DARWIN'S EDGE - Booking Context
// ============================================

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { differenceInDays, format } from 'date-fns';
import type { BookingState, BookingContextType, RoomTier } from '@/types';
import { ROOM_DATA } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const INITIAL_BOOKING_STATE: BookingState = {
  checkIn: null,
  checkOut: null,
  guests: 2,
  selectedRoom: null,
};

// Session storage key for persistence
const BOOKING_STORAGE_KEY = 'darwins_edge_booking';

function loadBookingFromStorage(): BookingState {
  try {
    const stored = sessionStorage.getItem(BOOKING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        checkIn: parsed.checkIn ? new Date(parsed.checkIn) : null,
        checkOut: parsed.checkOut ? new Date(parsed.checkOut) : null,
        guests: parsed.guests || 2,
        selectedRoom: parsed.selectedRoom || null,
      };
    }
  } catch {
    // Ignore errors, return initial state
  }
  return INITIAL_BOOKING_STATE;
}

function saveBookingToStorage(booking: BookingState): void {
  try {
    sessionStorage.setItem(
      BOOKING_STORAGE_KEY,
      JSON.stringify({
        checkIn: booking.checkIn?.toISOString() || null,
        checkOut: booking.checkOut?.toISOString() || null,
        guests: booking.guests,
        selectedRoom: booking.selectedRoom,
      })
    );
  } catch {
    // Ignore storage errors
  }
}

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [booking, setBooking] = useState<BookingState>(() => loadBookingFromStorage());
  const [dynamicTotalPrice, setDynamicTotalPrice] = useState<number | null>(null);

  // Fetch dynamic pricing from server when booking details change
  useEffect(() => {
    async function fetchDynamicPrice() {
      if (!booking.selectedRoom || !booking.checkIn || !booking.checkOut) {
        setDynamicTotalPrice(null);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/calculate-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTier: booking.selectedRoom,
            checkIn: format(booking.checkIn, 'yyyy-MM-dd'),
            checkOut: format(booking.checkOut, 'yyyy-MM-dd'),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDynamicTotalPrice(data.totalPrice);
        } else {
          // Fallback to static calculation if API fails
          setDynamicTotalPrice(null);
        }
      } catch (error) {
        console.error('Error fetching dynamic price:', error);
        setDynamicTotalPrice(null);
      }
    }

    fetchDynamicPrice();
  }, [booking.selectedRoom, booking.checkIn, booking.checkOut]);

  const updateBooking = useCallback((updates: Partial<BookingState>) => {
    setBooking((prev) => {
      const newBooking = { ...prev, ...updates };
      saveBookingToStorage(newBooking);
      return newBooking;
    });
  }, []);

  const setCheckIn = useCallback((date: Date | null) => {
    updateBooking({ checkIn: date });
  }, [updateBooking]);

  const setCheckOut = useCallback((date: Date | null) => {
    updateBooking({ checkOut: date });
  }, [updateBooking]);

  const setGuests = useCallback((guests: number) => {
    // Enforce max 4 guests
    const validGuests = Math.min(Math.max(1, guests), 4);
    updateBooking({ guests: validGuests });
  }, [updateBooking]);

  const setSelectedRoom = useCallback((room: RoomTier | null) => {
    updateBooking({ selectedRoom: room });
  }, [updateBooking]);

  const clearBooking = useCallback(() => {
    setBooking(INITIAL_BOOKING_STATE);
    sessionStorage.removeItem(BOOKING_STORAGE_KEY);
  }, []);

  const getNights = useCallback((): number => {
    if (!booking.checkIn || !booking.checkOut) return 0;
    const nights = differenceInDays(booking.checkOut, booking.checkIn);
    return Math.max(0, nights);
  }, [booking.checkIn, booking.checkOut]);

  const getTotalPrice = useCallback((): number => {
    // Use dynamic price from server if available
    if (dynamicTotalPrice !== null) {
      return dynamicTotalPrice;
    }
    // Fallback to static calculation
    if (!booking.selectedRoom) return 0;
    const nights = getNights();
    const room = ROOM_DATA[booking.selectedRoom];
    return nights * room.pricePerNight;
  }, [dynamicTotalPrice, booking.selectedRoom, getNights]);

  const value: BookingContextType = {
    booking,
    setCheckIn,
    setCheckOut,
    setGuests,
    setSelectedRoom,
    clearBooking,
    getNights,
    getTotalPrice,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
