<script>
	import {weapons} from './quickload.js';

	import Searchbar from './Searchbar.svelte';

	function random(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	const weapon_name = random(Object.keys(weapons));
	const weapon = weapons[weapon_name]
	const infusion_name = random(Object.keys(weapon));
	const infusion = weapon[infusion_name];
	const level = Math.floor(Math.random(1) * infusion.scaling.length);

	const description = `${infusion_name} ${weapon_name} +${level}`;
</script>

<main>
	<div id="bg-wrap"/>
	<Searchbar/>
</main>

<style>
	main {
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
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
		main {
			max-width: none;
		}
	}
</style>