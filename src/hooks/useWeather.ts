import { useEffect, useState, useCallback } from 'react';
import type { ForecastData, CurrentData, Location, TemperatureUnit } from '../types/WeatherTypes';

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

            const params: Record<string, any> = {
                latitude: lat,
                longitude: lon,
                daily: 'temperature_2m_max,temperature_2m_min,weathercode',
                // current_weather true returns { temperature, windspeed, weathercode, time }
                current_weather: true,
                // дополнительные переменные берем в hourly, затем сопоставляем по времени current_weather.time
                hourly: 'surface_pressure,relativehumidity_2m,windspeed_10m',
                timezone: 'auto',
                temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
            };

            const url = 'https://api.open-meteo.com/v1/forecast';
            const query = Object.entries(params)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                .join('&');

            const res = await fetch(`${url}?${query}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const times = (json.daily?.time || []).map((t: string) => new Date(t));

            const weatherData: ForecastData = {
                time: times,
                temperatureMin: Array.isArray(json.daily?.temperature_2m_min) ? json.daily.temperature_2m_min : [],
                temperatureMax: Array.isArray(json.daily?.temperature_2m_max) ? json.daily.temperature_2m_max : [],
                weathercode: Array.isArray(json.daily?.weathercode) ? json.daily.weathercode : [],
            };

            // current_weather (if present) имеет поле time — найдем индекс в hourly.time
            const cw = json.current_weather ?? null;
            let pressure: number | null = null;
            let humidity: number | null = null;
            let windKmH: number | null = null;

            if (cw && json.hourly && Array.isArray(json.hourly.time)) {
                const idx = json.hourly.time.indexOf(cw.time);
                // если нашли соответствующую временную метку — читать значения из hourly
                if (idx >= 0) {
                    const p = Array.isArray(json.hourly.surface_pressure) ? json.hourly.surface_pressure[idx] : null;
                    const h = Array.isArray(json.hourly.relativehumidity_2m) ? json.hourly.relativehumidity_2m[idx] : null;
                    const w = Array.isArray(json.hourly.windspeed_10m) ? json.hourly.windspeed_10m[idx] : null;

                    pressure = p != null ? Math.round(p) : null;
                    humidity = h != null ? Math.round(h) : null;
                    windKmH = w != null ? Math.round(w * 3.6) : null; // m/s -> km/h
                } else {
                    // fallback: иногда current_weather.time может не совпасть с hourly.time (редко) — используем ближайший индекс 0
                    const p = Array.isArray(json.hourly.surface_pressure) ? json.hourly.surface_pressure[0] : null;
                    const h = Array.isArray(json.hourly.relativehumidity_2m) ? json.hourly.relativehumidity_2m[0] : null;
                    const w = Array.isArray(json.hourly.windspeed_10m) ? json.hourly.windspeed_10m[0] : null;
                    pressure = p != null ? Math.round(p) : null;
                    humidity = h != null ? Math.round(h) : null;
                    windKmH = w != null ? Math.round(w * 3.6) : null;
                }
            }

            // current_weather.windspeed тоже есть — при отсутствии hourly используем его (переведя в km/h)
            if (cw && windKmH == null && cw.windspeed != null) {
                windKmH = Math.round(cw.windspeed * 3.6);
            }

            const currentData: CurrentData = {
                temperature: cw?.temperature != null ? Math.floor(cw.temperature) : null,
                weathercode: cw?.weathercode ?? null,
                wind: windKmH,
                pressure: pressure,
                humidity: humidity,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
