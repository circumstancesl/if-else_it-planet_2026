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
                                       companyAvatar = "/images/company.png"
                                   }) {
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

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

    return (
        <div className="chat-layout">
            <div className="chat-sidebar">
                <button className="back-btn" onClick={onBack}>← Назад</button>

                <div className="chat-user">
                    <img src={companyAvatar} alt={title} />
                    <h3>{title}</h3>
                    <p className="last-seen">{lastSeen}</p>
                    <p className="subtitle">{subtitle}</p>
                </div>

                <div className="chat-contacts">
                    <p className="contacts-title">Контакты</p>
                    <div className="contacts-icons">
                        <span className="contact-icon">📞</span>
                        <span className="contact-icon">📧</span>
                        <span className="contact-icon">💬</span>
                    </div>
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