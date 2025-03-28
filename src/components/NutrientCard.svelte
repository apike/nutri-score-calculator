<script lang="ts">
	// Props for the component
	export let name: string;
	export let value: number | string;
	export let unit: string;
	export let points: number | null = null;
	export let decimals: number = 1;

	// Helper function to determine badge style based on point value
	function getBadgeStyle(points: number): { color: string; prefix: string } {
		if (points < -1) {
			return { color: 'badge-error', prefix: '' };
		} else if (points > 1) {
			return { color: 'badge-success', prefix: '+' };
		} else {
			return { color: 'badge-neutral', prefix: '' };
		}
	}

	// Format the value based on whether it's an integer or decimal
	$: formattedValue =
		typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(decimals)) : value;
</script>

<div class="card bg-base-200 p-3">
	<h4 class="font-medium">{name}</h4>
	<div class="flex items-baseline justify-between">
		<div class="flex items-baseline">
			<span class="text-xl font-bold">{formattedValue}</span>
			<span class="ml-1 text-xs">{unit}</span>
		</div>
		{#if points !== null}
			{@const style = getBadgeStyle(points)}
			<span class={`badge ${style.color}`}>{style.prefix}{points} pts</span>
		{/if}
	</div>
</div>
