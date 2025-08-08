import React from 'react';
import type {FavoriteCity} from '../types/WeatherTypes';

interface FavoriteCitiesListProps {
    favorites: FavoriteCity[];
    onSelect: (location: FavoriteCity) => void;
    onRemove: (location: FavoriteCity) => void;
    showFavorites: boolean;
    onClose: () => void;
}

const FavoriteCitiesList: React.FC<FavoriteCitiesListProps> = ({ 
    favorites, 
    onSelect, 
    onRemove, 
    showFavorites, 
    onClose 
}) => {
    if (!showFavorites) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2e1e12]/90 backdrop-blur-sm rounded-xl shadow-inner-glow border border-[#a36b2b]/40 text-white p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg text-[#F8E3B6]">Favorite Cities</h2>
                    <button 
                        onClick={onClose}
                        className="text-white/70 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                        You don't have any favorite cities yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {favorites.map((city, index) => (
                            <div 
                                key={`${city.lat}-${city.lon}-${index}`}
                                className="flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <button
                                    onClick={() => onSelect(city)}
                                    className="flex-1 text-left text-[#F8E3B6] hover:underline"
                                >
                                    {city.name}
                                </button>
                                <button
                                    onClick={() => onRemove(city)}
                                    className="text-white/70 hover:text-white p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteCitiesList;
