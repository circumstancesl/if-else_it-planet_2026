import { createContext, useContext, useEffect, useState } from "react";
import { auth, users } from "../api/endpoints";
import { initSocket, disconnectSocket } from "../api/socket";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    };

    const getRefreshToken = () => {
        return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
    };

    const saveTokens = (token, refreshToken, rememberMe) => {
        console.log("Saving tokens, rememberMe:", rememberMe);
        if (rememberMe) {
            localStorage.setItem("token", token);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
            console.log("Tokens saved to localStorage");
        } else {
            sessionStorage.setItem("token", token);
            if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
            console.log("Tokens saved to sessionStorage");
        }

        // Проверяем, что токен сохранился
        const savedToken = rememberMe ? localStorage.getItem("token") : sessionStorage.getItem("token");
        console.log("Saved token exists:", !!savedToken);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = getToken();
        console.log("checkAuth - token exists:", !!token);

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await users.getMyProfile();
            console.log("Auth check - userData:", userData);

            if (userData && typeof userData === 'object' && userData.role) {
                // Получаем ID пользователя
                const userId = userData.id || userData.profile?.userId;
                console.log("User ID from profile:", userId);

                setUser(userData);
                localStorage.setItem('userId', userId);
                initSocket(token);
            } else {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log("Decoded token:", payload);

                const userInfo = {
                    role: payload.role,
                    id: payload.id,
                    email: payload.email,
                    name: payload.name || (payload.role === 'curator' ? 'Куратор' : payload.role === 'admin' ? 'Администратор' : 'Пользователь')
                };
                setUser(userInfo);
                // Сохраняем userId из токена
                localStorage.setItem('userId', payload.id);
                initSocket(token);
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("refreshToken");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, rememberMe = false) => {
        console.log("login called with rememberMe:", rememberMe);
        setLoading(true);
        setError(null);
        try {
            const data = await auth.login({ email, password });
            console.log("Login response:", data);

            if (data.token) {
                saveTokens(data.token, data.refreshToken, rememberMe);

                // Декодируем токен, чтобы получить userId
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                console.log("Decoded token from login:", payload);
                localStorage.setItem('userId', payload.id);

                await checkAuth();
                initSocket(data.token);
            } else {
                console.error("No token in login response");
            }

            return data;
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Ошибка входа");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loginAdmin = async (email, password, rememberMe = false) => {
        console.log("loginAdmin called");
        setLoading(true);
        setError(null);
        try {
            const data = await auth.login({ email, password });
            console.log("Admin login response:", data);

            if (!data.token) {
                throw new Error("Неверный ответ от сервера");
            }

            saveTokens(data.token, data.refreshToken, rememberMe);
            await checkAuth();
            initSocket(data.token);

            // Проверяем роль после загрузки
            setTimeout(() => {
                const currentUser = getToken() ? user : null;
                if (currentUser?.role !== 'admin') {
                    console.error("Wrong role:", currentUser?.role);
                    throw new Error('Доступ разрешен только для администраторов');
                }
            }, 100);

            return data;
        } catch (err) {
            console.error("Admin login error:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("refreshToken");
            setError(err.message || "Ошибка входа для администратора");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loginCurator = async (email, password, rememberMe = false) => {
        console.log("loginCurator called");
        setLoading(true);
        setError(null);
        try {
            const data = await auth.login({ email, password });
            console.log("Curator login response:", data);

            if (!data.token) {
                throw new Error("Неверный ответ от сервера");
            }

            saveTokens(data.token, data.refreshToken, rememberMe);
            await checkAuth();
            initSocket(data.token);

            setTimeout(() => {
                const currentUser = getToken() ? user : null;
                if (currentUser?.role !== 'curator') {
                    console.error("Wrong role:", currentUser?.role);
                    throw new Error('Доступ разрешен только для кураторов');
                }
            }, 100);

            return data;
        } catch (err) {
            console.error("Curator login error:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("refreshToken");
            setError(err.message || "Ошибка входа для куратора");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerCandidate = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await auth.registerCandidate(userData);
            console.log("Register response:", data);

            if (data.token) {
                saveTokens(data.token, data.refreshToken, true);
                await checkAuth();
                initSocket(data.token);
            }
            return data;
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Ошибка регистрации");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerEmployer = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await auth.registerEmployer(userData);
            console.log("Register employer response:", data);

            if (data.token) {
                saveTokens(data.token, data.refreshToken, true);
                await checkAuth();
                initSocket(data.token);
            }
            return data;
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Ошибка регистрации");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                await auth.logout({ refreshToken });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            disconnectSocket();

            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("refreshToken");
            setUser(null);
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        loginAdmin,
        loginCurator,
        registerCandidate,
        registerEmployer,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};