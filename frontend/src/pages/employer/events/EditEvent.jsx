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
        status: "draft"
    });

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    status: event.status || "draft",
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

    // ==================== СОХРАНЕНИЕ С РАЗНЫМИ СТАТУСАМИ ====================
    const saveEvent = async (status) => {
        try {
            setIsSubmitting(true);

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
                status: status,
                tagIds: [
                    ...form.tags,
                    ...form.level,
                    ...form.employment,
                ].map(t => t.id),
            };

            if (isEditMode) {
                await updatePossibility(eventId, payload);
                const statusMessages = {
                    draft: "Событие сохранено в черновики!",
                    published: "Событие опубликовано!",
                    archived: "Событие закрыто и перемещено в архив!"
                };
                alert(statusMessages[status] || "Событие сохранено!");
            } else {
                await createPossibility(payload);
                alert("Событие создано и опубликовано!");
            }

            navigate("/employer/events");

        } catch (err) {
            console.error(err);
            alert(err.message || "Ошибка сохранения");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = () => saveEvent('draft');
    const handlePublish = () => saveEvent('published');
    const handleArchive = () => saveEvent('archived');

    // ==================== УДАЛЕНИЕ (СТЕРЕТЬ) ====================
    const handleDelete = async () => {
        if (!window.confirm("Вы уверены, что хотите полностью удалить это событие? Это действие нельзя отменить.")) return;

        try {
            await deletePossibility(eventId);
            alert("Событие полностью удалено");
            navigate("/employer/events");
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления");
        }
    };

    const handleCancel = () => {
        navigate("/employer/events");
    };

    if (isLoadingData) {
        return (
            <div className="create-event-page">
                <Header />
                <div className="container">Загрузка...</div>
            </div>
        );
    }

    const isPublished = form.status === 'published';
    const isArchived = form.status === 'archived';
    const isDraft = form.status === 'draft';

    const getStatusText = () => {
        if (isDraft) return " Черновик";
        if (isPublished) return " Активно";
        if (isArchived) return " В архиве";
        return "";
    };

    const getStatusClass = () => {
        if (isDraft) return "status-draft";
        if (isPublished) return "status-published";
        if (isArchived) return "status-archived";
        return "";
    };

    return (
        <div className="create-event-page">
            <Header />

            <div className="container create-event">
                <Breadcrumbs
                    backLabel="Активные события"
                    currentLabel={isEditMode ? "Редактирование события" : "Новое событие"}
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
                            rows={5}
                        />

                        <label>Тип</label>
                        <select
                            value={form.type}
                            onChange={(e) => handleChange("type", e.target.value)}
                        >
                            <option value="event">Событие</option>
                            <option value="internship">Стажировка</option>
                            <option value="vacancy">Вакансия</option>
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
                            placeholder="Город или адрес"
                        />

                        <label>Зарплата</label>
                        <input
                            value={form.salary}
                            onChange={(e) => handleChange("salary", e.target.value)}
                            placeholder="от 0"
                            type="number"
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
                        <h3>Дата и статус</h3>

                        <label>Дата события</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                        />

                        {isEditMode && (
                            <div className="status-bar">
                                <span className="status-label">Статус:</span>
                                <span className={`status-badge-small ${getStatusClass()}`}>
                                    {getStatusText()}
                                </span>
                            </div>
                        )}

                        <div className="action-buttons">
                            {!isArchived && (
                                <>
                                    <button
                                        className="primary"
                                        onClick={handlePublish}
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting ? "Публикация..." : "Опубликовать"}
                                    </button>

                                    <button
                                        className="secondary"
                                        onClick={handleSaveDraft}
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting ? "Сохранение..." : "В черновики"}
                                    </button>

                                    {isEditMode && (
                                        <button
                                            className="reject"
                                            onClick={handleArchive}
                                            disabled={isSubmitting || loading}
                                        >
                                            Закрыть событие
                                        </button>
                                    )}
                                </>
                            )}

                            {isArchived && (
                                <>
                                    <button
                                        className="primary"
                                        onClick={handlePublish}
                                        disabled={isSubmitting || loading}
                                    >
                                        Открыть снова
                                    </button>
                                </>
                            )}

                            {/* Кнопка "Стереть" - всегда доступна в режиме редактирования */}
                            {isEditMode && (
                                <button
                                    className="reject"
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                >
                                    Стереть событие
                                </button>
                            )}

                            <button
                                className="secondary"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}