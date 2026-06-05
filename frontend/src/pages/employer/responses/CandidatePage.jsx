import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import { useResponses } from "../../../api/useResponses";
import { useUsers } from "../../../api/useUsers";
import { useChat } from "../../../api/useChat";
import "./CandidatePage.css";

export default function CandidatePage() {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Данные из state (только для статуса и responseId)
    const responseIdFromState = location.state?.responseId;
    const statusFromState = location.state?.status;

    const { updateResponseStatus } = useResponses();
    const { getCandidateProfile, loading: usersLoading } = useUsers();
    const { createOrGetChat } = useChat();

    const [candidate, setCandidate] = useState(null);
    const [actionStatus, setActionStatus] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidateProfile = async () => {
            try {
                setLoading(true);

                console.log("Fetching candidate profile from API:", candidateId);
                const data = await getCandidateProfile(candidateId);
                console.log("Candidate data from API:", data);

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
                        avatar: data.avatar || "/img/default-avatar.jpg",
                        portfolio: data.portfolio || [],
                        university: data.university || "",
                        graduationYear: data.graduationYear || ""
                    });
                    setActionStatus(statusFromState || "pending");
                }
            } catch (err) {
                console.error("Error fetching candidate profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateProfile();
    }, [candidateId, responseIdFromState, statusFromState, getCandidateProfile]);

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
    const handlePending = () => handleStatusChange('pending');

    const handleMessage = async () => {
        try {
            const chat = await createOrGetChat(candidateId);
            navigate(`/candidate/chat/${chat.id}`);
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат: " + (err.message || "Неизвестная ошибка"));
        }
    };

    const getStatusText = () => {
        switch(actionStatus) {
            case 'accepted': return '✓ Принят';
            case 'reserve': return '⏳ В резерве';
            case 'rejected': return '✗ Отклонён';
            case 'pending': return '⏺ На рассмотрении';
            default: return '⏺ На рассмотрении';
        }
    };

    // Получаем теги по типам
    const technologyTags = candidate?.tags?.filter(tag => tag.type === 'technology') || [];
    const levelTags = candidate?.tags?.filter(tag => tag.type === 'level') || [];

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
                                    onError={(e) => { e.target.src = "/img/default-avatar.jpg"; }}
                                />
                            </div>

                            <div className="portfolio-text">Связаться:</div>

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

                            {/* Уровень - в том же стиле, что и технологии снизу */}
                            <div className="skills-tags">
                                {levelTags.map((tag) => (
                                    <span key={tag.id} className="skill-tag">{tag.name}</span>
                                ))}
                            </div>

                            {/* Кнопка "Написать сообщение" */}
                            <div className="action-buttons">
                                <button className="btn-accept" onClick={handleMessage}>
                                    💬 Написать сообщение
                                </button>
                            </div>

                            {/* Текущий статус */}
                            <div className="candidate-page-current-status">
                                <span className="candidate-page-status-label">Текущий статус:</span>
                                <span className={`candidate-page-status-badge ${actionStatus}`}>
                                    {getStatusText()}
                                </span>
                            </div>

                            {/* Кнопки изменения статуса */}
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
                                <button
                                    className="secondary"
                                    onClick={handlePending}
                                    disabled={updating || actionStatus === 'pending'}
                                >
                                    {updating ? "Сохранение..." : "На рассмотрение"}
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
                        </div>
                    </div>

                    <div className="candidate-page-sidebar">
                        <h3>Другие соискатели</h3>
                        <p className="empty-other">Нет других кандидатов</p>
                    </div>
                </div>
            </div>
        </div>
    );
}