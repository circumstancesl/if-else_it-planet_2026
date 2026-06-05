import { useState, useMemo, useEffect } from "react";
import Header from "../../components/Header/Header.jsx";
import EventCard from "../../components/EventCard";
import HomeSearchBar from "../../components/SearchBar/HomeSearchBar";
import { useNavigate } from "react-router-dom";
import { useResponses } from "../../api/useResponses";
import { useChat } from "../../api/useChat";
import "./CandidateResponses.css";

export default function CandidateResponses() {
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { getMyResponses } = useResponses();
    const { createOrGetChat } = useChat();

    useEffect(() => {
        loadResponses();
    }, []);

    const loadResponses = async () => {
        try {
            setLoading(true);
            const data = await getMyResponses();
            console.log("Responses data:", data);
            setResponses(data || []);
        } catch (err) {
            console.error("Error loading responses:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResponses = useMemo(() => {
        let filtered = responses;

        // Фильтрация по вкладке
        if (activeTab === "history") {
            filtered = filtered.filter((item) => item.isCompleted === true);
        } else if (activeTab === "pending") {
            filtered = filtered.filter((item) => item.status === "pending" && !item.isCompleted);
        } else if (activeTab === "accepted") {
            filtered = filtered.filter((item) => item.status === "accepted" && !item.isCompleted);
        } else if (activeTab === "reserve") {
            filtered = filtered.filter((item) => item.status === "reserve" && !item.isCompleted);
        } else if (activeTab === "rejected") {
            filtered = filtered.filter((item) => item.status === "rejected" && !item.isCompleted);
        }

        // Поиск
        return filtered.filter((item) => {
            const matchSearch = (item.title || "")
                    .toLowerCase()
                    .includes(submittedSearch.toLowerCase()) ||
                (item.companyName || "").toLowerCase().includes(submittedSearch.toLowerCase());
            return matchSearch;
        });
    }, [responses, submittedSearch, activeTab]);

    const handleSearch = () => {
        setSubmittedSearch(search);
    };

    const handleOpenChat = async (event) => {
        try {
            const employerUserId = event.companyUserId;

            if (!employerUserId) {
                console.error("No employerUserId found");
                alert("Не удалось определить работодателя для чата");
                return;
            }

            console.log("Открыть чат с работодателем (userId):", employerUserId);
            const chat = await createOrGetChat(employerUserId);
            navigate(`/candidate/chat/${chat.id}`);
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат: " + (err.message || "Неизвестная ошибка"));
        }
    };

    const getEventCardVariant = (item) => {
        // Для завершенных событий
        if (item.isCompleted) return 'closed';
        // Для активных
        if (item.status === 'pending') return 'Chat';
        if (item.status === 'accepted') return 'Chat';
        if (item.status === 'reserve') return 'candidate';
        if (item.status === 'rejected') return 'closed';
        return 'candidate';
    };

    if (loading) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка откликов...
                    </div>
                </div>
            </div>
        );
    }

    // Подсчет количества для вкладок
    const pendingCount = responses.filter(r => r.status === "pending" && !r.isCompleted).length;
    const acceptedCount = responses.filter(r => r.status === "accepted" && !r.isCompleted).length;
    const reserveCount = responses.filter(r => r.status === "reserve" && !r.isCompleted).length;
    const rejectedCount = responses.filter(r => r.status === "rejected" && !r.isCompleted).length;
    const historyCount = responses.filter(r => r.isCompleted === true).length;

    return (
        <div className="page">
            <Header />

            <HomeSearchBar
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
                onOpenFilters={() => setShowFilters(true)}
            />

            <div className="container">
                <div className="tabs">
                    <span
                        className={activeTab === "pending" ? "active" : ""}
                        onClick={() => setActiveTab("pending")}
                    >
                        На рассмотрении ({pendingCount})
                    </span>
                    <span
                        className={activeTab === "accepted" ? "active" : ""}
                        onClick={() => setActiveTab("accepted")}
                    >
                        Принятые ({acceptedCount})
                    </span>
                    <span
                        className={activeTab === "reserve" ? "active" : ""}
                        onClick={() => setActiveTab("reserve")}
                    >
                        Резерв ({reserveCount})
                    </span>
                    <span
                        className={activeTab === "rejected" ? "active" : ""}
                        onClick={() => setActiveTab("rejected")}
                    >
                        Отклоненные ({rejectedCount})
                    </span>
                    <span
                        className={activeTab === "history" ? "active" : ""}
                        onClick={() => setActiveTab("history")}
                    >
                        История ({historyCount})
                    </span>
                </div>

                <div className="grid">
                    {filteredResponses.map((item) => {
                        const eventForCard = {
                            id: item.possibilityId,
                            title: item.title,
                            description: item.description,
                            company: item.companyName,
                            companyId: item.companyId,
                            companyUserId: item.companyUserId,
                            address: item.city || item.address,
                            salary: item.salary,
                            date: item.date,
                            tags: item.tags || []
                        };

                        return (
                            <EventCard
                                key={item.responseId}
                                event={eventForCard}
                                variant={getEventCardVariant(item)}
                                messagesCount={0}
                                onOpenChat={() => handleOpenChat(eventForCard)}
                                isClosed={item.isCompleted || item.status === "rejected"}
                                onClick={() => navigate(`/candidate/event/${item.possibilityId}`)}
                            />
                        );
                    })}
                </div>

                {filteredResponses.length === 0 && (
                    <div className="empty-state">
                        <p>
                            {activeTab === "history"
                                ? "У вас пока нет завершенных мероприятий"
                                : "У вас пока нет откликов"}
                        </p>
                        {activeTab !== "history" && (
                            <button
                                className="primary"
                                onClick={() => navigate("/")}
                            >
                                Перейти к событиям
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}