import {useParams, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import Header from "../components/Header/Header.jsx";
import {apiClient} from "../api/client";
import ReactMarkdown from "react-markdown";
import "./EventPage.css";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {useFavorites} from "../api/useFavorites";
import {useResponses} from "../api/useResponses";
import {useAuth} from "../context/AuthContext.jsx";

export default function EventPage() {
    const {eventId} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {isFavorite, toggleFavorite} = useFavorites();
    const {applyToPossibility, loading: responseLoading} = useResponses();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);
    const [candidates, setCandidates] = useState([]);

    const getBackPath = () => {
        if (!user) return "/";

        switch(user.role) {
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

        switch(user.role) {
            case "employer":
                return "Активные события";
            case "candidate":
                return "Все события";
            default:
                return "Главная";
        }
    };

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

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiClient.get(`/api/possibility/${eventId}`);
                setEvent(data);

                setCandidates([
                    {
                        id: 1,
                        name: "Иванов Иван Иванович",
                        role: "Графический дизайнер",
                        skills: ["Figma", "Photoshop", "Canva"],
                        avatar: "/img/default-avatar.jpg"
                    },
                    {
                        id: 2,
                        name: "Смирнова Анна Сергеевна",
                        role: "Frontend-разработчик",
                        skills: ["React", "TypeScript", "Figma"],
                        avatar: "/img/default-avatar.jpg"
                    }
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [eventId]);

    const handleApply = async () => {
        try {
            await applyToPossibility(eventId);
            setHasApplied(true);
            alert("Отклик успешно отправлен!");
        } catch (err) {
            if (err.message === "Вы уже откликались") {
                setHasApplied(true);
                alert("Вы уже откликались на эту вакансию");
            } else {
                alert("Ошибка при отправке отклика: " + err.message);
            }
        }
    };

    const handleToggleFavorite = async () => {
        if (event) {
            await toggleFavorite(event.id, 'possibility');
        }
    };

    if (loading) {
        return (
            <div className="page">
                <Header/>
                <div className="container">Загрузка...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="page">
                <Header/>
                <div className="container">Событие не найдено</div>
            </div>
        );
    }

    return (
        <div className="page">
            <Header/>

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
                                    <span key={tag.id} className="tag">{tag.name}</span>
                                ))}
                            </div>

                            <div className="meta-info">
                                <p>
                                    <strong>Формат работы:</strong> {formatMap[event.format] || event.format}
                                </p>
                                <p>
                                    <strong>Тип:</strong> {typeMap[event.type] || event.type}
                                </p>
                                <p>
                                    <strong>Компания:</strong> {event.company?.name || "Не указана"}
                                    <span className="verified"> ✔</span>
                                </p>
                                <p>
                                    <strong>Город:</strong> {event.city || "Не указан"}
                                </p>
                                {event.address && (
                                    <p>
                                        <strong>Адрес:</strong> {event.address}
                                    </p>
                                )}
                            </div>

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
                                            : "Откликнуться"
                                    }
                                </button>
                                <button
                                    className={`secondary ${isFavorite(event.id) ? "favorite-active" : ""}`}
                                    onClick={handleToggleFavorite}
                                >
                                    {isFavorite(event.id) ? "В избранном" : "В избранное"}
                                </button>
                            </div>
                        </div>

                        <div className="markdown-content">
                            <ReactMarkdown>
                                {event.description || "Нет описания"}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="sidebar">
                        <h3>Соискатели по этой вакансии</h3>

                        {candidates.length === 0 ? (
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

                                    <div className="candidate-tags">
                                        {candidate.skills.map((skill, i) => (
                                            <span key={i} className="tag">{skill}</span>
                                        ))}
                                    </div>

                                    <button
                                        className="primary"
                                        onClick={() => navigate(`/employer/responses/candidate/${candidate.id}`)}
                                    >
                                        Смотреть резюме
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}