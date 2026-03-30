import { useState } from "react";
import "./ChangeRightsModal.css";

export default function ChangeRightsModal({ isOpen, onClose, onSave, company }) {
    const [formData, setFormData] = useState({
        status: company?.verification_status || "pending",
    });

    const handleStatusChange = (e) => {
        setFormData({ status: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(company.id, formData.status);
        onClose();
    };

    if (!isOpen) return null;

    const statusLabels = {
        pending: "Ожидает проверки",
        approved: "Верифицирован",
        rejected: "Отклонен"
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="modal-header">
                    <h2>Изменение прав</h2>
                    <p className="modal-subtitle">{company?.name}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Статус верификации</label>
                        <select
                            value={formData.status}
                            onChange={handleStatusChange}
                            className="form-select"
                        >
                            <option value="pending">Ожидает проверки</option>
                            <option value="approved">Верифицирован</option>
                            <option value="rejected">Отклонен</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="primary">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}