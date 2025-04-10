<script>
  export let prompt;
</script>

<div class="prompt">
  {prompt}
</div>

<style>
  .prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 1rem;
    border-radius: 5px;
    font-size: 1.2rem;
    pointer-events: none;
  }
</style>