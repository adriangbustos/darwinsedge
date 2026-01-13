import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

const footerLinks = [
  {
    title: "Experience",
    links: ["Accommodations", "Dining", "Spa & Wellness", "Adventures"],
  },
  {
    title: "Discover",
    links: ["About Us", "Sustainability", "Gallery", "Press"],
  },
  {
    title: "Plan",
    links: ["Book Now", "Gift Cards", "Special Offers", "FAQs"],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/30">
      <div className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Turtle Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                {/* Turtle Icon SVG */}
                <svg
                  viewBox="0 0 48 48"
                  className="w-12 h-12 text-copper"
                  fill="currentColor"
                >
                  <path d="M24 8c-2 0-4 1-5.5 2.5S16 14 16 16c-4 0-8 2-10 6s-2 8 0 12c1 2 3 4 5 5s4 1 6 1c2 3 5 4 7 4s5-1 7-4c2 0 4 0 6-1s4-3 5-5c2-4 2-8 0-12s-6-6-10-6c0-2-1-4-2.5-5.5S26 8 24 8zm0 4c1 0 2 .5 3 1.5s1 2 1 2.5h-8c0-.5.5-1.5 1-2.5s2-1.5 3-1.5zm-8 8h16c3 0 6 2 7.5 5s1.5 6 0 9c-.75 1.5-2 3-3.5 3.5s-3 .5-4.5.5c-.5 1.5-1.5 3-3 4s-3 1-4.5 1-3.5 0-4.5-1-2.5-2.5-3-4c-1.5 0-3 0-4.5-.5S9.5 35.5 8.5 34c-1.5-3-1.5-6 0-9S13 20 16 20z" />
                </svg>
                <span className="font-serif text-2xl text-foreground">
                  Darwin's Edge
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                A regenerative sanctuary where luxury meets conservation in the
                heart of the Galápagos Islands.
              </p>
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-copper" />
                <span>Santa Cruz Island, Galápagos, Ecuador</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-copper" />
                <span>+593 5 252 0000</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-copper" />
                <span>reservations@darwinsedge.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center border border-border/50 rounded text-muted-foreground hover:text-copper hover:border-copper transition-colors duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column, index) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <h4 className="text-sm tracking-widest uppercase text-foreground mb-6">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Darwin's Edge. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Preferences
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
