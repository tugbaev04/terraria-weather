import React, { useState } from 'react';

interface SearchBarProps {
    onCitySelect: (lat: number, lon: number, cityName: string) => void;
    currentCity: string;
    isLoading?: boolean;
}

interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect, currentCity, isLoading = false }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchCities = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        try {
            setIsSearching(true);
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`
            );

            if (!response.ok) {
                throw new Error('Failed to search cities');
            }

            const data = await response.json();
            setResults(data.results || []);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching cities:', error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        setTimeout(() => {
            if (query === value) {
                searchCities(value);
            }
        }, 300);
    };

    const handleCitySelect = (city: GeocodingResult) => {
        const cityName = `${city.name}${city.admin1 ? `, ${city.admin1}` : ''}, ${city.country}`;
        onCitySelect(city.latitude, city.longitude, cityName);
        setQuery('');
        setShowResults(false);
        setResults([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (results.length > 0) {
            handleCitySelect(results[0]);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto mb-6">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder={currentCity || "Search for a city..."}
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-3 bg-[#2e1e12]/70 backdrop-blur-sm rounded-xl shadow-inner-glow border border-[#a36b2b]/40 text-white placeholder-white/70 focus:outline-none focus:border-white/50 disabled:opacity-50"
                        autoComplete="off"
                    />

                    {/* Search button */}
                    <button
                        type="submit"
                        disabled={isLoading || isSearching || results.length === 0}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white/70 hover:text-white disabled:opacity-50"
                    >
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>

            {/* Search results dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white/90 backdrop-blur-md rounded-xl border border-white/30 shadow-lg max-h-60 overflow-y-auto">
                    {results.map((city, index) => (
                        <button
                            key={`${city.latitude}-${city.longitude}-${index}`}
                            onClick={() => handleCitySelect(city)}
                            className="w-full text-left px-4 py-3 hover:bg-white/20 text-gray-800 border-b border-white/20 last:border-b-0"
                        >
                            <div className="font-medium">{city.name}</div>
                            <div className="text-sm text-gray-600">
                                {city.admin1 && `${city.admin1}, `}{city.country}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;