<script>
    import Weaponcard from './Weaponcard.svelte';
	import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let selected_weapons;
</script>

<div id="component">
    {#each (selected_weapons ?? []) as name}
        <div class="weapon-card">
            <Weaponcard {name} on:remove_weapon={() => {
                dispatch('remove_weapon', name);
                setTimeout(() => selected_weapons = selected_weapons, 1);
            }}/>
        </div>
    {/each}
</div>

<style>
    #component {
        margin-top: 30px;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: flex-start;
    }

    .weapon-card {
        margin: 15px;
    }
</style>