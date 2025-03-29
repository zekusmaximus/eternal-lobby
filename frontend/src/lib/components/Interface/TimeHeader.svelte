<script>
    import { ambientSound, toggleAudio } from '$lib/stores/audioStore';
    import { distortedTime } from '$lib/stores/timeStore';
  
    $: audioEnabled = $ambientSound.enabled;
    $: clockRotation = ($distortedTime * 6) % 360;
  </script>
  
  <div class="temporal-interface">
    <!-- Clock element -->
    <div class="clock-face">
      <div class="clock-hand" style="transform: rotate({clockRotation}deg)"></div>
    </div>
  
    <!-- Audio toggle using #3 pattern -->
    <button
      on:click={toggleAudio}
      class="audio-toggle {audioEnabled ? 'active' : ''}"
    >
      {audioEnabled ? '◼︎ Silence' : '▶︎ Listen'}
    </button>
  </div>
  
  <style>
    .audio-toggle {
      opacity: 0.7;
      transition: opacity 0.3s ease;
      &:hover {
        opacity: 1;
      }
      &.active {
        color: #e3dac9; /* Warm tone for active state */
      }
    }
  </style>