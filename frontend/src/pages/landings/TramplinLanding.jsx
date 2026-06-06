import "./LandingPages.css";
import Header from "../../components/Header/Header.jsx";

export default function TramplinLanding() {
    return (
        <div className="landing-page">
            <Header />

            {/* Hero Section */}
            <div className="landing-hero">
                <div className="landing-container">
                    <div className="hero-content">
                        <h1>Трамплин</h1>
                        <p className="hero-subtitle">Платформа для старта карьеры в IT</p>
                        <p className="hero-description">
                            Даём студентам и выпускникам энергию для рывка в карьере.<br />
                            Форма логотипа — стилизованный трамплин, устремлённый вверх.
                        </p>
                    </div>

                    {/* Цветовая палитра */}
                    <div className="color-palette">
                        <div className="color-swatch accent">
                            <strong>Акцентный</strong><br />#0071E8
                        </div>
                        <div className="color-swatch white">
                            <strong>Белый</strong><br />#FFFFFF
                        </div>
                        <div className="color-swatch gray">
                            <strong>Серый</strong><br />#F2F4FA
                        </div>
                        <div className="color-swatch red">
                            <strong>Красный</strong><br />#FF5246
                        </div>
                        <div className="color-swatch black">
                            <strong>Чёрный</strong><br />#000000
                        </div>
                    </div>
                </div>
            </div>

            <div className="landing-container">
                {/* Цель + Аудитория */}
                <div className="section">
                    <div className="info-grid">
                        <div className="info-card">
                            <h2>Цель</h2>
                            <p>Создание экосистемы, где студенты и выпускники строят карьеру с нуля — находят менторов, участвуют в мероприятиях и получают стажировки на основе своих навыков.</p>
                        </div>
                        <div className="info-card">
                            <h2>Целевая аудитория</h2>
                            <ul style={{ lineHeight: "2.1" }}>
                                <li><strong>Студенты и выпускники</strong> — профиль соискателя</li>
                                <li><strong>IT-компании</strong> — профиль работодателя</li>
                                <li><strong>Менторы и кураторы вузов</strong> — профиль куратора</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Ключевая проблема */}
                <div className="info-card" style={{ background: "#FFF5F5", borderColor: "#FF5246" }}>
                    <h2 style={{ color: "#FF5246" }}>Ключевая проблема</h2>
                    <p>Существующие решения либо слишком формальны, либо не учитывают специфику поиска первой работы / стажировки.</p>
                </div>

                {/* Конкуренты */}
                <div className="section">
                    <h2>Конкуренты</h2>
                    <table className="competitors-table">
                        <thead>
                        <tr>
                            <th>Конкурент</th>
                            <th>Сильные стороны</th>
                            <th>Слабые стороны</th>
                            <th>Что берём</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><strong>hh.ru</strong></td>
                            <td>Огромная база</td>
                            <td>Нет фокуса на студентах</td>
                            <td>Фильтры, API</td>
                        </tr>
                        <tr>
                            <td><strong>Хабр Карьера</strong></td>
                            <td>IT-экспертиза</td>
                            <td>Сложен для новичков</td>
                            <td>Контент от профессионалов</td>
                        </tr>
                        <tr>
                            <td><strong>LinkedIn</strong></td>
                            <td>Нетворкинг</td>
                            <td>Хаотичность, нет модерации</td>
                            <td>Проф. контакты</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Наше УТП */}
                <div className="utp-block">
                    <h2>Наше УТП</h2>
                    <div className="utp-grid">
                        <ul style={{ fontSize: "17px", lineHeight: "2" }}>
                            <li>✓ Персонализированный подход к джунам</li>
                            <li>✓ Модерация событий</li>
                        </ul>
                        <ul style={{ fontSize: "17px", lineHeight: "2" }}>
                            <li>✓ Верификация работодателей</li>
                            <li>✓ Нетворкинг между соискателями</li>
                        </ul>
                    </div>
                </div>

                {/* Результаты */}
                <div className="section">
                    <h2>Результаты</h2>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-number">3</div>
                            <p>роли пользователей</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-number">40+</div>
                            <p>экранов интерфейса</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-number">13</div>
                            <p>таблиц в базе данных</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-number">20+</div>
                            <p>API-эндпоинтов</p>
                        </div>
                    </div>
                </div>

                <div className="final-cta">
                    <a href="/" style={{
                        background: "#0071E8",
                        color: "white",
                        padding: "18px 48px",
                        borderRadius: "12px",
                        fontSize: "18px",
                        fontWeight: "600",
                        textDecoration: "none",
                        display: "inline-block"
                    }}>
                        Перейти на платформу Трамплин →
                    </a>
                </div>
            </div>
        </div>
    );
}