import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../components/Header/Header.jsx";
import EventCard from "../components/EventCard";
import Map from "../components/Map";
import "./Home.css";
import HomeSearchBar from "../components/SearchBar/HomeSearchBar";
import { useFavorites } from "../api/useFavorites";
import { usePossibilities } from "../api/usePossibilities";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        type: "",
        city: ""
    });

    const [events, setEvents] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 10;

    const { getAllPossibilities } = usePossibilities();
    const { favorites, favoriteIds, toggleFavorite, isFavorite } = useFavorites();

    // Клик на карточку - обновляем selectedEvent и переходим на страницу
    const handleEventClick = useCallback((event) => {
        setSelectedEvent(event); // 👈 только приближение
    }, []);

    // Клик на пин - только выделение, без навигации
    const handleMapSelect = useCallback((event) => {
        setSelectedEvent(event);
    }, []);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await getAllPossibilities({ offset: 0, limit });
            const normalizedEvents = (Array.isArray(data) ? data : []).map(event => ({
                ...event,
                tags: event.tags || event.Tags || []
            }));
            setEvents(normalizedEvents);
            setOffset(0);
        } catch (e) {
            console.error(e);
        }
    };

    const loadMore = async () => {
        try {
            const newOffset = offset + limit;
            const data = await getAllPossibilities({
                offset: newOffset,
                limit
            });
            const normalizedEvents = (Array.isArray(data) ? data : []).map(event => ({
                ...event,
                tags: event.tags || event.Tags || []
            }));
            setEvents(prev => [...prev, ...normalizedEvents]);
            setOffset(newOffset);
        } catch (e) {
            console.error(e);
        }
    };

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const matchSearch =
                e.title?.toLowerCase().includes(submittedSearch.toLowerCase()) ||
                e.company?.name?.toLowerCase().includes(submittedSearch.toLowerCase());

            const matchType = filters.type
                ? e.type === filters.type
                : true;

            const matchCity = filters.city
                ? e.city === filters.city
                : true;

            return matchSearch && matchType && matchCity;
        });
    }, [events, submittedSearch, filters]);

    // Сортировка: выбранное событие наверх
    const sortedEvents = useMemo(() => {
        if (selectedEvent) {
            return [
                selectedEvent,
                ...filteredEvents.filter((e) => e.id !== selectedEvent.id),
            ];
        }
        return filteredEvents;
    }, [selectedEvent, filteredEvents]);

    const topEvents = sortedEvents.slice(0, 2);
    const bottomEvents = sortedEvents.slice(2);

    const eventsWithCoords = useMemo(() => {
        return filteredEvents.map(e => ({
            ...e,
            coords: e.latitude && e.longitude
                ? [e.latitude, e.longitude]
                : null
        }));
    }, [filteredEvents]);

    // Находим выбранное событие с координатами для карты
    const selectedEventWithCoords = useMemo(() => {
        if (!selectedEvent) return null;
        if (selectedEvent.latitude && selectedEvent.longitude) {
            return {
                ...selectedEvent,
                coords: [selectedEvent.latitude, selectedEvent.longitude]
            };
        }
        return selectedEvent;
    }, [selectedEvent]);

    return (
        <div className="page">
            <Header />

            <HomeSearchBar
                search={search}
                setSearch={setSearch}
                onSearch={() => setSubmittedSearch(search)}
                onOpenFilters={() => setShowFilters(true)}
            />

            <div className="container">
                <div className="top-section">
                    <div className="left">
                        <Map
                            events={eventsWithCoords}
                            selectedEvent={selectedEventWithCoords}
                            onSelect={handleMapSelect}
                            favorites={Array.from(favoriteIds)}
                        />
                    </div>

                    <div className="right">
                        {topEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                highlighted={event.id === selectedEvent?.id}
                                onClick={handleEventClick}
                                variant="candidate"
                                onToggleFavorite={toggleFavorite}
                                isFavorite={isFavorite(event.id)}
                            />
                        ))}
                    </div>
                </div>

                {bottomEvents.length > 0 && (
                    <div className="bottom-grid">
                        {bottomEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onClick={handleEventClick}
                                variant="candidate"
                                onToggleFavorite={toggleFavorite}
                                isFavorite={isFavorite(event.id)}
                            />
                        ))}
                    </div>
                )}

                {events.length >= limit && (
                    <div style={{ marginTop: "20px" }}>
                        <button className="primary" onClick={loadMore}>
                            Загрузить ещё
                        </button>
                    </div>
                )}
            </div>

            {showFilters && (
                <div className="filters-modal">
                    <div className="filters-content">
                        <h3>Фильтры</h3>
                        <select
                            value={filters.type}
                            onChange={(e) =>
                                setFilters({ ...filters, type: e.target.value })
                            }
                        >
                            <option value="">Все типы</option>
                            <option value="internship">Стажировка</option>
                            <option value="vacancy">Работа</option>
                            <option value="mentorship">Менторство</option>
                            <option value="event">Событие</option>
                        </select>
                        <select
                            value={filters.city}
                            onChange={(e) =>
                                setFilters({ ...filters, city: e.target.value })
                            }
                        >
                            <option value="">Все города</option>
                            <option value="Москва">Москва</option>
                            <option value="СПб">СПб</option>
                        </select>
                        <button
                            className="primary"
                            onClick={() => setShowFilters(false)}
                        >
                            Применить
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}