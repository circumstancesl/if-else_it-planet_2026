import { useEffect, useState } from "react";
import { useTags } from "../../api/useTags.js";

export default function TagBlock({
                                     title,
                                     tags,
                                     onAdd,
                                     onRemove,
                                     placeholder,
                                     type
                                 }) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const { fetchTags, createTag } = useTags();

    // 🔍 поиск тегов
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!inputValue.trim()) {
                setSuggestions([]);
                return;
            }

            const result = await fetchTags({
                type,
                search: inputValue
            });

            setSuggestions(result || []);
        }, 300);

        return () => clearTimeout(delay);
    }, [inputValue]);

    const handleSelectTag = (tag) => {
        onAdd(tag);
        setInputValue("");
        setSuggestions([]);
    };

    const handleCreateTag = async () => {
        if (!inputValue.trim()) return;

        try {
            const newTag = await createTag({
                name: inputValue,
                type
            });

            onAdd(newTag);
            setInputValue("");
            setSuggestions([]);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="tag-block">
            <p>{title}</p>

            <div className="tags">
                {tags.map((tag) => (
                    <span
                        key={tag.id}
                        className="tag"
                        onClick={() => onRemove(tag.id)}
                    >
                        {tag.name}
                        <span className="tag-remove">✕</span>
                    </span>
                ))}

                <div className="tag-input-wrapper">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="tag-input"
                    />

                    <button className="add-tag" onClick={handleCreateTag}>
                        +
                    </button>

                    {suggestions.length > 0 && (
                        <div className="tag-dropdown">
                            {suggestions.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="tag-option"
                                    onClick={() => handleSelectTag(tag)}
                                >
                                    {tag.name}
                                </div>
                            ))}
                        </div>
                    )}

                    {inputValue && suggestions.length === 0 && (
                        <div className="tag-dropdown">
                            <div
                                className="tag-option create"
                                onClick={handleCreateTag}
                            >
                                Создать "{inputValue}"
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}