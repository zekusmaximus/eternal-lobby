import { writable, derived } from 'svelte/store';

export const realTime = writable(0);
export const waitingTime = writable(0);

export const distortedTime = derived(
  [realTime, waitingTime],
  ([$rt, $wt]) => $wt + ($rt * 0.78) // Non-integer multiplier creates unease
);

let lastUpdate = Date.now();

export function startWaiting() {
  setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - lastUpdate) / 1000);
    
    realTime.set(elapsed);
    
    if (Math.random() < 0.12) { // 12% chance per second for time anomaly
      waitingTime.update(t => t + (Math.random() > 0.4 ? 2 : -1));
    } else {
      waitingTime.update(t => t + 1);
    }

    lastUpdate = now;
  }, 1000);
}