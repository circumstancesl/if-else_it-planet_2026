import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Auth.css";

export default function CandidateRegister() {
    const navigate = useNavigate();
    const { registerCandidate, loading, error } = useAuth();

    // Состояния для полей формы
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация
        if (!email || !name || !password || !confirmPassword) {
            setLocalError("Заполните все поля");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Пароли не совпадают");
            return;
        }

        if (password.length < 6) {
            setLocalError("Пароль должен быть не менее 6 символов");
            return;
        }

        if (!agreeTerms) {
            setLocalError("Подтвердите ознакомление с политикой обработки данных");
            return;
        }

        setLocalError("");

        try {
            // Регистрируем соискателя
            await registerCandidate({
                email,
                password,
                name,
            });
            // После успешной регистрации автоматически входим и перенаправляем
            navigate("/profile");
        } catch (err) {
            setLocalError(err.message || "Ошибка регистрации");
        }
    };

    return (
        <div className="login-page">
            <div className="overlay" />

            <div className="login-card">
                <div className="auth-top-bar">
                    <span className="back" onClick={() => navigate("/login")}>←</span>
                    <div className="avatar-title-block">
                        <img src="/img/jobseeker.jpg" alt="avatar" className="avatar-center" />
                        <h2>Соискатель</h2>
                    </div>
                </div>

                {(localError || error) && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Подтвердить пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                    />

                    <div className="checkboxes-wrapper">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            Запомнить меня
                        </label>

                        <label className="checkbox small">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                disabled={loading}
                            />
                            Я подтверждаю ознакомление с политикой обработки данных
                        </label>
                    </div>

                    <div className="buttons-container">
                        <button
                            type="submit"
                            className="primary"
                            disabled={loading}
                        >
                            {loading ? "Регистрация..." : "Регистрация"}
                        </button>
                    </div>
                </form>

                <p className="bottom-text">
                    У вас уже есть аккаунт?{" "}
                    <span onClick={() => navigate("/candidate-login")}>
                        Вход
                    </span>
                </p>
            </div>
        </div>
    );
}