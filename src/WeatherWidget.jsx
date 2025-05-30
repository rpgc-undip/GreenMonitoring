import React, { useEffect, useState } from "react";

const WeatherWidget = ({ city = "London" }) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setError("");
        setWeather(null);

        const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
          city
        )}&days=1&aqi=no&alerts=no`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);

        setWeather({
          city: data.location.name,
          country: data.location.country,
          icon: "https:" + data.current.condition.icon,
          condition: data.current.condition.text,
          temp: data.current.temp_c,
          feelslike: data.current.feelslike_c,
          humidity: data.current.humidity,
          cloud: data.current.cloud,
          // Use forecast for chance of rain
          rainChance: data.forecast.forecastday[0].day.daily_chance_of_rain,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchWeather();
  }, [city]);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!weather) return <div>Loading weather...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full mx-auto mb-6">
      <div
        className="
          flex flex-col items-center gap-3
          lg:flex-row lg:items-center lg:gap-4
          lg:justify-between
        "
      >
        <span className="text-lg font-bold text-center lg:text-left whitespace-nowrap">
          📍 {weather.city}, {weather.country}
        </span>

        <img
          src={weather.icon}
          alt={weather.condition}
          className="h-12 flex-shrink-0"
        />

        <span className="text-2xl font-semibold whitespace-nowrap">
          {weather.temp}°C
        </span>
        <span className="text-lg whitespace-nowrap">{weather.condition}</span>

        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm whitespace-nowrap flex-grow text-center">
          🌡️ Feels like: {weather.feelslike}°C
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm whitespace-nowrap flex-grow text-center">
          💧 Humidity: {weather.humidity}%
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm whitespace-nowrap flex-grow text-center">
          ☁️ Cloud: {weather.cloud}%
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm whitespace-nowrap flex-grow text-center">
          🌧️ Chance of rain: {weather.rainChance}%
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
