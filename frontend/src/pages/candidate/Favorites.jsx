import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Header from "../../components/Header/Header.jsx";
import EventCard from "../../components/EventCard";
import Map from "../../components/Map";
import HomeSearchBar from "../../components/SearchBar/HomeSearchBar";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";
import { useFavorites } from "../../api/useFavorites";
import { usePossibilities } from "../../api/usePossibilities";
import { useTags } from "../../api/useTags";
import PageLoader from "../../components/PageLoader.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

export default function Favorites() {
    const { user } = useAuth();

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const navigate = useNavigate();
    const isAuthenticated = !!user;


    const [filters, setFilters] = useState({
        type: "",
        format: "",
        city: "",
        tags: []
    });

    // Теги для фильтрации
    const { tags, fetchTags, loading: tagsLoading } = useTags();
    const [availableTags, setAvailableTags] = useState([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [tagSearch, setTagSearch] = useState("");

    const isMounted = useRef(true);
    const isLoadingRef = useRef(false);

    const { favorites, favoriteIds, toggleFavorite, isFavorite, fetchFavorites } = useFavorites();
    const { getPossibilityById } = usePossibilities();

    // Загружаем теги
    useEffect(() => {
        fetchTags({});
    }, []);

    // Обновляем доступные теги
    useEffect(() => {
        if (tags && tags.length > 0) {
            setAvailableTags(tags);
        }
    }, [tags]);

    // Наведение на карте
    const handleEventHover = useCallback((event) => {
        console.log("Hovering event:", event?.title, event?.id);
        setSelectedEvent(event);
    }, []);

    // Переход на страницу события
    const handleEventNavigate = useCallback((event) => {
        navigate(`/candidate/event/${event.id}`);
    }, [navigate]);

    const loadFavoriteEvents = useCallback(async () => {
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;
        setLoading(true);

        try {
            const favs = await fetchFavorites();

            if (!isMounted.current) return;

            const eventsData = [];
            for (const fav of favs || favorites) {
                if (fav.type === 'possibility' && fav.item) {
                    // Нормализуем теги: Tags может быть объектом или массивом
                    let eventTags = [];
                    if (fav.item.Tags) {
                        if (Array.isArray(fav.item.Tags)) {
                            eventTags = fav.item.Tags;
                        } else if (typeof fav.item.Tags === 'object' && fav.item.Tags.id) {
                            // Если Tags это объект (один тег), превращаем в массив
                            eventTags = [fav.item.Tags];
                        }
                    } else if (fav.item.tags) {
                        if (Array.isArray(fav.item.tags)) {
                            eventTags = fav.item.tags;
                        } else if (typeof fav.item.tags === 'object' && fav.item.tags.id) {
                            eventTags = [fav.item.tags];
                        }
                    }

                    const normalizedEvent = {
                        ...fav.item,
                        tags: eventTags,
                        company: fav.item.Company?.name || fav.item.company?.name || fav.item.companyName || "Компания",
                        companyVerificationStatus: fav.item.Company?.verification_status
                    };
                    eventsData.push(normalizedEvent);
                } else if (fav.type === 'possibility' && fav.itemId) {
                    try {
                        const eventData = await getPossibilityById(fav.itemId);
                        if (eventData && isMounted.current) {
                            // Нормализуем теги аналогично
                            let eventTags = [];
                            if (eventData.Tags) {
                                if (Array.isArray(eventData.Tags)) {
                                    eventTags = eventData.Tags;
                                } else if (typeof eventData.Tags === 'object' && eventData.Tags.id) {
                                    eventTags = [eventData.Tags];
                                }
                            } else if (eventData.tags) {
                                if (Array.isArray(eventData.tags)) {
                                    eventTags = eventData.tags;
                                } else if (typeof eventData.tags === 'object' && eventData.tags.id) {
                                    eventTags = [eventData.tags];
                                }
                            }

                            const normalizedEvent = {
                                ...eventData,
                                tags: eventTags,
                                company: eventData.Company?.name || eventData.company?.name || eventData.companyName || "Компания",
                                companyVerificationStatus: eventData.Company?.verification_status
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

    // Добавление тега
    const handleAddTag = (tag) => {
        if (!filters.tags.includes(tag.name)) {
            setFilters({
                ...filters,
                tags: [...filters.tags, tag.name]
            });
        }
        setShowTagDropdown(false);
        setTagSearch("");
    };

    // Удаление тега
    const handleRemoveTag = (tagToRemove) => {
        setFilters({
            ...filters,
            tags: filters.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Фильтрация тегов по поиску
    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
        !filters.tags.includes(tag.name)
    );

    const handleResetFilters = () => {
        setFilters({
            type: "",
            format: "",
            city: "",
            tags: []
        });
        setTagSearch("");
        setSubmittedSearch("");
        setSearch("");
    };

    const handleApplyFilters = () => {
        setShowFilters(false);
    };

    // Фильтрация событий
    const filteredEvents = useMemo(() => {
        let result = favoriteEvents;

        // Поиск по названию или компании
        if (submittedSearch) {
            result = result.filter((e) => {
                const matchSearch =
                    e.title?.toLowerCase().includes(submittedSearch.toLowerCase()) ||
                    (typeof e.company === 'string' ? e.company : e.company?.name || "").toLowerCase().includes(submittedSearch.toLowerCase());
                return matchSearch;
            });
        }

        // Фильтр по типу
        if (filters.type) {
            result = result.filter(e => e.type === filters.type);
        }

        // Фильтр по формату
        if (filters.format) {
            result = result.filter(e => e.format === filters.format);
        }

        // Фильтр по городу
        if (filters.city) {
            result = result.filter(e =>
                e.city?.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        // Фильтр по тегам
        if (filters.tags.length > 0) {
            result = result.filter(event => {
                const eventTags = event.tags || [];
                const eventTagNames = eventTags.map(t => t.name || t);
                return filters.tags.some(filterTag =>
                    eventTagNames.some(eventTag =>
                        eventTag.toLowerCase().includes(filterTag.toLowerCase())
                    )
                );
            });
        }

        return result;
    }, [favoriteEvents, submittedSearch, filters]);

    // Сортировка с выбранным событием
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

    // Формируем события с координатами для карты
    const eventsWithCoords = useMemo(() => {
        return filteredEvents
            .filter(e => e.latitude && e.longitude)
            .map(e => ({
                ...e,
                coords: [e.latitude, e.longitude]
            }));
    }, [filteredEvents]);

    // Выбранное событие с координатами
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

    if (loading && favoriteEvents.length === 0) {
        return (
            <div className="page">
                <Header />
                <PageLoader />
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
                {filteredEvents.length === 0 ? (
                    <div className="empty-state-wrapper">
                        <div className="empty-state-card">
                            <div className="empty-icon">❤️</div>
                            <h3>Нет избранных событий</h3>
                            <p>Добавляйте события в избранное, чтобы не потерять интересные варианты</p>
                            <button
                                className="primary"
                                onClick={() => navigate("/")}
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
                                    selectedEvent={selectedEventWithCoords}
                                    onSelect={setSelectedEvent}
                                    favorites={Array.from(favoriteIds)}
                                />
                            </div>

                            <div className="right">
                                {topEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        highlighted={event.id === selectedEvent?.id}
                                        onClick={handleEventHover}
                                        onCardClick={handleEventNavigate}
                                        variant="candidate"
                                        onToggleFavorite={toggleFavorite}
                                        isFavorite={isFavorite(event.id)}
                                        companyVerificationStatus={event.companyVerificationStatus}
                                        isAuthenticated={isAuthenticated}

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
                                        onClick={handleEventHover}
                                        onCardClick={handleEventNavigate}
                                        variant="candidate"
                                        onToggleFavorite={toggleFavorite}
                                        isFavorite={isFavorite(event.id)}
                                        companyVerificationStatus={event.companyVerificationStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showFilters && (
                <div className="filters-modal-overlay" onClick={() => setShowFilters(false)}>
                    <div className="filters-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="filters-header">
                            <h3>Фильтры</h3>
                            <button className="close-btn" onClick={() => setShowFilters(false)}>✕</button>
                        </div>

                        <div className="filters-body">
                            <div className="filter-group">
                                <label>Тип мероприятия</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="">Все типы</option>
                                    <option value="internship">Стажировка</option>
                                    <option value="vacancy">Работа</option>
                                    <option value="mentorship">Менторство</option>
                                    <option value="event">Событие</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Формат работы</label>
                                <select
                                    value={filters.format}
                                    onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                                >
                                    <option value="">Все форматы</option>
                                    <option value="office">Офис</option>
                                    <option value="remote">Удаленно</option>
                                    <option value="hybrid">Гибридный</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Город</label>
                                <input
                                    type="text"
                                    placeholder="Введите город"
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Теги</label>
                                <div className="tags">
                                    {filters.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="tag"
                                            onClick={() => handleRemoveTag(tag)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {tag} ✕
                                        </span>
                                    ))}
                                    <div className="add-tag-dropdown">
                                        <button
                                            className="add-tag"
                                            onClick={() => setShowTagDropdown(!showTagDropdown)}
                                            type="button"
                                        >
                                            + Добавить тег
                                        </button>
                                        {showTagDropdown && (
                                            <div className="dropdown-menu">
                                                <input
                                                    type="text"
                                                    placeholder="Поиск тега..."
                                                    value={tagSearch}
                                                    onChange={(e) => setTagSearch(e.target.value)}
                                                    className="dropdown-search"
                                                    autoFocus
                                                />
                                                <div className="dropdown-list">
                                                    {filteredTags.slice(0, 3).length > 0 ? (
                                                        filteredTags.slice(0, 3).map(tag => (
                                                            <div
                                                                key={tag.id}
                                                                className="dropdown-item"
                                                                onClick={() => handleAddTag(tag)}
                                                            >
                                                                {tag.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="dropdown-empty">Теги не найдены</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="filters-footer">
                            <button className="secondary" onClick={handleResetFilters}>
                                Сбросить
                            </button>
                            <button className="primary" onClick={handleApplyFilters}>
                                Применить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}