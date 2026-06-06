import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../components/Header/Header.jsx";
import CandidateCard from "../../../components/CandidateCard.jsx";
import { useUsers } from "../../../api/useUsers";
import { useConnections } from "../../../api/useConnections";
import { useChat } from "../../../api/useChat";
import "./FriendProfilePage.css";

export default function FriendProfilePage() {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const { getCandidateProfile, getCandidates, getSuggestedFriends, loading: usersLoading } = useUsers();
    const {
        sendRequest,
        acceptRequest,
        rejectRequest,
        getFriends,
        getRequests,
        removeFriend,
        loading: connectionLoading
    } = useConnections();
    const { createOrGetChat, loading: chatLoading } = useChat();

    const [friend, setFriend] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [possibleFriends, setPossibleFriends] = useState([]);
    const [friendStatus, setFriendStatus] = useState(null);
    const [pendingConnectionId, setPendingConnectionId] = useState(null);

    // Функция для получения полного URL изображения
    const getFullImageUrl = (url) => {
        if (!url) return "/img/jobseeker.jpg";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true);
                const data = await getCandidateProfile(friendId);
                console.log("Friend profile data:", data);

                if (data) {
                    setFriend({
                        id: data.userId,
                        userId: data.userId,
                        name: data.fullName || "Пользователь",
                        role: data.jobTitle || "Соискатель",
                        skills: data.skills || [],
                        tags: data.Tags || [],
                        about: data.about || "Нет информации",
                        university: data.university || null,
                        graduationYear: data.graduationYear || null,
                        phone: data.phone || null,
                        telegram: data.telegram || null,
                        email: data.email || null,
                        resumeURL: data.resumeURL || null,
                        logoUrl: data.logoUrl || null,
                        portfolio: data.portfolio || [],
                        avatar: getFullImageUrl(data.logoUrl) || "/img/jobseeker.jpg"
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

                // Загружаем рекомендованных друзей
                try {
                    const suggested = await getSuggestedFriends(5, 0);
                    const friendIds = new Set(friendsList.map(f => f.id));
                    const requestUserIds = new Set(requestsList.map(r => r.Requester?.id).filter(Boolean));

                    const formattedSuggested = [];
                    for (const candidate of suggested) {
                        if (!friendIds.has(candidate.userId) && !requestUserIds.has(candidate.userId) && candidate.userId !== friendId) {
                            try {
                                const fullProfile = await getCandidateProfile(candidate.userId);
                                formattedSuggested.push({
                                    id: candidate.userId,
                                    userId: candidate.userId,
                                    name: fullProfile?.fullName || candidate.fullName || "Пользователь",
                                    // Используем желаемую должность из профиля, если есть
                                    role: fullProfile?.jobTitle && fullProfile.jobTitle.trim() !== ""
                                        ? fullProfile.jobTitle
                                        : "Соискатель",
                                    mutualFriends: candidate.mutualFriendsCount || 0,
                                    skills: fullProfile?.skills || [],
                                    tags: fullProfile?.Tags || [],
                                    avatar: getFullImageUrl(fullProfile?.logoUrl) || "/img/jobseeker.jpg"
                                });
                            } catch (err) {
                                console.error(`Error fetching profile for ${candidate.userId}:`, err);
                                formattedSuggested.push({
                                    id: candidate.userId,
                                    userId: candidate.userId,
                                    name: candidate.fullName || "Пользователь",
                                    role: candidate.jobTitle && candidate.jobTitle.trim() !== ""
                                        ? candidate.jobTitle
                                        : "Соискатель",
                                    mutualFriends: candidate.mutualFriendsCount || 0,
                                    skills: [],
                                    tags: [],
                                    avatar: "/img/jobseeker.jpg"
                                });
                            }
                        }
                    }
                    setPossibleFriends(formattedSuggested);
                } catch (err) {
                    console.error("Error loading suggested friends:", err);
                    const candidates = await getCandidates(0, 5);
                    const friendIds = new Set(friendsList.map(f => f.id));
                    const requestUserIds = new Set(requestsList.map(r => r.Requester?.id).filter(Boolean));

                    const formattedCandidates = [];
                    for (const candidate of candidates) {
                        if (!friendIds.has(candidate.userId) && !requestUserIds.has(candidate.userId) && candidate.userId !== friendId) {
                            try {
                                const fullProfile = await getCandidateProfile(candidate.userId);
                                formattedCandidates.push({
                                    id: candidate.userId,
                                    userId: candidate.userId,
                                    name: fullProfile?.fullName || candidate.fullName || "Пользователь",
                                    role: fullProfile?.jobTitle && fullProfile.jobTitle.trim() !== ""
                                        ? fullProfile.jobTitle
                                        : "Соискатель",
                                    mutualFriends: 0,
                                    skills: fullProfile?.skills || [],
                                    tags: fullProfile?.Tags || [],
                                    avatar: getFullImageUrl(fullProfile?.logoUrl) || "/img/jobseeker.jpg"
                                });
                            } catch (err) {
                                formattedCandidates.push({
                                    id: candidate.userId,
                                    userId: candidate.userId,
                                    name: candidate.fullName || "Пользователь",
                                    role: candidate.jobTitle && candidate.jobTitle.trim() !== ""
                                        ? candidate.jobTitle
                                        : "Соискатель",
                                    mutualFriends: 0,
                                    skills: [],
                                    tags: [],
                                    avatar: "/img/jobseeker.jpg"
                                });
                            }
                        }
                    }
                    setPossibleFriends(formattedCandidates);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [friendId, getCandidateProfile, getCandidates, getSuggestedFriends, getFriends, getRequests]);

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

    const handleRemoveFriend = async () => {
        if (window.confirm("Вы уверены, что хотите удалить этого пользователя из друзей?")) {
            try {
                await removeFriend(friendId);
                setFriendStatus('none');
                alert("Пользователь удален из друзей");
                const friendsList = await getFriends();
                const isFriend = friendsList.some(f => f.id === friendId);
                if (!isFriend) {
                    setFriendStatus('none');
                }
            } catch (err) {
                console.error("Error removing friend:", err);
                alert("Ошибка при удалении из друзей");
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

    const handleAddPossibleFriend = async (friend) => {
        try {
            await sendRequest(friend.id);
            setPossibleFriends(prev => prev.filter(f => f.id !== friend.id));
            alert("Заявка отправлена!");
        } catch (err) {
            if (err.message === "Заявка уже отправлена") {
                alert("Заявка уже отправлена");
            } else if (err.message === "Нельзя добавить себя") {
                alert("Нельзя добавить себя в друзья");
            } else {
                alert("Ошибка при отправке заявки");
            }
        }
    };

    // Получаем технологические теги и уровень
    const technologyTags = friend?.tags?.filter(tag => tag.type === 'technology') || [];
    const levelTags = friend?.tags?.filter(tag => tag.type === 'level') || [];

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

                            {/*<div className="portfolio-text">Связаться:</div>*/}

                            <div className="contact-icons">
                                {friend.phone && (
                                    <a href={`tel:${friend.phone}`} className="icon-link">📞</a>
                                )}
                                {friend.telegram && (
                                    <a href={`https://t.me/${friend.telegram}`} className="icon-link">💬</a>
                                )}
                                {friend.email && (
                                    <a href={`mailto:${friend.email}`} className="icon-link">📧</a>
                                )}
                            </div>

                            {friend.resumeURL && (
                                <>
                                    <div className="portfolio-text">Резюме:</div>
                                    <div className="portfolio-icons">
                                        <a href={friend.resumeURL} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                                            Смотреть резюме
                                        </a>
                                    </div>
                                </>
                            )}

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

                            {/* Уровень */}
                            {levelTags.length > 0 && (
                                <div className="skills-tags">
                                    {levelTags.map((tag) => (
                                        <span key={tag.id} className="skill-tag">{tag.name}</span>
                                    ))}
                                </div>
                            )}

                            <div className="action-buttons">
                                <button className="btn-accept" onClick={handleMessage}>
                                    Написать сообщение
                                </button>

                                {friendStatus === 'friend' && (
                                    <button className="btn-reject" onClick={handleRemoveFriend} disabled={connectionLoading}>
                                        {connectionLoading ? "Удаление..." : "✕ Удалить из друзей"}
                                    </button>
                                )}

                                {friendStatus === 'pending_sent' && (
                                    <button className="btn-reserve" disabled style={{ opacity: 0.6, cursor: 'default' }}>
                                        Заявка отправлена
                                    </button>
                                )}

                                {friendStatus === 'pending_received' && (
                                    <>
                                        <button className="btn-accept" onClick={handleAcceptRequest} disabled={connectionLoading}>
                                            {connectionLoading ? "..." : "✓ Принять"}
                                        </button>
                                        <button className="btn-reject" onClick={handleRejectRequest} disabled={connectionLoading}>
                                            {connectionLoading ? "..." : "✕ Отклонить"}
                                        </button>
                                    </>
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

                            {(friend.university || friend.graduationYear) && (
                                <div className="inner-profile-section">
                                    <h3>Образование</h3>
                                    <p>
                                        {friend.university}
                                        {friend.university && friend.graduationYear && ", "}
                                        {friend.graduationYear && `${new Date().getFullYear() - friend.graduationYear + 4}-й курс`}
                                    </p>
                                </div>
                            )}

                            {technologyTags.length > 0 && (
                                <div className="inner-profile-section">
                                    <h3>Навыки</h3>
                                    <div className="skills-full">
                                        {technologyTags.map(tag => (
                                            <span key={tag.id} className="skill-tag">{tag.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {friend.skills?.length > 0 && technologyTags.length === 0 && (
                                <div className="inner-profile-section">
                                    <h3>Навыки</h3>
                                    <div className="skills-full">
                                        {friend.skills.map((skill, idx) => (
                                            <span key={idx} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="friends-sidebar">
                        <div className="possible-friends-header">
                            <h3>Возможные друзья</h3>
                        </div>

                        {possibleFriends.length > 0 ? (
                            <div className="possible-friends-list">
                                {possibleFriends.map((possible) => (
                                    <CandidateCard
                                        key={possible.id}
                                        candidate={possible}
                                        buttonText="+ Добавить в друзья"
                                        onButtonClick={() => handleAddPossibleFriend(possible)}
                                        onClick={() =>
                                            navigate(`/candidate/friend/${possible.userId}`)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-small">
                                <p>Нет предложений</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}