// pages/ProfileRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfileRedirect() {
    const { user, isAuthenticated, loading } = useAuth();

    // Пока идет проверка авторизации
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Загрузка...</div>
            </div>
        );
    }

    // Если не авторизован - на страницу входа
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Перенаправляем в зависимости от роли
    switch (user.role) {
        case "candidate":  // обратите внимание: у вас в бэке role = "candidate"
            return <Navigate to="/candidate/profile" replace />;
        case "employer":
            return <Navigate to="/employer/profile" replace />;
        case "curator":
            return <Navigate to="/curator/users" replace />;
        case "admin":
            return <Navigate to="/admin/curators" replace />;
        default:
            // Если роль не определена - на главную
            console.warn("Неизвестная роль пользователя:", user.role);
            return <Navigate to="/" replace />;
    }
}