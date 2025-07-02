import React, { useState, useEffect } from 'react';

interface FavoriteCity {
    name: string;
    lat: number;
    lon: number;
}

interface FavoritesManagerProps {
    currentLocation: { name: string; lat: number; lon: number };
    onCitySelect: (lat: number, lon: number, cityName: string) => void;
}

const FavoritesManager: React.FC<FavoritesManagerProps> = ({ currentLocation, onCitySelect }) => {
    const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
    const [showFavorites, setShowFavorites] = useState(false);

    // Load favorites from localStorage on component mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem('weather-favorites');
        if (savedFavorites) {
            try {
                const parsed = JSON.parse(savedFavorites);
                setFavorites(Array.isArray(parsed) ? parsed : []);
            } catch (error) {
                console.error('Error parsing favorites from localStorage:', error);
                setFavorites([]);
            }
        }
    }, []);

    // Save favorites to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('weather-favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = () => {
        const newFavorite: FavoriteCity = {
            name: currentLocation.name,
            lat: currentLocation.lat,
            lon: currentLocation.lon
        };

        // Check if already in favorites
        const isAlreadyFavorite = favorites.some(
            fav => Math.abs(fav.lat - newFavorite.lat) < 0.01 && Math.abs(fav.lon - newFavorite.lon) < 0.01
        );

        if (!isAlreadyFavorite) {
            setFavorites(prev => [...prev, newFavorite]);
        }
    };

    const removeFromFavorites = (cityToRemove: FavoriteCity) => {
        setFavorites(prev => prev.filter(
            fav => !(Math.abs(fav.lat - cityToRemove.lat) < 0.01 && Math.abs(fav.lon - cityToRemove.lon) < 0.01)
        ));
    };

    const isCurrentCityFavorite = () => {
        return favorites.some(
            fav => Math.abs(fav.lat - currentLocation.lat) < 0.01 && Math.abs(fav.lon - currentLocation.lon) < 0.01
        );
    };

    const handleFavoriteClick = (favorite: FavoriteCity) => {
        onCitySelect(favorite.lat, favorite.lon, favorite.name);
        setShowFavorites(false);
    };

    return (
        <div className="relative mb-4">
            <div className="flex items-center gap-2 justify-center">
                {/* Add to favorites button */}
                <button
                    onClick={addToFavorites}
                    disabled={isCurrentCityFavorite()}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm regular transition-all duration-200
                        ${isCurrentCityFavorite()
                        ? 'bg-yellow-500/30 text-yellow-300 cursor-not-allowed'
                        : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                    }
                    `}
                    title={isCurrentCityFavorite() ? 'Already in favorites' : 'Add to favorites'}
                >
                    <span className={isCurrentCityFavorite() ? 'text-yellow-300' : 'text-white'}>
                        ★
                    </span>
                    {isCurrentCityFavorite() ? 'In Favorites' : 'Add to Favorites'}
                </button>

                {/* Show favorites button */}
                {favorites.length > 0 && (
                    <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white border border-white/30 text-sm regular transition-all duration-200"
                    >
                        <span>📍</span>
                        Favorites ({favorites.length})
                    </button>
                )}
            </div>

            {/* Favorites dropdown */}
            {showFavorites && favorites.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white/90 backdrop-blur-md rounded-xl border border-white/30 shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                        <div className="text-gray-800 font-semibold text-sm mb-2 regular">Favorite Cities</div>
                        {favorites.map((favorite, index) => (
                            <div
                                key={`${favorite.lat}-${favorite.lon}-${index}`}
                                className="flex items-center justify-between p-2 hover:bg-white/30 rounded-lg group"
                            >
                                <button
                                    onClick={() => handleFavoriteClick(favorite)}
                                    className="flex-1 text-left text-gray-800 hover:text-gray-900 regular text-sm"
                                >
                                    {favorite.name}
                                </button>
                                <button
                                    onClick={() => removeFromFavorites(favorite)}
                                    className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity duration-200"
                                    title="Remove from favorites"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritesManager;