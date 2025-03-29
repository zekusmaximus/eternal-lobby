<script>
    import { activeHallucination } from '$lib/stores/dialogueStore';
    import { fade } from 'svelte/transition';
</script>

{#if $activeHallucination}
    <div transition:fade class="hallucination">
        {$activeHallucination}
    </div>
{/if}