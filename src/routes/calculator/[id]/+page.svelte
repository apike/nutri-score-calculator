<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// On mount, redirect to main calculator page
	// The main page will handle showing the correct food based on the URL
	onMount(() => {
		if (browser) {
			// Preserve the current URL path but use navigate instead of redirect
			goto(window.location.pathname, { replaceState: true });
		}
	});
</script>

<div class="flex h-full w-full items-center justify-center">
	<span class="loading loading-spinner loading-lg"></span>
</div>
