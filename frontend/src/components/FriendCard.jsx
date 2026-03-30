import "./FriendCard.css";

export default function FriendCard({
                                       friend,
                                       variant,
                                       onAddFriend,
                                       onAccept,
                                       onReject,
                                       onMessage,
                                       onClick,
                                       showActions = false
                                   }) {
    const isSuggest = variant === "suggest";
    const isRequest = showActions;

    const handleCardClick = (e) => {
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        onClick?.();
    };

    // Карточка для входящих заявок
    if (isRequest) {
        return (
            <div className="friend-card-request" onClick={handleCardClick}>
                <div className="friend-card-left">
                    <img
                        src={friend.avatar || "/img/jobseeker.jpg"}
                        alt={friend.name}
                        className="friend-avatar-small"
                    />
                    <div className="friend-info">
                        <div className="friend-name">{friend.name}</div>
                        <div className="friend-role">{friend.role}</div>
                    </div>
                </div>
                <div className="request-actions">
                    <button
                        className="accept-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAccept?.();
                        }}
                    >
                        ✓ Принять
                    </button>
                    <button
                        className="reject-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onReject?.();
                        }}
                    >
                        ✕ Отклонить
                    </button>
                </div>
            </div>
        );
    }

    // Карточка для возможных друзей (предложений)
    if (isSuggest) {
        return (
            <div className="friend-card-suggest" onClick={handleCardClick}>
                <div className="friend-card-top">
                    <img
                        src={friend.avatar || "/images/avatar.png"}
                        alt={friend.name}
                        className="friend-avatar"
                    />
                    <div className="friend-card-info">
                        <div className="friend-name">{friend.name}</div>
                        <div className="friend-role">{friend.role}</div>
                        {friend.mutualFriends > 0 && (
                            <div className="mutual-friends">
                                {friend.mutualFriends} общих друзей
                            </div>
                        )}
                    </div>
                </div>

                {friend.skills && friend.skills.length > 0 && (
                    <div className="friend-skills">
                        {friend.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                        ))}
                    </div>
                )}

                <div className="friend-actions">
                    <button
                        className="primary-small add-friend-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddFriend?.(friend);
                        }}
                    >
                        + Добавить в друзья
                    </button>
                    {/*<button*/}
                    {/*    className="secondary-small message-btn"*/}
                    {/*    onClick={(e) => {*/}
                    {/*        e.stopPropagation();*/}
                    {/*        onMessage?.(friend);*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    💬 Сообщение*/}
                    {/*</button>*/}
                </div>
            </div>
        );
    }


    // Обычная карточка друга
    return (
        <div className="friend-card" onClick={handleCardClick}>
            <div className="friend-card-left">
                <div className="friend-avatar-wrapper">
                    <img
                        src={friend.avatar || "/images/avatar.png"}
                        alt={friend.name}
                        className="friend-avatar-small"
                    />
                    {friend.online && <span className="online-dot"></span>}
                </div>

                <div className="friend-info">
                    <div className="friend-name">{friend.name}</div>
                    <div className="friend-role">{friend.role}</div>
                </div>
            </div>

            <button
                className="primary-small message-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onMessage?.(friend);
                }}
            >
                💬 Сообщение
            </button>
        </div>
    );
}