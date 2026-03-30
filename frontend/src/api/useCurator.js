import { useState, useCallback } from "react";
import { apiClient } from "./client";

export function useCurator() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Получить список компаний с фильтром по статусу
    const getCompanies = useCallback(async (verification_status = null) => {
        try {
            setLoading(true);
            setError(null);
            const url = verification_status
                ? `/api/curator?verification_status=${verification_status}`
                : '/api/curator';
            const result = await apiClient.get(url);
            return result || [];
        } catch (err) {
            setError(err.message);
            console.error("Error fetching companies:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Изменить статус верификации компании
    const updateCompanyStatus = useCallback(async (companyId, status) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.patch(`/api/curator/${companyId}`, { status });
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error updating company status:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getCompanies,
        updateCompanyStatus
    };
}