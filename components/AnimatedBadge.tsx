"use client";
import { motion } from "framer-motion";

export default function AnimatedBadge({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex relative self-center justify-center items-center p-[1px] animated-shine shine rounded-full overflow-hidden"
      animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{
        delay: 0.5,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="bg-white dark:bg-neutral-950 rounded-full">
        <span className="flex text-sm font-semibold py-1 px-5">{text}</span>
      </div>
    </motion.div>
  );
}
