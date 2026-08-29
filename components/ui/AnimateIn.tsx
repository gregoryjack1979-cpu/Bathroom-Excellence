"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

interface AnimateInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}

/** Viewport-entrance wrapper: fades/rises once when scrolled into view. */
export function AnimateIn({ children, delay = 0, className, as = "div" }: AnimateInProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-70px" }}
    >
      {children}
    </Tag>
  );
}
