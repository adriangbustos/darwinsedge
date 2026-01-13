import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Leaf, Droplets, Sun, Heart } from "lucide-react";
import sustainabilityImage from "@/assets/sustainability.jpg";

const stats = [
  { value: "100%", label: "Carbon Neutral", icon: Leaf },
  { value: "2M+", label: "Trees Planted", icon: Droplets },
  { value: "85%", label: "Solar Powered", icon: Sun },
  { value: "$3M", label: "Conservation Fund", icon: Heart },
];

export const Sustainability = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section
      id="sustainability"
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y: imageY }} className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={sustainabilityImage}
          alt="Galapagos Giant Tortoise"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 container mx-auto px-6 lg:px-12"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm tracking-[0.4em] uppercase text-copper mb-4">
              Our Commitment
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-8">
              Guardians of the Galápagos
            </h2>
          </motion.div>

          {/* Mission Statement with Text Reveal */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-16"
          >
            <p className="font-serif text-xl md:text-2xl text-foreground/90 leading-relaxed italic mb-8">
              "Every guest who walks through our doors becomes a steward of this
              irreplaceable ecosystem. Your stay doesn't just minimize harm—it
              actively heals."
            </p>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Darwin's Edge operates as a regenerative force within the Santa Cruz
              ecosystem. Through our partnership with the Galápagos National Park
              and the Charles Darwin Foundation, we fund critical conservation
              research, habitat restoration, and community education programs.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center p-6 border border-border/30 rounded-lg bg-background/50 backdrop-blur-sm"
              >
                <stat.icon className="w-6 h-6 text-copper mx-auto mb-4" />
                <p className="font-serif text-3xl md:text-4xl text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-xs tracking-widest uppercase text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-16 border-t border-border/30"
          >
            <p className="text-sm tracking-widest uppercase text-copper mb-4">
              The Darwin's Edge Promise
            </p>
            <p className="text-muted-foreground max-w-xl mx-auto">
              5% of every booking is directed to the Santa Cruz Conservation
              Initiative. Since 2025, we've funded the protection of over 10,000
              hectares of critical habitat.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
