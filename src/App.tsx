import React from 'react';
import { format } from 'date-fns';

import './App.css';

import ForecastCard from './components/ForecastCard';
import SearchBar from './components/SearchBar';
import TemperatureToggle from './components/TemperatureToggle';
import FavoritesManager from './components/FavoritesManager';

import sun from './assets/images-icon/Sunny.png';
import cloudy from './assets/images-icon/Cloudy.png';
import cloudyRain from './assets/images-icon/Cloudy-Rain.png';
import cloudySun from './assets/images-icon/Cloudy-sun.png';

import bg from './assets/images-bg/a2ef6a7efb78115ce3ab19da1c0938a888c3cd1f8b480d921421dbc666ac44b5.png';
import humidityIcon from './assets/images-icon/Humidity.png';
import windIcon from './assets/images-icon/Wind.png';
import pressureIcon from './assets/images-icon/Pressure.png';

import { useWeather } from './hooks/useWeather';
import { useFavorites } from './hooks/useFavorites';
import type { TemperatureUnit } from './types/WeatherTypes';

const initialLocation = { lat: 60.17, lon: 24.94, name: 'Helsinki, Finland' };

function App() {
    const { forecast, current, location, temperatureUnit, loading, error, setLocation, toggleUnit } = useWeather(initialLocation, 'celsius');
    const { favorites, add: addFavorite, remove: removeFavorite } = useFavorites();

    const getUnitSymbol = () => temperatureUnit === 'fahrenheit' ? '°F' : '°C';

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
        if (code === null) return 'Unknown';
        if (code === 0) return 'Clear sky';
        if (code === 1) return 'Mainly clear';
        if (code === 2) return 'Partly cloudy';
        if (code === 3) return 'Overcast';
        if (code >= 45 && code <= 48) return 'Fog';
        if (code >= 51 && code <= 57) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Showers';
        if (code >= 95) return 'Thunderstorm';
        return 'Unknown';
    };

    const getForecastCards = () => {
        if (!forecast || forecast.time.length === 0) return null;

        return forecast.time.slice(0, 5).map((date, index) => {
            if (index >= forecast.temperatureMin.length || index >= forecast.temperatureMax.length || index >= forecast.weathercode.length) {
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
                    unit={getUnitSymbol()}
                />
            );
        }).filter(Boolean);
    };

    if (loading) {
        return (
            <>
                <img className="absolute inset-0 w-full h-screen object-cover -z-10 bg-cover bg-center" src={bg} alt="Weather background" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="regular text-white">Loading weather data...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <img className="absolute inset-0 w-full h-screen object-cover -z-10 bg-cover bg-center" src={bg} alt="Weather background" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-red-500 text-xl font-normal">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <img className="absolute inset-0 w-full h-screen object-cover -z-10 bg-cover bg-center" src={bg} alt="Weather background" />

            <div className="content text-center font-normal min-h-screen flex flex-col items-center justify-center px-4">
                <TemperatureToggle unit={temperatureUnit as TemperatureUnit} onToggle={toggleUnit} disabled={loading} />

                <FavoritesManager
                    currentLocation={location}
                    onCitySelect={(lat, lon, name) => setLocation(lat, lon, name)}
                    favorites={favorites}
                    onAddFavorite={(city) => addFavorite(city)}
                    onRemoveFavorite={(city) => removeFavorite(city)}
                />

                <SearchBar onCitySelect={(lat, lon, name) => setLocation(lat, lon, name)} currentCity={location.name} isLoading={loading} />

                <div className="regular card-wrapper w-[340px] sm:w-[480px] flex flex-col bg-[#2e1e12]/70 backdrop-blur-sm rounded-xl shadow-inner border border-[#a36b2b]/40">
                    <div className="card-header font-bold p-9 text-[#F8E3B6]">
                        <div className="today-city text-xs">{forecast && forecast.time.length > 0 ? format(forecast.time[0], 'PP') : '--'}</div>
                        <div className="today-city text-2xl text-center">{location.name}</div>
                    </div>

                    <div className="card-info p-9 flex items-center justify-between text-[#F8E3B6]">
                        <div className="info-today flex flex-col items-center gap-2">
                            <div className="today-icon">
                                <img src={forecast && forecast.weathercode.length > 0 ? getIconByCode(forecast.weathercode[0]) : sun} alt="weather icon" />
                            </div>
                            <div className="today-temp text-3xl">{forecast && forecast.temperatureMax.length > 0 ? Math.floor(forecast.temperatureMax[0]) + getUnitSymbol() : '--'}</div>
                            <div className="today-style text-xl">{forecast && forecast.weathercode.length > 0 ? getDescriptionByCode(forecast.weathercode[0]) : '--'}</div>
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
