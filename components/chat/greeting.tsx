"use client";
import React from "react";
import LogoIcon from "../logoIcon";
import { Calistoga } from "next/font/google";
import { motion } from "framer-motion";

const calistoga = Calistoga({
    subsets: ["latin"],
    display: "swap",
    weight: "400",
});

export default function Greeting() {
    const renderText = () => {
        // based on time of day.
        const hours = new Date().getHours();
        if (hours >= 0 && hours < 5) {
            return "Late Night Session";
        } else if (hours < 12) {
            return "Good Morning";
        } else if (hours < 18) {
            return "Good Afternoon";
        } else {
            return "Good Evening";
        }
    }
    return (
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center gap-2 ${calistoga.className} min-w-[200px] shrink-0 sm:min-w-0 sm:shrink`} 
            exit={{ opacity: 0, y: 16 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{
            delay: 0.06,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        }}>
            <LogoIcon className="self-center h-10 w-10 mb-10" />
            <h1 className="flex text-xl lg:text-3xl font-bold mb-8">{renderText()}</h1>
        </motion.div>
    );
}