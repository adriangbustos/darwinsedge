// ============================================
// DARWIN'S EDGE - Confetti Celebration Component
// ============================================

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
}

const COLORS = [
  'hsl(29, 56%, 46%)',   // copper
  'hsl(35, 58%, 89%)',   // champagne
  'hsl(178, 100%, 15%)', // teal
  'hsl(29, 56%, 65%)',   // copper-light
  'hsl(178, 80%, 25%)',  // teal-light
];

function createConfettiPiece(id: number): ConfettiPiece {
  return {
    id,
    x: Math.random() * 100,
    y: -10,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5,
    duration: Math.random() * 2 + 2,
  };
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const generateConfetti = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push(createConfettiPiece(i));
    }
    setPieces(newPieces);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isActive) {
      generateConfetti();
      
      // Trigger multiple bursts
      const burst2 = setTimeout(() => {
        const morePieces: ConfettiPiece[] = [];
        for (let i = 50; i < 100; i++) {
          morePieces.push(createConfettiPiece(i));
        }
        setPieces(prev => [...prev, ...morePieces]);
      }, 300);

      const burst3 = setTimeout(() => {
        const morePieces: ConfettiPiece[] = [];
        for (let i = 100; i < 150; i++) {
          morePieces.push(createConfettiPiece(i));
        }
        setPieces(prev => [...prev, ...morePieces]);
      }, 600);

      // Clean up after animation
      const cleanup = setTimeout(() => {
        setIsVisible(false);
        setPieces([]);
        onComplete?.();
      }, 5000);

      return () => {
        clearTimeout(burst2);
        clearTimeout(burst3);
        clearTimeout(cleanup);
      };
    }
  }, [isActive, generateConfetti, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: '-5vh',
                rotate: 0,
                scale: piece.scale,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation + Math.random() * 720,
                opacity: [1, 1, 1, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'linear',
              }}
              className="absolute"
              style={{ left: 0, top: 0 }}
            >
              {/* Different confetti shapes */}
              {piece.id % 3 === 0 ? (
                // Square
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: piece.color,
                    borderRadius: 2,
                  }}
                />
              ) : piece.id % 3 === 1 ? (
                // Circle
                <div
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: piece.color,
                    borderRadius: '50%',
                  }}
                />
              ) : (
                // Rectangle
                <div
                  style={{
                    width: 8,
                    height: 16,
                    backgroundColor: piece.color,
                    borderRadius: 2,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
