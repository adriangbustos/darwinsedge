// ============================================
// DARWIN'S EDGE - Luxury Room Card Component
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room, RoomTier } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (roomId: RoomTier) => void;
  nights: number;
  checkIn?: Date | null;
  checkOut?: Date | null;
}

interface DynamicPrice {
  totalPrice: number;
  hasHighSeasonNights: boolean;
}

export function RoomCard({ room, isSelected, onSelect, nights, checkIn, checkOut }: RoomCardProps) {
  const [dynamicPrice, setDynamicPrice] = useState<DynamicPrice | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  
  // Fetch dynamic pricing when dates change
  useEffect(() => {
    async function fetchDynamicPrice() {
      if (!checkIn || !checkOut || nights <= 0) {
        setDynamicPrice(null);
        return;
      }
      
      setIsLoadingPrice(true);
      try {
        const response = await fetch(`${API_URL}/api/calculate-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTier: room.id,
            checkIn: format(checkIn, 'yyyy-MM-dd'),
            checkOut: format(checkOut, 'yyyy-MM-dd'),
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setDynamicPrice({
            totalPrice: data.totalPrice,
            hasHighSeasonNights: data.hasHighSeasonNights,
          });
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      } finally {
        setIsLoadingPrice(false);
      }
    }
    
    fetchDynamicPrice();
  }, [room.id, checkIn, checkOut, nights]);
  
  // Use dynamic price if available, otherwise fallback to static calculation
  const totalPrice = dynamicPrice?.totalPrice ?? (nights * room.pricePerNight);
  const hasHighSeason = dynamicPrice?.hasHighSeasonNights ?? false;
  
  const tierBadge = room.id === 'aqua-villas' 
    ? 'Signature Experience' 
    : room.id === 'scalesia-bungalows' 
    ? 'Premium' 
    : 'Classic';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden border transition-all duration-500",
        isSelected
          ? "border-copper shadow-glow ring-1 ring-copper/30"
          : "border-border/30 hover:border-border/60"
      )}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url(${room.image})`,
            backgroundColor: 'hsl(var(--muted))',
          }}
        />
        <div className="absolute inset-0 bg-gradient-card" />
        
        {/* Tier Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 text-xs tracking-widest uppercase rounded-sm backdrop-blur-sm",
            room.id === 'aqua-villas'
              ? "bg-copper/80 text-foreground"
              : room.id === 'scalesia-bungalows'
              ? "bg-teal/80 text-foreground"
              : "bg-secondary/80 text-foreground"
          )}>
            {tierBadge}
          </span>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-copper flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-foreground" />
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <p className="text-xs tracking-widest uppercase text-copper mb-1">
            {room.tagline}
          </p>
          <h3 className="font-serif text-2xl text-foreground">
            {room.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {room.description}
        </p>

        {/* Room Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{room.size}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Up to {room.maxGuests} guests</span>
        </div>

        {/* Inclusions */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          <p className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-copper" />
            Inclusions
          </p>
          <ul className="space-y-1.5">
            {room.inclusions.slice(0, 4).map((inclusion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className="w-3.5 h-3.5 text-copper flex-shrink-0 mt-0.5" />
                <span>{inclusion.name}</span>
              </li>
            ))}
            {room.inclusions.length > 4 && (
              <li className="text-xs text-muted-foreground pl-5">
                +{room.inclusions.length - 4} more inclusions
              </li>
            )}
          </ul>
        </div>

        {/* Pricing */}
        <div className="pt-4 border-t border-border/30">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-serif text-3xl text-foreground">
                ${room.pricePerNight.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per night</p>
            </div>
            {nights > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {nights} night{nights > 1 ? 's' : ''} total
                </p>
                {isLoadingPrice ? (
                  <p className="font-serif text-xl text-copper animate-pulse">
                    Calculating...
                  </p>
                ) : (
                  <>
                    <p className="font-serif text-xl text-copper">
                      ${totalPrice.toLocaleString()}
                    </p>
                    {hasHighSeason && (
                      <p className="text-xs text-amber-500 flex items-center justify-end gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        Peak season rates
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Select Button */}
          <Button
            onClick={() => onSelect(room.id)}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "w-full tracking-widest uppercase text-sm py-5 transition-all duration-300",
              isSelected
                ? "bg-copper hover:bg-copper-light text-foreground"
                : "border-border/50 text-foreground hover:bg-secondary hover:border-copper"
            )}
          >
            {isSelected ? "Selected" : "Select This Suite"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
