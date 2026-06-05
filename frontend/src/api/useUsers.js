import { useState, useCallback } from "react";
import { apiClient } from "./client";

export function useUsers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCandidates = useCallback(async (offset = 0, limit = 20) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.get(`/api/users?offset=${offset}&limit=${limit}`);

            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching candidates:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getCandidateProfile = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.get(`/api/users/${userId}`);

            return result;
        } catch (err) {
            setError(err.message);
            console.error(`Error fetching candidate profile ${userId}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMyProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.get('/api/users/me');

            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error fetching my profile:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔥 НОВАЯ ФУНКЦИЯ
    const getSuggestedFriends = useCallback(async (limit = 20, offset = 0) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.get(`/api/users/candidate/suggested?limit=${limit}&offset=${offset}`);

            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching suggested friends:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getCandidates,
        getCandidateProfile,
        getMyProfile,
        getSuggestedFriends, // 🔥 ДОБАВЛЕНО
    };
}