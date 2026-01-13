// ============================================
// DARWIN'S EDGE - User Dashboard / Reservations
// ============================================

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isPast } from "date-fns";
import {
  Calendar,
  Users,
  MapPin,
  CreditCard,
  LogOut,
  Plus,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/Confetti";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import type { Reservation } from "@/types";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut, loading: authLoading } = useAuth();
  const { clearBooking } = useBooking();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTriggeredRef = useRef(false);

  const paymentSuccess = searchParams.get('payment') === 'success';
  const sessionId = searchParams.get('session_id');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Fetch reservations
  const fetchReservations = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/reservations/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment success - verify session and trigger confetti ONLY once
  useEffect(() => {
    async function handlePaymentSuccess() {
      if (paymentSuccess && sessionId && !confettiTriggeredRef.current && user) {
        confettiTriggeredRef.current = true;
        setShowConfetti(true);
        clearBooking();
        
        // Verify the session to ensure reservation is marked as completed
        try {
          const response = await fetch(`${API_URL}/api/verify-session/${sessionId}`);
          if (response.ok) {
            console.log('✅ Session verified');
            // Refetch reservations after verification
            await fetchReservations();
          }
        } catch (error) {
          console.error('Error verifying session:', error);
        }
        
        // Clear URL params after showing success
        setTimeout(() => {
          setSearchParams({}, { replace: true });
        }, 1000);
      }
    }
    
    handlePaymentSuccess();
  }, [paymentSuccess, sessionId, clearBooking, setSearchParams, user]);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingReservations = reservations.filter(
    (r) => !isPast(parseISO(r.checkOut))
  );
  const pastReservations = reservations.filter((r) =>
    isPast(parseISO(r.checkOut))
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Confetti isActive={showConfetti} onComplete={handleConfettiComplete} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 border-b border-border/20">
        <div className="container mx-auto max-w-6xl">
          {/* Success Banner */}
          <AnimatePresence>
            {paymentSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-6 bg-teal/20 border border-teal/30 rounded-lg flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-teal-light flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-1">
                    Booking Confirmed!
                  </h3>
                  <p className="text-sm text-foreground/80">
                    Your reservation has been successfully completed. A
                    confirmation email will be sent shortly. We look forward to
                    welcoming you to Darwin's Edge.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-copper mb-2">
                Welcome Back
              </p>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">
                {user.displayName || 'Guest'}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/booking')}
                className="bg-copper hover:bg-copper-light text-foreground tracking-widest uppercase text-sm py-5 px-6 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Booking
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-border/50 text-foreground hover:bg-secondary tracking-widest uppercase text-sm py-5 px-6 transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reservations Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Upcoming Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-copper" />
              Upcoming Reservations
            </h2>

            {isLoading ? (
              <div className="grid gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-secondary/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : upcomingReservations.length > 0 ? (
              <div className="grid gap-6">
                {upcomingReservations.map((reservation, index) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    index={index}
                    variant="upcoming"
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>

          {/* Past Reservations */}
          {pastReservations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-muted-foreground" />
                Past Stays
              </h2>

              <div className="grid gap-6">
                {pastReservations.map((reservation, index) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    index={index}
                    variant="past"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ============================================
// Reservation Card Component
// ============================================

interface ReservationCardProps {
  reservation: Reservation;
  index: number;
  variant: 'upcoming' | 'past';
}

function ReservationCard({ reservation, index, variant }: ReservationCardProps) {
  const checkInDate = parseISO(reservation.checkIn);
  const checkOutDate = parseISO(reservation.checkOut);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "bg-secondary/40 backdrop-blur-sm border rounded-lg overflow-hidden transition-all duration-300",
        variant === 'upcoming'
          ? "border-border/30 hover:border-copper/50"
          : "border-border/20 opacity-70"
      )}
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Room Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                  variant === 'upcoming' ? "bg-copper/20" : "bg-muted/30"
                )}
              >
                <MapPin
                  className={cn(
                    "w-6 h-6",
                    variant === 'upcoming' ? "text-copper" : "text-muted-foreground"
                  )}
                />
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground mb-1">
                  {reservation.roomName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Confirmation #{reservation.id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Details */}
          <div className="flex flex-wrap gap-6 lg:gap-8 text-sm">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Check In
              </p>
              <p className="text-foreground font-medium">
                {format(checkInDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Check Out
              </p>
              <p className="text-foreground font-medium">
                {format(checkOutDate, 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Guests
              </p>
              <p className="text-foreground font-medium flex items-center gap-1">
                <Users className="w-4 h-4" />
                {reservation.guests}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Total
              </p>
              <p className="text-foreground font-medium flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                ${reservation.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status / Action */}
          <div className="flex items-center gap-4">
            {variant === 'upcoming' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs tracking-widest uppercase text-emerald-400 font-medium">
                  Confirmed
                </span>
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <div className="text-center py-16 px-6 bg-secondary/20 border border-border/20 rounded-lg">
      <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl text-foreground mb-2">
        No Upcoming Reservations
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Your next adventure awaits. Explore our accommodations and book your
        stay at Darwin's Edge.
      </p>
      <Link to="/booking">
        <Button className="bg-copper hover:bg-copper-light text-foreground tracking-widest uppercase text-sm py-5 px-8 transition-all duration-300">
          Explore Rooms
        </Button>
      </Link>
    </div>
  );
}
