<script lang="ts">
	import TabListButton from './TabListButton.svelte';

	export let selected: string;
	export let onSelect: (value: string) => void;
	export let tabs: Array<{ value: string; label: string }>;
</script>

<div role="tablist" class="tabs tabs-border">
	{#each tabs as tab}
		<TabListButton value={tab.value} {selected} {onSelect} label={tab.label} />
	{/each}
</div>
