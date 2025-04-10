import { writable } from 'svelte/store';

const prompts = [
  "Did you hear that?",
  "A cold draft sweeps through...",
  "The flickering is unsettling...",
  "Is someone there?",
  "...",
];

export const currentPrompt = writable<string | null>(null);

export function showRandomPrompt() {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  currentPrompt.set(prompts[randomIndex]);
  setTimeout(() => {
    currentPrompt.set(null);
  }, 5000); // Clear the prompt after 5 seconds
}
