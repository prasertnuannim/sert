"use client";

import { motion } from "framer-motion";

interface Props {
  name: string;
  className?: string;
  colors?: string[]; 
}

export default function ColorMotionInChar({ name, className, colors }: Props) {
   const defaultColors = ["#1e40af", "#9333ea", "#0ea5e9", "#db2777", "#1e40af"];
  const colorPalette = colors && colors.length > 0 ? colors : defaultColors;

  const text = name ?? "";
  return (
    <div className="flex space-x-1 text-2xl font-bold">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className={className}
          animate={{
            color: colorPalette,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}
