/**
 * Apple iOS 26 Liquid Motion Tokens
 * Standardized spring physics and transition curves for Framer Motion
 */

export const springSmooth = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 0.8,
};

export const springSnappy = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.6,
};

export const springBouncy = {
  type: "spring",
  stiffness: 320,
  damping: 22,
  mass: 0.9,
};

export const springGentle = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 1.0,
};

export const tapScale = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const hoverLift = {
  y: -2,
  transition: springSnappy,
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};
