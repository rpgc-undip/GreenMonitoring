import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faDroplet, faCloud, faCarSide } from '@fortawesome/free-solid-svg-icons';
import { Area, AreaChart, LineChart, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer, Cell } from 'recharts';
import { Customized } from 'recharts';

const ANALOG_METER_CONFIG = {
  min: 0,
  max: 1000,
  unit: "ppm",
  thresholds: [
    { limit: 450, color: "#5BE12C", label: "Excellent" },
    { limit: 600, color: "#F5CD19", label: "Fair" },
    { limit: 800, color: "#F58B19", label: "Mediocre" },
    { limit: 1000, color: "#EA4228", label: "Bad" },
  ],
};

const GaugeDisplay = ({
  chartDataEl = [],
  chartDataWater = [],
  chartDataCO2 = [],
  chartDataVeh = [],
  leftValues,
  rightValues,
  bottomLeftValues,
  secondBarValue,
  lcdValues,
}) => {
  const [globalCO2, setGlobalCO2] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);
  const [selectedSeriesEl, setSelectedSeriesEl] = useState("day");
  const [selectedSeriesWater, setSelectedSeriesWater] = useState("day");
  const [selectedSeriesCO2, setSelectedSeriesCO2] = useState("day");
  const [selectedSeriesVeh, setSelectedSeriesVeh] = useState("day");
  const filteredDataEl = chartDataEl.filter((d) => d.series === selectedSeriesEl);
  const filteredDataWater = chartDataWater.filter((d) => d.series === selectedSeriesWater);
  const co2ChartData = chartDataCO2?.[selectedSeriesCO2] || [];
  const filteredDataVeh = chartDataVeh.filter((d) => d.series === selectedSeriesVeh);

  const seriesKeys = ["y1", "y2", "y3", "y4", "avg"];
  const vividColors = ["#FF851B", "#2ECC40" , "#0074D9", "#FFDC00", "#B10DC9"];

  const legendNames = {
  hour: "Last 48 hours",
  day: "Last 60 days",
  week: "Last 10 weeks",
  month: "Months of 2025",
  };

  const legendCO2 = {
  y1: "UNDIP Main Gate",
  y2: "UNDIP Library",
  y3: "SV",
  y4: "FSM",
  avg: "Average",
  };

useEffect(() => {
  const STORAGE_KEY_VALUE = "noaaDataValue";
  const STORAGE_KEY_DATE = "noaaDataLastFetch";

  const isSameDay = (dateStr) => {
    if (!dateStr) return false;
    const storedDate = new Date(dateStr);
    const now = new Date();
    return (
      storedDate.getFullYear() === now.getFullYear() &&
      storedDate.getMonth() === now.getMonth() &&
      storedDate.getDate() === now.getDate()
    );
  };

  const fetchCO2 = async () => {
    try {
      const response = await fetch(
        "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.txt"
      );
      const text = await response.text();
      const lines = text.split("\n");

      // Filter lines that start with year and have enough columns
      const dataLines = lines.filter(
        (line) => /^\d{4}/.test(line.trim()) && line.trim().split(/\s+/).length >= 5
      );

      if (dataLines.length === 0) throw new Error("No valid CO₂ data lines found.");

      const latestValidLine = dataLines[dataLines.length - 1];
      const parts = latestValidLine.trim().split(/\s+/);

      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      const value = parseFloat(parts[4]);

      if (isNaN(value)) throw new Error("CO₂ value could not be parsed.");

      setGlobalCO2(value);
      setLastUpdateDate(`${year}-${month}-${day}`);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY_VALUE, JSON.stringify(value));
      localStorage.setItem(STORAGE_KEY_DATE, new Date().toISOString());
    } catch (err) {
      console.error("Failed to fetch CO₂ data", err);
    }
  };

  // Check localStorage first
  const cachedValue = localStorage.getItem(STORAGE_KEY_VALUE);
  const cachedDate = localStorage.getItem(STORAGE_KEY_DATE);

  if (cachedValue && cachedDate && isSameDay(cachedDate)) {
    // Use cached data if from today
    setGlobalCO2(JSON.parse(cachedValue));
    setLastUpdateDate(new Date(cachedDate).toISOString().split("T")[0]);
  } else {
    fetchCO2();
  }
}, []);


  const renderAnalogBar = (value, title) => {
  const { thresholds, max, unit } = ANALOG_METER_CONFIG;

  const { color, label } =
    thresholds.find((t, i) => value <= t.limit || i === thresholds.length - 1) ||
    thresholds[thresholds.length - 1];

  return (
    <div key={title} className="mb-6">
      <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        {/* Filled bar */}
        <div
          className="h-full rounded-full flex items-center justify-between px-3"
          style={{
            width: `${(value / max) * 100}%`,
            background: color,
            transition: "width 0.5s ease-in-out",
          }}
        >
          <span className="text-black text-sm font-bold drop-shadow-sm">
            {value} {unit}
          </span>
          <span className="text-black text-xs italic drop-shadow-sm">{label}</span>
        </div>

        {/* Max limit label superimposed on right */}
        <span
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold pointer-events-none select-none"
          style={{ textShadow: "0 0 2px white" }}
        >
          {max} {unit}
        </span>
      </div>
    </div>
  );
};

const renderLegendCO2 = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap gap-4 p-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {legendCO2[entry.dataKey.split("_")[1]] || entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

const renderLegend = (props) => {
  const { payload } = props; // array of legend items
  return (
    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
      {payload.map((entry) => (
        <span key={entry.value} style={{ marginRight: 10, color: entry.color }}>
          {'\u25A0'} {entry.value}
        </span>
      ))}
    </div>
  );
};

  return (
    <div className="flex flex-col gap-6">
    {/* Right Card with Analog Meters */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex-1">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCloud} className="text-violet-500" />
            OUTDOOR AVERAGE CO2 LEVEL
          </h2>
          {renderAnalogBar(secondBarValue ?? 0, "UNDIP Daily Average")}
          <div className="mb-6">
            <p className="mb-1 text-sm font-medium text-gray-600 flex items-center">
              Global Daily Average (NOAA)
              {lastUpdateDate && (
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (Last update: {lastUpdateDate})
                </span>
              )}
            </p>
            {renderAnalogBar(globalCO2 ?? 0, "")}
          </div>
        </div>

      {/* Top Row */}
      <div className="flex flex-wrap gap-6">
      {/* ELECTRICITY Chart */}
       <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-w-[300px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
            ELECTRICITY COST
          </h2>

          <div className="flex justify-end space-x-1 mb-2">
            {["hour", "day", "week", "month"].map((label) => (
              <button
                key={label}
                className={`px-2 py-1 text-xs rounded font-semibold shadow-sm transition ${
                  selectedSeriesEl === label
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSeriesEl(label)}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredDataEl}>
              <XAxis dataKey="x" />
              <YAxis
                label={{
                  value: 'Million Rp',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip />
              <Legend content={renderLegend} />
              <Customized
                component={({ width, height }) => (
                  <text
                    x={width - 10}          // Right padding
                    y={height - 5}         // Bottom padding
                    textAnchor="end"        // Align text to the end (right-aligned)
                    fill="black"
                    fontSize={12}
                  >
                    Note: The rightmost x-axis index is current time
                  </text>
                )}
              />
              <Bar
                dataKey="y"
                name={legendNames[selectedSeriesEl]}
                fill="#ff6d4e"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CO2 Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-w-[300px]">

          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCloud} className="text-purple-500" />
            CO2 CONCENTRATION
          </h2>

          <div className="flex justify-end space-x-1 mb-2">
            {["hour", "day", "week", "month"].map((label) => (
              <button
                key={label}
                className={`px-2 py-1 text-xs rounded font-semibold shadow-sm transition ${
                  selectedSeriesCO2 === label
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSeriesCO2(label)}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={co2ChartData}>
              <defs>
                {vividColors.map((color, index) => (
                  <linearGradient
                    key={color}
                    id={`colorGradient${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="x" />
              <YAxis
                label={{
                  value: 'ppm',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip />
              <Legend content={renderLegendCO2} />
              <Customized
                component={({ width, height }) => (
                  <text
                    x={width - 10}          // Right padding
                    y={height - 5}         // Bottom padding
                    textAnchor="end"        // Align text to the end (right-aligned)
                    fill="black"
                    fontSize={12}
                  >
                    Note: The rightmost x-axis index is current time
                  </text>
                )}
              />
              {seriesKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={`${selectedSeriesCO2}_${key}`}
                  stroke={vividColors[index]}
                  fill={`url(#colorGradient${index})`}
                  fillOpacity={0.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        

      </div>

      {/* Bottom Row */}
      <div className="flex flex-wrap gap-6">
      {/* WATER Card */}
       <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-w-[300px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faDroplet} className="text-blue-500" />
            WATER CONSUMPTION
          </h2>
          <div className="flex justify-end space-x-1 mb-2">
            {["hour", "day", "week", "month"].map((label) => (
              <button
                key={label}
                className={`px-2 py-1 text-xs rounded font-semibold shadow-sm transition ${
                  selectedSeriesWater === label
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSeriesWater(label)}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredDataWater}>
              <XAxis dataKey="x" />
              <YAxis
                label={{
                  value: 'Litres',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip />
              <Legend content={renderLegend} />
              <Customized
                component={({ width, height }) => (
                  <text
                    x={width - 10}          // Right padding
                    y={height - 5}         // Bottom padding
                    textAnchor="end"        // Align text to the end (right-aligned)
                    fill="black"
                    fontSize={12}
                  >
                    Note: The rightmost x-axis index is current time
                  </text>
                )}
              />
              <Bar
                dataKey="y"
                 name={legendNames[selectedSeriesWater]}
                fill="rgb(24, 99, 236)"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
 
        </div>
        
        {/* VEHICLE Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-w-[300px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCarSide} className="text-teal-500" />
            VEHICLE COUNTER
          </h2>
          <div className="flex justify-end space-x-1 mb-2">
            {["hour", "day", "week", "month"].map((label) => (
              <button
                key={label}
                className={`px-2 py-1 text-xs rounded font-semibold shadow-sm transition ${
                  selectedSeriesVeh === label
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSeriesVeh(label)}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredDataVeh}>
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend content={renderLegend} />
              <Customized
                component={({ width, height }) => (
                  <text
                    x={width - 10}          // Right padding
                    y={height - 5}         // Bottom padding
                    textAnchor="end"        // Align text to the end (right-aligned)
                    fill="black"
                    fontSize={12}
                  >
                    Note: The rightmost x-axis index is current time
                  </text>
                )}
              />
              <Bar
                dataKey="y"
                 name={legendNames[selectedSeriesVeh]}
                fill="rgb(52, 175, 163) "
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
 
        </div>

             
        {/* Bottom Right Placeholder */}
        {/*}   <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-h-[240px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCarSide} className="text-green-500" />
            VEHICLE COUNTER
          </h2>
          <p className="text-lg font-semibold text-gray-700 mb-10 text-left">
            Current Vehicle Count (Daily Reset)
          </p>
          <h2 className="font-lcd lcd-background text-7xl text-green-dark">
            {lcdValues}
          </h2>
        </div>
        */}  

      </div>
    </div>
  );
};

export default GaugeDisplay;
