<script>
  export let visible;
</script>

{#if visible}
  <div class="shadow"></div>
{/if}

<style>
  .shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: none;
    animation: shadow-pass 5s linear;
  }

  @keyframes shadow-pass {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>