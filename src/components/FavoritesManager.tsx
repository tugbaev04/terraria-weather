import React, { useEffect, useState } from 'react';
import type { FavoriteCity, Location } from '../types/WeatherTypes';
import FavoriteCitiesList from './FavoriteCitiesList';

interface Props {
    currentLocation: Location;
    onCitySelect: (lat: number, lon: number, name: string) => void;
}

const STORAGE_KEY = 'weather:favorites:v1';

const FavoritesManager: React.FC<Props> = ({ currentLocation, onCitySelect }) => {
    const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setFavorites(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch { /* ignore */ }
    }, [favorites]);

    const addCurrent = () => {
        const item: FavoriteCity = { lat: currentLocation.lat, lon: currentLocation.lon, name: currentLocation.name };
        setFavorites((s) => {
            const exists = s.some(f => f.lat === item.lat && f.lon === item.lon);
            if (exists) return s;
            return [item, ...s].slice(0, 20);
        });
    };

    const remove = (loc: FavoriteCity) => setFavorites((s) => s.filter(f => !(f.lat === loc.lat && f.lon === loc.lon && f.name === loc.name)));

    const select = (loc: FavoriteCity) => {
        onCitySelect(loc.lat, loc.lon, loc.name);
        setShow(false);
    };

    return (
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
            <div className="flex gap-2">
                <button onClick={() => setShow(true)} className="regular px-3 py-1 rounded bg-white/10 text-[#F8E3B6] border border-white/20">Favorites</button>
                <button onClick={addCurrent} className="regular px-3 py-1 rounded bg-white/10 text-[#F8E3B6] border border-white/20">Add</button>
            </div>

            <FavoriteCitiesList favorites={favorites} onSelect={select} onRemove={remove} showFavorites={show} onClose={() => setShow(false)} />
        </div>
    );
};

export default FavoritesManager;