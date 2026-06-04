import { useState, useCallback } from 'react';
import { users } from './endpoints.js';
import { useApi } from './useApi';

export const useCompanies = () => {
    const [company, setCompany] = useState(null);
    const { loading, error, request } = useApi();

    const getCompany = useCallback(async (id) => {
        const data = await request(users.getCompany, id);
        setCompany(data);
        return data;
    }, [request]);

    const updateCompany = useCallback(async (companyData) => {
        const data = await request(users.updateCompany, companyData);
        setCompany(prev => ({ ...prev, ...data })); // обновляем локальное состояние
        return data;
    }, [request]);

    return {
        company,
        loading,
        error,
        getCompany,
        updateCompany
    };
};