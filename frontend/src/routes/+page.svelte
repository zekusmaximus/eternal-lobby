<script>
  import { onMount, onDestroy } from 'svelte';
  import { ambientSound, initializeAudio, updateAmbientVolume } from '$lib/stores/audioStore';
  import { startWaiting, stopWaiting, distortedTime } from '$lib/stores/timeStore';
  import { triggerHallucination } from '$lib/stores/dialogueStore';
  import { playRandomSoundEffect } from '$lib/stores/audioStore';
  import { growTree } from '$lib/stores/environment';
  import { addDespair, despairLevel } from '$lib/stores/despairStore'; // Import despair-related functions/stores
  import TimeHeader from '$lib/components/Interface/TimeHeader.svelte';
  import ChatInterface from '$lib/components/Interface/Chat.svelte';
  import ExistentialTree from '$lib/components/Environment/Tree.svelte';
  import FlickerLight from '$lib/components/Environment/FlickerLight.svelte';
  import Atmosphere from '$lib/components/Environment/Atmosphere.svelte'
  import Prompt from '$lib/components/Interface/Prompt.svelte';
  import { showRandomPrompt, currentPrompt } from '$lib/stores/promptStore';
  import NPC from '$lib/components/Interface/NPC.svelte';
  import { showRandomNPC, currentNPC } from '$lib/stores/npcStore';
  import Shadow from '$lib/components/Environment/Shadow.svelte';
  import { showShadow, shadowVisible } from '$lib/stores/shadowStore';

  onMount(() => {
    initializeAudio();
    startWaiting();
    // Show a random prompt every 15 seconds
    const promptInterval = setInterval(showRandomPrompt, 15000);
     // Show a random NPC every 30 seconds
    const npcInterval = setInterval(showRandomNPC, 30000);
     // Show a random shadow every 45 seconds
    const shadowInterval = setInterval(showShadow, 45000);

    return () => {
      stopWaiting();
      clearInterval(promptInterval);
      clearInterval(npcInterval);
      clearInterval(shadowInterval);
    };
  });

  onDestroy(() => {
    stopWaiting();
  });

  $: audioEnabled = $ambientSound.enabled;
  $: hue = Math.round(($distortedTime / 60) % 360);
  // Darken the background based on despairLevel
  $: darkness = $despairLevel.level / 10; // Creates a value from 0 to 10
  $: backgroundColor = `linear-gradient(to bottom, hsl(${hue}, 15%, ${12 - darkness}%), hsl(${hue + 20}, 20%, ${8 - darkness}%))`;

  // Adjust volume based on despairLevel (range from 1 to 0)
  $: volume = Math.max(0, 1 - ($despairLevel.level / 100)); // Volume from 1 to 0
  $: updateAmbientVolume(volume);

  function inspectLight() {
    triggerHallucination("The flickering is unsettling...", 3000);
  }

  function checkHallway() {
    playRandomSoundEffect();
    triggerHallucination("A cold draft sweeps through...", 2000);
  }

  function checkTree() {
    const grew = growTree();
    if (!grew) {
      triggerHallucination("The tree remains stubbornly still.", 3000);
    }
  }

    function inspectPainting() {
        triggerHallucination("The painting stares back at you, its eyes filled with an unsettling familiarity.", 3000);
    }

    function listenToRadio() {
        playRandomSoundEffect();
        triggerHallucination("A faint, distorted melody drifts from the radio.", 2000);
    }

    function openDoor() {
        triggerHallucination("The door is locked. You feel a sense of hopelessness.", 3000);
    }

  function expressDespair() {
    addDespair(10);
    triggerHallucination("A wave of hopelessness washes over you.", 2000);
  }

  function paceAnxiously() {
    addDespair(5);
    playRandomSoundEffect();
    triggerHallucination("Your footsteps echo in the emptiness.", 1500);
  }

  function stareIntoVoid() {
    addDespair(15);
    triggerHallucination("The void stares back.", 4000);
  }
</script>

<div class="voidscape" style:background="{backgroundColor}">
  <!-- Hallway Visuals (SVG) -->
  <svg class="hallways">
    <path
      id="hallway-left"
      d="M0 50 C 50 40, 50 60, 100 50 L 100 150 C 50 160, 50 140, 0 150 Z"
    />
    <path
      id="hallway-right"
      d="M100 50 C 50 40, 50 60, 0 50 L 0 150 C 50 160, 50 140, 100 150 Z"
    />
  </svg>

  <!-- Environmental Elements -->
  <FlickerLight />
  <ExistentialTree />
  <Atmosphere />
    <Shadow visible={$shadowVisible} />

  <!-- User Interface -->
  <TimeHeader />

  <div class="actions">
    <button on:click={inspectLight}>Inspect Light</button>
    <button on:click={checkHallway}>Check Hallway</button>
    <button on:click={checkTree}>Inspect Tree</button>
      <button on:click={inspectPainting}>Inspect Painting</button>
      <button on:click={listenToRadio}>Listen to Radio</button>
      <button on:click={openDoor}>Open Door</button>
  </div>
    <div class="emotions">
        <button on:click={expressDespair}>Express Despair</button>
        <button on:click={paceAnxiously}>Pace Anxiously</button>
        <button on:click={stareIntoVoid}>Stare into Void</button>
        <p>Current State: {$despairLevel.description}</p>
    </div>

    <div class="chat-container">
        <ChatInterface />
    </div>

    {#if $currentPrompt}
      <Prompt prompt={$currentPrompt} />
    {/if}

    {#if $currentNPC}
        <NPC name={$currentNPC.name} message={$currentNPC.message} />
    {/if}

  <!-- Hidden Audio Container -->
  {#if $ambientSound.element}
    <audio bind:this={$ambientSound.element} class="ambient-audio"></audio>
  {/if}
</div>

<style lang="postcss">
  .voidscape {
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family: 'Cormorant Garamond', serif;
  }

  .actions {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: flex;
    gap: 1rem;
  }

  .actions button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .actions button:hover {
    background: rgba(255, 255, 255, 0.2);
  }
    .emotions {
        position: absolute;
        bottom: 4rem;
        left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .emotions button {
        background: rgba(100, 100, 100, 0.1);
        border: 1px solid rgba(100, 100, 100, 0.2);
        color: rgba(100, 100, 100, 0.7);
        padding: 0.3rem 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

  .hallways {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Ensure hallways don't block clicks */
  }

  .hallways path {
    fill: rgba(30, 30, 30, 0.5); /* Dark, translucent fill */
    stroke: rgba(50, 50, 50, 0.3); /* Subtle stroke */
    stroke-width: 2;
    animation: flicker 4s infinite; /* Apply the flicker animation */
  }
    #hallway-left {
        transform: translateX(-25%) translateY(10%) scale(0.5);
        transform-origin: top left;
    }
    #hallway-right {
        transform: translateX(25%) translateY(10%) scale(0.5) rotateY(180deg);
        transform-origin: top right;
    }

  @keyframes flicker {
    0% {
      opacity: 0.5;
    }
    25% {
      opacity: 0.55;
    }
    50% {
      opacity: 0.45;
    }
    75% {
      opacity: 0.5;
    }
    100% {
      opacity: 0.5;
    }
  }
    .chat-container {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        width: 300px;
        height: 200px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
    }
</style>