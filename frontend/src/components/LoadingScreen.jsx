// src/components/LoadingScreen.jsx
import "./LoadingScreen.css";

export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loader">
                <div className="spinner"></div>
                <div className="loading-text">Загрузка...</div>
            </div>
        </div>
    );
}