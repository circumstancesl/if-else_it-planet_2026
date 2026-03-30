import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Auth.css";

export default function CuratorLogin() {
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setLocalError("Заполните все поля");
            return;
        }

        setLocalError("");

        try {
            // Передаем rememberMe в login
            await login(email, password, rememberMe); // ← добавили rememberMe
            navigate("/profile");
        } catch (err) {
            setLocalError(err.message || "Ошибка входа");
        }
    };

    return (
        <div className="login-page">
            <div className="overlay" />

            <div className="login-card">
                <div className="auth-top-bar">
                    <span className="back" onClick={() => navigate("/login")}>←</span>
                    <div className="avatar-title-block">
                        <img src="/img/mentor.jpg" alt="avatar" className="avatar-center" />
                        <h2>Куратор</h2>
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
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                        />
                        Запомнить меня
                    </label>

                    <div className="buttons-container">
                        <button
                            type="submit"
                            className="primary"
                            disabled={loading}
                        >
                            {loading ? "Вход..." : "Вход"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}