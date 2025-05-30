import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STORAGE_KEY = "visibleMonths";

// Month config with label, key for chartData, color, and month index (0 = Jan)
const monthConfig = [
  { label: "January", key: "y0", color: "#ffadad", index: 0 },
  { label: "February", key: "y00", color: "#ffd6a5", index: 1 },
  { label: "March", key: "y1", color: "#00d5be", index: 2 },
  { label: "April", key: "y2", color: "#51a2ff", index: 3 },
  { label: "May", key: "y3", color: "#fb64b6", index: 4 },
  { label: "June", key: "y4", color: "#caffbf", index: 5 },
  { label: "July", key: "y5", color: "#9bf6ff", index: 6 },
  { label: "August", key: "y6", color: "#a0c4ff", index: 7 },
  { label: "September", key: "y7", color: "#bdb2ff", index: 8 },
  { label: "October", key: "y8", color: "#ffc6ff", index: 9 },
  { label: "November", key: "y9", color: "#fffffc", index: 10 },
  { label: "December", key: "y10", color: "#d0f4de", index: 11 },
];

export default function ElectricityCharts({ chartData, dailyChartData }) {
  const currentMonthIndex = new Date().getMonth(); // Get current month (0-based index)

  // Function to get initial visible months from localStorage or set default
  const getInitialVisibleMonths = () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    // If we have saved data in localStorage, use it
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Remove future months from being checked or visible
        Object.keys(parsed).forEach((month) => {
          const monthIndex = monthConfig.find(
            (item) => item.label === month
          )?.index;
          if (monthIndex > currentMonthIndex) {
            delete parsed[month]; // Remove future months
          }
        });
        return parsed;
      } catch {
        // If localStorage data is corrupted, fallback to default logic
      }
    }

    // Default: only current month selected (auto-check the current month)
    const initial = {};
    monthConfig.forEach(({ label, index }) => {
      if (index <= currentMonthIndex) {
        initial[label] = true; // Automatically select months up to the current month
      }
    });
    return initial;
  };

  const [visibleMonths, setVisibleMonths] = useState(getInitialVisibleMonths);

  // Save to localStorage when visibleMonths changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleMonths));
  }, [visibleMonths]);

  const toggleMonth = (label) => {
    setVisibleMonths((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    // Manually set current month as selected after component mount
    const updatedVisibleMonths = { ...visibleMonths };
    const currentMonthLabel = monthConfig[currentMonthIndex].label;
    updatedVisibleMonths[currentMonthLabel] = true;
    setVisibleMonths(updatedVisibleMonths);
  }, []);

  return (
    <section className="flex flex-col gap-6">
      {/* First Chart with Month Toggle Buttons */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">2025 Daily Energy Cost</h3>

        {/* Checklist controls inside the first chart */}
        <div className="flex flex-wrap gap-2 mb-4">
          {monthConfig.map(({ label, color, index }) => {
            const isActive = visibleMonths[label];
            const isCurrent = index === currentMonthIndex;

            return (
              index <= currentMonthIndex && ( // Ensure future months are not visible
                <button
                  key={label}
                  onClick={() => toggleMonth(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition
                    ${isActive ? "text-white" : "text-gray-600"} 
                    ${isCurrent ? "font-bold" : ""}`}
                  style={{
                    backgroundColor: isActive ? color : "transparent",
                    borderColor: color,
                  }}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </button>
              )
            );
          })}
        </div>

        {/* BarChart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              label={{
                value: "Time (Day)",
                position: "insideTop",
                offset: 22,
              }}
            />
            <YAxis
              label={{
                value: "Million Rp",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" align="center" layout="horizontal" />
            {monthConfig.map(
              ({ label, key, color, index }) =>
                index <= currentMonthIndex &&
                visibleMonths[label] && (
                  <Bar key={label} dataKey={key} fill={color} name={label} />
                )
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Second Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Hourly Active Power Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              label={{
                value: "Time (Hour)",
                position: "insideTop",
                offset: 22,
              }}
            />
            <YAxis
              domain={[0, 150]}
              label={{
                value: "kiloWatt",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" align="center" layout="horizontal" />
            <Area
              type="basis"
              dataKey="y1"
              stroke="#4F46E5"
              fill="#4F46E520"
              strokeWidth={2}
              name="Today"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="basis"
              dataKey="y2"
              stroke="#EF4444"
              fill="#EF444420"
              strokeWidth={2}
              name="Yesterday"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}