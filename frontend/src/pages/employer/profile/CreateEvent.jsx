import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import TagBlock from "../../../components/TagBlock/TagBlock.jsx";
import LocationInput from "../../../components/LocationInput.jsx";
import { usePossibilities } from "../../../api/usePossibilities";
import "./CreateEvent.css";
import Breadcrumbs from "../../../components/Breadcrumbs.jsx";

export default function CreateEvent() {
    const navigate = useNavigate();
    const { createPossibility, updatePossibility, loading } = usePossibilities();

    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "event",
        format: "hybrid",
        city: "",
        address: "",
        salary: "",
        date: "",
        tags: [],
        level: [],
        employment: [],
        latitude: null,
        longitude: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCoordinatesChange = (coordinates) => {
        if (coordinates) {
            setForm((prev) => ({
                ...prev,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                latitude: null,
                longitude: null
            }));
        }
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

    // Сохранение в черновики
    const handleSaveDraft = async () => {
        try {
            setIsSubmitting(true);

            if (!form.title) {
                alert("Введите название события");
                return;
            }

            const payload = {
                title: form.title,
                description: form.description,
                type: form.type,
                format: form.format,
                city: form.city,
                address: form.address,
                salary: form.salary ? Number(form.salary) : null,
                date: form.date || null,
                latitude: form.latitude,
                longitude: form.longitude,
                tagIds: [
                    ...form.tags.map(t => t.id),
                    ...form.level.map(t => t.id),
                    ...form.employment.map(t => t.id),
                ]
            };

            console.log("CREATE EVENT PAYLOAD:", payload);
            const createdEvent = await createPossibility(payload);

            // После создания меняем статус на draft (если получили id)
            if (createdEvent && createdEvent.id) {
                await updatePossibility(createdEvent.id, { status: 'draft' });
                alert("Черновик события сохранен!");
            } else {
                alert("Черновик события сохранен!");
            }

            navigate("/employer/events");

        } catch (err) {
            console.error("CREATE DRAFT ERROR:", err);
            alert(err.message || "Ошибка создания черновика");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Публикация события
    const handlePublish = async () => {
        try {
            setIsSubmitting(true);

            if (!form.title) {
                alert("Введите название события");
                return;
            }

            if (form.tags.length === 0 && form.level.length === 0 && form.employment.length === 0) {
                alert("Добавьте хотя бы один тег");
                return;
            }

            const payload = {
                title: form.title,
                description: form.description,
                type: form.type,
                format: form.format,
                city: form.city,
                address: form.address,
                salary: form.salary ? Number(form.salary) : null,
                date: form.date || null,
                latitude: form.latitude,
                longitude: form.longitude,
                tagIds: [
                    ...form.tags.map(t => t.id),
                    ...form.level.map(t => t.id),
                    ...form.employment.map(t => t.id),
                ]
            };

            console.log("PUBLISH PAYLOAD:", payload);
            await createPossibility(payload);
            alert("Событие опубликовано!");
            navigate("/employer/events");

        } catch (err) {
            console.error("PUBLISH ERROR:", err);
            alert(err.message || "Ошибка публикации события");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-event-page">
            <Header />

            <div className="container create-event">
                <Breadcrumbs
                    backLabel="Активные события"
                    currentLabel="Новое событие"
                    backPath="/employer/events"
                />

                <div className="form-grid">
                    <div className="left">
                        <h3>Важная информация</h3>

                        <label>Название*</label>
                        <input
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="Введите название события"
                        />

                        <label>Описание</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={5}
                            placeholder="Опишите событие, требования, условия..."
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

                        <label>Город</label>
                        <input
                            value={form.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            placeholder="Например: Москва"
                        />

                        <label>Адрес</label>
                        <LocationInput
                            value={form.address}
                            onChange={(address) => handleChange("address", address)}
                            onCoordinatesChange={handleCoordinatesChange}
                            placeholder="Введите точный адрес"
                        />

                        {form.latitude && form.longitude && (
                            <div className="coordinates-info">
                                <span>📍 Координаты: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</span>
                            </div>
                        )}

                        <label>Зарплата</label>
                        <input
                            value={form.salary}
                            onChange={(e) => handleChange("salary", e.target.value)}
                            placeholder="от 0"
                            type="number"
                        />
                    </div>

                    <div className="middle">
                        <h3>Теги</h3>
                        <p className="hint">Добавьте теги для лучшего поиска</p>

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

                    <div className="right">
                        <h3>Дата</h3>

                        <label>Дата события</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => handleChange("date", e.target.value)}
                        />

                        <div className="info-block">
                            <p className="info-text">
                                💡 <strong>Черновик</strong> - сохранится в черновиках<br/>
                                📢 <strong>Публикация</strong> - станет доступен для всех
                            </p>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="primary"
                                onClick={handlePublish}
                                disabled={isSubmitting || loading}
                            >
                                {isSubmitting ? "Публикация..." : "📢 Опубликовать"}
                            </button>

                            <button
                                className="secondary"
                                onClick={handleSaveDraft}
                                disabled={isSubmitting || loading}
                            >
                                {isSubmitting ? "Сохранение..." : "💾 Сохранить в черновики"}
                            </button>

                            <button
                                className="secondary"
                                onClick={() => navigate("/employer/events")}
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