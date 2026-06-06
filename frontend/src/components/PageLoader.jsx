// src/components/PageLoader.jsx
import "./PageLoader.css";

export default function PageLoader() {
    return (
        <div className="page-loader">
            <div className="loader-container">
                <div className="spinner"></div>
                <div className="loading-text">Загрузка...</div>
            </div>
        </div>
    );
}