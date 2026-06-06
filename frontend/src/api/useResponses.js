import { useState, useCallback } from "react";
import { apiClient } from "./client";

export function useResponses() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Откликнуться на вакансию
    const applyToPossibility = useCallback(async (possibilityId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.post('/api/response', { possibilityId });

            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error applying to possibility:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Получить мои отклики (для соискателя)
    const getMyResponses = useCallback(async (status = null) => {
        try {
            setLoading(true);
            setError(null);

            const url = status
                ? `/api/response/my?status=${status}`
                : '/api/response/my';

            const result = await apiClient.get(url);

            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching my responses:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Получить отклики на вакансию (для работодателя)
    const getResponsesForPossibility = useCallback(async (possibilityId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.get(`/api/response/${possibilityId}`);

            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching responses for possibility:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Получить отклик по ID
    const getResponseById = useCallback(async (responseId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.get(`/api/response/${responseId}`);

            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error fetching response by id:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Изменить статус отклика (для работодателя)
    const updateResponseStatus = useCallback(async (responseId, status) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiClient.patch(`/api/response/${responseId}`, { status });

            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error updating response status:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getResponseSummary = async (userId) => {
        try {
            const response = await apiClient.get(`/api/response/summary/${userId}`);
            return response;
        } catch (err) {
            console.error("Error fetching response summary:", err);
            throw err;
        }
    };


    return {
        loading,
        error,
        applyToPossibility,
        getMyResponses,
        getResponsesForPossibility,
        getResponseById,
        getResponseSummary,
        updateResponseStatus
    };
}