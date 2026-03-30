import { useState } from "react";
import "./CreateCuratorModal.css";

export default function CreateCuratorModal({ isOpen, onClose, onCreate }) {
    const [formData, setFormData] = useState({
        email: "",           // 👈 добавлено поле email
        fullName: "",
        password: "",
        role: "Модератор контента",
    });

    const [permissions, setPermissions] = useState({
        vacancyModeration: false,
        eventModeration: false,
        userManagement: false,
        curatorCreation: false,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const selectedPermissions = Object.keys(permissions).filter(
            key => permissions[key]
        );

        onCreate({
            ...formData,
            permissions: selectedPermissions,
        });

        // Сброс формы после создания
        setFormData({
            email: "",
            fullName: "",
            password: "",
            role: "Модератор контента"
        });
        setPermissions({
            vacancyModeration: false,
            eventModeration: false,
            userManagement: false,
            curatorCreation: false,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="modal-header">
                    <img
                        src="/img/mentor.jpg"
                        alt="avatar"
                        className="modal-avatar"
                    />
                    <h2>Новый куратор</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="ФИО"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Пароль"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="Модератор контента">Модератор контента</option>
                            <option value="Администратор">Администратор</option>
                            <option value="Старший модератор">Старший модератор</option>
                        </select>
                    </div>

                    <div className="permissions-section">
                        <p className="permissions-title">Права доступа</p>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={permissions.vacancyModeration}
                                onChange={() => handlePermissionChange('vacancyModeration')}
                            />
                            <span>Модерация вакансий</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={permissions.eventModeration}
                                onChange={() => handlePermissionChange('eventModeration')}
                            />
                            <span>Модерация мероприятий</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={permissions.userManagement}
                                onChange={() => handlePermissionChange('userManagement')}
                            />
                            <span>Управление пользователями</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={permissions.curatorCreation}
                                onChange={() => handlePermissionChange('curatorCreation')}
                            />
                            <span>Создание кураторов</span>
                        </label>
                    </div>

                    <button type="submit" className="primary">
                        Создать
                    </button>
                </form>
            </div>
        </div>
    );
}