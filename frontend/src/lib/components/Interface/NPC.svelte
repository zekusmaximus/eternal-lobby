<script>
  export let name;
  export let message;
</script>

<div class="npc">
  <div class="npc-name">{name}</div>
  <div class="npc-message">{message}</div>
</div>

<style>
  .npc {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem;
    border-radius: 5px;
    font-size: 1.2rem;
    pointer-events: none;
    z-index: 10;
  }

  .npc-name {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
</style>