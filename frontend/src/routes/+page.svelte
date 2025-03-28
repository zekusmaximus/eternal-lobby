<div
    class="flex flex-col h-screen bg-neutral-900 text-neutral-300 font-sans transition-colors duration-[2000ms] ease-in-out overflow-hidden relative"
    style="filter: hue-rotate({filterValues.current.hue}deg) brightness({filterValues.current.brightness}%);"
>
    {#each dustParticles as particle}
        <div
            class="dust-particle"
            style="left: {particle.x}%; top: {particle.y}%; opacity: {particle.opacity};"
        ></div>
    {/each}

    <div class="hallucination {showHallucination ? 'visible' : ''} mt-20">
        {currentHallucination}
    </div>

    <div
        class="shadow-element"
        style="height: {shadowLength.current}vh; left: 15%; top: 20%; transform: rotate(10deg);"
    ></div>
    <div
        class="shadow-element"
        style="height: {shadowLength.current * 0.8}vh; left: 85%; top: 15%; transform: rotate(-15deg);"
    ></div>

    {#if !audioInitialized}
        <button
            on:click={handleFirstInteraction}
            class="absolute top-4 right-4 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 p-2 rounded transition-colors z-10"
        >
            Enable Experience
        </button>
    {/if}

    <div class="absolute top-4 left-4 flex items-center space-x-1 opacity-60 z-10">
        <div class="w-10 h-10 rounded-full border border-neutral-600 relative">
            <div class="absolute w-px h-4 bg-neutral-500 top-1 left-1/2 origin-bottom clock-tick"
                 style="transform: rotate({waitingTime * 6}deg);">
            </div>
        </div>
        <div class="text-xs text-neutral-500">
            {Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')}
        </div>
    </div>

    <div class="flex-grow flex items-center justify-center p-12 relative">
        <div
            class="absolute top-40 right-1/3 w-3 h-3 rounded-full bg-amber-100 light"
            style="--intensity: {lightIntensity.current / 100};"
        ></div>

        <div class="text-center relative">
            <h1
                class="text-3xl mb-4 text-neutral-600 font-light tracking-wider"
                style="letter-spacing: {0.5 + 0.2 * Math.sin(currentCycleProgress * Math.PI)}rem;"
            >
                The Eternal Lobby
            </h1>

            <p class="text-base text-neutral-500 mb-8 relative">
                Waiting...
                <span class="reflection"></span>
            </p>

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

    <div class="absolute bottom-40 right-10 flex space-x-1">
        {#each soundBarStyles as barStyle}
            <div
                class="w-px bg-neutral-700 transition-all duration-300"
                style="height: {barStyle.height}px; opacity: {barStyle.opacity};"
            >
            </div>
        {/each}
    </div>

    <div class="border-t border-neutral-700 p-4 bg-neutral-800 relative">
        <div id="chat-box" class="h-32 overflow-y-auto mb-4 p-2 bg-neutral-900 rounded text-sm scroll-smooth">
            {#each messages as message}
                {#if message.isSystem}
                    <p class="mb-1 text-neutral-500 italic">{message.text}</p>
                {:else}
                    <p class="mb-1">{message.text}</p>
                {/if}
            {/each}
        </div>

        <div class="flex">
            <input
                type="text"
                bind:value={currentMessage}
                on:keydown={handleKeydown}
                placeholder="Whisper..."
                class="flex-grow p-2 bg-neutral-700 border border-neutral-600 rounded-l text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-0"
            />
            <button
                on:click={sendMessage}
                class="bg-neutral-600 hover:bg-neutral-500 text-neutral-300 p-2 rounded-r transition-colors duration-150"
            >
                Send
            </button>
        </div>
    </div>
</div>

<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte'; // Import tick
    import { io, type Socket } from 'socket.io-client';
    import { Howl } from 'howler';
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    // --- Constants ---
    const SOCKET_URL = 'http://localhost:3000';
    const AMBIENT_VOLUME = 0.15;
    const SFX_VOLUME = 0.3;
    const MIN_SFX_DELAY = 45000; // ms
    const MAX_SFX_DELAY = 60000; // ms
    const NUM_DUST_PARTICLES = 15;
    const DUST_ANIMATION_INTERVAL = 100; // ms
    const WAITING_INTERVAL = 1000; // ms (1 second)
    const HALLUCINATION_INTERVAL_SECONDS = 30;
    const HALLUCINATION_DURATION_MS = 4000;
    const FLICKER_SEQUENCE = [10, 80, 40, 90, 20, 100, 50, 80];
    const FLICKER_STEP_DELAY_BASE = 80; // ms
    const FLICKER_STEP_DELAY_RANDOM = 120; // ms
    const DAY_NIGHT_CYCLE_MINUTES = 5;
    const DAY_NIGHT_UPDATE_INTERVAL_MS = 30 * 1000; // Update every 30 seconds
    const INITIAL_SHADOW_LENGTH = 30; // vh
    const SHADOW_LENGTH_VARIATION = 20; // vh
    const SOUND_BAR_COUNT = 5;
    const SOUND_BAR_UPDATE_INTERVAL_MS = 250; // ms
    const SOUND_BAR_MIN_H = 4; // px
    const SOUND_BAR_RAND_H = 8; // px
    const SOUND_BAR_MIN_OP = 0.3;
    const SOUND_BAR_RAND_OP = 0.3;


    // --- Types ---
    interface ChatMessage {
        text: string;
        isSystem: boolean;
    }
    interface DustParticle {
        x: number;
        y: number;
        baseOpacity: number; // Store base opacity
        opacity: number;
        speed: number;
        offset: number; // For smoother animation
    }
    interface SoundBarStyle {
        height: number;
        opacity: number;
    }

    // --- Socket.IO Variables ---
    let messages: ChatMessage[] = [];
    let currentMessage: string = '';
    let socket: Socket | undefined;

    // --- Sound Variables ---
    let ambientSound: Howl | null = null;
    let sfx: { [key: string]: Howl } = {}; // Store SFX Howl instances
    const sfxFiles = ['creak', 'footstep', 'flicker']; // Names matching files (without sfx_)
    let randomSfxTimeout: number | null = null; // Use Timeout for single events
    let audioInitialized = false;

    // --- Visual Effect Variables ---
    let visualsInitialized = false;
    let lightIntensity = new Tween(50, { duration: 200, easing: cubicOut }); // Faster duration for flicker
    let dustParticles: DustParticle[] = [];
    let dustInterval: number | null = null;
    let shadowLength = new Tween(INITIAL_SHADOW_LENGTH, { duration: DAY_NIGHT_UPDATE_INTERVAL_MS, easing: cubicOut }); // Sync duration
    let soundBarStyles: SoundBarStyle[] = Array(SOUND_BAR_COUNT).fill({ height: SOUND_BAR_MIN_H, opacity: SOUND_BAR_MIN_OP }); // Initial state
    let soundBarInterval: number | null = null;

    // --- Waiting Time Variables ---
    let waitingTime = 0;
    let waitingInterval: number | null = null;

    // --- Hallucination Variables ---
    const hallucinations = [
        "Did someone just whisper?", "The door handle turned slightly...", "A shadow moved across the wall.",
        "The light flickered in a pattern.", "Was that footsteps?", "Someone was just here...",
        "The air feels different now."
    ];
    let hallucinationTimeout: number | null = null;
    let showHallucination = false;
    let currentHallucination = "";

    // --- Day/Night Cycle Variables ---
    const filterValues = new Tween({ hue: 0, brightness: 100 }, {
        duration: DAY_NIGHT_UPDATE_INTERVAL_MS, // Match update interval for smooth transition
        easing: cubicOut
    });
    let cycleInterval: number | null = null;
    let currentCycleProgress = 0; // 0 to 1

    // --- Helper to add messages ---
    function addMessage(text: string, isSystem: boolean = false) {
        messages = [...messages, { text, isSystem }];
    }

    onMount(() => {
        // Initialize socket connection
        const localSocket = io(SOCKET_URL);
        socket = localSocket;

        // Set up socket event listeners
        localSocket.on('connect', () => {
            addMessage(`--- Connected to the lobby ---`, true);
        });

        // **ADDED** Error handling for connection
        localSocket.on('connect_error', (err) => {
            console.error("Socket connection error:", err.message);
            addMessage(`--- Error connecting to lobby: ${err.message} ---`, true);
        });

        localSocket.on('chat message', async (msg: string) => { // Mark async
            addMessage(msg, false); // Assume user message
            // Auto-scroll to the bottom using tick()
            await tick(); // **CHANGED** Wait for DOM update
            const chatBox = document.getElementById('chat-box');
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        });

        localSocket.on('disconnect', () => {
            addMessage(`--- Disconnected from the lobby ---`, true);
        });

        // --- Initialize Day/Night Cycle ---
        function advanceCycle() {
            const totalSteps = (DAY_NIGHT_CYCLE_MINUTES * 60 * 1000) / DAY_NIGHT_UPDATE_INTERVAL_MS;
            currentCycleProgress = (currentCycleProgress + 1 / totalSteps) % 1;

            const sineProgress = Math.sin(currentCycleProgress * Math.PI); // 0 -> 1 -> 0
            const hueShift = sineProgress * 60;
            const brightnessShift = 100 - sineProgress * 30;
            const currentShadowLength = INITIAL_SHADOW_LENGTH + SHADOW_LENGTH_VARIATION * sineProgress;

            // Use set method to smoothly animate over the tween duration
            console.log(`Advancing cycle: Progress=<span class="math-inline">\{currentCycleProgress\}, Hue\=</span>{hueShift}, Brightness=<span class="math-inline">\{brightnessShift\}, Shadow\=</span>{currentShadowLength}`); // Add this
            filterValues.set({ hue: hueShift, brightness: brightnessShift });
            shadowLength.set(currentShadowLength);
        }

        cycleInterval = setInterval(advanceCycle, DAY_NIGHT_UPDATE_INTERVAL_MS);
        advanceCycle(); // Run once immediately

        // Note: Visuals and Audio start after user interaction via handleFirstInteraction()
    });

    // Function to initialize audio (called after user interaction)
    function initializeAudio() {
        if (audioInitialized) return;

        try {
            // Ambient Loop (Removed html5: true)
            ambientSound = new Howl({
                src: ['/sounds/ambient_loop.mp3', '/sounds/ambient_loop.ogg'],
                autoplay: false, // Autoplay prevented by browsers anyway
                loop: true,
                volume: AMBIENT_VOLUME,
            });

            // Load SFX
            sfxFiles.forEach(name => {
                sfx[name] = new Howl({
                    src: [`/sounds/sfx_${name}.mp3`, `/sounds/sfx_${name}.ogg`],
                    volume: SFX_VOLUME,
                });
            });

            // Explicitly play the ambient sound after user interaction context
            ambientSound.play();
            addMessage(`--- Ambient sounds enabled ---`, true);

            // Start Random SFX Timer (using timeout for staggered plays)
            function scheduleRandomSfx() {
                const randomDelay = MIN_SFX_DELAY + Math.random() * (MAX_SFX_DELAY - MIN_SFX_DELAY);
                if (randomSfxTimeout) clearTimeout(randomSfxTimeout); // Clear previous timeout just in case
                randomSfxTimeout = setTimeout(() => {
                    playRandomSfx();
                    scheduleRandomSfx(); // Schedule the next one after playing
                }, randomDelay);
            }

            function playRandomSfx() {
                 if (sfxFiles.length > 0 && Math.random() < 0.6) { // Add chance to *not* play
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
            }

            scheduleRandomSfx(); // Start the first timeout

            audioInitialized = true;
            initializeVisuals(); // Start visuals once audio is confirmed playing

        } catch (error) {
            console.error("Error initializing sounds:", error);
            addMessage(`--- Audio Error: Could not initialize sounds. ---`, true);
        }
    }

    // Function to initialize visual effects
    function initializeVisuals() {
        if (visualsInitialized) return;

        // --- Create dust particles ---
        for (let i = 0; i < NUM_DUST_PARTICLES; i++) {
            dustParticles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                baseOpacity: 0.05 + Math.random() * 0.1, // Lower base
                opacity: 0.1,
                speed: 0.05 + Math.random() * 0.1,
                offset: Math.random() * 1000 // Random offset for sine wave
            });
        }
        dustParticles = dustParticles; // Trigger reactivity

        // --- Animate dust particles ---
        dustInterval = setInterval(() => {
            const now = Date.now();
            // console.log('Updating dust...'); // Add this
            dustParticles = dustParticles.map(particle => {
                // **CHANGED** Smoother opacity using sine wave + base random
                const opacityVariation = Math.sin(now / 2000 + particle.offset) * 0.05; // Slow sine wave
                // ... calculation ...
        // console.log(`Particle y: ${newY}, opacity: ${newOpacity}`);
                return {
                    ...particle,
                    y: (particle.y + particle.speed) % 100, // Wrap around Y
                    opacity: Math.max(0, Math.min(1, particle.baseOpacity + opacityVariation)) // Clamp opacity
                };
            });
             // console.log('Dust particles array assigned');
        }, DUST_ANIMATION_INTERVAL);

        // --- Setup Sound Bar Animation ---
        soundBarInterval = setInterval(() => {
            // console.log('Updating sound bars...');
             soundBarStyles = Array.from({ length: SOUND_BAR_COUNT }, () => ({
                height: SOUND_BAR_MIN_H + Math.random() * SOUND_BAR_RAND_H,
                opacity: SOUND_BAR_MIN_OP + Math.random() * SOUND_BAR_RAND_OP
            }));
        }, SOUND_BAR_UPDATE_INTERVAL_MS);


        // --- Setup waiting time counter & periodic hallucinations ---
        waitingInterval = setInterval(() => {
            waitingTime += 1;

            // Trigger hallucinations periodically based on waiting time
            if (waitingTime % HALLUCINATION_INTERVAL_SECONDS === 0 && waitingTime > 0 && Math.random() < 0.3) { // Add randomness
                triggerHallucination();
            }
        }, WAITING_INTERVAL);

        visualsInitialized = true;
    }

    // Function to create light flicker effect (triggered by SFX/interaction)
    function triggerLightFlicker() {
        let step = 0;
        function doFlicker() {
            if (step < FLICKER_SEQUENCE.length) {
                lightIntensity.set(FLICKER_SEQUENCE[step]);
                console.log(`Flicker step <span class="math-inline">\{step\}\: Intensity\=</span>{FLICKER_SEQUENCE[step]}`);
                lightIntensity = lightIntensity; // Force update
                step++;
                setTimeout(doFlicker, FLICKER_STEP_DELAY_BASE + Math.random() * FLICKER_STEP_DELAY_RANDOM);
            } else {
                // Return to a slightly varied normal intensity
                lightIntensity.set(40 + Math.random() * 20);
        lightIntensity = lightIntensity; // Force update

            }
        }
        doFlicker();
    }

    // Function to trigger hallucinations
    function triggerHallucination() {
        currentHallucination = hallucinations[Math.floor(Math.random() * hallucinations.length)];
        showHallucination = true;

        if (hallucinationTimeout) clearTimeout(hallucinationTimeout); // Clear existing timeout
        hallucinationTimeout = setTimeout(() => {
            showHallucination = false;
        }, HALLUCINATION_DURATION_MS);
    }

    // Called when user clicks "Enable Experience"
    function handleFirstInteraction() {
        initializeAudio();
    }

    onDestroy(() => {
        // Disconnect Socket
        if (socket) {
            socket.disconnect();
            console.log("Socket disconnected on component destroy");
        }

        // Cleanup Sounds
        if (ambientSound) {
            ambientSound.stop();
            ambientSound.unload();
        }
        Object.values(sfx).forEach(sound => sound.unload());
        if (randomSfxTimeout) clearTimeout(randomSfxTimeout);

        // Cleanup Intervals & Timeouts
        if (cycleInterval) clearInterval(cycleInterval);
        if (dustInterval) clearInterval(dustInterval);
        if (waitingInterval) clearInterval(waitingInterval);
        if (hallucinationTimeout) clearTimeout(hallucinationTimeout);
        if (soundBarInterval) clearInterval(soundBarInterval); // **ADDED** Cleanup sound bar interval

    });

    // Chat functions
    function sendMessage() {
        if (currentMessage.trim() && socket) {
            socket.emit('chat message', currentMessage);
            currentMessage = ''; // Clear input
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    // Interaction handlers
    function inspectLight() {
        addMessage(`--- You inspect the flickering light. It buzzes quietly. ---`, true);
        triggerLightFlicker(); // Trigger the effect on inspection
    }

    function lookDownHallway() {
        addMessage(`--- You peer down the dark hallway. Nothing but shadows... or was that something? ---`, true);
        // Chance to trigger a delayed hallucination or SFX
        if (Math.random() > 0.5) {
            setTimeout(triggerHallucination, 1500 + Math.random() * 2000);
        }
        if (Math.random() > 0.7 && sfx['footstep']) {
             setTimeout(() => sfx['footstep']?.play(), 1000 + Math.random() * 1500);
        }
    }
</script>

<style lang="css">
    #chat-box {
        scroll-behavior: smooth;
    }

    .interaction-hint {
        cursor: pointer;
        transition: color 0.3s ease;
    }

    .interaction-hint:hover,
    .interaction-hint:focus { /* Added focus style */
        color: #b3b3b3; /* Lighter gray for hover/focus */
        outline: none; /* Remove default outline if needed, but ensure visibility */
    }

    /* Visual effects */
    .light {
        /* Uses --intensity CSS variable set by JS tween */
        box-shadow: 0 0 15px rgba(255, 240, 200, var(--intensity));
        transition: box-shadow 0.08s ease-out; /* Faster transition for flicker */
    }

    .dust-particle {
        position: absolute;
        width: 1px;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.5); /* Slightly more visible */
        pointer-events: none;
        /* Opacity set by inline style */
        will-change: transform, opacity; /* Hint for performance */
    }

    .hallucination {
        position: absolute;
        opacity: 0;
        transition: opacity 1.5s ease-in-out;
        text-align: center;
        width: 100%;
        font-style: italic;
        color: #a0a0a0; /* Slightly distinct color */
        pointer-events: none; /* Don't block interactions */
        z-index: 5; /* Ensure it's above dust/shadows */
    }

    .hallucination.visible {
        opacity: 0.6;
    }

    .shadow-element {
        position: absolute;
        background: linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent); /* Softer shadow */
        transform-origin: top center;
        width: 3px;
        /* Height, left, top, transform set by inline style */
        will-change: height;
    }

    .clock-tick {
        transition: transform 1s cubic-bezier(0.4, 2.3, 0.7, 0.8); /* Nice easing */
    }

    .reflection {
        position: absolute;
        bottom: -20px;
        left: 0;
        right: 0;
        height: 20px;
        background: linear-gradient(to bottom, rgba(50,50,50,0.15), transparent); /* Slightly adjusted reflection */
        transform: scaleY(-1);
        filter: blur(2px);
        opacity: 0.3;
        pointer-events: none;
    }

    /* Removed @keyframes flicker and .flicker-animation */

</style>