import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import HomeSearchBar from "../../../components/SearchBar/HomeSearchBar.jsx";
import CandidateCard from "../../../components/CandidateCard.jsx";
import { useResponses } from "../../../api/useResponses";
import { usePossibilities } from "../../../api/usePossibilities";
import { useUsers } from "../../../api/useUsers";
import "./EventCandidates.css";
import Breadcrumbs from "../../../components/Breadcrumbs.jsx";

export default function EventCandidates() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [event, setEvent] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const { getResponsesForPossibility, updateResponseStatus } = useResponses();
    const { getPossibilityById } = usePossibilities();
    const { getCandidateProfile } = useUsers();

    // Функция для получения полного URL изображения
    const getFullImageUrl = (url) => {
        if (!url) return "/img/default-avatar.jpg";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    const loadData = useCallback(async () => {
        if (!initialLoad) return;

        try {
            setLoading(true);

            const eventData = await getPossibilityById(eventId);
            setEvent(eventData || null);

            const responses = await getResponsesForPossibility(eventId);
            const responsesArray = Array.isArray(responses) ? responses : [];

            // Для каждого кандидата получаем полный профиль
            const candidatesData = [];
            for (const response of responsesArray) {
                const userId = response.User?.id || response.candidateId;

                try {
                    // Получаем полный профиль кандидата с тегами
                    const fullProfile = await getCandidateProfile(userId);

                    candidatesData.push({
                        id: userId,
                        responseId: response.id,
                        name: fullProfile?.fullName || "Неизвестно",
                        fullName: fullProfile?.fullName || "Неизвестно",
                        email: response.User?.email || "",
                        role: fullProfile?.jobTitle || "Соискатель",
                        skills: fullProfile?.skills || [],
                        tags: fullProfile?.Tags || [],
                        about: fullProfile?.about || "Нет информации",
                        phone: fullProfile?.phone || "",
                        telegram: fullProfile?.telegram || "",
                        status: response.status || "pending",
                        appliedAt: response.createdAt,
                        avatar: getFullImageUrl(fullProfile?.logoUrl) || "/img/default-avatar.jpg",
                    });
                } catch (err) {
                    console.error(`Error fetching full profile for ${userId}:`, err);
                    // Fallback: используем то, что есть
                    candidatesData.push({
                        id: userId,
                        responseId: response.id,
                        name: response.User?.fullName || "Неизвестно",
                        fullName: response.User?.fullName || "Неизвестно",
                        email: response.User?.email || "",
                        role: response.User?.role || "Соискатель",
                        skills: response.User?.skills || [],
                        tags: [],
                        about: "Нет информации",
                        phone: "",
                        telegram: "",
                        status: response.status || "pending",
                        appliedAt: response.createdAt,
                        avatar: "/img/default-avatar.jpg",
                    });
                }
            }

            console.log("Loaded candidates with full data:", candidatesData);
            setCandidates(candidatesData);
            setInitialLoad(false);
        } catch (err) {
            console.error("Error loading candidates:", err);
            setEvent(null);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    }, [eventId, getPossibilityById, getResponsesForPossibility, getCandidateProfile, initialLoad]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter((c) =>
            (c.fullName || "")
                .toLowerCase()
                .includes(submittedSearch.toLowerCase())
        );
    }, [candidates, submittedSearch]);

    const handleCandidateClick = (candidate) => {
        console.log("Navigating with candidate:", candidate);
        navigate(`/employer/responses/candidate/${candidate.id}`, {
            state: {
                candidate: candidate,
                responseId: candidate.responseId,
                status: candidate.status,
                eventId: eventId
            }
        });
    };

    const handleStatusChange = async (responseId, newStatus) => {
        try {
            setUpdating(true);
            await updateResponseStatus(responseId, newStatus);

            setCandidates(prev => prev.map(c =>
                c.responseId === responseId
                    ? { ...c, status: newStatus }
                    : c
            ));

            alert(`Статус отклика изменен на ${newStatus}`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Ошибка при изменении статуса");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
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

            <HomeSearchBar
                search={search}
                setSearch={setSearch}
                onSearch={() => setSubmittedSearch(search)}
            />

            <div className="container">
                <Breadcrumbs
                    backLabel={event?.title || "Событие"}
                    currentLabel="Кандидаты"
                    backPath="/employer/responses"
                />

                <div className="grid">
                    {filteredCandidates.map((candidate) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            status={candidate.status}
                            onStatusChange={(newStatus) =>
                                handleStatusChange(candidate.responseId, newStatus)
                            }
                            onClick={() => handleCandidateClick(candidate)}
                        />
                    ))}
                </div>

                {filteredCandidates.length === 0 && (
                    <div className="empty-state">
                        <p>Кандидаты не найдены</p>
                    </div>
                )}
            </div>
        </div>
    );
}