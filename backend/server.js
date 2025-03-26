import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Configure CORS - Allow requests from your Svelte frontend dev server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Svelte frontend address
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000; // Use port 3000 unless specified

// Basic route (optional, just to check if server is running via browser)
app.get('/', (req, res) => {
  res.send('Eternal Lobby Backend is Running');
});

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // --- Phase 1: Simple Chat Feature ---
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    // Broadcast the message to everyone connected
    io.emit('chat message', msg); // Send to all clients, including sender
  });

  // --- Placeholder for Phase 1: Random Prompt System ---
  // We'll add logic here later
});

server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});