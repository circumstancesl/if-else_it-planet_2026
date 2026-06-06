import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "../../../components/Header/Header.jsx";
import EventCard from "../../../components/EventCard";
import CandidateCard from "../../../components/CandidateCard";
import { usePossibilities } from "../../../api/usePossibilities";
import { useResponses } from "../../../api/useResponses";
import { users } from "../../../api/endpoints";
import { useUsers } from "../../../api/useUsers";
import "./EmployerProfile.css";

export default function EmployerProfile() {
    const navigate = useNavigate();
    const { getMyPossibilities, loading: eventsLoading } = usePossibilities();
    const { getResponsesForPossibility } = useResponses();
    const { getCandidateProfile } = useUsers();
    const [visibleCount, setVisibleCount] = useState(3);
    const [events, setEvents] = useState([]);
    const [responsesCount, setResponsesCount] = useState({});
    const [latestResponses, setLatestResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    // Данные компании из бэкенда
    const [company, setCompany] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(true);

    // Функция для получения полного URL изображения для компании
    const getCompanyImageUrl = (url) => {
        if (!url) return "/img/employer.jpg";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    // Функция для получения полного URL изображения для кандидата
    const getCandidateImageUrl = (url) => {
        if (!url) return "/img/jobseeker.jpg";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    // Загрузка профиля компании
    useEffect(() => {
        const loadCompany = async () => {
            try {
                const data = await users.getMyProfile();
                console.log("Company profile FULL:", data);
                console.log("Logo URL from backend:", data.profile.logoUrl);
                setCompany(data.profile);
            } catch (err) {
                console.error("Error loading company:", err);
            } finally {
                setCompanyLoading(false);
            }
        };
        loadCompany();
    }, []);

    const loadData = useCallback(async () => {
        if (!initialLoad) return;

        try {
            setLoading(true);
            const data = await getMyPossibilities("published");
            const eventsData = data || [];
            setEvents(eventsData);

            const counts = {};
            const allResponses = [];

            for (const event of eventsData) {
                try {
                    const responses = await getResponsesForPossibility(event.id);
                    const responsesArray = Array.isArray(responses) ? responses : [];
                    counts[event.id] = responsesArray.length;

                    if (responsesArray.length > 0) {
                        for (const response of responsesArray) {
                            const userId = response.User?.id || response.candidateId;
                            let fullProfile = null;
                            try {
                                fullProfile = await getCandidateProfile(userId);
                            } catch (err) {
                                console.error(`Error fetching profile for ${userId}:`, err);
                            }

                            allResponses.push({
                                ...response,
                                fullProfile: fullProfile,
                                eventTitle: event.title,
                                eventId: event.id
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Error loading responses for event ${event.id}:`, err);
                    counts[event.id] = 0;
                }
            }
            setResponsesCount(counts);

            const sortedResponses = allResponses.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setLatestResponses(sortedResponses.slice(0, 2));

            setInitialLoad(false);
        } catch (err) {
            console.error(err);
            setEvents([]);
            setInitialLoad(false);
        } finally {
            setLoading(false);
        }
    }, [getMyPossibilities, getResponsesForPossibility, getCandidateProfile, initialLoad]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const calculateVisible = () => {
            const width = window.innerWidth;
            if (width >= 1400) setVisibleCount(4);
            else if (width >= 1100) setVisibleCount(3);
            else if (width >= 768) setVisibleCount(2);
            else setVisibleCount(1);
        };

        calculateVisible();
        window.addEventListener("resize", calculateVisible);
        return () => window.removeEventListener("resize", calculateVisible);
    }, []);

    const normalizedEvents = useMemo(() => {
        return events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description || "",
            company: "Моя компания",
            address: e.city || "Не указано",
            type: e.type,
            format: e.format,
            salary: e.salary,
            tags: e.Tags || [],
            responses: responsesCount[e.id] || 0,
        }));
    }, [events, responsesCount]);

    const formattedResponses = useMemo(() => {
        return latestResponses.map(response => ({
            id: response.User?.id || response.candidateId,
            responseId: response.id,
            name: response.fullProfile?.fullName || response.User?.fullName || response.User?.name || "Неизвестно",
            fullName: response.fullProfile?.fullName || response.User?.fullName || response.User?.name || "Неизвестно",
            role: response.fullProfile?.jobTitle || response.User?.role || "Соискатель",
            skills: response.fullProfile?.skills || response.User?.skills || [],
            tags: response.fullProfile?.Tags || [],
            status: response.status || "pending",
            eventTitle: response.eventTitle,
            eventId: response.eventId,
            avatar: getCandidateImageUrl(response.fullProfile?.logoUrl) || getCandidateImageUrl(response.User?.avatar) || "/img/jobseeker.jpg"
        }));
    }, [latestResponses]);

    const visibleEvents = normalizedEvents.slice(0, visibleCount);

    const handleCreateEvent = () => {
        navigate("/employer/profile/create-event");
    };

    const handleViewAnalytics = () => {
        navigate("/employer/profile/analytics");
    };

    const handleEditProfile = () => {
        navigate("/employer/profile/edit");
    };

    const handleViewResponses = (event) => {
        navigate(`/employer/responses/${event.id}`);
    };

    const handleViewCandidate = (candidate) => {
        navigate(`/employer/responses/candidate/${candidate.id}`, {
            state: {
                responseId: candidate.responseId,
                status: candidate.status,
                eventId: candidate.eventId
            }
        });
    };

    if (loading || eventsLoading || companyLoading) {
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

    return (
        <div className="page">
            <Header />

            <div className="container">
                <div className="profile-header">
                    <div className="company-info">
                        <div className="company-avatar">
                            {company?.logoUrl ? (
                                <img
                                    src={getCompanyImageUrl(company.logoUrl)}
                                    alt={company.name}
                                    className="company-logo"
                                />
                            ) : (
                                <img
                                    src="/img/employer.jpg"
                                    alt="Company"
                                    className="company-logo"
                                />
                            )}
                        </div>
                        <div className="company-details">
                            <div className="company-name-row">
                                <h2>{company?.name || "Моя компания"}</h2>
                                {company?.verification_status === 'approved' && <span className="status verified">Верифицировано</span>}
                                {company?.verification_status === 'pending' && <span className="status pending">На верификации</span>}
                                {company?.verification_status === 'rejected' && <span className="status no-data">Отклонено</span>}
                                {!company?.verification_status && <span className="status no-data">Не верифицировано</span>}
                            </div>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="primary" onClick={handleCreateEvent}>
                            + Создать событие
                        </button>
                        <button className="secondary" onClick={handleViewAnalytics}>
                            Смотреть аналитику
                        </button>
                        <button className="secondary" onClick={handleEditProfile}>
                            Редактировать профиль
                        </button>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h3>Активные события</h3>
                        <span className="badge">{normalizedEvents.length}</span>
                    </div>

                    <div className="grid">
                        {visibleEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                variant="employer"
                                responsesCount={event.responses}
                                onViewResponses={() => handleViewResponses(event)}
                                onClick={() => navigate(`/employer/event/${event.id}`)}
                            />
                        ))}
                    </div>

                    <button
                        className="link-btn"
                        onClick={() => navigate("/employer/events")}
                    >
                        Смотреть все события →
                    </button>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h3>Последние отклики</h3>
                        <span className="badge">{formattedResponses.length}</span>
                    </div>

                    <div className="grid candidates-grid">
                        {formattedResponses.map((candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                status={candidate.status}
                                onClick={() => handleViewCandidate(candidate)}
                            />
                        ))}
                    </div>

                    <button
                        className="link-btn"
                        onClick={() => navigate("/employer/responses")}
                    >
                        Смотреть все отклики →
                    </button>
                </div>
            </div>
        </div>
    );
}