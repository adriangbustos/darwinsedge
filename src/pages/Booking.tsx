// ============================================
// DARWIN'S EDGE - Booking / Room Selection Page
// ============================================

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowRight, AlertCircle, Shield, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingBar } from "@/components/BookingBar";
import { RoomCard } from "@/components/RoomCard";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROOM_DATA, type RoomTier } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { booking, setSelectedRoom, getNights, getTotalPrice } = useBooking();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wasCanceled = searchParams.get('canceled') === 'true';
  const nights = getNights();
  const totalPrice = getTotalPrice();
  const rooms = Object.values(ROOM_DATA);

  const handleRoomSelect = (roomId: RoomTier) => {
    setSelectedRoom(roomId);
    setError(null);
  };

  const handleProceedToCheckout = async () => {
    // Validate booking state
    if (!booking.checkIn || !booking.checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (!booking.selectedRoom) {
      setError('Please select a room');
      return;
    }

    // Check authentication
    if (!user) {
      // Store intent and redirect to login
      navigate('/login?redirect=/booking');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomTier: booking.selectedRoom,
          checkIn: format(booking.checkIn, 'yyyy-MM-dd'),
          checkOut: format(booking.checkOut, 'yyyy-MM-dd'),
          guests: booking.guests,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Guest',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const hasValidDates = booking.checkIn && booking.checkOut && nights > 0;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-sm tracking-[0.3em] uppercase text-copper mb-4">
              Select Your Sanctuary
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Accommodations
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each of our three distinctive tiers offers an unparalleled experience,
              where volcanic landscapes meet refined luxury.
            </p>
          </motion.div>

          {/* Booking Bar - Sticky */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <BookingBar variant="sticky" />
          </motion.div>

          {/* Canceled Alert */}
          <AnimatePresence>
            {wasCanceled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-secondary border border-border/50 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-copper flex-shrink-0" />
                <p className="text-foreground text-sm">
                  Your checkout was canceled. Feel free to modify your selection and try again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Warning */}
          {!hasValidDates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-secondary/50 border border-border/30 rounded-lg flex items-center gap-3"
            >
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-muted-foreground text-sm">
                Please select your check-in and check-out dates above to view pricing.
              </p>
            </motion.div>
          )}

          {/* Room Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                <RoomCard
                  room={room}
                  isSelected={booking.selectedRoom === room.id}
                  onSelect={handleRoomSelect}
                  nights={nights}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                />
              </motion.div>
            ))}
          </div>

          {/* Booking Summary & Checkout */}
          <AnimatePresence>
            {booking.selectedRoom && hasValidDates && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-secondary/60 backdrop-blur-lg border border-border/30 rounded-lg p-6 md:p-8"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Summary */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-foreground">
                      Booking Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room</span>
                        <span className="text-foreground">
                          {ROOM_DATA[booking.selectedRoom].name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dates</span>
                        <span className="text-foreground">
                          {format(booking.checkIn!, 'MMM dd')} - {format(booking.checkOut!, 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="text-foreground">
                          {nights} night{nights > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guests</span>
                        <span className="text-foreground">
                          {booking.guests} {booking.guests === 1 ? 'adult' : 'adults'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border/30">
                        <span className="text-foreground font-medium">Total</span>
                        <span className="font-serif text-2xl text-copper">
                          ${totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleProceedToCheckout}
                      disabled={isLoading}
                      className="w-full bg-copper hover:bg-copper-light text-foreground py-6 tracking-widest uppercase text-sm transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          {user ? 'Proceed to Checkout' : 'Sign In to Book'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-6 border-t border-border/20">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-serif text-copper mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Concierge Service</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-copper mb-2">100%</p>
              <p className="text-sm text-muted-foreground">Carbon Neutral Operations</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-copper mb-2">72h</p>
              <p className="text-sm text-muted-foreground">Free Cancellation</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
