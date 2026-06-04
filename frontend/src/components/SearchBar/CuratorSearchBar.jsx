import { useNavigate } from "react-router-dom";
import "./CuratorSearchBar.css";

export default function CuratorSearchBar({
                                             search,
                                             setSearch,
                                             onSearch,
                                             onOpenFilters,
                                             onOpenCreate,  // 👈 добавить
                                         }) {
    const navigate = useNavigate();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch?.();
        }
    };

    return (
        <div className="curator-search-wrapper">
            {/* Левая кнопка создания */}
            <button
                className="curator-create-btn"
                onClick={() => onOpenCreate?.()}  // 👈 использовать onOpenCreate
                title="Создать учетную запись куратора"
            >
                <img src="/icons/plus.svg" alt="create" />
                <span className="curator-create-btn-text">Создать учетную запись куратора</span>
            </button>

            {/* Поле поиска */}
            <div className="curator-search-input">
                <div className="curator-search-icon">
                    <img src="/icons/search.svg" alt="search" />
                </div>
                <input
                    type="text"
                    placeholder="Поиск кураторов"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>

            {onOpenFilters && (
                <button className="curator-filter-btn" onClick={onOpenFilters}>
                    <img src="/icons/filter.svg" alt="filter" />
                </button>
            )}

            <button className="curator-find-btn" onClick={onSearch}>
                Найти
            </button>
        </div>
    );
}