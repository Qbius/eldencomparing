<script>
    import {Card, CardHeader, CardBody, CardTitle, CardText, CardFooter, Input, Button, Icon} from 'sveltestrap';
    import {weapons} from './quickload.js';
    import {attributes, damage_types, damage, recommended} from './er.js';
	import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();
    
    export let name;
    const infusions = weapons[name];
    const max_level = weapons[name]['standard']['scaling'].length;
    
    let selected_infusion = 'standard';
    let selected_level_str = `+${max_level - 1}`;
    let twohanding = false;

    $: twohanding = twohanding;
    $: selected_weapon = weapons[name][selected_infusion];
    $: selected_level = Number(selected_level_str.replace('+', ''));
    $: progression = recommended(selected_weapon, selected_level, twohanding);
    $: relevant_stats = Object.keys(Object.fromEntries(progression));
    $: base_stats = relevant_stats.reduce((obj, att) => Object.assign(obj, {[att]: 10}), {});
    $: prog_totals = progression.map((_, index) => Object.fromEntries(Object.entries(base_stats).concat(progression.slice(0, index))));

</script>

<Card class="mb-3">
    <CardHeader>
        <CardTitle>{name}</CardTitle>
    </CardHeader>
    <CardBody>
    <CardText>
        <div id="content">
            {#each prog_totals as progtotal}
            <div class="content-row">
                <div style="display: flex;">
                    {#each Object.entries(progtotal).sort(([att1, _val1], [att2, _val2]) => attributes.indexOf(att1) - attributes.indexOf(att2)) as [att, val]}
                    <div class="content-stats">
                        <span style="font-size: 14px;">{att}</span>
                        <span style="font-size: 18px;">{val}</span>
                    </div>
                    {/each}
                </div>
                <div style="display: flex;">
                    {#each Object.entries(damage(selected_weapon, selected_level, attributes.map(att => progtotal[att] ?? 10))).sort(([typ1, _val1], [typ2, _val2]) => damage_types.indexOf(typ1) - damage_types.indexOf(typ2)) as [typ, val]}
                    <div class="content-stats">
                        <span style="font-size: 14px;">{typ.slice(0, 4)}</span>
                        <span style="font-size: 18px;">{val}</span>
                    </div>
                    {/each}
                </div>
            </div>
            {/each}
        </div>
    </CardText>
    </CardBody>
    <CardFooter>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <Input type="checkbox" bind:checked={twohanding} label="2h"/>
            {#if Object.keys(infusions).length > 1}
            <Input style="font-size: 10px; margin-left: 10px; margin-right: 5px;" type="select" bind:value={selected_infusion}>
                {#each Object.keys(infusions) as infusion}
                <option>{infusion}</option>
                {/each}
            </Input>
            {/if}
            <Input style="font-size: 10px; margin-left: 5px; margin-right: 10px;" type="select" bind:value={selected_level_str}>
                {#each [...Array(max_level).keys()] as level}
                <option>+{level}</option>
                {/each}
            </Input>
            <Button color="danger" size="sm" on:click={() => dispatch('remove_weapon')}><b style="font-size: 10px; color: black;">X</b></Button>
        </div>
    </CardFooter>
</Card>

<style>
    #content {
        display: flex;
        flex-direction: column;
    }

    .content-row {
        display: flex;
        justify-content: space-between;
    }

    .content-stats {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 5px;
    }
</style>