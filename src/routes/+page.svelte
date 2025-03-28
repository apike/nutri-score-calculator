<script lang="ts">
	import {
		computeFNSpoints,
		nutriScoreLetter,
		nutrientsFromFood,
		nutriScoreColor,
		nutriScoreTextColor
	} from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import { loadFoods, addNewFood, getUserAddedFoodsCount, type Food } from '$lib/foodLoader';
	import { onMount } from 'svelte';
	import FoodDetail from '../components/FoodDetail.svelte';
	import AddFoodForm from '../components/AddFoodForm.svelte';

	let foods: Food[] = $state([]);
	onMount(async () => {
		foods = await loadFoods();
	});

	// Category filter state
	let selectedCategory: 'all' | 'cereal' | 'snack' = $state('all');

	// Calculate Nutri-Score for each food
	let foodScores = $derived(
		foods
			.map((food) => {
				const nutrients = nutrientsFromFood(food);
				const score = computeFNSpoints(nutrients);
				const scoreWithProtein = computeFNSpoints(nutrients, true);
				return {
					...food,
					nutriScore: nutriScoreLetter(score),
					fnsScore: score,
					fnsScoreWithProtein: scoreWithProtein
				};
			})
			.sort((a, b) => a.fnsScoreWithProtein - b.fnsScoreWithProtein)
	);

	// Filter foods based on selected category
	let filteredFoodScores = $derived(
		foodScores.filter((food) => {
			// Always show user-added foods
			if (food.category === 'user') return true;

			// Show all foods if 'all' is selected
			if (selectedCategory === 'all') return true;

			// Otherwise, filter by the selected category
			return food.category === selectedCategory;
		})
	);

	// Track selected food for detail view
	let selectedFood:
		| (Food & {
				nutriScore: string;
				fnsScore: number;
				fnsScoreWithProtein: number;
		  })
		| null = $state(null);

	// Track if we're in add food mode
	let addingFood = $state(false);

	// Function to add a new food to the list
	function addFood(newFood: Food) {
		addNewFood(newFood);
		foods = [newFood, ...foods];
		addingFood = false;

		// Calculate score for new food and select it
		const nutrients = nutrientsFromFood(newFood);
		const score = computeFNSpoints(nutrients);
		const scoreWithProtein = computeFNSpoints(nutrients, true);
		selectedFood = {
			...newFood,
			nutriScore: nutriScoreLetter(score),
			fnsScore: score,
			fnsScoreWithProtein: scoreWithProtein
		};
	}
</script>

<!-- Main container - fixed viewport height with overflow hidden -->
<div class="flex h-[100dvh] touch-none flex-col overflow-hidden md:flex-row md:p-0">
	<!-- Table section - fills screen on mobile, half on desktop -->
	<div class="flex h-full w-full flex-col p-4 md:w-1/2 md:overflow-hidden">
		<!-- Header section with no scrolling -->
		<div class="mb-4 select-none">
			<h1 class="text-3xl font-bold">Nutri-Score Calculator</h1>
		</div>

		<!-- Add Food button -->
		<button
			class="btn btn-primary mb-4 ml-auto w-full select-none md:max-w-[200px]"
			onclick={() => {
				selectedFood = null;
				addingFood = true;
			}}
		>
			<span class="mr-1">+</span> Add New Food
		</button>

		<!-- Category Filter Tabs -->
		<div class="tabs tabs-box mb-4">
			<input
				type="radio"
				name="category_tabs"
				class="tab"
				aria-label="All Foods"
				checked={selectedCategory === 'all'}
				onclick={() => (selectedCategory = 'all')}
			/>
			<input
				type="radio"
				name="category_tabs"
				class="tab"
				aria-label="Cereal"
				checked={selectedCategory === 'cereal'}
				onclick={() => (selectedCategory = 'cereal')}
			/>
			<input
				type="radio"
				name="category_tabs"
				class="tab"
				aria-label="Snack"
				checked={selectedCategory === 'snack'}
				onclick={() => (selectedCategory = 'snack')}
			/>
		</div>

		<!-- Table with overflow - only this area should scroll -->
		<div class="flex-1 overflow-auto overscroll-contain">
			<table class="table-zebra table w-full">
				<thead class="bg-base-100 sticky top-0 z-10">
					<tr>
						<th class="whitespace-nowrap">Name</th>
						<th class="whitespace-nowrap">Note</th>
						<th class="whitespace-nowrap">Nutri-Score</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredFoodScores as food}
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
							<td>
								<span
									class="rounded-md px-2 py-1 font-bold"
									style="background-color: {nutriScoreColor(
										food.nutriScore
									)}; color: {nutriScoreTextColor(food.nutriScore)}"
								>
									{food.nutriScore}
								</span>
								<span class="text-base-content">({food.fnsScoreWithProtein})</span>
							</td>
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
			<AddFoodForm
				onClose={() => (addingFood = false)}
				onSave={addFood}
				foodCount={getUserAddedFoodsCount()}
			/>
		</div>
	{:else}
		<FoodDetail {selectedFood} onClose={() => (selectedFood = null)} />
	{/if}
</div>
