// ============================================
// DARWIN'S EDGE - Booking Bar Component
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Search, ChevronDown, ChevronUp } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBooking } from "@/contexts/BookingContext";
import { cn } from "@/lib/utils";

interface BookingBarProps {
  variant?: "hero" | "sticky";
  onSearch?: () => void;
}

export function BookingBar({ variant = "hero", onSearch }: BookingBarProps) {
  const navigate = useNavigate();
  const { booking, setCheckIn, setCheckOut, setGuests } = useBooking();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const today = startOfDay(new Date());
  const minCheckOut = booking.checkIn ? addDays(booking.checkIn, 1) : addDays(today, 1);

  const handleCheckInSelect = (date: Date | undefined) => {
    if (date) {
      setCheckIn(date);
      // If checkout is before or equal to new checkin, reset it
      if (booking.checkOut && isBefore(booking.checkOut, addDays(date, 1))) {
        setCheckOut(null);
      }
      setCheckInOpen(false);
      // Auto-open checkout after selecting checkin
      setTimeout(() => setCheckOutOpen(true), 100);
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (date) {
      setCheckOut(date);
      setCheckOutOpen(false);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    } else {
      navigate("/booking");
    }
  };

  const isSearchDisabled = !booking.checkIn || !booking.checkOut;

  const containerClasses = cn(
    "backdrop-blur-lg border border-border/30 rounded-lg",
    variant === "hero"
      ? "bg-secondary/80 p-4 md:p-6"
      : "bg-secondary/95 p-3 md:p-4 shadow-elegant"
  );

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center">
        {/* Check In */}
        <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-border/30 pb-4 md:pb-0 md:pr-6 w-full text-left hover:bg-background/20 rounded transition-colors">
              <Calendar className="w-5 h-5 text-copper flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase text-muted-foreground">
                  Check In
                </p>
                <p className="text-sm text-foreground mt-1 truncate">
                  {booking.checkIn
                    ? format(booking.checkIn, "MMM dd, yyyy")
                    : "Select Date"}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-secondary border-border" align="start">
            <CalendarComponent
              mode="single"
              selected={booking.checkIn || undefined}
              onSelect={handleCheckInSelect}
              disabled={(date) => isBefore(date, today)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Check Out */}
        <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-border/30 pb-4 md:pb-0 md:pr-6 w-full text-left hover:bg-background/20 rounded transition-colors">
              <Calendar className="w-5 h-5 text-copper flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase text-muted-foreground">
                  Check Out
                </p>
                <p className="text-sm text-foreground mt-1 truncate">
                  {booking.checkOut
                    ? format(booking.checkOut, "MMM dd, yyyy")
                    : "Select Date"}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-secondary border-border" align="start">
            <CalendarComponent
              mode="single"
              selected={booking.checkOut || undefined}
              onSelect={handleCheckOutSelect}
              disabled={(date) => isBefore(date, minCheckOut)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-border/30 pb-4 md:pb-0 md:pr-6 w-full text-left hover:bg-background/20 rounded transition-colors">
              <Users className="w-5 h-5 text-copper flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase text-muted-foreground">
                  Guests
                </p>
                <p className="text-sm text-foreground mt-1">
                  {booking.guests} {booking.guests === 1 ? "Adult" : "Adults"}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-secondary border-border p-4" align="start">
            <div className="space-y-4">
              <p className="text-xs tracking-widest uppercase text-muted-foreground">
                Number of Guests
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setGuests(Math.max(1, booking.guests - 1))}
                  disabled={booking.guests <= 1}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-2xl font-serif text-foreground">
                  {booking.guests}
                </span>
                <button
                  onClick={() => setGuests(Math.min(4, booking.guests + 1))}
                  disabled={booking.guests >= 4}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Maximum 4 guests per room
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          variant="default"
          className={cn(
            "bg-primary hover:bg-teal-light text-foreground flex items-center justify-center space-x-2 transition-all duration-300",
            variant === "hero" ? "py-6" : "py-5",
            isSearchDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Search className="w-4 h-4" />
          <span className="tracking-widest uppercase text-sm">
            {variant === "hero" ? "Search" : "Update"}
          </span>
        </Button>
      </div>
    </div>
  );
}
