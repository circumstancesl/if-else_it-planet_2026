import { useState } from "react";
import { useCurator } from "../../api/useCurator";
import "./ChangeRightsModal.css";

export default function ChangeRightsModal({ isOpen, onClose, onSave, company }) {
    const [formData, setFormData] = useState({
        status: company?.verification_status || "pending",
    });
    const [aiVerifying, setAiVerifying] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiError, setAiError] = useState(null);

    const { verifyCompany } = useCurator();

    const handleStatusChange = (e) => {
        setFormData({ status: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(company.id, formData.status);
        onClose();
    };

    const handleAIVerify = async () => {
        if (!company?.id) return;

        setAiVerifying(true);
        setAiResult(null);
        setAiError(null);

        try {
            const result = await verifyCompany(company.id);
            // Извлекаем результат из ответа
            if (result && typeof result === 'object') {
                setAiResult(result.summary || result.message || result.text || JSON.stringify(result));
            } else {
                setAiResult(result);
            }
        } catch (err) {
            console.error("AI verification error:", err);
            setAiError(err.message || "Не удалось выполнить проверку");
        } finally {
            setAiVerifying(false);
        }
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

                    {/* Блок AI проверки */}
                    <div className="form-group ai-verify-group">
                        <div className="ai-verify-header">
                            <label className="form-label">AI проверка компании</label>
                            <button
                                type="button"
                                className={`ai-verify-btn ${aiVerifying ? 'loading' : ''}`}
                                onClick={handleAIVerify}
                                disabled={aiVerifying}
                                title="Проверить компанию с помощью ИИ"
                            >
                                {aiVerifying ? (
                                    <span className="btn-spinner"></span>
                                ) : (
                                    <>
                                        <svg className="ai-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                        </svg>
                                        <span>Проверить AI</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {aiVerifying && (
                            <div className="ai-verifying">
                                <span className="ai-spinner"></span>
                                <span>ИИ анализирует данные компании...</span>
                            </div>
                        )}

                        {aiError && (
                            <div className="ai-error">
                                <span className="error-icon">⚠️</span>
                                <span>{aiError}</span>
                            </div>
                        )}

                        {aiResult && !aiVerifying && (
                            <div className="ai-result">
                                <div className="ai-result-header">
                                    <span className="ai-badge">AI</span>
                                    <span className="ai-result-label">Результат проверки:</span>
                                </div>
                                <div className="ai-result-content">
                                    <p>{aiResult}</p>
                                </div>
                            </div>
                        )}
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