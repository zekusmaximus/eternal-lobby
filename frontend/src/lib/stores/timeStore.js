import { writable, derived } from 'svelte/store';
// Import the function from dialogueStore
import { triggerRandomHallucination } from './dialogueStore';
// Import the function from audioStore
import { playRandomSoundEffect } from './audioStore';

export const realTime = writable(0); // Tracks actual elapsed seconds
export const waitingTime = writable(0); // Tracks the distorted "waiting" counter

// Derived store for displaying a combined, warped time
export const distortedTime = derived(
  [realTime, waitingTime],
  ([$rt, $wt]) => $wt + ($rt * 0.78) // Non-integer multiplier creates unease
);

/** @type {number | null} */
let intervalId = null; // Variable to hold the interval ID for cleanup
let lastUpdateTimestamp = Date.now(); // Use a more descriptive name
let totalElapsedSeconds = 0; // Keep track of total elapsed seconds accurately

// Chance (per second) to trigger a hallucination (e.g., 0.05 = 5% chance)
const HALLUCINATION_CHANCE_PER_SECOND = 0.05; // Approx once every 20 seconds
// Chance (per second) to trigger a sound effect
const SOUND_EFFECT_CHANCE_PER_SECOND = 0.03; // Adjust as desired

export function startWaiting() {
  if (intervalId) return; // Prevent multiple intervals

  console.log("Starting the waiting clock...");
  lastUpdateTimestamp = Date.now(); // Reset timestamp when starting
  totalElapsedSeconds = 0; // Reset elapsed time
  // Optionally reset realTime and waitingTime stores if needed on restart
  // realTime.set(0);
  // waitingTime.set(0);

  intervalId = setInterval(() => {
    const now = Date.now();
    // Calculate time delta in milliseconds since last tick
    const deltaMs = now - lastUpdateTimestamp;

    // Only process if roughly a second or more has passed
    if (deltaMs >= 1000) {
        // Calculate how many full seconds passed since last update
        const secondsPassed = Math.floor(deltaMs / 1000);

        totalElapsedSeconds += secondsPassed;
        realTime.set(totalElapsedSeconds); // Update realTime with accumulated seconds

        // Update waitingTime for each second that passed
        for (let i = 0; i < secondsPassed; i++) {
            if (Math.random() < 0.12) { // 12% chance per second for time anomaly
                waitingTime.update(t => t + (Math.random() > 0.4 ? 2 : -1));
            } else {
                waitingTime.update(t => t + 1);
            }

             // Check if we should trigger a hallucination this second
             if (Math.random() < HALLUCINATION_CHANCE_PER_SECOND) {
                console.log("Attempting to trigger hallucination..."); // Debug log
                triggerRandomHallucination(); // Call the function
            }
             // Check if we should trigger a sound effect this second
             if (Math.random() < SOUND_EFFECT_CHANCE_PER_SECOND) {
                  console.log("Attempting to trigger sound effect..."); // Debug log
                  playRandomSoundEffect(); // Call the function
              }
        }

        // Update the last timestamp, accounting for the processed time
        lastUpdateTimestamp += secondsPassed * 1000;
    }
  }, 250); // Check more frequently (e.g., 4 times a second) for better accuracy
}

export function stopWaiting() {
  if (intervalId) {
    console.log("Stopping the waiting clock.");
    clearInterval(intervalId);
    intervalId = null;
  }
}