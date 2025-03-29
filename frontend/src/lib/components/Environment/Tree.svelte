<script lang="ts">
    import { cubicOut } from 'svelte/easing';
    import { environmentStore } from '$lib/stores/environment';
  
    // Vanilla JS animation with requestAnimationFrame
    let growthProgress = 0;
    const animateTree = (duration: number) => {
      const start = performance.now();
      
      const frame = (time: number) => {
        const elapsed = time - start;
        growthProgress = Math.min(elapsed / duration, 1);
        $environmentStore.treeOpacity = 0.8 * (1 - growthProgress);
  
        if (elapsed < duration) {
          requestAnimationFrame(frame);
        }
      };
  
      requestAnimationFrame(frame);
    };
  
    // Start 10-second growth animation
    animateTree(10000);
  </script>
  
  <svg
    class="existential-tree"
    viewBox="0 0 100 200"
    style="opacity: {$environmentStore.treeOpacity}"
  >
    <!-- Trunk -->
    <path
      d="M50 180 Q55 150 50 120 Q45 90 50 60"
      stroke="rgba(120, 90, 60, 0.8)"
      stroke-width="{3 - growthProgress}"
      fill="none"
    />
    
    <!-- Branches -->
    {#each $environmentStore.treeBranches as branch}
      <path
        d={branch.path}
        stroke="rgba(90, 70, 50, {0.7 - (growthProgress * 0.3)})"
        stroke-width={branch.width}
      />
    {/each}
  
    <!-- Leaves -->
    {#each $environmentStore.treeLeaves as leaf}
      <circle
        cx={leaf.x}
        cy={leaf.y}
        r={leaf.size}
        fill="rgba(180, 200, 150, {0.4 - (growthProgress * 0.2)})"
      />
    {/each}
  </svg>
  
  <style>
    .existential-tree {
      position: absolute;
      bottom: 10%;
      left: 50%;
      height: 50vh;
      transform: translateX(-50%);
      transition: opacity 2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  </style>