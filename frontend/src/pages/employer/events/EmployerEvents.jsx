import { useState, useMemo, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import EventCard from "../../../components/EventCard.jsx";
import EmployerSearchBar from "../../../components/SearchBar/EmployerSearchBar.jsx";
import { usePossibilities } from "../../../api/usePossibilities";
import { useNavigate } from "react-router-dom";
import "./EmployerEvents.css";
import PageLoader from "../../../components/PageLoader.jsx";

export default function EmployerEvents() {
    const { getMyPossibilities, loading } = usePossibilities();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");

    const handleEventClick = (event) => {
        navigate(`/employer/event/${event.id}`);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyPossibilities();
                setEvents(data);
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []); // ← пустой массив, без зависимостей

    const mapStatus = (status) => {
        switch (status) {
            case "published":
                return "active";
            case "draft":
                return "planned";
            case "archived":
                return "closed";
            default:
                return "active";
        }
    };

    const normalizedEvents = useMemo(() => {
        return events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description || "",
            status: mapStatus(e.status),
            company: "Моя компания",
            address: e.city || "Не указано",
            type: e.type,
            format: e.format,
            salary: e.salary,
            tags: e.Tags || [],
        }));
    }, [events]);

    const filteredEvents = useMemo(() => {
        return normalizedEvents.filter((e) => {
            const matchSearch = e.title
                .toLowerCase()
                .includes(submittedSearch.toLowerCase());
            const matchTab = tab === "all" ? true : e.status === tab;
            return matchSearch && matchTab;
        });
    }, [normalizedEvents, submittedSearch, tab]);

    const handleSearch = () => {
        setSubmittedSearch(search);
    };

    // Показываем загрузку только если нет событий и идет загрузка
    const showLoading = loading && events.length === 0;

    return (
        <div className="page">
            <Header />

            <EmployerSearchBar
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
            />

            <div className="container">
                <div className="tabs">
                    <span className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
                        Все
                    </span>
                    <span className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>
                        Активные
                    </span>
                    <span className={tab === "planned" ? "active" : ""} onClick={() => setTab("planned")}>
                        Запланированные
                    </span>
                    <span className={tab === "closed" ? "active" : ""} onClick={() => setTab("closed")}>
                        Закрытые
                    </span>
                </div>

                {showLoading ? (
                    <div className="page">
                        <Header />
                        <PageLoader />
                    </div>
                ) : (
                    <div className="grid">
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                variant="employer"
                                isClosed={event.status === "closed"}
                                onClick={handleEventClick}
                            />
                        ))}
                    </div>
                )}

                {!showLoading && filteredEvents.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        Нет событий
                    </div>
                )}
            </div>
        </div>
    );
}