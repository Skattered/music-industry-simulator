<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content="Music Industry Simulator - An incremental game about AI-generated music and industry domination" />
	<title>Music Industry Simulator</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
