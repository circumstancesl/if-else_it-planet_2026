import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import HomeSearchBar from "../../../components/SearchBar/HomeSearchBar.jsx";
import CandidateCard from "../../../components/CandidateCard.jsx";
import { useResponses } from "../../../api/useResponses";
import { usePossibilities } from "../../../api/usePossibilities";
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

    const loadData = useCallback(async () => {
        if (!initialLoad) return;

        try {
            setLoading(true);

            const eventData = await getPossibilityById(eventId);
            setEvent(eventData || null);

            const responses = await getResponsesForPossibility(eventId);
            const responsesArray = Array.isArray(responses) ? responses : [];

            const candidatesData = responsesArray.map(response => ({
                id: response.User?.id || response.candidateId,
                responseId: response.id,
                name: response.User?.name || "Неизвестно",
                email: response.User?.email,
                role: response.User?.role || "Соискатель",
                skills: response.User?.skills || [],
                status: response.status || "pending",
                appliedAt: response.createdAt,
                avatar: response.User?.avatar || "/img/default-avatar.jpg"
            }));

            setCandidates(candidatesData);
            setInitialLoad(false);
        } catch (err) {
            console.error("Error loading candidates:", err);
            setEvent(null);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    }, [eventId, getPossibilityById, getResponsesForPossibility, initialLoad]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter((c) =>
            c.name.toLowerCase().includes(submittedSearch.toLowerCase())
        );
    }, [candidates, submittedSearch]);

    const handleCandidateClick = (candidate) => {
        navigate(`/employer/responses/candidate/${candidate.id}`, {
            state: { responseId: candidate.responseId, status: candidate.status }
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