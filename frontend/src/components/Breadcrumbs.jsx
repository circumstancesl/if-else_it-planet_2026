import { useNavigate } from "react-router-dom";
import "./Breadcrumbs.css";

export default function Breadcrumbs({
                                        backLabel = "Назад",
                                        currentLabel = "Текущая страница",
                                        backPath = "/"
                                    }) {
    const navigate = useNavigate();

    return (
        <div className="breadcrumbs">
            <span
                className="breadcrumbs-back"
                onClick={() => navigate(backPath)}
            >
                {backLabel}
            </span>

            <span className="breadcrumbs-separator">/</span>

            <span className="breadcrumbs-current">
                {currentLabel}
            </span>
        </div>
    );
}