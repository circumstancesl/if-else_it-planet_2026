import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import TagBlock from "../../../components/TagBlock/TagBlock.jsx";
import { usePossibilities } from "../../../api/usePossibilities";
import "./CreateEvent.css";
import Breadcrumbs from "../../../components/Breadcrumbs.jsx";

export default function EditEvent() {
    const navigate = useNavigate();
    const { eventId } = useParams();

    const {
        createPossibility,
        updatePossibility,
        deletePossibility,
        getPossibilityById,
        loading
    } = usePossibilities();

    const isEditMode = !!eventId;

    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "event",
        format: "hybrid",
        location: "",
        salary: "",
        endDate: "",
        tags: [],
        level: [],
        employment: [],
    });

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);

    // ==================== ЗАГРУЗКА ====================
    useEffect(() => {
        if (!isEditMode) return;

        const load = async () => {
            try {
                const event = await getPossibilityById(eventId);

                const allTags = event.tags || [];

                setForm({
                    title: event.title || "",
                    description: event.description || "",
                    type: event.type || "event",
                    format: event.format || "hybrid",
                    location: event.city || "",
                    salary: event.salary ? String(event.salary) : "",
                    endDate: event.date ? event.date.split("T")[0] : "",

                    // 💥 ВАЖНО: правильное распределение
                    tags: allTags.filter(t => t.type === "technology"),
                    level: allTags.filter(t => t.type === "level"),
                    employment: allTags.filter(t => t.type === "employmentType"),
                });

            } catch (err) {
                console.error(err);
                alert("Ошибка загрузки события");
            } finally {
                setIsLoadingData(false);
            }
        };

        load();
    }, [eventId, isEditMode]);

    // ==================== CHANGE ====================
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddTag = (category, tag) => {
        setForm((prev) => {
            const exists = prev[category].some(t => t.id === tag.id);
            if (exists) return prev;

            return {
                ...prev,
                [category]: [...prev[category], tag]
            };
        });
    };

    const handleRemoveTag = (category, tagId) => {
        setForm((prev) => ({
            ...prev,
            [category]: prev[category].filter(tag => tag.id !== tagId)
        }));
    };

    // ==================== SAVE ====================
    const handleSubmit = async () => {
        try {
            if (!form.title.trim()) {
                alert("Введите название события");
                return;
            }

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),

                type: form.type,
                format: form.format,

                city: form.location || null,
                salary: form.salary ? Number(form.salary) : null,
                date: form.endDate || null,

                tagIds: [
                    ...form.tags,
                    ...form.level,
                    ...form.employment,
                ].map(t => t.id),
            };

            if (isEditMode) {
                await updatePossibility(eventId, payload);
                alert("Событие обновлено!");
            } else {
                await createPossibility(payload);
                alert("Событие создано!");
            }

            navigate("/employer/events");

        } catch (err) {
            console.error(err);
            alert(err.message || "Ошибка сохранения");
        }
    };

    // ==================== DELETE ====================
    const handleDelete = async () => {
        if (!window.confirm("Удалить событие?")) return;

        try {
            await deletePossibility(eventId);
            alert("Событие удалено");
            navigate("/employer/events");
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления");
        }
    };

    if (isLoadingData) {
        return (
            <div className="create-event-page">
                <Header />
                <div className="container">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="create-event-page">
            <Header />

            <div className="container create-event">
                <Breadcrumbs
                    backLabel="Активные события"
                    currentLabel="Редактирование события"
                    backPath="/employer/events"
                />

                <div className="form-grid">
                    {/* ===== ЛЕВАЯ ===== */}
                    <div className="left">
                        <h3>Важная информация</h3>

                        <label>Название*</label>
                        <input
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                        />

                        <label>Описание (Markdown)</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />

                        <label>Тип</label>
                        <select
                            value={form.type}
                            onChange={(e) => handleChange("type", e.target.value)}
                        >
                            <option value="event">Событие</option>
                            <option value="internship">Стажировка</option>
                            <option value="vacancy">Работа</option>
                        </select>

                        <label>Формат</label>
                        <select
                            value={form.format}
                            onChange={(e) => handleChange("format", e.target.value)}
                        >
                            <option value="hybrid">Гибрид</option>
                            <option value="remote">Удаленно</option>
                            <option value="office">Офис</option>
                        </select>

                        <label>Локация</label>
                        <input
                            value={form.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                        />

                        <label>Зарплата</label>
                        <input
                            value={form.salary}
                            onChange={(e) => handleChange("salary", e.target.value)}
                        />
                    </div>

                    {/* ===== ЦЕНТР ===== */}
                    <div className="middle">
                        <h3>Теги</h3>

                        <TagBlock
                            title="Технологии"
                            type="technology"
                            tags={form.tags}
                            onAdd={(tag) => handleAddTag("tags", tag)}
                            onRemove={(id) => handleRemoveTag("tags", id)}
                            placeholder="React, Node.js..."
                        />

                        <TagBlock
                            title="Уровень"
                            type="level"
                            tags={form.level}
                            onAdd={(tag) => handleAddTag("level", tag)}
                            onRemove={(id) => handleRemoveTag("level", id)}
                            placeholder="Junior, Middle..."
                        />

                        <TagBlock
                            title="Тип занятости"
                            type="employmentType"
                            tags={form.employment}
                            onAdd={(tag) => handleAddTag("employment", tag)}
                            onRemove={(id) => handleRemoveTag("employment", id)}
                            placeholder="Полная, проектная..."
                        />
                    </div>

                    {/* ===== ПРАВАЯ ===== */}
                    <div className="right">
                        <h3>Дата</h3>

                        <label>Дата события</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                        />

                        <div className="action-buttons">
                            <button
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Сохранение..." : "Сохранить изменения"}
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={() => navigate("/employer/events")}
                            >
                                Отмена
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={handleDelete}
                            >
                                Удалить событие
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}