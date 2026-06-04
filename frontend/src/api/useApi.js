import { useState, useCallback } from 'react';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall(...args);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Произошла ошибка';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, request };
};