"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import * as React from "react";

type Props = HTMLMotionProps<"section"> & {
  delay?: number;
};

export function AnimatedSection({
  delay = 0,
  children,
  ...rest
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
