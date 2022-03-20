<script>
	import Searchbar from './Searchbar.svelte';
	import Showcase from './Showcase.svelte';

	let selected_weapons = [];
</script>

<main>
	<div id="bg-wrap"/>
	<div id="content">
		<Searchbar 
			on:add_weapon={({detail}) => {
				selected_weapons.push(detail);
				selected_weapons = selected_weapons;
			}}
		/>
		<Showcase bind:selected_weapons={selected_weapons}
			on:remove_weapon={({detail}) => {
				selected_weapons.splice(selected_weapons.indexOf(detail), 1);
				selected_weapons = selected_weapons;
			}}
		/>
	</div>
</main>

<style>
	main {
		width: 100%;
		height: 100%;

	}
	
	#content {
		padding-top: 25px;
		width: 100%;
		height: 100%;

		display: flex;
		align-items: center;
		flex-direction: column;
		position: relative;
	}

	#bg-wrap {
		position: absolute;
		z-index: -100;
		filter: blur(2px);
		overflow: hidden;
		object-fit: cover;
		opacity: 0.8;
		width: 100%;
		height: 100%;
		background-image: url('/bg.jpg');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: 50% 50%;
	}

	@media (min-width: 640px) {
	}
</style>