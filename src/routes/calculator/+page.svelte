<script lang="ts">
	import {
		computeFNSpoints,
		nutriScoreLetter,
		nutrientsFromFood,
		nutriScoreColor,
		nutriScoreTextColor
	} from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import {
		loadFoods,
		addNewFood,
		getUserAddedFoodsCount,
		removeUserFood,
		type Food
	} from '$lib/foodLoader';
	import { onMount } from 'svelte';
	import FoodDetail from '../../components/FoodDetail.svelte';
	import AddFoodForm from '../../components/AddFoodForm.svelte';
	import TabList from '../../components/TabList.svelte';

	let foods: Food[] = $state([]);
	onMount(async () => {
		foods = await loadFoods();
	});

	// Category filter state
	let selectedCategory: 'all' | 'cereal' | 'snack' = $state('all');

	// Define tabs for the TabList component
	const categoryTabs = [
		{ value: 'all', label: 'All Foods' },
		{ value: 'cereal', label: 'Cereals' },
		{ value: 'snack', label: 'Snacks' }
	];

	// Category selection handler
	function handleCategorySelect(value: string) {
		selectedCategory = value as 'all' | 'cereal' | 'snack';
	}

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
			.sort((a, b) => {
				// First sort by Nutri-Score letter (A to E)
				if (a.nutriScore !== b.nutriScore) {
					return a.nutriScore.localeCompare(b.nutriScore);
				}
				// Then sort by fnsScoreWithProtein from low to high within each letter category
				return a.fnsScoreWithProtein - b.fnsScoreWithProtein;
			})
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

	// Function to remove a user food
	function handleRemoveFood(food: Food) {
		if (food.category === 'user' && confirm(`Are you sure you want to delete "${food.name}"?`)) {
			removeUserFood(food.name);
			foods = foods.filter((f) => f.name !== food.name);

			if (selectedFood && selectedFood.name === food.name) {
				selectedFood = null;
			}
		}
	}
</script>

<!-- Main container - fixed viewport height with overflow hidden -->
<div class="bg-haze flex h-[100dvh] touch-none flex-col overflow-hidden p-4 md:flex-row md:p-6">
	<!-- Table section - fills screen on mobile, half on desktop -->
	<div class="mr-4 flex h-full w-full flex-col md:w-1/2 md:overflow-hidden">
		<!-- Header section with no scrolling -->
		<div class="mb-4 flex items-center justify-between select-none">
			<h1 class="text-2xl font-bold">Nutri-Score Calculator</h1>
			<a href="/" class="text-primary hover:underline">About</a>
		</div>

		<!-- Flex container for tabs and Add Food button -->
		<div class="mb-4 flex items-center justify-between">
			<!-- Category Filter Tabs -->
			<TabList selected={selectedCategory} onSelect={handleCategorySelect} tabs={categoryTabs} />

			<!-- Add Food button -->
			<button
				class="btn btn-primary select-none md:max-w-[200px]"
				onclick={() => {
					selectedFood = null;
					addingFood = true;
				}}
			>
				<span class="mr-1">+</span> Add Food
			</button>
		</div>

		<!-- Table with overflow - only this area should scroll -->
		<div class="flex-1 overflow-auto overscroll-contain rounded-xl bg-white/90">
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
	<div
		class="bg-base-100 overflow-auto rounded-xl transition-all duration-300 md:w-1/2 {addingFood ||
		selectedFood
			? 'fixed inset-0 z-20 md:static md:z-auto'
			: 'hidden md:block'}"
	>
		{#if addingFood}
			<!-- Adding Food -->
			<AddFoodForm
				onClose={() => (addingFood = false)}
				onSave={addFood}
				foodCount={getUserAddedFoodsCount()}
			/>
		{:else}
			<!-- Food detail -->
			<FoodDetail
				{selectedFood}
				onClose={() => (selectedFood = null)}
				onDelete={handleRemoveFood}
			/>
		{/if}
	</div>
</div>
