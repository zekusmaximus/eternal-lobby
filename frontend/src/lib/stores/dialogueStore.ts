import { writable } from 'svelte/store';

interface ChatMessage {
    text: string;
    isSystem: boolean;
    timestamp: number;
}

// --- Chat Messages ---
export const messages = writable<ChatMessage[]>([]);

export function addMessage(text: string, isSystem = false) {
    messages.update(msgs => [...msgs, {
        text,
        isSystem,
        timestamp: Date.now()
    }]);
}


// --- Hallucination System ---
const possibleHallucinations: string[] = [
    "Did you hear that?",
    "The air feels... thicker.",
    "Sometimes I think I see movement in the shadows.",
    "Is that clock ticking slower?",
    "...", // Silence can be a prompt too
    "Footsteps echoing... but from where?",
    "A faint whisper, just out of reach.",
    "The light flickered. Or did it?",
    "Are we the only ones waiting?",
    "How long has it been?"
];

export const activeHallucination = writable<string>('');
let hallucinationTimer: number | undefined = undefined; // Use undefined for better typing

// Shows a specific hallucination message
export function triggerHallucination(text: string, duration = 4000) {
    activeHallucination.set(text);
    if (hallucinationTimer) clearTimeout(hallucinationTimer);

    if (text) { // Only set timeout if there's text to clear
        hallucinationTimer = window.setTimeout(() => {
            activeHallucination.set('');
            hallucinationTimer = undefined;
        }, duration);
    } else {
        // If text is empty, clear immediately if needed
        activeHallucination.set('');
        hallucinationTimer = undefined;
    }
}

// Triggers a random hallucination from the list
export function triggerRandomHallucination(duration = 4000) {
    const randomIndex = Math.floor(Math.random() * possibleHallucinations.length);
    const randomText = possibleHallucinations[randomIndex];
    triggerHallucination(randomText, duration);
    console.log(`Triggering hallucination: ${randomText}`); // For debugging
}

// --- Cleanup on module unload (optional but good practice) ---
// Svelte modules don't have instances, so cleanup might need to be handled
// if you start intervals *within* this store itself. For now, timers are
// managed by triggerHallucination and cleared appropriately.