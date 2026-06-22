import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/sora/800.css';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Clock3,
  Download,
  Droplets,
  Factory,
  FileText,
  Gauge,
  Globe2,
  LayoutDashboard,
  Leaf,
  Menu,
  Recycle,
  RefreshCw,
  Settings,
  Sprout,
  ThermometerSun,
  Trash2,
  Trees,
  Sun,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import './styles.css';

const sheetCsvUrl = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL;
const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
const sheetGid = import.meta.env.VITE_GOOGLE_SHEET_GID || '0';
const baseUrl = import.meta.env.BASE_URL || '/';
const asset = (path) => `${baseUrl}${path.replace(/^\//, '')}`;
const electricitySheetRange = 'A3:P3';
const electricityDataSources = [
  { locationIndex: 0, label: 'Rektorat', sheetId: '1AB5faE_-2SRwa4OaCKoelrmmaZFWLSuXNXUpMZAGM1U', gid: '1826479543' },
  { locationIndex: 1, label: 'SV', sheetId: '1hLMx0BpeHfp6CRM12yAj70CNToTzpnUa1fZCGCUuv2U', gid: '1724177852' },
  { locationIndex: 2, label: 'FH', sheetId: '1DXcTY-INHF-NCPvTbeQWCsNebdlB9crhulR2RzAvouQ', gid: '0' },
  { locationIndex: 3, label: 'FISIP', sheetId: '1peEXC8o0Ae082aydlNCfnngEXixKARIJoXIU_f031_w', gid: '0' },
  { locationIndex: 4, label: 'FEB', sheetId: '1LzdHZqDwMB8jr7IBUUT6wEM728Wa8gyTaZhoNwKnYeI', gid: '0' },
  { locationIndex: 5, label: 'FT', sheetId: '1tTMn1X2I6LsJI265Sw2aNhDJRX7uN24rkL85-eh8k7o', gid: '0' },
];
const electricityPowerSeriesColors = ['#1f6feb', '#e76f51', '#0f8f76', '#7c3aed', '#f59e0b', '#2ec4b6'];
const waterSheetRange = 'A3:C3';
const waterDailyFlowRange = 'A3:C26';
const waterDataSources = [
  {
    locationIndex: 0,
    label: 'Rektorat',
    sheetId: '1vcx507sIXFwaGqqvqIl5iqSET5gLFFje8E2hyoL_Hag',
    dailyFlow: { sheet: 'WaterDaily', range: 'E3:G26', xIndex: 0, yIndex: 2 },
  },
  { locationIndex: 1, label: 'SV', sheetId: '1-yCXbLyO9rIKQFk7zGLK3180RDgP0Jj2HsWHId-IXRg' },
  { locationIndex: 2, label: 'FH', sheetId: '1dWEIe_oylgkxNd7ga0qLcpCmxOsqxvkWqqIA3b0dOUI' },
  { locationIndex: 3, label: 'FISIP', sheetId: '1Etn01LI2k89ca2EuY227I3hLRn-iF5z9qjPa9Wkpprk' },
  { locationIndex: 4, label: 'FEB', sheetId: '1MePO6zXY6FPUUrbZWHT8OpeoCUSxLwVXmTUPz9l4aFA' },
  { locationIndex: 5, label: 'FT', sheetId: '1LounSZFMskmbGjQWe7xdXTM_5R_iwMq1DpqGAw2QggU' },
];
const vehicleSheetId = '1M2mD4HN8jqTJPBAodWBPjcm7_mGk25tzkmc8Qi27k30';
const vehicleRecentRange = 'A3:G3';
const vehicleLocation = 'Undip Entry Gate';
const vehicleSeries = [
  { id: 'carRate', label: 'Cars/min', color: '#1f6feb' },
  { id: 'motorRate', label: 'Motorcycles/min', color: '#2ec4b6' },
  { id: 'truckRate', label: 'Trucks/min', color: '#e76f51' },
  { id: 'carTotal', label: 'Total Cars', color: '#7c3aed' },
  { id: 'motorTotal', label: 'Total Motorcycles', color: '#f59e0b' },
  { id: 'truckTotal', label: 'Total Trucks', color: '#0f766e' },
];
const vehicleCounterScales = {
  hourly: {
    label: 'Hourly',
    range: 'A3:H50',
    totalRowOffset: 25,
    totalYIndexes: [5, 6, 7],
    xIndex: 0,
    yIndexes: [2, 3, 4],
  },
  daily: { label: 'Daily', range: 'J3:Q32', xIndex: 0, yIndexes: [2, 3, 4, 5, 6, 7] },
  weekly: { label: 'Weekly', range: 'T3:Z54', xIndex: 0, yIndexes: [1, 2, 3, 4, 5, 6] },
  monthly: { label: 'Monthly', range: 'AB3:AI14', xIndex: 0, yIndexes: [2, 3, 4, 5, 6, 7] },
};
const carbonEmissionFactors = {
  electricityTonPerKwh: 0.29 / 1000,
  gasolineKgPerKm: 0.1842,
  motorcycleKgPerKm: 0.0555,
  vehicleDistanceKm: 1,
};
const epaEquivalencyFactors = {
  acresForestTonPerYear: 1.0,
  garbageTruckTon: 19.81,
  trashBagTon: 0.0118,
  treeSeedlingTenYearsTon: 0.060 * 10,
  wasteRecycledTon: 2.83,
  windTurbineTonPerYear: 3348,
};
const carbonSeries = {
  electricity: { id: 'electricity', label: 'Electricity', color: '#1f6feb' },
  carsTrucks: { id: 'carsTrucks', label: 'Cars+Trucks', color: '#e76f51' },
  motorcycles: { id: 'motorcycles', label: 'Motorcycles', color: '#2ec4b6' },
  vehicle: { id: 'vehicle', label: 'Vehicle Total', color: '#7c3aed' },
};
const co2SheetId = '1bZe-Fpk380O8PvKIr8l_xXTc7okV7_tHF6wY7Bk_RuE';
const co2RecentRange = 'A3:S3';
const co2DailyTemperatureRange = 'E3:J26';
const globalCo2CsvUrl = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.csv';
const co2Locations = [
  { label: 'Pos Satpam Entry Gate', lat: -7.055947, lon: 110.439231, recentStartIndex: 0 },
  { label: 'Pos Satpam Perpus', lat: -7.048522, lon: 110.438124, recentStartIndex: 5 },
  { label: 'SV', lat: -7.050954, lon: 110.434647, recentStartIndex: 10 },
  { label: 'FSM', lat: -7.049593, lon: 110.442268, recentStartIndex: 15 },
];
const co2Series = [
  { id: 'entry', label: 'Pos Satpam Entry Gate', color: '#1f6feb' },
  { id: 'perpus', label: 'Pos Satpam Perpus', color: '#e76f51' },
  { id: 'sv', label: 'SV', color: '#0f8f76' },
  { id: 'fsm', label: 'FSM', color: '#7c3aed' },
];
const co2SeriesWithAverage = [
  ...co2Series,
  { id: 'average', label: 'Average', color: '#334155' },
];
const co2HistoryScales = {
  hourly: { label: 'Hourly', range: 'A3:G26', xIndex: 0, yIndexes: [2, 3, 4, 5, 6] },
  daily: { label: 'Daily', range: 'I3:O32', xIndex: 0, yIndexes: [2, 3, 4, 5, 6] },
  weekly: { label: 'Weekly', range: 'R3:W54', xIndex: 0, yIndexes: [1, 2, 3, 4, 5] },
  monthly: { label: 'Monthly', range: 'Y3:AE14', xIndex: 0, yIndexes: [2, 3, 4, 5, 6] },
};
const energyHistoryScales = {
  hourly: { label: 'Hourly', range: 'A3:D26', xIndex: 0, yIndex: 3 },
  daily: { label: 'Daily', range: 'F3:I32', xIndex: 0, yIndex: 3 },
  weekly: { label: 'Weekly', range: 'L3:N54', xIndex: 0, yIndex: 2 },
  monthly: { label: 'Monthly', range: 'P3:S14', xIndex: 0, yIndex: 3 },
};
const energyHistoryCache = new Map();
const energyHistoryCacheTtlMs = 60 * 60 * 1000;
const electricityRowsCache = new Map();
const electricityRowsCacheKey = `electricityRows:Recent:${electricitySheetRange}:${electricityDataSources.map((source) => source.sheetId).join('|')}`;
const electricityRowsCacheTtlMs = 60 * 60 * 1000;
const dailyPowerRange = 'A3:C26';
const dailyPowerCache = new Map();
const dailyPowerCacheTtlMs = 60 * 60 * 1000;
const waterRowsCache = new Map();
const waterRowsCacheKey = `waterRows:${waterDataSources.map((source) => source.sheetId).join('|')}`;
const waterRowsCacheTtlMs = 60 * 60 * 1000;
const waterDailyFlowCache = new Map();
const waterDailyFlowCacheTtlMs = 60 * 60 * 1000;
const waterTotalizerHistoryCache = new Map();
const waterTotalizerHistoryCacheTtlMs = 60 * 60 * 1000;
const vehicleRowsCache = new Map();
const vehicleRowsCacheKey = 'vehicleRows';
const vehicleRowsCacheTtlMs = 60 * 60 * 1000;
const vehicleCounterCache = new Map();
const vehicleCounterCacheTtlMs = 60 * 60 * 1000;
const carbonElectricityCache = new Map();
const carbonElectricityCacheTtlMs = 60 * 60 * 1000;
const carbonVehicleCache = new Map();
const carbonVehicleCacheTtlMs = 60 * 60 * 1000;
const co2RowsCache = new Map();
const co2RowsCacheKey = 'co2Rows';
const co2RowsCacheTtlMs = 60 * 60 * 1000;
const co2TemperatureCache = new Map();
const co2TemperatureCacheKey = 'co2Temperature';
const co2TemperatureCacheTtlMs = 60 * 60 * 1000;
const co2HistoryCache = new Map();
const co2HistoryCacheTtlMs = 60 * 60 * 1000;
const globalCo2Cache = new Map();
const globalCo2CacheKey = 'globalCo2';
const globalCo2CacheTtlMs = 60 * 60 * 1000;
const summarySheetId = '17CxcQA57OPqrI9UdvH4OAfwbDWAtiAFCuQyXWhGUC2M';
const summarySheetGid = '389176796';
const summaryCache = new Map();
const summaryCacheKey = 'centralMetrics';
const summaryCacheTtlMs = 60 * 60 * 1000;
const reportHistoryCache = new Map();
const reportHistoryCacheTtlMs = 60 * 60 * 1000;
const weatherLatitude = -7.0056;
const weatherLongitude = 110.4094;
const weatherTimezone = 'Asia/Jakarta';
const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${weatherLatitude}&longitude=${weatherLongitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&current_weather=true&timezone=${weatherTimezone}&forecast_days=4`;

const summaryCategories = {
  electricity: { label: 'Electricity', icon: Zap, tone: 'blue', primaryKey: 'energy_today_kwh', primaryUnit: 'kWh' },
  water: { label: 'Water', icon: Droplets, tone: 'green', primaryKey: 'current_today_vol_m3', primaryUnit: 'm³' },
  co2: { label: 'CO₂', icon: Cloud, tone: 'green', primaryKey: 'current_avg_co2_ppm', primaryUnit: 'ppm' },
  vehicle: { label: 'Vehicle', icon: Car, tone: 'amber', primaryKey: 'today_vehicle_count', primaryUnit: '' },
};
const alertCategories = {
  ...summaryCategories,
  other: { label: 'Other', icon: Wifi, tone: 'neutral' },
};
const summaryArtwork = {
  electricity: asset('/summary/electricity-trim.png'),
  water: asset('/summary/water-trim.png'),
  co2: asset('/summary/co2-trim.png'),
  vehicle: asset('/summary/vehicle-trim.png'),
};
const summaryExpectedSites = ['Rektorat', 'SV', 'FH', 'FISIP', 'FEB', 'FT'];

const fallbackSensors = [
  { lokasi: 'Main Panel', parameter: 'Voltage', nilai: '229', satuan: 'V', status: 'Normal', updated_at: '2026-06-02 08:12' },
  { lokasi: 'Server Room', parameter: 'Temperature', nilai: '27.4', satuan: 'C', status: 'Normal', updated_at: '2026-06-02 08:10' },
  { lokasi: 'Water Pump', parameter: 'Current', nilai: '18.2', satuan: 'A', status: 'Warning', updated_at: '2026-06-02 08:09' },
  { lokasi: 'Production Line', parameter: 'Humidity', nilai: '61', satuan: '%', status: 'Normal', updated_at: '2026-06-02 08:08' },
  { lokasi: 'Warehouse', parameter: 'Connection', nilai: '99.2', satuan: '%', status: 'Normal', updated_at: '2026-06-02 08:07' },
];

const navItems = [
  { id: 'summary', label: 'Summary', icon: LayoutDashboard },
  { id: 'electricity', label: 'Electricity', icon: Zap },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'co2', label: 'Carbon Dioxide', icon: Cloud },
  { id: 'vehicle', label: 'Vehicle Counter', icon: Car },
  { id: 'carbon', label: 'Carbon Footprint', icon: Leaf },
  { id: 'weather', label: 'Weather', icon: ThermometerSun },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'howItWorks', label: 'How It Works', icon: FileText },
];

const electricityLocations = ['Rektorat', 'SV', 'FH', 'FISIP', 'FEB', 'FT'];
const emptyElectricityValues = Array(electricityLocations.length).fill('');
const waterLocations = ['Rektorat', 'SV', 'FH', 'FISIP', 'FEB', 'FT'];
const emptyWaterValues = Array(waterLocations.length).fill('');

const electricityRows = [
  { parameter: 'Last seen', values: emptyElectricityValues },
  { parameter: 'Voltage L1-L2 (V)', values: emptyElectricityValues },
  { parameter: 'Voltage L2-L3 (V)', values: emptyElectricityValues },
  { parameter: 'Voltage L1-L3 (V)', values: emptyElectricityValues },
  { parameter: 'Voltage L1-N (V)', values: emptyElectricityValues },
  { parameter: 'Voltage L2-N (V)', values: emptyElectricityValues },
  { parameter: 'Voltage L3-N (V)', values: emptyElectricityValues },
  { parameter: 'Current I1 (A)', values: emptyElectricityValues },
  { parameter: 'Current I2 (A)', values: emptyElectricityValues },
  { parameter: 'Current I3 (A)', values: emptyElectricityValues },
  { parameter: 'Active Power (kW)', values: emptyElectricityValues },
  { parameter: 'Reactive Power (kVAr)', values: emptyElectricityValues },
  { parameter: 'Power Factor', values: emptyElectricityValues },
  { parameter: 'Frequency (Hz)', values: emptyElectricityValues },
  { parameter: 'Energy (kWh)', values: emptyElectricityValues },
  { parameter: 'Cost (M Rp)', values: emptyElectricityValues },
];

const waterRows = [
  { parameter: 'Last seen', values: emptyWaterValues },
  { parameter: 'Flow (m3/h)', values: emptyWaterValues },
  { parameter: 'Totalizer (m3)', values: emptyWaterValues },
];
const emptyVehicleValues = [''];
const vehicleRows = [
  { parameter: 'Last seen', values: emptyVehicleValues },
  { parameter: 'Cars/min', values: emptyVehicleValues },
  { parameter: 'Motorcycles/min', values: emptyVehicleValues },
  { parameter: 'Trucks/min', values: emptyVehicleValues },
  { parameter: 'Total Cars', values: emptyVehicleValues },
  { parameter: 'Total Motorcycles', values: emptyVehicleValues },
  { parameter: 'Total Trucks', values: emptyVehicleValues },
];
const emptyCo2Values = Array(co2Locations.length).fill('');
const co2Rows = [
  { parameter: 'Last seen', values: emptyCo2Values },
  { parameter: 'Humidity (%)', values: emptyCo2Values },
  { parameter: 'Temperature (C)', values: emptyCo2Values },
  { parameter: 'CO₂ (ppm)', values: emptyCo2Values },
  { parameter: 'Sensor Location', values: co2Locations.map((location) => ({ lat: location.lat, lon: location.lon })) },
];

function parseMeasurement(value) {
  const normalized = String(value).replace(',', '.');
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function getElectricityCondition(parameter, value) {
  if (parameter === 'Last seen') return 'neutral';

  const numericValue = parseMeasurement(value);
  if (numericValue === null) return 'neutral';

  if (parameter.includes('L1-L2') || parameter.includes('L2-L3') || parameter.includes('L1-L3')) {
    return numericValue >= 361 && numericValue <= 399 ? 'normal' : 'warning';
  }

  if (parameter.includes('L1-N') || parameter.includes('L2-N') || parameter.includes('L3-N')) {
    return numericValue >= 209 && numericValue <= 231 ? 'normal' : 'warning';
  }

  if (parameter.includes('Current')) {
    return numericValue < 400 ? 'normal' : 'warning';
  }

  if (parameter === 'Power Factor') {
    return numericValue < 0.7 ? 'warning' : 'normal';
  }

  return 'neutral';
}

function splitTimestampValue(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(.+?)[ T]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)$/i);
  return match ? { date: match[1], time: match[2] } : null;
}

function formatWeatherTimeLabel(value) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatWeatherDateLabel(value) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getCurrentWeatherHourIndex(weather) {
  if (!weather?.hourly?.time?.length) return 0;
  const target = weather?.current_weather?.time;
  if (!target) return 0;

  let index = weather.hourly.time.findIndex((item) => item === target);
  if (index >= 0) return index;

  const targetTime = new Date(String(target)).getTime();
  if (!Number.isFinite(targetTime)) return 0;

  index = weather.hourly.time.findIndex((item) => {
    const itemTime = new Date(String(item)).getTime();
    return Number.isFinite(itemTime) && Math.abs(itemTime - targetTime) < 1000 * 60 * 45;
  });

  return index >= 0 ? index : 0;
}

function getWeatherHourlyPoints(weather) {
  if (!weather?.hourly?.time?.length || !weather?.hourly?.temperature_2m?.length) return [];

  // Build points for today's date from 00:00 to 23:00.
  const currentIndex = getCurrentWeatherHourIndex(weather);
  const currentDateStr = String(weather?.current_weather?.time || '').split('T')[0];
  // Fallback to first hourly date if current_weather missing
  const fallbackDateStr = String(weather.hourly.time?.[0] || '').split('T')[0];
  const targetDate = currentDateStr || fallbackDateStr;

  const points = [];
  for (let i = 0; i < weather.hourly.time.length; i += 1) {
    const t = String(weather.hourly.time[i] || '');
    if (!t.startsWith(targetDate)) continue;
    const hourLabel = formatWeatherTimeLabel(t);
    const observed = i <= currentIndex;
    points.push({
      label: hourLabel,
      value: weather.hourly.temperature_2m?.[i],
      humidity: weather.hourly.relativehumidity_2m?.[i],
      wind: weather.hourly.windspeed_10m?.[i],
      rainChance: weather.hourly.precipitation_probability?.[i],
      uvIndex: weather.hourly.uv_index?.[i],
      estimated: observed ? false : true,
    });
  }

  return points;
}

function getWeatherDailyForecasts(weather) {
  if (!weather?.daily) return [];
  return weather.daily.time.map((date, index) => ({
    date,
    label: formatWeatherDateLabel(date),
    max: weather.daily.temperature_2m_max[index],
    min: weather.daily.temperature_2m_min[index],
    precipitation: weather.daily.precipitation_sum[index],
    sunrise: weather.daily.sunrise[index],
    sunset: weather.daily.sunset[index],
  }));
}

async function fetchWeatherData() {
  const response = await fetch(weatherApiUrl);
  if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
  return response.json();
}

function getCsvUrl() {
  if (sheetCsvUrl) return sheetCsvUrl;
  if (sheetId) return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
  return '';
}

function getSummaryCsvUrl() {
  const params = new URLSearchParams({
    format: 'csv',
    gid: summarySheetGid,
  });

  return `https://docs.google.com/spreadsheets/d/${summarySheetId}/export?${params.toString()}`;
}

function getElectricityCsvUrl(source) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: 'Recent',
    range: electricitySheetRange,
  });

  return `https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq?${params.toString()}`;
}

function getEnergyHistoryCsvUrl(source, scale) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: 'Pivot',
    range: energyHistoryScales[scale].range,
  });

  return `https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq?${params.toString()}`;
}

function getDailyPowerCsvUrl(source) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: 'DailyPower',
    range: dailyPowerRange,
  });

  return `https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq?${params.toString()}`;
}

function getWaterRecentCsvUrl(source) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: 'Recent',
    range: waterSheetRange,
  });

  return `https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq?${params.toString()}`;
}

function getWaterDailyFlowCsvUrl(source) {
  const dailyFlow = source.dailyFlow || {};
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: dailyFlow.sheet || 'DailyFlow',
    range: dailyFlow.range || waterDailyFlowRange,
  });

  return `https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq?${params.toString()}`;
}

function getWaterTotalizerHistoryCsvUrl(source, scale) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: 'Pivot',
    range: energyHistoryScales[scale].range,
  });

  return `https://docs.google.com/spreadsheets/d/${source.sheetId}/gviz/tq?${params.toString()}`;
}

function getVehicleCsvUrl(sheet, range) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet,
    range,
  });

  return `https://docs.google.com/spreadsheets/d/${vehicleSheetId}/gviz/tq?${params.toString()}`;
}

function getCo2CsvUrl(sheet, range) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet,
    range,
  });

  return `https://docs.google.com/spreadsheets/d/${co2SheetId}/gviz/tq?${params.toString()}`;
}

function getEnergyHistoryCacheKey(source, scale) {
  return `${source.sheetId}:${scale}`;
}

function getCachedEnergyHistory(source, scale) {
  const cached = energyHistoryCache.get(getEnergyHistoryCacheKey(source, scale));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > energyHistoryCacheTtlMs) {
    energyHistoryCache.delete(getEnergyHistoryCacheKey(source, scale));
    return null;
  }

  return cached.points;
}

function setCachedEnergyHistory(source, scale, points) {
  energyHistoryCache.set(getEnergyHistoryCacheKey(source, scale), {
    cachedAt: Date.now(),
    points,
  });
}

function getCachedRows(cache, key, ttlMs) {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > ttlMs) {
    cache.delete(key);
    return null;
  }

  return cached;
}

function setCachedRows(cache, key, rows, lastSync) {
  cache.set(key, {
    cachedAt: Date.now(),
    lastSync,
    rows,
  });
}

function getDailyPowerCacheKey(source) {
  return source.sheetId;
}

function getCachedDailyPower(source) {
  const cached = dailyPowerCache.get(getDailyPowerCacheKey(source));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > dailyPowerCacheTtlMs) {
    dailyPowerCache.delete(getDailyPowerCacheKey(source));
    return null;
  }

  return cached.points;
}

function setCachedDailyPower(source, points) {
  dailyPowerCache.set(getDailyPowerCacheKey(source), {
    cachedAt: Date.now(),
    points,
  });
}

function getWaterDailyFlowCacheKey(source) {
  return source.sheetId;
}

function getCachedWaterDailyFlow(source) {
  const cached = waterDailyFlowCache.get(getWaterDailyFlowCacheKey(source));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > waterDailyFlowCacheTtlMs) {
    waterDailyFlowCache.delete(getWaterDailyFlowCacheKey(source));
    return null;
  }

  return cached.points;
}

function setCachedWaterDailyFlow(source, points) {
  waterDailyFlowCache.set(getWaterDailyFlowCacheKey(source), {
    cachedAt: Date.now(),
    points,
  });
}

function getWaterTotalizerHistoryCacheKey(source, scale) {
  return `${source.sheetId}:${scale}`;
}

function getCachedWaterTotalizerHistory(source, scale) {
  const cached = waterTotalizerHistoryCache.get(getWaterTotalizerHistoryCacheKey(source, scale));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > waterTotalizerHistoryCacheTtlMs) {
    waterTotalizerHistoryCache.delete(getWaterTotalizerHistoryCacheKey(source, scale));
    return null;
  }

  return cached.points;
}

function setCachedWaterTotalizerHistory(source, scale, points) {
  waterTotalizerHistoryCache.set(getWaterTotalizerHistoryCacheKey(source, scale), {
    cachedAt: Date.now(),
    points,
  });
}

function getVehicleCounterCacheKey(scale) {
  return scale;
}

function getCachedVehicleCounter(scale) {
  const cached = vehicleCounterCache.get(getVehicleCounterCacheKey(scale));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > vehicleCounterCacheTtlMs) {
    vehicleCounterCache.delete(getVehicleCounterCacheKey(scale));
    return null;
  }

  return cached.series;
}

function setCachedVehicleCounter(scale, series) {
  vehicleCounterCache.set(getVehicleCounterCacheKey(scale), {
    cachedAt: Date.now(),
    series,
  });
}

function getCarbonCacheKey(scale) {
  return scale;
}

function getCachedCarbonSeries(cache, scale, ttlMs) {
  const cached = cache.get(getCarbonCacheKey(scale));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > ttlMs) {
    cache.delete(getCarbonCacheKey(scale));
    return null;
  }

  return cached.series;
}

function setCachedCarbonSeries(cache, scale, series) {
  cache.set(getCarbonCacheKey(scale), {
    cachedAt: Date.now(),
    series,
  });
}

function getCo2HistoryCacheKey(scale) {
  return scale;
}

function getCachedCo2History(scale) {
  const cached = co2HistoryCache.get(getCo2HistoryCacheKey(scale));
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > co2HistoryCacheTtlMs) {
    co2HistoryCache.delete(getCo2HistoryCacheKey(scale));
    return null;
  }

  return cached.series;
}

function setCachedCo2History(scale, series) {
  co2HistoryCache.set(getCo2HistoryCacheKey(scale), {
    cachedAt: Date.now(),
    series,
  });
}

function parseCsvRows(csvText) {
  const rows = [];
  let cell = '';
  let row = [];
  let quoted = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function parseCsv(csvText) {
  const rows = parseCsvRows(csvText);
  const [headers = [], ...dataRows] = rows;
  return dataRows.map((dataRow) =>
    headers.reduce((record, header, index) => {
      record[header.trim().toLowerCase().replaceAll(' ', '_')] = dataRow[index] ?? '';
      return record;
    }, {}),
  );
}

function parseChartNumber(value) {
  const normalized = String(value ?? '').replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseChartDate(label) {
  const text = String(label || '').trim();
  const isoMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) return createValidChartDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));

  const localMatch = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (localMatch) {
    const year = Number(localMatch[3].length === 2 ? `20${localMatch[3]}` : localMatch[3]);
    return parseAmbiguousChartDate(Number(localMatch[1]), Number(localMatch[2]), year);
  }

  const localDateInLabel = text.match(/(?:^|[^\d])(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})(?=$|[^\d])/);
  if (localDateInLabel) {
    const year = Number(localDateInLabel[3].length === 2 ? `20${localDateInLabel[3]}` : localDateInLabel[3]);
    return parseAmbiguousChartDate(Number(localDateInLabel[1]), Number(localDateInLabel[2]), year);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function createValidChartDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function parseAmbiguousChartDate(first, second, year) {
  if (second > 12 && first <= 12) return createValidChartDate(year, first, second);
  if (first > 12 && second <= 12) return createValidChartDate(year, second, first);
  return createValidChartDate(year, second, first);
}

function isWeekendLabel(label) {
  const text = String(label || '').trim().toLowerCase();
  const dayNameMatch = text.match(/^\s*(senin|selasa|rabu|kamis|jumat|sabtu|minggu|mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\b/);
  if (dayNameMatch) return ['sabtu', 'minggu', 'sat', 'saturday', 'sun', 'sunday'].includes(dayNameMatch[1]);

  const date = parseChartDate(label);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

function buildTomorrowEnergyForecast(points) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const datedPoints = points
    .map((point) => ({ ...point, date: parseChartDate(point.label) }))
    .filter((point) => point.date && point.date <= today && point.hasValue !== false)
    .sort((left, right) => left.date - right.date);

  if (datedPoints.length < 2) return null;

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDay = tomorrow.getDay();
  const targetIsWeekend = targetDay === 0 || targetDay === 6;
  const sameWeekday = datedPoints.filter((point) => point.date.getDay() === targetDay);
  const sameDayType = datedPoints.filter((point) => {
    const day = point.date.getDay();
    return (day === 0 || day === 6) === targetIsWeekend;
  });
  const candidates = (sameWeekday.length >= 2 ? sameWeekday : sameDayType).slice(-6);
  const weightedTotal = candidates.reduce((total, point, index) => total + point.value * (index + 1), 0);
  const totalWeight = candidates.reduce((total, _, index) => total + index + 1, 0);

  if (!totalWeight) return null;

  return {
    date: tomorrow,
    estimated: true,
    hasValue: true,
    label: tomorrow.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replaceAll('/', '-'),
    value: Math.max(0, Number((weightedTotal / totalWeight).toFixed(2))),
  };
}

function normalizeStatus(status = '') {
  const value = status.toLowerCase();
  if (value.includes('bahaya') || value.includes('error') || value.includes('alarm')) return 'danger';
  if (value.includes('waspada') || value.includes('warning') || value.includes('perhatian')) return 'warning';
  return 'normal';
}

function translateStatus(status = '') {
  const normalized = normalizeStatus(status);
  if (normalized === 'danger') return 'Alarm';
  if (normalized === 'warning') return 'Warning';
  return 'Normal';
}

function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
  };
}

function useSheetData() {
  const [items, setItems] = useState(fallbackSensors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState('');

  async function load() {
    const csvUrl = getCsvUrl();
    if (!csvUrl) {
      setError('Google Sheet is not configured. Sample data is being displayed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
      const parsed = parseCsv(csvText);
      if (!parsed.length) throw new Error('Sheet has no data rows.');
      setItems(parsed);
      setLastSync(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (fetchError) {
      setError(`Failed to fetch Google Sheet data: ${fetchError.message}`);
      setItems(fallbackSensors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { items, loading, error, lastSync, reload: load };
}

function isSpreadsheetError(value) {
  return /^#(?:REF!|DIV\/0!|N\/A|VALUE!|NAME\?|NUM!|NULL!)$/i.test(String(value || '').trim());
}

function formatSummaryNumber(value, maximumFractionDigits = 2) {
  if (String(value ?? '').trim() === '' || isSpreadsheetError(value)) return '-';
  const numericValue = parseChartNumber(value);
  if (numericValue === null) return '-';
  return numericValue.toLocaleString('id-ID', { maximumFractionDigits });
}

function formatSummaryPrimaryValue(category, value) {
  if (category === 'water' && value === 0) return '<1';
  return formatSummaryNumber(value, category === 'vehicle' ? 0 : 2);
}

function parseSummaryTimestamp(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || 0),
    );
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatSummaryTimestamp(value) {
  const date = parseSummaryTimestamp(value);
  if (!date) return value || '-';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSummaryTimestampParts(value) {
  const date = parseSummaryTimestamp(value);
  if (!date) return { date: value || '-', time: '' };
  return {
    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

function getSummaryGroup(groups, siteName, category) {
  return groups.find((group) => group.siteName === siteName && group.category === category) || null;
}

function getSummaryMetric(group, metricKey) {
  return group?.metrics?.[metricKey] ?? '';
}

function getSummaryNumericMetric(group, metricKey) {
  const value = getSummaryMetric(group, metricKey);
  if (String(value ?? '').trim() === '' || isSpreadsheetError(value)) return null;
  return parseChartNumber(value);
}

function getSummaryExtreme(groups, metricKey, mode = 'max') {
  const candidates = groups
    .map((group) => ({
      siteName: group.siteName,
      value: getSummaryNumericMetric(group, metricKey),
    }))
    .filter((item) => item.value !== null);

  if (!candidates.length) return null;

  return candidates.reduce((selected, item) => {
    if (mode === 'min') return item.value < selected.value ? item : selected;
    return item.value > selected.value ? item : selected;
  });
}

function getSummaryFieldSignal(field, rawValue, numericValue) {
  if (!field.signal) return '';
  if (field.signal === 'condition') {
    return /good|normal|safe|current|healthy/i.test(String(rawValue)) ? 'positive' : 'warning';
  }
  if (numericValue === null) return 'neutral';
  if (field.signal === 'compliance') return numericValue >= 95 ? 'positive' : numericValue >= 80 ? 'warning' : 'danger';
  if (field.signal === 'unbalance') return numericValue <= 10 ? 'positive' : numericValue <= 20 ? 'warning' : 'danger';
  if (field.signal === 'trend') return numericValue > 0 ? 'warning' : numericValue < 0 ? 'positive' : 'neutral';
  return '';
}

function getSummaryFieldSubtitle(field) {
  if (field.key.includes('today')) return 'Today';
  if (field.key.includes('current') || field.key.includes('last_')) return 'Latest reading';
  if (field.key.includes('max_') || field.key.includes('peak_')) return 'Daily peak';
  if (field.key.includes('yesterday')) return 'Previous day';
  if (field.key.includes('trend') || field.key.includes('delta')) return 'Vs yesterday';
  if (field.key.includes('status') || field.key.includes('condition')) return 'Current state';
  return 'Metric value';
}

function getAlertCategoryLabel(item) {
  const config = alertCategories[item.category];
  if (item.category === 'other' && item.sourceCategory && summaryCategories[item.sourceCategory]) {
    return `${config?.label || 'Other'} · ${summaryCategories[item.sourceCategory].label}`;
  }

  return config?.label || item.category;
}

function getAttentionRecommendation(item) {
  if (item.title === 'Spreadsheet error') return 'Check the local metric formula and rerun the aggregation script.';
  if (item.title === 'Data delayed') return 'Check the electrical power supply and internet access at the location.';
  if (item.title === 'Data is not current' && /delayed|offline/i.test(item.detail)) return 'Check the electrical power supply and internet access at the location.';
  if (item.title === 'Data is not current') return 'Verify the sensor connection and latest local-sheet update.';
  if (item.title === 'Low voltage compliance') return 'Inspect voltage levels and the panel supply quality.';
  if (item.title === 'High current unbalance') return 'Review the phase load and rebalance load distribution.';
  if (item.title === 'Low Power Factor') return "Review and inspect load's power factor and add capacitor bank.";
  if (item.title === 'Data source missing') return 'Check the source configuration and AppScript aggregation log.';
  return 'Review the related source data and monitoring device.';
}

function getAttentionIcon(item) {
  if (item.title === 'Spreadsheet error') return FileText;
  if (item.title === 'Data delayed' || item.title === 'Data is not current' || item.title === 'Data source missing') {
    return Wifi;
  }
  if (item.severity === 'danger') return AlertTriangle;
  return alertCategories[item.category]?.icon || summaryCategories[item.category]?.icon || Activity;
}

function buildSummaryModel(csvText) {
  const records = parseCsv(csvText)
    .map((record) => ({
      collectedAt: String(record.collected_at || '').trim(),
      siteName: String(record.site_name || '').trim(),
      category: String(record.category || '').trim().toLowerCase(),
      metricKey: String(record.metric_key || '').trim(),
      metricValue: String(record.metric_value || '').trim(),
    }))
    .filter((record) => record.collectedAt && record.siteName && record.category && record.metricKey);

  if (!records.length) throw new Error('The Metrics sheet has no usable rows.');

  const latestTimestamp = Math.max(...records.map((record) => parseSummaryTimestamp(record.collectedAt)?.getTime() || 0));
  const latestRecords = records.filter((record) => {
    return parseSummaryTimestamp(record.collectedAt)?.getTime() === latestTimestamp;
  });
  const groupMap = new Map();

  latestRecords.forEach((record) => {
    const key = `${record.siteName}::${record.category}`;
    const group = groupMap.get(key) || {
      siteName: record.siteName,
      category: record.category,
      collectedAt: record.collectedAt,
      metrics: {},
      errors: [],
    };

    if (isSpreadsheetError(record.metricValue)) {
      group.errors.push({ metricKey: record.metricKey, value: record.metricValue });
    } else if (record.metricValue !== '') {
      group.metrics[record.metricKey] = record.metricValue;
    }

    groupMap.set(key, group);
  });

  const groups = [...groupMap.values()];
  const extraSites = [...new Set(groups.map((group) => group.siteName))]
    .filter((siteName) => !summaryExpectedSites.includes(siteName))
    .sort();
  const sites = [...summaryExpectedSites, ...extraSites];

  const kpis = Object.entries(summaryCategories).map(([category, config]) => {
    const categoryGroups = groups.filter((group) => group.category === category);
    const values = categoryGroups
      .map((group) => getSummaryNumericMetric(group, config.primaryKey))
      .filter((value) => value !== null);
    const aggregate = category === 'co2'
      ? (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null)
      : (values.length ? values.reduce((sum, value) => sum + value, 0) : null);
    const expectedCount = ['electricity', 'water'].includes(category)
      ? summaryExpectedSites.length
      : Math.max(categoryGroups.length, 1);

    return {
      category,
      ...config,
      value: aggregate,
      coverage: `${values.length} of ${expectedCount} locations`,
    };
  });

  const attention = [];
  groups.forEach((group) => {
    if (group.errors.length) {
      attention.push({
        severity: 'danger',
        siteName: group.siteName,
        category: 'other',
        sourceCategory: group.category,
        title: 'Spreadsheet error',
        detail: `${group.errors.length} metric${group.errors.length > 1 ? 's' : ''} could not be read.`,
      });
    }

    const dataStatus = String(getSummaryMetric(group, 'data_status')).toLowerCase();
    if (dataStatus.includes('delayed')) {
      attention.push({
        severity: 'warning',
        siteName: group.siteName,
        category: 'other',
        sourceCategory: group.category,
        title: 'Data delayed',
        detail: `Source status: ${dataStatus}. Last update: ${formatSummaryTimestamp(getSummaryMetric(group, 'raw_last_update'))}.`,
      });
    } else if (dataStatus && dataStatus !== 'current') {
      attention.push({
        severity: 'warning',
        siteName: group.siteName,
        category: 'other',
        sourceCategory: group.category,
        title: 'Data is not current',
        detail: `Source status: ${dataStatus}.`,
      });
    }

    if (group.category === 'electricity') {
      const totalSamples = getSummaryNumericMetric(group, 'today_total_sample');
      const compliance = getSummaryNumericMetric(group, 'today_volt_compliance_percent');
      const unbalance = getSummaryNumericMetric(group, 'max_current_unbalance_today_percent');

      if (totalSamples > 0 && compliance !== null && compliance < 95) {
        attention.push({
          severity: compliance < 90 ? 'danger' : 'warning',
          siteName: group.siteName,
          category: group.category,
          title: 'Low voltage compliance',
          detail: `${formatSummaryNumber(compliance, 1)}% from ${formatSummaryNumber(totalSamples, 0)} samples.`,
        });
      }

      if (unbalance !== null && unbalance > 30) {
        attention.push({
          severity: unbalance > 50 ? 'danger' : 'warning',
          siteName: group.siteName,
          category: group.category,
          title: 'High current unbalance',
          detail: `Maximum today: ${formatSummaryNumber(unbalance, 1)}%.`,
        });
      }

      const powerFactor = getSummaryNumericMetric(group, 'power_factor')
        ?? getSummaryNumericMetric(group, 'Power Factor')
        ?? getSummaryNumericMetric(group, 'power factor');
      if (powerFactor !== null && powerFactor < 0.7) {
        attention.push({
          severity: 'warning',
          siteName: group.siteName,
          category: group.category,
          title: 'Low Power Factor',
          detail: `Power factor is ${formatSummaryNumber(powerFactor, 2)}.`,
        });
      }
    }
  });

  ['electricity', 'water'].forEach((category) => {
    summaryExpectedSites.forEach((siteName) => {
      if (!getSummaryGroup(groups, siteName, category)) {
        attention.push({
          severity: 'warning',
          siteName,
          category: 'other',
          sourceCategory: category,
          title: 'Data source missing',
          detail: `No ${summaryCategories[category].label.toLowerCase()} metrics in the latest snapshot.`,
        });
      }
    });
  });

  return {
    attention,
    collectedAt: latestRecords[0]?.collectedAt || '',
    groups,
    kpis,
    sites,
  };
}

function useSummaryMetrics() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(force = false) {
    const cached = summaryCache.get(summaryCacheKey);
    if (!force && cached && Date.now() - cached.cachedAt <= summaryCacheTtlMs) {
      setModel(cached.model);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getSummaryCsvUrl());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
      const nextModel = buildSummaryModel(csvText);
      summaryCache.set(summaryCacheKey, { cachedAt: Date.now(), model: nextModel });
      setModel(nextModel);
    } catch (fetchError) {
      setError(`Failed to load central metrics: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { model, loading, error, reload: () => load(true) };
}

function applyLocationValues(rows, locationIndex, values) {
  return rows.map((row, index) => ({
    ...row,
    values: row.values.map((value, valueIndex) => (valueIndex === locationIndex ? values[index] || value : value)),
  }));
}

function parseMultiSeriesRows(csvText, seriesConfig, xIndex, yIndexes) {
  const series = seriesConfig.map((config) => ({
    ...config,
    points: [],
  }));

  parseCsvRows(csvText).forEach((row) => {
    const label = row[xIndex] || '';
    if (!label) return;

    yIndexes.forEach((yIndex, index) => {
      const value = parseChartNumber(row[yIndex]);
      if (value !== null && series[index]) {
        series[index].points.push({ label, value });
      }
    });
  });

  return series.filter((item) => item.points.length);
}

function parseVehicleCounterRows(csvText, scaleConfig) {
  const rows = parseCsvRows(csvText);
  const series = vehicleSeries.map((config) => ({
    ...config,
    points: [],
  }));
  const labelRows = scaleConfig.totalRowOffset === undefined ? rows : rows.slice(0, 24);

  labelRows.forEach((row, rowIndex) => {
    const label = row[scaleConfig.xIndex] || '';
    if (!label) return;

    scaleConfig.yIndexes.forEach((yIndex, seriesIndex) => {
      const value = parseChartNumber(row[yIndex]);
      if (value !== null) {
        series[seriesIndex].points.push({ label, value });
      }
    });

    if (scaleConfig.totalRowOffset !== undefined) {
      const totalRow = rows[scaleConfig.totalRowOffset + rowIndex] || [];
      scaleConfig.totalYIndexes.forEach((yIndex, totalIndex) => {
        const value = parseChartNumber(totalRow[yIndex]);
        if (value !== null) {
          series[scaleConfig.yIndexes.length + totalIndex].points.push({ label, value });
        }
      });
    }
  });

  return series.filter((item) => item.points.length);
}

function mergeCarbonPoints(existingPoints, pointsToAdd) {
  const pointMap = new Map(existingPoints.map((point) => [point.label, point.value]));

  pointsToAdd.forEach((point) => {
    pointMap.set(point.label, (pointMap.get(point.label) || 0) + point.value);
  });

  return Array.from(pointMap, ([label, value]) => ({ label, value }));
}

function parseElectricityCarbonRows(csvText, scaleConfig) {
  return parseCsvRows(csvText)
    .map((row) => ({
      label: row[scaleConfig.xIndex] || '',
      value: parseChartNumber(row[scaleConfig.yIndex]),
    }))
    .filter((point) => point.label && point.value !== null)
    .map((point) => ({
      ...point,
      value: point.value * carbonEmissionFactors.electricityTonPerKwh,
    }));
}

function parseVehicleCarbonRows(csvText, scaleConfig) {
  const vehicleData = parseVehicleCounterRows(csvText, scaleConfig);
  const carTotal = vehicleData.find((item) => item.id === 'carTotal')?.points || [];
  const motorTotal = vehicleData.find((item) => item.id === 'motorTotal')?.points || [];
  const truckTotal = vehicleData.find((item) => item.id === 'truckTotal')?.points || [];
  const labels = Array.from(new Set([...carTotal, ...motorTotal, ...truckTotal].map((point) => point.label)));
  const carsTrucksPoints = [];
  const motorcyclePoints = [];

  labels.forEach((label) => {
    const carValue = carTotal.find((point) => point.label === label)?.value || 0;
    const truckValue = truckTotal.find((point) => point.label === label)?.value || 0;
    const motorValue = motorTotal.find((point) => point.label === label)?.value || 0;

    carsTrucksPoints.push({
      label,
      value: ((carValue + truckValue) * carbonEmissionFactors.vehicleDistanceKm * carbonEmissionFactors.gasolineKgPerKm) / 1000,
    });
    motorcyclePoints.push({
      label,
      value: (motorValue * carbonEmissionFactors.vehicleDistanceKm * carbonEmissionFactors.motorcycleKgPerKm) / 1000,
    });
  });

  return [
    { ...carbonSeries.carsTrucks, points: carsTrucksPoints },
    { ...carbonSeries.motorcycles, points: motorcyclePoints },
    {
      ...carbonSeries.vehicle,
      points: labels.map((label) => ({
        label,
        value:
          (carsTrucksPoints.find((point) => point.label === label)?.value || 0)
          + (motorcyclePoints.find((point) => point.label === label)?.value || 0),
      })),
    },
  ].filter((item) => item.points.length);
}

function parseLatestGlobalCo2(csvText) {
  const rows = parseCsvRows(csvText)
    .filter((row) => row.length >= 4 && /^\d{4}$/.test(row[0]))
    .map((row) => ({
      dateLabel: `${row[0]}-${String(row[1]).padStart(2, '0')}-${String(row[2]).padStart(2, '0')}`,
      value: parseChartNumber(row[3]),
    }))
    .filter((row) => row.value !== null);

  return rows[rows.length - 1] || null;
}

function useElectricityRows() {
  const [rows, setRows] = useState(electricityRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState('');

  async function load({ force = false } = {}) {
    const cached = getCachedRows(electricityRowsCache, electricityRowsCacheKey, electricityRowsCacheTtlMs);
    if (cached && !force) {
      setRows(cached.rows);
      setLastSync(cached.lastSync);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const sourceResults = await Promise.allSettled(
      electricityDataSources.map(async (source) => {
        try {
          const response = await fetch(getElectricityCsvUrl(source));
          if (!response.ok) throw new Error(`${source.label}: HTTP ${response.status}`);
          const csvText = await response.text();
          const [sheetRow = []] = parseCsvRows(csvText);
          if (sheetRow.length < electricityRows.length) {
            throw new Error(`${source.label}: range only contains ${sheetRow.length} values.`);
          }

          return { source, values: sheetRow };
        } catch (fetchError) {
          throw new Error(`${source.label}: ${fetchError.message}`);
        }
      }),
    );

    const successfulResults = sourceResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    const failedMessages = sourceResults
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.message);

    if (successfulResults.length) {
      const mergedRows = successfulResults.reduce(
        (currentRows, { source, values }) => applyLocationValues(currentRows, source.locationIndex, values),
        electricityRows,
      );
      const syncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      setRows(mergedRows);
      setLastSync(syncTime);
      setCachedRows(electricityRowsCache, electricityRowsCacheKey, mergedRows, syncTime);
      setError(failedMessages.length ? `Some data failed to load: ${failedMessages.join('; ')}` : '');
    } else {
      setError(`Failed to fetch location data: ${failedMessages.join('; ')}`);
      setRows(electricityRows);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { rows, loading, error, lastSync, reload: () => load({ force: true }) };
}

function useWaterRows() {
  const [rows, setRows] = useState(waterRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState('');

  async function load({ force = false } = {}) {
    const cached = getCachedRows(waterRowsCache, waterRowsCacheKey, waterRowsCacheTtlMs);
    if (cached && !force) {
      setRows(cached.rows);
      setLastSync(cached.lastSync);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const sourceResults = await Promise.allSettled(
      waterDataSources.map(async (source) => {
        try {
          const response = await fetch(getWaterRecentCsvUrl(source));
          if (!response.ok) throw new Error(`${source.label}: HTTP ${response.status}`);
          const csvText = await response.text();
          const [sheetRow = []] = parseCsvRows(csvText);
          if (sheetRow.length < waterRows.length) {
            throw new Error(`${source.label}: range only contains ${sheetRow.length} values.`);
          }

          return { source, values: sheetRow };
        } catch (fetchError) {
          throw new Error(`${source.label}: ${fetchError.message}`);
        }
      }),
    );

    const successfulResults = sourceResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    const failedMessages = sourceResults
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.message);

    if (successfulResults.length) {
      const mergedRows = successfulResults.reduce(
        (currentRows, { source, values }) => applyLocationValues(currentRows, source.locationIndex, values),
        waterRows,
      );
      const syncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      setRows(mergedRows);
      setLastSync(syncTime);
      setCachedRows(waterRowsCache, waterRowsCacheKey, mergedRows, syncTime);
      setError(failedMessages.length ? `Some data failed to load: ${failedMessages.join('; ')}` : '');
    } else {
      setError(`Failed to fetch Water data: ${failedMessages.join('; ')}`);
      setRows(waterRows);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { rows, loading, error, lastSync, reload: () => load({ force: true }) };
}

function useCo2Rows() {
  const [rows, setRows] = useState(co2Rows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState('');

  async function load({ force = false } = {}) {
    const cached = getCachedRows(co2RowsCache, co2RowsCacheKey, co2RowsCacheTtlMs);
    if (cached && !force) {
      setRows(cached.rows);
      setLastSync(cached.lastSync);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getCo2CsvUrl('Recent', co2RecentRange));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
      const [sheetRow = []] = parseCsvRows(csvText);
      const mergedRows = co2Rows.map((row, rowIndex) => ({
        ...row,
        values: row.values.map((value, locationIndex) => {
          if (row.parameter === 'Sensor Location') return value;
          const startIndex = co2Locations[locationIndex].recentStartIndex;
          return sheetRow[startIndex + rowIndex] || value;
        }),
      }));
      const syncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      setRows(mergedRows);
      setLastSync(syncTime);
      setCachedRows(co2RowsCache, co2RowsCacheKey, mergedRows, syncTime);
    } catch (fetchError) {
      setRows(co2Rows);
      setError(`Failed to fetch CO₂ data: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { rows, loading, error, lastSync, reload: () => load({ force: true }) };
}

function useVehicleRows() {
  const [rows, setRows] = useState(vehicleRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState('');

  async function load({ force = false } = {}) {
    const cached = getCachedRows(vehicleRowsCache, vehicleRowsCacheKey, vehicleRowsCacheTtlMs);
    if (cached && !force) {
      setRows(cached.rows);
      setLastSync(cached.lastSync);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getVehicleCsvUrl('Recent', vehicleRecentRange));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
      const [sheetRow = []] = parseCsvRows(csvText);
      if (sheetRow.length < vehicleRows.length) {
        throw new Error(`range only contains ${sheetRow.length} values.`);
      }

      const mergedRows = vehicleRows.map((row, index) => ({
        ...row,
        values: [sheetRow[index] || row.values[0]],
      }));
      const syncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      setRows(mergedRows);
      setLastSync(syncTime);
      setCachedRows(vehicleRowsCache, vehicleRowsCacheKey, mergedRows, syncTime);
    } catch (fetchError) {
      setRows(vehicleRows);
      setError(`Failed to fetch Vehicle Counter data: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { rows, loading, error, lastSync, reload: () => load({ force: true }) };
}

function useVehicleCounterSeries(scale) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const cachedSeries = getCachedVehicleCounter(scale);
      if (cachedSeries) {
        setSeries(cachedSeries);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const scaleConfig = vehicleCounterScales[scale];
        const response = await fetch(getVehicleCsvUrl('Pivot', scaleConfig.range));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const parsedSeries = parseVehicleCounterRows(csvText, scaleConfig);
        if (!parsedSeries.length) throw new Error('range has no chart data.');
        setCachedVehicleCounter(scale, parsedSeries);
        setSeries(parsedSeries);
      } catch (fetchError) {
        setSeries([]);
        setError(`Failed to load Vehicle Counter chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [scale]);

  return { series, loading, error };
}

function useCarbonElectricitySeries(scale) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const cachedSeries = getCachedCarbonSeries(carbonElectricityCache, scale, carbonElectricityCacheTtlMs);
      if (cachedSeries) {
        setSeries(cachedSeries);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const scaleConfig = energyHistoryScales[scale];
        const results = await Promise.allSettled(
          electricityDataSources.map(async (source) => {
            const response = await fetch(getEnergyHistoryCsvUrl(source, scale));
            if (!response.ok) throw new Error(`${source.label}: HTTP ${response.status}`);
            const csvText = await response.text();
            return parseElectricityCarbonRows(csvText, scaleConfig);
          }),
        );
        const fulfilled = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
        const failed = results.filter((result) => result.status === 'rejected').map((result) => result.reason.message);
        const mergedPoints = fulfilled.reduce((currentPoints, points) => mergeCarbonPoints(currentPoints, points), []);

        if (!mergedPoints.length) throw new Error(failed.join('; ') || 'range has no chart data.');
        const parsedSeries = [{ ...carbonSeries.electricity, points: mergedPoints }];
        setCachedCarbonSeries(carbonElectricityCache, scale, parsedSeries);
        setSeries(parsedSeries);
        setError(failed.length ? `Some data failed to load: ${failed.join('; ')}` : '');
      } catch (fetchError) {
        setSeries([]);
        setError(`Failed to load electricity carbon data: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [scale]);

  return { series, loading, error };
}

function useCarbonVehicleSeries(scale) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const cachedSeries = getCachedCarbonSeries(carbonVehicleCache, scale, carbonVehicleCacheTtlMs);
      if (cachedSeries) {
        setSeries(cachedSeries);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const scaleConfig = vehicleCounterScales[scale];
        const response = await fetch(getVehicleCsvUrl('Pivot', scaleConfig.range));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const parsedSeries = parseVehicleCarbonRows(csvText, scaleConfig);
        if (!parsedSeries.length) throw new Error('range has no chart data.');
        setCachedCarbonSeries(carbonVehicleCache, scale, parsedSeries);
        setSeries(parsedSeries);
      } catch (fetchError) {
        setSeries([]);
        setError(`Failed to load vehicle carbon data: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [scale]);

  return { series, loading, error };
}

function useCo2TemperatureSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const cached = getCachedRows(co2TemperatureCache, co2TemperatureCacheKey, co2TemperatureCacheTtlMs);
      if (cached) {
        setSeries(cached.series || []);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(getCo2CsvUrl('CO2Daily', co2DailyTemperatureRange));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const parsedSeries = parseMultiSeriesRows(csvText, co2Series, 0, [2, 3, 4, 5]);
        if (!parsedSeries.length) throw new Error('range has no chart data.');
        co2TemperatureCache.set(co2TemperatureCacheKey, {
          cachedAt: Date.now(),
          series: parsedSeries,
        });
        setSeries(parsedSeries);
      } catch (fetchError) {
        setSeries([]);
        setError(`Failed to load temperature chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { series, loading, error };
}

function useCo2HistorySeries(scale) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const cachedSeries = getCachedCo2History(scale);
      if (cachedSeries) {
        setSeries(cachedSeries);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const scaleConfig = co2HistoryScales[scale];
        const response = await fetch(getCo2CsvUrl('Pivot', scaleConfig.range));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const parsedSeries = parseMultiSeriesRows(csvText, co2SeriesWithAverage, scaleConfig.xIndex, scaleConfig.yIndexes);
        if (!parsedSeries.length) throw new Error('range has no chart data.');
        setCachedCo2History(scale, parsedSeries);
        setSeries(parsedSeries);
      } catch (fetchError) {
        setSeries([]);
        setError(`Failed to load CO₂ chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [scale]);

  return { series, loading, error };
}

function useGlobalCo2() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const cached = getCachedRows(globalCo2Cache, globalCo2CacheKey, globalCo2CacheTtlMs);
      if (cached) {
        setData(cached.data);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const urls = [
          globalCo2CsvUrl,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(globalCo2CsvUrl)}`,
        ];
        let parsedData = null;
        let latestError = null;

        for (const url of urls) {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const csvText = await response.text();
            parsedData = parseLatestGlobalCo2(csvText);
            if (parsedData) break;
            throw new Error('global CO₂ data is empty.');
          } catch (fetchError) {
            latestError = fetchError;
          }
        }

        if (!parsedData) throw latestError || new Error('global CO₂ data is empty.');
        globalCo2Cache.set(globalCo2CacheKey, {
          cachedAt: Date.now(),
          data: parsedData,
        });
        setData(parsedData);
      } catch (fetchError) {
        setData(null);
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}

function useEnergyHistory(locationIndex, scale) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const source = electricityDataSources.find((item) => item.locationIndex === Number(locationIndex));

    async function load() {
      if (!source) {
        setPoints([]);
        setError('Historical data for this location is not configured.');
        return;
      }

      const cachedPoints = getCachedEnergyHistory(source, scale);
      if (cachedPoints) {
        setPoints(cachedPoints);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(getEnergyHistoryCsvUrl(source, scale));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const scaleConfig = energyHistoryScales[scale];
        const parsedPoints = parseCsvRows(csvText)
          .map((row) => {
            const value = parseChartNumber(row[scaleConfig.yIndex]);
            return {
              label: row[scaleConfig.xIndex] || '',
              value: value ?? 0,
              hasValue: value !== null,
            };
          })
          .filter((point) => point.label && (scale === 'daily' || point.hasValue));

        if (!parsedPoints.length) throw new Error('range has no chart data.');
        setCachedEnergyHistory(source, scale, parsedPoints);
        setPoints(parsedPoints);
      } catch (fetchError) {
        setPoints([]);
        setError(`Failed to load ${source.label} chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locationIndex, scale]);

  return { points, loading, error };
}

function useDailyActivePower(locationIndex) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const source = electricityDataSources.find((item) => item.locationIndex === Number(locationIndex));

    async function load() {
      if (!source) {
        setPoints([]);
        setError('Active power data for this location is not configured.');
        return;
      }

      const cachedPoints = getCachedDailyPower(source);
      if (cachedPoints) {
        setPoints(cachedPoints);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(getDailyPowerCsvUrl(source));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const parsedPoints = parseCsvRows(csvText)
          .map((row) => ({
            label: row[0] || '',
            value: parseChartNumber(row[2]),
          }))
          .filter((point) => point.label && point.value !== null);

        if (!parsedPoints.length) throw new Error('range has no chart data.');
        setCachedDailyPower(source, parsedPoints);
        setPoints(parsedPoints);
      } catch (fetchError) {
        setPoints([]);
        setError(`Failed to load ${source.label} active power chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locationIndex]);

  return { points, loading, error };
}

function useDailyActivePowerSeries(enabled) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSource(source) {
      const cachedPoints = getCachedDailyPower(source);
      if (cachedPoints) return cachedPoints;

      const response = await fetch(getDailyPowerCsvUrl(source));
      if (!response.ok) throw new Error(`${source.label}: HTTP ${response.status}`);
      const csvText = await response.text();
      const parsedPoints = parseCsvRows(csvText)
        .map((row) => ({
          label: row[0] || '',
          value: parseChartNumber(row[2]),
        }))
        .filter((point) => point.label && point.value !== null);

      if (!parsedPoints.length) throw new Error(`${source.label}: range has no chart data.`);
      setCachedDailyPower(source, parsedPoints);
      return parsedPoints;
    }

    async function load() {
      if (!enabled) {
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      const results = await Promise.allSettled(electricityDataSources.map((source) => loadSource(source)));
      if (!active) return;

      const nextSeries = results
        .map((result, index) => {
          if (result.status !== 'fulfilled') return null;
          return {
            id: electricityDataSources[index].label,
            label: electricityDataSources[index].label,
            color: electricityPowerSeriesColors[index % electricityPowerSeriesColors.length],
            points: result.value,
          };
        })
        .filter(Boolean);

      setSeries(nextSeries);
      if (!nextSeries.length) {
        const message = results.find((result) => result.status === 'rejected')?.reason?.message || 'No average power data could be loaded.';
        setError(`Failed to load all-location average power chart: ${message}`);
      }
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [enabled]);

  return { series, loading, error };
}

function useWaterDailyFlow(locationIndex) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const source = waterDataSources.find((item) => item.locationIndex === Number(locationIndex));

    async function load() {
      if (!source) {
        setPoints([]);
        setError('Flow data for this location is not configured.');
        return;
      }

      const cachedPoints = getCachedWaterDailyFlow(source);
      if (cachedPoints) {
        setPoints(cachedPoints);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(getWaterDailyFlowCsvUrl(source));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const dailyFlow = source.dailyFlow || {};
        const xIndex = dailyFlow.xIndex ?? 0;
        const yIndex = dailyFlow.yIndex ?? 2;
        const parsedPoints = parseCsvRows(csvText)
          .map((row) => ({
            label: row[xIndex] || '',
            value: parseChartNumber(row[yIndex]),
          }))
          .filter((point) => point.label && point.value !== null);

        if (!parsedPoints.length) throw new Error('range has no chart data.');
        setCachedWaterDailyFlow(source, parsedPoints);
        setPoints(parsedPoints);
      } catch (fetchError) {
        setPoints([]);
        setError(`Failed to load ${source.label} flow chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locationIndex]);

  return { points, loading, error };
}

function useWaterTotalizerHistory(locationIndex, scale) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const source = waterDataSources.find((item) => item.locationIndex === Number(locationIndex));

    async function load() {
      if (!source) {
        setPoints([]);
        setError('Totalizer data for this location is not configured.');
        return;
      }

      const cachedPoints = getCachedWaterTotalizerHistory(source, scale);
      if (cachedPoints) {
        setPoints(cachedPoints);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(getWaterTotalizerHistoryCsvUrl(source, scale));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        const scaleConfig = energyHistoryScales[scale];
        const parsedPoints = parseCsvRows(csvText)
          .map((row) => ({
            label: row[scaleConfig.xIndex] || '',
            value: parseChartNumber(row[scaleConfig.yIndex]),
          }))
          .filter((point) => point.label && point.value !== null);

        if (!parsedPoints.length) throw new Error('range has no chart data.');
        setCachedWaterTotalizerHistory(source, scale, parsedPoints);
        setPoints(parsedPoints);
      } catch (fetchError) {
        setPoints([]);
        setError(`Failed to load ${source.label} totalizer chart: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locationIndex, scale]);

  return { points, loading, error };
}

function createLineChartCoordinates(points, width, height, padding) {
  if (!points.length) return [];

  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  return points.map((point, index) => {
    const x = points.length === 1 ? padding.left + innerWidth / 2 : padding.left + (index / (points.length - 1)) * innerWidth;
    const y = padding.top + (1 - (point.value - minValue) / valueRange) * innerHeight;
    return { ...point, x, y };
  });
}

function createLineChartCoordinatesWithRange(points, width, height, padding, minValue, maxValue) {
  if (!points.length) return [];
  const valueRange = maxValue - minValue || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  return points.map((point, index) => {
    const x = points.length === 1 ? padding.left + innerWidth / 2 : padding.left + (index / (points.length - 1)) * innerWidth;
    const y = padding.top + (1 - (point.value - minValue) / valueRange) * innerHeight;
    return { ...point, x, y };
  });
}

function createSmoothLinePath(coordinates) {
  if (!coordinates.length) return '';
  if (coordinates.length === 1) return `M ${coordinates[0].x} ${coordinates[0].y}`;

  return coordinates.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = coordinates[index - 1];
    const controlDistance = (point.x - previous.x) / 2;
    return `${path} C ${previous.x + controlDistance} ${previous.y}, ${point.x - controlDistance} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function createLineAreaPath(coordinates, height, padding) {
  if (!coordinates.length) return '';

  const baseline = height - padding.bottom;
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  return `${createSmoothLinePath(coordinates)} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function createBarChartItems(points, width, height, padding) {
  if (!points.length) return [];

  const values = points.map((point) => point.value);
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const slotWidth = innerWidth / points.length;
  const barWidth = Math.min(34, Math.max(8, slotWidth * 0.58));

  return points.map((point, index) => {
    const barHeight = (point.value / maxValue) * innerHeight;
    const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = padding.top + innerHeight - barHeight;
    const labelX = padding.left + index * slotWidth + slotWidth / 2;
    return { ...point, barHeight, barWidth, labelX, x, y };
  });
}

function HowItWorksArtwork({ variant = 'nodes' }) {
  return (
    <svg className={`howItWorksArtwork ${variant}`} viewBox="0 0 120 86" aria-hidden="true">
      <defs>
        <linearGradient id={`artGradient-${variant}`} x1="12" y1="10" x2="108" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#57c785" />
          <stop offset="1" stopColor="#2a7b9b" />
        </linearGradient>
      </defs>
      {variant === 'chart' ? (
        <>
          <path d="M15 66H105" />
          <path d="M25 56L43 42L61 49L79 24L98 32" />
          <rect x="22" y="57" width="12" height="9" rx="3" />
          <rect x="52" y="43" width="12" height="23" rx="3" />
          <rect x="82" y="31" width="12" height="35" rx="3" />
        </>
      ) : variant === 'cloud' ? (
        <>
          <path d="M33 56H87a18 18 0 0 0 0-36 25 25 0 0 0-47-6 21 21 0 0 0-7 42Z" />
          <path d="M43 67V76M60 67V80M77 67V76" />
        </>
      ) : variant === 'formula' ? (
        <>
          <rect x="18" y="18" width="84" height="50" rx="12" />
          <path d="M33 36H58M33 50H88M68 36H88" />
          <circle cx="27" cy="36" r="3" />
          <circle cx="27" cy="50" r="3" />
        </>
      ) : variant === 'gateway' ? (
        <>
          <rect x="38" y="18" width="44" height="50" rx="10" />
          <rect x="50" y="30" width="20" height="20" rx="5" />
          <path d="M22 32H38M82 32H98M22 54H38M82 54H98M60 18V8M60 78V68" />
        </>
      ) : (
        <>
          <circle cx="25" cy="43" r="12" />
          <circle cx="60" cy="23" r="12" />
          <circle cx="95" cy="43" r="12" />
          <circle cx="60" cy="65" r="12" />
          <path d="M35 38L50 28M70 28L85 38M85 49L70 60M50 60L35 49" />
        </>
      )}
    </svg>
  );
}

function HowItWorksPage() {
  const pageRef = useRef(null);
  const flowSteps = [
    'Sensors',
    'ESP32 Gateway',
    'Modbus RTU',
    'Slot-Scheduled Transmission',
    'Cloud Storage',
    'Analytics Engine',
    'Web Dashboard',
  ];
  const applicationAreas = [
    { icon: Zap, title: 'Electricity Consumption', description: 'Voltage, current, power, energy usage, and operating quality.' },
    { icon: Droplets, title: 'Water Management', description: 'Water flow, volume accumulation, and daily consumption monitoring.' },
    { icon: Cloud, title: 'Indoor Air Quality', description: 'CO2 concentration, temperature, humidity, and source freshness.' },
    { icon: Car, title: 'Vehicle Traffic Counting', description: 'Vehicle counts, peak traffic, and multi-class movement patterns.' },
  ];
  const slotBenefits = [
    'Reduces simultaneous transmissions from many edge devices.',
    'Minimizes packet collisions, retries, and congestion.',
    'Prevents traffic spikes on cloud services.',
    'Improves cellular and RF network reliability.',
    'Supports scale-out to hundreds of monitoring nodes.',
    'Keeps latency fair and predictable across sites.',
  ];
  const platformBlocks = [
    {
      icon: Activity,
      artwork: 'nodes',
      title: 'Field Sensors & Data Acquisition',
      text: 'Each monitored location continuously captures operational parameters from field sensors and measurement devices. The platform is built for multi-sensor deployments across electricity, water, air quality, and traffic systems.',
    },
    {
      icon: Settings,
      artwork: 'gateway',
      title: 'Edge Gateway Node',
      text: 'Telemetry is acquired by a local ESP32 gateway and read through industrial communication channels such as Modbus RTU over RS485, keeping field integration robust in noisy environments.',
    },
    {
      icon: CalendarDays,
      artwork: 'chart',
      title: 'Slot Scheduling Data Transmission',
      text: 'Every device is assigned a predefined upload slot. During that slot it sends its latest structured payload, while other nodes stay idle, creating an orderly and predictable data pipeline.',
      wide: true,
    },
    {
      icon: Cloud,
      artwork: 'cloud',
      title: 'Cloud Data Management',
      text: 'Incoming telemetry is validated, stored, backed up, and optimized for historical retrieval. The cloud layer supports analytics, trend ingestion, and future expansion as locations grow.',
    },
    {
      icon: LayoutDashboard,
      artwork: 'chart',
      title: 'Real-Time Dashboard Visualization',
      text: 'Processed data is presented through responsive dashboards with summaries, charting, alerts, historical views, and multi-site comparisons for desktop, tablet, and mobile use.',
    },
  ];

  useEffect(() => {
    let active = true;
    let retries = 0;

    function typeset() {
      if (!active) return;
      if (window.MathJax?.typesetPromise && pageRef.current) {
        window.MathJax.typesetPromise([pageRef.current]).catch(() => {});
        return;
      }
      retries += 1;
      if (retries < 30) window.setTimeout(typeset, 150);
    }

    typeset();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="howItWorksPage" ref={pageRef}>
      <section className="howItWorksHero">
        <div>
          <span className="howItWorksBadge">Platform Architecture & Data Flow</span>
          <h2>How It Works</h2>
          <p>
            The IoT monitoring platform collects, manages, analyzes, and visualizes operational data from multiple
            locations in a reliable and scalable way.
          </p>
        </div>
        <div className="howItWorksHeroVisual">
          <img src={asset('/logos/system_overview.png')} alt="System overview diagram" />
        </div>
        <div className="howItWorksFlow" aria-label="End-to-end data flow">
          {flowSteps.map((step, index) => (
            <React.Fragment key={step}>
              <span>{step}</span>
              {index < flowSteps.length - 1 ? <i aria-hidden="true">→</i> : null}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="howItWorksApplications" aria-label="Supported monitoring applications">
        {applicationAreas.map((area, index) => {
          const AreaIcon = area.icon;
          return (
            <article className="howItWorksApplication" key={area.title}>
              <span className="howItWorksIcon small"><AreaIcon size={18} /></span>
              <HowItWorksArtwork variant={index === 2 ? 'cloud' : index === 3 ? 'chart' : 'nodes'} />
              <strong>{area.title}</strong>
              <span>{area.description}</span>
            </article>
          );
        })}
      </section>

      <section className="howItWorksPlatformGrid" aria-label="Platform workflow">
        {platformBlocks.map((block) => {
          const BlockIcon = block.icon;
          return (
            <article className={`howItWorksCard ${block.wide ? 'wide' : ''}`} key={block.title}>
              <span className="howItWorksIcon"><BlockIcon size={20} /></span>
              <HowItWorksArtwork variant={block.artwork} />
              <h3>{block.title}</h3>
              <p>{block.text}</p>
              {block.title === 'Edge Gateway Node' ? (
                <dl className="howItWorksSpecs">
                  <div><dt>Core Unit</dt><dd>ESP32 SoC Gateway</dd></div>
                  <div><dt>Bus Protocol</dt><dd>Modbus RTU</dd></div>
                  <div><dt>Interface</dt><dd>Serial RS485</dd></div>
                </dl>
              ) : null}
              {block.title === 'Slot Scheduling Data Transmission' ? (
                <div className="howItWorksBenefits">
                  {slotBenefits.map((benefit) => (
                    <span key={benefit}><CheckCircle2 size={16} />{benefit}</span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="howItWorksAnalytics">
        <div className="panelHeader">
          <div>
            <h2>Alert Analytics Features</h2>
            <p>Automated checks convert raw electricity measurements into actionable operating signals.</p>
          </div>
        </div>
        <div className="howItWorksFormulaGrid">
          <article className="howItWorksFormulaCard">
            <span className="howItWorksIcon warning"><Zap size={20} /></span>
            <HowItWorksArtwork variant="formula" />
            <h3>Voltage Out-of-Range Detection</h3>
            <p>
              Phase voltages are continuously compared against configurable operating limits. An alert is raised
              whenever any phase falls below the lower threshold or exceeds the upper threshold.
            </p>
            <div className="formulaBox mathFormula">
              <strong>Voltage status</strong>
              <span>{`\\[
V_{status} =
\\begin{cases}
\\text{Normal}, & V_{min} \\le V \\le V_{max} \\\\
\\text{Alert}, & V < V_{min} \\text{ or } V > V_{max}
\\end{cases}
\\]`}</span>
            </div>
            <div className="formulaBox mathFormula">
              <strong>Three-phase rule</strong>
              <span>{`\\[
V_{min} \\le V_A, V_B, V_C \\le V_{max}
\\]`}</span>
              <span>{`\\[
V_A \\text{ or } V_B \\text{ or } V_C \\notin [V_{min}, V_{max}]
\\]`}</span>
            </div>
          </article>

          <article className="howItWorksFormulaCard">
            <span className="howItWorksIcon danger"><Gauge size={20} /></span>
            <HowItWorksArtwork variant="formula" />
            <h3>Phase Current Imbalance Detection</h3>
            <p>
              Current imbalance monitoring evaluates how evenly electrical current is distributed across the three
              phases. High imbalance can indicate inefficient loading and accelerated equipment wear.
            </p>
            <div className="formulaBox mathFormula">
              <strong>Average phase current</strong>
              <span>{`\\[
I_{avg}=\\frac{I_A + I_B + I_C}{3}
\\]`}</span>
            </div>
            <div className="formulaBox mathFormula">
              <strong>Maximum deviation</strong>
              <span>{`\\[
\\Delta I_{max}=\\max\\left(|I_A-I_{avg}|, |I_B-I_{avg}|, |I_C-I_{avg}|\\right)
\\]`}</span>
            </div>
            <div className="formulaBox mathFormula">
              <strong>Current imbalance</strong>
              <span>{`\\[
\\text{Current Imbalance (\\%)}=\\frac{\\Delta I_{max}}{I_{avg}}\\times 100
\\]`}</span>
            </div>
          </article>
        </div>
      </section>

      <section className="howItWorksConclusion">
        By combining industrial-grade sensor integration, intelligent slot-based communication, cloud infrastructure,
        and real-time visualization, the platform helps manage electricity, water, environmental quality, and traffic
        data across multiple locations from one centralized system.
      </section>
    </div>
  );
}

function App() {
  const [activeMenu, setActiveMenu] = useState('summary');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clock = useClock();
  const isElectricity = activeMenu === 'electricity';
  const isWater = activeMenu === 'water';
  const isCo2 = activeMenu === 'co2';
  const isVehicle = activeMenu === 'vehicle';
  const isCarbon = activeMenu === 'carbon';
  const isHowItWorks = activeMenu === 'howItWorks';
  const isWeather = activeMenu === 'weather';
  const isReports = activeMenu === 'reports';
  const isAlerts = activeMenu === 'alerts';
  const pageDescription = 'Integrated Metering System powered by Internet of Things';

  function handleMenuChange(menuId) {
    setActiveMenu(menuId);
    setMobileMenuOpen(false);
  }

  return (
    <div className={`appShell ${mobileMenuOpen ? 'menuOpen' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            <Factory size={24} />
          </div>
          <div>
            <strong>Dashboard</strong>
            <span>Interface</span>
          </div>
        </div>

        <nav className="navList" aria-label="Dashboard menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`navItem ${activeMenu === item.id ? 'active' : ''}`}
                key={item.id}
                type="button"
                onClick={() => handleMenuChange(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebarOwner">
          <span>Owned by</span>
          <strong>Directorate of Reputation, Partnership and Global Connectivity</strong>
        </div>
      </aside>

      <div className="mainArea">
        <header className="topHeader">
          <button
            className="iconButton mobileOnly"
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            <Menu size={22} />
          </button>

          <div className="titleGroup">
            <img className="mainHeaderLogo" src={asset('/logos/undip-emblem.png')} alt="Universitas Diponegoro emblem" />
            <div>
              <h1>UNDIP GREEN MONITORING</h1>
              <p>{pageDescription}</p>
            </div>
          </div>

          <div className="headerTools">
            <div className="partnerLogos" aria-label="Partner logos">
              <span className="partnerLogoTile dark">
                <img src={asset('/logos/undip-wordmark.png')} alt="Universitas Diponegoro" />
              </span>
              <span className="partnerLogoTile">
                <img src={asset('/logos/rpggc.png')} alt="Directorate of Reputation, Partnership, and Global Connectivity" />
              </span>
              <span className="partnerLogoTile">
                <img src={asset('/logos/sdgs.png')} alt="Sustainable Development Goals" />
              </span>
              <span className="partnerLogoTile">
                <img src={asset('/logos/greenmetric.png')} alt="UI GreenMetric" />
              </span>
            </div>
            <div className="dateBox">
              <CalendarDays size={18} />
              <div>
                <strong>{clock.time}</strong>
                <span>{clock.date}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          {isElectricity ? (
            <ElectricityPage />
          ) : isWater ? (
            <WaterPage />
          ) : isCo2 ? (
            <Co2Page />
          ) : isVehicle ? (
            <VehicleCounterPage />
          ) : isCarbon ? (
            <CarbonFootprintPage />
          ) : isHowItWorks ? (
            <HowItWorksPage />
          ) : isWeather ? (
            <WeatherPage />
          ) : isReports ? (
            <ReportsPage />
          ) : isAlerts ? (
            <AlertsPage />
          ) : (
            <SummaryPage />
          )}
        </main>
      </div>
    </div>
  );
}

const reportCategoryFields = {
  electricity: [
    { key: 'energy_today_kwh', label: 'Energy Today', unit: 'kWh' },
    { key: 'current_power_kw', label: 'Current Power', unit: 'kW' },
    { key: 'max_power_today_kw', label: 'Peak Power', unit: 'kW' },
    { key: 'today_volt_compliance_percent', label: 'Compliance', unit: '%' },
  ],
  water: [
    { key: 'current_today_vol_m3', label: 'Volume Today', unit: 'm³' },
    { key: 'last_flow_m3h', label: 'Latest Flow', unit: 'm³/h' },
    { key: 'max_flow_today_m3h', label: 'Peak Flow', unit: 'm³/h' },
    { key: 'trend_percent', label: 'Trend', unit: '%' },
  ],
  co2: [
    { key: 'current_avg_co2_ppm', label: 'Current CO₂', unit: 'ppm' },
    { key: 'avg_co2_today_ppm', label: 'Average Today', unit: 'ppm' },
    { key: 'max_co2_today_ppm', label: 'Maximum Today', unit: 'ppm' },
    { key: 'today_co2_compliance_percent', label: 'Compliance', unit: '%' },
  ],
  vehicle: [
    { key: 'today_vehicle_count', label: 'Vehicles Today', unit: '' },
    { key: 'peak_car_per_min', label: 'Peak Cars/min', unit: '' },
    { key: 'peak_motorcycle_per_min', label: 'Peak Motorcycles/min', unit: '' },
    { key: 'delta_percent', label: 'Change', unit: '%' },
  ],
};

function getReportDateInputValue(date = new Date()) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getReportPeriodDates(period) {
  const end = new Date();
  const start = new Date(end);

  if (period === 'weekly') start.setDate(end.getDate() - 6);
  if (period === 'monthly') start.setDate(1);

  return {
    start: getReportDateInputValue(start),
    end: getReportDateInputValue(end),
  };
}

function formatReportDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getReportHistoryScale(period, startDate, endDate) {
  if (period === 'daily') return 'hourly';
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
  if (days <= 45) return 'daily';
  if (days <= 400) return 'weekly';
  return 'monthly';
}

function filterReportPoints(points, scale, startDate, endDate) {
  if (scale === 'hourly') return points.filter((point) => point.hasValue !== false);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  const datedPoints = points
    .map((point) => ({ ...point, date: parseChartDate(point.label) }))
    .filter((point) => point.date && point.hasValue !== false);
  if (!datedPoints.length) return points.filter((point) => point.hasValue !== false);
  return datedPoints.filter((point) => point.date >= start && point.date <= end);
}

function getReportDatasetStats(dataset) {
  const values = dataset.points.map((point) => point.value).filter(Number.isFinite);
  if (!values.length) return { aggregate: null, average: null, max: null, min: null };
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    aggregate: dataset.aggregation === 'average' ? total / values.length : total,
    average: total / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
  };
}

function mergeReportSeriesPoints(series) {
  const pointMap = new Map();
  series.forEach((item) => {
    item.points.forEach((point) => {
      pointMap.set(point.label, (pointMap.get(point.label) || 0) + point.value);
    });
  });
  return Array.from(pointMap, ([label, value]) => ({ label, value }));
}

function matchesReportLocation(sourceLocation, selectedLocation) {
  if (selectedLocation === 'all') return true;
  const aliases = {
    'Pos Satpam Entry Gate': ['Pos Satpam Entry Gate', 'Undip Entry Gate'],
    'Pos Satpam Perpus': ['Pos Satpam Perpus', 'Undip Perpus'],
    'Undip Entry Gate': ['Undip Entry Gate', 'Pos Satpam Entry Gate'],
    'Undip Perpus': ['Undip Perpus', 'Pos Satpam Perpus'],
  };
  return sourceLocation === selectedLocation || (aliases[sourceLocation] || []).includes(selectedLocation);
}

async function fetchReportHistory({ categories, endDate, location, period, startDate }) {
  const scale = getReportHistoryScale(period, startDate, endDate);
  const cacheKey = JSON.stringify({ categories: [...categories].sort(), endDate, location, scale, startDate });
  const cached = reportHistoryCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt <= reportHistoryCacheTtlMs) return cached.data;

  const datasets = [];
  const errors = [];

  if (categories.includes('electricity')) {
    const sources = electricityDataSources.filter((source) => location === 'all' || source.label === location);
    const results = await Promise.allSettled(sources.map(async (source) => {
      let points = getCachedEnergyHistory(source, scale);
      if (!points) {
        const response = await fetch(getEnergyHistoryCsvUrl(source, scale));
        if (!response.ok) throw new Error(`${source.label}: HTTP ${response.status}`);
        const config = energyHistoryScales[scale];
        points = parseCsvRows(await response.text()).map((row) => {
          const value = parseChartNumber(row[config.yIndex]);
          return { label: row[config.xIndex] || '', value: value ?? 0, hasValue: value !== null };
        }).filter((point) => point.label && (scale === 'daily' || point.hasValue));
        setCachedEnergyHistory(source, scale, points);
      }
      return {
        category: 'electricity',
        location: source.label,
        unit: 'kWh',
        aggregation: 'sum',
        points: filterReportPoints(points, scale, startDate, endDate),
      };
    }));
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.points.length) datasets.push(result.value);
      if (result.status === 'rejected') errors.push(`Electricity: ${result.reason.message}`);
    });
  }

  if (categories.includes('water')) {
    const sources = waterDataSources.filter((source) => location === 'all' || source.label === location);
    const results = await Promise.allSettled(sources.map(async (source) => {
      let points = getCachedWaterTotalizerHistory(source, scale);
      if (!points) {
        const response = await fetch(getWaterTotalizerHistoryCsvUrl(source, scale));
        if (!response.ok) throw new Error(`${source.label}: HTTP ${response.status}`);
        const config = energyHistoryScales[scale];
        points = parseCsvRows(await response.text()).map((row) => ({
          label: row[config.xIndex] || '',
          value: parseChartNumber(row[config.yIndex]),
        })).filter((point) => point.label && point.value !== null);
        setCachedWaterTotalizerHistory(source, scale, points);
      }
      return {
        category: 'water',
        location: source.label,
        unit: 'm³',
        aggregation: 'sum',
        points: filterReportPoints(points, scale, startDate, endDate),
      };
    }));
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.points.length) datasets.push(result.value);
      if (result.status === 'rejected') errors.push(`Water: ${result.reason.message}`);
    });
  }

  if (categories.includes('co2') && (location === 'all' || co2Locations.some((item) => matchesReportLocation(item.label, location)))) {
    try {
      let series = getCachedCo2History(scale);
      if (!series) {
        const config = co2HistoryScales[scale];
        const response = await fetch(getCo2CsvUrl('Pivot', config.range));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        series = parseMultiSeriesRows(await response.text(), co2SeriesWithAverage, config.xIndex, config.yIndexes);
        setCachedCo2History(scale, series);
      }
      series
        .filter((item) => item.id !== 'average' && matchesReportLocation(item.label, location))
        .forEach((item) => {
          const points = filterReportPoints(item.points, scale, startDate, endDate);
          if (points.length) datasets.push({
            category: 'co2',
            location: item.label,
            unit: 'ppm',
            aggregation: 'average',
            points,
          });
        });
    } catch (fetchError) {
      errors.push(`CO₂: ${fetchError.message}`);
    }
  }

  if (categories.includes('vehicle') && (location === 'all' || location === vehicleLocation)) {
    try {
      let series = getCachedVehicleCounter(scale);
      if (!series) {
        const config = vehicleCounterScales[scale];
        const response = await fetch(getVehicleCsvUrl('Pivot', config.range));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        series = parseVehicleCounterRows(await response.text(), config);
        setCachedVehicleCounter(scale, series);
      }
      const totalSeries = series.filter((item) => ['carTotal', 'motorTotal', 'truckTotal'].includes(item.id));
      const points = filterReportPoints(mergeReportSeriesPoints(totalSeries), scale, startDate, endDate);
      if (points.length) datasets.push({
        category: 'vehicle',
        location: vehicleLocation,
        unit: 'vehicles',
        aggregation: 'sum',
        points,
      });
    } catch (fetchError) {
      errors.push(`Vehicle: ${fetchError.message}`);
    }
  }

  const data = { datasets, errors, scale };
  reportHistoryCache.set(cacheKey, { cachedAt: Date.now(), data });
  return data;
}

function useReportHistoricalData(options) {
  const [state, setState] = useState({ datasets: [], errors: [], scale: 'daily', loading: true });
  const categoriesKey = [...options.categories].sort().join('|');

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    fetchReportHistory(options)
      .then((data) => {
        if (active) setState({ ...data, loading: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            datasets: [],
            errors: [error.message],
            scale: getReportHistoryScale(options.period, options.startDate, options.endDate),
            loading: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [categoriesKey, options.endDate, options.location, options.period, options.startDate]);

  return state;
}

function normalizeCsvText(value = '') {
  return String(value ?? '')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/³/g, '3')
    .replace(/₂/g, '2')
    .replace(/⁰/g, '0');
}

function csvEscape(value = '') {
  const text = normalizeCsvText(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildReportCsv({ title, location, startDate, endDate, generatedAt, categories, scale, datasets, errors }) {
  const rows = [];
  rows.push(['Report Title', title]);
  rows.push(['Location', location === 'all' ? 'All Available Locations' : location]);
  rows.push(['Categories', categories.map((category) => summaryCategories[category]?.label || category).join(' | ')]);
  rows.push(['Reporting period', `${formatReportDate(startDate)} - ${formatReportDate(endDate)}`]);
  rows.push(['Data scale', scale]);
  rows.push(['Generated at', generatedAt.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })]);
  if (errors?.length) {
    rows.push(['Notes', errors.join(' | ')]);
  }
  rows.push([]);
  rows.push(['Category', 'Location', 'Timestamp', 'Value', 'Unit', 'Aggregation']);

  const sortedData = [...datasets].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.location !== b.location) return a.location.localeCompare(b.location);
    return 0;
  });

  sortedData.forEach((dataset) => {
    dataset.points.forEach((point) => {
      rows.push([
        summaryCategories[dataset.category]?.label || dataset.category,
        dataset.location,
        point.label,
        point.value == null ? '' : point.value,
        dataset.unit || '',
        dataset.aggregation || '',
      ]);
    });
  });

  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

function ReportsPage() {
  const { model, loading, error, reload } = useSummaryMetrics();
  const temperature = useCo2TemperatureSeries();
  const initialDates = getReportPeriodDates('daily');
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [location, setLocation] = useState('all');
  const [reportType, setReportType] = useState('full');
  const [selectedCategories, setSelectedCategories] = useState(Object.keys(summaryCategories));
  const [exportingCsv, setExportingCsv] = useState(false);
  const history = useReportHistoricalData({
    categories: selectedCategories,
    endDate,
    location,
    period,
    startDate,
  });
  const selectedSites = location === 'all' ? (model?.sites || summaryExpectedSites) : [location];
  const selectedGroups = (model?.groups || []).filter((group) => (
    selectedSites.includes(group.siteName) && selectedCategories.includes(group.category)
  ));
  const selectedAttention = (model?.attention || []).filter((item) => {
    if (!selectedSites.includes(item.siteName)) return false;
    if (selectedCategories.includes(item.category)) return true;
    if (item.category === 'other' && item.sourceCategory && selectedCategories.includes(item.sourceCategory)) return true;
    return false;
  });
  const generatedAt = new Date();
  const reportTitle = reportType === 'executive'
    ? 'Executive Monitoring Summary'
    : reportType === 'category'
      ? 'Category Monitoring Report'
      : 'Full Monitoring Report';

  function handlePeriodChange(nextPeriod) {
    setPeriod(nextPeriod);
    if (nextPeriod !== 'custom') {
      const dates = getReportPeriodDates(nextPeriod);
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }

  function toggleCategory(category) {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.length === 1 ? current : current.filter((item) => item !== category);
      }
      return [...current, category];
    });
  }

  async function exportCsv() {
    if (!history.datasets.length) return;
    setExportingCsv(true);
    try {
      const csv = buildReportCsv({
        title: reportTitle,
        location,
        startDate,
        endDate,
        generatedAt,
        categories: selectedCategories,
        scale: history.scale,
        datasets: history.datasets,
        errors: history.errors,
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `undip-monitoring-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed', error);
    } finally {
      setExportingCsv(false);
    }
  }

  function generatePdf() {
    window.print();
  }

  return (
    <>
      <section className="summaryPageHeader reportPageHeader">
        <div>
          <h2>Monitoring Reports</h2>
          <p>Build a readable report from the latest consolidated metering data.</p>
        </div>
        <button className="textButton" type="button" onClick={reload} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Loading' : 'Refresh Data'}</span>
        </button>
      </section>

      {error ? <div className="notice">{error}</div> : null}

      <section className="panel reportBuilder">
        <div className="panelHeader">
          <div>
            <h2>Report Builder</h2>
            <p>Configure the report content before exporting it as PDF.</p>
          </div>
          <div className="reportActionGroup">
            <button className="reportPrimaryButton" type="button" onClick={generatePdf} disabled={loading || !model}>
              <Download size={17} />
              <span>Generate PDF</span>
            </button>
            <button
              className="reportSecondaryButton"
              type="button"
              onClick={exportCsv}
              disabled={loading || exportingCsv || history.loading || !history.datasets.length}
            >
              <Download size={17} className={loading || history.loading || exportingCsv ? 'spin' : ''} />
              <span>
                {exportingCsv
                  ? 'Exporting CSV'
                  : history.loading
                    ? 'Loading report data...'
                    : loading
                      ? 'Loading...'
                      : 'Export CSV'}
              </span>
            </button>
          </div>
        </div>

        <div className="reportControlGrid">
          <label className="reportField">
            <span>Report Type</span>
            <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
              <option value="full">Full Monitoring Report</option>
              <option value="executive">Executive Summary</option>
              <option value="category">Category Report</option>
            </select>
          </label>

          <label className="reportField">
            <span>Location</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="all">All Available Locations</option>
              {(model?.sites || summaryExpectedSites).map((siteName) => (
                <option key={siteName} value={siteName}>{siteName}</option>
              ))}
            </select>
          </label>

          <div className="reportField">
            <span>Report Period</span>
            <div className="segmentedControl reportPeriodControl">
              {['daily', 'weekly', 'monthly', 'custom'].map((option) => (
                <button
                  className={period === option ? 'active' : ''}
                  key={option}
                  type="button"
                  onClick={() => handlePeriodChange(option)}
                >
                  {option[0].toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="reportDateRange">
            <label className="reportField">
              <span>From</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPeriod('custom');
                }}
              />
            </label>
            <label className="reportField">
              <span>To</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPeriod('custom');
                }}
              />
            </label>
          </div>
        </div>

        <div className="reportCategorySelector">
          <span>Included Categories</span>
          <div>
            {Object.entries(summaryCategories).map(([category, config]) => {
              const Icon = config.icon;
              return (
                <label className={`reportCategoryOption ${selectedCategories.includes(category) ? 'selected' : ''}`} key={category}>
                  <input
                    checked={selectedCategories.includes(category)}
                    type="checkbox"
                    onChange={() => toggleCategory(category)}
                  />
                  <Icon size={16} />
                  <span>{config.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="reportPreviewShell">
        <div className="reportPreviewLabel">
          <FileText size={18} />
          <div>
            <strong>Report Preview</strong>
            <span>The PDF will use the document layout below.</span>
          </div>
        </div>

        <article className="reportDocument reportPrintArea">
          <ReportCover
            endDate={endDate}
            generatedAt={generatedAt}
            location={location}
            reportTitle={reportTitle}
            startDate={startDate}
          />
          <ReportExecutiveSummary
            attention={selectedAttention}
            categories={selectedCategories}
            groups={selectedGroups}
            history={history}
            loading={loading}
            sites={selectedSites}
          />
          {reportType !== 'executive' ? (
            <>
              <ReportHistoricalPerformance history={history} />
              <ReportCurrentDayOperations
                categories={selectedCategories}
                groups={selectedGroups}
                location={location}
                temperature={temperature}
              />
              <ReportLocationOverview
                attention={selectedAttention}
                categories={selectedCategories}
                groups={selectedGroups}
                sites={selectedSites}
              />
              <ReportCategoryComparisons categories={selectedCategories} groups={selectedGroups} />
            </>
          ) : null}
          <ReportFindings attention={selectedAttention} />
          <footer className="reportFooter">
            <span>Directorate of Reputation, Partnership and Global Connectivity</span>
            <span>UNDIP Green Monitoring</span>
          </footer>
        </article>
      </section>
    </>
  );
}

function ReportCover({ endDate, generatedAt, location, reportTitle, startDate }) {
  return (
    <header className="reportCover">
      <div className="reportBrandLine">
        <img src={asset('/logos/undip-emblem.png')} alt="Universitas Diponegoro emblem" />
        <div>
          <strong>UNDIP GREEN MONITORING</strong>
          <span>Integrated Metering System powered by Internet of Things</span>
        </div>
      </div>
      <div className="reportCoverTitle">
        <span>Monitoring document</span>
        <h2>{reportTitle}</h2>
        <p>{location === 'all' ? 'All Available Locations' : location}</p>
      </div>
      <dl className="reportCoverMeta">
        <div><dt>Reporting period</dt><dd>{formatReportDate(startDate)} - {formatReportDate(endDate)}</dd></div>
        <div><dt>Generated</dt><dd>{generatedAt.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</dd></div>
        <div><dt>Data source</dt><dd>Category historical archives and consolidated central metrics</dd></div>
      </dl>
    </header>
  );
}

function ReportExecutiveSummary({ attention, categories, history, loading, sites }) {
  const reportKpis = categories.map((category) => {
    const config = summaryCategories[category];
    const categoryDatasets = history.datasets.filter((dataset) => dataset.category === category);
    const values = categoryDatasets
      .map((dataset) => getReportDatasetStats(dataset).aggregate)
      .filter((value) => value !== null);
    const value = category === 'co2'
      ? (values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : null)
      : (values.length ? values.reduce((sum, item) => sum + item, 0) : null);
    return { category, config, historical: categoryDatasets.length > 0, value };
  });

  return (
    <section className="reportSection">
      <div className="reportSectionHeading">
        <span>01</span>
        <div><h3>Executive Summary</h3><p>Historical performance for the selected period with current operational checks.</p></div>
      </div>
      <div className="reportStatGrid">
        <div className="reportStat"><span>Locations</span><strong>{sites.length}</strong><small>Selected monitoring sites</small></div>
        <div className={`reportStat ${attention.length ? 'warning' : 'positive'}`}>
          <span>Need Attention</span><strong>{attention.length}</strong><small>{attention.length ? 'Checks require review' : 'No active findings'}</small>
        </div>
        {reportKpis.map(({ category, config, historical, value }) => (
          <div className={`reportStat ${config.tone}`} key={category}>
            <span>{category === 'co2' ? 'Average CO₂ Today' : category === 'vehicle' ? 'Vehicles Today' : `${config.label} Today`}</span>
            <span className="reportPeriodMetricLabel">{category === 'co2' ? 'Average Carbon Dioxide' : category === 'vehicle' ? 'Total Vehicles' : category === 'water' ? 'Water Volume' : 'Energy Consumption'}</span>
            <strong>{loading || history.loading || value === null ? '-' : formatSummaryNumber(value, category === 'vehicle' ? 0 : 2)}</strong>
            <small>{historical ? `${config.primaryUnit || 'count'} · selected period` : 'Historical data unavailable'}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportHistoricalPerformance({ history }) {
  const grouped = Object.keys(summaryCategories)
    .map((category) => ({
      category,
      datasets: history.datasets.filter((dataset) => dataset.category === category),
    }))
    .filter((group) => group.datasets.length);

  return (
    <section className="reportSection reportPageBreak">
      <div className="reportSectionHeading">
        <span>02</span>
        <div>
          <h3>Historical Period Performance</h3>
          <p>Aggregated from the {history.scale} archive available in each monitoring category.</p>
        </div>
      </div>
      {history.loading ? <div className="reportHistoryState">Loading historical category data...</div> : null}
      {history.errors.length ? <div className="reportHistoryNotice">{history.errors.join(' · ')}</div> : null}
      <div className="reportHistoryGrid">
        {grouped.map(({ category, datasets }) => {
          const config = summaryCategories[category];
          const title = category === 'electricity'
            ? 'Energy'
            : category === 'water'
              ? 'Water Volume'
              : category === 'co2'
                ? 'Carbon Dioxide Concentration'
                : 'Vehicle Total';
          return (
            <div className={`reportHistoryCard ${config.tone}`} key={category}>
              <div className="reportHistoryCardHeader">
                <div><strong>{title}</strong><span>{datasets[0].unit}</span></div>
                <small>{energyHistoryScales[history.scale]?.label || history.scale} archive</small>
              </div>
              <div className="reportHistoryRows">
                {datasets.map((dataset) => {
                  const stats = getReportDatasetStats(dataset);
                  const decimals = category === 'vehicle' ? 0 : 2;
                  return (
                    <div className="reportHistoryRow" key={`${category}-${dataset.location}`}>
                      <strong>{dataset.location}</strong>
                      <div className="reportHistoryStats">
                        <span><small>Samples</small>{dataset.points.length}</span>
                        <span><small>Minimum</small>{formatSummaryNumber(stats.min, decimals)}</span>
                        <span><small>Maximum</small>{formatSummaryNumber(stats.max, decimals)}</span>
                        <span><small>Average</small>{formatSummaryNumber(stats.average, decimals)}</span>
                        {dataset.aggregation !== 'average' ? (
                          <span><small>Period Total</small>{formatSummaryNumber(stats.aggregate, decimals)}</span>
                        ) : null}
                      </div>
                      <ReportMiniBars points={dataset.points} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="reportMethodNote">
        Historical coverage: Electricity uses Energy, Water uses Volume, and Carbon Dioxide uses ppm. Power, Flow, and Temperature are current-day operational snapshots and are not extrapolated across the selected period.
      </p>
    </section>
  );
}

function ReportMiniBars({ points }) {
  const values = points.map((point) => point.value).filter(Number.isFinite);
  const maxValue = Math.max(...values, 1);
  const sampled = points.length > 24
    ? points.filter((_, index) => index % Math.ceil(points.length / 24) === 0)
    : points;
  return (
    <div className="reportMiniBars" aria-label="Historical trend">
      {sampled.map((point, index) => (
        <i
          key={`${point.label}-${index}`}
          style={{ height: `${Math.max(6, (point.value / maxValue) * 100)}%` }}
          title={`${point.label}: ${formatSummaryNumber(point.value, 2)}`}
        />
      ))}
    </div>
  );
}

function ReportCurrentDayOperations({ categories, groups, location, temperature }) {
  const items = [];

  if (categories.includes('electricity')) {
    groups.filter((group) => group.category === 'electricity').forEach((group) => {
      items.push({
        category: 'electricity',
        location: group.siteName,
        metric: 'Average Power',
        current: getSummaryNumericMetric(group, 'current_power_kw'),
        peak: getSummaryNumericMetric(group, 'max_power_today_kw'),
        unit: 'kW',
      });
    });
  }

  if (categories.includes('water')) {
    groups.filter((group) => group.category === 'water').forEach((group) => {
      items.push({
        category: 'water',
        location: group.siteName,
        metric: 'Flow',
        current: getSummaryNumericMetric(group, 'last_flow_m3h'),
        peak: getSummaryNumericMetric(group, 'max_flow_today_m3h'),
        unit: 'm³/h',
      });
    });
  }

  if (categories.includes('co2')) {
    temperature.series
      .filter((series) => matchesReportLocation(series.label, location))
      .forEach((series) => {
        const values = series.points.map((point) => point.value).filter(Number.isFinite);
        if (values.length) {
          items.push({
            category: 'co2',
            location: series.label,
            metric: 'Temperature',
            current: values[values.length - 1],
            peak: Math.max(...values),
            unit: '°C',
          });
        }
      });
  }

  return (
    <section className="reportSection">
      <div className="reportSectionHeading">
        <span>03</span>
        <div>
          <h3>Current-Day Operational Snapshot</h3>
          <p>Power, Flow, and Temperature are available for the active day only.</p>
        </div>
      </div>
      {temperature.error && categories.includes('co2') ? <div className="reportHistoryNotice">{temperature.error}</div> : null}
      <div className="reportOperationGrid">
        {items.length ? items.map((item) => (
          <div className={`reportOperationCard ${summaryCategories[item.category].tone}`} key={`${item.category}-${item.location}`}>
            <span>{item.metric}</span>
            <strong>{item.location}</strong>
            <div>
              <span><small>Latest</small>{formatSummaryNumber(item.current, 2)} {item.unit}</span>
              <span><small>Today maximum</small>{formatSummaryNumber(item.peak, 2)} {item.unit}</span>
            </div>
          </div>
        )) : (
          <div className="reportHistoryState">No current-day operational data is available for the selected scope.</div>
        )}
      </div>
    </section>
  );
}

function ReportLocationOverview({ attention, categories, groups, sites }) {
  return (
    <section className="reportSection">
      <div className="reportSectionHeading">
        <span>04</span>
        <div><h3>Current Location Overview</h3><p>Latest primary values, trend, and source condition at report generation time.</p></div>
      </div>
      <div className="reportTableWrap">
        <table className="reportTable">
          <thead>
            <tr>
              <th>Location</th>
              <th>Condition</th>
              {categories.map((category) => <th key={category}>{summaryCategories[category].label}</th>)}
              <th>Latest Update</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((siteName) => {
              const siteGroups = groups.filter((group) => group.siteName === siteName);
              const siteAttention = attention.filter((item) => item.siteName === siteName);
              const latestGroup = siteGroups
                .filter((group) => getSummaryMetric(group, 'raw_last_update'))
                .sort((left, right) => (
                  (parseSummaryTimestamp(getSummaryMetric(right, 'raw_last_update'))?.getTime() || 0)
                  - (parseSummaryTimestamp(getSummaryMetric(left, 'raw_last_update'))?.getTime() || 0)
                ))[0];
              return (
                <tr key={siteName}>
                  <td><strong>{siteName}</strong></td>
                  <td><span className={`reportStatus ${siteAttention.length ? 'review' : siteGroups.length ? 'normal' : 'empty'}`}>{siteAttention.length ? 'Review' : siteGroups.length ? 'Normal' : 'No data'}</span></td>
                  {categories.map((category) => {
                    const config = summaryCategories[category];
                    const group = getSummaryGroup(groups, siteName, category);
                    const value = getSummaryNumericMetric(group, config.primaryKey);
                    const trend = getSummaryNumericMetric(group, category === 'vehicle' ? 'delta_percent' : 'trend_percent');
                    return (
                      <td key={category}>
                        <strong>{value === null ? '-' : formatSummaryNumber(value, category === 'vehicle' ? 0 : 2)} {value === null ? '' : config.primaryUnit}</strong>
                        {trend !== null ? <small className={trend > 0 ? 'up' : trend < 0 ? 'down' : ''}>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {formatSummaryNumber(Math.abs(trend), 1)}%</small> : null}
                      </td>
                    );
                  })}
                  <td>{formatSummaryTimestamp(getSummaryMetric(latestGroup, 'raw_last_update'))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportCategoryComparisons({ categories, groups }) {
  return (
    <section className="reportSection">
      <div className="reportSectionHeading">
        <span>05</span>
        <div><h3>Current Category Comparison</h3><p>Relative latest snapshot between available locations.</p></div>
      </div>
      <div className="reportComparisonGrid">
        {categories.map((category) => {
          const config = summaryCategories[category];
          const categoryValues = groups
            .filter((group) => group.category === category)
            .map((group) => ({ siteName: group.siteName, value: getSummaryNumericMetric(group, config.primaryKey) }))
            .filter((item) => item.value !== null);
          const maxValue = Math.max(...categoryValues.map((item) => item.value), 1);
          return (
            <div className={`reportComparison ${config.tone}`} key={category}>
              <div><strong>{config.label}</strong><span>{config.primaryUnit || 'count'}</span></div>
              {categoryValues.length ? categoryValues.map((item) => (
                <div className="reportComparisonRow" key={item.siteName}>
                  <span>{item.siteName}</span>
                  <div><i style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }} /></div>
                  <strong>{formatSummaryNumber(item.value, category === 'vehicle' ? 0 : 2)}</strong>
                </div>
              )) : <p>No valid data available.</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReportFindings({ attention }) {
  return (
    <section className="reportSection">
      <div className="reportSectionHeading">
        <span>06</span>
        <div><h3>Findings & Recommendations</h3><p>Automatically generated checks based on the latest consolidated metrics.</p></div>
      </div>
      <div className="reportFindings">
        {attention.length ? attention.map((item, index) => (
          <div className={`reportFinding ${item.severity}`} key={`${item.siteName}-${item.title}-${index}`}>
            <span>{index + 1}</span>
            <div>
              <strong>{item.siteName} · {item.title}</strong>
              <p>{item.detail}</p>
              <small>Recommendation: {getAttentionRecommendation(item)}</small>
            </div>
          </div>
        )) : (
          <div className="reportFinding positive">
            <CheckCircle2 size={20} />
            <div><strong>No active findings</strong><p>All selected and available data sources are currently within the configured checks.</p></div>
          </div>
        )}
      </div>
    </section>
  );
}

function getSiteCategorySeverity(siteName, category, attention, groups) {
  if (category === 'other') {
    const otherAttention = attention.filter((item) => item.siteName === siteName && item.category === 'other');
    if (otherAttention.some((item) => item.severity === 'danger')) return 'danger';
    if (otherAttention.length) return 'warning';
    return 'normal';
  }

  const categoryAttention = attention.filter((item) => item.siteName === siteName && item.category === category);
  if (categoryAttention.some((item) => item.severity === 'danger')) return 'danger';
  if (categoryAttention.length) return 'warning';
  if (getSummaryGroup(groups, siteName, category)) return 'normal';
  return 'neutral';
}

function AlertsPage() {
  const { model, loading, error, reload } = useSummaryMetrics();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const attention = model?.attention || [];
  const groups = model?.groups || [];
  const sites = model?.sites || summaryExpectedSites;
  const alarmCount = attention.filter((item) => item.severity === 'danger').length;
  const warningCount = attention.filter((item) => item.severity === 'warning').length;
  const affectedSites = new Set(attention.map((item) => item.siteName));
  const healthySiteCount = sites.filter((siteName) => !affectedSites.has(siteName)).length;
  const reportingSiteCount = new Set(groups.map((group) => group.siteName)).size;

  const filteredAlerts = useMemo(() => {
    return attention
      .filter((item) => severityFilter === 'all' || item.severity === severityFilter)
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => locationFilter === 'all' || item.siteName === locationFilter)
      .sort((left, right) => {
        const severityOrder = { danger: 0, warning: 1 };
        const severityDiff = (severityOrder[left.severity] ?? 2) - (severityOrder[right.severity] ?? 2);
        if (severityDiff !== 0) return severityDiff;
        const siteDiff = left.siteName.localeCompare(right.siteName);
        if (siteDiff !== 0) return siteDiff;
        return left.title.localeCompare(right.title);
      });
  }, [attention, severityFilter, categoryFilter, locationFilter]);

  const categoryBreakdown = useMemo(() => (
    Object.entries(alertCategories).map(([category, config]) => ({
      category,
      label: config.label,
      count: attention.filter((item) => item.category === category).length,
    }))
  ), [attention]);

  const mostAffectedSite = useMemo(() => {
    const counts = new Map();
    attention.forEach((item) => {
      counts.set(item.siteName, (counts.get(item.siteName) || 0) + 1);
    });

    return [...counts.entries()].sort((left, right) => right[1] - left[1])[0] || null;
  }, [attention]);

  return (
    <>
      <section className="summaryPageHeader">
        <div>
          <h2>Alerts Center</h2>
          <p>
            {model?.collectedAt
              ? `Active checks from central metrics collected at ${formatSummaryTimestamp(model.collectedAt)}`
              : 'Consolidated monitoring checks across all locations and categories.'}
          </p>
        </div>
        <button className="textButton" type="button" onClick={reload} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Loading' : 'Refresh'}</span>
        </button>
      </section>

      {error ? <div className="notice">{error}</div> : null}

      <section className="summaryGrid alertsSummaryGrid" aria-label="Alert summary metrics">
        <Metric
          icon={Bell}
          label="Total Active Alerts"
          note={`${filteredAlerts.length} shown after filters`}
          tone="amber"
          value={loading ? '...' : attention.length}
        />
        <Metric
          icon={AlertTriangle}
          label="Alarm"
          note="Checks requiring immediate review"
          tone="red"
          value={loading ? '...' : alarmCount}
        />
        <Metric
          icon={Activity}
          label="Warning"
          note="Checks that should be monitored"
          tone="amber"
          value={loading ? '...' : warningCount}
        />
        <Metric
          icon={CheckCircle2}
          label="Healthy Locations"
          note={`${reportingSiteCount} of ${sites.length} sites reporting`}
          tone="green"
          value={loading ? '...' : healthySiteCount}
        />
      </section>

      <section className="panel alertsFilterPanel">
        <div className="panelHeader compact">
          <div>
            <h2>Filters</h2>
            <p>Refine the alert feed by severity, category, and location.</p>
          </div>
        </div>

        <div className="alertsFilterGrid">
          <div className="alertsFilterGroup">
            <span className="alertsFilterLabel">Severity</span>
            <div className="segmentedControl alertsFilterControl" aria-label="Filter alerts by severity">
              {[
                { id: 'all', label: 'All' },
                { id: 'danger', label: 'Alarm' },
                { id: 'warning', label: 'Warning' },
              ].map((option) => (
                <button
                  className={severityFilter === option.id ? 'active' : ''}
                  key={option.id}
                  type="button"
                  onClick={() => setSeverityFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="alertsFilterGroup">
            <span className="alertsFilterLabel">Category</span>
            <div className="segmentedControl alertsFilterControl" aria-label="Filter alerts by category">
              <button
                className={categoryFilter === 'all' ? 'active' : ''}
                type="button"
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              {Object.entries(alertCategories).map(([category, config]) => (
                <button
                  className={categoryFilter === category ? 'active' : ''}
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div className="alertsFilterGroup">
            <span className="alertsFilterLabel">Location</span>
            <select
              className="alertsLocationSelect"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              aria-label="Filter alerts by location"
            >
              <option value="all">All locations</option>
              {sites.map((siteName) => (
                <option key={siteName} value={siteName}>{siteName}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="summaryOverview alertsOverview">
        <div className="panel widePanel alertsFeedPanel">
          <div className="panelHeader compact">
            <div>
              <h2>Active Alerts</h2>
              <p>
                {filteredAlerts.length
                  ? `${filteredAlerts.length} alert${filteredAlerts.length > 1 ? 's' : ''} match the current filters`
                  : attention.length
                    ? 'No alerts match the current filters'
                    : 'No active issues detected'}
              </p>
            </div>
            <Bell size={20} />
          </div>

          <div className="attentionList alertsFeedList">
            {filteredAlerts.length ? filteredAlerts.map((item, index) => {
              const AttentionIcon = getAttentionIcon(item);
              return (
                <div className={`attentionItem ${item.severity}`} key={`${item.siteName}-${item.title}-${index}`}>
                  <span className={`attentionIcon ${item.category}`}>
                    <AttentionIcon size={17} />
                  </span>
                  <div>
                    <div className="alertsItemHeading">
                      <strong>{item.siteName}: {item.title}</strong>
                      <span className={`statusPill ${item.severity === 'danger' ? 'danger' : 'warning'}`}>
                        {translateStatus(item.severity)}
                      </span>
                    </div>
                    <span>{getAlertCategoryLabel(item)} · {item.detail}</span>
                    <small>{getAttentionRecommendation(item)}</small>
                  </div>
                </div>
              );
            }) : (
              <div className="attentionEmpty">
                <CheckCircle2 size={24} />
                <span>
                  {attention.length
                    ? 'Try changing the filters to see other alerts.'
                    : 'All available sources look healthy.'}
                </span>
              </div>
            )}
          </div>
        </div>

        <aside className="panel attentionPanel alertsSidebar">
          <div className="panelHeader compact">
            <div>
              <h2>Alert Overview</h2>
              <p>Location and category breakdown from the latest snapshot.</p>
            </div>
          </div>

          <div className="alertsSidebarSection">
            <span className="alertsSidebarLabel">By Category</span>
            <div className="alertsBreakdownList">
              {categoryBreakdown.map((entry) => (
                <div className="alertsBreakdownItem" key={entry.category}>
                  <span>{entry.label}</span>
                  <strong>{loading ? '...' : entry.count}</strong>
                </div>
              ))}
            </div>
          </div>

          {mostAffectedSite ? (
            <div className="alertsSidebarSection">
              <span className="alertsSidebarLabel">Most Affected Location</span>
              <div className="alertsHighlightCard">
                <strong>{mostAffectedSite[0]}</strong>
                <span>{mostAffectedSite[1]} active alert{mostAffectedSite[1] > 1 ? 's' : ''}</span>
              </div>
            </div>
          ) : null}

          <div className="alertsSidebarSection">
            <span className="alertsSidebarLabel">Location Health</span>
            <div className="alertsLocationList">
              {sites.map((siteName) => {
                const siteAttention = attention.filter((item) => item.siteName === siteName);
                const siteSeverity = siteAttention.some((item) => item.severity === 'danger')
                  ? 'danger'
                  : siteAttention.length
                    ? 'warning'
                    : groups.some((group) => group.siteName === siteName)
                      ? 'normal'
                      : 'neutral';

                return (
                  <div className="alertsLocationCard" key={siteName}>
                    <div className="alertsLocationHeader">
                      <strong>{siteName}</strong>
                      <span className={`statusPill ${siteSeverity}`}>
                        {siteSeverity === 'normal'
                          ? 'Normal'
                          : siteSeverity === 'neutral'
                            ? 'No data'
                            : 'Review'}
                      </span>
                    </div>
                    <div className="alertsCategoryDots" aria-label={`${siteName} category health`}>
                      {Object.entries(alertCategories).map(([category, config]) => {
                        const dotSeverity = getSiteCategorySeverity(siteName, category, attention, groups);
                        const dotLabel = category === 'other'
                          ? 'Other'
                          : config.label;
                        return (
                          <span
                            className={`alertDot ${dotSeverity}`}
                            key={category}
                            title={`${dotLabel}: ${dotSeverity === 'normal' ? 'Normal' : dotSeverity === 'neutral' ? 'No data' : 'Review'}`}
                          />
                        );
                      })}
                    </div>
                    <div className="alertsCategoryLegend">
                      <span>E</span>
                      <span>W</span>
                      <span>CO₂</span>
                      <span>V</span>
                      <span>O</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      setWeatherError(null);
      setLoadingWeather(true);
      try {
        const data = await fetchWeatherData();
        if (active) setWeather(data);
      } catch (error) {
        if (active) setWeatherError(error.message);
      } finally {
        if (active) setLoadingWeather(false);
      }
    }

    loadWeather();
    return () => { active = false; };
  }, [refreshKey]);

  const currentIndex = weather ? getCurrentWeatherHourIndex(weather) : 0;
  const currentTemp = weather?.current_weather?.temperature;
  const currentHumidity = weather?.hourly?.relativehumidity_2m?.[currentIndex];
  const currentWind = weather?.hourly?.windspeed_10m?.[currentIndex];
  const currentRainChance = weather?.hourly?.precipitation_probability?.[currentIndex];
  const currentUvIndex = weather?.hourly?.uv_index?.[currentIndex];
  const hourlyPoints = weather ? getWeatherHourlyPoints(weather) : [];
  const dailyForecasts = weather ? getWeatherDailyForecasts(weather).slice(0, 4) : [];

  return (
    <>
      <section className="summaryPageHeader">
        <div className="summaryPageHeaderTitle">
          <img className="weatherHeaderLogo" src={asset('/logos/logo_weather.png')} alt="Weather logo" />
          <div>
            <h2>Weather — Tembalang, Semarang</h2>
            <p>Latest weather conditions and forecast for the campus area.</p>
            <p className="weatherSourceNote">Data source: Open-Meteo Weather API.</p>
          </div>
        </div>
        <button
          className="textButton"
          type="button"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={loadingWeather}
        >
          <RefreshCw size={17} className={loadingWeather ? 'spin' : ''} />
          <span>{loadingWeather ? 'Refreshing' : 'Refresh Weather'}</span>
        </button>
      </section>

      {weatherError ? <div className="notice">{weatherError}</div> : null}

      <section className="summaryGrid summaryGridFive">
        <Metric
          icon={ThermometerSun}
          label="Temperature"
          note="Current temperature"
          tone="blue"
          value={loadingWeather ? '...' : currentTemp != null ? currentTemp.toFixed(1) : '-'}
          unit="°C"
        />
        <Metric
          icon={Droplets}
          label="Humidity"
          note="Relative humidity"
          tone="green"
          value={loadingWeather ? '...' : currentHumidity != null ? Math.round(currentHumidity) : '-'}
          unit="%"
        />
        <Metric
          icon={Wind}
          label="Wind Speed"
          note="Current surface wind"
          tone="amber"
          value={loadingWeather ? '...' : currentWind != null ? currentWind.toFixed(1) : '-'}
          unit="m/s"
        />
        <Metric
          icon={Sun}
          label="UV Index"
          note="Current ultraviolet level"
          tone="amber"
          value={loadingWeather ? '...' : currentUvIndex != null ? Math.round(currentUvIndex) : '-'}
        />
        <Metric
          icon={Cloud}
          label="Rain Chance"
          note="Next hourly probability"
          tone="blue"
          value={loadingWeather ? '...' : currentRainChance != null ? Math.round(currentRainChance) : '-'}
          unit="%"
        />
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Hourly Observed and Forecast</h2>
            <p>Today in Tembalang.</p>
          </div>
        </div>
        {loadingWeather ? (
          <div className="chartState">Loading weather data...</div>
        ) : (
          <WeatherHourlyChart points={hourlyPoints} />
        )}
      </section>

      <section className="panel">
        <div className="panelHeader compact">
          <div>
            <h2>Daily outlook</h2>
            <p>Local forecast for the next days.</p>
          </div>
        </div>
        <div className="summaryGrid weatherForecastGrid">
          {dailyForecasts.map((forecast) => (
            <div className="panel weatherDayCard" key={forecast.date}>
              <div>
                <strong>{forecast.label}</strong>
                <div>{forecast.precipitation.toFixed(1)} mm precipitation</div>
              </div>
              <div className="weatherDayStats">
                <span>High {Math.round(forecast.max)}°C</span>
                <span>Low {Math.round(forecast.min)}°C</span>
              </div>
              <div className="weatherDayDetails">
                <span>Sunrise {formatWeatherTimeLabel(forecast.sunrise)}</span>
                <span>Sunset {formatWeatherTimeLabel(forecast.sunset)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function WeatherHourlyChart({ points }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartRef = useRef(null);

  if (!points.length) {
    return <div className="chartState">No hourly forecast available.</div>;
  }

  const width = 920;
  const height = 320;
  const padding = { top: 24, right: 54, bottom: 48, left: 66 };
  const tempPoints = points.map((point) => ({ label: point.label, value: point.value, estimated: point.estimated }));
  const humidityPoints = points.map((point) => ({ label: point.label, value: point.humidity ?? 0, estimated: point.estimated }));

  const tempCoordinates = createLineChartCoordinatesWithRange(tempPoints, width, height, padding, 20, 40);
  const humidityCoordinates = createLineChartCoordinatesWithRange(humidityPoints, width, height, padding, 0, 100);
  const tempAreaPath = createLineAreaPath(tempCoordinates, height, padding);
  const humidityLinePath = createSmoothLinePath(humidityCoordinates);

  // Split observed vs forecast (estimated) so we can style forecast differently
  const firstForecastIndex = tempPoints.findIndex((p) => p.estimated);
  const splitIndex = firstForecastIndex >= 0 ? firstForecastIndex : tempCoordinates.length;
  const observedCoordinates = tempCoordinates.slice(0, splitIndex);
  const forecastCoordinates = splitIndex < tempCoordinates.length ? tempCoordinates.slice(Math.max(0, splitIndex - 1)) : [];
  const observedLinePath = createSmoothLinePath(observedCoordinates);
  const forecastLinePath = createSmoothLinePath(forecastCoordinates);
  const observedAreaPath = createLineAreaPath(observedCoordinates, height, padding);
  const forecastAreaPath = forecastCoordinates.length ? createLineAreaPath(forecastCoordinates, height, padding) : '';

  // Do the same split for humidity so forecast part can be dashed
  const firstForecastIndexH = humidityPoints.findIndex((p) => p.estimated);
  const splitIndexH = firstForecastIndexH >= 0 ? firstForecastIndexH : humidityCoordinates.length;
  const observedHumidityCoordinates = humidityCoordinates.slice(0, splitIndexH);
  const forecastHumidityCoordinates = splitIndexH < humidityCoordinates.length ? humidityCoordinates.slice(Math.max(0, splitIndexH - 1)) : [];
  const observedHumidityLinePath = createSmoothLinePath(observedHumidityCoordinates);
  const forecastHumidityLinePath = createSmoothLinePath(forecastHumidityCoordinates);

  const tempValues = tempPoints.map((point) => point.value);
  const tempMin = 20;
  const tempMax = 40;
  const yTicks = [tempMax, Math.round((tempMax + tempMin) / 2), tempMin];
  const humidityTicks = [100, 50, 0];

  const xLabels = tempCoordinates.filter((_, index) => {
    if (tempCoordinates.length <= 8) return true;
    const step = Math.ceil(tempCoordinates.length / 6);
    return index === 0 || index === tempCoordinates.length - 1 || index % step === 0;
  });

  function handleHover(event, index) {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = points[index];
    setHoveredPoint({
      label: point.label,
      temp: point.value,
      humidity: point.humidity ?? 0,
      wind: point.wind ?? 0,
      rainChance: point.rainChance ?? 0,
      uvIndex: point.uvIndex ?? null,
      estimated: !!point.estimated,
      left: event.clientX - rect.left,
      top: event.clientY - rect.top,
    });
  }

  function clearHover() {
    setHoveredPoint(null);
  }

  const gradientIdRef = useRef(`weatherTempLine-${Math.random().toString(36).slice(2, 9)}`);
  const fillGradientIdRef = useRef(`weatherTempFill-${Math.random().toString(36).slice(2, 9)}`);

  function hexToRgb(hex) {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function rgbToHex([r, g, b]) {
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  function mixHex(a, b, t) {
    const ra = hexToRgb(a);
    const rb = hexToRgb(b);
    const rm = [
      Math.round(ra[0] + (rb[0] - ra[0]) * t),
      Math.round(ra[1] + (rb[1] - ra[1]) * t),
      Math.round(ra[2] + (rb[2] - ra[2]) * t),
    ];
    return rgbToHex(rm);
  }

  function getTempColor(temp) {
    const green = '#10B981';
    const yellow = '#F59E0B';
    const red = '#EF4444';

    if (temp <= 27) return green;
    if (temp >= 40) return red;
    if (temp >= 32) {
      // smooth between yellow (32) and red (40)
      const t = Math.min(1, (temp - 32) / (40 - 32));
      return mixHex(yellow, red, t);
    }
    // smooth between green (27) and yellow (32)
    const t = (temp - 27) / (32 - 27);
    return mixHex(green, yellow, t);
  }

  const gradientStops = tempCoordinates.map((coord, idx) => {
    const offset = ((coord.x - padding.left) / (width - padding.left - padding.right)) * 100;
    const color = Number.isFinite(tempPoints[idx].value) ? getTempColor(tempPoints[idx].value) : '#1d4ed8';
    return { offset, color };
  });

  return (
    <div className="chartCanvas" ref={chartRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Hourly temperature and humidity forecast"
        onMouseLeave={clearHover}
      >
        <defs>
          <linearGradient id={fillGradientIdRef.current} gradientUnits="userSpaceOnUse" x1={padding.left} x2={width - padding.right} y1="0" y2="0">
            {gradientStops.map((s, i) => (
              <stop key={`fill-stop-${i}`} offset={`${s.offset}%`} stopColor={s.color} stopOpacity={0.24} />
            ))}
          </linearGradient>
          <linearGradient id={gradientIdRef.current} gradientUnits="userSpaceOnUse" x1={padding.left} x2={width - padding.right} y1="0" y2="0">
            {gradientStops.map((s, i) => (
              <stop key={`stop-${i}`} offset={`${s.offset}%`} stopColor={s.color} />
            ))}
          </linearGradient>
          <linearGradient id="weatherHumidityLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, index) => {
          const y = padding.top + (index / (yTicks.length - 1)) * (height - padding.top - padding.bottom);
          return (
            <g key={`temp-${tick}-${index}`}>
              <line className="chartGrid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chartTick" x={padding.left - 12} y={y + 4} textAnchor="end">
                {tick.toLocaleString('id-ID', { maximumFractionDigits: 1 })}°C
              </text>
            </g>
          );
        })}

        {humidityTicks.map((tick, index) => {
          const y = padding.top + (index / (humidityTicks.length - 1)) * (height - padding.top - padding.bottom);
          return (
            <text className="chartTick" x={width - padding.right + 12} y={y + 4} key={`humidity-${tick}-${index}`}>
              {tick}%
            </text>
          );
        })}

        {observedAreaPath ? (
          <path className="powerArea" d={observedAreaPath} style={{ fill: `url(#${fillGradientIdRef.current})`, opacity: 0.38 }} />
        ) : null}
        {forecastAreaPath ? (
          <path className="powerArea forecast" d={forecastAreaPath} style={{ fill: `url(#${fillGradientIdRef.current})`, opacity: 0.14 }} />
        ) : null}
        {observedCoordinates.length ? (
          <path className="powerLine" d={observedLinePath} style={{ stroke: `url(#${gradientIdRef.current})` }} />
        ) : null}
        {forecastCoordinates.length ? (
          <path className="powerLine forecast" d={forecastLinePath} style={{ stroke: `url(#${gradientIdRef.current})`, strokeDasharray: '6 4', opacity: 0.7 }} />
        ) : null}
        {observedHumidityCoordinates.length ? (
          <path className="powerLine" d={observedHumidityLinePath} style={{ stroke: 'url(#weatherHumidityLine)' }} />
        ) : null}
        {forecastHumidityCoordinates.length ? (
          <path className="powerLine forecast" d={forecastHumidityLinePath} style={{ stroke: 'url(#weatherHumidityLine)', strokeDasharray: '6 4', opacity: 0.7 }} />
        ) : null}

        {tempCoordinates.map((point, index) => {
          const isEstimated = !!tempPoints[index].estimated;
          const color = getTempColor(tempPoints[index].value);
          return (
            <circle
              className={`powerPoint ${isEstimated ? 'estimated' : 'observed'}`}
              cx={point.x}
              cy={point.y}
              key={`temp-${point.label}-${index}`}
              r={3.6}
              style={isEstimated ? { fill: '#ffffff', stroke: color, opacity: 0.8 } : { stroke: color }}
              onMouseMove={(event) => handleHover(event, index)}
              onMouseLeave={clearHover}
            >
              <title>{`${point.label}: ${point.value.toLocaleString('id-ID', { maximumFractionDigits: 1 })} °C${isEstimated ? ' (Forecast)' : ''}`}</title>
            </circle>
          );
        })}

        {humidityCoordinates.map((point, index) => (
          <circle
            className="powerPoint"
            cx={point.x}
            cy={point.y}
            key={`humidity-${point.label}-${index}`}
            r={3.6}
            style={{ fill: `url(#weatherHumidityLine)`, stroke: 'transparent' }}
            onMouseMove={(event) => handleHover(event, index)}
            onMouseLeave={clearHover}
          >
            <title>{`${point.label}: ${point.value.toLocaleString('id-ID')} % humidity`}</title>
          </circle>
        ))}

        {xLabels.map((point, index) => (
          <text className="chartTick chartTickX" x={point.x} y={height - 16} key={`${point.label}-${index}`} textAnchor="middle">
            {point.label}
          </text>
        ))}
      </svg>
      {hoveredPoint ? (
        <div
          className="chartTooltip"
          style={{ left: Math.min(Math.max(hoveredPoint.left, 80), 780), top: Math.max(hoveredPoint.top - 10, 28) }}
        >
          <strong>
            {hoveredPoint.label}
            {hoveredPoint.estimated ? ' · Forecast' : ''}
          </strong>
          <span>Temperature: <strong>{hoveredPoint.temp.toFixed(1)}°C</strong></span>
          <span>Humidity: <strong>{hoveredPoint.humidity}%</strong></span>
          <span>Wind: <strong>{hoveredPoint.wind.toFixed(1)} m/s</strong></span>
          <span>UV index: <strong>{hoveredPoint.uvIndex != null ? hoveredPoint.uvIndex : '-'}</strong></span>
          <span>Rain chance: <strong>{hoveredPoint.rainChance}%</strong></span>
        </div>
      ) : null}
      <div className="chartLegend">
        {(() => {
          const avgTemp = tempValues.length ? tempValues.reduce((s, v) => s + v, 0) / tempValues.length : tempValues[0] || 0;
          const tempColor = getTempColor(avgTemp);
          return (
            <span>
              <i style={{ background: 'transparent', border: `2px solid ${tempColor}` }} />
              Temperature
            </span>
          );
        })()}
        <span>
          <i style={{ background: '#1d4ed8' }} />
          Humidity
        </span>
        <span>
          <i style={{ width: 26, height: 0, display: 'inline-block', borderBottom: '2px dashed #334155', marginRight: 6 }} />
          Forecast
        </span>
      </div>
    </div>
  );
}

function SummaryPage() {
  const { model, loading, error, reload } = useSummaryMetrics();
  const [activeCategory, setActiveCategory] = useState('electricity');
  const [overviewHeight, setOverviewHeight] = useState(null);
  const overviewPanelRef = useRef(null);
  const kpis = model?.kpis || Object.entries(summaryCategories).map(([category, config]) => ({
    category,
    ...config,
    value: null,
    coverage: 'Waiting for data',
  }));
  const activeAttention = model?.attention || [];

  useEffect(() => {
    const panel = overviewPanelRef.current;
    if (!panel) return undefined;

    function updateHeight() {
      setOverviewHeight(window.innerWidth > 1120 ? Math.ceil(panel.getBoundingClientRect().height) : null);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);
    window.addEventListener('resize', updateHeight);
    updateHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <>
      <section className="summaryPageHeader">
        <div>
          <h2>Monitoring Summary</h2>
          <p>
            {model?.collectedAt
              ? `Central metrics collected at ${formatSummaryTimestamp(model.collectedAt)}`
              : 'Consolidated status across locations and monitoring categories.'}
          </p>
        </div>
        <button className="textButton" type="button" onClick={reload} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Loading' : 'Refresh'}</span>
        </button>
      </section>

      {error ? <div className="notice">{error}</div> : null}

      <section className="summaryGrid" aria-label="Central monitoring metrics">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const label = kpi.category === 'co2'
            ? 'Average CO₂ Today'
            : kpi.category === 'vehicle'
              ? 'Total Vehicles Today'
              : `Total ${kpi.label} Today`;
          const value = kpi.value === null
            ? '-'
            : formatSummaryNumber(kpi.value, kpi.category === 'vehicle' ? 0 : 2);

          return (
            <Metric
              artwork={summaryArtwork[kpi.category]}
              icon={Icon}
              key={kpi.category}
              label={label}
              note={kpi.coverage}
              tone={kpi.tone}
              unit={kpi.primaryUnit}
              value={value}
            />
          );
        })}
      </section>

      <section className="summaryOverview">
        <div className="panel widePanel" ref={overviewPanelRef}>
          <div className="panelHeader">
            <div>
              <h2>Location Overview</h2>
              <p>Primary metrics from all available locations and categories.</p>
            </div>
          </div>

          <div className="tableWrap">
            <table className="summaryMatrix">
              <thead>
                <tr>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon green"><Activity size={15} /></span>
                      <span><strong>Status</strong><small>Health</small></span>
                    </span>
                  </th>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon neutral"><Factory size={15} /></span>
                      <span><strong>Location</strong><small>Monitoring site</small></span>
                    </span>
                  </th>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon blue"><Zap size={15} /></span>
                      <span><strong>Electricity</strong><small>kWh today</small></span>
                    </span>
                  </th>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon cyan"><Droplets size={15} /></span>
                      <span><strong>Water</strong><small>m³ today</small></span>
                    </span>
                  </th>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon green"><Cloud size={15} /></span>
                      <span><strong>CO₂</strong><small>Current ppm</small></span>
                    </span>
                  </th>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon orange"><Car size={15} /></span>
                      <span><strong>Vehicle</strong><small>Count today</small></span>
                    </span>
                  </th>
                  <th>
                    <span className="summaryFieldHeader">
                      <span className="summaryFieldIcon violet"><Clock3 size={15} /></span>
                      <span><strong>Last Update</strong><small>Latest source</small></span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(model?.sites || summaryExpectedSites).map((siteName) => (
                  <SummaryLocationRow
                    attention={activeAttention}
                    groups={model?.groups || []}
                    key={siteName}
                    siteName={siteName}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel attentionPanel" style={overviewHeight ? { height: `${overviewHeight}px` } : undefined}>
          <div className="panelHeader compact">
            <div>
              <h2>Needs Attention</h2>
              <p>{activeAttention.length ? `${activeAttention.length} checks require review` : 'No active issues detected'}</p>
            </div>
            <AlertTriangle size={20} />
          </div>

          <div className="attentionList">
            {activeAttention.length ? activeAttention.map((item, index) => {
              const AttentionIcon = getAttentionIcon(item);
              return (
              <div className={`attentionItem ${item.severity}`} key={`${item.siteName}-${item.title}-${index}`}>
                <span className={`attentionIcon ${item.category}`}>
                  <AttentionIcon size={17} />
                </span>
                <div>
                  <strong>{item.siteName}: {item.title}</strong>
                  <span>{getAlertCategoryLabel(item)} · {item.detail}</span>
                  <small>{getAttentionRecommendation(item)}</small>
                </div>
              </div>
              );
            }) : (
              <div className="attentionEmpty">
                <CheckCircle2 size={24} />
                <span>All available sources look healthy.</span>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="panel summaryDetailPanel">
        <div className="panelHeader summaryDetailHeader">
          <div>
            <h2>Category Detail</h2>
            <p>Compare operational metrics across locations.</p>
          </div>
          <div className="segmentedControl summaryTabs" aria-label="Summary category">
            {Object.entries(summaryCategories).map(([category, config]) => (
              <button
                className={activeCategory === category ? 'active' : ''}
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <SummaryCategoryDetail
          attention={activeAttention}
          category={activeCategory}
          groups={model?.groups || []}
        />
      </section>
    </>
  );
}

function SummaryLocationRow({ attention, groups, siteName }) {
  const siteGroups = groups.filter((group) => group.siteName === siteName);
  const siteAttention = attention.filter((item) => item.siteName === siteName);
  const severity = siteAttention.some((item) => item.severity === 'danger')
    ? 'danger'
    : siteAttention.length
      ? 'warning'
      : siteGroups.length
        ? 'normal'
        : 'neutral';
  const latestGroup = siteGroups
    .filter((group) => getSummaryMetric(group, 'raw_last_update'))
    .sort((left, right) => {
      const leftDate = parseSummaryTimestamp(getSummaryMetric(left, 'raw_last_update'))?.getTime() || 0;
      const rightDate = parseSummaryTimestamp(getSummaryMetric(right, 'raw_last_update'))?.getTime() || 0;
      return rightDate - leftDate;
    })[0];
  const latestRawUpdate = getSummaryMetric(latestGroup, 'raw_last_update');
  const latestDataStatus = String(getSummaryMetric(latestGroup, 'data_status') || (latestGroup ? 'available' : 'no data'));
  const latestDataStatusClass = latestDataStatus.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <tr>
      <td><span className={`statusPill ${severity}`}>{severity === 'normal' ? 'Normal' : severity === 'neutral' ? 'No data' : 'Review'}</span></td>
      <td><strong>{siteName}</strong></td>
      {Object.keys(summaryCategories).map((category) => (
        <td key={category}>
          <SummaryMatrixValue category={category} group={getSummaryGroup(groups, siteName, category)} />
        </td>
      ))}
      <td className="summaryUpdate">
        <div className="summaryUpdateValue">
          <strong>{formatSummaryTimestamp(latestRawUpdate)}</strong>
          <span className={`summaryDataStatus ${latestDataStatusClass}`}>{latestDataStatus}</span>
        </div>
      </td>
    </tr>
  );
}

function SummaryMatrixValue({ category, group }) {
  const config = summaryCategories[category];
  const value = getSummaryNumericMetric(group, config.primaryKey);

  if (!group || value === null) return <span className="summaryMissing">—</span>;

  const trendPercent = getSummaryNumericMetric(group, category === 'vehicle' ? 'delta_percent' : 'trend_percent');
  const trendDirection = trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'stable';
  const showTrend = trendPercent !== null;

  return (
    <div className="summaryMatrixValue">
      <strong>
        {formatSummaryPrimaryValue(category, value)}
        {config.primaryUnit ? <small>{config.primaryUnit}</small> : null}
      </strong>
      {showTrend ? (
        <span className={`summaryTrend ${trendDirection}`}>
          {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→'} {formatSummaryNumber(Math.abs(trendPercent), 1)}%
        </span>
      ) : null}
    </div>
  );
}

function SummaryCategoryDetail({ attention, category, groups }) {
  const detailFields = {
    electricity: [
      { key: 'energy_today_kwh', label: 'Energy Today', unit: 'kWh', icon: Zap, tone: 'blue' },
      { key: 'current_power_kw', label: 'Current Power', unit: 'kW', icon: Activity, tone: 'orange' },
      { key: 'max_power_today_kw', label: 'Peak Power', unit: 'kW', icon: Gauge, tone: 'violet' },
      { key: 'today_volt_compliance_percent', label: 'Voltage Compliance', unit: '%', icon: CheckCircle2, tone: 'green', signal: 'compliance' },
      { key: 'max_current_unbalance_today_percent', label: 'Current Unbalance', unit: '%', icon: AlertTriangle, tone: 'red', signal: 'unbalance' },
    ],
    water: [
      { key: 'current_today_vol_m3', label: 'Volume Today', unit: 'm³', icon: Droplets, tone: 'blue' },
      { key: 'max_flow_today_m3h', label: 'Peak Flow', unit: 'm³/h', icon: Gauge, tone: 'violet' },
      { key: 'max_flow_time', label: 'Peak Time', type: 'text', icon: Clock3, tone: 'orange' },
      { key: 'last_flow_m3h', label: 'Latest Flow', unit: 'm³/h', icon: Wind, tone: 'cyan' },
      { key: 'trend_percent', label: 'Trend', unit: '%', icon: Activity, tone: 'green', signal: 'trend' },
    ],
    co2: [
      { key: 'current_avg_co2_ppm', label: 'Current CO₂', unit: 'ppm', icon: Cloud, tone: 'cyan' },
      { key: 'co2_status', label: 'Condition', type: 'text', icon: CheckCircle2, tone: 'green', signal: 'condition' },
      { key: 'avg_co2_today_ppm', label: 'Average Today', unit: 'ppm', icon: Activity, tone: 'blue' },
      { key: 'max_co2_today_ppm', label: 'Maximum Today', unit: 'ppm', icon: Gauge, tone: 'orange' },
      { key: 'today_co2_compliance_percent', label: 'Compliance', unit: '%', icon: CheckCircle2, tone: 'green', signal: 'compliance' },
    ],
    vehicle: [
      { key: 'today_vehicle_count', label: 'Vehicles Today', unit: '', icon: Car, tone: 'blue' },
      { key: 'yesterday_vehicle_count', label: 'Yesterday', unit: '', icon: CalendarDays, tone: 'violet' },
      { key: 'delta_percent', label: 'Change', unit: '%', icon: Activity, tone: 'green', signal: 'trend' },
      { key: 'peak_car_per_min', label: 'Peak Cars/min', unit: '', icon: Gauge, tone: 'orange' },
      { key: 'peak_motorcycle_per_min', label: 'Peak Motorcycles/min', unit: '', icon: Gauge, tone: 'cyan' },
    ],
  };
  const fields = detailFields[category];
  const categoryGroups = groups
    .filter((group) => group.category === category)
    .sort((left, right) => {
      const leftIndex = summaryExpectedSites.indexOf(left.siteName);
      const rightIndex = summaryExpectedSites.indexOf(right.siteName);
      return (leftIndex < 0 ? 999 : leftIndex) - (rightIndex < 0 ? 999 : rightIndex) || left.siteName.localeCompare(right.siteName);
    });
  const insightGroups = categoryGroups.filter((group) => getSummaryMetric(group, 'summary_text'));
  const firstInsightSite = insightGroups[0]?.siteName || '';
  const [openInsight, setOpenInsight] = useState(firstInsightSite);

  useEffect(() => {
    setOpenInsight(firstInsightSite);
  }, [category, firstInsightSite]);

  if (!categoryGroups.length) {
    return <div className="chartState">No {summaryCategories[category].label.toLowerCase()} metrics are available.</div>;
  }

  return (
    <>
      <div className={`tableWrap summaryDetailTableWrap ${category}`}>
        <table className="summaryDetailTable">
          <thead>
            <tr>
              <th>
                <span className="summaryFieldHeader">
                  <span className="summaryFieldIcon neutral"><Factory size={15} /></span>
                  <span><strong>Location</strong><small>Monitoring site</small></span>
                </span>
              </th>
              {fields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <th key={field.key}>
                    <span className="summaryFieldHeader">
                      <span className={`summaryFieldIcon ${field.tone}`}><FieldIcon size={15} /></span>
                      <span><strong>{field.label}</strong><small>{getSummaryFieldSubtitle(field)}</small></span>
                    </span>
                  </th>
                );
              })}
              <th>
                <span className="summaryFieldHeader">
                  <span className="summaryFieldIcon neutral"><Clock3 size={15} /></span>
                  <span><strong>Last Update</strong><small>Local time</small></span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {categoryGroups.map((group) => {
              const status = String(getSummaryMetric(group, 'data_status') || '').toLowerCase();
              const hasPrimaryValue = getSummaryNumericMetric(group, summaryCategories[category].primaryKey) !== null;
              const timestamp = formatSummaryTimestampParts(getSummaryMetric(group, 'raw_last_update'));
              const isDelayed = status.includes('delayed');
              const locationStatusLabel = isDelayed
                ? 'Delayed'
                : status === 'current'
                ? 'Normal'
                : status || (hasPrimaryValue ? 'Available' : 'No data');

              return (
                <tr key={`${group.siteName}-${group.category}`}>
                  <td>
                    <span className="summaryLocationCell">
                      <span className={`summaryLocationMark ${status === 'current' && !isDelayed ? 'current' : 'review'}`} />
                      <span><strong>{group.siteName}</strong><small>{locationStatusLabel}</small></span>
                    </span>
                  </td>
                  {fields.map((field) => {
                    const rawValue = getSummaryMetric(group, field.key);
                    const numericValue = getSummaryNumericMetric(group, field.key);
                    const signal = getSummaryFieldSignal(field, rawValue, numericValue);

                    return (
                      <td key={field.key}>
                        <span className={`summaryMetricCell ${signal}`}>
                          <strong>{field.type === 'text' ? (rawValue || '-') : formatSummaryNumber(rawValue, field.unit === '' ? 0 : 2)}</strong>
                          {field.type !== 'text' && field.unit && numericValue !== null ? <small>{field.unit}</small> : null}
                          {field.signal && numericValue !== null ? <i aria-hidden="true" /> : null}
                        </span>
                      </td>
                    );
                  })}
                  <td>
                    <span className="summaryTimestampCell">
                      <strong>{timestamp.date}</strong>
                      <small>{timestamp.time}</small>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {insightGroups.length ? (
        <section className="automaticInsights" aria-label={`${summaryCategories[category].label} automatic insights`}>
          <div className="automaticInsightsHeader">
            <div>
              <h3>Automatic Insights</h3>
              <p>Procedurally generated insights from the latest collected metrics.</p>
            </div>
          </div>

          <div className="automaticSummaryList">
            {insightGroups.map((group) => {
              const isOpen = openInsight === group.siteName;
              const insightAttention = attention.filter(
                (item) => item.siteName === group.siteName && item.category === category,
              );
              const attentionCount = insightAttention.length;
              const sections = buildInsightSections(category, getSummaryMetric(group, 'summary_text'));

              return (
                <article className={`automaticInsightItem ${isOpen ? 'open' : ''}`} key={`${group.siteName}-summary`}>
                  <button
                    className="automaticInsightToggle"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenInsight(isOpen ? '' : group.siteName)}
                  >
                    <span className="automaticInsightTitle">
                      <strong>{group.siteName}</strong>
                      <span className={`insightStatus ${attentionCount ? 'review' : 'current'}`}>
                        {attentionCount} Need Attention
                      </span>
                    </span>
                    <span className="automaticInsightMeta">
                      <ChevronDown className="automaticInsightChevron" size={18} />
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="automaticInsightBody">
                      {sections.map((section) => (
                        <div className="automaticInsightSection" key={section.label}>
                          <span>{section.label}</span>
                          <p>{section.text}</p>
                        </div>
                      ))}
                      {insightAttention.length ? (
                        <div className="automaticAttentionSection">
                          <span>Need Attention</span>
                          <div className="automaticAttentionList">
                            {insightAttention.map((item, index) => (
                              <div className={`automaticAttentionItem ${item.severity}`} key={`${item.title}-${index}`}>
                                <strong>{item.title}</strong>
                                <p>{item.detail}</p>
                                <small>{getAttentionRecommendation(item)}</small>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="automaticInsightPreview">{sections[0]?.text}</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}

function buildInsightSections(category, summaryText) {
  const sentences = String(summaryText || '')
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const categoryRules = {
    electricity: [
      { label: 'Consumption', pattern: /energy consumption|yesterday|recording-time/i },
      { label: 'Power', pattern: /active power/i },
      { label: 'Power quality', pattern: /voltage|phase current|phase load|unbalance/i },
      { label: 'Data freshness', pattern: /data status|latest raw|not available|not been updated/i },
    ],
    water: [
      { label: 'Consumption', pattern: /volume|consumption|yesterday|trend/i },
      { label: 'Flow', pattern: /flow|peak/i },
      { label: 'Data freshness', pattern: /data status|latest raw|not available|not been updated/i },
    ],
    co2: [
      { label: 'Air quality', pattern: /co2|carbon dioxide|ppm|condition/i },
      { label: 'Compliance', pattern: /compliance|threshold|maximum/i },
      { label: 'Data freshness', pattern: /data status|latest raw|not available|not been updated/i },
    ],
    vehicle: [
      { label: 'Traffic volume', pattern: /vehicle|traffic|today|yesterday|change/i },
      { label: 'Peak activity', pattern: /peak|car|motorcycle|truck/i },
      { label: 'Data freshness', pattern: /data status|latest raw|not available|not been updated/i },
    ],
  };
  const rules = categoryRules[category] || [{ label: 'Overview', pattern: /.*/ }];
  const buckets = rules.map((rule) => ({ ...rule, sentences: [] }));

  sentences.forEach((sentence) => {
    const target = buckets.find((bucket) => bucket.pattern.test(sentence)) || buckets[0];
    target.sentences.push(sentence);
  });

  return buckets
    .filter((bucket) => bucket.sentences.length)
    .map((bucket) => ({ label: bucket.label, text: bucket.sentences.join(' ') }));
}

function ElectricityPage() {
  const { rows, loading, error, lastSync, reload } = useElectricityRows();
  const { model: summaryModel, loading: summaryLoading } = useSummaryMetrics();
  const [chartLocation, setChartLocation] = useState(0);
  const [chartScale, setChartScale] = useState('daily');
  const [powerLocation, setPowerLocation] = useState(0);
  const electricityGroups = summaryModel?.groups.filter((group) => group.category === 'electricity') || [];
  const highestEnergy = getSummaryExtreme(electricityGroups, 'energy_today_kwh');
  const highestPower = getSummaryExtreme(electricityGroups, 'max_power_today_kw');
  const worstCompliance = getSummaryExtreme(electricityGroups, 'today_volt_compliance_percent', 'min');
  const worstUnbalance = getSummaryExtreme(electricityGroups, 'max_current_unbalance_today_percent');
  const formatExtremeValue = (extreme, digits = 2) => (
    summaryLoading ? '...' : extreme ? formatSummaryNumber(extreme.value, digits) : '-'
  );
  const formatExtremeLocation = (extreme) => (
    summaryLoading ? 'Loading locations' : extreme?.siteName ? `at ${extreme.siteName}` : 'No valid data'
  );

  return (
    <>
      <section className="summaryGrid electricitySummaryGrid" aria-label="Electricity summary">
        <Metric
          icon={Factory}
          label="Monitored Locations"
          note="Electricity data sources"
          tone="green"
          value={electricityDataSources.length}
        />
        <Metric
          icon={Zap}
          label="Highest Energy Today"
          note={formatExtremeLocation(highestEnergy)}
          tone="blue"
          unit="kWh"
          value={formatExtremeValue(highestEnergy)}
        />
        <Metric
          icon={Gauge}
          label="Highest Peak Power"
          note={formatExtremeLocation(highestPower)}
          tone="amber"
          unit="kW"
          value={formatExtremeValue(highestPower)}
        />
        <Metric
          icon={AlertTriangle}
          label="Worst Voltage Compliance"
          note={formatExtremeLocation(worstCompliance)}
          tone="red"
          unit="%"
          value={formatExtremeValue(worstCompliance, 1)}
        />
        <Metric
          icon={Activity}
          label="Worst Current Unbalance"
          note={formatExtremeLocation(worstUnbalance)}
          tone="red"
          unit="%"
          value={formatExtremeValue(worstUnbalance, 1)}
        />
      </section>

      <section className="chartGridPanel" aria-label="Power and energy charts">
        <DailyActivePowerPanel locationIndex={powerLocation} onLocationChange={setPowerLocation} />

        <EnergyHistoryPanel
          locationIndex={chartLocation}
          scale={chartScale}
          onLocationChange={setChartLocation}
          onScaleChange={setChartScale}
        />
      </section>

      <section className="panel widePanel">
        <div className="panelHeader">
          <div>
            <h2>Full Parameter Readings</h2>
            <p>{lastSync ? `Location data synced at ${lastSync}` : 'Parameter values across monitoring locations.'}</p>
          </div>
          <div className="tableHeaderTools">
            <div className="tableLegend" aria-label="Electricity status color legend">
              <span><i className="normal" />Normal</span>
              <span><i className="warning" />Warning</span>
            </div>
            <button className="textButton" type="button" onClick={reload} disabled={loading}>
              <RefreshCw size={17} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Loading' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {error ? <div className="notice">{error}</div> : null}

        <div className="tableWrap">
          <table className="electricityTable">
            <thead>
              <tr>
                <th>No.</th>
                <th>Parameter</th>
                {electricityLocations.map((location) => (
                  <th key={location}>{location}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.parameter}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{row.parameter}</strong>
                  </td>
                  {row.values.map((value, valueIndex) => (
                    <td key={`${row.parameter}-${electricityLocations[valueIndex]}`}>
                      <ElectricityValue parameter={row.parameter} value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </>
  );
}

function ElectricityValue({ parameter, value }) {
  if (!String(value || '').trim()) {
    return <span className="valueBadge washout" aria-label="Data is not available" />;
  }

  const timestamp = parameter === 'Last seen' ? splitTimestampValue(value) : null;

  if (timestamp) {
    return (
      <span className="valueBadge neutral timestampBadge" title={String(value)}>
        <span className="timestampDate">{timestamp.date}</span>
        <span className="timestampTime">{timestamp.time}</span>
      </span>
    );
  }

  return <span className={`valueBadge ${getElectricityCondition(parameter, value)}`}>{value}</span>;
}

function WaterPage() {
  const { rows, loading, error, lastSync, reload } = useWaterRows();
  const { model: summaryModel, loading: summaryLoading } = useSummaryMetrics();
  const [flowLocation, setFlowLocation] = useState(0);
  const [totalizerLocation, setTotalizerLocation] = useState(0);
  const [totalizerScale, setTotalizerScale] = useState('daily');
  const waterGroups = summaryModel?.groups.filter((group) => group.category === 'water') || [];
  const waterVolumes = waterGroups
    .map((group) => getSummaryNumericMetric(group, 'current_today_vol_m3'))
    .filter((value) => value !== null);
  const totalVolumeToday = waterVolumes.reduce((total, value) => total + value, 0);
  const maxVolumeToday = getSummaryExtreme(waterGroups, 'current_today_vol_m3');
  const waterLocationCount = new Set(waterGroups.map((group) => group.siteName)).size;

  return (
    <>
      <section className="summaryGrid waterSummaryGrid" aria-label="Water summary">
        <Metric
          icon={Factory}
          label="Monitored Locations"
          note="Water data sources"
          tone="green"
          value={summaryLoading ? '...' : waterLocationCount}
        />
        <Metric
          icon={Droplets}
          label="Total Volume Today"
          note="Across all available locations"
          tone="blue"
          unit="m³"
          value={summaryLoading ? '...' : formatSummaryNumber(totalVolumeToday)}
        />
        <Metric
          icon={Gauge}
          label="Highest Volume Today"
          note={summaryLoading ? 'Loading locations' : maxVolumeToday ? `at ${maxVolumeToday.siteName}` : 'No valid data'}
          tone="amber"
          unit="m³"
          value={summaryLoading ? '...' : maxVolumeToday ? formatSummaryNumber(maxVolumeToday.value) : '-'}
        />
      </section>

      <section className="chartGridPanel" aria-label="Flow and water usage charts">
        <WaterDailyFlowPanel locationIndex={flowLocation} onLocationChange={setFlowLocation} />
        <WaterTotalizerHistoryPanel
          locationIndex={totalizerLocation}
          scale={totalizerScale}
          onLocationChange={setTotalizerLocation}
          onScaleChange={setTotalizerScale}
        />
      </section>

      <section className="panel widePanel">
        <div className="panelHeader">
          <div>
            <h2>Full Parameter Readings</h2>
            <p>{lastSync ? `Water data synced at ${lastSync}` : 'Water parameter values across monitoring locations.'}</p>
          </div>
          <button className="textButton" type="button" onClick={reload} disabled={loading}>
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Loading' : 'Refresh'}</span>
          </button>
        </div>

        {error ? <div className="notice">{error}</div> : null}

        <div className="tableWrap">
          <table className="electricityTable waterTable">
            <thead>
              <tr>
                <th>No.</th>
                <th>Parameter</th>
                {waterLocations.map((location) => (
                  <th key={location}>{location}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.parameter}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{row.parameter}</strong>
                  </td>
                  {row.values.map((value, valueIndex) => (
                    <td key={`${row.parameter}-${waterLocations[valueIndex]}`}>
                      <WaterValue parameter={row.parameter} value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </>
  );
}

function WaterValue({ parameter, value }) {
  if (!String(value || '').trim()) {
    return <span className="valueBadge washout" aria-label={`${parameter} is not available`} />;
  }

  const timestamp = parameter === 'Last seen' ? splitTimestampValue(value) : null;

  if (timestamp) {
    return (
      <span className="valueBadge neutral timestampBadge" title={String(value)}>
        <span className="timestampDate">{timestamp.date}</span>
        <span className="timestampTime">{timestamp.time}</span>
      </span>
    );
  }

  return <span className="valueBadge neutral">{value}</span>;
}

function WaterDailyFlowPanel({ locationIndex, onLocationChange }) {
  const { points, loading, error } = useWaterDailyFlow(locationIndex);
  const selectedLocation = waterLocations[locationIndex];

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Max Flow (m3/h)</h2>
          <p>{selectedLocation} - Today Max Flow</p>
        </div>
        <div className="chartControls">
          <select value={locationIndex} onChange={(event) => onLocationChange(Number(event.target.value))} aria-label="Select flow chart location">
            {waterLocations.map((location, index) => (
              <option key={location} value={index}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <ActivePowerLineChart
          ariaLabel="Hourly max flow chart in m3 per hour"
          emptyMessage="No flow data is available for this location."
          fillGradientId="waterFlowFill"
          fillStops={[
            { offset: '0%', color: '#1f6feb', opacity: 0.28 },
            { offset: '72%', color: '#38bdf8', opacity: 0.12 },
            { offset: '100%', color: '#38bdf8', opacity: 0 },
          ]}
          lineGradientId="waterFlowLine"
          lineStops={[
            { offset: '0%', color: '#1d4ed8' },
            { offset: '100%', color: '#38bdf8' },
          ]}
          pointColor="#1f6feb"
          points={points}
          unit="m3/h"
        />
      )}
    </section>
  );
}

function WaterTotalizerHistoryPanel({ locationIndex, scale, onLocationChange, onScaleChange }) {
  const { points, loading, error } = useWaterTotalizerHistory(locationIndex, scale);
  const selectedLocation = waterLocations[locationIndex];

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Volume (m3)</h2>
          <p>{selectedLocation} - {energyHistoryScales[scale].label}</p>
        </div>
        <div className="chartControls">
          <select value={locationIndex} onChange={(event) => onLocationChange(Number(event.target.value))} aria-label="Select totalizer chart location">
            {waterLocations.map((location, index) => (
              <option key={location} value={index}>{location}</option>
            ))}
          </select>
          <div className="segmentedControl" aria-label="Select totalizer time scale">
            {Object.entries(energyHistoryScales).map(([scaleId, config]) => (
              <button
                className={scale === scaleId ? 'active' : ''}
                key={scaleId}
                type="button"
                onClick={() => onScaleChange(scaleId)}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <EnergyBarChart
          ariaLabel="Historical totalizer chart in cubic meters"
          emptyMessage="No totalizer data is available for this selection."
          points={points}
          scale={scale}
          unit="m3"
        />
      )}
    </section>
  );
}

function Co2Page() {
  const { rows, loading, error, lastSync, reload } = useCo2Rows();
  const { data: globalCo2, loading: globalCo2Loading, error: globalCo2Error } = useGlobalCo2();
  const [co2Scale, setCo2Scale] = useState('daily');
  const co2Values = (rows.find((row) => row.parameter === 'CO₂ (ppm)')?.values || [])
    .map((value, index) => ({
      location: co2Locations[index]?.label,
      value: parseMeasurement(value),
    }))
    .filter((item) => item.location && item.value !== null);
  const co2Average = co2Values.length
    ? co2Values.reduce((total, item) => total + item.value, 0) / co2Values.length
    : null;
  const co2Maximum = co2Values.length
    ? co2Values.reduce((selected, item) => (item.value > selected.value ? item : selected))
    : null;
  const co2Minimum = co2Values.length
    ? co2Values.reduce((selected, item) => (item.value < selected.value ? item : selected))
    : null;
  const co2AverageValue = co2Average !== null ? co2Average.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : '-';
  const globalCo2Value = globalCo2Loading
    ? 'Loading'
    : globalCo2
      ? globalCo2.value.toLocaleString('id-ID', { maximumFractionDigits: 1 })
      : '-';

  return (
    <>
      <section className="summaryGrid co2SummaryGrid" aria-label="Carbon dioxide summary">
        <Metric icon={Factory} label="Monitored Locations" note="CO₂ sensor locations" value={co2Locations.length} tone="green" />
        <Metric icon={Cloud} label="Average CO₂ Today" value={co2AverageValue} unit="ppm" tone="blue" />
        <Metric
          icon={Globe2}
          label="Global CO₂"
          note={globalCo2?.dateLabel ? `NOAA GML, ${globalCo2.dateLabel}` : 'NOAA GML'}
          value={globalCo2Value}
          unit="ppm"
          tone={globalCo2Error ? 'red' : 'blue'}
        />
        <Metric
          icon={Gauge}
          label="Maximum CO₂"
          note={co2Maximum ? `at ${co2Maximum.location}` : 'No valid data'}
          value={co2Maximum ? co2Maximum.value.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : '-'}
          unit="ppm"
          tone="red"
        />
        <Metric
          icon={Activity}
          label="Minimum CO₂"
          note={co2Minimum ? `at ${co2Minimum.location}` : 'No valid data'}
          value={co2Minimum ? co2Minimum.value.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : '-'}
          unit="ppm"
          tone="green"
        />
      </section>

      <section className="chartGridPanel" aria-label="Temperature and CO₂ charts">
        <Co2TemperaturePanel />
        <Co2HistoryPanel scale={co2Scale} onScaleChange={setCo2Scale} />
      </section>

      <section className="panel widePanel">
        <div className="panelHeader">
          <div>
            <h2>Full Parameter Readings</h2>
            <p>{lastSync ? `CO₂ data synced ${lastSync}` : 'Humidity, temperature, and CO₂ values across monitoring locations.'}</p>
          </div>
          <button className="textButton" type="button" onClick={reload} disabled={loading}>
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Loading' : 'Refresh'}</span>
          </button>
        </div>

        {error ? <div className="notice">{error}</div> : null}

        <div className="tableWrap">
          <table className="electricityTable co2Table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Parameter</th>
                {co2Locations.map((location) => (
                  <th key={location.label}>{location.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.parameter}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{row.parameter}</strong>
                  </td>
                  {row.values.map((value, valueIndex) => (
                    <td key={`${row.parameter}-${co2Locations[valueIndex].label}`}>
                      <Co2Value parameter={row.parameter} value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </>
  );
}

function Co2Value({ parameter, value }) {
  if (parameter === 'Sensor Location') {
    if (!value?.lat || !value?.lon) {
      return <span className="valueBadge washout" aria-label="Sensor location is not available" />;
    }

    return (
      <a
        className="valueBadge neutral sensorLink"
        href={`https://www.google.com/maps?q=${value.lat},${value.lon}`}
        rel="noreferrer"
        target="_blank"
      >
        Google Map
      </a>
    );
  }

  if (!String(value || '').trim()) {
    return <span className="valueBadge washout" aria-label={`${parameter} is not available`} />;
  }

  const timestamp = parameter === 'Last seen' ? splitTimestampValue(value) : null;

  if (timestamp) {
    return (
      <span className="valueBadge neutral timestampBadge" title={String(value)}>
        <span className="timestampDate">{timestamp.date}</span>
        <span className="timestampTime">{timestamp.time}</span>
      </span>
    );
  }

  return <span className="valueBadge neutral">{value}</span>;
}

function CarbonFootprintPage() {
  const [electricityScale, setElectricityScale] = useState('daily');
  const [vehicleScale, setVehicleScale] = useState('daily');
  const { series: hourlyElectricitySeries } = useCarbonElectricitySeries('hourly');
  const { series: hourlyVehicleSeries } = useCarbonVehicleSeries('hourly');
  const { series: monthlyElectricitySeries } = useCarbonElectricitySeries('monthly');
  const { series: monthlyVehicleSeries } = useCarbonVehicleSeries('monthly');
  const electricityDailyValue = getSeriesTotalValue(hourlyElectricitySeries, 'electricity');
  const carsTrucksDailyValue = getSeriesTotalValue(hourlyVehicleSeries, 'carsTrucks');
  const motorcyclesDailyValue = getSeriesTotalValue(hourlyVehicleSeries, 'motorcycles');
  const totalDailyValue = electricityDailyValue + carsTrucksDailyValue + motorcyclesDailyValue;
  const monthlyTotalValue =
    getSeriesTotalValue(monthlyElectricitySeries, 'electricity')
    + getSeriesTotalValue(monthlyVehicleSeries, 'carsTrucks')
    + getSeriesTotalValue(monthlyVehicleSeries, 'motorcycles');
  const avoidedCards = [
    {
      artwork: asset('/carbon/equivalencies/waste-recycled.png'),
      icon: Recycle,
      label: 'tons of waste recycled instead of landfilled',
      value: monthlyTotalValue / epaEquivalencyFactors.wasteRecycledTon,
    },
    {
      artwork: asset('/carbon/equivalencies/trash-bags.png'),
      icon: Trash2,
      label: 'trash bags of waste recycled instead of landfilled',
      value: monthlyTotalValue / epaEquivalencyFactors.trashBagTon,
    },
    {
      artwork: asset('/carbon/equivalencies/garbage-truck.png'),
      icon: Trash2,
      label: 'garbage trucks of waste recycled instead of landfilled',
      value: monthlyTotalValue / epaEquivalencyFactors.garbageTruckTon,
    },
    {
      artwork: asset('/carbon/equivalencies/wind-turbine.png'),
      icon: Wind,
      label: 'wind turbines running for a year',
      value: monthlyTotalValue / epaEquivalencyFactors.windTurbineTonPerYear,
    },
  ];
  const sequesteredCards = [
    {
      artwork: asset('/carbon/equivalencies/tree-seedlings.png'),
      icon: Sprout,
      label: 'tree seedlings grown for 10 years',
      value: monthlyTotalValue / epaEquivalencyFactors.treeSeedlingTenYearsTon,
    },
    {
      artwork: asset('/carbon/equivalencies/forest-acre.png'),
      icon: Trees,
      label: 'acres of U.S. forests in one year',
      value: monthlyTotalValue / epaEquivalencyFactors.acresForestTonPerYear,
    },
  ];

  return (
    <>
      <section className="chartGridPanel" aria-label="Carbon footprint charts">
        <CarbonElectricityPanel scale={electricityScale} onScaleChange={setElectricityScale} />
        <CarbonVehiclePanel scale={vehicleScale} onScaleChange={setVehicleScale} />
      </section>

      <section className="summaryGrid carbonSummaryGrid" aria-label="Carbon footprint summary">
        <Metric
          icon={Leaf}
          label="Daily Cumulative"
          value={formatCarbonValue(totalDailyValue)}
          tone="blue"
          artwork={asset('/carbon/daily-cumulative.png')}
        />
        <Metric
          icon={Zap}
          label="CO₂ from Electricity"
          value={formatCarbonValue(electricityDailyValue)}
          tone="amber"
          artwork={asset('/carbon/electricity.png')}
        />
        <Metric
          icon={Car}
          label="CO₂ from Cars+Trucks"
          value={formatCarbonValue(carsTrucksDailyValue)}
          tone="red"
          artwork={asset('/carbon/cars-trucks.png')}
        />
        <Metric
          icon={Car}
          label="CO₂ from Motorcycles"
          value={formatCarbonValue(motorcyclesDailyValue)}
          tone="green"
          artwork={asset('/carbon/motorcycle.png')}
        />
      </section>

      <section className="panel referencePanel">
        <h2>Daily Cumulative Reference</h2>
        <p>Electricity uses CO₂ Emission Factor = 0.29 ton CO₂/MWh (Bitumenous Coal Power Plant)</p>
        <p>Gasoline passenger car uses CO₂ Emission Factor = 0.1842 kgCO₂/km, 1:12 Fuel Consumption Ratio</p>
        <p>Motorcycle uses CO₂ Emission Factor = 0.0555 kgCO₂/km, 1:40 Fuel Consumption Ratio</p>
        <strong>Source: IPCC - Emission Factor Database (2023)</strong>
      </section>

      <CarbonEquivalencySection
        cards={avoidedCards}
        title="The Total CO₂ Emission is equivalent to emission avoided by:"
      />

      <CarbonEquivalencySection
        cards={sequesteredCards}
        title="The Total CO₂ Emission is equivalent to carbon sequestered by:"
      />
    </>
  );
}

function getSeriesTotalValue(series, id) {
  const points = series.find((item) => item.id === id)?.points || [];
  return points.reduce((total, point) => total + point.value, 0);
}

function formatCarbonValue(value) {
  return `${value.toLocaleString('id-ID', { maximumFractionDigits: 3 })} ton CO₂`;
}

function CarbonElectricityPanel({ scale, onScaleChange }) {
  const { series, loading, error } = useCarbonElectricitySeries(scale);

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Electricity Carbon Footprint</h2>
          <p>{energyHistoryScales[scale].label} ton CO₂ from Energy</p>
        </div>
        <CarbonScaleControl scale={scale} scales={energyHistoryScales} onScaleChange={onScaleChange} label="electricity carbon" />
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <MultiSeriesAreaChart
          ariaLabel="Electricity carbon chart in tons of CO₂"
          emptyMessage="No electricity carbon data is available for this selection."
          series={series}
          unit="ton CO₂"
        />
      )}
    </section>
  );
}

function CarbonVehiclePanel({ scale, onScaleChange }) {
  const { series, loading, error } = useCarbonVehicleSeries(scale);

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Vehicle Carbon Footprint</h2>
          <p>{vehicleCounterScales[scale].label} ton CO₂ from vehicles</p>
        </div>
        <CarbonScaleControl scale={scale} scales={vehicleCounterScales} onScaleChange={onScaleChange} label="vehicle carbon" />
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <MultiSeriesAreaChart
          ariaLabel="Vehicle carbon chart in tons of CO₂"
          emptyMessage="No vehicle carbon data is available for this selection."
          series={series.filter((item) => item.id !== 'vehicle')}
          unit="ton CO₂"
        />
      )}
    </section>
  );
}

function CarbonScaleControl({ label, onScaleChange, scale, scales }) {
  return (
    <div className="chartControls">
      <div className="segmentedControl" aria-label={`Select ${label} time scale`}>
        {Object.entries(scales).map(([scaleId, config]) => (
          <button
            className={scale === scaleId ? 'active' : ''}
            key={scaleId}
            type="button"
            onClick={() => onScaleChange(scaleId)}
          >
            {config.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CarbonEquivalencySection({ cards, title }) {
  return (
    <section className="panel equivalencyPanel">
      <div className="panelHeader">
        <div>
          <h2>{title}</h2>
          <p>Based on EPA Greenhouse Gas Equivalencies Calculator factors.</p>
        </div>
      </div>

      <div className="equivalencyGrid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div className="equivalencyCard" key={card.label}>
              <Icon size={22} />
              <strong>{card.value.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</strong>
              <span>{card.label}</span>
              <img className="equivalencyArtwork" src={card.artwork} alt="" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VehicleCounterPage() {
  const { rows, loading, error, lastSync, reload } = useVehicleRows();
  const { model: summaryModel, loading: summaryLoading } = useSummaryMetrics();
  const [totalScale, setTotalScale] = useState('daily');
  const [rateScale, setRateScale] = useState('daily');
  const vehicleGroups = summaryModel?.groups.filter((group) => group.category === 'vehicle') || [];
  const vehicleLocationCount = new Set(vehicleGroups.map((group) => group.siteName)).size;
  const totalVehiclesToday = vehicleGroups
    .map((group) => getSummaryNumericMetric(group, 'today_vehicle_count'))
    .filter((value) => value !== null)
    .reduce((total, value) => total + value, 0);
  const peakCar = getSummaryExtreme(vehicleGroups, 'peak_car_per_min');
  const peakMotorcycle = getSummaryExtreme(vehicleGroups, 'peak_motorcycle_per_min');
  const peakCarGroup = vehicleGroups.find((group) => group.siteName === peakCar?.siteName);
  const peakMotorcycleGroup = vehicleGroups.find((group) => group.siteName === peakMotorcycle?.siteName);
  const peakCarTime = getSummaryMetric(peakCarGroup, 'peak_car_time');
  const peakMotorcycleTime = getSummaryMetric(peakMotorcycleGroup, 'peak_motorcycle_time');

  return (
    <>
      <section className="summaryGrid" aria-label="Vehicle counter summary">
        <Metric
          icon={Factory}
          label="Monitored Locations"
          note="Vehicle data sources"
          value={summaryLoading ? '...' : vehicleLocationCount}
          tone="green"
        />
        <Metric
          icon={Car}
          label="Total Vehicles Today"
          note="Across all available locations"
          value={summaryLoading ? '...' : formatSummaryNumber(totalVehiclesToday, 0)}
          tone="blue"
        />
        <Metric
          icon={Gauge}
          label="Maximum Cars/min Today"
          note={summaryLoading ? 'Loading peak time' : peakCarTime ? `at ${peakCarTime}` : 'No valid data'}
          value={summaryLoading ? '...' : peakCar ? formatSummaryNumber(peakCar.value, 0) : '-'}
          tone="amber"
        />
        <Metric
          icon={Gauge}
          label="Maximum Motorcycles/min Today"
          note={summaryLoading ? 'Loading peak time' : peakMotorcycleTime ? `at ${peakMotorcycleTime}` : 'No valid data'}
          value={summaryLoading ? '...' : peakMotorcycle ? formatSummaryNumber(peakMotorcycle.value, 0) : '-'}
          tone="red"
        />
      </section>

      <section className="chartGridPanel" aria-label="Vehicle counter charts">
        <VehicleCounterChartPanel
          filterType="total"
          onScaleChange={setTotalScale}
          scale={totalScale}
          title="Total Vehicle"
        />
        <VehicleCounterChartPanel
          filterType="rate"
          onScaleChange={setRateScale}
          scale={rateScale}
          title="Vehicle Rate"
        />
      </section>

      <section className="panel widePanel">
        <div className="panelHeader">
          <div>
            <h2>Full Parameter Readings</h2>
            <p>{lastSync ? `Vehicle Counter data synced ${lastSync}` : `Vehicle values at ${vehicleLocation}.`}</p>
          </div>
          <button className="textButton" type="button" onClick={reload} disabled={loading}>
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Loading' : 'Refresh'}</span>
          </button>
        </div>

        {error ? <div className="notice">{error}</div> : null}

        <div className="tableWrap">
          <table className="electricityTable vehicleTable">
            <thead>
              <tr>
                <th>No.</th>
                <th>Parameter</th>
                <th>{vehicleLocation}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.parameter}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{row.parameter}</strong>
                  </td>
                  <td>
                    <VehicleValue parameter={row.parameter} value={row.values[0]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel vehicleCameraPanel" aria-label="Undip Entry Gate live camera">
        <div className="panelHeader">
          <div>
            <h2>Live Camera</h2>
            <p>{vehicleLocation} - YouTube Live Stream</p>
          </div>
          <a
            className="textButton"
            href="https://www.youtube.com/@GreenMonitoring2025/live"
            target="_blank"
            rel="noreferrer"
          >
            <span>Open in YouTube</span>
          </a>
        </div>
        <div className="vehicleCameraFrame">
          <iframe
            src="https://www.youtube.com/embed/live_stream?channel=UCuF8iQlh1JCDIhqMW3-SBnw&autoplay=1&mute=1&playsinline=1&rel=0"
            title="Undip Entry Gate live camera"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
    </>
  );
}

function VehicleValue({ parameter, value }) {
  if (!String(value || '').trim()) {
    return <span className="valueBadge washout" aria-label={`${parameter} is not available`} />;
  }

  const timestamp = parameter === 'Last seen' ? splitTimestampValue(value) : null;

  if (timestamp) {
    return (
      <span className="valueBadge neutral timestampBadge" title={String(value)}>
        <span className="timestampDate">{timestamp.date}</span>
        <span className="timestampTime">{timestamp.time}</span>
      </span>
    );
  }

  return <span className="valueBadge neutral">{value}</span>;
}

function VehicleCounterChartPanel({ filterType, onScaleChange, scale, title }) {
  const { series, loading, error } = useVehicleCounterSeries(scale);
  const filteredSeries = series.filter((item) => (filterType === 'rate' ? item.label.includes('/min') : !item.label.includes('/min')));
  const unitLabel = filterType === 'rate' ? 'Rate/min' : 'Total';

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>{title}</h2>
          <p>{vehicleLocation} - {vehicleCounterScales[scale].label}</p>
        </div>
        <div className="chartControls">
          <div className="segmentedControl" aria-label={`Select ${title} time scale`}>
            {Object.entries(vehicleCounterScales).map(([scaleId, config]) => (
              <button
                className={scale === scaleId ? 'active' : ''}
                key={scaleId}
                type="button"
                onClick={() => onScaleChange(scaleId)}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <GroupedBarChart
          ariaLabel={`${title} chart`}
          emptyMessage="No vehicle counter data is available for this selection."
          series={filteredSeries}
          yAxisLabel={unitLabel}
        />
      )}
    </section>
  );
}

function Co2TemperaturePanel() {
  const { series, loading, error } = useCo2TemperatureSeries();

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Max Temperature (C)</h2>
          <p>Hourly max temperature across locations</p>
        </div>
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <MultiSeriesAreaChart
          ariaLabel="Carbon dioxide max temperature chart"
          emptyMessage="No temperature data is available for this chart."
          series={series}
          unit="C"
        />
      )}
    </section>
  );
}

function Co2HistoryPanel({ scale, onScaleChange }) {
  const { series, loading, error } = useCo2HistorySeries(scale);

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>CO₂ (ppm)</h2>
          <p>{co2HistoryScales[scale].label} CO₂ across locations</p>
        </div>
        <div className="chartControls">
          <div className="segmentedControl" aria-label="Select CO₂ time scale">
            {Object.entries(co2HistoryScales).map(([scaleId, config]) => (
              <button
                className={scale === scaleId ? 'active' : ''}
                key={scaleId}
                type="button"
                onClick={() => onScaleChange(scaleId)}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <MultiSeriesAreaChart
          ariaLabel="CO₂ ppm chart"
          emptyMessage="No CO₂ data is available for this selection."
          series={series}
          unit="ppm"
        />
      )}
    </section>
  );
}

function DailyActivePowerPanel({ locationIndex, onLocationChange }) {
  const [showAllLocations, setShowAllLocations] = useState(false);
  const { points, loading, error } = useDailyActivePower(locationIndex);
  const allLocationsPower = useDailyActivePowerSeries(showAllLocations);
  const selectedLocation = electricityLocations[locationIndex];
  const isLoading = showAllLocations ? allLocationsPower.loading : loading;
  const activeError = showAllLocations ? allLocationsPower.error : error;

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Average Power (kW)</h2>
          <p>{showAllLocations ? 'All locations - Today Average Power' : `${selectedLocation} - Today Average Power`}</p>
        </div>
        <div className="chartControls">
          <select
            value={locationIndex}
            onChange={(event) => onLocationChange(Number(event.target.value))}
            aria-label="Select active power chart location"
            disabled={showAllLocations}
          >
            {electricityLocations.map((location, index) => (
              <option key={location} value={index}>{location}</option>
            ))}
          </select>
          <div className="segmentedControl" aria-label="Average power display mode">
            <button
              type="button"
              className={showAllLocations ? 'active' : ''}
              onClick={() => setShowAllLocations((current) => !current)}
              aria-pressed={showAllLocations}
            >
              All Locations
            </button>
          </div>
        </div>
      </div>

      {activeError ? <div className="notice">{activeError}</div> : null}
      {isLoading ? (
        <div className="chartState">Loading chart...</div>
      ) : showAllLocations ? (
        <MultiSeriesAreaChart
          ariaLabel="All-location average power chart"
          emptyMessage="No average power data is available for all locations."
          series={allLocationsPower.series}
          unit="kW"
        />
      ) : (
        <ActivePowerLineChart points={points} />
      )}
    </section>
  );
}

function ActivePowerLineChart({
  ariaLabel = 'Hourly average power chart in kW',
  emptyMessage = 'No active power data is available for this location.',
  fillGradientId = 'activePowerFill',
  fillStops = [
    { offset: '0%', color: '#f97316', opacity: 0.32 },
    { offset: '72%', color: '#f59e0b', opacity: 0.12 },
    { offset: '100%', color: '#f59e0b', opacity: 0 },
  ],
  lineGradientId = 'activePowerLine',
  lineStops = [
    { offset: '0%', color: '#e76f51' },
    { offset: '100%', color: '#f59e0b' },
  ],
  pointColor = '#f97316',
  points,
  unit = 'kW',
}) {
  const width = 920;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 48, left: 66 };
  const coordinates = createLineChartCoordinates(points, width, height, padding);
  const linePath = createSmoothLinePath(coordinates);
  const areaPath = createLineAreaPath(coordinates, height, padding);
  const values = points.map((point) => point.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const yTicks = [maxValue, (maxValue + minValue) / 2, minValue];
  const xLabels = coordinates.filter((_, index) => {
    if (coordinates.length <= 8) return true;
    const step = Math.ceil(coordinates.length / 6);
    return index === 0 || index === coordinates.length - 1 || index % step === 0;
  });

  if (!points.length) {
    return <div className="chartState">{emptyMessage}</div>;
  }

  return (
    <div className="chartCanvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        <defs>
          <linearGradient id={fillGradientId} x1="0" x2="0" y1="0" y2="1">
            {fillStops.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
            ))}
          </linearGradient>
          <linearGradient id={lineGradientId} x1="0" x2="1" y1="0" y2="0">
            {lineStops.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>

        {yTicks.map((tick, index) => {
          const y = padding.top + (index / (yTicks.length - 1)) * (height - padding.top - padding.bottom);
          return (
            <g key={`${tick}-${index}`}>
              <line className="chartGrid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chartTick" x={padding.left - 12} y={y + 4} textAnchor="end">{tick.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</text>
            </g>
          );
        })}

        <path className="powerArea" d={areaPath} style={{ fill: `url(#${fillGradientId})` }} />
        <path className="powerLine" d={linePath} style={{ stroke: `url(#${lineGradientId})` }} />

        {coordinates.map((point, index) => (
          <circle className="powerPoint" cx={point.x} cy={point.y} key={`${point.label}-${index}`} r={3.2} style={{ stroke: pointColor }}>
            <title>{`${point.label}: ${point.value.toLocaleString('id-ID')} ${unit}`}</title>
          </circle>
        ))}

        {xLabels.map((point, index) => (
          <text className="chartTick chartTickX" x={point.x} y={height - 16} key={`${point.label}-${index}`} textAnchor="middle">
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function EnergyHistoryPanel({ locationIndex, scale, onLocationChange, onScaleChange }) {
  const { points, loading, error } = useEnergyHistory(locationIndex, scale);
  const [showForecast, setShowForecast] = useState(false);
  const selectedLocation = electricityLocations[locationIndex];
  const forecastPoint = useMemo(
    () => (scale === 'daily' ? buildTomorrowEnergyForecast(points) : null),
    [points, scale],
  );
  const displayedPoints = useMemo(() => {
    if (!showForecast || !forecastPoint) return points;

    let inserted = false;
    const withForecast = points.map((point) => {
      const date = parseChartDate(point.label);
      if (
        date
        && date.getFullYear() === forecastPoint.date.getFullYear()
        && date.getMonth() === forecastPoint.date.getMonth()
        && date.getDate() === forecastPoint.date.getDate()
      ) {
        inserted = true;
        return { ...point, ...forecastPoint, label: point.label };
      }
      return point;
    });

    if (inserted) return withForecast;
    return [...withForecast, forecastPoint].sort((left, right) => {
      const leftDate = parseChartDate(left.label);
      const rightDate = parseChartDate(right.label);
      return leftDate && rightDate ? leftDate - rightDate : 0;
    });
  }, [forecastPoint, points, showForecast]);

  useEffect(() => {
    if (scale !== 'daily') setShowForecast(false);
  }, [scale]);

  return (
    <section className="panel chartPanel">
      <div className="panelHeader chartHeader">
        <div>
          <h2>Energy (kWh)</h2>
          <p>{selectedLocation} - {energyHistoryScales[scale].label}</p>
        </div>
        <div className="chartControls">
          <select value={locationIndex} onChange={(event) => onLocationChange(Number(event.target.value))} aria-label="Select chart location">
            {electricityLocations.map((location, index) => (
              <option key={location} value={index}>{location}</option>
            ))}
          </select>
          <div className="segmentedControl" aria-label="Select time scale">
            {Object.entries(energyHistoryScales).map(([scaleId, config]) => (
              <button
                className={scale === scaleId ? 'active' : ''}
                key={scaleId}
                type="button"
                onClick={() => onScaleChange(scaleId)}
              >
                {config.label}
              </button>
            ))}
          </div>
          {scale === 'daily' ? (
            <div className="segmentedControl" aria-label="Energy forecast display">
              <button
                className={showForecast ? 'active' : ''}
                type="button"
                disabled={!forecastPoint}
                onClick={() => setShowForecast((current) => !current)}
                aria-pressed={showForecast}
              >
                Tomorrow Forecast
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <div className="notice">{error}</div> : null}
      {loading ? (
        <div className="chartState">Loading chart...</div>
      ) : (
        <>
          <EnergyBarChart points={displayedPoints} scale={scale} showForecast={showForecast} />
          {showForecast && forecastPoint ? (
            <p className="chartEstimateNote">
              Tomorrow&apos;s estimate uses recent {forecastPoint.date.getDay() === 0 || forecastPoint.date.getDay() === 6 ? 'weekend' : 'weekday'} energy history, prioritizing the same day of the week.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function EnergyBarChart({
  ariaLabel = 'Historical energy chart in kWh',
  emptyMessage = 'No chart data is available for this selection.',
  points,
  scale,
  showForecast = false,
  unit = 'kWh',
}) {
  const width = 920;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 48, left: 66 };
  const bars = createBarChartItems(points, width, height, padding);
  const values = points.map((point) => point.value);
  const maxValue = values.length ? Math.max(...values) : 0;
  const yTicks = [maxValue, maxValue / 2, 0];
  const xLabels = bars.filter((_, index) => {
    if (bars.length <= 8) return true;
    const step = Math.ceil(bars.length / 6);
    return index === 0 || index === bars.length - 1 || index % step === 0;
  });

  if (!points.length) {
    return <div className="chartState">{emptyMessage}</div>;
  }

  return (
    <div className="chartCanvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        <defs>
          <linearGradient id="energyBarFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1f6feb" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="energyWeekendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#e76f51" />
          </linearGradient>
          <linearGradient id="energyForecastFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="energyBarGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1f6feb" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#2ec4b6" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, index) => {
          const y = padding.top + (index / (yTicks.length - 1)) * (height - padding.top - padding.bottom);
          return (
            <g key={`${tick}-${index}`}>
              <line className="chartGrid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chartTick" x={padding.left - 12} y={y + 4} textAnchor="end">{Math.round(tick).toLocaleString('id-ID')}</text>
            </g>
          );
        })}

        <rect
          className="chartPlotFill"
          x={padding.left}
          y={padding.top}
          width={width - padding.left - padding.right}
          height={height - padding.top - padding.bottom}
          rx="10"
        />

        {bars.map((point, index) => (
          <rect
            className={`chartBar ${scale === 'daily' && isWeekendLabel(point.label) ? 'weekend' : ''} ${point.estimated ? 'forecast' : ''}`}
            height={point.barHeight}
            key={`${point.label}-${index}`}
            width={point.barWidth}
            x={point.x}
            y={point.y}
          >
            <title>{`${point.label}: ${point.value.toLocaleString('id-ID')} ${unit}${point.estimated ? ' (Estimated)' : ''}`}</title>
          </rect>
        ))}

        {xLabels.map((point, index) => (
          <text className="chartTick chartTickX" x={point.labelX} y={height - 16} key={`${point.label}-${index}`} textAnchor="middle">
            {point.label}
          </text>
        ))}
      </svg>
      {scale === 'daily' ? (
        <div className="barLegend" aria-label="Day color legend">
          <span><i className="weekday" />Weekday</span>
          <span><i className="weekend" />Weekend</span>
          {showForecast ? <span><i className="forecast" />Estimated</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function MultiSeriesAreaChart({ ariaLabel, emptyMessage, series, unit }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const width = 920;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 48, left: 66 };
  const populatedSeries = series.filter((item) => item.points.length);
  const values = populatedSeries.flatMap((item) => item.points.map((point) => point.value));
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const valueRange = maxValue - minValue || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const yTicks = [maxValue, (maxValue + minValue) / 2, minValue];
  const plottedSeries = populatedSeries.map((item) => {
    const coordinates = item.points.map((point, index) => {
      const x = item.points.length === 1 ? padding.left + innerWidth / 2 : padding.left + (index / (item.points.length - 1)) * innerWidth;
      const y = padding.top + (1 - (point.value - minValue) / valueRange) * innerHeight;
      return { ...point, x, y };
    });

    return {
      ...item,
      areaPath: createLineAreaPath(coordinates, height, padding),
      coordinates,
      linePath: createSmoothLinePath(coordinates),
    };
  });
  const labelPoints = plottedSeries[0]?.coordinates || [];
  const hoveredLabelPoint = hoveredIndex !== null ? labelPoints[hoveredIndex] : null;
  const hoveredItems = hoveredIndex !== null
    ? plottedSeries
      .map((item) => ({
        color: item.color,
        label: item.label,
        point: item.coordinates[hoveredIndex],
      }))
      .filter((item) => item.point)
    : [];
  const xLabels = labelPoints.filter((_, index) => {
    if (labelPoints.length <= 8) return true;
    const step = Math.ceil(labelPoints.length / 6);
    return index === 0 || index === labelPoints.length - 1 || index % step === 0;
  });

  function handleHoverMove(event) {
    if (!labelPoints.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    const nearestIndex = labelPoints.reduce((nearest, point, index) => {
      const currentDistance = Math.abs(point.x - relativeX);
      const nearestDistance = Math.abs(labelPoints[nearest].x - relativeX);
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);

    setHoveredIndex(nearestIndex);
  }

  if (!plottedSeries.length) {
    return <div className="chartState">{emptyMessage}</div>;
  }

  return (
    <div className="chartCanvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        <defs>
          {plottedSeries.map((item) => (
            <linearGradient id={`${item.id}AreaFill`} x1="0" x2="0" y1="0" y2="1" key={`${item.id}-fill`}>
              <stop offset="0%" stopColor={item.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {yTicks.map((tick, index) => {
          const y = padding.top + (index / (yTicks.length - 1)) * innerHeight;
          return (
            <g key={`${tick}-${index}`}>
              <line className="chartGrid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chartTick" x={padding.left - 12} y={y + 4} textAnchor="end">{tick.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</text>
            </g>
          );
        })}

        {plottedSeries.map((item) => (
          <path className="multiArea" d={item.areaPath} fill={`url(#${item.id}AreaFill)`} key={`${item.id}-area`} />
        ))}

        {plottedSeries.map((item) => (
          <path className="multiLine" d={item.linePath} key={`${item.id}-line`} stroke={item.color}>
            <title>{`${item.label}: ${item.points[item.points.length - 1]?.value.toLocaleString('id-ID')} ${unit}`}</title>
          </path>
        ))}

        {hoveredLabelPoint ? (
          <line
            className="chartHoverLine"
            x1={hoveredLabelPoint.x}
            x2={hoveredLabelPoint.x}
            y1={padding.top}
            y2={height - padding.bottom}
          />
        ) : null}

        <rect
          className="chartHoverOverlay"
          height={height - padding.top - padding.bottom}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={handleHoverMove}
          width={width - padding.left - padding.right}
          x={padding.left}
          y={padding.top}
        />

        {xLabels.map((point, index) => (
          <text className="chartTick chartTickX" x={point.x} y={height - 16} key={`${point.label}-${index}`} textAnchor="middle">
            {point.label}
          </text>
        ))}
      </svg>

      {hoveredLabelPoint ? (
        <div
          className="chartTooltip chartTooltipList"
          style={{
            left: `${(hoveredLabelPoint.x / width) * 100}%`,
            top: `${(padding.top / height) * 100}%`,
          }}
        >
          <em>{hoveredLabelPoint.label}</em>
          {hoveredItems.map((item) => (
            <span key={item.label}>
              <i style={{ background: item.color }} />
              {item.label}
              <strong>{item.point.value.toLocaleString('id-ID')} {unit}</strong>
            </span>
          ))}
        </div>
      ) : null}

      <div className="chartLegend">
        {plottedSeries.map((item) => (
          <span key={item.id}>
            <i style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function GroupedBarChart({ ariaLabel, emptyMessage, series, yAxisLabel }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const width = 920;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 48, left: 66 };
  const populatedSeries = series.filter((item) => item.points.length);
  const labels = Array.from(new Set(populatedSeries.flatMap((item) => item.points.map((point) => point.label))));
  const values = populatedSeries.flatMap((item) => item.points.map((point) => point.value));
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const groupWidth = labels.length ? innerWidth / labels.length : innerWidth;
  const activeSeriesCount = Math.max(populatedSeries.length, 1);
  const barGap = 2;
  const barWidth = Math.max(4, Math.min(24, (groupWidth * 0.72 - barGap * (activeSeriesCount - 1)) / activeSeriesCount));
  const yTicks = [maxValue, maxValue / 2, 0];
  const hoveredLabel = hoveredIndex !== null ? labels[hoveredIndex] : null;
  const hoveredItems = hoveredLabel
    ? populatedSeries
      .map((item) => ({
        color: item.color,
        label: item.label,
        point: item.points.find((entry) => entry.label === hoveredLabel),
      }))
      .filter((item) => item.point)
    : [];
  const xLabels = labels.filter((_, index) => {
    if (labels.length <= 8) return true;
    const step = Math.ceil(labels.length / 6);
    return index === 0 || index === labels.length - 1 || index % step === 0;
  });

  function getGroupCenter(labelIndex) {
    return padding.left + labelIndex * groupWidth + groupWidth / 2;
  }

  function getBarHeight(value) {
    return (value / maxValue) * innerHeight;
  }

  function handleHoverMove(event) {
    if (!labels.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    const nearestIndex = labels.reduce((nearest, _label, index) => {
      const currentDistance = Math.abs(getGroupCenter(index) - relativeX);
      const nearestDistance = Math.abs(getGroupCenter(nearest) - relativeX);
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);

    setHoveredIndex(nearestIndex);
  }

  if (!populatedSeries.length || !labels.length) {
    return <div className="chartState">{emptyMessage}</div>;
  }

  return (
    <div className="chartCanvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        {yTicks.map((tick, index) => {
          const y = padding.top + (index / (yTicks.length - 1)) * innerHeight;
          return (
            <g key={`${tick}-${index}`}>
              <line className="chartGrid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chartTick" x={padding.left - 12} y={y + 4} textAnchor="end">{tick.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</text>
            </g>
          );
        })}

        <text className="chartTick" x={padding.left} y={16} textAnchor="start">{yAxisLabel}</text>
        <line className="chartAxisLine" x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} />

        {labels.map((label, labelIndex) => {
          const groupX = getGroupCenter(labelIndex);
          const barsWidth = activeSeriesCount * barWidth + (activeSeriesCount - 1) * barGap;

          return populatedSeries.map((item, seriesIndex) => {
            const point = item.points.find((entry) => entry.label === label);
            if (!point) return null;

            const barHeight = getBarHeight(point.value);
            const x = groupX - barsWidth / 2 + seriesIndex * (barWidth + barGap);
            const y = padding.top + innerHeight - barHeight;

            return (
              <rect
                className="groupBar"
                fill={item.color}
                height={barHeight}
                key={`${item.id}-${label}`}
                width={barWidth}
                x={x}
                y={y}
              >
                <title>{`${label} - ${item.label}: ${point.value.toLocaleString('id-ID')}`}</title>
              </rect>
            );
          });
        })}

        {hoveredLabel ? (
          <line
            className="chartHoverLine"
            x1={getGroupCenter(hoveredIndex)}
            x2={getGroupCenter(hoveredIndex)}
            y1={padding.top}
            y2={height - padding.bottom}
          />
        ) : null}

        <rect
          className="chartHoverOverlay"
          height={height - padding.top - padding.bottom}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={handleHoverMove}
          width={width - padding.left - padding.right}
          x={padding.left}
          y={padding.top}
        />

        {xLabels.map((label) => {
          const labelIndex = labels.indexOf(label);
          const x = getGroupCenter(labelIndex);
          return (
            <text className="chartTick chartTickX" x={x} y={height - 16} key={label} textAnchor="middle">
              {label}
            </text>
          );
        })}
      </svg>

      {hoveredLabel ? (
        <div
          className="chartTooltip chartTooltipList"
          style={{
            left: `${(getGroupCenter(hoveredIndex) / width) * 100}%`,
            top: `${(padding.top / height) * 100}%`,
          }}
        >
          <em>{hoveredLabel}</em>
          {hoveredItems.map((item) => (
            <span key={item.label}>
              <i style={{ background: item.color }} />
              {item.label}
              <strong>{item.point.value.toLocaleString('id-ID')}</strong>
            </span>
          ))}
        </div>
      ) : null}

      <div className="chartLegend">
        {populatedSeries.map((item) => (
          <span key={item.id}>
            <i style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Metric({ artwork, icon: Icon, label, note, unit, value, tone }) {
  const noteClassName = String(note || '').startsWith('at ') ? 'metricLocationNote' : '';

  return (
    <div className={`metric ${tone}${artwork ? ' metricWithArtwork' : ''}`}>
      <div className="metricIcon">
        <Icon size={22} />
      </div>
      <span>{label}</span>
      <strong className="metricValue">
        {value}
        {unit ? <span className="metricUnit">{unit}</span> : null}
      </strong>
      {note ? <small className={noteClassName}>{note}</small> : null}
      {artwork ? <img className="metricArtwork" src={artwork} alt="" aria-hidden="true" /> : null}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
