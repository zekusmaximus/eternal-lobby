<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { io, type Socket } from 'socket.io-client';
    import { Howl } from 'howler';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
  
    // --- Socket.IO Variables ---
    let messages: string[] = [];
    let currentMessage: string = '';
    let socket: Socket | undefined;

    // --- Sound Variables ---
    let ambientSound: Howl | null = null;
    let sfx: { [key: string]: Howl } = {}; // Store SFX Howl instances
    let sfxFiles = ['creak', 'footstep', 'flicker']; // Names matching files (without sfx_)
    let randomSfxInterval: number | null = null;
    let audioInitialized = false;
  
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
        // Initialize socket connection
        const localSocket = io('http://localhost:3000');
        socket = localSocket;
        
        // Set up socket event listeners
        localSocket.on('connect', () => {
            messages = [...messages, `--- Connected to the lobby ---`];
        });

        localSocket.on('chat message', (msg) => {
            messages = [...messages, msg];
            // Auto-scroll to the bottom
            setTimeout(() => {
                const chatBox = document.getElementById('chat-box');
                if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
            }, 0);
        });

        localSocket.on('disconnect', () => {
            messages = [...messages, `--- Disconnected from the lobby ---`];
        });

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
    });
  
    // Function to initialize audio (called after user interaction)
    function initializeAudio() {
        if (audioInitialized) return;
        
        try {
            // Ambient Loop
            ambientSound = new Howl({
                src: ['/sounds/ambient_loop.mp3', '/sounds/ambient_loop.ogg'],
                autoplay: false, // Changed from true to false
                loop: true,
                volume: 0.15,
                html5: true,
            });
            
            // Load SFX
            sfxFiles.forEach(name => {
                sfx[name] = new Howl({
                    src: [`/sounds/sfx_${name}.mp3`, `/sounds/sfx_${name}.ogg`],
                    volume: 0.3,
                });
            });
            
            // Explicitly play the ambient sound
            if (ambientSound) {
                ambientSound.play();
            }
            
            // Start Random SFX Timer
            function playRandomSfx() {
                if (sfxFiles.length > 0) {
                    const randomIndex = Math.floor(Math.random() * sfxFiles.length);
                    const randomSfxName = sfxFiles[randomIndex];
                    if (sfx[randomSfxName]) {
                        console.log(`Playing SFX: ${randomSfxName}`);
                        sfx[randomSfxName].play();
                    }
                }
                // Schedule the next random sound
                const randomDelay = 45000 + Math.random() * 60000; // 45s to 105s
                if (randomSfxInterval) clearTimeout(randomSfxInterval);
                randomSfxInterval = setTimeout(playRandomSfx, randomDelay);
            }
            
            // Start the first timeout
            randomSfxInterval = setTimeout(playRandomSfx, 15000 + Math.random() * 30000);
            
            audioInitialized = true;
            messages = [...messages, `--- Ambient sounds enabled ---`];
        } catch (error) {
            console.error("Error initializing sounds:", error);
            messages = [...messages, `--- Audio Error: Could not initialize sounds. ---`];
        }
    }

    // Call this function when user interacts with the "Enable Sounds" button
    function handleFirstInteraction() {
        initializeAudio();
    }
  
    onDestroy(() => {
        if (socket) {
            socket.disconnect();
            console.log("Socket disconnected on component destroy");
        }
  
        // --- Cleanup Sounds ---
        if (ambientSound) {
            ambientSound.stop();
            ambientSound.unload();
        }
        
        Object.values(sfx).forEach(sound => sound.unload());
  
        if (randomSfxInterval) {
            clearTimeout(randomSfxInterval);
        }
  
        // --- Cleanup Day/Night Cycle ---
        if (cycleInterval) {
            clearInterval(cycleInterval);
        }
    });
  
    // Properly implemented chat functions
    function sendMessage() {
        if (currentMessage.trim() && socket) {
            socket.emit('chat message', currentMessage);
            currentMessage = ''; // Clear the input field
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }
  
    // Interaction handlers
    function inspectLight() {
        messages = [...messages, `--- You inspect the flickering light. It buzzes quietly but continues to flicker. ---`];
    }
    
    function lookDownHallway() {
        messages = [...messages, `--- You peer down the dark hallway. Nothing but shadows. For a moment, you thought you heard something. ---`];
    }
</script>
  
<style>
    #chat-box { 
        scroll-behavior: smooth; 
    }
    
    /* Custom classes for hover effects */
    .interaction-hint {
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .interaction-hint:hover {
        color: #999;
    }
</style>
  
<!-- Single container with filter applied for day/night cycle -->
<div
    class="flex flex-col h-screen bg-neutral-900 text-neutral-300 font-sans transition-colors duration-[2000ms] ease-in-out"
    style="filter: hue-rotate({$filterValues.hue}deg) brightness({$filterValues.brightness}%);"
>
    <!-- Enable Sounds Button - Top Right -->
    {#if !audioInitialized}
        <button 
            on:click={handleFirstInteraction}
            class="absolute top-4 right-4 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 p-2 rounded transition-colors"
        >
            Enable Sounds
        </button>
    {/if}

    <!-- Main Lobby Area: Use more padding for emptiness -->
    <div class="flex-grow flex items-center justify-center p-12">
        <div class="text-center">
            <!-- Make title more faded/less prominent -->
            <h1 class="text-3xl mb-4 text-neutral-600 font-light">The Eternal Lobby</h1>
            <p class="text-base text-neutral-500 mb-8">Waiting...</p>
  
            <!-- Interaction hints: clickable with proper accessibility -->
            <div class="mt-6 text-xs text-neutral-700 italic space-x-4">
                <span 
                    role="button" 
                    tabindex="0" 
                    class="interaction-hint" 
                    on:click={inspectLight}
                    on:keydown={(e) => e.key === 'Enter' && inspectLight()}
                >(Inspect Flickering Light)</span>
                <span>|</span>
                <span 
                    role="button" 
                    tabindex="0" 
                    class="interaction-hint" 
                    on:click={lookDownHallway}
                    on:keydown={(e) => e.key === 'Enter' && lookDownHallway()}
                >(Look Down the Hallway)</span>
            </div>
        </div>
    </div>
  
    <!-- Chat Area: Slightly different gray, subtle border -->
    <div class="border-t border-neutral-700 p-4 bg-neutral-800">
        <!-- Message Display: Give it an ID for scrolling -->
        <div id="chat-box" class="h-32 overflow-y-auto mb-4 p-2 bg-neutral-900 rounded text-sm scroll-smooth">
            {#each messages as message}
                <!-- Differentiate system messages -->
                {#if message.startsWith('---')}
                    <p class="mb-1 text-neutral-500 italic">{message}</p>
                {:else}
                    <p class="mb-1">{message}</p>
                {/if}
            {/each}
        </div>
  
        <!-- Input Area: Muted grays, remove strong focus outline -->
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