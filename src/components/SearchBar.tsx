import React, { useEffect, useRef, useState } from "react";

interface SearchBarProps {
    onCitySelect: (lat: number, lon: number, name: string) => void;
    currentCity?: string;
    isLoading?: boolean;
}

interface GeoResult {
    id?: number | string;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
}

const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/search";

export default function SearchBar({ onCitySelect, currentCity = "", isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState<string>(currentCity);
    const [results, setResults] = useState<GeoResult[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setQuery(currentCity);
    }, [currentCity]);

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, []);

    const fetchPlaces = (q: string) => {
        if (!q || q.trim().length < 2) {
            setResults([]);
            setOpen(false);
            setError(null);
            return;
        }

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        const url = `${GEOCODING_BASE}?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;

        fetch(url, { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
                const json = await res.json();
                const items = (json.results || []).map((r: any) => ({
                    id: r.id ?? `${r.latitude}-${r.longitude}-${r.name}`,
                    name: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${r.country ? ", " + r.country : ""}`,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    country: r.country,
                    admin1: r.admin1,
                })) as GeoResult[];
                setResults(items);
                setOpen(items.length > 0);
                setHighlightIndex(-1);
            })
            .catch((err) => {
                if ((err as any).name !== "AbortError") {
                    console.error(err);
                    setError("Failed to search locations");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Debounced search
    const onChange = (value: string) => {
        setQuery(value);
        setError(null);

        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            fetchPlaces(value);
        }, 300);
    };

    const selectItem = (item: GeoResult) => {
        setQuery(item.name);
        setOpen(false);
        setResults([]);
        onCitySelect(item.latitude, item.longitude, item.name);
        inputRef.current?.blur();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || results.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const idx = highlightIndex >= 0 ? highlightIndex : 0;
            const item = results[idx];
            if (item) selectItem(item);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    // Установить каретку в конец строки
    const focusAndMoveCaretToEnd = () => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        setTimeout(() => {
            try {
                const len = el.value.length;
                el.setSelectionRange(len, len);
            } catch {
                // ignore
            }
        }, 0);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setOpen(false);
        setError(null);
        // удерживаем фокус и ставим курсор в конец (пустая строка — просто фокус)
        focusAndMoveCaretToEnd();
    };

    return (
        <div className="relative w-full max-w-md mb-1 bg-[#2e1e12]/70 backdrop-blur-sm rounded-xl shadow-inner-glow border border-[#a36b2b]/40" style={{ zIndex: 50 }}>
            {/* Кнопка очистки справа — пиксельный SVG, белый */}
            {query.length > 0 && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onMouseDown={(e) => { e.preventDefault(); handleClear(); }} // prevent blur race
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
                >
                    {/* Пиксельный X — белый. shape-rendering для резких краёв */}
                    <svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                        <rect width="16" height="16" fill="none" />
                        <g fill="white" shapeRendering="crispEdges">
                            {/* простая пиксельная X — прямоугольники по диагонали */}
                            <rect x="1" y="1" width="2" height="2" />
                            <rect x="4" y="4" width="2" height="2" />
                            <rect x="7" y="7" width="2" height="2" />
                            <rect x="10" y="10" width="2" height="2" />
                            <rect x="13" y="13" width="2" height="2" />

                            <rect x="13" y="1" width="2" height="2" />
                            <rect x="10" y="4" width="2" height="2" />
                            <rect x="7" y="7" width="2" height="2" /> {/* center reused */}
                            <rect x="4" y="10" width="2" height="2" />
                            <rect x="1" y="13" width="2" height="2" />
                        </g>
                    </svg>
                </button>
            )}

            <input
                ref={inputRef}
                className="w-full p-3 pr-10 rounded-md text-white"
                placeholder="Search city..."
                value={query}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => { if (results.length > 0) setOpen(true); focusAndMoveCaretToEnd(); }}
                onClick={() => focusAndMoveCaretToEnd()}
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls="search-suggestions"
                disabled={isLoading}
            />

            {loading && <div className="absolute right-10 top-3 text-xs">…</div>}
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

            {open && results.length > 0 && (
                <ul
                    id="search-suggestions"
                    role="listbox"
                    className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg max-h-56 overflow-auto text-left"
                >
                    {results.map((r, i) => (
                        <li
                            key={r.id}
                            role="option"
                            aria-selected={highlightIndex === i}
                            onMouseDown={(ev) => { ev.preventDefault(); selectItem(r); }}
                            onMouseEnter={() => setHighlightIndex(i)}
                            className={`p-2 cursor-pointer ${highlightIndex === i ? "bg-gray-200" : ""}`}
                        >
                            <div className="text-sm font-medium">{r.name}</div>
                            <div className="text-xs opacity-70">{r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
