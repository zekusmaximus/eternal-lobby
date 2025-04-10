<script>
    import { onMount } from 'svelte';

    let messages = [];
    let newMessage = '';
    let ws;

    onMount(() => {
        ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            const message = event.data;
            messages = [...messages, message];
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    });

    function sendMessage() {
        if (newMessage.trim() !== '') {
            ws.send(newMessage);
            newMessage = '';
        }
    }
</script>

<div class="chat-window">
    <div class="message-list">
        {#each messages as message}
            <div class="message">{message}</div>
        {/each}
    </div>
    <div class="input-area">
        <input type="text" bind:value={newMessage} placeholder="Type your message...">
        <button on:click={sendMessage}>Send</button>
    </div>
</div>

<style>
    .chat-window {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .message-list {
        flex-grow: 1;
        overflow-y: auto;
        padding: 0.5rem;
    }

    .message {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .input-area {
        display: flex;
        padding: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .input-area input {
        flex-grow: 1;
        background: none;
        border: none;
        color: white;
        padding: 0.5rem;
    }

    .input-area button {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }
</style>