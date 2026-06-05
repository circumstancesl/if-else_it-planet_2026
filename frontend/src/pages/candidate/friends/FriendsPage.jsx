import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import CandidateCard from "../../../components/CandidateCard.jsx";
import GlobalSearchBar from "../../../components/SearchBar/GlobalSearchBar.jsx";
import { useUsers } from "../../../api/useUsers";
import { useConnections } from "../../../api/useConnections";
import { useChat } from "../../../api/useChat";
import "./FriendsPage.css";

export default function FriendsPage() {
    const navigate = useNavigate();
    const { getCandidates, getCandidateProfile, getSuggestedFriends, loading: usersLoading } = useUsers();
    const {
        getFriends,
        getRequests,
        sendRequest,
        acceptRequest,
        rejectRequest,
        loading: connectionLoading
    } = useConnections();
    const { createOrGetChat, loading: chatLoading } = useChat();

    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [possibleFriends, setPossibleFriends] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const friendsData = await getFriends();
                setFriends(friendsData);

                const requestsData = await getRequests();
                setFriendRequests(requestsData);

                const allCandidates = await getCandidates(0, 100);
                setAllUsers(allCandidates);

                try {
                    const suggested = await getSuggestedFriends(20, 0);

                    const formattedSuggested = [];
                    for (const candidate of suggested) {
                        try {
                            const fullProfile = await getCandidateProfile(candidate.userId);
                            formattedSuggested.push({
                                id: candidate.userId,
                                userId: candidate.userId,
                                name: fullProfile?.fullName || candidate.fullName || "Пользователь",
                                role: fullProfile?.jobTitle || candidate.jobTitle || "Соискатель",
                                mutualFriends: candidate.mutualFriendsCount || 0,
                                skills: fullProfile?.skills || [],
                                tags: fullProfile?.Tags || [],
                                online: false,
                                avatar: fullProfile?.avatar || "/images/avatar.png"
                            });
                        } catch (err) {
                            console.error(`Error fetching full profile for ${candidate.userId}:`, err);
                            formattedSuggested.push({
                                id: candidate.userId,
                                userId: candidate.userId,
                                name: candidate.fullName || "Пользователь",
                                role: candidate.jobTitle || "Соискатель",
                                mutualFriends: candidate.mutualFriendsCount || 0,
                                skills: [],
                                tags: [],
                                online: false,
                                avatar: "/images/avatar.png"
                            });
                        }
                    }
                    setPossibleFriends(formattedSuggested);
                } catch (err) {
                    console.error("Error loading suggested friends:", err);
                    const friendIds = new Set(friendsData.map(f => f.id));
                    const requestUserIds = new Set(requestsData.map(r => r.Requester?.id).filter(Boolean));

                    const formattedCandidates = allCandidates
                        .filter(c => !friendIds.has(c.userId) && !requestUserIds.has(c.userId))
                        .map(candidate => ({
                            id: candidate.userId,
                            userId: candidate.userId,
                            name: candidate.fullName || "Пользователь",
                            role: candidate.jobTitle || "Соискатель",
                            mutualFriends: 0,
                            skills: candidate.skills || [],
                            tags: candidate.Tags || [],
                            online: false,
                            avatar: "/images/avatar.png"
                        }));
                    setPossibleFriends(formattedCandidates);
                }
            } catch (err) {
                console.error("Error loading friends data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [getFriends, getRequests, getCandidates, getSuggestedFriends, getCandidateProfile]);

    // Глобальный поиск
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim().length >= 2) {
                setSearchLoading(true);
                const friendIds = new Set(friends.map(f => f.id));
                const requestUserIds = new Set(friendRequests.map(r => r.Requester?.id).filter(Boolean));

                const filteredUsers = allUsers.filter(user => {
                    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
                    const notFriend = !friendIds.has(user.userId);
                    const notRequested = !requestUserIds.has(user.userId);
                    return matchesSearch && notFriend && notRequested;
                });

                const results = [];
                for (const user of filteredUsers) {
                    try {
                        const fullProfile = await getCandidateProfile(user.userId);
                        results.push({
                            id: user.userId,
                            userId: user.userId,
                            name: fullProfile?.fullName || user.fullName || "Пользователь",
                            role: fullProfile?.jobTitle || user.jobTitle || "Соискатель",
                            skills: fullProfile?.skills || [],
                            tags: fullProfile?.Tags || [],
                            online: false,
                            avatar: fullProfile?.avatar || "/images/avatar.png"
                        });
                    } catch (err) {
                        console.error(`Error fetching profile for ${user.userId}:`, err);
                        results.push({
                            id: user.userId,
                            userId: user.userId,
                            name: user.fullName || "Пользователь",
                            role: user.jobTitle || "Соискатель",
                            skills: [],
                            tags: [],
                            online: false,
                            avatar: "/images/avatar.png"
                        });
                    }
                }

                setSearchResults(results);
                setSearchLoading(false);
            } else {
                setSearchResults([]);
            }
        };

        performSearch();
    }, [searchQuery, allUsers, friends, friendRequests, getCandidateProfile]);

    const filteredFriends = useMemo(() => {
        let filtered = friends;
        if (searchQuery && activeTab === "friends") {
            filtered = filtered.filter(friend =>
                friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return filtered;
    }, [friends, searchQuery, activeTab]);

    const filteredOnlineFriends = useMemo(() => {
        return filteredFriends.filter(friend => friend.online);
    }, [filteredFriends]);

    const filteredRequests = useMemo(() => {
        if (!searchQuery || activeTab !== "requests") return friendRequests;
        return friendRequests.filter(request =>
            request.Requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [friendRequests, searchQuery, activeTab]);

    const filteredPossibleFriends = useMemo(() => {
        if (searchQuery) return [];
        return possibleFriends;
    }, [possibleFriends, searchQuery]);

    const onlineCount = friends.filter(f => f.online).length;

    const handleAddFriend = async (friend) => {
        try {
            await sendRequest(friend.id);
            setPossibleFriends(prev => prev.filter(f => f.id !== friend.id));
            setSearchResults(prev => prev.filter(f => f.id !== friend.id));
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

    const handleAcceptRequest = async (connectionId) => {
        try {
            await acceptRequest(connectionId);
            const updatedFriends = await getFriends();
            setFriends(updatedFriends);
            const updatedRequests = await getRequests();
            setFriendRequests(updatedRequests);
            alert("Заявка принята!");
        } catch (err) {
            console.error("Error accepting request:", err);
            alert("Ошибка при принятии заявки");
        }
    };

    const handleRejectRequest = async (connectionId) => {
        try {
            await rejectRequest(connectionId);
            const updatedRequests = await getRequests();
            setFriendRequests(updatedRequests);
            alert("Заявка отклонена");
        } catch (err) {
            console.error("Error rejecting request:", err);
            alert("Ошибка при отклонении заявки");
        }
    };

    const handleMessage = async (friend) => {
        try {
            const chat = await createOrGetChat(friend.id);
            navigate(`/candidate/chat/${chat.id}`);
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат");
        }
    };

    const handleFriendClick = (friend) => {
        if (friend?.id) {
            navigate(`/candidate/friend/${friend.id}`);
        }
    };

    const handlePossibleFriendClick = (friend) => {
        navigate(`/candidate/friend/${friend.userId}`);
    };

    const getCurrentList = () => {
        if (searchQuery.length >= 2) {
            return searchResults;
        }
        switch(activeTab) {
            case "friends":
                return filteredFriends;
            case "online":
                return filteredOnlineFriends;
            case "requests":
                return filteredRequests;
            default:
                return [];
        }
    };

    const getEmptyMessage = () => {
        if (searchQuery.length >= 2) {
            return "Пользователи не найдены";
        }
        switch(activeTab) {
            case "friends":
                return "У вас пока нет друзей";
            case "online":
                return "Нет друзей онлайн";
            case "requests":
                return "Нет входящих заявок";
            default:
                return "";
        }
    };

    if (loading || usersLoading) {
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

    return (
        <div className="page">
            <Header />

            <div className="friends-top-bar">
                <GlobalSearchBar
                    search={searchQuery}
                    setSearch={setSearchQuery}
                    onSearch={() => {}}
                    searchResults={searchResults}
                    loading={searchLoading}
                    onAddFriend={handleAddFriend}
                    onMessage={handleMessage}
                    onViewProfile={(user) => navigate(`/candidate/friend/${user.id}`)}
                />
            </div>

            <div className="container">
                {searchQuery.length < 2 && (
                    <div className="friends-header">
                        <div className="friends-tabs-section">
                            <div className="tabs">
                                <span
                                    className={activeTab === "friends" ? "active" : ""}
                                    onClick={() => setActiveTab("friends")}
                                >
                                    Друзья ({friends.length})
                                </span>
                                <span
                                    className={activeTab === "online" ? "active" : ""}
                                    onClick={() => setActiveTab("online")}
                                >
                                    Онлайн ({onlineCount})
                                </span>
                                <span
                                    className={activeTab === "requests" ? "active" : ""}
                                    onClick={() => setActiveTab("requests")}
                                >
                                    Заявки ({friendRequests.length})
                                </span>
                            </div>
                        </div>

                        <div className="possible-friends-header">
                            <h3>Возможные друзья</h3>
                        </div>
                    </div>
                )}

                <div className="friends-layout">
                    <div className="friends-list">
                        {getCurrentList().length > 0 ? (
                            getCurrentList().map(item => {
                                const friendData = activeTab === "requests" && searchQuery.length < 2 ? item.Requester : item;
                                const isRequest = activeTab === "requests" && searchQuery.length < 2;

                                return (
                                    <CandidateCard
                                        key={friendData?.id}
                                        candidate={friendData}
                                        buttonText={isRequest ? "Принять заявку" : "💬 Сообщение"}
                                        onButtonClick={() => {
                                            if (isRequest) {
                                                handleAcceptRequest(item.id);
                                            } else {
                                                handleMessage(friendData);
                                            }
                                        }}
                                        onClick={() => handleFriendClick(friendData)}
                                    />
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <p>{getEmptyMessage()}</p>
                            </div>
                        )}
                    </div>

                    {searchQuery.length < 2 && (
                        <div className="friends-sidebar">
                            {filteredPossibleFriends.length > 0 ? (
                                <div className="possible-friends-list">
                                    {filteredPossibleFriends.map(friend => (
                                        <CandidateCard
                                            key={friend.id}
                                            candidate={friend}
                                            buttonText="+ Добавить в друзья"
                                            onButtonClick={() => handleAddFriend(friend)}
                                            onClick={() => handlePossibleFriendClick(friend)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>Нет предложений</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}