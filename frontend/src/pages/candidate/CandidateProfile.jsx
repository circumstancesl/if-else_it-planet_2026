import Header from "../../components/Header/Header.jsx";
import "./CandidateProfile.css";
import { useEffect, useState } from "react";
import { users } from "../../api/endpoints";

export default function CandidateProfile() {
    const [form, setForm] = useState({
        fullName: "",
        jobTitle: "",
        university: "",
        graduationYear: "",
        about: "",
        resumeURL: "",
        email: "",
    });

    const [skills, setSkills] = useState([]);
    const [level, setLevel] = useState([]);
    const [socials, setSocials] = useState([""]);
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await users.getMyProfile();
                console.log("PROFILE FROM BACK:", data);

                const profile = data.profile; // 💥 ВОТ ГЛАВНОЕ

                setForm({
                    fullName: profile.fullName || "",
                    jobTitle: profile.jobTitle || "",
                    university: profile.university || "",
                    graduationYear: profile.graduationYear || "",
                    about: profile.about || "",
                    resumeURL: profile.resumeURL || "",
                    email: data.email || "",
                });

                setIsPrivate(!profile.profileVisible);

                // мок
                setSkills(["React", "JavaScript"]);
                setLevel(["Junior"]);
                setSocials([""]);
            } catch (err) {
                console.error("Ошибка загрузки профиля", err);
            }
        };

        loadProfile();
    }, []);

    // ===== CHANGE =====
    const handleChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // ===== СОХРАНЕНИЕ =====
    const handleSave = async () => {
        console.log("CLICK SAVE");

        try {
            const rawPayload = {
                fullName: form.fullName,
                jobTitle: form.jobTitle,
                university: form.university,
                graduationYear: form.graduationYear,
                about: form.about,
                resumeURL: form.resumeURL,
                profileVisible: !isPrivate
            };

            // убираем пустые поля
            const payload = {};
            Object.entries(rawPayload).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    payload[key] = value;
                }
            });

            console.log("SENDING:", payload);

            const res = await users.updateCandidateProfile(payload);
            console.log("UPDATED:", res);

            alert("Профиль обновлен");
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения");
        }
    };

    // ===== UI =====
    return (
        <div className="page">
            <Header />

            <div className="container candidate-profile-container profile-page">
                <div className="profile-layout">

                    {/* LEFT */}
                    <div className="col-left">
                        <div className="avatar-block">
                            <img src="/img/candidate-page-avatar.jpg" alt="avatar" />
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

                    {/* MIDDLE */}
                    <div className="col-middle">
                        <h2>Важная информация</h2>

                        <label>ФИО*</label>
                        <input
                            value={form.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                        />

                        <label>Желаемая должность</label>
                        <select
                            value={form.jobTitle}
                            onChange={(e) => handleChange("jobTitle", e.target.value)}
                        >
                            <option value="">Выберите</option>
                            <option>Frontend разработчик</option>
                            <option>Backend разработчик</option>
                            <option>UI/UX дизайнер</option>
                        </select>

                        <label>Учебное заведение</label>
                        <select
                            value={form.university}
                            onChange={(e) => handleChange("university", e.target.value)}
                        >
                            <option value="">Выберите</option>
                            <option>МГУ</option>
                            <option>СПбГУ</option>
                            <option>НИУ ВШЭ</option>
                            <option>МФТИ</option>
                        </select>

                        <label>Курс</label>
                        <select
                            value={form.graduationYear}
                            onChange={(e) =>
                                handleChange("graduationYear", Number(e.target.value))
                            }
                        >
                            <option value="">Выберите</option>
                            <option value={2027}>1 курс</option>
                            <option value={2026}>2 курс</option>
                            <option value={2025}>3 курс</option>
                            <option value={2024}>4 курс</option>
                        </select>

                        <label>О себе</label>
                        <textarea
                            value={form.about}
                            onChange={(e) => handleChange("about", e.target.value)}
                        />

                        <h3>Портфолио</h3>
                        <input
                            value={form.resumeURL}
                            onChange={(e) => handleChange("resumeURL", e.target.value)}
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="col-right">
                        <h2>Контакты</h2>

                        <label>Email</label>
                        <input value={form.email} disabled />

                        <h3>Навыки</h3>
                        <div className="tags">
                            {skills.map((skill) => (
                                <span key={skill} className="tag">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <h3>Уровень</h3>
                        <div className="tags">
                            {level.map((lvl) => (
                                <span key={lvl} className="tag">
                                    {lvl}
                                </span>
                            ))}
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