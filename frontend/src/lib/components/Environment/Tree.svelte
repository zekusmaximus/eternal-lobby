<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  // Import both the store and the growTree function
  import { environmentStore, growTree } from '$lib/stores/environment';

  let growthProgress = 0;
  let animationFrame: number;
  let growthInterval: number; // Variable to hold the interval ID

  // Existing animation function for fading effects (can be adjusted/removed)
  const animateTreeVisuals = (duration: number) => { // Renamed for clarity
    if (typeof window === 'undefined') return; // Server-side guard

    const start = performance.now();

    const frame = (time: number) => {
      const elapsed = time - start;
      // Calculate fade progress (you might want to change this logic)
      growthProgress = Math.min(elapsed / duration, 1);
      // Example: Link opacity inversely to progress (fades out)
      $environmentStore.treeOpacity = 0.8 * (1 - growthProgress);

      if (elapsed < duration) {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        // Optional: Stop fading animation if duration is reached
        // $environmentStore.treeOpacity = 0; // Or some minimum value
      }
    };
    animationFrame = window.requestAnimationFrame(frame);
  };

  onMount(() => {
    // Start the fading animation (current duration 10 seconds)
    animateTreeVisuals(10000);

    // Start the growth interval - add a branch/leaf every 500ms (adjust as needed)
    if (typeof window !== 'undefined') {
      growthInterval = window.setInterval(() => {
        // Call the imported growTree function from the store
        growTree(); // This function updates the environmentStore
      }, 500); // Grow every 0.5 seconds
    }

    // Cleanup function: clears both animation frame and interval
    return () => {
      if (typeof window !== 'undefined') {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        if (growthInterval) window.clearInterval(growthInterval);
      }
    };
  });

</script>

<svg
  class="existential-tree"
  viewBox="0 0 100 200"
  style="opacity: {$environmentStore.treeOpacity}"
>
  <path
    d="M50 180 Q55 150 50 120 Q45 90 50 60"
    stroke="rgba(120, 90, 60, 0.8)"
    stroke-width="{Math.max(0.5, 3 - growthProgress)}" fill="none"
  />

  {#each $environmentStore.treeBranches as branch (branch.path)} <path
      d={branch.path}
      stroke="rgba(90, 70, 50, {Math.max(0.1, 0.7 - (growthProgress * 0.3))})" stroke-width={branch.width}
      fill="none" />
  {/each}

  {#each $environmentStore.treeLeaves as leaf (leaf.x + leaf.y)} <circle
      cx={leaf.x}
      cy={leaf.y}
      r={leaf.size}
      fill="rgba(180, 200, 150, {Math.max(0.1, 0.4 - (growthProgress * 0.2))})" />
  {/each}
</svg>

<style>
  .existential-tree {
    position: absolute;
    bottom: 10%;
    left: 50%;
    height: 50vh;
    transform: translateX(-50%);
    /* Existing opacity transition might conflict with rAF updates, test */
    /* transition: opacity 2s cubic-bezier(0.4, 0, 0.2, 1); */
    pointer-events: none; /* Trees usually aren't interactive */
  }
</style>