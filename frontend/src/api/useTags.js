import { useState } from "react";
import { apiClient } from "./client.js";

export function useTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // получить теги
    const fetchTags = async ({ type, search = "" }) => {
        try {
            setLoading(true);
            setError(null);

            const query = new URLSearchParams();
            if (type) query.append("type", type);
            if (search) query.append("search", search);

            const data = await apiClient.get(`/api/tag?${query.toString()}`);
            setTags(data);

            return data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // создать новый тег
    const createTag = async ({ name, type }) => {
        try {
            const data = await apiClient.post("/api/tag", {
                name,
                type,
            });

            // можно сразу добавить в список
            setTags((prev) => [...prev, data]);

            return data;
        } catch (err) {
            throw err;
        }
    };

    return {
        tags,
        loading,
        error,
        fetchTags,
        createTag,
    };
}