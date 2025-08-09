import React, { useState } from 'react';
import type { FavoriteCity } from '../hooks/useFavorites';
import type { Location } from '../types/WeatherTypes';
import FavoriteCitiesList from './FavoriteCitiesList';

interface Props {
    currentLocation: Location;
    onCitySelect: (lat: number, lon: number, name: string) => void;
    favorites: FavoriteCity[];
    onAddFavorite: (city: FavoriteCity) => void;
    onRemoveFavorite: (city: FavoriteCity) => void;
}

const FavoritesManager: React.FC<Props> = ({ currentLocation, onCitySelect, favorites, onAddFavorite, onRemoveFavorite }) => {
    const [show, setShow] = useState(false);

    const addCurrent = () => {
        const item: FavoriteCity = { lat: currentLocation.lat, lon: currentLocation.lon, name: currentLocation.name };
        onAddFavorite(item);
    };

    const remove = (loc: FavoriteCity) => onRemoveFavorite(loc);

    const select = (loc: FavoriteCity) => {
        onCitySelect(loc.lat, loc.lon, loc.name);
        setShow(false);
    };

    return (
        <div className="regular w-full max-w-md mb-4 flex items-center justify-between">
            <div className="flex gap-2">
                <button onClick={() => setShow(true)} className="px-3 py-1 rounded bg-white/10 text-[#F8E3B6] border border-white/20">Favorites</button>
                <button onClick={addCurrent} className="px-3 py-1 rounded bg-white/10 text-[#F8E3B6] border border-white/20">Add</button>
            </div>

            <FavoriteCitiesList favorites={favorites} onSelect={select} onRemove={remove} showFavorites={show} onClose={() => setShow(false)} />
        </div>
    );
};

export default FavoritesManager;
