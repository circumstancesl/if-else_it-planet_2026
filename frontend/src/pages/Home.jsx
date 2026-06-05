import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../components/Header/Header.jsx";
import EventCard from "../components/EventCard";
import Map from "../components/Map";
import "./Home.css";
import HomeSearchBar from "../components/SearchBar/HomeSearchBar";
import { useFavorites } from "../api/useFavorites";
import { usePossibilities } from "../api/usePossibilities";
import { useTags } from "../api/useTags";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [filters, setFilters] = useState({
        type: "",
        format: "",
        city: "",
        salaryFrom: "",
        salaryTo: "",
        tags: []
    });

    const [events, setEvents] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 10;

    // Теги для фильтрации
    const { tags, fetchTags, loading: tagsLoading } = useTags();
    const [availableTags, setAvailableTags] = useState([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [tagSearch, setTagSearch] = useState("");

    const { getAllPossibilities } = usePossibilities();
    const { favorites, favoriteIds, toggleFavorite, isFavorite } = useFavorites();

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

    // Функция загрузки событий с фильтрами
    const loadEvents = useCallback(async (reset = true) => {
        if (loading) return;

        setLoading(true);
        try {
            // Получаем ID тегов по их названиям
            let tagIds = [];
            if (filters.tags.length > 0) {
                // Ищем ID для каждого выбранного тега
                tagIds = availableTags
                    .filter(tag => filters.tags.includes(tag.name))
                    .map(tag => tag.id);
            }

            const params = {
                offset: reset ? 0 : offset,
                limit: limit,
                search: submittedSearch || undefined,
                type: filters.type || undefined,
                format: filters.format || undefined,
                city: filters.city || undefined,
                salaryFrom: filters.salaryFrom ? Number(filters.salaryFrom) : undefined,
                salaryTo: filters.salaryTo ? Number(filters.salaryTo) : undefined,
                tags: tagIds.length > 0 ? tagIds.join(',') : undefined // передаем ID через запятую
            };

            console.log("Sending params:", params);

            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === "") {
                    delete params[key];
                }
            });

            const data = await getAllPossibilities(params);
            const normalizedEvents = (Array.isArray(data) ? data : []).map(event => ({
                ...event,
                tags: event.tags || event.Tags || []
            }));

            if (reset) {
                setEvents(normalizedEvents);
                setOffset(normalizedEvents.length);
                setHasMore(normalizedEvents.length === limit);
            } else {
                setEvents(prev => [...prev, ...normalizedEvents]);
                setOffset(prev => prev + normalizedEvents.length);
                setHasMore(normalizedEvents.length === limit);
            }
        } catch (e) {
            console.error("Error loading events:", e);
        } finally {
            setLoading(false);
        }
    }, [submittedSearch, filters, offset, loading, limit, availableTags]);

    // Загрузка при изменении поиска или фильтров
    useEffect(() => {
        loadEvents(true);
    }, [submittedSearch, filters.type, filters.format, filters.city, filters.salaryFrom, filters.salaryTo, filters.tags]);

    const loadMore = () => {
        if (!loading && hasMore) {
            loadEvents(false);
        }
    };

    const handleEventClick = useCallback((event) => {
        setSelectedEvent(event);
        navigate(`/candidate/event/${event.id}`);
    }, [navigate]);

    const handleMapSelect = useCallback((event) => {
        setSelectedEvent(event);
    }, []);

    const handleApplyFilters = () => {
        setShowFilters(false);
    };

    const handleResetFilters = () => {
        setFilters({
            type: "",
            format: "",
            city: "",
            salaryFrom: "",
            salaryTo: "",
            tags: []
        });
        setTagSearch("");
    };

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

    const filteredEvents = useMemo(() => {
        return events;
    }, [events]);

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

                {hasMore && events.length >= limit && (
                    <div className="load-more-container">
                        <button
                            className="primary"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? "Загрузка..." : "Загрузить ещё"}
                        </button>
                    </div>
                )}

                {!loading && events.length === 0 && (
                    <div className="empty-state-wrapper">
                        <div className="empty-state-card">
                            <div className="empty-icon">🔍</div>
                            <h3>Ничего не найдено</h3>
                            <p>Попробуйте изменить параметры поиска или фильтры</p>
                            <button className="primary" onClick={handleResetFilters}>
                                Сбросить фильтры
                            </button>
                        </div>
                    </div>
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
                                <label>Зарплата (от)</label>
                                <input
                                    type="number"
                                    placeholder="От"
                                    value={filters.salaryFrom}
                                    onChange={(e) => setFilters({ ...filters, salaryFrom: e.target.value })}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Зарплата (до)</label>
                                <input
                                    type="number"
                                    placeholder="До"
                                    value={filters.salaryTo}
                                    onChange={(e) => setFilters({ ...filters, salaryTo: e.target.value })}
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