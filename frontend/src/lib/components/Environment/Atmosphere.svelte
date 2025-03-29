<script lang="ts">
  // Import necessary Svelte lifecycle functions and the store/types
  import { onMount, onDestroy } from 'svelte';
  import { environmentStore } from '$lib/stores/environment';
  import type { Particle } from '$lib/stores/environment';

  // Variable to hold the animation frame ID for cleanup
  let animationFrame: number;

  // --- Particle Update Logic (moved into a reusable function) ---
  // (This function is largely the same as before, calculates next state)
  const calculateNextParticleState = (particles: Particle[]): Particle[] => {
    // You could introduce dynamic wind direction here if desired
    const windDirection = 0; // Example: static wind direction
    const angle = (windDirection * Math.PI) / 180;
    const windX = Math.cos(angle) * 0.01; // Adjusted wind effect slightly
    const windY = Math.sin(angle) * 0.01; // Adjusted wind effect slightly

    return particles.map(p => {
      // Basic gravity/drift downwards + wind + slight random horizontal movement
      let nextX = p.x + p.speedX + windX + (Math.random() - 0.5) * 0.05;
      let nextY = p.y + p.speedY + windY + Math.random() * 0.03;

      // Boundary check (wrap around screen)
      if (nextX > 100) nextX = 0;
      if (nextX < 0) nextX = 100;
      if (nextY > 100) nextY = 0;
      // Removed bottom boundary check to let them drift off and reappear at top

      return {
        ...p, // Keep original speedX, speedY, rotation properties unless changed
        x: nextX,
        y: nextY,
        // Slightly change opacity and rotation over time for more dynamic feel
        opacity: Math.max(0.1, Math.min(0.4, p.opacity + (Math.random() - 0.5) * 0.01)),
        rotation: p.rotation + (Math.random() - 0.5) * 1,
      };
    });
  };

  // --- Animation Loop ---
  const animateParticles = () => {
    if (typeof window !== 'undefined') { // Ensure runs client-side
      environmentStore.update(env => ({
          ...env,
          dustParticles: calculateNextParticleState(env.dustParticles)
      }));
      // Request the next frame
      animationFrame = requestAnimationFrame(animateParticles);
    }
  };

  // --- Component Lifecycle ---
  onMount(() => {
    // Initialize particles (only if they haven't been initialized yet)
    // Check the length, assuming initialization happens once globally or needs reset here
    let currentParticles: Particle[] = [];
    const unsubscribe = environmentStore.subscribe(env => {
      currentParticles = env.dustParticles;
    });
    unsubscribe(); // Immediately unsubscribe after getting the value

    if (currentParticles.length === 0) {
        environmentStore.update(env => ({
          ...env,
          dustParticles: Array.from({ length: 50 }, (): Particle => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 0.1 + Math.random() * 0.2, // Slightly dimmer start
            rotation: Math.random() * 360,
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: Math.random() * 0.03 + 0.01 // Ensure slight downward drift baseline
          }))
        }));
    }

    // Start the animation loop
    animateParticles();

    // Cleanup function to cancel animation when component is destroyed
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  // An explicit onDestroy is also fine, but returning from onMount is idiomatic
  // onDestroy(() => {
  //  if (animationFrame) {
  //      cancelAnimationFrame(animationFrame);
  //  }
  // });

</script>

{#each $environmentStore.dustParticles as particle (particle.x + particle.y)} <div
    class="atmospheric-particle"
    style="
      left: {particle.x}%;
      top: {particle.y}%;
      opacity: {particle.opacity};
      transform: rotate({particle.rotation}deg);
    "
  ></div>
{/each}

<style>
  .atmospheric-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    pointer-events: none;
    /* Transitions might make movement look jerky with rAF, */
    /* consider removing if animation loop handles smoothness. */
    /* Test with and without transitions: */
    /* transition:
        left 0.05s linear,
        top 0.05s linear,
        opacity 0.5s ease-out; */
    will-change: transform, opacity, left, top; /* Hint browser about changes */
  }
</style>