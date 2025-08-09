export interface ForecastData {
    time: Date[];
    temperatureMin: number[];
    temperatureMax: number[];
    weathercode: number[];
}

export interface CurrentData {
    temperature: number | null;
    weathercode: number | null;
    wind: number | null;
    pressure: number | null;
    humidity: number | null;
}

export interface Location {
    lat: number;
    lon: number;
    name: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface FavoriteCity {
    lat: number;
    lon: number;
    name: string;
}