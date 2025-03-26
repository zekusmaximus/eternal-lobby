<script lang="ts"> // Add lang="ts" to enable TypeScript syntax in the script block
    import { onMount, onDestroy } from 'svelte'; // Import onDestroy too for cleanup best practice
    import { io, type Socket } from 'socket.io-client'; // Import the 'Socket' type
  
    // Explicitly type the variables
    let messages: string[] = []; // An array of strings
    let currentMessage: string = ''; // A string
    let socket: Socket | undefined; // Can be a Socket instance or undefined before connection
  
    onMount(() => {
      // Connect to the backend Socket.IO server
      // Ensure type safety by assigning to the typed variable
      const localSocket = io('http://localhost:3000'); // Your backend address
      socket = localSocket; // Assign to the component's reactive variable
  
      // Listen for incoming 'chat message' events
      // Explicitly type the incoming message 'msg' as string
      localSocket.on('chat message', (msg: string) => {
        messages = [...messages, msg]; // Add the new message
      });
  
      // Optional: Handle connection errors
      localSocket.on('connect_error', (err) => {
        console.error("Socket connection error:", err.message);
        // Maybe display an error message to the user
      });
  
      // Clean up the connection when the component is destroyed
      // Use onDestroy for proper Svelte lifecycle cleanup
      // No return needed from onMount when using onDestroy
    });
  
    // Use onDestroy for cleanup - this is the idiomatic Svelte way
    onDestroy(() => {
        if (socket) {
            socket.disconnect();
            console.log("Socket disconnected on component destroy");
        }
    });
  
  
    function sendMessage() {
      // Check if socket exists and is connected before emitting
      if (!socket || !socket.connected) {
          console.warn("Socket not connected, cannot send message.");
          return; // Prevent sending if not connected
      }
      if (currentMessage.trim() === '') return;
  
      socket.emit('chat message', currentMessage);
      currentMessage = '';
    }
  
    // Explicitly type the 'event' parameter as KeyboardEvent
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    }
  </script>
  
  <!-- Rest of your HTML template remains the same -->
  <div class="flex flex-col h-screen bg-gray-900 text-gray-300 font-sans">
  
    <!-- Main Lobby Area (Placeholder) -->
    <div class="flex-grow flex items-center justify-center p-8">
      <div class="text-center">
        <h1 class="text-4xl mb-4 text-gray-500">The Eternal Lobby</h1>
        <p class="text-lg text-gray-600">Waiting for Godot...</p>
        <!-- Minimal Interaction Elements will go here later -->
        <div class="mt-6 text-sm text-gray-700">
          (Inspect Flickering Light) | (Look Down the Hallway)
        </div>
      </div>
    </div>
  
    <!-- Chat Area -->
    <div class="border-t border-gray-700 p-4 bg-gray-800">
      <!-- Message Display -->
      <div class="h-32 overflow-y-auto mb-4 p-2 bg-gray-900 rounded text-sm">
        {#each messages as message}
          <p class="mb-1">{message}</p>
        {/each}
      </div>
  
      <!-- Input Area -->
      <div class="flex">
        <input
          type="text"
          bind:value={currentMessage}
          on:keydown={handleKeydown}
          placeholder="Whisper into the void..."
          class="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l focus:outline-none focus:border-blue-500 text-white"
        />
        <button
          on:click={sendMessage}
          class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  
  </div>