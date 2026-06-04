import "./SearchBar.css";

export default function SearchBar({
                                      search,
                                      setSearch,
                                      onSearch,
                                      onOpenFilters,
                                      leftButton,
                                      rightButtons,
                                      placeholder = "Профессия, должность или компания",
                                      variant = "default",
                                      className = "",
                                  }) {
    return (
        <div className={`search-wrapper ${variant} ${className}`}>
            {leftButton && (
                <div className="left-button">
                    {leftButton}
                </div>
            )}

            <div className="search-input">
                <span className="search-icon">
                    <img src="/icons/search.svg" alt="search" />
                </span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                />
            </div>

            {onOpenFilters && (
                <button className="filter-btn" onClick={onOpenFilters}>
                    <img src="/icons/filter.svg" alt="filter" />
                </button>
            )}

            <button className="find-btn" onClick={onSearch}>
                Найти
            </button>

            {rightButtons && (
                <div className="right-buttons">
                    {rightButtons}
                </div>
            )}
        </div>
    );
}