import { writable } from 'svelte/store';

const npcs = [
  {
    name: "Caretaker",
    message: "Oh, still here?",
  },
  {
    name: "Wandering Soul",
    message: "Have you seen Godot?",
  },
];

export const currentNPC = writable(null);

export function showRandomNPC() {
  const randomIndex = Math.floor(Math.random() * npcs.length);
  currentNPC.set(npcs[randomIndex]);
  setTimeout(() => {
    currentNPC.set(null);
  }, 5000); // Clear the NPC after 5 seconds
}