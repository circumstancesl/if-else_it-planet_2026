import "./ChatLayout.css";

export default function MessageBubble({ msg }) {
    if (msg.type === "system") {
        return (
            <div className="message-system">
                <span className="system-date">{msg.date}</span>
                <div className="system-box">{msg.text}</div>
            </div>
        );
    }

    return (
        <div className={`message ${msg.sender === "me" ? "me" : "them"}`}>
            <div className="bubble">{msg.text}</div>
            <span className="time">{msg.time}</span>
        </div>
    );
}