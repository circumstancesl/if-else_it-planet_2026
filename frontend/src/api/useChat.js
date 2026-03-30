import { useState, useCallback } from "react";
import { apiClient } from "./client";

export function useChat() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createOrGetChat = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.post('/api/chat', { userId });
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error creating/getting chat:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMyChats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.get('/api/chat');
            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching chats:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getChatMessages = useCallback(async (chatId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.get(`/api/chat/${chatId}`);
            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching messages:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createOrGetChat,
        getMyChats,
        getChatMessages
    };
}