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

	// Track selected food for detail view
	let selectedFood: (typeof foodScores)[number] | null = $state(null);

	// Calculate nutrients for the selected food for detail view
	let selectedFoodNutrients = $derived(selectedFood ? nutrientsFromFood(selectedFood) : null);
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
							class:bg-base-300={selectedFood && food.name === selectedFood.name}
						>
							<td>{food.name}</td>
							<td class="max-w-xs">{food.allenNote}</td>
							<td class="font-bold">{food.nutriScore} ({food.fnsScore})</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Detail view - overlay on mobile, side-by-side on desktop -->
	<div
		class={`bg-base-100 p-6 transition-all duration-300 ${selectedFood ? 'fixed inset-0 z-20 md:static md:z-auto' : 'hidden md:block'} md:w-1/2 md:border-l`}
	>
		{#if selectedFood}
			<!-- Mobile close button -->
			<button
				class="btn btn-circle btn-ghost absolute top-4 right-4 md:hidden"
				on:click={() => (selectedFood = null)}
			>
				✕
			</button>

			<div class="mt-8 md:mt-0">
				<h2 class="text-2xl font-bold">{selectedFood.name}</h2>

				<!-- Source and Notes -->
				<div class="mt-3">
					<p class="text-sm opacity-70">Source: {selectedFood.source}</p>
					{#if selectedFood.allenNote}
						<p class="mt-2 italic">{selectedFood.allenNote}</p>
					{/if}
				</div>

				<!-- Nutri-Score Card -->
				<div class="card bg-base-200 mt-4 p-4 shadow-sm">
					<div class="flex items-center">
						<div class="mr-4 flex-none">
							<h3 class="text-base font-semibold">Nutri-Score</h3>
							<div class="mt-1 flex items-baseline">
								<span class="text-4xl font-bold">{selectedFood.nutriScore}</span>
								<span class="ml-2 text-sm opacity-70">({selectedFood.fnsScore} points)</span>
							</div>
						</div>

						<div class="flex-1">
							<div class="flex w-full">
								{#each ['A', 'B', 'C', 'D', 'E'] as letter}
									<div
										class={`flex h-6 flex-1 items-center justify-center text-xs font-bold ${selectedFood.nutriScore === letter ? 'bg-primary text-primary-content' : 'bg-base-300'}`}
									>
										{letter}
									</div>
								{/each}
							</div>
							<p class="mt-1 text-xs opacity-70">Better ← → Worse</p>
						</div>
					</div>
				</div>

				<!-- Nutritional Information -->
				<div class="mt-6">
					<h3 class="border-b pb-1 text-lg font-semibold">Nutritional Information</h3>
					<div class="mt-3">
						<p class="text-base-content/70 text-sm">
							Values per 50g (original {selectedFood.servingG}g serving in parentheses)
						</p>

						<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<!-- Calories -->
							<div class="card bg-base-200 p-3">
								<h4 class="font-medium">Calories</h4>
								<div class="flex items-baseline">
									<span class="text-xl font-bold"
										>{Math.round((selectedFood.calories * 50) / selectedFood.servingG)}</span
									>
									<span class="ml-1 text-xs">kcal</span>
									<span class="ml-2 text-xs opacity-70"
										>({selectedFood.calories} in {selectedFood.servingG}g)</span
									>
								</div>
							</div>

							<!-- Saturated Fat -->
							<div class="card bg-base-200 p-3">
								<h4 class="font-medium">Saturated Fat</h4>
								<div class="flex items-baseline">
									<span class="text-xl font-bold"
										>{((selectedFood.saturatedFatG * 50) / selectedFood.servingG).toFixed(1)}</span
									>
									<span class="ml-1 text-xs">g</span>
									<span class="ml-2 text-xs opacity-70"
										>({selectedFood.saturatedFatG.toFixed(1)}g in {selectedFood.servingG}g)</span
									>
								</div>
							</div>

							<!-- Total Sugar -->
							<div class="card bg-base-200 p-3">
								<h4 class="font-medium">Sugar</h4>
								<div class="flex items-baseline">
									<span class="text-xl font-bold"
										>{((selectedFood.totalSugarG * 50) / selectedFood.servingG).toFixed(1)}</span
									>
									<span class="ml-1 text-xs">g</span>
									<span class="ml-2 text-xs opacity-70"
										>({selectedFood.totalSugarG.toFixed(1)}g in {selectedFood.servingG}g)</span
									>
								</div>
							</div>

							<!-- Sodium -->
							<div class="card bg-base-200 p-3">
								<h4 class="font-medium">Sodium</h4>
								<div class="flex items-baseline">
									<span class="text-xl font-bold"
										>{Math.round((selectedFood.sodiumMg * 50) / selectedFood.servingG)}</span
									>
									<span class="ml-1 text-xs">mg</span>
									<span class="ml-2 text-xs opacity-70"
										>({selectedFood.sodiumMg}mg in {selectedFood.servingG}g)</span
									>
								</div>
							</div>

							<!-- Protein -->
							<div class="card bg-base-200 p-3">
								<h4 class="font-medium">Protein</h4>
								<div class="flex items-baseline">
									<span class="text-xl font-bold"
										>{((selectedFood.proteinG * 50) / selectedFood.servingG).toFixed(1)}</span
									>
									<span class="ml-1 text-xs">g</span>
									<span class="ml-2 text-xs opacity-70"
										>({selectedFood.proteinG.toFixed(1)}g in {selectedFood.servingG}g)</span
									>
								</div>
							</div>

							<!-- Fibre -->
							<div class="card bg-base-200 p-3">
								<h4 class="font-medium">Fibre</h4>
								<div class="flex items-baseline">
									<span class="text-xl font-bold"
										>{((selectedFood.fibreG * 50) / selectedFood.servingG).toFixed(1)}</span
									>
									<span class="ml-1 text-xs">g</span>
									<span class="ml-2 text-xs opacity-70"
										>({selectedFood.fibreG.toFixed(1)}g in {selectedFood.servingG}g)</span
									>
								</div>
							</div>

							{#if selectedFood.fruitVegPercent !== undefined}
								<!-- Fruit/Veg Percentage -->
								<div class="card bg-base-200 p-3">
									<h4 class="font-medium">Fruit/Veg Content</h4>
									<div class="flex items-baseline">
										<span class="text-xl font-bold">{selectedFood.fruitVegPercent}%</span>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex h-full items-center justify-center">
				<p class="text-base-content/70 text-center text-lg">Select a food to view details</p>
			</div>
		{/if}
	</div>
</div>
