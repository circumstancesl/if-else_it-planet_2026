import { forwardRef } from "react";
import "./SearchBar.css";

const SearchBar = forwardRef(({
                                  search,
                                  setSearch,
                                  onSearch,
                                  onOpenFilters,
                                  leftButton,
                                  rightButtons,
                                  placeholder = "Профессия, должность или компания",
                                  variant = "default",
                                  className = "",
                                  onChange,
                                  onKeyDown
                              }, ref) => {
    const handleChange = (e) => {
        setSearch(e.target.value);
        onChange?.(e);
    };

    const handleKeyDownEvent = (e) => {
        if (e.key === "Enter") {
            onSearch?.();
        }
        onKeyDown?.(e);
    };

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
                    ref={ref}
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={handleChange}
                    onKeyDown={handleKeyDownEvent}
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
});

SearchBar.displayName = "SearchBar";

export default SearchBar;