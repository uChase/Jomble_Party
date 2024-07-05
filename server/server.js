const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const gameSessions = {
    'example-session-id': {
        players: [],
        state: {}
    } // Example session for testing
    ,
    'penis': {
        players: [],
        state: {}
    }
};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (sessionId) => {
        console.log(`Attempting to join session ${sessionId}`);

        // Check if the session exists
        if (!gameSessions[sessionId]) {
            console.log(`Invalid session ID: ${sessionId}`);
            socket.emit('error', 'Invalid session ID');
            socket.disconnect();
            return;
        }

        // Add the player to the session
        gameSessions[sessionId].players.push(socket.id);
        socket.join(sessionId);

        // Notify others in the session
        io.to(sessionId).emit('update', gameSessions[sessionId]);
    });

    socket.on('message', ({ sessionId, message }) => {
        console.log(`Message from ${sessionId}: ${message}`);
        io.to(sessionId).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Here you might want to handle removing the user from the session
    });
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Server running at http://0.0.0.0:8080/');
});
