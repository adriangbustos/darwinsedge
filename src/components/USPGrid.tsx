import { motion } from "framer-motion";
import { ArrowRight, Flame, Waves, Leaf } from "lucide-react";
import lavaDining from "@/assets/lava-dining.jpg";
import deepBlue from "@/assets/deep-blue.jpg";
import originSpa from "@/assets/origin-spa.jpg";

const experiences = [
  {
    id: 1,
    name: "Lava Tube Dining",
    tagline: "Subterranean Gastronomy",
    description: "Dine beneath ancient volcanic formations in our exclusive lava tube restaurant. A multi-sensory culinary journey lit only by candlelight.",
    icon: Flame,
    image: lavaDining,
    size: "large",
  },
  {
    id: 2,
    name: "Deep Blue Safari",
    tagline: "Hammerhead Expeditions",
    description: "Descend into the realm of the hammerhead sharks with our expert marine guides. An encounter that redefines the meaning of wild.",
    icon: Waves,
    image: deepBlue,
    size: "medium",
  },
  {
    id: 3,
    name: "Origin Spa",
    tagline: "Volcanic Renewal",
    description: "Harness the healing power of volcanic minerals. Our signature treatments use locally-sourced obsidian and thermal mud.",
    icon: Leaf,
    image: originSpa,
    size: "medium",
  },
];

export const USPGrid = () => {
  return (
    <section id="experiences" className="py-24 md:py-32 bg-secondary">
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
            Signature Experiences
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Beyond the Ordinary
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated encounters that connect you with the raw beauty of the Galápagos—
            above ground, below the surface, and within yourself.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large Card - Lava Tube Dining */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:row-span-2 group cursor-pointer"
          >
            <div className="relative h-[400px] md:h-full min-h-[500px] overflow-hidden rounded-lg">
              <img
                src={experiences[0].image}
                alt={experiences[0].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="mb-4">
                  <Flame className="w-8 h-8 text-copper mb-4" />
                  <p className="text-xs tracking-[0.3em] uppercase text-copper">
                    {experiences[0].tagline}
                  </p>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                  {experiences[0].name}
                </h3>
                <p className="text-foreground/70 mb-6 max-w-sm">
                  {experiences[0].description}
                </p>
                <div className="flex items-center text-copper group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm tracking-widest uppercase mr-2">
                    Discover
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medium Card - Deep Blue Safari */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="group cursor-pointer"
          >
            <div className="relative h-[300px] md:h-[280px] overflow-hidden rounded-lg">
              <img
                src={experiences[1].image}
                alt={experiences[1].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="mb-3">
                  <Waves className="w-6 h-6 text-copper mb-3" />
                  <p className="text-xs tracking-[0.3em] uppercase text-copper">
                    {experiences[1].tagline}
                  </p>
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3">
                  {experiences[1].name}
                </h3>
                <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                  {experiences[1].description}
                </p>
                <div className="flex items-center text-copper group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm tracking-widest uppercase mr-2">
                    Explore
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medium Card - Origin Spa */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="group cursor-pointer"
          >
            <div className="relative h-[300px] md:h-[280px] overflow-hidden rounded-lg">
              <img
                src={experiences[2].image}
                alt={experiences[2].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="mb-3">
                  <Leaf className="w-6 h-6 text-copper mb-3" />
                  <p className="text-xs tracking-[0.3em] uppercase text-copper">
                    {experiences[2].tagline}
                  </p>
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3">
                  {experiences[2].name}
                </h3>
                <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                  {experiences[2].description}
                </p>
                <div className="flex items-center text-copper group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm tracking-widest uppercase mr-2">
                    Discover
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
