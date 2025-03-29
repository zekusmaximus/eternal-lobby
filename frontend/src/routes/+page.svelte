<script>
    import { onMount } from 'svelte';
    import { ambientSound, initializeAudio } from '$lib/stores/audioStore';
    import { startWaiting, distortedTime } from '$lib/stores/timeStore';
    import TimeHeader from '$lib/components/Interface/TimeHeader.svelte';
    import ChatInterface from '$lib/components/Interface/Chat.svelte';
    import ExistentialTree from '$lib/components/Environment/Tree.svelte';
    import FlickerLight from '$lib/components/Environment/FlickerLight.svelte';
    import Atmosphere from '$lib/components/Environment/Atmosphere.svelte';
  
    onMount(() => {
      initializeAudio();
      startWaiting();
    });
    $: audioEnabled = $ambientSound.enabled;
  </script>
  
  <div class="voidscape">
    <!-- Environmental Elements -->
    <FlickerLight />
    <ExistentialTree />
    <Atmosphere />
  
    <!-- User Interface -->
    <TimeHeader />
    <ChatInterface />
  
    <!-- Hidden Audio Container -->
    {#if $ambientSound.element}
    <audio 
        bind:this={$ambientSound.element}
        class="ambient-audio"
    ></audio>
{/if}
  </div>
  
  <style lang="postcss">
    .voidscape {
      position: relative;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: linear-gradient(
        to bottom,
        hsl(220deg 15% 12%),
        hsl(220deg 20% 8%)
      );
      font-family: 'Cormorant Garamond', serif;
    }
  </style>