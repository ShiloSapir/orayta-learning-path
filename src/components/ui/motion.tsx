import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Preset motion components
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionCard = motion.div;

// Higher-order components for common patterns
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleOnTap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Spiritual motion presets
export const torahUnroll: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: { scaleX: 1 }
};

export const blessingGlow: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: [0, 1, 1, 0],
    scale: [0.8, 1.1, 1.1, 1.2]
  }
};