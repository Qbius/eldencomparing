<script>
	import {createEventDispatcher} from 'svelte';
    import {Input, ListGroup, ListGroupItem, Badge} from 'sveltestrap';
    import {fade, scale} from "svelte/transition";
	import {weapons} from './quickload.js';

    const dispatch = createEventDispatcher();

    const damage_types = ['physical', 'magic', 'fire', 'lightning', 'holy'];
    const status_types = ['scarlet rot', 'madness', 'sleep', 'bleed', 'poison', 'frost'];
    const weapon_entries = Object.entries(weapons).map(([name, weapon]) => {
        const {'basedmg': [firstdmg, ..._bdr], type, phystype, 'passive': {rot, madness, sleep, 'blood': [blood, ..._blr], 'poison': [poison, ..._pr], 'frost': [frost, ..._fr]}} = weapon.standard;
        return [name, {
            name: name.toLowerCase(),
            dmgtypes: firstdmg.map((val, i) => [val, i]).filter(([val, _i]) => val > 0).map(([_val, i]) => damage_types[i]),
            type,
            phystypes: phystype.map(v => v.toLowerCase()).filter(v => v !== 'standard'),
            status: [rot, madness, sleep, blood, poison, frost].map((val, i) => [val, i]).filter(([val, _i]) => val > 0).map(([_val, i]) => status_types[i]),
        }];
    });
    const weapon_types = Array.from(new Set(Object.values(weapons).map(infusions => Object.values(infusions).map(({type}) => type)).flat()));
    const keywords = [].concat(weapon_types, damage_types, status_types, [
        'slash',
        'strike',
        'slash',
    ]);

    let base_query = '';
    $: found_weapons = Array.from(new Set(base_query.toLowerCase().split('|').map(str => str.trim()).filter(query => query.length > 0).map(query => {
        const elements = query.split(' ');
        
        let nocolons = elements.filter(ele => !ele.includes(':')).join(' ');
        let queried_keywords = new Set();
        while (keywords.some(keyword => nocolons.includes(keyword))) {
            const startswith = keywords.find(keyword => nocolons.startsWith(keyword));
            if (startswith !== undefined) {
                nocolons = nocolons.slice(startswith.length).trim();
                queried_keywords.add(startswith);
            }

            const endswith = keywords.find(keyword => nocolons.endsWith(keyword));
            if (endswith !== undefined) {
                endswith = nocolons.slice(0, -endswith.length).trim();
                queried_keywords.add(endswith);
            }
        }
        queried_keywords = Array.from(queried_keywords);
        return weapon_entries.filter(([_, {name, dmgtypes, type, phystypes, status}]) => {
            return name.includes(nocolons) && queried_keywords.every(keyword => [dmgtypes, [type], phystypes, status].some(list => list.includes(keyword)));
        });
    }).flat())).sort();
    $: show_suggestions = found_weapons.length > 0;

    let active_index = 0;
    $: {
        if (base_query.length === 0) {
            active_index = 0;
        }
    }

    function add_active_weapon() {
        dispatch('add_weapon', found_weapons[active_index][0]);
        base_query = '';
    }

    function handle_key({key}) {
        const last_entry = found_weapons.length - 1;
        if (key === 'ArrowUp') {
            active_index = (active_index > 0) ? active_index - 1 : last_entry;
        }
        else if (key === 'ArrowDown') {
            active_index = (active_index < last_entry) ? active_index + 1 : 0;
        }
        else if (key === 'Escape') {
            base_query = '';
        }
        else if (key === 'Enter') {
            add_active_weapon()
        }

        if (key === 'ArrowUp' || key === 'ArrowDown') {
            document.getElementById('suggestionlist').scrollTo(0, active_index * document.getElementById('groupitem0').offsetHeight)
        }
    }

    const tagcolor = {
        'scarlet rot': '#684244',
        'bleed': '#8B2C2C',
        'madness': '#7A7A3C',
        'sleep': '#573C76',
        'poison': '#395816',
        'frost': '#5E8983',
        'magic': '#0066CC',
        'fire': '#FF3333',
        'lightning': '#FADE53',
        'holy': '#D4A952',
        'slash': '#898989',
        'strike': '#898989',
        'thrust': '#898989',
    };
</script>

<div id="container">
    <Input bind:value={base_query} type="search" name="search" placeholder="Name, Weapon Type, Damage Type..." on:keydown={handle_key}/>
    <div style="position: relative;" in:fade out:fade>
        <ListGroup id="suggestionlist" style="position: absolute; z-index: 100; width: 100%; overflow-y: scroll; max-height: 280px;">
            {#each found_weapons as [name, {dmgtypes, type, phystypes, status}], index}
            <ListGroupItem active={index === active_index} style="padding: 0px; margin: 0px; border: 0px;">
                <div id={`groupitem${index}`} on:mouseover={() => active_index = index} on:focus={() => active_index = index} class="suggestion" on:mousedown={add_active_weapon}>
                    {name}
                    <div class="suggestion-tags">
                        {#each [].concat(dmgtypes.filter(v => v !== 'physical'), phystypes, status, [type]) as tag}
                            {#if dmgtypes.includes(tag) || phystypes.includes(tag)}
                            <Badge style="color: black; background-color: {tagcolor[tag]}!important; margin-left: 4px;">{tag.toUpperCase()}</Badge>
                            {:else if status.includes(tag)}
                            <Badge style="color: white; background-color: {tagcolor[tag]}!important; margin-left: 4px;">{tag.toUpperCase()}</Badge>
                            {:else if tag === type}
                            <Badge color="info" style="color: black; background-color: #BFBFBF!important; margin-left: 4px;">{type}</Badge>
                            {/if}
                        {/each}
                    </div>
                </div>
            </ListGroupItem>
            {/each}
        </ListGroup>
    </div>
</div>

<style>
    #container {
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        user-select: none;
    }

    .suggestion {
        width: 100%;
        height: 100%;
        padding: 5px;
        font-size: 14px;
        height: 35px;

        display: flex;
        justify-content: space-between;
    }

    .suggestion-tags {
        justify-content: flex-end;
        align-items: center;
    }
</style>