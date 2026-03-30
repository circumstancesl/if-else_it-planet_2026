import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import CandidateCard from "../../../components/CandidateCard";
import "./CandidatePage.css";

const mockCandidates = [
    {
        id: 1,
        name: "Иванов Иван Иванович",
        role: "Графический дизайнер",
        skills: ["Figma", "Photoshop", "Canva", "Illustrator", "After Effects"],
        about: "Опыт работы 3 года. Занимался дизайном баннеров для крупных компаний. Создавал визуальные концепции для рекламных кампаний. Работал с такими брендами как ВТБ, Сбер, Яндекс.",
        status: "new",
        contacts: {
            phone: "+7 (999) 123-45-67",
            telegram: "@ivanov",
            email: "ivan@example.com"
        },
        portfolio: [
            { name: "Behance", url: "https://behance.net/ivanov" },
            { name: "Portfolio", url: "https://ivanov.ru" }
        ]
    },
    {
        id: 2,
        name: "Иванов Калина Петрович",
        role: "UI/UX дизайнер",
        skills: ["Figma", "Illustrator", "Sketch"],
        about: "Специализируюсь на мобильных приложениях. Разрабатывал интерфейсы для банковских приложений.",
        status: "new",
        contacts: {
            phone: "+7 (999) 234-56-78",
            telegram: "@petrov",
            email: "petr@example.com"
        },
        portfolio: [
            { name: "Behance", url: "https://behance.net/petrov" }
        ]
    },
];

export default function CandidatePage() {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otherCandidates, setOtherCandidates] = useState([]);
    const [actionStatus, setActionStatus] = useState(null); // 'accepted', 'reserved', 'rejected'

    useEffect(() => {
        const fetchCandidate = async () => {
            const found = mockCandidates.find(c => c.id === parseInt(candidateId));
            if (found) {
                setCandidate(found);
                setOtherCandidates(mockCandidates.filter(c => c.id !== parseInt(candidateId)));
                const savedStatus = localStorage.getItem(`candidate_${candidateId}_status`);
                if (savedStatus) {
                    setActionStatus(savedStatus);
                } else {
                    setActionStatus(null);
                }
            }
            setLoading(false);
        };
        fetchCandidate();
    }, [candidateId]);

    const handleAccept = () => {
        setActionStatus("accepted");
        localStorage.setItem(`candidate_${candidateId}_status`, "accepted");
        console.log("Принять кандидата:", candidate.name);
    };

    const handleReserve = () => {
        setActionStatus("reserved");
        localStorage.setItem(`candidate_${candidateId}_status`, "reserved");
        console.log("В резерв:", candidate.name);
    };

    const handleReject = () => {
        setActionStatus("rejected");
        localStorage.setItem(`candidate_${candidateId}_status`, "rejected");
        console.log("Отклонить:", candidate.name);
    };

    if (loading) {
        return (
            <div className="page">
                <Header />
                <div className="container">Загрузка...</div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <p>Кандидат не найден</p>
                    <button onClick={() => navigate(-1)}>Назад</button>
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
                    {/* ЛЕВЫЙ БЛОК */}
                    <div className="main">
                        {/* Левая колонка */}
                        <div className="avatar-section">
                            <div className="avatar big">
                                <img src="/img/candidate-page-avatar.jpg" alt="avatar" />
                            </div>

                            <div className="portfolio-text">Связаться:</div>

                            <div className="contact-icons">
                                <a href={`tel:${candidate.contacts.phone}`} className="icon-link">📞</a>
                                <a href={`https://t.me/${candidate.contacts.telegram}`} className="icon-link">💬</a>
                                <a href={`mailto:${candidate.contacts.email}`} className="icon-link">📧</a>
                            </div>

                            <div className="portfolio-text">Портфолио:</div>

                            <div className="portfolio-icons">
                                {candidate.portfolio.map((item, idx) => (
                                    <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Центральная колонка */}
                        <div className="info-section">
                            <h1>{candidate.name}</h1>
                            <p className="role">{candidate.role}</p>

                            <div className="skills-tags">
                                {candidate.skills.map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>

                            {/* Кнопки действий или статус */}
                            {!actionStatus ? (
                                <div className="action-buttons">
                                    <button className="primary" onClick={handleAccept}>Принять</button>
                                    <button className="secondary" onClick={handleReserve}>В резерв</button>
                                    <button className="reject" onClick={handleReject}>Отклонить</button>
                                </div>
                            ) : (
                                <div className={`status-message ${actionStatus}`}>
                                    {actionStatus === "accepted" && "✓ Принят"}
                                    {actionStatus === "reserved" && "⏳ В резерве"}
                                    {actionStatus === "rejected" && "✗ Отклонён"}
                                </div>
                            )}

                            <div className="inner-profile-section">
                                <h3>О себе</h3>
                                <p>{candidate.about}</p>
                            </div>
                            <div className="inner-profile-section">
                                <h3>Образование</h3>
                                <p>{candidate.about}</p>
                            </div>

                            <div className="inner-profile-section">
                                <h3>Навыки</h3>
                                <div className="skills-full">
                                    {candidate.skills.map((skill) => (
                                        <span key={skill} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ПРАВЫЙ БЛОК — ДРУГИЕ КАНДИДАТЫ */}
                    <div className="candidate-page-sidebar">
                        <h3>Другие соискатели по этой вакансии</h3>
                        {otherCandidates.length === 0 ? (
                            <p className="empty-other">Нет других кандидатов</p>
                        ) : (
                            otherCandidates.map((other) => (
                                <CandidateCard
                                    key={other.id}
                                    candidate={other}
                                    onClick={() => navigate(`/employer/responses/candidate/${other.id}`)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}