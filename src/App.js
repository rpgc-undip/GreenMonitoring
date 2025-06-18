import { useEffect, useState, useRef, useCallback } from "react"; // add useRef, useCallback
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import Sidebar from "./Sidebar";
import CardGrid from "./CardGrid";
import ElectricityCharts from "./ElectricityCharts";
import VehicleChartAndVideo from "./VehicleChartAndVideo";
import StaticMap from "./StaticMap";
import CO2Chart from "./CO2Chart";
import GaugeDisplay from "./GaugeDisplay";
import 'leaflet/dist/leaflet.css';
import WeatherWidget from "./WeatherWidget"; // Adjust path if needed


const sidebarItems = ["OVERVIEW", "ELECTRICITY", "CO2", "WATER", "VEHICLE COUNTER"];
const itemLabels = {
  OVERVIEW: "",
  ELECTRICITY: "Realtime Parameters:",
  CO2: "Realtime Parameters:",
  WATER: "Realtime Parameters:",
  "VEHICLE COUNTER": "Realtime Parameters:",
};


const electricityLocation = [
  { lat: -7.04877900415822, lng: 110.43801488010942, label: "Sensor Location" }
];
const vehicleCounterLocation = [
  { lat: -7.055920045981158, lng: 110.43925653986874, label: "Sensor Location" }
];
const CO2Locations = [
  { lat: -7.05584344738717, lng: 110.43924313968952, label: "UNDIP Main Gate" },
  { lat: -7.0484367108677555, lng: 110.43804804103225, label: "UNDIP Library" },
  { lat: -7.050813016676236, lng: 110.43443476995584, label: "SV" },
  { lat: -7.049729293509732, lng: 110.44219046626196, label: "FSM" },
];
const waterLocation = [
  { lat: -7.048236647661722, lng: 110.43837163176853, label: "Sensor Location" }
];

function formatDateToGMT7(isoString) {
  const date = new Date(isoString);
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return gmt7.toISOString().replace("T", " ").substring(0, 19);
}

export default function App() {
  const [activeItem, setActiveItem] = useState("OVERVIEW"); // Set default active item to OVERVIEW
  const autoCycleRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const isPausedRef = useRef(false);
  const [cardData, setCardData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dailyChartData, setDailyChartData] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [co2ValueForGauge, setCo2ValueForGauge] = useState(0);
  const [vehicleCountForLCD, setVehicleCountForLCD] = useState(null);
  const [pivotElChart, setPivotElChart] = useState([]);
  const [pivotCO2Chart, setPivotCO2Chart] = useState([]);
  const [pivotWaterChart, setPivotWaterChart] = useState([]);
  const [pivotVehChart, setPivotVehChart] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    });

    const updateClock = () => {
      const now = new Date();
      const dateStr = formatter.format(now);
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour12: false,
        timeZone: "Asia/Jakarta",
      }).replace(/\./g, ':');
      setCurrentDateTime(`${dateStr}\n${timeStr}`);
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const path = `cards/${activeItem.replace(" ", "_")}`;
    const dataRef = ref(database, path);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCardData([]);
        return;
      }

      const formatted = Object.entries(data).map(([key, value]) => {
        let displayValue = value.value || 0;
        if (typeof displayValue === "string" && displayValue.includes("T")) {
          try {
            displayValue = formatDateToGMT7(displayValue);
          } catch {}
        }

        return {
          title: value.title || key,
          value: displayValue,
          value2: value.value2 !== undefined ? value.value2 : null,
        };
      });

      setCardData(formatted);
    });

    return () => unsubscribe();
  }, [activeItem]);

useEffect(() => {
  let unsubscribeMain = () => {};
  let unsubscribeDaily = () => {};

  if (activeItem === "ELECTRICITY") {
    const chartPath = `charts/${activeItem.replace(" ", "_")}`;
    const chartRef = ref(database, chartPath);

    unsubscribeMain = onValue(chartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roundedData = data.map((item) => ({
          x: item.x,
          y1: parseFloat(item.y1).toFixed(3),
          y2: parseFloat(item.y2).toFixed(3),
          y3: parseFloat(item.y3).toFixed(3),
          y4: item.y4 !== undefined ? parseFloat(item.y4).toFixed(3) : undefined,
        }));
        setChartData(roundedData);
      } else {
        setChartData([]);
      }
    });

    const dailyRef = ref(database, "charts/ELECTRICITY_DAILY_POWER");
    unsubscribeDaily = onValue(dailyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = data.map((item) => ({
          x: item.x,
          y1: parseFloat(item.y1).toFixed(3),
          y2: item.y2 !== undefined ? parseFloat(item.y2).toFixed(3) : null,
        }));
        setDailyChartData(formatted);
      } else {
        setDailyChartData([]);
      }
    });
  } else if (activeItem === "CO2") {
    const dailyRef = ref(database, "charts/CO2_DAILY");
    unsubscribeDaily = onValue(dailyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = data.map((item) => ({
          x: item.x,
          y1: parseFloat(item.y1).toFixed(3),
          y2: item.y2 !== undefined ? parseFloat(item.y2).toFixed(3) : null,
          y3: item.y3 !== undefined ? parseFloat(item.y3).toFixed(3) : null,
          y4: item.y4 !== undefined ? parseFloat(item.y4).toFixed(3) : null,
        }));
        setDailyChartData(formatted);
      } else {
        setDailyChartData([]);
      }
    });
  } else if (activeItem === "VEHICLE COUNTER") {
    const dailyRef = ref(database, "charts/VEHICLE_DAILY_COUNT");
    unsubscribeDaily = onValue(dailyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = data.map((item) => ({
          x: item.x,
          y1: parseFloat(item.y1).toFixed(3),
          y2: item.y2 !== undefined ? parseFloat(item.y2).toFixed(3) : null,
        }));
        setDailyChartData(formatted);
      } else {
        setDailyChartData([]);
      }
    });
  
  } else {
    setDailyChartData([]);
    setChartData([]); // Optional: clear main chart data if not ELECTRICITY
  }

  return () => {
    unsubscribeMain();
    unsubscribeDaily();
  };
}, [activeItem]);

//Data Fetch for OVERVIEW page
 useEffect(() => {
  if (activeItem !== "OVERVIEW") return;

  // Fetch CO₂ daily average data for analog meter display
  const co2Ref = ref(database, `cards/CO2/card25`);
  const unsubscribeCO2 = onValue(co2Ref, (snapshot) => {
    const row = snapshot.val();
    if (!row) return;
    const secondValue = row.value ?? row.value2 ?? null;
    if (secondValue !== null) {
      const numericValue = parseFloat(secondValue);
      if (!isNaN(numericValue)) {
        setCo2ValueForGauge(numericValue);
      }
    }
  });
  
  const pivotElectricityRef = ref(database, "charts/ELECTRICITY_PIVOT");
  const unsubscribePivotEl = onValue(pivotElectricityRef, (snapshot) => {
      const dataEl = snapshot.val();
      if (dataEl) {
        setPivotElChart(dataEl);
      }
    });

  const pivotCO2Ref = ref(database, "charts/CO2_PIVOT");
  const unsubscribePivotCO2 = onValue(pivotCO2Ref, (snapshot) => {
      const dataCO2 = snapshot.val();
      if (dataCO2) {
        setPivotCO2Chart(dataCO2);
      }
    });

  const pivotWaterRef = ref(database, "charts/WATER_PIVOT");
  const unsubscribePivotWater = onValue(pivotWaterRef, (snapshot) => {
      const dataWater = snapshot.val();
      if (dataWater) {
        setPivotWaterChart(dataWater);
      }
    });

const pivotVehRef = ref(database, "charts/VEHICLE_PIVOT");
  const unsubscribePivotVeh = onValue(pivotVehRef, (snapshot) => {
      const dataVeh = snapshot.val();
      if (dataVeh) {
        setPivotVehChart(dataVeh);
      }
    });


  return () => {
    unsubscribeCO2();
    unsubscribePivotEl();
    unsubscribePivotWater();
    unsubscribePivotCO2();
    unsubscribePivotVeh();
  };
}, [activeItem]);

// Enhanced tab change function with pause on manual click
const handleTabClick = useCallback((item) => {
  setActiveItem(item);

  // Pause cycling
  if (autoCycleRef.current) {
    clearInterval(autoCycleRef.current);
  }
  isPausedRef.current = true;

  // Resume auto cycling after 1 minute
  if (pauseTimeoutRef.current) {
    clearTimeout(pauseTimeoutRef.current);
  }
  pauseTimeoutRef.current = setTimeout(() => {
    isPausedRef.current = false;
    startAutoCycle(); // resume cycling
  }, 120000); // 120 sec pause
}, []);

// Auto cycle logic
const startAutoCycle = useCallback(() => {
  if (autoCycleRef.current) clearInterval(autoCycleRef.current);

  autoCycleRef.current = setInterval(() => {
    if (isPausedRef.current) return;

    setActiveItem((prev) => {
      const currentIndex = sidebarItems.indexOf(prev);
      const nextIndex = (currentIndex + 1) % sidebarItems.length;
      return sidebarItems[nextIndex];
    });
  }, 300000); // 20 seconds
}, []);

// Init auto-cycle on mount
useEffect(() => {
  startAutoCycle();
  return () => {
    clearInterval(autoCycleRef.current);
    clearTimeout(pauseTimeoutRef.current);
  };
}, [startAutoCycle]);


// === SAVE FUNCTION DITARUH DI SINI ===
  const saveDataToFile = () => {
    const now = new Date();
    const offset = 7 * 60; // GMT+7 → 7 jam × 60 menit
    const localTime = new Date(now.getTime() + offset * 60 * 1000);

    const timestamp = localTime
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d+Z$/, '');

    const dataToSave = {
      timestamp, // Sudah GMT+7
      electricity: pivotElChart,
      co2: pivotCO2Chart,
      water: pivotWaterChart,
      vehicle: pivotVehChart,
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const filename = `backup_${localTime.getFullYear()}-${String(
      localTime.getMonth() + 1
    ).padStart(2, "0")}-${String(localTime.getDate()).padStart(2, "0")}.json`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    };

  useEffect(() => {
    const checkAndBackup = () => {
      const now = new Date();
      const isFirstOfMonth = now.getDate() === 1;
      const isMidnight = now.getHours() === 0 && now.getMinutes() === 0;

      if (isFirstOfMonth && isMidnight) {
        saveDataToFile();
      }
    };

    const intervalId = setInterval(checkAndBackup, 60 * 1000); // Cek tiap menit
    return () => clearInterval(intervalId);
  }, [pivotElChart, pivotCO2Chart, pivotWaterChart, pivotVehChart]);


  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleTabClick}
      />
      <div className="relative flex-1 transition-all duration-300 min-h-screen p-6 ml-[50px] md:ml-[200px]">
        <main className="pt-0 bg-gray-100 min-h-screen">
          <header className="fixed top-0 left-0 right-0 bg-green-primary text-white h-14 flex items-center px-4 shadow-lg z-20 justify-between">
            <div className="flex items-center">
              <a href="https://undip.ac.id" target="_blank" rel="noopener noreferrer">
                <img src={`${process.env.PUBLIC_URL}/Logo.png`} alt="Logo" className="h-10 w-auto mr-3" />
              </a>
              <h1 className="text-xs sm:text-md md:text-2xl lg:text-2xl font-semibold">
                UNDIP GREEN MONITORING
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-right text-sm leading-tight whitespace-pre">
              <a href="https://undip.ac.id" target="_blank" rel="noopener noreferrer">
                <img src={`${process.env.PUBLIC_URL}/logo2.png`} alt="Logo2" className="h-10 w-auto mr-0" />
              </a>
              <a href="https://global.undip.ac.id" target="_blank" rel="noopener noreferrer">
                <img src={`${process.env.PUBLIC_URL}/global.png`} alt="globalLogo" className="h-10 w-22" />
              </a>
              <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">
                <img src={`${process.env.PUBLIC_URL}/sdg.png`} alt="sdgLogo" className="h-9 w-19" />
              </a>
              <a href="https://greenmetric.ui.ac.id" target="_blank" rel="noopener noreferrer">
                <img src={`${process.env.PUBLIC_URL}/ui.png`} alt="greenmetricLogo" className="h-9 w-19" />
              </a>
              <div className="font-semibold">{currentDateTime}</div>
            </div>
          </header>

          <h2 className="text-2xl font-semibold mb-4 mt-10">
            {itemLabels[activeItem]}
          </h2>

          {/* Add content for OVERVIEW tab */}
          {activeItem === "OVERVIEW" && (
            <section>
              <WeatherWidget city="-7.052,110.428" />
              <GaugeDisplay
                chartDataEl={pivotElChart}
                chartDataCO2={pivotCO2Chart}
                chartDataWater={pivotWaterChart}
                chartDataVeh={pivotVehChart}
                rightValues={[20, 130, 210, 360]}
                bottomLeftValues={[70, 190]}
                secondBarValue={co2ValueForGauge}
                lcdValues={vehicleCountForLCD}
              />
                {/* Tombol download manual */}
              <div className="mt-4">
                <button
                  onClick={saveDataToFile}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Download Chart Data
                </button>
              </div>
            </section>
          )}


          <CardGrid data={cardData} isVehicle={activeItem === "VEHICLE COUNTER"} activeItem={activeItem} />

          {activeItem === "ELECTRICITY" && (
            <>
              {/*<ElectricityCharts chartData={chartData} dailyChartData={dailyChartData} />*/}

              <StaticMap markers={electricityLocation} />
            </>
          )}

          {activeItem === "CO2" && (
            <section className="mt-8">
            {/*<CO2Chart dailyChartData={dailyChartData} />*/}
            <StaticMap markers={CO2Locations} />
            </section>
          )}
         
          {activeItem === "WATER" && (
            <section className="mt-8">
            <StaticMap markers={waterLocation} />
            </section>
          )}


          {activeItem === "VEHICLE COUNTER" && (
            <section className="mt-8">
              <VehicleChartAndVideo chartData={dailyChartData} />
              <StaticMap markers={vehicleCounterLocation} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
