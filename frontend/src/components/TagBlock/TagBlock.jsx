import { useState, useEffect, useRef } from "react";
import { useTags } from "../../api/useTags";
// import "./TagBlock.css";

export default function TagBlock({
                                     title,
                                     type,
                                     tags = [],
                                     onAdd,
                                     onRemove,
                                     placeholder = "Поиск тега..."
                                 }) {
    const { tags: allTags, fetchTags, createTag, loading } = useTags();
    const [availableTags, setAvailableTags] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Загружаем теги
    useEffect(() => {
        fetchTags({ type: type });
    }, [type]);

    // Фильтруем теги по типу
    useEffect(() => {
        if (allTags && allTags.length > 0) {
            setAvailableTags(allTags.filter(t => t.type === type));
        }
    }, [allTags, type]);

    // Закрытие дропдауна при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Фильтрация тегов по поиску
    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase()) &&
        !tags.some(t => t.id === tag.id)
    );

    const handleAddTag = (tag) => {
        onAdd(tag);
        setSearch("");
        setShowDropdown(false);
    };

    const handleCreateTag = async () => {
        if (!search.trim()) {
            alert("Введите название тега");
            return;
        }

        setIsCreating(true);
        try {
            const newTag = await createTag({
                name: search.trim(),
                type: type
            });

            if (newTag && newTag.id) {
                onAdd(newTag);
                setSearch("");
                setShowDropdown(false);
                await fetchTags({ type: type });
            }
        } catch (err) {
            console.error("Error creating tag:", err);
            alert(err.message || "Ошибка создания тега");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="tag-block">
            <div className="tag-block-header">
                <span className="tag-block-title">{title}</span>
                <span className="tag-block-count">{tags.length}</span>
            </div>

            <div className="tags-wrapper">
                <div className="tags-list">
                    {tags.map((tag) => (
                        <span key={tag.id} className="tag-item">
                            {tag.name}
                            <button
                                className="tag-remove"
                                onClick={() => onRemove(tag.id)}
                                type="button"
                            >
                                ✕
                            </button>
                        </span>
                    ))}

                    <div className="add-tag-dropdown">
                        <button
                            ref={buttonRef}
                            className="add-tag-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                            type="button"
                        >
                            + Добавить
                        </button>

                        {showDropdown && (
                            <div className="dropdown-menu" ref={dropdownRef}>
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="dropdown-search"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCreateTag();
                                        }
                                    }}
                                />
                                <div className="dropdown-list">
                                    {loading ? (
                                        <div className="dropdown-loading">Загрузка...</div>
                                    ) : filteredTags.length > 0 ? (
                                        <>
                                            {filteredTags.slice(0, 5).map(tag => (
                                                <div
                                                    key={tag.id}
                                                    className="dropdown-item"
                                                    onClick={() => handleAddTag(tag)}
                                                >
                                                    {tag.name}
                                                </div>
                                            ))}
                                            {search && (
                                                <div
                                                    className="dropdown-item create-item"
                                                    onClick={handleCreateTag}
                                                >
                                                    <span className="create-icon">+</span>
                                                    {isCreating ? "Создание..." : `Создать "${search}"`}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div
                                            className="dropdown-item create-item"
                                            onClick={handleCreateTag}
                                        >
                                            <span className="create-icon">+</span>
                                            {isCreating ? "Создание..." : `Создать "${search || 'новый тег'}"`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}