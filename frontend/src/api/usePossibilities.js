import { useState } from "react";
import { apiClient } from "./client";

export function usePossibilities() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createPossibility = async (data) => {
        try {
            setLoading(true);
            setError(null);
            return await apiClient.post("/api/possibility", data);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getMyPossibilities = async (status) => {
        const query = status ? `?status=${status}` : "";
        return await apiClient.get(`/api/possibility/me${query}`);
    };

    const updatePossibility = async (id, data) => {
        return await apiClient.patch(`/api/possibility/${id}`, data);
    };

    const deletePossibility = async (id) => {
        return await apiClient.delete(`/api/possibility/${id}`);
    };

    const getPossibilityById = async (id) => {
        return await apiClient.get(`/api/possibility/${id}`);
    };

    const getAllPossibilities = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const query = new URLSearchParams(params).toString();
            const response = await apiClient.get(`/guest/possibility?${query}`);
            return response;
        } catch (err) {
            setError(err.message);
            console.error("Error fetching possibilities:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createPossibility,
        getMyPossibilities,
        updatePossibility,
        deletePossibility,
        getPossibilityById,
        getAllPossibilities,
    };
}