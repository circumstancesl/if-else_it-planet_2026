import { useState, useCallback } from "react";
import { apiClient } from "./client";

export function useAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createCurator = useCallback(async (email, password, name) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.post('/api/admin', { email, password, name });
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error creating curator:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Удалить куратора
    const deleteCurator = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.delete(`/api/admin/${id}`);
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error deleting curator:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCurators = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.get('/api/admin');
            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching curators:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createCurator,
        deleteCurator,
        getCurators
    };
}