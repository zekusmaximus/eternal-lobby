<script lang="ts">
    import { Spring } from 'svelte/motion';
    import { environmentStore } from '$lib/stores/environment';
    import type { Particle } from '$lib/stores/environment';
  

    
    // Typed particle updater function
    const calculateParticlePositions = (direction: number, particles: Particle[]) => {
      const angle = (direction * Math.PI) / 180;
      const windX = Math.cos(angle) * 0.02;
      const windY = Math.sin(angle) * 0.02;
  
      return particles.map(p => ({
        x: (p.x + p.speedX + windX + Math.random() * 0.01) % 100,
        y: (p.y + p.speedY + windY + Math.random() * 0.01) % 100,
        opacity: Math.max(0.1, Math.min(0.4, p.opacity + (Math.random() - 0.5) * 0.02)),
        rotation: p.rotation + (Math.random() - 0.5) * 2,
        speedX: p.speedX,
        speedY: p.speedY
      }));
    };
  
    // Initialize particles with proper type
    environmentStore.update(env => ({
      ...env,
      dustParticles: Array.from({ length: 50 }, (): Particle => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: 0.2 + Math.random() * 0.2,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: Math.random() * 0.03
      }))
    }));
  </script>
  
  {#each $environmentStore.dustParticles as particle}
    <div
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
      transition: 
        left 0.5s linear,
        top 0.7s linear,
        opacity 1s ease-out;
      will-change: transform, opacity;
    }
  </style>