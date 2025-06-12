import { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import { format } from 'date-fns';

import ForecastCard from "./components/ForecastCard.tsx";

import sun from './assets/images-icon/Sunny.png';
import cloudy from './assets/images-icon/Cloudy.png';
import cloudyRain from './assets/images-icon/Cloudy-Rain.png';
import cloudySun from './assets/images-icon/Cloudy-sun.png';

import humidityIcon from './assets/images-icon/Humidity.png';
import windIcon from './assets/images-icon/Wind.png';
import pressureIcon from './assets/images-icon/Pressure.png';

import bg from './assets/images-bg/a2ef6a7efb78115ce3ab19da1c0938a888c3cd1f8b480d921421dbc666ac44b5.png';

import './App.css';

function App() {
    const [forecast, setForecast] = useState(null);
    const [current, setCurrent] = useState({
        temperature: null,
        weathercode: null,
        wind: null,
        pressure: null,
        humidity: null
    });

    useEffect(() => {
        const fetchForecast = async () => {
            const params = {
                latitude: 60.17,
                longitude: 24.94,
                daily: "temperature_2m_max,temperature_2m_min,weathercode",
                current: "temperature_2m,weathercode,wind_speed_10m,pressure_msl,relative_humidity_2m",
                timezone: "auto",
            };

            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);
            const response = responses[0];
            const daily = response.daily()!;
            const currentWeather = response.current()!;
            const utcOffsetSeconds = response.utcOffsetSeconds();

            const time = [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
                (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
            );

            const weatherData = {
                time,
                temperatureMin: daily.variables(1)!.valuesArray()!,
                temperatureMax: daily.variables(0)!.valuesArray()!,
                weathercode: daily.variables(2)!.valuesArray()!,
            };

            const currentData = {
                temperature: Math.floor(currentWeather.variables(0)!.value()),
                weathercode: currentWeather.variables(1)!.value(),
                wind: Math.floor(currentWeather.variables(2)!.value()),
                pressure: Math.floor(currentWeather.variables(3)!.value()),
                humidity: currentWeather.variables(4)!.value(),
            };

            setForecast(weatherData);
            setCurrent(currentData);
        };

        fetchForecast();
    }, []);

    const getIconByCode = (code: number) => {
        if (code === 0 || code === 1) return sun;
        if (code === 2) return cloudySun;
        if (code === 3) return cloudy;
        if (code >= 45 && code <= 48) return cloudy;
        if (code >= 51 && code <= 67) return cloudyRain;
        if (code >= 80 && code <= 99) return cloudyRain;
        return sun; // fallback
    };

    const getDescriptionByCode = (code: number) => {
        if (code === 0) return "Clear sky";
        if (code === 1) return "Mainly clear";
        if (code === 2) return "Partly cloudy";
        if (code === 3) return "Overcast";
        if (code >= 45 && code <= 48) return "Fog";
        if (code >= 51 && code <= 57) return "Drizzle";
        if (code >= 61 && code <= 67) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Showers";
        if (code >= 95) return "Thunderstorm";
        return "Unknown";
    };

    const getForecastCards = () => {
        if (!forecast) return null;

        return forecast.time.map((date, index) => {
            const day = format(date, 'EEE');
            const min = Math.floor(forecast.temperatureMin[index]);
            const max = Math.floor(forecast.temperatureMax[index]);
            const code = forecast.weathercode[index];
            const icon = getIconByCode(code);

            return (
                <ForecastCard
                    key={date.toISOString()}
                    day={index === 0 ? 'Today' : day}
                    iconSrc={icon}
                    min={min}
                    max={max}
                />
            );
        });
    };

    return (
        <>
            <img
                className="absolute inset-0 w-full h-screen object-cover -z-10 opacity-40"
                src={bg}
                alt=""
            />

            <div className="min-h-screen flex items-center justify-center px-4 py-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg w-full max-w-xl text-white overflow-hidden border border-white/20">
                    {/* Header */}
                    <div className="bg-blue-900 text-[#F3B956] px-6 py-5 text-center">
                        <h1 className="text-2xl font-bold tracking-wide">Weather Forecast</h1>
                    </div>

                    {/* Current Info */}
                    <div className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                        <div className="text-center sm:text-left">
                            <h2 className="text-5xl font-semibold">{current.temperature}°C</h2>
                            <p className="text-md opacity-80 mt-1">{getDescriptionByCode(current.weathercode)}</p>
                        </div>

                        <div className="flex justify-around sm:justify-end gap-6 w-full sm:w-auto">
                            <div className="text-center text-xs">
                                <img src={humidityIcon} alt="humidity" className="mx-auto mb-1 w-5 h-5" />
                                <div className="opacity-70">Humidity</div>
                                <div>{current.humidity}%</div>
                            </div>
                            <div className="text-center text-xs">
                                <img src={windIcon} alt="wind" className="mx-auto mb-1 w-5 h-5" />
                                <div className="opacity-70">Wind</div>
                                <div>{current.wind} km/h</div>
                            </div>
                            <div className="text-center text-xs">
                                <img src={pressureIcon} alt="pressure" className="mx-auto mb-1 w-5 h-5" />
                                <div className="opacity-70">Pressure</div>
                                <div>{current.pressure} hPa</div>
                            </div>
                        </div>
                    </div>

                    {/* Forecast */}
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                        {getForecastCards()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;