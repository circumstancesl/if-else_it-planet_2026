import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../../../components/Header/Header.jsx";
import EventCard from "../../../components/EventCard.jsx";
import HomeSearchBar from "../../../components/SearchBar/HomeSearchBar.jsx";
import { useNavigate } from "react-router-dom";
import { usePossibilities } from "../../../api/usePossibilities";
import { useResponses } from "../../../api/useResponses";
import "./EmployerResponses.css";

export default function EmployerResponses() {
    const { getMyPossibilities, loading: eventsLoading } = usePossibilities();
    const { getResponsesForPossibility } = useResponses();

    const [events, setEvents] = useState([]);
    const [responsesCount, setResponsesCount] = useState({});
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const navigate = useNavigate();

    const loadEvents = useCallback(async () => {
        if (!initialLoad) return;

        try {
            setLoading(true);
            const data = await getMyPossibilities("published");
            const eventsData = data || [];
            setEvents(eventsData);

            const counts = {};
            for (const event of eventsData) {
                try {
                    const responses = await getResponsesForPossibility(event.id);
                    counts[event.id] = Array.isArray(responses) ? responses.length : 0;
                } catch (err) {
                    console.error(`Error loading responses for event ${event.id}:`, err);
                    counts[event.id] = 0;
                }
            }
            setResponsesCount(counts);
            setInitialLoad(false);
        } catch (err) {
            console.error(err);
            setEvents([]);
            setInitialLoad(false); // ← ВАЖНО: сбрасываем initialLoad даже при ошибке
        } finally {
            setLoading(false);
        }
    }, [getMyPossibilities, getResponsesForPossibility, initialLoad]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

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

    const filteredEvents = useMemo(() => {
        return normalizedEvents.filter((e) =>
            e.title.toLowerCase().includes(submittedSearch.toLowerCase())
        );
    }, [normalizedEvents, submittedSearch]);

    const handleSearch = () => {
        setSubmittedSearch(search);
    };

    const handleViewResponses = (event) => {
        navigate(`/employer/responses/${event.id}`);
    };

    if (loading || eventsLoading) {
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
                onSearch={handleSearch}
            />

            <div className="container">
                <div className="grid">
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            variant="responses"
                            responsesCount={event.responses}
                            onViewResponses={() => handleViewResponses(event)}
                        />
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="empty-state">
                        <p>Событий с откликами не найдено</p>
                    </div>
                )}
            </div>
        </div>
    );
}