import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header.jsx";
import FriendCard from "../../../components/FriendCard.jsx";
import GlobalSearchBar from "../../../components/SearchBar/GlobalSearchBar.jsx";
import { useUsers } from "../../../api/useUsers";
import { useConnections } from "../../../api/useConnections";
import { useChat } from "../../../api/useChat";
import "./FriendsPage.css";
import PageLoader from "../../../components/PageLoader.jsx";

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
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // Пагинация для вкладки "Все"
    const [allUsersList, setAllUsersList] = useState([]);
    const [allUsersOffset, setAllUsersOffset] = useState(0);
    const [allUsersHasMore, setAllUsersHasMore] = useState(true);
    const [allUsersLoading, setAllUsersLoading] = useState(false);
    const allUsersLimit = 10;

    // Бесконечный скролл
    const lastElementRef = useRef(null);

    const getFullImageUrl = useCallback((url) => {
        if (!url) return "/img/jobseeker.jpg";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}${url}`;
        }
        return url;
    }, []);

    // Загрузка всех пользователей с пагинацией (с полными профилями)
    const loadAllUsers = useCallback(async (reset = true) => {
        if (allUsersLoading) return;

        if (reset) {
            setAllUsersLoading(true);
        }

        try {
            const offset = reset ? 0 : allUsersOffset;
            const data = await getCandidates(offset, allUsersLimit);

            const formattedUsers = [];
            for (const user of data) {
                try {
                    const fullProfile = await getCandidateProfile(user.userId);
                    formattedUsers.push({
                        id: user.userId,
                        userId: user.userId,
                        name: fullProfile?.fullName || user.fullName || "Пользователь",
                        role: fullProfile?.jobTitle && fullProfile.jobTitle.trim() !== ""
                            ? fullProfile.jobTitle
                            : (user.jobTitle && user.jobTitle.trim() !== "" ? user.jobTitle : "Должность пуста"),
                        avatar: getFullImageUrl(fullProfile?.logoUrl) || "/img/jobseeker.jpg",
                        online: false,
                        tags: fullProfile?.Tags || [],
                        skills: fullProfile?.skills || []
                    });
                } catch (err) {
                    console.error(`Error loading full profile for ${user.userId}:`, err);
                    formattedUsers.push({
                        id: user.userId,
                        userId: user.userId,
                        name: user.fullName || "Пользователь",
                        role: user.jobTitle && user.jobTitle.trim() !== "" ? user.jobTitle : "Должность пуста",
                        avatar: "/img/jobseeker.jpg",
                        online: false,
                        tags: [],
                        skills: []
                    });
                }
            }

            if (reset) {
                setAllUsersList(formattedUsers);
                setAllUsersOffset(formattedUsers.length);
                setAllUsersHasMore(data.length === allUsersLimit);
            } else {
                setAllUsersList(prev => [...prev, ...formattedUsers]);
                setAllUsersOffset(prev => prev + formattedUsers.length);
                setAllUsersHasMore(data.length === allUsersLimit);
            }
        } catch (err) {
            console.error("Error loading all users:", err);
        } finally {
            if (reset) {
                setAllUsersLoading(false);
            }
        }
    }, [allUsersOffset, allUsersLoading, getCandidates, getCandidateProfile, getFullImageUrl]);

    // Настройка Intersection Observer для бесконечного скролла
    useEffect(() => {
        if (activeTab === "all" && !isSearching && allUsersHasMore && !allUsersLoading && allUsersList.length > 0) {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && allUsersHasMore && !allUsersLoading) {
                        loadAllUsers(false);
                    }
                },
                { threshold: 0.1, rootMargin: "100px" }
            );

            if (lastElementRef.current) {
                observer.observe(lastElementRef.current);
            }

            return () => {
                if (lastElementRef.current) {
                    observer.unobserve(lastElementRef.current);
                }
            };
        }
    }, [activeTab, isSearching, allUsersHasMore, allUsersLoading, allUsersList.length, loadAllUsers]);

    // При поиске переключаемся на вкладку "Все"
    useEffect(() => {
        if (submittedSearch.length >= 2) {
            setActiveTab("all");
            setIsSearching(true);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    }, [submittedSearch]);

    // Загрузка при смене вкладки "Все"
    useEffect(() => {
        if (activeTab === "all" && allUsersList.length === 0 && !isSearching && !loading) {
            loadAllUsers(true);
        }
    }, [activeTab, isSearching, loading, loadAllUsers]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Загрузка друзей с полными профилями
                const friendsData = await getFriends();
                const formattedFriends = [];
                for (const friend of friendsData) {
                    try {
                        const fullProfile = await getCandidateProfile(friend.id || friend.userId);
                        formattedFriends.push({
                            id: friend.id || friend.userId,
                            userId: friend.userId || friend.id,
                            name: fullProfile?.fullName || friend.fullName || friend.name || "Пользователь",
                            role: fullProfile?.jobTitle || friend.jobTitle || friend.role || "Соискатель",
                            avatar: getFullImageUrl(fullProfile?.logoUrl) || getFullImageUrl(friend.avatar || friend.logoUrl) || "/img/jobseeker.jpg",
                            online: friend.online || false,
                            tags: fullProfile?.Tags || friend.Tags || friend.tags || [],
                            skills: fullProfile?.skills || friend.skills || []
                        });
                    } catch (err) {
                        formattedFriends.push({
                            id: friend.id || friend.userId,
                            userId: friend.userId || friend.id,
                            name: friend.fullName || friend.name || "Пользователь",
                            role: friend.jobTitle || friend.role || "Соискатель",
                            avatar: getFullImageUrl(friend.avatar || friend.logoUrl) || "/img/jobseeker.jpg",
                            online: friend.online || false,
                            tags: friend.Tags || friend.tags || [],
                            skills: friend.skills || []
                        });
                    }
                }
                setFriends(formattedFriends);

                // Загрузка заявок с полными профилями
                const requestsData = await getRequests();
                const formattedRequests = [];
                for (const request of requestsData) {
                    try {
                        const fullProfile = await getCandidateProfile(request.Requester?.id || request.Requester?.userId);
                        formattedRequests.push({
                            ...request,
                            Requester: {
                                id: request.Requester?.id || request.Requester?.userId,
                                userId: request.Requester?.userId || request.Requester?.id,
                                name: fullProfile?.fullName || request.Requester?.fullName || request.Requester?.name || "Пользователь",
                                role: fullProfile?.jobTitle || request.Requester?.jobTitle || request.Requester?.role || "Соискатель",
                                avatar: getFullImageUrl(fullProfile?.logoUrl) || getFullImageUrl(request.Requester?.avatar || request.Requester?.logoUrl) || "/img/jobseeker.jpg",
                                tags: fullProfile?.Tags || request.Requester?.Tags || request.Requester?.tags || []
                            }
                        });
                    } catch (err) {
                        formattedRequests.push({
                            ...request,
                            Requester: {
                                id: request.Requester?.id || request.Requester?.userId,
                                userId: request.Requester?.userId || request.Requester?.id,
                                name: request.Requester?.fullName || request.Requester?.name || "Пользователь",
                                role: request.Requester?.jobTitle || request.Requester?.role || "Соискатель",
                                avatar: getFullImageUrl(request.Requester?.avatar || request.Requester?.logoUrl) || "/img/jobseeker.jpg",
                                tags: request.Requester?.Tags || request.Requester?.tags || []
                            }
                        });
                    }
                }
                setFriendRequests(formattedRequests);

                const allCandidates = await getCandidates(0, 100);
                setAllUsers(allCandidates);

                // Загрузка возможных друзей с полными профилями
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
                                role: fullProfile?.jobTitle && fullProfile.jobTitle.trim() !== ""
                                    ? fullProfile.jobTitle
                                    : (candidate.jobTitle && candidate.jobTitle.trim() !== "" ? candidate.jobTitle : "Должность пуста"),
                                mutualFriends: candidate.mutualFriendsCount || 0,
                                skills: fullProfile?.skills || [],
                                tags: fullProfile?.Tags || [],
                                online: false,
                                avatar: getFullImageUrl(fullProfile?.logoUrl) || "/img/jobseeker.jpg"
                            });
                        } catch (err) {
                            console.error(`Error loading full profile for suggested friend ${candidate.userId}:`, err);
                            formattedSuggested.push({
                                id: candidate.userId,
                                userId: candidate.userId,
                                name: candidate.fullName || "Пользователь",
                                role: candidate.jobTitle && candidate.jobTitle.trim() !== ""
                                    ? candidate.jobTitle
                                    : "Должность пуста",
                                mutualFriends: candidate.mutualFriendsCount || 0,
                                skills: [],
                                tags: [],
                                online: false,
                                avatar: "/img/jobseeker.jpg"
                            });
                        }
                    }
                    setPossibleFriends(formattedSuggested);
                } catch (err) {
                    console.error("Error loading suggested friends:", err);
                }
            } catch (err) {
                console.error("Error loading friends data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [getFriends, getRequests, getCandidates, getSuggestedFriends, getCandidateProfile, getFullImageUrl]);

    // Глобальный поиск - выполняется только при submittedSearch
    useEffect(() => {
        const performSearch = async () => {
            if (submittedSearch.trim().length >= 2) {
                setSearchLoading(true);

                const results = [];
                for (const user of allUsers.slice(0, 50)) {
                    const matchesSearch = user.fullName?.toLowerCase().includes(submittedSearch.toLowerCase());
                    if (!matchesSearch) continue;

                    try {
                        const fullProfile = await getCandidateProfile(user.userId);
                        results.push({
                            id: user.userId,
                            userId: user.userId,
                            name: fullProfile?.fullName || user.fullName || "Пользователь",
                            role: fullProfile?.jobTitle && fullProfile.jobTitle.trim() !== ""
                                ? fullProfile.jobTitle
                                : "Должность пуста",
                            skills: fullProfile?.skills || [],
                            tags: fullProfile?.Tags || [],
                            online: false,
                            avatar: getFullImageUrl(fullProfile?.logoUrl) || "/img/jobseeker.jpg"
                        });
                    } catch (err) {
                        results.push({
                            id: user.userId,
                            userId: user.userId,
                            name: user.fullName || "Пользователь",
                            role: user.jobTitle && user.jobTitle.trim() !== ""
                                ? user.jobTitle
                                : "Должность пуста",
                            skills: [],
                            tags: [],
                            online: false,
                            avatar: "/img/jobseeker.jpg"
                        });
                    }
                }

                setSearchResults(results);
                setSearchLoading(false);
            }
        };

        performSearch();
    }, [submittedSearch, allUsers, getCandidateProfile, getFullImageUrl]);

    const handleSearch = () => {
        if (searchQuery.trim().length >= 2) {
            setSubmittedSearch(searchQuery);
        } else {
            setSubmittedSearch("");
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleResetSearch = useCallback(() => {
        setSearchQuery("");
        setSubmittedSearch("");
        setSearchResults([]);
        setIsSearching(false);
        setActiveTab("all");
    }, []);

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
            // Обновляем данные после принятия заявки
            const updatedFriends = await getFriends();
            const formattedFriends = [];
            for (const friend of updatedFriends) {
                try {
                    const fullProfile = await getCandidateProfile(friend.id || friend.userId);
                    formattedFriends.push({
                        id: friend.id || friend.userId,
                        userId: friend.userId || friend.id,
                        name: fullProfile?.fullName || friend.fullName || friend.name || "Пользователь",
                        role: fullProfile?.jobTitle || friend.jobTitle || friend.role || "Соискатель",
                        avatar: getFullImageUrl(fullProfile?.logoUrl) || getFullImageUrl(friend.avatar || friend.logoUrl) || "/img/jobseeker.jpg",
                        online: friend.online || false,
                        tags: fullProfile?.Tags || friend.Tags || friend.tags || [],
                        skills: fullProfile?.skills || friend.skills || []
                    });
                } catch (err) {
                    formattedFriends.push({
                        id: friend.id || friend.userId,
                        userId: friend.userId || friend.id,
                        name: friend.fullName || friend.name || "Пользователь",
                        role: friend.jobTitle || friend.role || "Соискатель",
                        avatar: getFullImageUrl(friend.avatar || friend.logoUrl) || "/img/jobseeker.jpg",
                        online: friend.online || false,
                        tags: friend.Tags || friend.tags || [],
                        skills: friend.skills || []
                    });
                }
            }
            setFriends(formattedFriends);

            const updatedRequests = await getRequests();
            const formattedRequests = [];
            for (const request of updatedRequests) {
                try {
                    const fullProfile = await getCandidateProfile(request.Requester?.id || request.Requester?.userId);
                    formattedRequests.push({
                        ...request,
                        Requester: {
                            id: request.Requester?.id || request.Requester?.userId,
                            userId: request.Requester?.userId || request.Requester?.id,
                            name: fullProfile?.fullName || request.Requester?.fullName || request.Requester?.name || "Пользователь",
                            role: fullProfile?.jobTitle || request.Requester?.jobTitle || request.Requester?.role || "Соискатель",
                            avatar: getFullImageUrl(fullProfile?.logoUrl) || getFullImageUrl(request.Requester?.avatar || request.Requester?.logoUrl) || "/img/jobseeker.jpg",
                            tags: fullProfile?.Tags || request.Requester?.Tags || request.Requester?.tags || []
                        }
                    });
                } catch (err) {
                    formattedRequests.push({
                        ...request,
                        Requester: {
                            id: request.Requester?.id || request.Requester?.userId,
                            userId: request.Requester?.userId || request.Requester?.id,
                            name: request.Requester?.fullName || request.Requester?.name || "Пользователь",
                            role: request.Requester?.jobTitle || request.Requester?.role || "Соискатель",
                            avatar: getFullImageUrl(request.Requester?.avatar || request.Requester?.logoUrl) || "/img/jobseeker.jpg",
                            tags: request.Requester?.Tags || request.Requester?.tags || []
                        }
                    });
                }
            }
            setFriendRequests(formattedRequests);
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
            const formattedRequests = [];
            for (const request of updatedRequests) {
                try {
                    const fullProfile = await getCandidateProfile(request.Requester?.id || request.Requester?.userId);
                    formattedRequests.push({
                        ...request,
                        Requester: {
                            id: request.Requester?.id || request.Requester?.userId,
                            userId: request.Requester?.userId || request.Requester?.id,
                            name: fullProfile?.fullName || request.Requester?.fullName || request.Requester?.name || "Пользователь",
                            role: fullProfile?.jobTitle || request.Requester?.jobTitle || request.Requester?.role || "Соискатель",
                            avatar: getFullImageUrl(fullProfile?.logoUrl) || getFullImageUrl(request.Requester?.avatar || request.Requester?.logoUrl) || "/img/jobseeker.jpg",
                            tags: fullProfile?.Tags || request.Requester?.Tags || request.Requester?.tags || []
                        }
                    });
                } catch (err) {
                    formattedRequests.push({
                        ...request,
                        Requester: {
                            id: request.Requester?.id || request.Requester?.userId,
                            userId: request.Requester?.userId || request.Requester?.id,
                            name: request.Requester?.fullName || request.Requester?.name || "Пользователь",
                            role: request.Requester?.jobTitle || request.Requester?.role || "Соискатель",
                            avatar: getFullImageUrl(request.Requester?.avatar || request.Requester?.logoUrl) || "/img/jobseeker.jpg",
                            tags: request.Requester?.Tags || request.Requester?.tags || []
                        }
                    });
                }
            }
            setFriendRequests(formattedRequests);
            alert("Заявка отклонена");
        } catch (err) {
            console.error("Error rejecting request:", err);
            alert("Ошибка при отклонении заявки");
        }
    };

    const handleMessage = async (friend) => {
        try {
            const chat = await createOrGetChat(friend.id);
            // Передаем все данные о друге в чат
            navigate(`/candidate/friends/chat/${chat.id}`, {
                state: {
                    candidateName: friend.name,
                    candidateRole: friend.role,
                    candidateAvatar: friend.avatar,
                    eventTitle: null,
                    eventId: null
                }
            });
        } catch (err) {
            console.error("Error opening chat:", err);
            alert("Не удалось открыть чат");
        }
    };

    const handleFriendClick = (friend) => {
        if (friend?.id) {
            navigate(`/candidate/friends/${friend.id}`);
        }
    };

    const handlePossibleFriendClick = (friend) => {
        navigate(`/candidate/friends/${friend.userId}`);
    };

    const getCurrentList = () => {
        if (submittedSearch.length >= 2) {
            return searchResults;
        }
        switch(activeTab) {
            case "all":
                return allUsersList;
            case "friends":
                return friends;
            case "online":
                return friends.filter(f => f.online);
            case "requests":
                return friendRequests.map(r => r.Requester);
            default:
                return [];
        }
    };

    const getEmptyMessage = () => {
        if (submittedSearch.length >= 2) {
            return "Пользователи не найдены";
        }
        switch(activeTab) {
            case "all":
                return allUsersLoading ? "Загрузка..." : "Нет пользователей";
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
                <PageLoader />
            </div>
        );
    }

    const currentList = getCurrentList();

    return (
        <div className="page">
            <Header />

            <div className="friends-top-bar">
                <GlobalSearchBar
                    search={searchQuery}
                    setSearch={setSearchQuery}
                    onSearch={handleSearch}
                    onReset={handleResetSearch}
                    searchResults={searchResults}
                    loading={searchLoading}
                    onAddFriend={handleAddFriend}
                    onMessage={handleMessage}
                    onViewProfile={(user) => navigate(`/candidate/friends/${user.id}`)}
                />
            </div>

            <div className="container">
                {submittedSearch.length < 2 && (
                    <div className="friends-header">
                        <div className="friends-tabs-section">
                            <div className="tabs">
                                <span
                                    className={activeTab === "all" ? "active" : ""}
                                    onClick={() => setActiveTab("all")}
                                >
                                    Все
                                </span>
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
                                    Онлайн ({friends.filter(f => f.online).length})
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
                        {currentList.length > 0 ? (
                            <>
                                {currentList.map((friend, index) => {
                                    const isRequest = activeTab === "requests" && submittedSearch.length < 2;
                                    const connectionId = isRequest ? friendRequests.find(r => r.Requester?.id === friend.id)?.id : null;
                                    const isLastElement = activeTab === "all" && !isSearching && index === currentList.length - 1;

                                    return (
                                        <div
                                            key={friend.id}
                                            ref={isLastElement ? lastElementRef : null}
                                        >
                                            {isRequest ? (
                                                <FriendCard
                                                    friend={friend}
                                                    variant="request"
                                                    onAccept={() => handleAcceptRequest(connectionId)}
                                                    onReject={() => handleRejectRequest(connectionId)}
                                                    onClick={() => handleFriendClick(friend)}
                                                />
                                            ) : (
                                                <FriendCard
                                                    friend={friend}
                                                    variant="friend"
                                                    onMessage={() => handleMessage(friend)}
                                                    onClick={() => handleFriendClick(friend)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                                {activeTab === "all" && !isSearching && allUsersLoading && (
                                    <div className="load-more-container">
                                        <div className="loading-spinner">Загрузка ещё...</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <p>{getEmptyMessage()}</p>
                                {activeTab === "all" && !isSearching && !allUsersLoading && (
                                    <button
                                        className="primary-small"
                                        onClick={() => loadAllUsers(true)}
                                        style={{ marginTop: "16px" }}
                                    >
                                        Попробовать снова
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {submittedSearch.length < 2 && (
                        <div className="friends-sidebar">
                            {possibleFriends.length > 0 ? (
                                <div className="possible-friends-list">
                                    {possibleFriends.map(friend => (
                                        <FriendCard
                                            key={friend.id}
                                            friend={friend}
                                            variant="suggest"
                                            onAddFriend={() => handleAddFriend(friend)}
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