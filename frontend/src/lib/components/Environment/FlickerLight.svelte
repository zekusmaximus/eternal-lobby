<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';

  const lightPosition = writable({
    x: 50,
    y: 20
  });

  let animationFrame: number;

  const animateLight = () => {
    const newPos = {
      x: 40 + Math.random() * 20,
      y: 15 + Math.random() * 10
    };
    
    lightPosition.update(pos => ({
      x: pos.x + (newPos.x - pos.x) * 0.1,
      y: pos.y + (newPos.y - pos.y) * 0.1
    }));

    animationFrame = requestAnimationFrame(animateLight);
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      animateLight();
    }
    return () => cancelAnimationFrame(animationFrame);
  });

  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
</script>

<div
  class="flicker-light"
  style="
    left: {$lightPosition.x}%;
    top: {$lightPosition.y}%;
  "
></div>

<style>
  .flicker-light {
    position: fixed;
    width: 150px;
    height: 150px;
    background: radial-gradient(
      circle at center,
      rgba(255, 240, 200, 0.3),
      transparent 60%
    );
    filter: blur(20px);
    transition: 
      left 0.7s cubic-bezier(0.4, 0, 0.2, 1),
      top 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }
</style>