<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { io, type Socket } from 'socket.io-client';
    import { Howl } from 'howler'; // Import Howl
    import { tweened } from 'svelte/motion'; // Import tweened for smooth transitions
import { cubicOut } from 'svelte/easing'; // Import an easing function
  
    // ... (existing variables: messages, currentMessage, socket)
  
// --- Socket.IO Variables ---
let messages: string[] = [];
let currentMessage: string = '';
let socket: Socket | undefined;

    // --- Sound Variables ---
    let ambientSound: Howl | null = null;
    let sfx: { [key: string]: Howl } = {}; // Store SFX Howl instances
    let sfxFiles = ['creak', 'footstep', 'flicker']; // Names matching files (without sfx_)
    let randomSfxInterval: number | null = null;
  
    // --- Day/Night Cycle Variables ---
// Use tweened store for smooth animation of filter values
const filterValues = tweened({ hue: 0, brightness: 100 }, {
    duration: 10000, // Long duration for slow shift (10 seconds)
    easing: cubicOut // Or linear, easeInOut, etc.
});
let cycleInterval: number | null = null;
let cycleDurationMinutes = 5; // How long a full "day/night" cycle takes (e.g., 5 minutes)
let currentCycleProgress = 0; // 0 to 1
  
    onMount(() => {
      const localSocket = io('http://localhost:3000');
      socket = localSocket;
      // ... (socket event listeners remain the same, including auto-scroll)
  
      // --- Initialize Sounds ---
      try {
          // Ambient Loop
          ambientSound = new Howl({
            src: ['/sounds/ambient_loop.mp3', '/sounds/ambient_loop.ogg'], // Provide multiple formats if possible
            autoplay: true,
            loop: true,
            volume: 0.15, // Keep it low!
            html5: true, // Good for longer loops
          });
  
          // Load SFX
          sfxFiles.forEach(name => {
              sfx[name] = new Howl({
                  src: [`/sounds/sfx_${name}.mp3`, `/sounds/sfx_${name}.ogg`],
                  volume: 0.3, // SFX can be slightly louder but still subtle
              });
          });
  
          // Start Random SFX Timer (e.g., plays a random sound every 45-105 seconds)
          function playRandomSfx() {
              if (sfxFiles.length > 0) {
                  const randomIndex = Math.floor(Math.random() * sfxFiles.length);
                  const randomSfxName = sfxFiles[randomIndex];
                  if (sfx[randomSfxName]) {
                      console.log(`Playing SFX: ${randomSfxName}`); // For debugging
                      sfx[randomSfxName].play();
                  }
              }
              // Schedule the next random sound
              const randomDelay = 45000 + Math.random() * 60000; // 45s to 105s
              if (randomSfxInterval) clearTimeout(randomSfxInterval); // Clear previous timeout just in case
              randomSfxInterval = setTimeout(playRandomSfx, randomDelay);
          }
          // Start the first timeout
          randomSfxInterval = setTimeout(playRandomSfx, 15000 + Math.random() * 30000); // Initial delay 15-45s
  
      } catch (error) {
          console.error("Error initializing sounds:", error);
          // Display message maybe? "Audio context blocked" is common before user interaction
          messages = [...messages, `--- Audio Error: Could not initialize sounds. ---`];
      }
  
    // --- Initialize Day/Night Cycle ---
    const cycleIntervalMs = 30 * 1000; // Update every 30 seconds

    function advanceCycle() {
        const totalSteps = (cycleDurationMinutes * 60 * 1000) / cycleIntervalMs;
        currentCycleProgress = (currentCycleProgress + 1 / totalSteps) % 1; // Increment progress, wrap around at 1

        // Calculate filter values based on progress (0 to 1)
        // Example: Hue rotates 60 degrees, brightness dips to 70% and back
        const hueShift = Math.sin(currentCycleProgress * Math.PI) * 60; // Goes 0 -> 60 -> 0
        const brightnessShift = 100 - Math.sin(currentCycleProgress * Math.PI) * 30; // Goes 100 -> 70 -> 100

        // Use the tweened store's set method to smoothly animate
        filterValues.set({ hue: hueShift, brightness: brightnessShift });

        console.log(`Cycle Progress: ${currentCycleProgress.toFixed(2)}, Hue: ${hueShift.toFixed(0)}, Bright: ${brightnessShift.toFixed(0)}`); // Debugging
    }

    cycleInterval = setInterval(advanceCycle, cycleIntervalMs);
    advanceCycle(); // Run once immediately

  
    }); // End of onMount
  
    onDestroy(() => {
      if (socket) {
        socket.disconnect();
        console.log("Socket disconnected on component destroy");
      }
  
      // --- Cleanup Sounds ---
      if (ambientSound) {
        ambientSound.stop(); // Stop looping sound
        ambientSound.unload(); // Release resources
      }
      Object.values(sfx).forEach(sound => sound.unload()); // Unload all SFX
  
      if (randomSfxInterval) {
        clearTimeout(randomSfxInterval); // Clear the SFX timer
      }
  
      // --- Cleanup Day/Night Cycle ---
      if (cycleInterval) {
        clearInterval(cycleInterval);
    }
    }); // End of onDestroy
  
    function sendMessage() {
  // ... function code ...
}

function handleKeydown(event: KeyboardEvent) {
  // ... function code ...
}
  
  </script>
  
  <!-- HTML Template remains the same -->
  <div class="flex flex-col h-screen bg-neutral-900 text-neutral-300 font-sans transition-colors duration-[2000ms] ease-in-out">
      <!-- ... rest of template ... -->
  </div>
  <div
    class="flex flex-col h-screen bg-neutral-900 text-neutral-300 font-sans transition-colors duration-[2000ms] ease-in-out"
    style="filter: hue-rotate({$filterValues.hue}deg) brightness({$filterValues.brightness}%);"
>
    <!-- ... rest of template ... -->
</div>
  <!-- Style block remains the same -->
  <style>
     /* ... */
     /* Optional: Define custom shades if needed, or use existing */
      /* For example, if bg-neutral-850 isn't standard */
      /* You might need to add this color definition in tailwind.config.js instead */
      /*
      .bg-neutral-850 {
          background-color: #2a2a2a; // Example custom dark gray
      }
      */
  
      /* Ensure smooth scrolling works */
     
     #chat-box { scroll-behavior: smooth; }
  </style>
  
  <!-- Apply base dark gray background and lighter text to the whole container -->
  <!-- Add transition for color changes later -->
  <div class="flex flex-col h-screen bg-neutral-900 text-neutral-300 font-sans transition-colors duration-[2000ms] ease-in-out">
  
    <!-- Main Lobby Area: Use more padding for emptiness -->
    <div class="flex-grow flex items-center justify-center p-12">
      <div class="text-center">
        <!-- Make title more faded/less prominent -->
        <h1 class="text-3xl mb-4 text-neutral-600 font-light">The Eternal Lobby</h1>
        <p class="text-base text-neutral-500 mb-8">Waiting...</p>
  
        <!-- Interaction hints: More subtle, maybe italic -->
        <div class="mt-6 text-xs text-neutral-700 italic space-x-4">
          <span>(Inspect Flickering Light)</span>
          <span>|</span>
          <span>(Look Down the Hallway)</span>
        </div>
      </div>
    </div>
  
    <!-- Chat Area: Slightly different gray, subtle border -->
    <div class="border-t border-neutral-700 p-4 bg-neutral-850"><!-- Using a hypothetical neutral-850, adjust if needed or use existing like 800/900 -->
      <!-- Message Display: Give it an ID for scrolling -->
      <div id="chat-box" class="h-32 overflow-y-auto mb-4 p-2 bg-neutral-900 rounded text-sm scroll-smooth">
        {#each messages as message}
          <!-- Differentiate system messages maybe? -->
          {#if message.startsWith('---')}
              <p class="mb-1 text-neutral-500 italic">{message}</p>
          {:else}
              <p class="mb-1">{message}</p>
          {/if}
        {/each}
      </div>
  
      <!-- Input Area: Muted grays, remove strong focus outline maybe? -->
      <div class="flex">
        <input
          type="text"
          bind:value={currentMessage}
          on:keydown={handleKeydown}
          placeholder="Whisper..."
          class="flex-grow p-2 bg-neutral-700 border border-neutral-600 rounded-l text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-0"
        />
        <!-- Button: Muted grayscale, subtle hover -->
        <button
          on:click={sendMessage}
          class="bg-neutral-600 hover:bg-neutral-500 text-neutral-300 p-2 rounded-r transition-colors duration-150"
        >
          Send
        </button>
      </div>
    </div>
  </div>
  
