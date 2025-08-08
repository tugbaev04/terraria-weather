// src/components/FavoritesManager.tsx

import { useState, useEffect } from 'react';
import type {Location} from '../types/WeatherTypes'; // Предполагается, что тип Location определен здесь
// Предполагается, что тип Location определен здесь
import FavoriteCitiesList from './FavoriteCitiesList'; // Импорт дочернего компонента

// Определяем интерфейс для пропсов один раз
interface FavoritesManagerProps {
    currentLocation: Location;
    onCitySelect: (lat: number, lon: number, cityName: string) => void;
}

// Константа для ключа в localStorage для избежания "магических строк"
const FAVORITES_STORAGE_KEY = 'weather-app-favorites';

const FavoritesManager: React.FC<FavoritesManagerProps> = ({ currentLocation, onCitySelect }) => {
    // Состояние для хранения списка избранных городов
    const [favorites, setFavorites] = useState<Location[]>([]);
    // Состояние для контроля видимости списка избранного
    const [showFavorites, setShowFavorites] = useState(false);

    // Эффект для загрузки избранных городов из localStorage при монтировании компонента
    useEffect(() => {
        const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (savedFavorites) {
            try {
                const parsedFavorites = JSON.parse(savedFavorites);
                // Проверяем, что загруженные данные - это массив
                if (Array.isArray(parsedFavorites)) {
                    setFavorites(parsedFavorites);
                }
            } catch (error) {
                console.error('Error parsing favorites from localStorage:', error);
                setFavorites([]); // В случае ошибки устанавливаем пустой массив
            }
        }
    }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз

    // Эффект для сохранения избранных в localStorage при каждом их изменении
    useEffect(() => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]); // Зависимость от 'favorites'

    // Функция для проверки, находится ли текущий город в избранном
    // Используем допуск (epsilon) для сравнения float-чисел, что более надежно
    const isCurrentLocationFavorite = favorites.some(
        fav =>
            Math.abs(fav.lat - currentLocation.lat) < 0.01 &&
            Math.abs(fav.lon - currentLocation.lon) < 0.01
    );

    // Функция для добавления текущего города в избранное
    const addToFavorites = () => {
        if (!isCurrentLocationFavorite) {
            setFavorites(prevFavorites => [...prevFavorites, currentLocation]);
        }
    };

    // Функция для удаления города из избранного
    const removeFromFavorites = (locationToRemove: Location) => {
        setFavorites(prevFavorites =>
            prevFavorites.filter(
                fav =>
                    !(Math.abs(fav.lat - locationToRemove.lat) < 0.01 &&
                        Math.abs(fav.lon - locationToRemove.lon) < 0.01)
            )
        );
    };

    // Функция для выбора города из списка избранных
    const selectCity = (location: Location) => {
        onCitySelect(location.lat, location.lon, location.name);
        setShowFavorites(false); // Скрываем список после выбора
    };

    return (
        <>
            <div className="flex gap-2 mb-4">
                {/* Кнопка для отображения списка избранных */}
                <button
                    onClick={() => setShowFavorites(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-[#2e1e12]/70 backdrop-blur-sm rounded-xl shadow-inner-glow border border-[#a36b2b]/40 text-white/90 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-xs regular">Favorites ({favorites.length})</span>
                </button>

                {/* Кнопка для добавления в избранное */}
                <button
                    onClick={addToFavorites}
                    disabled={isCurrentLocationFavorite}
                    className={`flex items-center gap-1 px-3 py-2 backdrop-blur-sm rounded-xl shadow-inner-glow border text-white/90 hover:text-white transition-all ${
                        isCurrentLocationFavorite
                            ? 'bg-[#4f372a]/70 border-[#a36b2b]/40 opacity-50 cursor-not-allowed'
                            : 'bg-[#2e1e12]/70 border-[#a36b2b]/40'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isCurrentLocationFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs regular">
                        {isCurrentLocationFavorite ? 'Favorited' : 'Add to Favorites'}
                    </span>
                </button>
            </div>

            {/* Модальное окно или список избранных городов */}
            <FavoriteCitiesList
                favorites={favorites}
                onSelect={selectCity}
                onRemove={removeFromFavorites}
                showFavorites={showFavorites}
                onClose={() => setShowFavorites(false)}
            />
        </>
    );
};

export default FavoritesManager;