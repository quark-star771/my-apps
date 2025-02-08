import React, { useState } from "react";

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

  return (
    <div className="min-h-screen bg-cyan-300 text-gray-800 flex flex-col items-center justify-center p-5 animate-fadeIn">
      <div className="flex flex-col items-center bg-green-400 p-4 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Weather Dashboard</h1>
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full">
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
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {weather && (
            <div className="mt-6 text-center w-full">
              <h2 className="text-2xl font-semibold">
                {displayCity} ({country})
              </h2>
              <p className="text-lg">{weather.current.weather[0].description}</p>
              <p className="text-4xl font-bold">
                {Math.round(weather.current.temp)}°F
              </p>
              <p className="text-sm">Humidity: {weather.current.humidity}%</p>
              <p className="text-sm">Wind: {weather.current.wind_speed} mph</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
