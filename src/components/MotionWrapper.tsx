import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, scaleIn, slideInRight } from "@/components/ui/motion";

interface MotionWrapperProps {
  children: ReactNode;
  type?: "fadeUp" | "scale" | "slideRight";
  delay?: number;
  className?: string;
}

export function MotionWrapper({ 
  children, 
  type = "fadeUp", 
  delay = 0, 
  className 
}: MotionWrapperProps) {
  const variants = {
    fadeUp: fadeInUp,
    scale: scaleIn,
    slideRight: slideInRight
  };

  return (
    <motion.div
      variants={variants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: 0.2, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredContainer({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}