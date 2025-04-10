import { WebSocketServer } from 'ws';

// Create a WebSocket server instance, listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server started on port 8080');

// Keep track of connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    // Handle messages received from the client
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);

        // Broadcast the message to all connected clients EXCEPT the sender
        broadcast(message, ws); 
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    // Handle potential errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws); // Remove client on error
    });
});

// Function to broadcast messages to all clients except the sender
function broadcast(message, sender) {
    const messageString = message.toString(); // Ensure message is a string
    console.log(`Broadcasting message: ${messageString} (excluding sender)`);
    clients.forEach((client) => {
        // Only send if the client is not the sender and is ready
        if (client !== sender && client.readyState === 1) { 
            client.send(messageString);
        }
    });
}

// Optional: Add a simple HTTP server part if needed later for health checks or serving static files
// For now, the WebSocket server is standalone.
