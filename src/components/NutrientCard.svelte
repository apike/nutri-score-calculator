<script lang="ts">
	import { nutriScoreColor } from '$lib/nutriscore-calc';

	// Props for the component
	export let name: string;
	export let value: number | string;
	export let unit: string;
	export let points: number | null = null;
	export let decimals: number = 1;

	// Helper function to determine badge style based on point value
	function getBadgeStyle(points: number): { backgroundColor: string; prefix: string } {
		// Set prefix based on positive/negative
		const prefix = points > 0 ? '+' : '';

		// Get base color from nutriscore-calc
		let baseColor: string;

		if (points <= -4) {
			baseColor = nutriScoreColor('A'); // Dark green
		} else if (points <= -2) {
			baseColor = nutriScoreColor('B'); // Light green
		} else if (points < 2) {
			baseColor = nutriScoreColor(''); // Default gray
		} else if (points < 4) {
			baseColor = nutriScoreColor('C'); // Yellow
		} else if (points < 8) {
			baseColor = nutriScoreColor('D'); // Orange
		} else {
			baseColor = nutriScoreColor('E'); // Red
		}

		// Create a lightened color using OKLCH color space
		// This mixes the base color with white to increase lightness
		const backgroundColor = `color-mix(in oklch, ${baseColor}, white 40%)`;

		return { backgroundColor, prefix };
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
			<span class="badge text-black" style="background-color: {style.backgroundColor}"
				>{style.prefix}{points} pts</span
			>
		{/if}
	</div>
</div>
