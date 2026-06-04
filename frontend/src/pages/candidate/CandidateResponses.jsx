import { useState, useMemo, useEffect } from "react";
import Header from "../../components/Header/Header.jsx";
import EventCard from "../../components/EventCard";
import HomeSearchBar from "../../components/SearchBar/HomeSearchBar";
import { useNavigate } from "react-router-dom";
import { useResponses } from "../../api/useResponses";
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

    const statusMap = {
        pending: "Активные",
        accepted: "Принятые",
        rejected: "Отклоненные",
        reserve: "Резерв"
    };

    useEffect(() => {
        loadResponses();
    }, []);

    const loadResponses = async () => {
        try {
            setLoading(true);
            const data = await getMyResponses();
            setResponses(data || []);
        } catch (err) {
            console.error("Error loading responses:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResponses = useMemo(() => {
        return responses.filter((item) => {
            const matchStatus = activeTab === "all" ? true : item.status === activeTab;
            const matchSearch = item.title
                    .toLowerCase()
                    .includes(submittedSearch.toLowerCase()) ||
                item.companyName?.toLowerCase().includes(submittedSearch.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [responses, submittedSearch, activeTab]);

    const handleSearch = () => {
        setSubmittedSearch(search);
    };

    const handleOpenChat = (event) => {
        console.log("Открыть чат с:", event.title);
        navigate(`/candidate/chat/${event.id}`);
    };

    const getEventCardVariant = (status) => {
        if (status === 'pending') return 'Chat';
        if (status === 'accepted') return 'candidate';
        if (status === 'rejected') return 'closed';
        if (status === 'reserve') return 'candidate';
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
                        На рассмотрении
                    </span>
                    <span
                        className={activeTab === "accepted" ? "active" : ""}
                        onClick={() => setActiveTab("accepted")}
                    >
                        Принятые
                    </span>
                    <span
                        className={activeTab === "reserve" ? "active" : ""}
                        onClick={() => setActiveTab("reserve")}
                    >
                        Резерв
                    </span>
                    <span
                        className={activeTab === "rejected" ? "active" : ""}
                        onClick={() => setActiveTab("rejected")}
                    >
                        Отклоненные
                    </span>
                </div>

                <div className="grid">
                    {filteredResponses.map((item) => {
                        const eventForCard = {
                            id: item.possibilityId,
                            title: item.title,
                            description: item.description,
                            company: item.companyName,
                            address: item.city || item.address,
                            salary: item.salary,
                            tags: item.tags || []
                        };

                        return (
                            <EventCard
                                key={item.responseId}
                                event={eventForCard}
                                variant={getEventCardVariant(item.status)}
                                messagesCount={0}
                                onOpenChat={handleOpenChat}
                                isClosed={item.status === "rejected"}
                                onClick={() => navigate(`/candidate/event/${item.possibilityId}`)}
                            />
                        );
                    })}
                </div>

                {filteredResponses.length === 0 && (
                    <div className="empty-state">
                        <p>У вас пока нет откликов</p>
                        <button
                            className="primary"
                            onClick={() => navigate("/")}
                        >
                            Перейти к событиям
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}