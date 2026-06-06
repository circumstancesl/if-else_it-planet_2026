import { useState, useRef, useEffect, useCallback } from "react";
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
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const [submittedSearch, setSubmittedSearch] = useState("");

    // Закрытие дропдауна при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Показываем дропдаун когда есть результаты поиска
    useEffect(() => {
        if (submittedSearch.trim().length >= 2) {
            if (searchResults.length > 0 || loading) {
                setShowDropdown(true);
            } else if (searchResults.length === 0 && !loading) {
                setShowDropdown(true);
            }
        } else {
            setShowDropdown(false);
        }
    }, [submittedSearch, searchResults, loading]);

    const handleSearch = useCallback(() => {
        if (search.trim().length >= 2) {
            setSubmittedSearch(search);
            onSearch?.();
        } else {
            // При пустом поле сбрасываем всё
            setSubmittedSearch("");
            setShowDropdown(false);
            onSearch?.(); // Вызываем onSearch чтобы родитель знал о сбросе
        }
    }, [search, onSearch]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setSearch(value);

        // Если поле стало пустым - сбрасываем всё
        if (value.trim().length === 0) {
            setSubmittedSearch("");
            setShowDropdown(false);
            onSearch?.(); // Уведомляем родителя о сбросе
        } else if (value.trim().length < 2) {
            setSubmittedSearch("");
            setShowDropdown(false);
        }
    }, [setSearch, onSearch]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    }, [handleSearch]);

    const handleResultClick = useCallback((result) => {
        onViewProfile?.(result);
        setShowDropdown(false);
        setSubmittedSearch("");
        setSearch("");
        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    }, [onViewProfile, setSearch]);

    const handleClear = useCallback(() => {
        setShowDropdown(false);
        setSubmittedSearch("");
        setSearch("");
        onSearch?.(); // Уведомляем родителя о сбросе
        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    }, [setSearch, onSearch]);

    const handleButtonAction = useCallback((action, result) => {
        action?.(result);
        setShowDropdown(false);
        setSubmittedSearch("");
        setSearch("");
        onSearch?.(); // Уведомляем родителя о сбросе
        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    }, [onSearch]);

    return (
        <div className="global-search-wrapper" ref={wrapperRef}>
            <SearchBar
                ref={inputRef}
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
                onOpenFilters={onOpenFilters}
                placeholder="Поиск людей по имени..."
                variant="default"
                className="global-search-bar"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />

            {showDropdown && submittedSearch.trim().length >= 2 && (
                <div className="search-dropdown">
                    {loading ? (
                        <div className="search-loading">
                            <div className="spinner"></div>
                            <span>Поиск...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="search-dropdown-header">
                                <span>Результаты поиска: {searchResults.length}</span>
                            </div>
                            <div className="search-dropdown-list">
                                {searchResults.map((result) => (
                                    <div key={result.id} className="search-result-item">
                                        <div
                                            className="search-result-info"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResultClick(result);
                                            }}
                                        >
                                            <img
                                                src={result.avatar || "/img/jobseeker.jpg"}
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleButtonAction(onMessage, result);
                                                }}
                                                title="Написать сообщение"
                                            >
                                                💬
                                            </button>
                                            <button
                                                className="secondary-small"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleButtonAction(onAddFriend, result);
                                                }}
                                                title="Добавить в друзья"
                                            >
                                                + Друг
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="search-empty">
                            <p>Ничего не найдено</p>
                            <button
                                className="primary-small"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleClear();
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