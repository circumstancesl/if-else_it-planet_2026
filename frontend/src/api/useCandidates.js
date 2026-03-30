import { useState, useCallback } from 'react';
import { users } from './endpoints.js';
import { useApi } from './useApi';

export const useCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [total, setTotal] = useState(0);
    const { loading, error, request } = useApi();

    const getCandidates = useCallback(async (offset = 0, limit = 10) => {
        const data = await request(users.getCandidates, offset, limit);
        setCandidates(data.candidates || data);
        setTotal(data.total || data.length);
        return data;
    }, [request]);

    const getCandidateById = useCallback(async (id) => {
        const data = await request(users.getCandidateById, id);
        setSelectedCandidate(data);
        return data;
    }, [request]);

    const updateProfile = useCallback(async (profileData) => {
        const data = await request(users.updateCandidateProfile, profileData);
        if (selectedCandidate?.id === data.id) {
            setSelectedCandidate(data);
        }
        return data;
    }, [request, selectedCandidate]);

    return {
        candidates,
        selectedCandidate,
        total,
        loading,
        error,
        getCandidates,
        getCandidateById,
        updateProfile
    };
};