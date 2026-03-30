import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import ChatLayout from "../../components/Chat/ChatLayout.jsx";
import { useChat } from "../../api/useChat";
import { useUsers } from "../../api/useUsers";
import { getSocket, sendMessage, onNewMessage, joinChats } from "../../api/socket";
import "./ChatPage.css";
import "../../components/Chat/ChatLayout.css";

export default function ChatPage() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { getChatMessages, getMyChats, loading } = useChat();
    const { getCandidateProfile } = useUsers();

    const [messages, setMessages] = useState([]);
    const [chatInfo, setChatInfo] = useState({
        title: "Загрузка...",
        subtitle: "",
        lastSeen: ""
    });
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const messagesEndRef = useRef(null);

    // Получаем userId из localStorage при загрузке
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        console.log("Current user ID from localStorage:", userId);
        setCurrentUserId(userId);
    }, []);

    // Проверяем подключение WebSocket
    useEffect(() => {
        const socket = getSocket();
        if (socket && socket.connected) {
            setSocketConnected(true);
            console.log("Socket already connected");
            joinChats();
        } else {
            console.log("Socket not connected, waiting...");
            const checkInterval = setInterval(() => {
                const s = getSocket();
                if (s && s.connected) {
                    setSocketConnected(true);
                    joinChats();
                    clearInterval(checkInterval);
                }
            }, 1000);
            return () => clearInterval(checkInterval);
        }
    }, []);

    // Загружаем информацию о чате (имя собеседника)
    useEffect(() => {
        const loadChatInfo = async () => {
            try {
                const chats = await getMyChats();
                const currentChat = chats.find(chat => chat.id === chatId);
                if (currentChat && currentChat.Users) {
                    // Находим собеседника (не текущего пользователя)
                    const partner = currentChat.Users.find(user => user.id !== currentUserId);
                    if (partner) {
                        // Получаем полный профиль собеседника
                        try {
                            const profile = await getCandidateProfile(partner.id);
                            const fullName = profile?.fullName || partner.name || "Пользователь";
                            setChatInfo(prev => ({
                                ...prev,
                                title: fullName,
                                subtitle: profile?.jobTitle || ""
                            }));
                        } catch {
                            setChatInfo(prev => ({
                                ...prev,
                                title: partner.name || "Пользователь",
                                subtitle: ""
                            }));
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading chat info:", err);
            }
        };

        if (currentUserId && chatId) {
            loadChatInfo();
        }
    }, [chatId, currentUserId, getMyChats, getCandidateProfile]);

    useEffect(() => {
        if (chatId) {
            loadMessages();

            const unsubscribe = onNewMessage((newMessage) => {
                console.log("New message received:", newMessage);
                if (newMessage.chatId === chatId) {
                    setMessages(prev => [...prev, newMessage]);
                }
            });

            return unsubscribe;
        }
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const data = await getChatMessages(chatId);
            console.log("Messages loaded:", data);
            setMessages(data || []);
        } catch (err) {
            console.error("Error loading messages:", err);
            setError("Не удалось загрузить сообщения");
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim() || sending) return;

        setSending(true);
        try {
            const success = sendMessage(chatId, text);
            if (!success) {
                alert("Не удалось отправить сообщение. Проверьте подключение.");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Ошибка при отправке сообщения");
        } finally {
            setSending(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatMessages = (messagesList) => {
        console.log("Formatting messages, currentUserId:", currentUserId);
        return messagesList.map(msg => ({
            id: msg.id,
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            sender: msg.senderId === currentUserId ? "me" : "them",
            date: new Date(msg.createdAt).toLocaleDateString('ru-RU')
        }));
    };

    if (loading && messages.length === 0) {
        return (
            <div className="page">
                <Header />
                <div className="container chat-container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка сообщений...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <Header />
                <div className="container chat-container">
                    <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Header />

            <div className="container chat-container">
                <ChatLayout
                    title={chatInfo.title}
                    subtitle={chatInfo.subtitle}
                    lastSeen={chatInfo.lastSeen}
                    messages={formatMessages(messages)}
                    onBack={handleBack}
                    onSendMessage={handleSendMessage}
                    sending={sending}
                />
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}