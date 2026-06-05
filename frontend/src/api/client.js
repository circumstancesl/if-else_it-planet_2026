const API_URL = import.meta.env.VITE_API_URL;
console.log('API_URL:', API_URL);

class ApiClient {
    constructor() {
        this.baseURL = API_URL;
    }

    getToken() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            console.log('Token found, length:', token.length);
        } else {
            console.warn('No token found in storage');
        }
        return token;
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        console.log(`Request: ${options.method || 'GET'} ${endpoint}`);

        // Определяем, является ли тело FormData
        const isFormData = options.body instanceof FormData;

        const headers = {
            ...options.headers
        };

        // Устанавливаем Content-Type только если это не FormData
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        // Если isFormData === true, НЕ устанавливаем Content-Type
        // Браузер сам добавит нужный boundary

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set');
        } else {
            console.warn('No token for request:', endpoint);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            console.log(`Response status: ${response.status} for ${endpoint}`);

            const contentType = response.headers.get('content-type');

            if (!response.ok) {
                let errorMessage;
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    errorMessage = error.message || 'API request failed';
                } else {
                    errorMessage = await response.text();
                }
                console.error(`API Error ${response.status}:`, errorMessage);
                throw new Error(errorMessage || `HTTP ${response.status}`);
            }

            if (response.status === 204) {
                console.log('No content response');
                return null;
            }

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`API Response [${endpoint}]:`, data);
                return data;
            }

            const text = await response.text();
            console.log(`API Response [${endpoint}] (text):`, text);
            return text;

        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, data) {
        // Если data - FormData, не преобразуем в JSON
        const isFormData = data instanceof FormData;
        const options = { method: 'POST' };

        if (isFormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }

        return this.request(endpoint, options);
    }

    patch(endpoint, data) {
        // Если data - FormData, не преобразуем в JSON
        const isFormData = data instanceof FormData;
        const options = { method: 'PATCH' };

        if (isFormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }

        return this.request(endpoint, options);
    }

    delete(endpoint, data) {
        const options = { method: 'DELETE' };
        if (data) {
            const isFormData = data instanceof FormData;
            if (isFormData) {
                options.body = data;
            } else {
                options.body = JSON.stringify(data);
            }
        }
        return this.request(endpoint, options);
    }
}

export const apiClient = new ApiClient();