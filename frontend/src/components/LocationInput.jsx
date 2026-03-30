import { useState, useRef, useEffect, useCallback } from "react";
import "./LocationInput.css";

export default function LocationInput({ value, onChange, onCoordinatesChange, placeholder = "Введите адрес" }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value || "");
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const abortControllerRef = useRef(null);

    const searchAddress = useCallback(async (query) => {
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=ru&accept-language=ru`,
                {
                    signal: abortControllerRef.current.signal,
                    headers: {
                        'User-Agent': 'ITPlanetApp/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            const suggestionsList = data.map(item => ({
                address: item.display_name,
                coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
            }));

            setSuggestions(suggestionsList);
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error("Error searching address:", error);

            // Fallback - показываем примеры адресов
            const examples = [
                { address: "Москва, Красная площадь", coordinates: [55.753, 37.621] },
                { address: "Москва, Тверская улица", coordinates: [55.757, 37.610] },
                { address: "Санкт-Петербург, Невский проспект", coordinates: [59.934, 30.330] },
                { address: "Казань, Кремлевская улица", coordinates: [55.796, 49.106] },
                { address: "Новосибирск, Красный проспект", coordinates: [55.030, 82.920] }
            ].filter(item => item.address.toLowerCase().includes(query.toLowerCase()));

            setSuggestions(examples);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const query = inputValue.trim();
            if (query.length >= 3) {
                searchAddress(query);
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [inputValue, searchAddress]);

    const handleSelectAddress = (suggestion) => {
        setInputValue(suggestion.address);
        setShowSuggestions(false);

        onChange(suggestion.address);

        if (onCoordinatesChange) {
            onCoordinatesChange({
                latitude: suggestion.coordinates[0],
                longitude: suggestion.coordinates[1]
            });
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setShowSuggestions(true);

        if (!newValue.trim() && onCoordinatesChange) {
            onCoordinatesChange(null);
        }

        onChange(newValue);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value || "");
        }
    }, [value]);

    return (
        <div className="location-input-container">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                className="location-input"
                autoComplete="off"
            />
            {loading && <div className="location-loading">Поиск...</div>}

            {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="location-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="location-suggestion-item"
                            onClick={() => handleSelectAddress(suggestion)}
                        >
                            <span className="location-icon"></span>
                            <span className="location-address">{suggestion.address}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}