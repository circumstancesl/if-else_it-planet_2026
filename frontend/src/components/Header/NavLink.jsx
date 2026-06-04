import { useLocation, useNavigate } from "react-router-dom";

export default function NavLink({ to, children, exact = true, alsoActiveOn = [] }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Проверяем, активен ли текущий путь
    const isActive = exact
        ? location.pathname === to
        : location.pathname.startsWith(to);

    // Проверяем дополнительные пути для подсветки
    const isAlsoActive = alsoActiveOn.some(path => location.pathname.startsWith(path));

    return (
        <span
            className={`nav-item ${isActive || isAlsoActive ? "active" : ""}`}
            onClick={() => navigate(to)}
        >
            {children}
        </span>
    );
}