import React, { useState } from "react";
import { navigateTo } from "../utils/navigation";

const WeatherDashboard = () => {
  const [city, setCity] = useState("");
  const [displayCity, setDisplayCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("US");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const api_key = process.env.REACT_APP_WEATHER_API_KEY;

  const countryList = ["US", "CA", "GB", "FR", "DE", "IN", "AU"]; // Expand as needed

  const handleInputChange = (field, value) => {
    if (field === "city" || field === "state") {
      setCity(field === "city" ? value : city);
      setState(field === "state" ? value : state);
      setZip(""); // Disable zip if city/state is used
    } else if (field === "zip") {
      setZip(value);
      setCity("");
      setState(""); // Disable city/state if zip is used
    }
  };

  const getGeoData = async () => {
    if (!city && !zip) {
      setError("Please enter a valid city/state or zip along with a country.");
      return;
    }

    try {
      if (city && state) {
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=${api_key}`
        );

        if (!geoResponse.ok) {
          throw new Error("Failed to fetch geolocation data.");
        }

        const geoData = await geoResponse.json();
        const { lat, lon, name } = geoData[0];
        setDisplayCity(name);
        await getWeatherData(lat, lon);
      } else if (city && !state) {
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${api_key}`
        );

        if (!geoResponse.ok) {
          throw new Error("Failed to fetch geolocation data.");
        }

        const geoData = await geoResponse.json();
        const { lat, lon, name } = geoData[0];
        setDisplayCity(name);
        await getWeatherData(lat, lon);
      } else {
        const geoResponse = await fetch(
          `http://api.openweathermap.org/geo/1.0/zip?zip=${zip},${country}&appid=${api_key}`
        );

        if (!geoResponse.ok) {
          throw new Error("Failed to fetch geolocation data.");
        }

        const geoData = await geoResponse.json();
        const { lat, lon, name } = geoData;
        setDisplayCity(name);
        await getWeatherData(lat, lon);
      }
    } catch (err) {
      if (err.message === "Cannot destructure property 'lat' of 'geoData[0]' as it is undefined." || "Failed to fetch geolocation data.") {
        setError("Invalid information! Please try again.");
        console.log(err.message);
        setWeather(null);
      } else {
      setError(err.message);
      setWeather(null);
      }
    }
  };

  const getWeatherData = async (lat, lon) => {
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${api_key}&units=imperial`
      );

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
      }

      const weatherData = await weatherResponse.json();
      setWeather(weatherData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    }
  };

  const clearData = () => {
    setCity("");
    setDisplayCity("");
    setState("");
    setZip("");
    setWeather("");
  }

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-cyan-300 text-gray-800 flex flex-col items-center justify-center p-5 animate-fadeIn">
    {/* Home Button */}
    <button
      onClick={() => navigateTo('/')}
      className="fixed top-4 left-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-50"
    >
      🏠
    </button>
      <div className="flex flex-col items-center bg-green-400 p-4 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Weather Dashboard</h1>
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full">
          <h1 className="text-1xl font-bold mb-6">(Search by City/State or Zip Code.)</h1>
          <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="p-2 border border-gray-300 rounded flex-1"
              disabled={zip}
            />
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="p-2 border border-gray-300 rounded flex-1"
              disabled={zip}
            />
          </div>
          <input
            type="text"
            placeholder="Zip"
            value={zip}
            onChange={(e) => handleInputChange("zip", e.target.value)}
            className="p-2 border border-gray-300 rounded w-full mb-4"
            disabled={city || state}
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full mb-4"
          >
            {countryList.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <button
            onClick={getGeoData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-sky-400 transition w-full"
          >
            Get Weather
          </button>
          <p className="pt-2"></p>
          <button
            onClick={clearData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition w-full"
          >
            Clear Search
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {weather && (
            <div className="mt-6 text-center w-full">
              {/* Current Weather */}
              <h2 className="text-2xl font-semibold">
                {displayCity} ({country})
              </h2>
              <p className="text-lg">{capitalizeWords(weather.current.weather[0].description)}</p>
              <p className="text-4xl font-bold">
                {Math.round(weather.current.temp)}°F
              </p>
              <p className="text-sm">Humidity: {weather.current.humidity}%</p>
              <p className="text-sm">Wind: {weather.current.wind_speed} mph</p>

              {/* 5-Day Forecast */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {weather.daily.slice(0, 5).map((day, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-200 rounded-lg shadow-md text-center"
                    >
                      <p className="font-semibold">
                        {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                        className="mx-auto"
                      />
                      <p className="text-lg font-bold">
                        {Math.round(day.temp.max)}°F / {Math.round(day.temp.min)}°F
                      </p>
                      <p className="text-sm">{capitalizeWords(day.weather[0].description)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
