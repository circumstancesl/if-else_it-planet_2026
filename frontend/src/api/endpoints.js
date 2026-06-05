import { apiClient } from './client';

export const auth = {
    registerCandidate: (data) => {
        console.log("Register candidate request:", data);
        return apiClient.post('/auth/register/candidate', data);
    },

    registerEmployer: (data) =>
        apiClient.post('/auth/register/employer', data),

    login: (credentials) =>
        apiClient.post('/auth/login', credentials),

    logout: (data) =>
        apiClient.post('/api/rejectToken', data)
};

export const users = {
    getMyProfile: () =>
        apiClient.get('/api/users/me'),

    getCandidates: (offset = 0, limit = 20) =>
        apiClient.get(`/api/users?offset=${offset}&limit=${limit}`),

    getCandidateById: (id) =>
        apiClient.get(`/api/users/${id}`),

    updateCandidateProfile: (data) =>
        apiClient.patch('/api/users/candidate', data),

    getCompany: (id) =>
        apiClient.get(`/api/users/company/${id}`),

    updateCompany: (data) =>
        apiClient.patch('/api/users/company', data),

    getSuggestedFriends: (limit = 20, offset = 0) =>
        apiClient.get(`/api/users/candidate/suggested?limit=${limit}&offset=${offset}`),
    uploadAvatar: (formData) => {
        // formData - это объект FormData
        return apiClient.patch('/api/users/candidate', formData);
        // apiClient сам определит, что это FormData и не будет
        // устанавливать Content-Type
    },

    uploadCompanyLogo: (formData) => {
        return apiClient.patch('/api/users/company', formData);
    }

};

export const tags = {
    get: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/tag${query ? `?${query}` : ""}`);
    },

    create: (data) =>
        apiClient.post('/api/tag', data)
};

export const possibilities = {
    create: (data) =>
        apiClient.post('/api/possibility', data),

    getMy: (status) =>
        apiClient.get(`/api/possibility/me${status ? `?status=${status}` : ""}`),

    getAll: (offset = 0, limit = 20) =>
        apiClient.get(`/guest/possibility?offset=${offset}&limit=${limit}`),

    getById: (id) =>
        apiClient.get(`/api/possibility/${id}`),

    update: (id, data) =>
        apiClient.patch(`/api/possibility/${id}`, data),

    delete: (id) =>
        apiClient.delete(`/api/possibility/${id}`),

    getByCompanyId: (companyId, limit = 10, offset = 0) =>
        apiClient.get(`/api/possibility/company/${companyId}?limit=${limit}&offset=${offset}`),
};

export const favorites = {
    getAll: () =>
        apiClient.get('/api/favorite'),

    add: (itemId, type = 'possibility') =>
        apiClient.post('/api/favorite', { itemId, type }),

    remove: (itemId) =>
        apiClient.delete('/api/favorite', { data: { itemId } })
};

export const responses = {
    apply: (possibilityId) =>
        apiClient.post('/api/response', { possibilityId }),

    getMy: (status) =>
        apiClient.get(status ? `/api/response/my?status=${status}` : '/api/response/my'),

    getForPossibility: (possibilityId) =>
        apiClient.get(`/api/response/${possibilityId}`),

    updateStatus: (responseId, status) =>
        apiClient.patch(`/api/response/${responseId}`, { status }),

    getById: (responseId) =>
        apiClient.get(`/api/response/${responseId}`)
};

export const connections = {
    sendRequest: (userId) =>
        apiClient.post(`/api/connection/${userId}`),

    acceptRequest: (connectionId) =>
        apiClient.patch(`/api/connection/${connectionId}/accept`),

    rejectRequest: (connectionId) =>
        apiClient.patch(`/api/connection/${connectionId}/reject`),

    getFriends: () =>
        apiClient.get('/api/connection'),

    getRequests: () =>
        apiClient.get('/api/connection/requests')
};

export const admin = {
    createCurator: (email, password, name) =>
        apiClient.post('/api/admin', { email, password, name }),

    deleteCurator: (id) =>
        apiClient.delete(`/api/admin/${id}`),

    getCurators: () =>
        apiClient.get('/api/admin')
};

export const chat = {
    create: (userId) =>
        apiClient.post('/api/chat', { userId }),

    getMyChats: () =>
        apiClient.get('/api/chat'),

    getMessages: (chatId) =>
        apiClient.get(`/api/chat/${chatId}`)
};