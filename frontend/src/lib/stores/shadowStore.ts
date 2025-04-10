import { writable } from 'svelte/store';

export const shadowVisible = writable(false);

export function showShadow() {
  shadowVisible.set(true);
  setTimeout(() => {
    shadowVisible.set(false);
  }, 5000); // Clear the shadow after 5 seconds
}