import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

let socket = null;

export const initSocket = (token) => {
    if (!token) {
        console.error('No token provided for socket connection');
        return null;
    }

    if (socket && socket.connected) {
        console.log('Socket already connected');
        return socket;
    }

    console.log('Initializing socket with token...');
    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        // Присоединяемся к чатам пользователя
        socket.emit('joinChats');
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        console.log('Disconnecting socket...');
        socket.disconnect();
        socket = null;
    }
};

export const sendMessage = (chatId, text) => {
    if (socket && socket.connected) {
        console.log('Sending message:', { chatId, text });
        socket.emit('sendMessage', { chatId, text });
        return true;
    }
    console.error('Socket not connected, cannot send message');
    return false;
};

export const onNewMessage = (callback) => {
    if (socket) {
        socket.on('newMessage', callback);
        return () => socket.off('newMessage', callback);
    }
    return () => {};
};

export const joinChats = () => {
    if (socket && socket.connected) {
        console.log('Joining chats...');
        socket.emit('joinChats');
    }
};