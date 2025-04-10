import { writable } from 'svelte/store';

interface NPC {
  name: string;
  message: string;
}

const npcs: NPC[] = [
  {
    name: "Caretaker",
    message: "Oh, still here?",
  },
  {
    name: "Wandering Soul",
    message: "Have you seen Godot?",
  },
];

export const currentNPC = writable<NPC | null>(null);

export function showRandomNPC() {
  const randomIndex = Math.floor(Math.random() * npcs.length);
  currentNPC.set(npcs[randomIndex]);
  setTimeout(() => {
    currentNPC.set(null);
  }, 5000); // Clear the NPC after 5 seconds
}