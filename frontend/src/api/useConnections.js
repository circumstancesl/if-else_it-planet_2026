import { useState, useCallback } from "react";
import { apiClient } from "./client";

export function useConnections() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Отправить заявку в друзья
    const sendRequest = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.post(`/api/connection/${userId}`);
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error sending friend request:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Принять заявку
    const acceptRequest = useCallback(async (connectionId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.patch(`/api/connection/${connectionId}/accept`);
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error accepting friend request:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Отклонить заявку
    const rejectRequest = useCallback(async (connectionId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.patch(`/api/connection/${connectionId}/reject`);
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error rejecting friend request:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Получить список друзей
    const getFriends = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.get('/api/connection');
            console.log("Friends API response:", result); // 👈 добавить лог
            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching friends:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);


    // Получить список заявок
    const getRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.get('/api/connection/requests');
            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching friend requests:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        sendRequest,
        acceptRequest,
        rejectRequest,
        getFriends,
        getRequests
    };
}