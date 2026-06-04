import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import FriendCard from "../../../components/FriendCard.jsx";
import { useUsers } from "../../../api/useUsers";
import { useConnections } from "../../../api/useConnections";
import { useChat } from "../../../api/useChat";
import "./FriendProfilePage.css";

export default function FriendProfilePage() {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const { getCandidateProfile, getCandidates, loading: usersLoading } = useUsers();
    const {
        sendRequest,
        acceptRequest,
        rejectRequest,
        getFriends,
        getRequests,
        loading: connectionLoading
    } = useConnections();
    const { createOrGetChat, loading: chatLoading } = useChat();

    const [friend, setFriend] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [possibleFriends, setPossibleFriends] = useState([]);
    const [friendStatus, setFriendStatus] = useState(null);
    const [pendingConnectionId, setPendingConnectionId] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true);
                const data = await getCandidateProfile(friendId);
                if (data) {
                    setFriend({
                        id: data.userId,
                        userId: data.userId,
                        name: data.fullName || "Пользователь",
                        role: data.jobTitle || "Соискатель",
                        skills: data.skills || [],
                        about: data.about || "Нет информации",
                        education: data.university ? `${data.university}${data.graduationYear ? `, ${data.graduationYear}` : ""}` : null,
                        contacts: {
                            phone: data.phone || null,
                            telegram: data.telegram || null,
                            email: data.email || null
                        },
                        portfolio: data.portfolio || [],
                        avatar: data.avatar || "/images/avatar.png"
                    });
                }

                const friendsList = await getFriends();
                const isFriend = friendsList.some(f => f.id === friendId);
                const requestsList = await getRequests();

                if (isFriend) {
                    setFriendStatus('friend');
                } else {
                    const receivedRequest = requestsList.find(r => r.Requester?.id === friendId);
                    const sentRequest = requestsList.find(r => r.Receiver?.id === friendId);
                    if (receivedRequest) {
                        setFriendStatus('pending_received');
                        setPendingConnectionId(receivedRequest.id);
                    } else if (sentRequest) {
                        setFriendStatus('pending_sent');
                    } else {
                        setFriendStatus('none');
                    }
                }

                const candidates = await getCandidates(0, 5);
                const friendIds = new Set(friendsList.map(f => f.id));
                const requestUserIds = new Set(requestsList.map(r => r.Requester?.id).filter(Boolean));
                const formattedCandidates = candidates
                    .filter(c => !friendIds.has(c.userId) && !requestUserIds.has(c.userId) && c.userId !== friendId)
                    .map(candidate => ({
                        id: candidate.userId,
                        userId: candidate.userId,
                        name: candidate.fullName || "Пользователь",
                        role: candidate.jobTitle || "Соискатель",
                        mutualFriends: 0,
                        skills: [],
                        avatar: "/images/avatar.png"
                    }));
                setPossibleFriends(formattedCandidates);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [friendId, getCandidateProfile, getCandidates, getFriends, getRequests]);

    const handleAddFriend = async () => {
        try {
            await sendRequest(friendId);
            setFriendStatus('pending_sent');
            alert("Заявка отправлена!");
        } catch (err) {
            if (err.message === "Заявка уже отправлена") {
                setFriendStatus('pending_sent');
                alert("Заявка уже отправлена");
            } else if (err.message === "Нельзя добавить себя") {
                alert("Нельзя добавить себя в друзья");
            } else {
                alert("Ошибка при отправке заявки");
            }
        }
    };

    const handleAcceptRequest = async () => {
        try {
            await acceptRequest(pendingConnectionId);
            setFriendStatus('friend');
            alert("Заявка принята!");
        } catch (err) {
            console.error("Error accepting request:", err);
            alert("Ошибка при принятии заявки");
        }
    };

    const handleRejectRequest = async () => {
        try {
            await rejectRequest(pendingConnectionId);
            setFriendStatus('none');
            alert("Заявка отклонена");
        } catch (err) {
            console.error("Error rejecting request:", err);
            alert("Ошибка при отклонении заявки");
        }
    };

    const handleMessage = async () => {
        try {
            const chat = await createOrGetChat(friendId);
            navigate(`/candidate/chat/${chat.id}`);
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат");
        }
    };

    if (profileLoading || usersLoading) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка...
                    </div>
                </div>
            </div>
        );
    }

    if (!friend) {
        return (
            <div className="page">
                <Header />
                <div className="container">
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>Пользователь не найден</p>
                        <button className="primary-small" onClick={() => navigate(-1)}>Назад</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Header />

            <div className="container candidate-page">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Назад
                </button>

                <div className="candidate-layout">
                    <div className="main">
                        <div className="avatar-section">
                            <div className="avatar big">
                                <img src={friend.avatar} alt="avatar" />
                            </div>

                            <div className="portfolio-text">Связаться:</div>

                            <div className="contact-icons">
                                {friend.contacts?.phone && (
                                    <a href={`tel:${friend.contacts.phone}`} className="icon-link">📞</a>
                                )}
                                {friend.contacts?.telegram && (
                                    <a href={`https://t.me/${friend.contacts.telegram}`} className="icon-link">💬</a>
                                )}
                                {friend.contacts?.email && (
                                    <a href={`mailto:${friend.contacts.email}`} className="icon-link">📧</a>
                                )}
                            </div>

                            {friend.portfolio && friend.portfolio.length > 0 && (
                                <>
                                    <div className="portfolio-text">Портфолио:</div>
                                    <div className="portfolio-icons">
                                        {friend.portfolio.map((item, idx) => (
                                            <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="info-section">
                            <h1>{friend.name}</h1>
                            <p className="role">{friend.role}</p>

                            <div className="skills-tags">
                                {friend.skills?.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                            </div>

                            <div className="action-buttons">
                                <button className="btn-accept" onClick={handleMessage}>
                                    💬 Написать сообщение
                                </button>

                                {friendStatus === 'friend' && (
                                    <button className="btn-reserve" disabled style={{ opacity: 0.6, cursor: 'default' }}>
                                        ✓ Уже в друзьях
                                    </button>
                                )}

                                {friendStatus === 'pending_sent' && (
                                    <button className="btn-reserve" disabled style={{ opacity: 0.6, cursor: 'default' }}>
                                        ⏳ Заявка отправлена
                                    </button>
                                )}

                                {friendStatus === 'pending_received' && (
                                    <div className="request-actions-buttons">
                                        <button className="btn-accept-small" onClick={handleAcceptRequest} disabled={connectionLoading}>
                                            {connectionLoading ? "..." : "✓ Принять"}
                                        </button>
                                        <button className="btn-reject-small" onClick={handleRejectRequest} disabled={connectionLoading}>
                                            {connectionLoading ? "..." : "✕ Отклонить"}
                                        </button>
                                    </div>
                                )}

                                {friendStatus === 'none' && (
                                    <button className="btn-reserve" onClick={handleAddFriend} disabled={connectionLoading}>
                                        {connectionLoading ? "Отправка..." : "+ Добавить в друзья"}
                                    </button>
                                )}
                            </div>

                            <div className="inner-profile-section">
                                <h3>О себе</h3>
                                <p>{friend.about}</p>
                            </div>

                            {friend.education && (
                                <div className="inner-profile-section">
                                    <h3>Образование</h3>
                                    <p>{friend.education}</p>
                                </div>
                            )}

                            <div className="inner-profile-section">
                                <h3>Навыки</h3>
                                <div className="skills-full">
                                    {friend.skills?.map((skill, idx) => (
                                        <span key={idx} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="candidate-page-sidebar">
                        <h3>Возможные друзья</h3>
                        {possibleFriends.length === 0 ? (
                            <p className="empty-other">Нет предложений</p>
                        ) : (
                            <div className="possible-friends-list">
                                {possibleFriends.map((possible) => (
                                    <FriendCard
                                        key={possible.id}
                                        friend={possible}
                                        variant="suggest"
                                        onAddFriend={() => sendRequest(possible.userId)}
                                        onMessage={() => handleMessage(possible)}
                                        onClick={() => navigate(`/candidate/friend/${possible.userId}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}