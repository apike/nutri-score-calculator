<script lang="ts">
	import { computeFNSpoints, nutriScoreLetter, nutrientsFromFood } from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import { loadFoods, addNewFood, type Food } from '$lib/foodLoader';
	import { onMount } from 'svelte';
	import FoodDetail from '../components/FoodDetail.svelte';
	import AddFoodForm from '../components/AddFoodForm.svelte';

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

	// Track if we're in add food mode
	let addingFood = $state(false);

	// Function to add a new food to the list
	function addFood(newFood: Food) {
		addNewFood(newFood);
		foods = [newFood, ...foods];
		addingFood = false;
	}
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

		<!-- Add Food button -->
		<button
			class="btn btn-primary mb-4 w-full md:max-w-[200px]"
			onclick={() => {
				selectedFood = null;
				addingFood = true;
			}}
		>
			<span class="mr-1">+</span> Add New Food
		</button>

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
							class="cursor-pointer"
							onclick={() => {
								selectedFood = food;
								addingFood = false;
							}}
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

	<!-- Food detail or add food form -->
	{#if addingFood}
		<div
			class="bg-base-100 fixed inset-0 z-20 transition-all duration-300 md:static md:z-auto md:w-1/2 md:border-l"
		>
			<AddFoodForm onClose={() => (addingFood = false)} onSave={addFood} foodCount={foods.length} />
		</div>
	{:else}
		<FoodDetail {selectedFood} onClose={() => (selectedFood = null)} />
	{/if}
</div>
