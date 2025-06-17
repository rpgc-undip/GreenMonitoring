import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faDroplet, faCloud, faCarSide, faMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { Area, AreaChart, LineChart, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer, Cell } from 'recharts';
import { Customized } from 'recharts';
import { Truck, Trash2, Fan, TreeDeciduous, Recycle, LandPlot } from "lucide-react";

const ANALOG_METER_CONFIG = {
  min: 0,
  max: 1000,
  unit: "ppm",
  thresholds: [
    { limit: 450, color: " #5BE12C", label: "Excellent" },
    { limit: 600, color: " #F5CD19", label: "Fair" },
    { limit: 800, color: " #F58B19", label: "Mediocre" },
    { limit: 1000, color: " #EA4228", label: "Bad" },
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
  const [selectedSeriesCarbon, setSelectedSeriesCarbon] = useState("day");
  const elChartData = chartDataEl?.[selectedSeriesEl] || [];
  const waterChartData = chartDataWater?.[selectedSeriesWater] || [];
  const co2ChartData = chartDataCO2?.[selectedSeriesCO2] || [];
  const vehChartData = chartDataVeh?.[selectedSeriesVeh] || [];
  const elCarbonData = chartDataEl?.[selectedSeriesCarbon] || [];
  const vehCarbonData = chartDataVeh?.[selectedSeriesCarbon] || [];
  
  const seriesKeysCO2 = ["y1", "y2", "y3", "y4", "avg"];
  const seriesKeysVeh = ["y1", "y2", "y3", "y4"];
  const vividColors = [" #FF851B", " #2ECC40" , " #0074D9", " #FFDC00", " #B10DC9"];

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

  const legendVeh = {
  y1: "Car/min",
  y2: "Mot/min",
  y3: "Total Car",
  y4: "Total Mot",
  };

const CustomTooltipUniversal = (legendMap, vividColors = []) => ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border p-2 rounded shadow text-xs text-gray-800">
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((entry, index) => {
          const key = entry.dataKey.split("_")[1];
          const color = entry.stroke || vividColors[index] || "#333"; // 🔑 Ambil stroke → fallback vividColors[index] → fallback #333
          return (
            <div key={index} className="flex justify-between gap-2">
              <span style={{ color }}>{legendMap[key] || key}</span>
              <span>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
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

const renderLegendVeh = (props) => {
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
              {legendVeh[entry.dataKey.split("_")[1]] || entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };


const carbonSeriesData = elCarbonData.map((item, index) => ({
  x: item.x,
  carbonEl: (item[`${selectedSeriesCarbon}_y1`] || 0) * 0.29,    // tonCO2/MWh
  carbonCar: vehCarbonData[index]?.[`${selectedSeriesCarbon}_y3`] * 0.1842 / 1000 || 0,  // tonCO2/km
  carbonMot: vehCarbonData[index]?.[`${selectedSeriesCarbon}_y4`] * 0.0555 / 1000 || 0,  // tonCO2/km
}));


const monthElData = chartDataEl?.month || [];
const totalMonthEl = monthElData.reduce((acc, curr) => acc + (Number(curr.month_y1)  || 0), 0) * 0.29;

const monthVehData = chartDataVeh?.month || [];
const totalMonthCar = monthVehData.reduce((acc, curr) => acc + (Number(curr.month_y3) || 0), 0) * 0.1842 / 1000;
const totalMonthMot = monthVehData.reduce((acc, curr) => acc + (Number(curr.month_y4) || 0), 0) * 0.0555 / 1000;
const totalCO2 = totalMonthEl + totalMonthMot + totalMonthCar;

  return (
    <div className="flex flex-col gap-6">
    {/* Right Card with Analog Meters */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex-1">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCloud} className="text-violet-500" />
            OUTDOOR AVERAGE CO₂ LEVEL
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

      {/* Garis pemisah */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400 to-transparent my-1" />

      {/* Top Row */}
      <div className="flex flex-wrap gap-6">
      {/* ELECTRICITY Chart */}
       <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-w-[300px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
            ELECTRICITY CONSUMPTION
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
            <BarChart data={elChartData}>
              <XAxis dataKey="x" />
              <YAxis
                label={{
                  value: 'kWh',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
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
                dataKey={`${selectedSeriesEl}_y1`}
                name={legendNames[selectedSeriesEl]?.y1 || "Rectorate"}
                fill={vividColors[0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CO2 Chart */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-w-[300px]">

          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCloud} className="text-purple-500" />
            CO₂ CONCENTRATION
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
                  style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
                }}
              />

              <Tooltip content={CustomTooltipUniversal(legendCO2, vividColors)} />
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
              {seriesKeysCO2.map((key, index) => (
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
      {/* WATER Chart */}
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
            <BarChart data={waterChartData}>
              <XAxis dataKey="x" />
              <YAxis
                label={{
                  value: 'Liter',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
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
                dataKey={`${selectedSeriesWater}_y1`}
                name={legendNames[selectedSeriesWater]?.y1 || "Rectorate"}
                fill={vividColors[2]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* VEHICLE Chart */}
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
            <BarChart data={vehChartData}>
              <XAxis dataKey="x" />

              {/* Y-Axis Kiri → sekarang untuk TOTAL */}
              <YAxis
                yAxisId="left"
                label={{
                  value: "Total",
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
                }}
              />

              {/* Y-Axis Kanan → sekarang untuk Per Minute */}
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "(Max) Per Minute",
                  angle: -90,
                  position: "insideRight",
                  offset: 15,
                  style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
                }}
              />

              <Tooltip content={CustomTooltipUniversal(legendVeh, vividColors)} />
              <Legend content={renderLegendVeh} />

              <Customized
                component={({ width, height }) => (
                  <text
                    x={width - 10}
                    y={height - 5}
                    textAnchor="end"
                    fill="black"
                    fontSize={12}
                  >
                    Note: The rightmost x-axis index is current time
                  </text>
                )}
              />

              {seriesKeysVeh.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={`${selectedSeriesVeh}_${key}`}
                  name={legendNames[selectedSeriesVeh][key]}
                  fill={vividColors[index]}
                  barSize={30}
                  yAxisId={["y3", "y4"].includes(key) ? "left" : "right"} // 🔁 Ditukar → y3 & y4 → kiri (TOTAL), y1 & y2 → kanan (Per Minute)
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>



      </div>

      {/* Garis pemisah */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400 to-transparent my-1" />

      <h2 className="text-gray-600 text-2xl text-left mb-0 leading-[1]">Carbon Footprint</h2>
        <div className="text-left text-xs text-gray-500 space-y-1 leading-tight">
          <p className="indent-0">Electricity uses CO₂ Emission Factor = 0.29 ton CO₂/MWh (Bitumenous Coal Power Plant)</p>
          <p className="indent-0">Gasoline passenger car uses CO₂ Emission Factor = 0.1842 kgCO₂/km, 1:12 Fuel Consumption Ratio</p>
          <p className="indent-0">Motorcycle uses CO₂ Emission Factor = 0.0555 kgCO₂/km, 1:40 Fuel Consumption Ratio</p> 
          <p className="indent-0 italic">Source: IPCC - Emission Factor Database (2023)</p>
        </div>

      <div className="flex flex-wrap gap-6">
          {/* CARDS -----------------------------------------------------------------------------------------------*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:w-1/3">
          {/* Card 1 ---------------------*/}
          <div className="bg-white shadow-lg rounded-2xl p-6 min-w-[100px]">
            <h2 className="text-sm font-bold mb-8 text-gray-800 text-center flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faCloud} className="text-gray-600" />
              TOTAL CO₂
            </h2>
            {monthVehData.length === 0 ? (
              <p className="text-center text-gray-500">Loading...</p>  
            ) : (
              <>
                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-xs">Daily Cumulative</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : totalCO2.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">ton CO₂</p>
                </div>
                </>
              )}
            </div>

          {/* Card 2 --------------------------*/}
          <div className="bg-white shadow-lg rounded-2xl p-6 min-w-[100px]">
              <h2 className="text-sm font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faCloud} className="text-gray-500" />
                CO₂ from Electricity
                <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
              </h2>
              {monthElData.length === 0 ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : (
                <>
                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-xs">Daily Cumulative</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalMonthEl) ? '0' : totalMonthEl.toFixed(2)} 
                  </p>
                  <p className="text-gray-500 text-sm">ton CO₂</p>
                  
                </div>
                </>
              )}
            </div>

          {/* Card 3 ---------------------------*/}
          <div className="bg-white shadow-lg rounded-2xl p-6 min-w-[100px]">
              <h2 className="text-sm font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faCloud} className="text-gray-500" />
                CO₂ from Cars
                <FontAwesomeIcon icon={faCarSide} className="text-teal-500" />
              </h2>
            {monthVehData.length === 0 ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <>
                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-xs">Daily Cumulative</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalMonthCar) ? '0' : totalMonthCar.toFixed(2)} 
                  </p>
                  <p className="text-gray-500 text-sm">ton CO₂</p>
                </div>
                </>
              )}
          </div>

          {/* Card 4 -----------------------------*/}
          <div className="bg-white shadow-lg rounded-2xl p-6 min-w-[100px]">
              <h2 className="text-sm font-bold mb-4 text-gray-800 text-center flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faCloud} className="text-gray-500" />
                CO₂ from Motorcycles
                <FontAwesomeIcon icon={faMotorcycle} className="text-pink-500" />
              </h2>
            {monthVehData.length === 0 ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <>
                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-xs">Daily Cumulative</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalMonthMot) ? '0' : totalMonthMot.toFixed(2)} 
                  </p>
                  <p className="text-gray-500 text-sm">ton CO₂</p>
                </div>
                </>
              )}  
          </div>
        </div>

        {/* CARBON OF ELECTRICITY Chart ---------------------------------------------------------------------------*/}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 lg:w-2/3">
         <p className="text-gray-600 text-xl text-left mb-0 leading-[2]">Carbon Footprint Chart of Electricity and Vehicles</p>
            <div className="flex justify-end space-x-1 mb-2">
              {["hour", "day", "week", "month"].map((label) => (
                <button
                  key={label}
                  className={`px-2 py-1 text-xs rounded font-semibold shadow-sm transition ${
                    selectedSeriesCarbon === label
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedSeriesCarbon(label)}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>
        
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={carbonSeriesData}>
                <defs>
                  {/* Gradient untuk Electricity */}
                  <linearGradient id="colorElectricity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={vividColors[0]} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={vividColors[0]} stopOpacity={0} />
                  </linearGradient>

                  {/* Gradient untuk Car */}
                  <linearGradient id="colorCar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#44bf97" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#44bf97" stopOpacity={0} />
                  </linearGradient>

                  {/* Gradient untuk Motorcycle */}
                  <linearGradient id="colorMot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF69B4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#FF69B4" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="x" />

                <YAxis
                  yAxisId="left"
                  label={{
                    value: 'ton CO₂ (Electricity)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 15,
                    style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
                  }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: 'ton CO₂/km (Vehicle)',
                    angle: 90,
                    position: 'insideRight',
                    offset: 5,
                    style: { fill: ' #6b7280', fontSize: 14, textAnchor: 'middle'}
                  }}
                />

                <Tooltip />
                <Legend content={renderLegend} />

                <Customized
                  component={({ width, height }) => (
                    <text
                      x={width - 10}
                      y={height - 5}
                      textAnchor="end"
                      fill="black"
                      fontSize={12}
                    >
                      Note: The rightmost x-axis index is current time
                    </text>
                  )}
                />

                {/* Area untuk Electricity */}
                <Area
                  type="monotone"
                  dataKey="carbonEl"
                  name="Electricity"
                  stroke={vividColors[0]}
                  fill="url(#colorElectricity)"
                  yAxisId="left"
                />

                {/* Area untuk Car */}
                <Area
                  type="monotone"
                  dataKey="carbonCar"
                  name="Car"
                  stroke="#44bf97"
                  fill="url(#colorCar)"
                  yAxisId="right"
                />

                {/* Area untuk Motorcycle */}
                <Area
                  type="monotone"
                  dataKey="carbonMot"
                  name="Motorcycle"
                  stroke="#FF69B4"
                  fill="url(#colorMot)"
                  yAxisId="right"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>     
        </div> 

      {/* Garis pemisah */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400 to-transparent my-2" />

        <h2 className="mt-0 text-gray-600 text-sm text-left mb-0 leading-[1]">The Total CO₂ Emission is equivalent to emission avoided by :</h2>
        {/* Bottom Cards -----------------------------------------------------------------------------------------*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-full">
                  <Recycle className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : (totalCO2 * 0.353).toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs">tons of waste recycled instead of landfilled</p>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-full">
                  <Trash2 className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : (totalCO2 * 85).toFixed(0)}
                </p>
                <p className="text-gray-500 text-xs">trash bags of waste recycled instead of landfilled</p>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-full">
                  <Truck className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : (totalCO2 * 0.05).toFixed(0)}
                </p>
                <p className="text-gray-500 text-xs">garbage trucks of waste recycled instead of landfilled</p>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-full">
                  <Fan className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : (totalCO2 * 0.0003).toFixed(2)}
                </p>
              <p className="text-gray-500 text-xs">wind turbines running for a year</p>
            </div>
          </div>

          <h2 className="col-span-full text-sm text-gray-600 mt-2 mb-2">The Total CO₂ Emission is equivalent to carbon sequestered by :</h2>  

          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-full">
                  <TreeDeciduous className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : (totalCO2 * 16.5).toFixed(0)}
                </p>
              <p className="text-gray-500 text-xs">tree seedlings grown for 10 years</p>
            </div>
          </div>
            <div className="bg-white shadow-md rounded-lg p-4">
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-full">
                  <LandPlot className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isNaN(totalCO2) ? '0' : totalCO2.toFixed(2)}
                </p>
              <p className="text-gray-500 text-xs">acres of U.S. forests in one year</p>
            </div>
          </div>

          <h2 className="col-span-full text-xs italic text-gray-600 mt-2 mb-2">Source: United States Environmental Protection Agency 2025</h2>  

        </div>

      
    </div>
  );
};

export default GaugeDisplay;
