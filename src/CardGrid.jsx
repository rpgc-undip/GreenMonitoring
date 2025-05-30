import React from "react";
import AnimatedCard from "./AnimatedCard";

export default function CardGrid({ data, isVehicle, activeItem }) {
  const isElectricity = activeItem === "ELECTRICITY";
  const isCO2 = activeItem === "CO2";
  const isWater = activeItem === "WATER";

  // Determine border and text color based on activeItem
  const colorClasses = (() => {
    switch (activeItem) {
      case "ELECTRICITY":
        return { border: "border-orange-500", text: "text-orange-500" };
      case "WATER":
        return { border: "border-blue-600", text: "text-blue-600" };
      case "CO2":
        return { border: "border-violet-700", text: "text-violet-700" };
      case "VEHICLE COUNTER":
        return { border: "border-green-600", text: "text-green-600" };
      default:
        return { border: "border-gray-300", text: "text-gray-300" };
    }
  })();

  return (
    <section
      className={`grid ${
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-8"
      } gap-6 mb-12`}
    >
      {data.map((card, index) => (
        <AnimatedCard
          key={index}
          title={card.title}
          value={card.value}
          index={index}
          isVehicle={isVehicle}
          isWater={isWater}
          isElectricity={isElectricity}
          isCO2={isCO2}
          colorClasses={colorClasses}
          activeTab={activeItem} // Pass activeItem here
        />
      ))}
    </section>
  );
}
