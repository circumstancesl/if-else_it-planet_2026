// src/pages/candidate/Favorites.jsx
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Header from "../../components/Header/Header.jsx";
import EventCard from "../../components/EventCard";
import Map from "../../components/Map";
import HomeSearchBar from "../../components/SearchBar/HomeSearchBar";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";
import { useFavorites } from "../../api/useFavorites";
import { usePossibilities } from "../../api/usePossibilities";

export default function Favorites() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const navigate = useNavigate();

    const isMounted = useRef(true);
    const isLoadingRef = useRef(false);

    const { favorites, favoriteIds, toggleFavorite, isFavorite, fetchFavorites } = useFavorites();
    const { getPossibilityById } = usePossibilities();

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        navigate(`/candidate/event/${event.id}`);
    };

    // Загружаем данные избранных событий
    const loadFavoriteEvents = useCallback(async () => {
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;
        setLoading(true);

        try {
            // Получаем список избранных из хука
            const favs = await fetchFavorites();

            if (!isMounted.current) return;

            // Загружаем полные данные каждого события и нормализуем
            const eventsData = [];
            for (const fav of favs || favorites) {
                if (fav.type === 'possibility' && fav.item) {
                    // Нормализуем данные: приводим теги к единому формату
                    const normalizedEvent = {
                        ...fav.item,
                        tags: fav.item.tags || fav.item.Tags || []
                    };
                    eventsData.push(normalizedEvent);
                } else if (fav.type === 'possibility' && fav.itemId) {
                    try {
                        const eventData = await getPossibilityById(fav.itemId);
                        if (eventData && isMounted.current) {
                            // Нормализуем данные: приводим теги к единому формату
                            const normalizedEvent = {
                                ...eventData,
                                tags: eventData.tags || eventData.Tags || []
                            };
                            eventsData.push(normalizedEvent);
                        }
                    } catch (err) {
                        console.error("Error loading event:", fav.itemId, err);
                    }
                }
            }

            if (isMounted.current) {
                setFavoriteEvents(eventsData);
            }
        } catch (err) {
            console.error("Error loading favorites:", err);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
            isLoadingRef.current = false;
        }
    }, [favorites, fetchFavorites, getPossibilityById]);

    // Загружаем только при монтировании
    useEffect(() => {
        isMounted.current = true;
        loadFavoriteEvents();

        return () => {
            isMounted.current = false;
        };
    }, []);

    // Поиск по избранным
    const filteredEvents = useMemo(() => {
        return favoriteEvents.filter((e) => {
            const matchSearch =
                e.title?.toLowerCase().includes(submittedSearch.toLowerCase()) ||
                e.company?.name?.toLowerCase().includes(submittedSearch.toLowerCase());
            return matchSearch;
        });
    }, [favoriteEvents, submittedSearch]);

    // Сортировка с выбранным событием
    const sortedEvents = useMemo(() => {
        return selectedEvent
            ? [
                selectedEvent,
                ...filteredEvents.filter((e) => e.id !== selectedEvent.id),
            ]
            : filteredEvents;
    }, [selectedEvent, filteredEvents]);

    const topEvents = sortedEvents.slice(0, 2);
    const bottomEvents = sortedEvents.slice(2);

    // Адаптация координат для карты
    const eventsWithCoords = useMemo(() => {
        return filteredEvents
            .filter(e => e.latitude && e.longitude)
            .map(e => ({
                ...e,
                coords: [e.latitude, e.longitude]
            }));
    }, [filteredEvents]);

    if (loading && favoriteEvents.length === 0) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка избранного...
                    </div>
                </div>
            </div>
        );
    }

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
                {favoriteEvents.length === 0 ? (
                    <div className="empty-favorites">
                        <div className="empty-content">
                            <img src="/icons/empty-favorites.svg" alt="Нет избранных" />
                            <h3>У вас пока нет избранных событий</h3>
                            <p>Добавляйте события в избранное, чтобы не потерять интересные варианты</p>
                            <button
                                className="primary"
                                onClick={() => window.location.href = "/"}
                            >
                                Перейти к событиям
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="top-section">
                            <div className="left">
                                <Map
                                    events={eventsWithCoords}
                                    selectedEvent={selectedEvent}
                                    onSelect={setSelectedEvent}
                                    favorites={Array.from(favoriteIds)} // 👈 передаем массив ID
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
                    </>
                )}
            </div>

            {showFilters && (
                <div className="filters-modal">
                    <div className="filters-content">
                        <h3>Фильтры</h3>
                        <select>
                            <option>Все типы</option>
                            <option>Стажировка</option>
                            <option>Работа</option>
                            <option>Менторство</option>
                            <option>Мероприятие</option>
                        </select>
                        <select>
                            <option>Все города</option>
                            <option>Москва</option>
                            <option>Санкт-Петербург</option>
                            <option>Казань</option>
                            <option>Новосибирск</option>
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