import { useState, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import "./EditProfile.css";
import { users } from "../../../api/endpoints";
import Breadcrumbs from "../../../components/Breadcrumbs.jsx";

export default function EditProfile() {
    const [form, setForm] = useState({
        name: "",
        inn: "",
        sphere: "",
        website: "",
        social: "",
        description: "",
        logo: null,
    });

    const [initialForm, setInitialForm] = useState({
        name: "",
        inn: "",
        sphere: "",
        website: "",
        social: "",
        description: "",
        logo: null,
    });

    const [savingField, setSavingField] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                console.log("LOAD COMPANY PROFILE");

                const data = await users.getMyProfile();
                console.log("PROFILE:", data);

                const company = data.profile;

                const loadedForm = {
                    name: company.name || "",
                    inn: "1111111111",
                    sphere: company.industry || "",
                    website: company.websiteURL?.[0] || "",
                    social: "",
                    description: company.description || "",
                    logo: null,
                };

                setForm(loadedForm);
                setInitialForm(loadedForm);
                setLoading(false);
            } catch (err) {
                console.error("LOAD ERROR:", err);
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({
            ...prev,
            logo: e.target.files[0]
        }));
    };

    const getPayloadByField = (field) => {
        switch (field) {
            case "name":
                return { name: form.name };
            case "sphere":
                return { industry: form.sphere };
            case "website":
                return { websiteURL: [form.website] };
            case "description":
                return { description: form.description };
            default:
                return null;
        }
    };

    const saveField = async (field) => {
        try {
            const payload = getPayloadByField(field);

            if (!payload) {
                return;
            }

            const cleanedPayload = {};
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    cleanedPayload[key] = value;
                }
            });

            if (Object.keys(cleanedPayload).length === 0) {
                return;
            }

            setSavingField(field);

            console.log("SAVING FIELD:", field, cleanedPayload);

            const res = await users.updateCompany(cleanedPayload);

            console.log("UPDATED:", res);

            setInitialForm((prev) => ({
                ...prev,
                [field]: form[field]
            }));

            alert(`Поле "${field}" успешно сохранено!`);
        } catch (err) {
            console.error("SAVE FIELD ERROR:", err);
            alert("Ошибка сохранения поля: " + (err.message || "Неизвестная ошибка"));
        } finally {
            setSavingField("");
        }
    };

    const handleSubmit = async () => {
        console.log("CLICK SAVE COMPANY");

        try {
            const rawPayload = {};

            if (form.name !== initialForm.name) {
                rawPayload.name = form.name;
            }

            if (form.description !== initialForm.description) {
                rawPayload.description = form.description;
            }

            if (form.sphere !== initialForm.sphere) {
                rawPayload.industry = form.sphere;
            }

            if (form.website !== initialForm.website) {
                // Бэкенд ожидает МАССИВ
                rawPayload.websiteURL = [form.website];
            }

            const payload = {};
            Object.entries(rawPayload).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    payload[key] = value;
                }
            });

            if (Object.keys(payload).length === 0) {
                alert("Нет изменений для сохранения");
                return;
            }

            console.log("SENDING:", payload);

            const res = await users.updateCompany(payload);

            console.log("UPDATED:", res);

            setInitialForm((prev) => ({
                ...prev,
                name: form.name,
                sphere: form.sphere,
                website: form.website,
                description: form.description,
            }));

            alert("Профиль компании успешно обновлен!");
        } catch (err) {
            console.error("SAVE ERROR:", err);
            alert("Ошибка сохранения: " + (err.message || "Неизвестная ошибка"));
        }
    };

    if (loading) {
        return (
            <div className="page">
                <Header />
                <div className="container" style={{textAlign: "center", padding: "50px"}}>
                    Загрузка профиля...
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Header />

            <div className="container edit-profile">
                <Breadcrumbs
                    backLabel="Профиль"
                    currentLabel="Редактирование профиля"
                    backPath="/employer/profile"
                />

                <div className="form-grid">
                    <div className="left">
                        <label>Полное наименование*</label>
                        <div className="field-row">
                            <input
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => saveField("name")}
                                disabled={savingField === "name" || form.name === initialForm.name}
                            >
                                {savingField === "name" ? "..." : "Сохранить"}
                            </button>
                        </div>

                        <label>ИНН*</label>
                        <input
                            value={form.inn}
                            onChange={(e) => handleChange("inn", e.target.value)}
                        />
                        <span className="hint">(пока мок)</span>

                        <label>Сфера деятельности*</label>
                        <div className="field-row">
                            <select
                                value={form.sphere}
                                onChange={(e) => handleChange("sphere", e.target.value)}
                            >
                                <option value="">Выберите</option>
                                <option>Разработка ПО</option>
                                <option>Финансы</option>
                                <option>Маркетинг</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => saveField("sphere")}
                                disabled={savingField === "sphere" || form.sphere === initialForm.sphere}
                            >
                                {savingField === "sphere" ? "..." : "Сохранить"}
                            </button>
                        </div>

                        <label>Сайт компании</label>
                        <div className="field-row">
                            <input
                                value={form.website}
                                onChange={(e) => handleChange("website", e.target.value)}
                                placeholder="https://example.com"
                            />
                            <button
                                type="button"
                                onClick={() => saveField("website")}
                                disabled={savingField === "website" || form.website === initialForm.website}
                            >
                                {savingField === "website" ? "..." : "Сохранить"}
                            </button>
                        </div>
                    </div>

                    <div className="middle">
                        <label>Социальные сети</label>
                        <input
                            value={form.social}
                            onChange={(e) => handleChange("social", e.target.value)}
                            placeholder="https://t.me/company"
                        />

                        <label>Краткое описание*</label>
                        <div className="field-column">
                            <textarea
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={4}
                            />
                            <button
                                type="button"
                                onClick={() => saveField("description")}
                                disabled={
                                    savingField === "description" ||
                                    form.description === initialForm.description
                                }
                            >
                                {savingField === "description" ? "..." : "Сохранить описание"}
                            </button>
                        </div>

                        <label>Логотип</label>
                        <div className="file-upload">
                            <input type="file" onChange={handleFileChange} />
                            <span>Загрузка пока не подключена</span>
                        </div>
                    </div>

                    <div className="right">
                        <button
                            type="button"
                            className="primary"
                            onClick={handleSubmit}
                        >
                            Сохранить всё
                        </button>

                        <button type="button" className="secondary">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}