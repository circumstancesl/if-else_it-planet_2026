const { io } = require('socket.io-client');

const socket = io('http://localhost:8080', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmZDFkMDE2LWYzNTctNDUwYy04MWMzLWIwZTUyODk1OTg1YSIsInJvbGUiOiJjYW5kaWRhdGUiLCJpYXQiOjE3NzQ4MDk0MDQsImV4cCI6MTc3NDg5NTgwNH0.YurOE4hEQzsIcLZ55f7XNIukYfmMAPa93mf8jKo2LkU',
  },
});

socket.on('connect', () => {
  console.log('connected');

  socket.emit('joinChats');

  socket.emit('sendMessage', {
    chatId: '9e8d4f2a-95b6-4b13-945f-4659bb899897',
    text: 'Hello from Node',
  });
});

socket.on('newMessage', (msg) => {
  console.log('NEW MESSAGE:', msg);
});