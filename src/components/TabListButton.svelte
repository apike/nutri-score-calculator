<script lang="ts">
	export let value: string;
	export let selected: string;
	export let onSelect: (value: string) => void;
	export let label: string;
</script>

<button
	type="button"
	role="tab"
	tabindex="0"
	class="tab {selected === value ? 'tab-active' : ''}"
	onclick={() => onSelect(value)}
	onkeydown={(e) => e.key === 'Enter' && onSelect(value)}
	aria-selected={selected === value}
>
	{label}
</button>
