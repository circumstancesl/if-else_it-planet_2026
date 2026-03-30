import { useState, useEffect } from "react";
import Header from "../../components/Header/Header.jsx";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import ChangeRightsModal from "../../components/curator/ChangeRightsModal.jsx";
import { useCurator } from "../../api/useCurator";
import "./CuratorUsers.css";

export default function CuratorUsers() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { getCompanies, updateCompanyStatus, loading: apiLoading } = useCurator();

    useEffect(() => {
        loadCompanies();
    }, [activeTab]);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            let status = null;
            if (activeTab === "verification") {
                status = "pending";
            } else if (activeTab === "employers") {
                // Для вкладки "Работодатели" показываем всех
                status = null;
            } else {
                status = null;
            }
            const data = await getCompanies(status);
            setCompanies(data);
        } catch (err) {
            console.error("Error loading companies:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company => {
        const searchTerm = search.toLowerCase();
        return (
            company.name?.toLowerCase().includes(searchTerm) ||
            company.inn?.includes(searchTerm)
        );
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return <span className="status verified">✓ Верифицирован</span>;
            case "pending":
                return <span className="status pending">● Ожидает проверки</span>;
            case "rejected":
                return <span className="status rejected">✕ Отклонен</span>;
            default:
                return null;
        }
    };

    const handleBlockCompany = async (companyId) => {
        if (window.confirm("Заблокировать компанию?")) {
            try {
                await updateCompanyStatus(companyId, "rejected");
                await loadCompanies();
                alert("Компания заблокирована");
            } catch (err) {
                alert("Ошибка при блокировке: " + err.message);
            }
        }
    };

    const handleChangeRights = (company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const handleSaveRights = async (companyId, newStatus) => {
        try {
            await updateCompanyStatus(companyId, newStatus);
            await loadCompanies();
            alert("Права успешно изменены");
        } catch (err) {
            alert("Ошибка при изменении прав: " + err.message);
        }
    };

    const renderCompanyCard = (company) => {
        return (
            <div key={company.id} className="user-card company-card">
                <div className="user-header">
                    <img
                        src="/img/employer.jpg"
                        alt={company.name}
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <h3>{company.name}</h3>
                        <p>ИНН: {company.inn || "Не указан"}</p>
                    </div>
                    {getStatusBadge(company.verification_status)}
                </div>

                <div className="user-actions">
                    <button
                        className="primary-small"
                        onClick={() => handleChangeRights(company)}
                    >
                        Изменить права
                    </button>
                    <button
                        className="reject-small"
                        onClick={() => handleBlockCompany(company.id)}
                    >
                        Заблокировать
                    </button>
                </div>
            </div>
        );
    };

    const getEmptyMessage = () => {
        if (activeTab === "verification") return "Нет компаний, ожидающих проверки";
        return "Компании не найдены";
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
            <SearchBar
                search={search}
                setSearch={setSearch}
                onSearch={() => {}}
                placeholder="Поиск по названию компании, ИНН"
                variant="default"
            />
            <div className="container">
                <div className="search-section">

                </div>

                <div className="tabs">
                    <span
                        className={`tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Все компании
                    </span>
                    <span
                        className={`tab ${activeTab === "employers" ? "active" : ""}`}
                        onClick={() => setActiveTab("employers")}
                    >
                        Работодатели
                    </span>
                    <span
                        className={`tab ${activeTab === "verification" ? "active" : ""}`}
                        onClick={() => setActiveTab("verification")}
                    >
                        На верификации
                    </span>
                </div>

                <div className="users-grid">
                    {filteredCompanies.length > 0 ? (
                        filteredCompanies.map(renderCompanyCard)
                    ) : (
                        <div className="empty-state">
                            <p>{getEmptyMessage()}</p>
                        </div>
                    )}
                </div>
            </div>

            <ChangeRightsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRights}
                company={selectedCompany}
            />
        </div>
    );
}