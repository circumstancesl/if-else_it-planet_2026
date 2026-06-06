import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import ChatLayout from "../../components/Chat/ChatLayout.jsx";
import { useChat } from "../../api/useChat";
import { useUsers } from "../../api/useUsers";
import { getSocket, sendMessage, onNewMessage, joinChats } from "../../api/socket";
import "./ChatPage.css";
import "../../components/Chat/ChatLayout.css";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/PageLoader.jsx";


export default function ChatPage() {
    const { chatId } = useParams();
    const { user } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const { getChatMessages, getMyChats, loading } = useChat();
    const { getCandidateProfile } = useUsers();

    // Получаем данные из state (при переходе из CandidatePage)
    const candidateNameFromState = location.state?.candidateName;
    const candidateRoleFromState = location.state?.candidateRole;
    const eventTitleFromState = location.state?.eventTitle;
    const eventIdFromState = location.state?.eventId;
    const candidateAvatarFromState = location.state?.candidateAvatar;

    const [messages, setMessages] = useState([]);
    const [chatInfo, setChatInfo] = useState({
        title: candidateNameFromState || "Загрузка...",
        subtitle: candidateRoleFromState || "",
        lastSeen: "",
        eventTitle: eventTitleFromState || null,
        avatar: candidateAvatarFromState || null
    });
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const messagesEndRef = useRef(null);

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

    // Загружаем информацию о чате (имя собеседника) если нет из state
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
                            const avatarUrl = profile?.logoUrl ? getFullImageUrl(profile.logoUrl) : null;
                            setChatInfo(prev => ({
                                ...prev,
                                title: prev.title === "Загрузка..." ? fullName : prev.title,
                                subtitle: prev.subtitle || profile?.jobTitle || "",
                                avatar: prev.avatar || avatarUrl
                            }));
                        } catch {
                            setChatInfo(prev => ({
                                ...prev,
                                title: prev.title === "Загрузка..." ? (partner.name || "Пользователь") : prev.title,
                            }));
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading chat info:", err);
            }
        };

        if (currentUserId && chatId && !candidateNameFromState) {
            loadChatInfo();
        }
    }, [chatId, currentUserId, getMyChats, getCandidateProfile, candidateNameFromState]);

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
                <PageLoader />
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
                    companyAvatar={chatInfo.avatar}
                    eventTitle={chatInfo.eventTitle}
                    userRole={user?.role}  // ← добавляем
                />
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}