import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header/Header.jsx";
import { apiClient } from "../api/client";
import ReactMarkdown from "react-markdown";
import "./EventPage.css";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { useFavorites } from "../api/useFavorites";
import { useResponses } from "../api/useResponses";
import { useAuth } from "../context/AuthContext.jsx";
import EventCard from "../components/EventCard";
import { useUsers } from "../api/useUsers";

export default function EventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { applyToPossibility, loading: responseLoading } = useResponses();
    const { getCandidateProfile } = useUsers();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [companyEvents, setCompanyEvents] = useState([]);
    const [sidebarLoading, setSidebarLoading] = useState(false);

    const isEmployer = user?.role === "employer";
    const isCandidate = user?.role === "candidate";

    const formatMap = {
        hybrid: "Гибрид",
        remote: "Удалённо",
        office: "Офис",
    };

    const typeMap = {
        internship: "Стажировка",
        vacancy: "Вакансия",
        mentorship: "Практика",
        event: "Мероприятие",
    };

    const getBackPath = () => {
        if (!user) return "/";
        switch (user.role) {
            case "employer":
                return "/employer/events";
            case "candidate":
                return "/";
            default:
                return "/";
        }
    };

    const getBackLabel = () => {
        if (!user) return "Главная";
        switch (user.role) {
            case "employer":
                return "Активные события";
            case "candidate":
                return "Все события";
            default:
                return "Главная";
        }
    };

    useEffect(() => {
        const loadPage = async () => {
            try {
                setLoading(true);

                const possibility = await apiClient.get(
                    `/api/possibility/${eventId}`
                );
                setEvent(possibility);

                // Работодатель - загружаем кандидатов с тегами
                if (isEmployer) {
                    setSidebarLoading(true);
                    try {
                        const responses = await apiClient.get(
                            `/api/response/${eventId}`
                        );

                        // Получаем полные профили кандидатов с тегами
                        const mappedCandidates = [];
                        for (const response of responses) {
                            const userId = response.User?.id || response.candidateId;
                            let fullProfile = null;
                            try {
                                fullProfile = await getCandidateProfile(userId);
                            } catch (err) {
                                console.error(`Error fetching profile for ${userId}:`, err);
                            }

                            mappedCandidates.push({
                                id: userId,
                                responseId: response.id,
                                name: fullProfile?.fullName || response.User?.fullName || response.User?.name || "Неизвестный кандидат",
                                role: fullProfile?.jobTitle || response.User?.role || "Соискатель",
                                skills: fullProfile?.skills || response.User?.skills || [],
                                tags: fullProfile?.Tags || [], // ← ДОБАВЛЯЕМ ТЕГИ
                                status: response.status || "pending",
                                avatar: fullProfile?.avatar || response.User?.avatar || "/img/default-avatar.jpg",
                            });
                        }
                        setCandidates(mappedCandidates);
                    } catch (err) {
                        console.error("Ошибка загрузки откликов", err);
                        setCandidates([]);
                    } finally {
                        setSidebarLoading(false);
                    }
                }

                // Соискатель - загружаем другие мероприятия этой же компании
                if (isCandidate && possibility?.company?.id) {
                    setSidebarLoading(true);
                    try {
                        const companyEventsData = await apiClient.get(
                            `/api/possibility/company/${possibility.company.id}?limit=3&offset=0`
                        );
                        const filtered = (companyEventsData || []).filter(
                            (item) => item.id !== eventId
                        );
                        setCompanyEvents(filtered.slice(0, 3));
                    } catch (err) {
                        console.error("Ошибка загрузки мероприятий компании", err);
                        setCompanyEvents([]);
                    } finally {
                        setSidebarLoading(false);
                    }
                }
            } catch (err) {
                console.error("Ошибка загрузки события", err);
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [eventId, isEmployer, isCandidate, getCandidateProfile]);

    const handleApply = async () => {
        try {
            await applyToPossibility(eventId);
            setHasApplied(true);
            alert("Отклик успешно отправлен!");
        } catch (err) {
            if (err.message === "Вы уже откликались") {
                setHasApplied(true);
                alert("Вы уже откликались");
            } else {
                alert("Ошибка при отправке отклика: " + err.message);
            }
        }
    };

    const handleToggleFavorite = async () => {
        if (!event) return;
        await toggleFavorite(event.id, "possibility");
    };

    if (loading) {
        return (
            <div className="page">
                <Header />
                <div className="container">Загрузка...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="page">
                <Header />
                <div className="container">Событие не найдено</div>
            </div>
        );
    }

    return (
        <div className="page">
            <Header />

            <div className="container event-page">
                <Breadcrumbs
                    backLabel={getBackLabel()}
                    currentLabel={event.title}
                    backPath={getBackPath()}
                />

                <div className="event-layout">
                    <div className="main-content">
                        <div className="event-header">
                            <h1>{event.title}</h1>

                            {event.salary && (
                                <p className="salary">
                                    От {event.salary} ₽ за месяц, на руки
                                </p>
                            )}

                            <div className="tags">
                                {event.tags?.map((tag) => (
                                    <span key={tag.id} className="tag">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>

                            <div className="meta-info">
                                <div className="meta-row">
                                    <div className="meta-label">Формат работы:</div>
                                    <div className="meta-value">{formatMap[event.format] || event.format}</div>
                                </div>
                                <div className="meta-row">
                                    <div className="meta-label">Тип:</div>
                                    <div className="meta-value">{typeMap[event.type] || event.type}</div>
                                </div>
                                <div className="meta-row">
                                    <div className="meta-label">Компания:</div>
                                    <div className="meta-value">
                                        {event.company?.name || "Не указана"}
                                        <span className="verified"> ✔</span>
                                    </div>
                                </div>
                                <div className="meta-row">
                                    <div className="meta-label">Город:</div>
                                    <div className="meta-value">{event.city || "Не указан"}</div>
                                </div>
                                {event.address && (
                                    <div className="meta-row">
                                        <div className="meta-label">Адрес:</div>
                                        <div className="meta-value">{event.address}</div>
                                    </div>
                                )}
                            </div>

                            {isCandidate && (
                                <div className="action-buttons">
                                    <button
                                        className="primary"
                                        onClick={handleApply}
                                        disabled={hasApplied || responseLoading}
                                    >
                                        {responseLoading
                                            ? "Отправка..."
                                            : hasApplied
                                                ? "Отклик отправлен"
                                                : "Откликнуться"}
                                    </button>

                                    <button
                                        className={`secondary ${
                                            isFavorite(event.id)
                                                ? "favorite-active"
                                                : ""
                                        }`}
                                        onClick={handleToggleFavorite}
                                    >
                                        {isFavorite(event.id)
                                            ? "В избранном"
                                            : "В избранное"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="markdown-content">
                            <ReactMarkdown>
                                {event.description || "Нет описания"}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="sidebar">
                        {/* Работодатель */}
                        {isEmployer && (
                            <>
                                <h3>Соискатели по этой вакансии</h3>
                                {sidebarLoading ? (
                                    <p className="empty">Загрузка...</p>
                                ) : candidates.length === 0 ? (
                                    <p className="empty">Пока нет откликов</p>
                                ) : (
                                    candidates.map((candidate) => (
                                        <div key={candidate.id} className="candidate-card-sidebar">
                                            <div className="candidate-header">
                                                <img
                                                    src={candidate.avatar}
                                                    alt={candidate.name}
                                                    className="candidate-avatar"
                                                />
                                                <div>
                                                    <h4>{candidate.name}</h4>
                                                    <p className="role">{candidate.role}</p>
                                                </div>
                                            </div>
                                            {/* Теги кандидата */}
                                            {candidate.tags && candidate.tags.length > 0 && (
                                                <div className="candidate-tags">
                                                    {candidate.tags.slice(0, 3).map((tag) => (
                                                        <span key={tag.id} className="tag">{tag.name}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Запасной вариант - skills */}
                                            {(!candidate.tags || candidate.tags.length === 0) && candidate.skills && candidate.skills.length > 0 && (
                                                <div className="candidate-tags">
                                                    {candidate.skills.slice(0, 3).map((skill, i) => (
                                                        <span key={i} className="tag">{skill}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                className="primary"
                                                onClick={() =>
                                                    navigate(
                                                        `/employer/responses/candidate/${candidate.id}`,
                                                        {
                                                            state: {
                                                                responseId: candidate.responseId,
                                                                status: candidate.status,
                                                            },
                                                        }
                                                    )
                                                }
                                            >
                                                Смотреть резюме
                                            </button>
                                        </div>
                                    ))
                                )}
                            </>
                        )}

                        {/* Соискатель - другие мероприятия компании */}
                        {isCandidate && (
                            <>
                                <h3>Другие мероприятия компании</h3>
                                {sidebarLoading ? (
                                    <p className="empty">Загрузка...</p>
                                ) : companyEvents.length === 0 ? (
                                    <p className="empty">Нет других мероприятий</p>
                                ) : (
                                    <div className="similar-events-list">
                                        {companyEvents.map((item) => (
                                            <EventCard
                                                key={item.id}
                                                event={{
                                                    ...item,
                                                    tags: item.tags || item.Tags || [],
                                                    company: typeof item.company === 'object'
                                                        ? item.company?.name
                                                        : item.company || event.company?.name || "Компания"
                                                }}
                                                variant="candidate"
                                                onClick={() => navigate(`/candidate/event/${item.id}`)}
                                                onToggleFavorite={toggleFavorite}
                                                isFavorite={isFavorite(item.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}