import"./WeatherCard.css";
import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  CloudSnow,
  CloudFog,
  Thermometer,
  Droplets,
  Wind,
} from "lucide-react";

import {
  getWeather,
  type WeatherData,
} from "../services/weatherService";

interface WeatherCardProps {
  destination: string;
}

const getWeatherCondition = (code: number) => {
  if (code === 0) return "Clear Sky";

  if ([1, 2].includes(code)) return "Partly Cloudy";

  if (code === 3) return "Overcast";

  if ([45, 48].includes(code)) return "Foggy";

  if ([51, 53, 55, 56, 57].includes(code))
    return "Drizzle";

  if ([61, 63, 65, 80, 81, 82].includes(code))
    return "Rainy";

  if ([66, 67].includes(code)) return "Freezing Rain";

  if ([71, 73, 75, 77, 85, 86].includes(code))
    return "Snowy";

  if ([95, 96, 99].includes(code))
    return "Thunderstorm";

  return "Unknown";
};

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun size={30} />;

  if ([1, 2].includes(code))
    return <CloudSun size={30} />;

  if ([45, 48].includes(code))
    return <CloudFog size={30} />;

  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code))
    return <CloudRain size={30} />;

  if ([71, 73, 75, 77, 85, 86].includes(code))
    return <CloudSnow size={30} />;

  return <Cloud size={30} />;
};

const WeatherCard = ({ destination }: WeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getWeather(destination);

        if (!cancelled) {
          setWeather(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load weather."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [destination]);

  if (loading) {
    return (
      <div className="weather-card weather-loading">
        <p>Loading weather forecast...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-card weather-error">
        <p>Weather information is currently unavailable.</p>
        <small>{error}</small>
      </div>
    );
  }

  return (
    <section className="weather-card compact-weather">

        <div className="compact-weather-header">
        <div>
            <span className="weather-label">
            WEATHER
            </span>

            <h3>{weather.destination}</h3>
        </div>

        <div className="compact-weather-icon">
            {getWeatherIcon(weather.weatherCode)}
        </div>
        </div>

        <div className="compact-current-weather">
        <span className="compact-temperature">
            {Math.round(weather.currentTemperature)}°
        </span>

        <div>
            <strong>
            {getWeatherCondition(weather.weatherCode)}
            </strong>

            <p>Current temperature</p>
        </div>
        </div>

        <div className="compact-forecast">
        {weather.days.slice(0, 5).map((day) => (
            <div className="compact-forecast-item" key={day.date}>

            <span>
                {new Date(
                `${day.date}T12:00:00`
                ).toLocaleDateString("en-US", {
                weekday: "short",
                })}
            </span>

            {getWeatherIcon(day.weatherCode)}

            <strong>
                {Math.round(day.maxTemperature)}°
            </strong>

            </div>
        ))}
        </div>

        <p className="compact-weather-note">
        Forecast may change.
        </p>

    </section>
);
};

export default WeatherCard;