import { useState, useCallback, useEffect } from "react";
import { apiClient } from "./client";

export function useFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Получить список избранного
    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/api/favorite');

            // Сохраняем полные данные
            setFavorites(response || []);

            // Сохраняем только ID для быстрой проверки
            const ids = new Set();
            (response || []).forEach(fav => {
                if (fav.type === 'possibility' && fav.item) {
                    ids.add(fav.item.id);
                } else if (fav.type === 'possibility' && fav.itemId) {
                    ids.add(fav.itemId);
                }
            });
            setFavoriteIds(ids);

            return response;
        } catch (err) {
            setError(err.message);
            console.error("Error fetching favorites:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Добавить в избранное
    const addFavorite = useCallback(async (itemId, type = 'possibility') => {
        try {
            setLoading(true);
            setError(null);

            await apiClient.post('/api/favorite', {
                itemId,
                type
            });

            // Обновляем список избранного
            await fetchFavorites();

            return true;
        } catch (err) {
            setError(err.message);
            console.error("Error adding favorite:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchFavorites]);

    // Удалить из избранного - исправлено
    // Удалить из избранного
    const removeFavorite = useCallback(async (itemId) => {
        try {
            setLoading(true);
            setError(null);

            // Передаем itemId в теле запроса
            await apiClient.delete('/api/favorite', { itemId });

            // Обновляем список избранного
            await fetchFavorites();

            return true;
        } catch (err) {
            setError(err.message);
            console.error("Error removing favorite:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchFavorites]);

    // Переключить избранное
    const toggleFavorite = useCallback(async (itemId, type = 'possibility') => {
        if (favoriteIds.has(itemId)) {
            return await removeFavorite(itemId);
        } else {
            return await addFavorite(itemId, type);
        }
    }, [favoriteIds, addFavorite, removeFavorite]);

    // Проверить, в избранном ли
    const isFavorite = useCallback((itemId) => {
        return favoriteIds.has(itemId);
    }, [favoriteIds]);

    // Загружаем избранное при монтировании
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    return {
        favorites,
        favoriteIds,
        loading,
        error,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite
    };
}