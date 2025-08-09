import { useEffect, useState, useCallback } from 'react';

export type FavoriteCity = { lat: number; lon: number; name: string };

const STORAGE_KEY = 'weather:favorites:v1';
const MAX_FAVS = 50;

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

    // load on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setFavorites(parsed);
            }
        } catch (e) {
            console.warn('Failed to read favorites from localStorage', e);
            setFavorites([]);
        }
    }, []);

    // save on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
            console.warn('Failed to save favorites to localStorage', e);
        }
    }, [favorites]);

    // sync between tabs
    useEffect(() => {
        const onStorage = (ev: StorageEvent) => {
            if (ev.key === STORAGE_KEY) {
                try {
                    const newVal = ev.newValue ? JSON.parse(ev.newValue) : [];
                    if (Array.isArray(newVal)) setFavorites(newVal);
                } catch {
                    // ignore
                }
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const add = useCallback((city: FavoriteCity) => {
        setFavorites((prev) => {
            const exists = prev.some(f => f.lat === city.lat && f.lon === city.lon && f.name === city.name);
            if (exists) return prev;
            return [city, ...prev].slice(0, MAX_FAVS);
        });
    }, []);

    const remove = useCallback((city: FavoriteCity) => {
        setFavorites((prev) => prev.filter(f => !(f.lat === city.lat && f.lon === city.lon && f.name === city.name)));
    }, []);

    const clear = useCallback(() => setFavorites([]), []);

    return { favorites, add, remove, clear } as const;
}
