<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
	const { metadata } = $page.data;
</script>

<svelte:head>
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={metadata.url} />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:image" content={metadata.image} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={metadata.url} />
	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />
	<meta name="twitter:image" content={metadata.image} />

	<!-- Fathom - beautiful, simple website analytics -->
	<script
		src="https://cdn.usefathom.com/script.js"
		data-spa="auto"
		data-site="NPCSCSZG"
		defer
	></script>
	<!-- / Fathom -->
</svelte:head>

{@render children()}
