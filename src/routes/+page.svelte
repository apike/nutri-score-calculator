<script lang="ts">
	import { computeFNSpoints, nutriScoreLetter, nutrientsFromFood } from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import { loadFoods, type Food } from '$lib/foodLoader';
	import { onMount } from 'svelte';

	let foods: Food[] = $state([]);
	onMount(async () => {
		foods = await loadFoods();
	});

	// Calculate Nutri-Score for each food
	let foodScores = $derived(
		foods.map((food) => {
			const nutrients = nutrientsFromFood(food);
			const score = computeFNSpoints(nutrients);
			return {
				...food,
				nutriScore: nutriScoreLetter(score),
				fnsScore: score
			};
		})
	);
</script>

<h1 class="text-3xl font-bold">Nutri-Score Calculator</h1>

<div class="mt-8">
	<h2 class="mb-4 text-2xl font-semibold">Food Database</h2>
	<div class="relative max-h-[600px] overflow-x-auto">
		<table class="table-zebra table w-full">
			<thead class="bg-base-100 sticky top-0 z-10">
				<tr>
					<th class="whitespace-nowrap">Name</th>
					<th class="whitespace-nowrap">Note</th>
					<th class="whitespace-nowrap">Serving (g)</th>
					<th class="whitespace-nowrap">Calories</th>
					<th class="whitespace-nowrap">Saturated Fat (g)</th>
					<th class="whitespace-nowrap">Sodium (mg)</th>
					<th class="whitespace-nowrap">Fibre (g)</th>
					<th class="whitespace-nowrap">Sugar (g)</th>
					<th class="whitespace-nowrap">Protein (g)</th>
					<th class="whitespace-nowrap">Nutri-Score</th>
				</tr>
			</thead>
			<tbody>
				{#each foodScores as food}
					<tr>
						<td>{food.name}</td>
						<td class="max-w-xs">{food.allenNote}</td>
						<td>{food.servingG}</td>
						<td>{food.calories}</td>
						<td>{food.saturatedFatG}</td>
						<td>{food.sodiumMg}</td>
						<td>{food.fibreG}</td>
						<td>{food.totalSugarG}</td>
						<td>{food.proteinG}</td>
						<td class="font-bold">{food.nutriScore} ({food.fnsScore})</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
