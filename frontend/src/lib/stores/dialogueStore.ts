import { writable } from 'svelte/store';

interface ChatMessage {
    text: string;
    isSystem: boolean;
    timestamp: number;
}

// Main chat messages
export const messages = writable<ChatMessage[]>([]);

// Hallucination system
export const activeHallucination = writable<string>(''); // Renamed
let hallucinationTimer: number; // Renamed

export function triggerHallucination(text: string, duration = 4000) {
    activeHallucination.set(text);
    if (hallucinationTimer) clearTimeout(hallucinationTimer);
    hallucinationTimer = window.setTimeout(() => {
        activeHallucination.set('');
    }, duration);
}

export function addMessage(text: string, isSystem = false) {
    messages.update(msgs => [...msgs, {
        text,
        isSystem,
        timestamp: Date.now()
    }]);
}