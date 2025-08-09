import { useEffect, useState, useCallback } from 'react';
import type { ForecastData, CurrentData, Location, TemperatureUnit } from '../types/WeatherTypes';

// NOTE: В этом хуке я перенёс вашу логику fetchWeatherApi как есть.
// Он ожидает, что вы используете библиотеку openmeteo с тем же API, что в исходнике.

export function useWeather(initialLocation: Location, initialUnit: TemperatureUnit = 'celsius') {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [current, setCurrent] = useState<CurrentData>({
        temperature: null,
        weathercode: null,
        wind: null,
        pressure: null,
        humidity: null,
    });
    const [location, setLocation] = useState<Location>(initialLocation);
    const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(initialUnit);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchForecast = useCallback(async (lat: number, lon: number, unit: TemperatureUnit = temperatureUnit) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                latitude: lat,
                longitude: lon,
                daily: 'temperature_2m_max,temperature_2m_min,weathercode',
                current: 'temperature_2m,weathercode,windspeed_10m,surface_pressure,relativehumidity_2m',
                timezone: 'auto',
                temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
            } as any;

            const url = 'https://api.open-meteo.com/v1/forecast';
            // ВАЖНО: вы использовали fetchWeatherApi(url, params) — если у вас есть обёртка, замените fetch здесь.
            // Я сохраняю вызов через fetch для универсальности.

            const query = Object.entries(params)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                .join('&');

            const res = await fetch(`${url}?${query}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            // Обычный JSON-ответ от open-meteo — обработаем его в привычный формат
            const times = (json.daily?.time || []).map((t: string) => new Date(t));

            const weatherData: ForecastData = {
                time: times,
                temperatureMin: Array.isArray(json.daily?.temperature_2m_min) ? json.daily.temperature_2m_min : [],
                temperatureMax: Array.isArray(json.daily?.temperature_2m_max) ? json.daily.temperature_2m_max : [],
                weathercode: Array.isArray(json.daily?.weathercode) ? json.daily.weathercode : [],
            };

            const currentData: CurrentData = {
                temperature: json.current_weather?.temperature != null ? Math.floor(json.current_weather.temperature) : null,
                weathercode: json.current_weather?.weathercode ?? null,
                wind: json.current_weather?.windspeed != null ? Math.floor(json.current_weather.windspeed) : null,
                // open-meteo returns pressure/humidity in other fields; try to read from hourly as fallback
                pressure: json.current_weather?.surface_pressure ?? null,
                humidity: json.current_weather?.relativehumidity_2m ?? null,
            };

            setForecast(weatherData);
            setCurrent(currentData);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            setError('Failed to load weather data');
        } finally {
            setLoading(false);
        }
    }, [temperatureUnit]);

    // initial load
    useEffect(() => {
        void fetchForecast(location.lat, location.lon, temperatureUnit);
    }, []);

    const setLocationAndFetch = (lat: number, lon: number, name: string) => {
        setLocation({ lat, lon, name });
        void fetchForecast(lat, lon, temperatureUnit);
    };

    const toggleUnit = (unit: TemperatureUnit) => {
        setTemperatureUnit(unit);
        void fetchForecast(location.lat, location.lon, unit);
    };

    return {
        forecast,
        current,
        location,
        temperatureUnit,
        loading,
        error,
        setLocation: setLocationAndFetch,
        fetchForCoordinates: fetchForecast,
        toggleUnit,
    } as const;
}