import { useState, useMemo, useEffect } from "react";
import Header from "../../components/Header/Header.jsx";
import EventCard from "../../components/EventCard";
import HomeSearchBar from "../../components/SearchBar/HomeSearchBar";
import { useNavigate } from "react-router-dom";
import { useResponses } from "../../api/useResponses";
import { useChat } from "../../api/useChat";
import { useTags } from "../../api/useTags";
import { users } from "../../api/endpoints";
import "./CandidateResponses.css";
import PageLoader from "../../components/PageLoader.jsx";

export default function CandidateResponses() {
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const { getMyResponses } = useResponses();
    const { createOrGetChat } = useChat();

    // Функция для получения полного URL изображения
    const getFullImageUrl = (url) => {
        if (!url) return "/img/jobseeker.jpg";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

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

    useEffect(() => {
        loadResponses();
    }, []);

    const loadResponses = async () => {
        try {
            setLoading(true);
            const data = await getMyResponses();
            console.log("Responses data:", data);
            setResponses(data || []);
        } catch (err) {
            console.error("Error loading responses:", err);
        } finally {
            setLoading(false);
        }
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

    const handleResetFilters = () => {
        setFilters({
            type: "",
            format: "",
            city: "",
            tags: []
        });
        setTagSearch("");
    };

    const handleApplyFilters = () => {
        setShowFilters(false);
    };

    const filteredResponses = useMemo(() => {
        let filtered = responses;

        // Фильтрация по вкладке
        if (activeTab === "history") {
            filtered = filtered.filter((item) => item.isCompleted === true);
        } else if (activeTab === "pending") {
            filtered = filtered.filter((item) => item.status === "pending" && !item.isCompleted);
        } else if (activeTab === "accepted") {
            filtered = filtered.filter((item) => item.status === "accepted" && !item.isCompleted);
        } else if (activeTab === "reserve") {
            filtered = filtered.filter((item) => item.status === "reserve" && !item.isCompleted);
        } else if (activeTab === "rejected") {
            filtered = filtered.filter((item) => item.status === "rejected" && !item.isCompleted);
        }

        // Поиск
        filtered = filtered.filter((item) => {
            const matchSearch = (item.title || "")
                    .toLowerCase()
                    .includes(submittedSearch.toLowerCase()) ||
                (item.companyName || "").toLowerCase().includes(submittedSearch.toLowerCase());
            return matchSearch;
        });

        // Фильтр по типу
        if (filters.type) {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        // Фильтр по формату
        if (filters.format) {
            filtered = filtered.filter(item => item.format === filters.format);
        }

        // Фильтр по городу
        if (filters.city) {
            filtered = filtered.filter(item =>
                item.city?.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        // Фильтр по тегам
        if (filters.tags.length > 0) {
            filtered = filtered.filter(item => {
                const itemTags = item.tags || [];
                const itemTagNames = itemTags.map(t => t.name || t);
                return filters.tags.some(filterTag =>
                    itemTagNames.some(itemTag =>
                        itemTag.toLowerCase().includes(filterTag.toLowerCase())
                    )
                );
            });
        }

        return filtered;
    }, [responses, submittedSearch, activeTab, filters]);

    const handleSearch = () => {
        setSubmittedSearch(search);
    };

    const handleOpenChat = async (event) => {
        try {
            const employerUserId = event.companyUserId;
            const companyId = event.companyId;

            if (!employerUserId) {
                console.error("No employerUserId found");
                alert("Не удалось определить работодателя для чата");
                return;
            }

            console.log("Открыть чат с работодателем (userId):", employerUserId);
            console.log("Company ID:", companyId);

            // Получаем данные компании по companyId
            let companyName = event.company || "Работодатель";
            let companyLogo = null;

            if (companyId) {
                try {
                    const company = await users.getCompany(companyId);
                    if (company) {
                        companyName = company.name;
                        companyLogo = company.logoUrl;
                    }
                } catch (err) {
                    console.error("Error fetching company:", err);
                }
            }

            const chat = await createOrGetChat(employerUserId);

            navigate(`/candidate/friends/chat/${chat.id}`, {
                state: {
                    candidateName: companyName,
                    candidateRole: event.title || "Вакансия",
                    candidateAvatar: getFullImageUrl(companyLogo),
                    eventTitle: event.title,
                    eventId: event.id
                }
            });
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат: " + (err.message || "Неизвестная ошибка"));
        }
    };

    const getEventCardVariant = (item) => {
        if (item.isCompleted) return 'closed';
        if (item.status === 'pending') return 'Chat';
        if (item.status === 'accepted') return 'Chat';
        if (item.status === 'reserve') return 'candidate';
        if (item.status === 'rejected') return 'closed';
        return 'candidate';
    };

    if (loading || tagsLoading) {
        return (
            <div className="page">
                <Header />
                <PageLoader />
            </div>
        );
    }

    const pendingCount = responses.filter(r => r.status === "pending" && !r.isCompleted).length;
    const acceptedCount = responses.filter(r => r.status === "accepted" && !r.isCompleted).length;
    const reserveCount = responses.filter(r => r.status === "reserve" && !r.isCompleted).length;
    const rejectedCount = responses.filter(r => r.status === "rejected" && !r.isCompleted).length;
    const historyCount = responses.filter(r => r.isCompleted === true).length;

    return (
        <div className="page">
            <Header />

            <HomeSearchBar
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
                onOpenFilters={() => setShowFilters(true)}
            />

            <div className="container">
                <div className="tabs">
                    <span
                        className={activeTab === "pending" ? "active" : ""}
                        onClick={() => setActiveTab("pending")}
                    >
                        На рассмотрении ({pendingCount})
                    </span>
                    <span
                        className={activeTab === "accepted" ? "active" : ""}
                        onClick={() => setActiveTab("accepted")}
                    >
                        Принятые ({acceptedCount})
                    </span>
                    <span
                        className={activeTab === "reserve" ? "active" : ""}
                        onClick={() => setActiveTab("reserve")}
                    >
                        Резерв ({reserveCount})
                    </span>
                    <span
                        className={activeTab === "rejected" ? "active" : ""}
                        onClick={() => setActiveTab("rejected")}
                    >
                        Отклоненные ({rejectedCount})
                    </span>
                    <span
                        className={activeTab === "history" ? "active" : ""}
                        onClick={() => setActiveTab("history")}
                    >
                        История ({historyCount})
                    </span>
                </div>

                <div className="grid">
                    {filteredResponses.map((item) => {
                        const eventForCard = {
                            id: item.possibilityId,
                            title: item.title,
                            description: item.description,
                            company: item.companyName,
                            companyId: item.companyId,
                            companyUserId: item.companyUserId,
                            address: item.city || item.address,
                            salary: item.salary,
                            date: item.date,
                            tags: item.tags || []
                        };

                        return (
                            <EventCard
                                key={item.responseId}
                                event={eventForCard}
                                variant={getEventCardVariant(item)}
                                messagesCount={0}
                                onOpenChat={() => handleOpenChat(eventForCard)}
                                isClosed={item.isCompleted || item.status === "rejected"}
                                onClick={() => navigate(`/candidate/event/${item.possibilityId}`)}
                            />
                        );
                    })}
                </div>

                {filteredResponses.length === 0 && (
                    <div className="empty-state-wrapper">
                        <div className="empty-state-card">
                            <div className="empty-icon">
                                {activeTab === "history" ? "📋" : "📝"}
                            </div>
                            <h3>
                                {activeTab === "history"
                                    ? "Нет завершенных мероприятий"
                                    : activeTab === "accepted"
                                        ? "Нет принятых откликов"
                                        : activeTab === "reserve"
                                            ? "Нет откликов в резерве"
                                            : activeTab === "rejected"
                                                ? "Нет отклоненных откликов"
                                                : "Нет откликов на рассмотрении"}
                            </h3>
                            <p>
                                {activeTab === "history"
                                    ? "Здесь будут отображаться завершенные мероприятия"
                                    : "Откликайтесь на события, чтобы они появились здесь"}
                            </p>
                            {activeTab !== "history" && (
                                <button
                                    className="primary"
                                    onClick={() => navigate("/")}
                                >
                                    Перейти к событиям
                                </button>
                            )}
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