import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatLayout.css";

export default function ChatLayout({
                                       title,
                                       subtitle,
                                       lastSeen,
                                       messages,
                                       onBack,
                                       onSendMessage,
                                       sending = false,
                                       companyAvatar = "/images/company.png",
                                       eventTitle = null,
                                       userRole = "candidate",
                                       isEmployer = false
                                   }) {
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Функция для получения полного URL изображения
    const getFullImageUrl = (url) => {
        if (!url) return "/images/company.png";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (text.trim() && !sending) {
            onSendMessage?.(text);
            setText("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !sending) {
            e.preventDefault();
            handleSend();
        }
    };

    const avatarUrl = getFullImageUrl(companyAvatar);

    // Определяем, что нужно отображать
    // Для соискателя в чате с работодателем: показываем актуальное имя работодателя (title)
    // Для работодателя: показываем имя соискателя
    const displayTitle = title;
    const displaySubtitle = subtitle;

    // Для соискателя показываем название мероприятия, для работодателя - должность + вакансия
    const showEventTitle = userRole === "candidate" ? false : true;

    return (
        <div className="chat-layout">
            <div className="chat-sidebar">
                <button className="back-btn" onClick={onBack}>← Назад</button>

                <div className="chat-user">
                    <img src={avatarUrl} alt={title} />
                    <h3>{displayTitle}</h3>
                    <p className="last-seen">{lastSeen}</p>
                    {/* Все подписи в едином стиле */}
                    {userRole === "candidate" ? (
                        <p className="subtitle">{subtitle}</p>
                    ) : (
                        <>
                            <p className="subtitle">{subtitle}</p>
                            {eventTitle && <p className="subtitle">{eventTitle}</p>}
                        </>
                    )}
                </div>
            </div>

            <div className="chat-main">
                <div className="messages" ref={messagesContainerRef}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                    <input
                        className="chat-input"
                        placeholder={sending ? "Отправка..." : "Написать ответ..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={sending || !text.trim()}
                    >
                        ↑
                    </button>
                </div>
            </div>
        </div>
    );
}