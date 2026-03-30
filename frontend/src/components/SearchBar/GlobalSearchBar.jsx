import { useState } from "react";
import SearchBar from "./SearchBar";
import "./SearchBar.css";

export default function GlobalSearchBar({
                                            search,
                                            setSearch,
                                            onSearch,
                                            onOpenFilters,
                                            onAddFriend,
                                            onMessage,
                                            onViewProfile,
                                            searchResults = [],
                                            loading = false
                                        }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSearch = () => {
        if (search.trim().length >= 2) {
            onSearch?.();
            setShowDropdown(true);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.trim().length >= 2) {
            onSearch?.();
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleResultClick = (result) => {
        onViewProfile?.(result);
        setShowDropdown(false);
        setSearch("");
    };

    return (
        <div className="global-search-wrapper">
            <SearchBar
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
                onOpenFilters={onOpenFilters}
                placeholder="Поиск людей по имени или профессии..."
                variant="default"
                className="global-search-bar"
            />

            {showDropdown && search.trim().length >= 2 && (
                <div className="search-dropdown">
                    {loading ? (
                        <div className="search-loading">Поиск...</div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="search-dropdown-header">
                                <span>Результаты поиска: {searchResults.length}</span>
                            </div>
                            {searchResults.map((result) => (
                                <div key={result.id} className="search-result-item">
                                    <div
                                        className="search-result-info"
                                        onClick={() => handleResultClick(result)}
                                    >
                                        <img
                                            src={result.avatar || "/images/avatar.png"}
                                            alt={result.name}
                                            className="search-result-avatar"
                                        />
                                        <div>
                                            <div className="search-result-name">{result.name}</div>
                                            <div className="search-result-role">{result.role}</div>
                                        </div>
                                    </div>
                                    <div className="search-result-actions">
                                        <button
                                            className="primary-small"
                                            onClick={() => {
                                                onMessage?.(result);
                                                setShowDropdown(false);
                                            }}
                                            title="Написать сообщение"
                                        >
                                            💬
                                        </button>
                                        <button
                                            className="secondary-small"
                                            onClick={() => {
                                                onAddFriend?.(result);
                                                setShowDropdown(false);
                                            }}
                                            title="Добавить в друзья"
                                        >
                                            + Друг
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="search-empty">
                            <p>Ничего не найдено</p>
                            <button
                                className="primary-small"
                                onClick={() => {
                                    setShowDropdown(false);
                                    setSearch("");
                                }}
                            >
                                Очистить
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}