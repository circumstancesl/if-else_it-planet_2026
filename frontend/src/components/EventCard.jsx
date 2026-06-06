import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import "./EventCard.css";

export default function EventCard({
                                      event,
                                      highlighted,
                                      onClick,
                                      onCardClick,
                                      onToggleFavorite,
                                      isFavorite,
                                      isClosed,
                                      variant = "candidate",
                                      responsesCount,
                                      onViewResponses,
                                      messagesCount,
                                      onOpenChat,
                                      companyVerificationStatus,
                                      isAuthenticated = false,
                                  }) {
    const navigate = useNavigate();

    const tagsRef = useRef(null);
    const [visibleTags, setVisibleTags] = useState([]);

    const isDisabled = isClosed || variant === "closed";
    const isEmployerVariant = variant === "employer";
    const isCandidateVariant = variant === "candidate";

    const truncate = (text, maxLength = 100) => {
        if (!text) return "";
        return text.length > maxLength
            ? text.slice(0, maxLength) + "..."
            : text;
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/employer/events/edit-event/${event.id}`);
    };

    // 📦 сортировка тегов - с проверкой что tags это массив
    const orderedTags = useMemo(() => {
        if (!event.tags || !Array.isArray(event.tags) || event.tags.length === 0) return [];

        const employmentType = event.tags.find(t => t?.type === "employmentType");
        const level = event.tags.find(t => t?.type === "level");
        const techTags = event.tags.filter(t => t?.type === "technology");

        return [
            ...(employmentType ? [employmentType] : []),
            ...(level ? [level] : []),
            ...techTags
        ];
    }, [event.tags]);

    // 📏 계산 тегов
    useEffect(() => {
        if (!tagsRef.current || !orderedTags.length) {
            setVisibleTags([]);
            return;
        }

        const containerWidth = tagsRef.current.offsetWidth;
        if (containerWidth === 0) return;

        let currentWidth = 0;
        const gap = 8;
        const result = [];

        for (let i = 0; i < orderedTags.length; i++) {
            const tag = orderedTags[i];
            if (!tag) continue;

            const fake = document.createElement("span");
            fake.className = "tag";
            fake.style.visibility = "hidden";
            fake.style.position = "absolute";
            fake.innerText = tag.name || "";
            fake.style.whiteSpace = "nowrap";

            document.body.appendChild(fake);
            const tagWidth = fake.offsetWidth;
            document.body.removeChild(fake);

            if (currentWidth + tagWidth + gap <= containerWidth) {
                result.push(tag);
                currentWidth += tagWidth + gap;
            } else {
                break;
            }
        }

        setVisibleTags(result);
    }, [orderedTags]);

    // Обработчик клика на карточку (приближение)
    const handleCardClick = (e) => {
        // Если кликнули по кнопке, не вызываем приближение
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        // Вызываем приближение на карте
        onClick?.(event);
    };

    // Обработчик клика на кнопку "Откликнуться" (переход на страницу)
    const handleRespondClick = (e) => {
        e.stopPropagation();

        // Если не авторизован - перенаправляем на логин
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // Для авторизованных пользователей любой роли - переходим на страницу события
        if (onCardClick) {
            onCardClick(event);
        } else {
            navigate(`/candidate/event/${event.id}`);
        }
    };

    // 🎯 действия
    const renderAction = () => {
        if (variant === "closed") return null;

        if (variant === "Chat") {
            return (
                <div className="chat-section">
                    <div className="messages-badge">
                        <span><img src="/icons/message-conversation.svg" alt="message-conversation"/></span>
                        <span>{messagesCount || 0}</span>
                    </div>
                    <button
                        className="primary-small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenChat?.(event);
                        }}
                    >
                        Перейти в чат
                    </button>
                </div>
            );
        }

        if (variant === "responses") {
            return (
                <div className="responses-section">
                    <div className="responses-badge">
                        <span className="eye-icon"><img src="/icons/eye.svg" alt="eye"/> </span>
                        <span>{responsesCount || 0}</span>
                    </div>
                    <button
                        className="primary-small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewResponses?.(event);
                        }}
                    >
                        Смотреть отклики
                    </button>
                </div>
            );
        }

        if (variant === "employer") return null;

        // ✅ кандидат — кнопка делает переход на страницу события
        if (variant === "candidate") {
            return (
                <button
                    className="primary-small"
                    disabled={isDisabled}
                    onClick={handleRespondClick}
                >
                    {isDisabled ? "Закрыто" : "Откликнуться"}
                </button>
            );
        }

        return null;
    };

    // Получаем название компании (строку)
    const companyName = typeof event.company === 'string'
        ? event.company
        : event.company?.name || event.companyName || "Компания";

    return (
        <div
            className={`cardEvent 
                ${highlighted ? "highlighted" : ""} 
                ${isDisabled ? "closed" : ""}
            `}
            onClick={handleCardClick}
        >
            {/* header */}
            <div className="cardEvent-header">
                <div className="cardEvent-titleBlock">
                    <h3 className="cardEvent-title">{event.title}</h3>
                    <p className="cardEvent-desc">
                        {truncate(event.description, 120) || "Описание отсутствует"}
                    </p>
                </div>

                <div className="cardEvent-actions">
                    {onToggleFavorite && (
                        <span
                            className={`heart ${isFavorite ? "active" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(event.id);
                            }}
                        >
                            <img
                                src={isFavorite ? "/icons/favorite-filled.svg" : "/icons/favorite.svg"}
                                alt="favorite"
                            />
                        </span>
                    )}

                    {isEmployerVariant && (
                        <span
                            className="edit-icon"
                            onClick={handleEdit}
                        >
                            <img src="/icons/pen.svg" alt="edit" />
                        </span>
                    )}
                </div>
            </div>

            {/* теги */}
            <div className="tags" ref={tagsRef}>
                {visibleTags.map((tag) => (
                    <span key={tag.id} className="tag">
                        {tag.name}
                    </span>
                ))}
            </div>

            {/* компания */}
            <div className="company">
                {event.company?.name || event.company || "Компания"}
                {companyVerificationStatus === 'approved' && (
                    <span className="check">
                        <img src="/icons/verified.svg" alt="verified" />
                    </span>
                )}
                {companyVerificationStatus === 'rejected' && (
                    <span className="check">
                        <img src="/icons/rejected.svg" alt="rejected" />
                    </span>
                )}
            </div>

            {renderAction()}
        </div>
    );
}