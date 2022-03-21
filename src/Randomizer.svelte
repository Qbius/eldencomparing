<script>
    import {Button, Input, Collapse, Icon, Card} from 'sveltestrap';
    import {createEventDispatcher} from 'svelte';
    import {weapons} from './quickload.js';

    const all_types = Array.from(new Set(Object.values(weapons).map(infusions => Object.values(infusions).map(({type}) => type)).flat())).sort();
    let type_selection = all_types.map(_ => true);

    all_types.map((e, index) => [e.toLowerCase(), index]).filter(([e, _]) => ['bow', 'shield', 'seal', 'staff', 'torch'].some(t => e.includes(t))).forEach(([_, index]) => type_selection[index] = false);

    let open_collapse = false;

    $: selected_types = all_types.filter((_, index) => type_selection[index]);

    function random_weapon(types) {
        const weapons_to_choose = Object.entries(weapons).filter(([_, {standard: weapon}]) => !console.log(weapon) && types.includes(weapon.type)).map(([name, _]) => name);
        return weapons_to_choose[Math.floor(Math.random() * weapons_to_choose.length)];
    }

    const dispatch = createEventDispatcher();
</script>

<div id="component">
        <Button disabled={!type_selection.some(e => e)} on:click={() => dispatch('add_weapon', random_weapon(selected_types))}>RANDOM</Button>
        <div style="display: flex; flex-direction: column;">
            <Button on:click={() => open_collapse = !open_collapse} on:blur={() => open_collapse = false}><Icon style="font-size: 16px;" name="list-ul"/></Button>
            <div style="position: relative;">
                <Collapse isOpen={open_collapse} style="position: absolute; z-index: 10;" on:blur={() => open_collapse = false}>
                    <Card body>
                        <div style="display: flex;">
                            <div style="width: 200px;">
                                {#each all_types.slice(0, Math.floor(all_types.length / 2)) as type, index}
                                <Input type="switch" label={type} bind:checked={type_selection[index]}/>
                                {/each}
                            </div>
                            <div style="width: 300px;">
                                {#each all_types.slice(Math.floor(all_types.length / 2)) as type, index}
                                <Input type="switch" label={type} bind:checked={type_selection[index + Math.floor(all_types.length / 2)]}/>
                                {/each}
                            </div>
                        </div>
                    </Card>
                </Collapse>

            </div>
        </div>
</div>

<style>
    #component {
        margin-top: 20px;
        display: flex;
    }
</style>