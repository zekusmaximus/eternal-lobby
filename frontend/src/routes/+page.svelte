<!-- Single container with filter applied for day/night cycle -->
<div
    class="flex flex-col h-screen bg-neutral-900 text-neutral-300 font-sans transition-colors duration-[2000ms] ease-in-out overflow-hidden relative"
    style="filter: hue-rotate({$filterValues.current.hue}deg) brightness({$filterValues.current.brightness}%);"
>
    <!-- Dust particles scattered across the screen -->
    {#each dustParticles as particle}
        <div 
            class="dust-particle" 
            style="left: {particle.x}%; top: {particle.y}%; opacity: {particle.opacity};"
        ></div>
    {/each}
    
    <!-- Hallucination text that appears occasionally -->
    <div class="hallucination {showHallucination ? 'visible' : ''} mt-20">
        {currentHallucination}
    </div>
    
    <!-- Long shadows cast across the scene -->
    <div 
        class="shadow-element" 
        style="height: {$shadowLength.current}vh; left: 15%; top: 20%; transform: rotate(10deg);"
    ></div>
    <div 
        class="shadow-element" 
        style="height: {$shadowLength.current * 0.8}vh; left: 85%; top: 15%; transform: rotate(-15deg);"
    ></div>
    
    <!-- Enable Sounds Button - Top Right -->
    {#if !audioInitialized}
        <button 
            on:click={handleFirstInteraction}
            class="absolute top-4 right-4 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 p-2 rounded transition-colors"
        >
            Enable Experience
        </button>
    {/if}

    <!-- Clock/waiting indicator -->
    <div class="absolute top-4 left-4 flex items-center space-x-1 opacity-60">
        <div class="w-10 h-10 rounded-full border border-neutral-600 relative">
            <div class="absolute w-px h-4 bg-neutral-500 top-1 left-1/2 origin-bottom clock-tick"
                 style="transform: rotate({waitingTime * 6}deg);">
            </div>
        </div>
        <div class="text-xs text-neutral-500">
            {Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')}
        </div>
    </div>

    <!-- Main Lobby Area: Use more padding for emptiness -->
    <div class="flex-grow flex items-center justify-center p-12 relative">
        <!-- Flickering light -->
        <div 
            class="absolute top-40 right-1/3 w-3 h-3 rounded-full bg-amber-100 light flicker-animation"
            style="--intensity: {$lightIntensity.current / 100};"
        ></div>
        
        <div class="text-center relative">
            <!-- Make title more faded/less prominent with dynamic typography -->
            <h1 
                class="text-3xl mb-4 text-neutral-600 font-light tracking-wider"
                style="letter-spacing: {0.5 + 0.2 * Math.sin(currentCycleProgress * Math.PI)}rem;"
            >
                The Eternal Lobby
            </h1>
            
            <p class="text-base text-neutral-500 mb-8 relative">
                Waiting...
                <!-- Reflection under text -->
                <span class="reflection"></span>
            </p>
  
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
    
    <!-- Sound visualization bars -->
    <div class="absolute bottom-40 right-10 flex space-x-1">
        {#each Array(5) as _, i}
            <div 
                class="w-px h-8 bg-neutral-700 transition-all duration-300" 
                style="height: {4 + Math.random() * 8}px; opacity: {0.3 + Math.random() * 0.3}">
            </div>
        {/each}
    </div>
  
    <!-- Chat Area: Slightly different gray, subtle border -->
    <div class="border-t border-neutral-700 p-4 bg-neutral-800 relative">
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
</div><script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { io, type Socket } from 'socket.io-client';
    import { Howl } from 'howler';
    import { Tween } from 'svelte/motion'; // Updated from tweened to Tween
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
    
    // --- Visual Effect Variables ---
    let visualsInitialized = false;
    // Updated from tweened to Tween
    let lightIntensity = new Tween(50, {
        duration: 2000,
        easing: cubicOut
    });
    let dustParticles: { x: number, y: number, opacity: number, speed: number }[] = [];
    let dustInterval: number | null = null;
    let flickerInterval: number | null = null;
    // Updated from tweened to Tween
    let shadowLength = new Tween(30, {
        duration: 5000,
        easing: cubicOut
    });
    
    // --- Waiting Time Variables ---
    let waitingTime = 0;
    let waitingInterval: number | null = null;
    
    // --- Hallucination Variables ---
    let hallucinations = [
        "Did someone just whisper?",
        "The door handle turned slightly...",
        "A shadow moved across the wall.",
        "The light flickered in a pattern.",
        "Was that footsteps?",
        "Someone was just here...",
        "The air feels different now."
    ];
    let hallucinationTimeout: number | null = null;
    let showHallucination = false;
    let currentHallucination = "";
  
    // --- Day/Night Cycle Variables ---
    // Updated from tweened to Tween
    const filterValues = new Tween({ hue: 0, brightness: 100 }, {
        duration: 10000,
        easing: cubicOut
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
            const hueShift = Math.sin(currentCycleProgress * Math.PI) * 60; // Goes 0 -> 60 -> 0
            const brightnessShift = 100 - Math.sin(currentCycleProgress * Math.PI) * 30; // Goes 100 -> 70 -> 100

            // Use set method to smoothly animate
            filterValues.set({ hue: hueShift, brightness: brightnessShift });
            
            // Sync other visual elements with the cycle
            shadowLength.set(30 + 20 * Math.sin(currentCycleProgress * Math.PI));
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
                autoplay: false,
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
                        
                        // Trigger light flicker when flicker sound plays
                        if (randomSfxName === 'flicker') {
                            triggerLightFlicker();
                        }
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
            initializeVisuals(); // Start visuals once audio is playing
            messages = [...messages, `--- Ambient sounds enabled ---`];
        } catch (error) {
            console.error("Error initializing sounds:", error);
            messages = [...messages, `--- Audio Error: Could not initialize sounds. ---`];
        }
    }
    
    // Function to initialize visual effects
    function initializeVisuals() {
        if (visualsInitialized) return;
        
        // Create dust particles
        for (let i = 0; i < 15; i++) {
            dustParticles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: 0.1 + Math.random() * 0.2,
                speed: 0.05 + Math.random() * 0.1
            });
        }
        
        // Animate dust particles
        dustInterval = setInterval(() => {
            dustParticles = dustParticles.map(particle => ({
                ...particle,
                y: (particle.y + particle.speed) % 100,
                opacity: 0.1 + Math.random() * 0.2
            }));
        }, 100);
        
        // Setup flickering light effect
        flickerInterval = setInterval(() => {
            // Only flicker occasionally
            if (Math.random() > 0.7) {
                triggerLightFlicker();
            }
        }, 8000);
        
        // Setup waiting time counter
        waitingInterval = setInterval(() => {
            waitingTime += 1;
            
            // After certain waiting time thresholds, trigger hallucinations
            if (waitingTime % 30 === 0 && waitingTime > 0) {
                triggerHallucination();
            }
        }, 1000);
        
        visualsInitialized = true;
    }
    
    // Function to create light flicker effect
    function triggerLightFlicker() {
        const flickerSequence = [10, 80, 40, 90, 20, 100, 50, 80];
        let step = 0;
        
        function doFlicker() {
            if (step < flickerSequence.length) {
                lightIntensity.set(flickerSequence[step]);
                step++;
                setTimeout(doFlicker, 80 + Math.random() * 120);
            } else {
                // Return to normal
                lightIntensity.set(50 + Math.random() * 30);
            }
        }
        
        doFlicker();
    }
    
    // Function to trigger hallucinations
    function triggerHallucination() {
        currentHallucination = hallucinations[Math.floor(Math.random() * hallucinations.length)];
        showHallucination = true;
        
        // Hide after a few seconds
        if (hallucinationTimeout) clearTimeout(hallucinationTimeout);
        hallucinationTimeout = setTimeout(() => {
            showHallucination = false;
        }, 4000);
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
        
        // --- Cleanup Visuals ---
        if (dustInterval) clearInterval(dustInterval);
        if (flickerInterval) clearInterval(flickerInterval);
        if (waitingInterval) clearInterval(waitingInterval);
        if (hallucinationTimeout) clearTimeout(hallucinationTimeout);
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
        triggerLightFlicker();
    }
    
    function lookDownHallway() {
        messages = [...messages, `--- You peer down the dark hallway. Nothing but shadows. For a moment, you thought you heard something. ---`];
        // Chance to trigger a hallucination
        if (Math.random() > 0.6) {
            setTimeout(triggerHallucination, 2000);
        }
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
    
    /* Visual effects */
    .light {
        box-shadow: 0 0 15px rgba(255, 240, 200, var(--intensity));
        transition: box-shadow 0.2s ease;
    }
    
    .dust-particle {
        position: absolute;
        width: 1px;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.2);
        pointer-events: none;
    }
    
    .hallucination {
        position: absolute;
        opacity: 0;
        transition: opacity 1.5s ease;
        text-align: center;
        width: 100%;
        font-style: italic;
    }
    
    .hallucination.visible {
        opacity: 0.7;
    }
    
    .shadow-element {
        position: absolute;
        background: linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent);
        transform-origin: top center;
        width: 3px;
    }
    
    @keyframes flicker {
        0% { opacity: 0.8; }
        5% { opacity: 0.4; }
        10% { opacity: 0.9; }
        15% { opacity: 0.5; }
        20% { opacity: 1; }
        25% { opacity: 0.8; }
        30% { opacity: 0.6; }
        35% { opacity: 0.9; }
        40% { opacity: 0.7; }
        45% { opacity: 0.8; }
        50% { opacity: 1; }
        100% { opacity: 0.8; }
    }
    
    .flicker-animation {
        animation: flicker 10s infinite;
    }
    
    .clock-tick {
        transition: transform 1s cubic-bezier(0.4, 2.3, 0.7, 0.8);
    }
    
    .reflection {
        position: absolute;
        bottom: -20px;
        left: 0;
        right: 0;
        height: 20px;
        background: linear-gradient(to bottom, rgba(50,50,50,0.2), transparent);
        transform: scaleY(-1);
        filter: blur(2px);
        opacity: 0.3;
    }