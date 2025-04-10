<script lang="ts">
  import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
  import { messages, addMessage } from '$lib/stores/dialogueStore';
  import Hallucinations from './Hallucinations.svelte';
  import { tick } from 'svelte';

  let currentMessage = '';
  let chatBox: HTMLDivElement;
  let ws: WebSocket | null = null; // Variable to hold the WebSocket connection

  onMount(() => {
    // Ensure this only runs in the browser
    if (typeof window !== 'undefined') {
      // Connect to the WebSocket server
      // Use 'ws://localhost:8080' for standard WebSocket
      // Use 'wss://your-backend-domain.com' for secure WebSocket in production
      const wsUrl = 'ws://localhost:8080'; // Adjust if your backend runs elsewhere
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        // Optional: Send an initial message or identifier
        // addMessage('Connected to the void...', true); // Example system message
      };

      ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
        // Add the received message to the store. Assuming messages are strings.
        // Mark as not a system message, and not the user's own direct input
        addMessage(event.data.toString(), false); // Adjust 'isSystem' as needed
        scrollToBottom(); // Scroll down when new message arrives
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        addMessage('Disconnected from the void...', true);
        ws = null; // Clear the instance
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('Error connecting to the void...', true);
        ws = null; // Clear the instance
      };
    }
  });

  onDestroy(() => {
    // Clean up the connection when the component is destroyed
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  async function sendMessage() {
    const trimmedMessage = currentMessage.trim();
    if (trimmedMessage) {
      // 1. Send the message via WebSocket if connected
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(trimmedMessage);
      } else {
        // Optional: Handle case where WebSocket is not connected
        addMessage('Cannot send: Not connected.', true);
        return; // Stop if not connected
      }

      // 2. Add the message locally *immediately* for responsiveness
      // Note: The server will broadcast it back, potentially causing duplicates
      // if not handled on the server-side (see next step).
      // For now, we'll let the server broadcast back, and handle it there.
       addMessage(trimmedMessage, false); // Add locally as non-system message

      // 3. Clear input and scroll
      currentMessage = '';
      scrollToBottom();
    }
  }

  async function scrollToBottom() {
    // Wait for the DOM to update after adding the message
    await tick();
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }


  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Automatically scroll down when messages change (e.g., on initial load)
  $: if (chatBox && $messages) {
       scrollToBottom();
  }

</script>

<div class="chat-container">
  <Hallucinations />

  <div id="chat-box" bind:this={chatBox} class="message-container">
    {#each $messages as message, i (i) } <!-- Add a key for better list updates -->
      <div class="message {message.isSystem ? 'system' : ''}">
        {message.text}
      </div>
    {/each}
  </div>
  <div class="input-container">
    <input
      type="text"
      bind:value={currentMessage}
      on:keydown={handleKeydown}
      placeholder="Speak into the void..."
      class="chat-input"
      disabled={!ws || ws.readyState !== WebSocket.OPEN} <!-- Disable input if not connected -->
    />

    <button
      on:click={sendMessage}
      class="send-button"
      disabled={!ws || ws.readyState !== WebSocket.OPEN} <!-- Disable button if not connected -->
    >
      ▷ Send
    </button>
  </div>
</div>

<style>
  /* Styles remain the same */
  .message-container {
    height: 200px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    margin-bottom: 1rem;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .message {
    margin-bottom: 0.5rem;
    padding: 0.3rem 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .message.system {
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }

  .input-container {
    display: flex;
    gap: 0.5rem;
  }

  .chat-input {
    flex-grow: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    padding: 0.5rem;
  }
   .chat-input:disabled {
     background: rgba(50, 50, 50, 0.2);
     cursor: not-allowed;
   }

  .send-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .send-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
  .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }
</style>