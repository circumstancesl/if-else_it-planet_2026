import { useState, useEffect } from "react";
import Header from "../../components/Header/Header.jsx";
import CuratorSearchBar from "../../components/SearchBar/CuratorSearchBar.jsx";
import CreateCuratorModal from "../../components/curator/CreateCuratorModal.jsx";
import { useAdmin } from "../../api/useAdmin";
import "./CuratorsAdmin.css";

export default function CuratorsAdmin() {
    const [curators, setCurators] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const { getCurators, createCurator, deleteCurator, loading: apiLoading } = useAdmin();

    // Загрузка списка кураторов
    useEffect(() => {
        loadCurators();
    }, []);

    const loadCurators = async () => {
        try {
            setLoading(true);
            const data = await getCurators();
            setCurators(data);
        } catch (err) {
            console.error("Error loading curators:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCurators = curators.filter(c =>
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm("Удалить куратора?")) {
            try {
                await deleteCurator(id);
                await loadCurators(); // Обновляем список
                alert("Куратор удален");
            } catch (err) {
                alert("Ошибка при удалении: " + err.message);
            }
        }
    };

    const handleChangeRights = (id) => {
        alert(`Изменение прав для куратора #${id}`);
    };

    const handleCreateCurator = async (newCurator) => {
        try {
            // Используем email из формы
            await createCurator(
                newCurator.email,      // 👈 email из формы
                newCurator.password,
                newCurator.fullName
            );
            await loadCurators();
            alert(`Куратор ${newCurator.fullName} успешно создан!`);
        } catch (err) {
            alert("Ошибка при создании: " + err.message);
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

            <div className="container">
                <div className="top-panel">
                    <CuratorSearchBar
                        search={search}
                        setSearch={setSearch}
                        onSearch={() => {}}
                        onOpenCreate={() => setIsModalOpen(true)}
                    />
                </div>

                <div className="section">
                    <h3 className="section-title">Кураторы</h3>

                    <div className="curators-grid">
                        {filteredCurators.length > 0 ? (
                            filteredCurators.map((curator) => (
                                <div key={curator.id} className="curator-card">
                                    <div className="curator-info">
                                        <img
                                            src="/img/mentor.jpg"
                                            alt={curator.name}
                                            className="curator-avatar"
                                        />
                                        <div>
                                            <div className="curator-role">{curator.name || 'Куратор'}</div>
                                            <div className="curator-email">{curator.email}</div>
                                            <div className="curator-role-badge">Роль: {curator.role}</div>
                                        </div>
                                    </div>

                                    <div className="curator-actions">
                                        <button
                                            className="primary-small"
                                            onClick={() => handleChangeRights(curator.id)}
                                        >
                                            Изменить права
                                        </button>
                                        <button
                                            className="reject-small"
                                            onClick={() => handleDelete(curator.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Кураторы не найдены</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="section settings-section">
                    <h3 className="section-title">Настройки</h3>

                    <div className="settings-grid">
                        <div className="settings-block">
                            <h4>Модерация</h4>
                            <label className="checkbox">
                                <input type="checkbox" defaultChecked />
                                <span>Автоматическая премодерация новых вакансий</span>
                            </label>
                            <label className="checkbox">
                                <input type="checkbox" />
                                <span>Требовать верификацию для публикации мероприятий</span>
                            </label>
                        </div>

                        <div className="settings-block">
                            <h4>Уведомления</h4>
                            <label className="checkbox">
                                <input type="checkbox" defaultChecked />
                                <span>Уведомлять кураторов о новых заявках</span>
                            </label>
                            <label className="checkbox">
                                <input type="checkbox" />
                                <span>Отправлять отчеты на почту (ежедневно)</span>
                            </label>
                        </div>

                        <div className="settings-actions">
                            <button className="primary">Обновить</button>
                            <button className="reject">Сбросить</button>
                        </div>
                    </div>
                </div>
            </div>

            <CreateCuratorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateCurator}
            />
        </div>
    );
}