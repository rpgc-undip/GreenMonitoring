import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mapping from tab name to animation color (RGBA)
const animationColors = {
  ELECTRICITY: "rgba(255, 152, 0, 0.4)", // orange
  WATER: "rgba(30, 136, 229, 0.4)",      // blue
  CO2: "rgba(103, 58, 183, 0.4)",        // violet
  "VEHICLE COUNTER": "rgba(76, 175, 80, 0.4)", // green
};

const AnimatedCard = ({ title, value, index, isVehicle, isElectricity, isCO2, isWater, colorClasses, activeTab }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [fade, setFade] = useState(false);

  // Create a new audio object
  const audio = new Audio(process.env.PUBLIC_URL + "/beep-beep.mp3"); // Ensure this file is in /public

  useEffect(() => {
    if (value !== prevValue) {
      setFade(true);
      audio.play().catch((err) => console.error("Sound error:", err)); // Play sound when value changes
      const timeout = setTimeout(() => {
        setFade(false);
        setPrevValue(value);
      }, 1000); // 1 second fade duration
      return () => clearTimeout(timeout);
    }
  }, [value, prevValue]); // remove `audio` from deps to avoid creating a new object on each render

  const bgColor =
    isCO2 && (index === 3 || index === 8 || index === 13 || index === 18)
      ? "bg-violet-100"
      : "bg-white";

  const valueClass =
    (isElectricity && index === 0) || (isCO2 && (index === 0 || index === 5 || index === 10 || index === 15)) || (isWater && index === 0) || (isVehicle && index ===0)
      ? `text-xs ${colorClasses.text}`
      : `text-xl ${colorClasses.text}`

  const gradientColor = animationColors[activeTab] || "rgba(33, 150, 243, 0.4)";

  return (
    <article
      className={`relative p-4 rounded-xl shadow flex flex-col items-center justify-center min-h-[100px] border-t-4 ${colorClasses.border} ${bgColor}`}
    >
      {/* Animated gradient overlay */}
      <AnimatePresence>
        {fade && (
          <motion.div
            key={`fade-${value}`} // Ensures unique remounting for AnimatePresence
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 12,
              background: `linear-gradient(to top, ${gradientColor} 0%, transparent 30%)`,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <h3 className={`font-semibold mb-2 ${isVehicle ? "text-lg mb-1" : "text-xs text-center"} z-10`}>
        {title}
      </h3>
      <p className={`font-bold ${valueClass} z-10`}>
        {value}
      </p>
    </article>
  );
};

export default AnimatedCard;
