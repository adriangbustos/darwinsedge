import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import lodgeSuite from "@/assets/lodge-suite.jpg";
import forestBungalow from "@/assets/forest-bungalow.jpg";
import aquaVilla from "@/assets/aqua-villa.jpg";

const accommodations = [
  {
    id: 1,
    name: "Lodge Suites",
    tagline: "Volcanic Stone Elegance",
    description: "Carved into the volcanic landscape, our Lodge Suites offer panoramic ocean views through floor-to-ceiling windows. Indigenous stone walls meet contemporary comfort.",
    price: "From $1,150",
    image: lodgeSuite,
    features: ["Ocean View", "Private Terrace", "90 sqm"],
  },
  {
    id: 2,
    name: "Scalesia Forest Bungalows",
    tagline: "Elevated Forest Living",
    description: "Nestled among the endemic Scalesia trees, these elevated bungalows immerse you in the unique highland ecosystem. Wake to the calls of Darwin's finches.",
    price: "From $1,850",
    image: forestBungalow,
    features: ["Forest Immersion", "Outdoor Bath", "110 sqm"],
  },
  {
    id: 3,
    name: "Aqua Villas",
    tagline: "Where Ocean Meets Luxury",
    description: "Our signature overwater villas feature glass floor panels revealing the marine sanctuary below. Watch sea turtles glide beneath you from your private deck.",
    price: "From $3,200",
    image: aquaVilla,
    features: ["Glass Floor", "Private Pool", "150 sqm"],
  },
];

export const AccommodationsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex < 0) newIndex = accommodations.length - 1;
      if (newIndex >= accommodations.length) newIndex = 0;
      return newIndex;
    });
  };

  const current = accommodations[currentIndex];

  return (
    <section id="accommodations" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.4em] uppercase text-copper mb-4">
            Accommodations
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
            Your Sanctuary Awaits
          </h2>
        </motion.div>

        {/* Slider Container */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px]">
            {/* Image Side */}
            <div className="relative h-[400px] lg:h-[600px] overflow-hidden rounded-lg">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.4 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-card" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <div className="absolute bottom-6 right-6 flex space-x-3 z-10">
                <button
                  onClick={() => paginate(-1)}
                  className="w-12 h-12 flex items-center justify-center border border-foreground/30 text-foreground hover:bg-foreground/10 transition-colors rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="w-12 h-12 flex items-center justify-center border border-foreground/30 text-foreground hover:bg-foreground/10 transition-colors rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Counter */}
              <div className="absolute bottom-6 left-6 z-10">
                <span className="text-foreground font-serif text-lg">
                  {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground/40 mx-2">/</span>
                <span className="text-foreground/40">
                  {String(accommodations.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Content Side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="lg:pl-8"
              >
                <p className="text-sm tracking-[0.3em] uppercase text-copper mb-4">
                  {current.tagline}
                </p>
                <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                  {current.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  {current.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {current.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-4 py-2 border border-border text-sm text-foreground/80 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Price and CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">
                      Starting From
                    </p>
                    <p className="font-serif text-2xl text-foreground mt-1">
                      {current.price}
                    </p>
                  </div>
                  <Link to="/booking" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Button
                      variant="default"
                      className="bg-primary hover:bg-teal-light text-foreground flex items-center space-x-2 py-6 px-8 transition-all duration-300 group"
                    >
                      <span className="tracking-widest uppercase text-sm">
                        Explore Suite
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center mt-12 space-x-3">
            {accommodations.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-copper w-8"
                    : "bg-foreground/30 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
