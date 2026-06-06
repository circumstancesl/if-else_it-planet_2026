import Header from "../../components/Header/Header.jsx";
import "./CandidateProfile.css";
import { useEffect, useState } from "react";
import { users } from "../../api/endpoints";
import { useTags } from "../../api/useTags";
import PageLoader from "../../components/PageLoader";

export default function CandidateProfile() {
    const { tags, fetchTags, loading: tagsLoading } = useTags();

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        fullName: "",
        jobTitle: "",
        university: "",
        course: "",
        about: "",
        resumeURL: "",
        email: "",
    });

    const [skillTagIds, setSkillTagIds] = useState([]);
    const [levelTagIds, setLevelTagIds] = useState([]);
    const [skillTags, setSkillTags] = useState([]);
    const [levelTags, setLevelTags] = useState([]);

    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [availableSkillTags, setAvailableSkillTags] = useState([]);
    const [availableLevelTags, setAvailableLevelTags] = useState([]);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);
    const [skillSearch, setSkillSearch] = useState("");
    const [levelSearch, setLevelSearch] = useState("");

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    useEffect(() => {
        fetchTags({});
    }, []);

    useEffect(() => {
        if (tags && tags.length > 0) {
            setAvailableSkillTags(tags.filter(t => t.type === 'technology'));
            setAvailableLevelTags(tags.filter(t => t.type === 'level'));
        }
    }, [tags]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await users.getMyProfile();
                console.log("PROFILE FROM BACK:", data);

                setProfile(data);
                const profileData = data.profile;

                setForm({
                    fullName: profileData.fullName || "",
                    jobTitle: profileData.jobTitle || "",
                    university: profileData.university || "",
                    course: profileData.graduationYear ? (2028 - profileData.graduationYear) : "",
                    about: profileData.about || "",
                    resumeURL: profileData.resumeURL || "",
                    email: data.email || "",
                });

                setIsPrivate(!profileData.profileVisible);

                if (profileData.logoUrl) {
                    setAvatarPreview(getFullImageUrl(profileData.logoUrl));
                }

                if (profileData.Tags && profileData.Tags.length > 0) {
                    const skillsFromProfile = profileData.Tags.filter(tag => tag.type === 'technology');
                    const levelsFromProfile = profileData.Tags.filter(tag => tag.type === 'level');

                    setSkillTags(skillsFromProfile.map(t => t.name));
                    setSkillTagIds(skillsFromProfile.map(t => t.id));
                    setLevelTags(levelsFromProfile.map(t => t.name));
                    setLevelTagIds(levelsFromProfile.map(t => t.id));
                }

            } catch (err) {
                console.error("Ошибка загрузки профиля", err);
            } finally {
                setLoading(false);
            }
        };

        if (!tagsLoading) {
            loadProfile();
        }
    }, [tagsLoading]);

    const handleChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAvatarChange = async (e) => {
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

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            setUploadingAvatar(true);
            const formData = new FormData();
            formData.append('logoUrl', file);

            await users.uploadAvatar(formData);
            alert("Аватар успешно обновлен!");

            const updated = await users.getMyProfile();
            setProfile(updated);

            if (updated.profile.logoUrl) {
                setAvatarPreview(getFullImageUrl(updated.profile.logoUrl));
            }
        } catch (err) {
            console.error("Error uploading avatar:", err);
            alert("Ошибка загрузки аватара: " + (err.message || "Неизвестная ошибка"));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleAddSkillTag = (tag) => {
        if (!skillTags.includes(tag.name)) {
            setSkillTags([...skillTags, tag.name]);
            setSkillTagIds([...skillTagIds, tag.id]);
        }
        setShowSkillDropdown(false);
        setSkillSearch("");
    };

    const handleAddLevelTag = (tag) => {
        if (!levelTags.includes(tag.name)) {
            setLevelTags([...levelTags, tag.name]);
            setLevelTagIds([...levelTagIds, tag.id]);
        }
        setShowLevelDropdown(false);
        setLevelSearch("");
    };

    const handleRemoveSkillTag = (tagToRemove) => {
        const index = skillTags.indexOf(tagToRemove);
        if (index !== -1) {
            setSkillTags(skillTags.filter(t => t !== tagToRemove));
            setSkillTagIds(skillTagIds.filter((_, i) => i !== index));
        }
    };

    const handleRemoveLevelTag = (tagToRemove) => {
        const index = levelTags.indexOf(tagToRemove);
        if (index !== -1) {
            setLevelTags(levelTags.filter(t => t !== tagToRemove));
            setLevelTagIds(levelTagIds.filter((_, i) => i !== index));
        }
    };

    const filteredSkillTags = availableSkillTags.filter(tag =>
        tag.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
        !skillTags.includes(tag.name)
    );

    const filteredLevelTags = availableLevelTags.filter(tag =>
        tag.name.toLowerCase().includes(levelSearch.toLowerCase()) &&
        !levelTags.includes(tag.name)
    );

    const handleSave = async () => {
        console.log("CLICK SAVE");

        if (form.jobTitle && form.jobTitle.length > 50) {
            alert("Желаемая должность не может превышать 50 символов");
            return;
        }

        if (form.university && form.university.length > 150) {
            alert("Название учебного заведения не может превышать 150 символов");
            return;
        }

        let graduationYear = null;
        if (form.course) {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const studyYear = currentMonth >= 8 ? currentYear : currentYear - 1;
            graduationYear = studyYear + (4 - parseInt(form.course));
        }

        try {
            const rawPayload = {
                fullName: form.fullName,
                jobTitle: form.jobTitle,
                university: form.university,
                graduationYear: graduationYear,
                about: form.about,
                resumeURL: form.resumeURL,
                profileVisible: !isPrivate,
                tagIds: [...skillTagIds, ...levelTagIds]
            };

            const payload = {};
            Object.entries(rawPayload).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined &&
                    (!Array.isArray(value) || value.length > 0)) {
                    payload[key] = value;
                }
            });

            console.log("SENDING:", payload);

            const res = await users.updateCandidateProfile(payload);
            console.log("UPDATED:", res);

            alert("Профиль обновлен");
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения: " + (err.message || "Неизвестная ошибка"));
        }
    };

    if (loading || tagsLoading) {
        return (
            <div className="page">
                <Header />
                <PageLoader />
            </div>
        );
    }

    const displayAvatar = avatarPreview || getFullImageUrl(profile?.profile?.logoUrl) || "/img/candidate-page-avatar.jpg";

    return (
        <div className="page">
            <Header />

            <div className="container candidate-profile-container profile-page">
                <div className="profile-layout">

                    <div className="col-left">
                        <div className="avatar-section">
                            <div className="avatar-block">
                                <img src={displayAvatar} alt="avatar" />
                            </div>
                            <label className="avatar-upload-btn">
                                Изменить фото
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {uploadingAvatar && <div className="avatar-uploading-text">Загрузка...</div>}
                        </div>

                        <div className="privacy">
                            <span>Настройка приватности</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                            <p>
                                Сейчас ваш профиль {isPrivate ? "скрыт" : "виден всем"}
                            </p>
                        </div>
                    </div>

                    <div className="col-middle">
                        <h2>Важная информация</h2>

                        <label>ФИО*</label>
                        <input
                            value={form.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                        />

                        <label>Желаемая должность (до 50 символов)</label>
                        <input
                            type="text"
                            value={form.jobTitle}
                            onChange={(e) => {
                                const value = e.target.value.slice(0, 50);
                                handleChange("jobTitle", value);
                            }}
                            placeholder="Введите желаемую должность"
                        />
                        <span className="char-count">{form.jobTitle.length}/50 символов</span>

                        <label>Учебное заведение (до 150 символов)</label>
                        <input
                            type="text"
                            value={form.university}
                            onChange={(e) => {
                                const value = e.target.value.slice(0, 150);
                                handleChange("university", value);
                            }}
                            placeholder="Введите название учебного заведения"
                        />
                        <span className="char-count">{form.university.length}/150 символов</span>

                        <label>Курс</label>
                        <select
                            value={form.course}
                            onChange={(e) => handleChange("course", e.target.value)}
                        >
                            <option value="">Выберите курс</option>
                            <option value="1">1 курс</option>
                            <option value="2">2 курс</option>
                            <option value="3">3 курс</option>
                            <option value="4">4 курс</option>
                            <option value="5">5 курс</option>
                        </select>

                        <label>О себе</label>
                        <textarea
                            value={form.about}
                            onChange={(e) => handleChange("about", e.target.value)}
                            rows="4"
                        />

                        <h3>Портфолио</h3>
                        <input
                            value={form.resumeURL}
                            onChange={(e) => handleChange("resumeURL", e.target.value)}
                            placeholder="Ссылка на портфолио или резюме"
                        />
                    </div>

                    <div className="col-right">
                        <h2>Контакты</h2>

                        <label>Имя профиля</label>
                        <input
                            value={profile?.email?.split('@')[0] || form.email?.split('@')[0] || "Пользователь"}
                            disabled
                            style={{ backgroundColor: "#f5f5f5" }}
                        />

                        <label>Email</label>
                        <input value={form.email} disabled style={{ backgroundColor: "#f5f5f5" }} />

                        <h3>Навыки</h3>
                        <div className="tags">
                            {skillTags.map((skill) => (
                                <span
                                    key={skill}
                                    className="tag"
                                    onClick={() => handleRemoveSkillTag(skill)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {skill} ✕
                                </span>
                            ))}
                            <div className="add-tag-dropdown">
                                <button
                                    className="add-tag"
                                    onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                                >
                                    + Добавить
                                </button>
                                {showSkillDropdown && (
                                    <div className="dropdown-menu">
                                        <input
                                            type="text"
                                            placeholder="Поиск навыка..."
                                            value={skillSearch}
                                            onChange={(e) => setSkillSearch(e.target.value)}
                                            className="dropdown-search"
                                            autoFocus
                                        />
                                        <div className="dropdown-list">
                                            {filteredSkillTags.slice(0, 3).length > 0 ? (
                                                filteredSkillTags.slice(0, 3).map(tag => (
                                                    <div
                                                        key={tag.id}
                                                        className="dropdown-item"
                                                        onClick={() => handleAddSkillTag(tag)}
                                                    >
                                                        {tag.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-empty">Навыки не найдены</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3>Уровень</h3>
                        <div className="tags">
                            {levelTags.map((lvl) => (
                                <span
                                    key={lvl}
                                    className="tag"
                                    onClick={() => handleRemoveLevelTag(lvl)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {lvl} ✕
                                </span>
                            ))}
                            <div className="add-tag-dropdown">
                                <button
                                    className="add-tag"
                                    onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                                >
                                    + Добавить
                                </button>
                                {showLevelDropdown && (
                                    <div className="dropdown-menu">
                                        <input
                                            type="text"
                                            placeholder="Поиск уровня..."
                                            value={levelSearch}
                                            onChange={(e) => setLevelSearch(e.target.value)}
                                            className="dropdown-search"
                                            autoFocus
                                        />
                                        <div className="dropdown-list">
                                            {filteredLevelTags.slice(0, 3).length > 0 ? (
                                                filteredLevelTags.slice(0, 3).map(tag => (
                                                    <div
                                                        key={tag.id}
                                                        className="dropdown-item"
                                                        onClick={() => handleAddLevelTag(tag)}
                                                    >
                                                        {tag.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-empty">Уровни не найдены</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="actions">
                            <button
                                type="button"
                                className="primary"
                                onClick={handleSave}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}