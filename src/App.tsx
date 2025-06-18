import { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import { format } from 'date-fns';

import ForecastCard from "./components/ForecastCard.tsx";
import SearchBar from "./components/SearchBar.tsx";

import sun from './assets/images-icon/Sunny.png';
import cloudy from './assets/images-icon/Cloudy.png';
import cloudyRain from './assets/images-icon/Cloudy-Rain.png';
import cloudySun from './assets/images-icon/Cloudy-sun.png';

import bg from './assets/images-bg/a2ef6a7efb78115ce3ab19da1c0938a888c3cd1f8b480d921421dbc666ac44b5.png';

import './App.css';
import humidityIcon from "./assets/images-icon/Humidity.png";
import windIcon from "./assets/images-icon/Wind.png";
import pressureIcon from "./assets/images-icon/Pressure.png";

interface ForecastData {
    time: Date[];
    temperatureMin: number[];
    temperatureMax: number[];
    weathercode: number[];
}

interface CurrentData {
    temperature: number | null;
    weathercode: number | null;
    wind: number | null;
    pressure: number | null;
    humidity: number | null;
}

interface Location {
    lat: number;
    lon: number;
    name: string;
}

function App() {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [current, setCurrent] = useState<CurrentData>({
        temperature: null,
        weathercode: null,
        wind: null,
        pressure: null,
        humidity: null
    });
    const [location, setLocation] = useState<Location>({
        lat: 60.17,
        lon: 24.94,
        name: "Helsinki, Finland"
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchForecast = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                latitude: lat,
                longitude: lon,
                daily: "temperature_2m_max,temperature_2m_min,weathercode",
                current: "temperature_2m,weathercode,windspeed_10m,surface_pressure,relativehumidity_2m",
                timezone: "auto",
            };

            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);
            const response = responses[0];

            const daily = response.daily();
            const currentWeather = response.current();

            if (!daily || !currentWeather) {
                throw new Error('Failed to get weather data');
            }

            const utcOffsetSeconds = response.utcOffsetSeconds();

            const time = [...Array(Math.floor((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval()))].map(
                (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
            );

            const temperatureMaxArray = daily.variables(0)?.valuesArray();
            const temperatureMinArray = daily.variables(1)?.valuesArray();
            const weathercodeArray = daily.variables(2)?.valuesArray();

            const weatherData: ForecastData = {
                time,
                temperatureMin: temperatureMinArray ? Array.from(temperatureMinArray) : [],
                temperatureMax: temperatureMaxArray ? Array.from(temperatureMaxArray) : [],
                weathercode: weathercodeArray ? Array.from(weathercodeArray) : [],
            };

            const currentTemp = currentWeather.variables(0)?.value();
            const currentWeatherCode = currentWeather.variables(1)?.value();
            const currentWind = currentWeather.variables(2)?.value();
            const currentPressure = currentWeather.variables(3)?.value();
            const currentHumidity = currentWeather.variables(4)?.value();

            const currentData: CurrentData = {
                temperature: currentTemp !== undefined ? Math.floor(currentTemp) : null,
                weathercode: currentWeatherCode ?? null,
                wind: currentWind !== undefined ? Math.floor(currentWind) : null,
                pressure: currentPressure !== undefined ? Math.floor(currentPressure) : null,
                humidity: currentHumidity !== undefined ? Math.floor(currentHumidity) : null,
            };

            console.log('Weather Data:', weatherData);
            console.log('Current Data:', currentData);

            setForecast(weatherData);
            setCurrent(currentData);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            setError('Failed to load weather data');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        void fetchForecast(location.lat, location.lon);
    }, []);

    // Handle city selection from search
    const handleCitySelect = (lat: number, lon: number, cityName: string) => {
        const newLocation = { lat, lon, name: cityName };
        setLocation(newLocation);
        void fetchForecast(lat, lon);
    };

    const getIconByCode = (code: number | null): string => {
        if (code === null) return sun;
        if (code === 0 || code === 1) return sun;
        if (code === 2) return cloudySun;
        if (code === 3) return cloudy;
        if (code >= 45 && code <= 48) return cloudy;
        if (code >= 51 && code <= 67) return cloudyRain;
        if (code >= 80 && code <= 99) return cloudyRain;
        return sun;
    };

    const getDescriptionByCode = (code: number | null): string => {
        if (code === null) return "Unknown";
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
        if (!forecast || forecast.time.length === 0) return null;

        return forecast.time.slice(0, 5).map((date, index) => {
            if (index >= forecast.temperatureMin.length ||
                index >= forecast.temperatureMax.length ||
                index >= forecast.weathercode.length) {
                return null;
            }

            const dayFormat = format(date, 'EEE');
            const min = Math.floor(forecast.temperatureMin[index]);
            const max = Math.floor(forecast.temperatureMax[index]);
            const code = forecast.weathercode[index];
            const icon = getIconByCode(code);

            return (
                <ForecastCard
                    key={date.toISOString()}
                    day={index === 0 ? 'Today' : dayFormat}
                    iconSrc={icon}
                    min={min}
                    max={max}
                />
            );
        }).filter(Boolean);
    };

    if (loading) {
        return (
            <>
                <img
                    className="absolute inset-0 w-full h-screen object-cover -z-10 bg-cover bg-center"
                    src={bg}
                    alt="Weather background"
                />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white text-xl regular">Loading weather data...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <img
                    className="absolute inset-0 w-full h-screen object-cover -z-10 bg-cover bg-center"
                    src={bg}
                    alt="Weather background"
                />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-red-500 text-xl regular">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <img
                className="absolute inset-0 w-full h-screen object-cover -z-10 bg-cover bg-center"
                src={bg}
                alt="Weather background"
            />

            <div className="content text-center regular min-h-screen flex flex-col items-center justify-center px-4">
                {/* Search Bar */}
                <SearchBar
                    onCitySelect={handleCitySelect}
                    currentCity={location.name}
                    isLoading={loading}
                />

                <div className="card-wrapper w-[340px] sm:w-[480px] flex flex-col bg-[#2e1e12]/70 backdrop-blur-sm rounded-xl shadow-inner-glow border border-[#a36b2b]/40">
                    <div className="card-header bold p-9 text-[#F8E3B6]">
                        <div className="today-city text-xs">
                            {forecast && forecast.time.length > 0 ? format(forecast.time[0], 'PP') : "--"}
                        </div>
                        <div className="today-city text-2xl text-center">{location.name}</div>
                    </div>

                    <div className="card-info p-9 flex items-center justify-between text-[#F8E3B6]">
                        <div className="info-today flex flex-col items-center gap-2">


                            <div className="today-icon">
                                <img src={forecast && forecast.weathercode.length > 0 ? getIconByCode(forecast.weathercode[0]) : sun} alt="weather icon" />
                            </div>
                            <div className="today-temp text-3xl">
                                {forecast && forecast.temperatureMax.length > 0 ? Math.floor(forecast.temperatureMax[0]) + "°C" : "--"}
                            </div>
                            <div className="today-style text-xl">
                                {forecast && forecast.weathercode.length > 0 ? getDescriptionByCode(forecast.weathercode[0]) : "--"}
                            </div>
                        </div>

                        <div className="info-five flex flex-col items-center gap-2">
                            <div className="five-city">5-DAY FORECAST</div>
                            {getForecastCards()}
                        </div>
                    </div>

                    <div className="card-footer p-9 text-[#F8E3B6] flex justify-between text-center">
                        <div className="text-center text-xs">
                            <img src={humidityIcon} alt="humidity" className="mx-auto mb-1 w-8 h-8" />
                            <div className="opacity-70 mb-1">Humidity</div>
                            <div>{current.humidity ?? '--'}%</div>
                        </div>
                        <div className="text-center text-xs">
                            <img src={windIcon} alt="wind" className="mx-auto mb-1 w-8 h-8" />
                            <div className="opacity-70 mb-1">Wind</div>
                            <div>{current.wind ?? '--'} km/h</div>
                        </div>
                        <div className="text-center text-xs">
                            <img src={pressureIcon} alt="pressure" className="mx-auto mb-1 w-8 h-8" />
                            <div className="opacity-70 mb-1">Pressure</div>
                            <div>{current.pressure ?? '--'} hPa</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;