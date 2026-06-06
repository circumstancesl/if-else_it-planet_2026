import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import PublicNav from "./PublicNav";
import CandidateNav from "./CandidateNav";
import EmployerNav from "./EmployerNav";
import CuratorNav from "./CuratorNav.jsx";
import AdminNav from "./AdminNav.jsx";

export default function Header() {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/"); // ← перенаправляем на главную после выхода
    };

    if (loading) {
        return (
            <header className="header">
                <div className="logo" onClick={() => navigate("/")}>
                    <img src="/icons/logo.svg" alt="logo" />
                </div>
                <div className="nav-placeholder"></div>
                <div className="actions">
                    <span>Загрузка...</span>
                </div>
            </header>
        );
    }

    // Выбор навигации в зависимости от роли
    const renderNavigation = () => {
        if (!user) return <PublicNav />;

        switch(user.role) {
            case "candidate":
                return <CandidateNav />;
            case "employer":
                return <EmployerNav />;
            case "curator":
                return <CuratorNav />;
            case "admin":
                return <AdminNav />;
            default:
                return <PublicNav />;
        }
    };

    // Выбор действий в зависимости от роли
    const renderActions = () => {
        if (!user) {
            return (
                <div className="actions">
                    <button className="register" onClick={() => navigate("/login")}>
                        Регистрация
                    </button>
                    <button className="login" onClick={() => navigate("/login")}>
                        Вход
                    </button>
                </div>
            );
        }

        return (
            <div className="actions">
                <button className="logout" onClick={handleLogout}>
                    Выход
                </button>
            </div>
        );
    };

    return (
        <header className="header">
            <div className="logo" onClick={() => navigate("/")}>
                <img src="/icons/logo.svg" alt="logo" />
            </div>

            <nav className="nav">
                {renderNavigation()}
            </nav>

            {renderActions()}
        </header>
    );
}