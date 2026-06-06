import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import "./EditProfile.css";
import { users } from "../../../api/endpoints";
import Breadcrumbs from "../../../components/Breadcrumbs.jsx";

export default function EditProfile() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        inn: "",
        sphere: "",
        website: "",
        social: "",
        description: "",
    });

    const [initialForm, setInitialForm] = useState({
        name: "",
        inn: "",
        sphere: "",
        website: "",
        social: "",
        description: "",
    });

    const [logo, setLogo] = useState(null);
    const [initialLogo, setInitialLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                console.log("LOAD COMPANY PROFILE");

                const data = await users.getMyProfile();
                console.log("PROFILE:", data);

                const company = data.profile;

                const loadedForm = {
                    name: company.name || "",
                    inn: company.inn || "",
                    sphere: company.industry || "",
                    website: company.websiteURL?.[0] || "",
                    social: company.socialLinks?.[0] || "",
                    description: company.description || "",
                };

                setForm(loadedForm);
                setInitialForm(loadedForm);

                if (company.logoUrl) {
                    setLogoPreview(company.logoUrl);
                    setInitialLogo(company.logoUrl);
                }

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

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Пожалуйста, выберите изображение");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Размер файла не должен превышать 5MB");
            return;
        }

        setLogo(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const hasChanged = (field) => {
        return form[field] !== initialForm[field];
    };

    const hasLogoChanged = () => {
        return logo !== null;
    };

    const getChangedFields = () => {
        const changed = {};

        if (form.name !== initialForm.name && form.name.trim()) {
            changed.name = form.name;
        }

        if (form.inn !== initialForm.inn && form.inn.trim()) {
            changed.inn = form.inn;
        }

        if (form.description !== initialForm.description && form.description.trim()) {
            changed.description = form.description;
        }

        if (form.sphere !== initialForm.sphere && form.sphere.trim()) {
            changed.industry = form.sphere;
        }

        if (form.website !== initialForm.website && form.website.trim()) {
            changed.websiteURL = [form.website];
        }

        if (form.social !== initialForm.social && form.social.trim()) {
            changed.socialLinks = [form.social];
        }

        return changed;
    };

    const handleSubmit = async () => {
        // Валидация сферы деятельности
        if (form.sphere && form.sphere.length > 20) {
            alert("Сфера деятельности не может превышать 20 символов");
            return;
        }

        const changedFields = getChangedFields();
        const hasTextChanges = Object.keys(changedFields).length > 0;
        const hasLogoChange = hasLogoChanged();

        if (!hasTextChanges && !hasLogoChange) {
            alert("Нет изменений для сохранения");
            return;
        }

        setSaving(true);

        try {
            if (hasTextChanges) {
                console.log("SENDING TEXT FIELDS:", changedFields);
                await users.updateCompany(changedFields);
            }

            if (hasLogoChange && logo) {
                console.log("UPLOADING LOGO...");
                const formData = new FormData();
                formData.append('logoUrl', logo);
                await users.uploadCompanyLogo(formData);
                alert("Логотип обновлен!");
            }

            setInitialForm({
                name: form.name,
                inn: form.inn,
                sphere: form.sphere,
                website: form.website,
                social: form.social,
                description: form.description,
            });

            if (hasLogoChange) {
                setInitialLogo(logoPreview);
                setLogo(null);
            }

            const updated = await users.getMyProfile();
            if (updated.profile.logoUrl) {
                setLogoPreview(updated.profile.logoUrl);
                setInitialLogo(updated.profile.logoUrl);
            }

            alert(`Профиль компании успешно обновлен!`);
        } catch (err) {
            console.error("SAVE ERROR:", err);

            let errorMessage = "Ошибка сохранения";
            if (err.message) {
                errorMessage = err.message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
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
                                className={hasChanged("name") ? "changed" : ""}
                            />
                        </div>
                        {hasChanged("name") && (
                            <span className="changed-hint">Изменено</span>
                        )}

                        <label>ИНН*</label>
                        <div className="field-row">
                            <input
                                value={form.inn}
                                onChange={(e) => handleChange("inn", e.target.value)}
                                placeholder="Введите ИНН"
                                className={hasChanged("inn") ? "changed" : ""}
                            />
                        </div>
                        {hasChanged("inn") && (
                            <span className="changed-hint">Изменено</span>
                        )}
                        <span className="hint">(10 или 12 цифр)</span>

                        <label>Сфера деятельности*</label>
                        <div className="field-row">
                            <input
                                type="text"
                                value={form.sphere}
                                onChange={(e) => {
                                    const value = e.target.value.slice(0, 20);
                                    handleChange("sphere", value);
                                }}
                                placeholder="Введите сферу деятельности"
                                className={hasChanged("sphere") ? "changed" : ""}
                                maxLength={20}
                            />
                        </div>
                        {hasChanged("sphere") && (
                            <span className="changed-hint">Изменено</span>
                        )}
                        <span className="char-count">{form.sphere.length}/20 символов</span>

                        <label>Сайт компании</label>
                        <div className="field-row">
                            <input
                                value={form.website}
                                onChange={(e) => handleChange("website", e.target.value)}
                                placeholder="https://example.com"
                                className={hasChanged("website") ? "changed" : ""}
                            />
                        </div>
                        {hasChanged("website") && (
                            <span className="changed-hint">Изменено</span>
                        )}
                    </div>

                    <div className="middle">
                        {/*<label>Социальные сети</label>*/}
                        {/*<div className="field-row">*/}
                        {/*    <input*/}
                        {/*        value={form.social}*/}
                        {/*        onChange={(e) => handleChange("social", e.target.value)}*/}
                        {/*        placeholder="https://t.me/company"*/}
                        {/*        className={hasChanged("social") ? "changed" : ""}*/}
                        {/*    />*/}
                        {/*</div>*/}
                        {/*{hasChanged("social") && (*/}
                        {/*    <span className="changed-hint">Изменено</span>*/}
                        {/*)}*/}

                        <label>Краткое описание*</label>
                        <div className="field-column">
                            <textarea
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={4}
                                className={hasChanged("description") ? "changed" : ""}
                            />
                        </div>
                        {hasChanged("description") && (
                            <span className="changed-hint">Изменено</span>
                        )}

                        <label>Логотип</label>
                        <div className="file-upload">
                            {logoPreview && (
                                <div className="logo-preview">
                                    <img src={logoPreview} alt="Логотип" />
                                    {hasLogoChanged() && <span className="logo-changed-badge">Изменено</span>}
                                </div>
                            )}
                            <input type="file" onChange={handleLogoChange} accept="image/*" />
                            <span>{uploadingLogo ? "Загрузка..." : "Выберите файл (PNG, JPG, до 5MB)"}</span>
                        </div>
                    </div>

                    <div className="right">
                        <button
                            type="button"
                            className="primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? "Сохранение..." : "Сохранить"}
                        </button>

                        <button
                            type="button"
                            className="secondary"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}