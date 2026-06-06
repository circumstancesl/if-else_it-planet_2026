// CandidatePage.jsx - обновленная версия с кнопкой генерации рекомендаций

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import CandidateCard from "../../../components/CandidateCard.jsx";
import { useResponses } from "../../../api/useResponses";
import { useUsers } from "../../../api/useUsers";
import { useChat } from "../../../api/useChat";
import { usePossibilities } from "../../../api/usePossibilities";
import "./CandidatePage.css";

export default function CandidatePage() {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Данные из state
    const responseIdFromState = location.state?.responseId;
    const statusFromState = location.state?.status;
    const eventIdFromState = location.state?.eventId;

    const { updateResponseStatus, getResponsesForPossibility, getResponseSummary } = useResponses();
    const { getCandidateProfile, loading: usersLoading } = useUsers();
    const { createOrGetChat } = useChat();
    const { getPossibilityById } = usePossibilities();

    const [candidate, setCandidate] = useState(null);
    const [event, setEvent] = useState(null);
    const [otherCandidates, setOtherCandidates] = useState([]);
    const [actionStatus, setActionStatus] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

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

    // Генерация рекомендаций
    // Генерация рекомендаций
    const handleGenerateRecommendations = async () => {
        if (!candidateId) return;

        setLoadingRecommendations(true);
        try {
            const summary = await getResponseSummary(candidateId);
            // Извлекаем summary из объекта, если это объект
            if (summary && typeof summary === 'object') {
                setRecommendations(summary.summary || summary.message || JSON.stringify(summary));
            } else {
                setRecommendations(summary);
            }
        } catch (err) {
            console.error("Error loading recommendations:", err);
            setRecommendations(null);
            alert("Не удалось загрузить рекомендации. Попробуйте позже.");
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Получаем профиль кандидата
            const data = await getCandidateProfile(candidateId);

            // 2. Если есть eventId, получаем вакансию и других кандидатов
            if (eventIdFromState) {
                const eventData = await getPossibilityById(eventIdFromState);
                setEvent(eventData);

                const responses = await getResponsesForPossibility(eventIdFromState);

                const otherCandidatesData = [];
                for (const response of responses) {
                    if (response.candidateId !== candidateId && response.candidateId) {
                        try {
                            const profile = await getCandidateProfile(response.candidateId);
                            otherCandidatesData.push({
                                id: response.candidateId,
                                responseId: response.id,
                                name: profile?.fullName || "Неизвестно",
                                fullName: profile?.fullName || "Неизвестно",
                                role: profile?.jobTitle || "Соискатель",
                                status: response.status,
                                tags: profile?.Tags || [],
                                avatar: getFullImageUrl(profile?.logoUrl) || "/img/jobseeker.jpg",
                                resumeURL: profile?.resumeURL || null
                            });
                        } catch (err) {
                            console.error("Error fetching other candidate:", err);
                            otherCandidatesData.push({
                                id: response.candidateId,
                                responseId: response.id,
                                name: "Неизвестно",
                                fullName: "Неизвестно",
                                role: "Соискатель",
                                status: response.status,
                                tags: [],
                                avatar: "/img/jobseeker.jpg",
                                resumeURL: null
                            });
                        }
                    }
                }
                setOtherCandidates(otherCandidatesData.slice(0, 3));
            }

            if (data) {
                setCandidate({
                    id: data.userId || data.id,
                    responseId: responseIdFromState,
                    name: data.fullName || data.name || "Пользователь",
                    role: data.jobTitle || data.role || "Соискатель",
                    skills: data.skills || [],
                    tags: data.Tags || [],
                    about: data.about || "Нет информации",
                    email: data.email || "",
                    phone: data.phone || "",
                    telegram: data.telegram || "",
                    status: statusFromState || "pending",
                    avatar: getFullImageUrl(data.logoUrl) || "/img/jobseeker.jpg",
                    portfolio: data.portfolio || [],
                    university: data.university || "",
                    graduationYear: data.graduationYear || "",
                    resumeURL: data.resumeURL || null
                });
                setActionStatus(statusFromState || "pending");
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [candidateId, eventIdFromState]);

    const handleStatusChange = async (newStatus) => {
        const currentResponseId = responseIdFromState || candidate?.responseId;

        if (!currentResponseId) {
            console.error("No responseId");
            alert("Не удалось определить ID отклика");
            return;
        }

        try {
            setUpdating(true);
            await updateResponseStatus(currentResponseId, newStatus);
            setActionStatus(newStatus);
            setCandidate(prev => prev ? { ...prev, status: newStatus } : prev);

            const statusMessages = {
                accepted: "Принят",
                reserve: "В резерве",
                rejected: "Отклонен",
                pending: "На рассмотрении"
            };
            alert(`Статус кандидата изменен на ${statusMessages[newStatus] || newStatus}`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Ошибка при изменении статуса: " + (err.message || "Неизвестная ошибка"));
        } finally {
            setUpdating(false);
        }
    };

    const handleAccept = () => handleStatusChange('accepted');
    const handleReserve = () => handleStatusChange('reserve');
    const handleReject = () => handleStatusChange('rejected');

    const handleMessage = async () => {
        try {
            const chat = await createOrGetChat(candidateId);
            navigate(`/candidate/chat/${chat.id}`, {
                state: {
                    candidateName: candidate?.name,
                    candidateRole: candidate?.role,
                    candidateAvatar: candidate?.avatar,
                    eventTitle: event?.title,
                    eventId: eventIdFromState
                }
            });
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат: " + (err.message || "Неизвестная ошибка"));
        }
    };

    const getStatusText = () => {
        switch(actionStatus) {
            case 'accepted': return 'Принят';
            case 'reserve': return 'В резерве';
            case 'rejected': return 'Отклонён';
            case 'pending': return 'На рассмотрении';
            default: return 'На рассмотрении';
        }
    };

    const technologyTags = candidate?.tags?.filter(tag => tag.type === 'technology') || [];
    const levelTags = candidate?.tags?.filter(tag => tag.type === 'level') || [];

    const handleOtherCandidateClick = (otherCandidate) => {
        navigate(`/employer/responses/candidate/${otherCandidate.id}`, {
            state: {
                candidate: otherCandidate,
                responseId: otherCandidate.responseId,
                status: otherCandidate.status,
                eventId: eventIdFromState
            }
        });
        window.location.reload();
    };

    if (loading || usersLoading) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка...
                    </div>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>Кандидат не найден</p>
                        <button className="back-btn" onClick={() => navigate(-1)}>Назад</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Header />

            <div className="container candidate-page">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Назад
                </button>

                <div className="candidate-layout">
                    <div className="main">
                        <div className="avatar-section">
                            <div className="avatar big">
                                <img
                                    src={candidate.avatar}
                                    alt="avatar"
                                    onError={(e) => { e.target.src = "/img/jobseeker.jpg"; }}
                                />
                            </div>

                            <div className="contact-icons">
                                {candidate.phone && (
                                    <a href={`tel:${candidate.phone}`} className="icon-link">📞</a>
                                )}
                                {candidate.telegram && (
                                    <a href={`https://t.me/${candidate.telegram.replace('@', '')}`} className="icon-link">💬</a>
                                )}
                                {candidate.email && (
                                    <a href={`mailto:${candidate.email}`} className="icon-link">📧</a>
                                )}
                            </div>

                            <button className="contact-btn" onClick={handleMessage}>
                                Сообщение
                            </button>

                            {candidate.portfolio && candidate.portfolio.length > 0 && (
                                <>
                                    <div className="portfolio-text">Портфолио:</div>
                                    <div className="portfolio-icons">
                                        {candidate.portfolio.map((item, idx) => (
                                            <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="info-section">
                            <h1>{candidate.name}</h1>
                            <p className="role">{candidate.role}</p>

                            <div className="skills-tags">
                                {levelTags.map((tag) => (
                                    <span key={tag.id} className="skill-tag">{tag.name}</span>
                                ))}
                            </div>

                            {/* Статус + Вакансия в одном стиле */}
                            <div className="info-row">
                                <div className="info-item">
                                    <span className="info-label">Вакансия:</span>
                                    <span className="info-value">{event?.title || "Не указана"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Текущий статус:</span>
                                    <span className="info-value">{getStatusText()}</span>
                                </div>
                            </div>

                            <div className="candidate-page-action-buttons">
                                <button
                                    className="primary"
                                    onClick={handleAccept}
                                    disabled={updating || actionStatus === 'accepted'}
                                >
                                    {updating ? "Сохранение..." : "Принять"}
                                </button>
                                <button
                                    className="secondary"
                                    onClick={handleReserve}
                                    disabled={updating || actionStatus === 'reserve'}
                                >
                                    {updating ? "Сохранение..." : "В резерв"}
                                </button>
                                <button
                                    className="reject"
                                    onClick={handleReject}
                                    disabled={updating || actionStatus === 'rejected'}
                                >
                                    {updating ? "Сохранение..." : "Отклонить"}
                                </button>
                            </div>

                            <div className="inner-profile-section">
                                <h3>О себе</h3>
                                <p>{candidate.about || "Нет информации"}</p>
                            </div>

                            {(candidate.university || candidate.graduationYear) && (
                                <div className="inner-profile-section">
                                    <h3>Образование</h3>
                                    <p>
                                        {candidate.university}
                                        {candidate.graduationYear && `, ${candidate.graduationYear}`}
                                    </p>
                                </div>
                            )}

                            <div className="inner-profile-section">
                                <h3>Навыки</h3>
                                <div className="skills-full">
                                    {technologyTags.length > 0 ? (
                                        technologyTags.map(tag => (
                                            <span key={tag.id} className="skill-tag">{tag.name}</span>
                                        ))
                                    ) : (
                                        candidate.skills?.map((skill, idx) => (
                                            <span key={idx} className="skill-tag">{skill}</span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Блок рекомендаций с кнопкой-плеером */}
                            <div className="inner-profile-section">
                                <div className="recommendations-header">
                                    <div className="recommendations-title-group">
                                        <h3>Рекомендации</h3>
                                        <span className="ai-badge">AI</span>
                                    </div>
                                    <button
                                        className={`recommendations-btn ${loadingRecommendations ? 'loading' : ''}`}
                                        onClick={handleGenerateRecommendations}
                                        disabled={loadingRecommendations}
                                        title="Сгенерировать рекомендации с помощью ИИ"
                                    >
                                        {loadingRecommendations ? (
                                            <span className="btn-spinner"></span>
                                        ) : (
                                            <svg className="play-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {loadingRecommendations ? (
                                    <p className="recommendations-loading">ИИ анализирует профиль кандидата...</p>
                                ) : recommendations ? (
                                    <div className="recommendations-content">
                                        <p>{recommendations}</p>
                                    </div>
                                ) : (
                                    <p className="recommendations-empty">
                                        Нажмите ▶, чтобы получить рекомендации от ИИ по кандидату
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="candidate-page-sidebar">
                        <h3>Другие соискатели</h3>
                        {otherCandidates.length > 0 ? (
                            <div className="other-candidates-list">
                                {otherCandidates.map((other) => (
                                    <CandidateCard
                                        key={other.id}
                                        candidate={other}
                                        status={other.status}
                                        showButton={true}
                                        buttonText="Смотреть резюме"
                                        onClick={() => handleOtherCandidateClick(other)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="empty-other">Нет других кандидатов</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}