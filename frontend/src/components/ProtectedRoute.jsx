import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, isAuthenticated, loading } = useAuth();

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

    // Если не авторизован - на страницу выбора роли
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если указаны допустимые роли и роль пользователя не подходит
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Перенаправляем на соответствующий профиль
        if (user?.role === 'candidate') {
            return <Navigate to="/candidate/profile" replace />;
        }
        if (user?.role === 'employer') {
            return <Navigate to="/employer/profile" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // Все проверки пройдены - показываем страницу
    return children;
}