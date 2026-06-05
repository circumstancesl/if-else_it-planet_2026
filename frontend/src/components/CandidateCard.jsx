import { useRef, useState, useEffect, useMemo } from "react";
import "./CandidateCard.css";

export default function CandidateCard({
                                          candidate,
                                          onClick,
                                          buttonText = "Смотреть резюме",  // ← текст кнопки по умолчанию
                                          onButtonClick,                  // ← отдельный обработчик для кнопки
                                          showButton = true               // ← показывать ли кнопку
                                      }) {
    const tagsRef = useRef(null);
    const [visibleTags, setVisibleTags] = useState([]);

    // Сортировка тегов: сначала уровень (level), потом технологии (technology)
    const orderedTags = useMemo(() => {
        if (!candidate.tags || candidate.tags.length === 0) return [];

        const levelTag = candidate.tags.find(t => t.type === "level");
        const techTags = candidate.tags.filter(t => t.type === "technology");

        return [
            ...(levelTag ? [levelTag] : []),
            ...techTags
        ];
    }, [candidate.tags]);

    // Расчет видимых тегов (если не помещаются)
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

            const fake = document.createElement("span");
            fake.className = "tag";
            fake.style.visibility = "hidden";
            fake.style.position = "absolute";
            fake.innerText = tag.name;
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

    const handleCardClick = (e) => {
        // Если кликнули по кнопке, не вызываем onClick карточки
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        onClick?.(candidate);
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        if (onButtonClick) {
            onButtonClick(candidate);
        } else {
            onClick?.(candidate);
        }
    };

    return (
        <div className="candidate-card" onClick={handleCardClick}>
            <div className="candidate-top">
                <img
                    src={candidate.avatar || "/images/avatar.png"}
                    alt="avatar"
                    className="avatar"
                />
                <div className="candidate-info">
                    <div className="name">{candidate.name}</div>
                    <div className="role">{candidate.role}</div>
                </div>
            </div>

            {/* Теги (уровень + технологии) */}
            <div className="candidate-tags" ref={tagsRef}>
                {visibleTags.map((tag) => (
                    <span key={tag.id} className="tag">
                        {tag.name}
                    </span>
                ))}
            </div>

            {showButton && (
                <button className="primary-small" onClick={handleButtonClick}>
                    {buttonText}
                </button>
            )}
        </div>
    );
}