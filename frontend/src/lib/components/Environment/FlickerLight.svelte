<script lang="ts">
    import { Spring } from 'svelte/motion';
  
    // Properly typed spring initialization
    const lightIntensity = new Spring(0.3, {
      stiffness: 0.2,
      damping: 0.4,
      precision: 0.01
    });
  
    const lightPosition = new Spring(
      { x: 50, y: 20 },
      {
        stiffness: 0.1,
        damping: 0.3,
        precision: 0.1
      }
    );
  
    // Random light movement
    setInterval(() => {
      lightPosition.set({
        x: 40 + Math.random() * 20,
        y: 15 + Math.random() * 10
      });
    }, 7000);
  </script>
  
  <div
    class="flicker-light"
    style="
      left: {$lightPosition.x}%;
      top: {$lightPosition.y}%;
      opacity: {$lightIntensity};
    "
  ></div>