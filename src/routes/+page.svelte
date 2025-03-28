<script lang="ts">
	import { computeFNSpoints, nutriScoreLetter, nutrientsFromFood } from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import { loadFoods, type Food } from '$lib/foodLoader';
	import { onMount } from 'svelte';
	import FoodDetail from '../components/FoodDetail.svelte';

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

	// Track selected food for detail view
	let selectedFood: (typeof foodScores)[number] | null = $state(null);
</script>

<!-- Main container - fixed viewport height with overflow hidden -->
<div class="flex h-screen flex-col overflow-hidden md:flex-row md:p-0">
	<!-- Table section - fills screen on mobile, half on desktop -->
	<div class="flex h-full w-full flex-col p-4 md:w-1/2 md:overflow-hidden">
		<!-- Header section -->
		<div class="mb-4">
			<h1 class="text-3xl font-bold">Nutri-Score Calculator</h1>
			<h2 class="mt-4 text-2xl font-semibold">Food Database</h2>
		</div>

		<!-- Table with overflow -->
		<div class="flex-1 overflow-auto">
			<table class="table-zebra table w-full">
				<thead class="bg-base-100 sticky top-0 z-10">
					<tr>
						<th class="whitespace-nowrap">Name</th>
						<th class="whitespace-nowrap">Note</th>
						<th class="whitespace-nowrap">Nutri-Score</th>
					</tr>
				</thead>
				<tbody>
					{#each foodScores as food}
						<tr
							class="hover:bg-base-200 cursor-pointer"
							on:click={() => (selectedFood = food)}
							class:active={selectedFood && food.name === selectedFood.name}
						>
							<td>
								{#if selectedFood && food.name === selectedFood.name}
									<span class="text-primary">►</span>
								{/if}
								{food.name}
							</td>
							<td class="max-w-xs">{food.allenNote}</td>
							<td class="font-bold">{food.nutriScore} ({food.fnsScore})</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Food detail component -->
	<FoodDetail {selectedFood} onClose={() => (selectedFood = null)} />
</div>
