<script lang="ts">
    import { messages, addMessage } from '$lib/stores/dialogueStore';
    import Hallucinations from './Hallucinations.svelte';
    import { tick } from 'svelte';
  
    let currentMessage = '';
    let chatBox: HTMLDivElement; // Explicit type declaration
    async function sendMessage() {
      if (currentMessage.trim()) {
        addMessage(currentMessage.trim(), false);
        currentMessage = '';
        await tick();
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      }
    }
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }
  </script>
  
  <div class="chat-container">
    <Hallucinations />
  
    <div id="chat-box" bind:this={chatBox} class="message-container">
      {#each $messages as message}
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
      />
  
      <button on:click={sendMessage} class="send-button">
        ▷ Send
      </button>
    </div>
  </div>
  
  <style>
    /* Standard CSS Syntax */
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
  
    /* Selects .message elements that ALSO have the .system class */
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
  
    .send-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.7);
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
  
    /* Standard CSS hover pseudo-class */
    .send-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>