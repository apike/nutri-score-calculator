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
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let foods: Food[] = $state([]);
	// Track hash not found error state
	let hashNotFound = $state(false);
	let invalidHash = $state('');

	// Search state
	let isSearchMode = $state(false);
	let searchQuery = $state('');

	onMount(async () => {
		foods = await loadFoods();

		// Check for hash in URL on initial load
		if (browser && window.location.hash) {
			const foodId = window.location.hash.substring(1);
			selectFoodFromHash(foodId);
		}

		// Listen for hash changes
		if (browser) {
			window.addEventListener('hashchange', () => {
				const foodId = window.location.hash.substring(1);

				if (foodId === 'addfood') {
					// Show add food form
					selectedFood = null;
					addingFood = true;
					hashNotFound = false;
					invalidHash = '';
				} else if (foodId) {
					selectFoodFromHash(foodId);
				} else {
					// Reset view when hash is empty (back button pressed)
					hashNotFound = false;
					invalidHash = '';
					selectedFood = null;
					addingFood = false;
				}
			});
		}
	});

	// Function to select food from hash
	function selectFoodFromHash(foodId: string) {
		if (!foods.length) {
			return;
		}

		const food = foods.find((f) => {
			const hash = createFoodHash(f);
			return hash === foodId;
		});

		if (food) {
			// Clear error state
			hashNotFound = false;
			invalidHash = '';
			selectFoodAndUpdateHash(food, false); // Don't update hash again
		} else {
			// Set error state
			hashNotFound = true;
			invalidHash = foodId;
			selectedFood = null;
			addingFood = false;
		}
	}

	// Create a unique hash for a food item
	function createFoodHash(food: Food): string {
		// Create a URL-friendly hash from the food name
		return food.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
	}

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

	// Filter foods based on selected category and search query
	let filteredFoodScores = $derived(
		foodScores.filter((food) => {
			// Filter by search query if in search mode
			if (isSearchMode && searchQuery.trim() !== '') {
				return food.name.toLowerCase().includes(searchQuery.toLowerCase());
			}

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
		// Add food to storage
		addNewFood(newFood);

		// Update the foods array with the new food
		foods = [newFood, ...foods];

		// Clear search filters
		isSearchMode = false;
		searchQuery = '';

		// Exit add food mode and clear hash first
		addingFood = false;
		if (browser) {
			// Remove the 'addfood' hash first
			window.location.hash = '';
		}

		// Wait a tick for the hash clear to register
		setTimeout(() => {
			// Use the existing function to select the food and update hash
			selectFoodAndUpdateHash(newFood, true);
		}, 0);
	}

	// Function to remove a user food
	function handleRemoveFood(food: Food) {
		if (food.category === 'user' && confirm(`Are you sure you want to delete "${food.name}"?`)) {
			removeUserFood(food.name);
			foods = foods.filter((f) => f.name !== food.name);

			if (selectedFood && selectedFood.name === food.name) {
				selectedFood = null;
				// Clear hash when removing the currently selected food
				if (browser) {
					window.location.hash = '';
				}
			}
		}
	}

	// Function to handle food selection with URL hash update
	function selectFood(
		food: Food & { nutriScore: string; fnsScore: number; fnsScoreWithProtein: number }
	) {
		// Clear error state
		hashNotFound = false;
		invalidHash = '';
		selectedFood = food;
		addingFood = false;

		// Update URL hash
		if (browser) {
			window.location.hash = createFoodHash(food);
		}
	}

	// Shared function to compute scores, select food and optionally update hash
	function selectFoodAndUpdateHash(food: Food, updateHash = true) {
		const nutrients = nutrientsFromFood(food);
		const score = computeFNSpoints(nutrients);
		const scoreWithProtein = computeFNSpoints(nutrients, true);

		selectedFood = {
			...food,
			nutriScore: nutriScoreLetter(score),
			fnsScore: score,
			fnsScoreWithProtein: scoreWithProtein
		};

		addingFood = false;

		// Update URL hash if needed
		if (updateHash && browser) {
			const hash = createFoodHash(food);
			window.location.hash = hash;
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
			<!-- Category Filter Tabs or Search Input -->
			{#if isSearchMode}
				<div class="mr-2 flex flex-1 items-center">
					<input
						type="text"
						class="input input-bordered mr-2 flex-1"
						placeholder="Search foods..."
						bind:value={searchQuery}
						autofocus
					/>
					<button
						class="btn btn-square btn-ghost"
						onclick={() => {
							isSearchMode = false;
							searchQuery = '';
						}}
					>
						<span class="text-lg font-bold">&times;</span>
					</button>
				</div>
			{:else}
				<div class="flex items-center">
					<TabList
						selected={selectedCategory}
						onSelect={handleCategorySelect}
						tabs={categoryTabs}
					/>
					<button
						class="btn btn-ghost btn-square ml-2"
						onclick={() => {
							isSearchMode = true;
						}}
					>
						<span class="text-lg font-bold">🔍</span>
					</button>
				</div>
			{/if}

			<!-- Add Food button -->
			<button
				class="btn btn-primary select-none md:max-w-[200px]"
				onclick={() => {
					selectedFood = null;
					addingFood = true;
					hashNotFound = false;
					invalidHash = '';
					// Clear search filter
					isSearchMode = false;
					searchQuery = '';
					// Set hash to addfood
					if (browser) {
						window.location.hash = 'addfood';
					}
				}}
			>
				<span class="mr-1">+</span> Add
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
						<tr class="cursor-pointer" onclick={() => selectFood(food)}>
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
		selectedFood ||
		hashNotFound
			? 'fixed inset-0 z-20 md:static md:z-auto'
			: 'hidden md:block'}"
	>
		{#if addingFood}
			<!-- Adding Food -->
			<AddFoodForm
				onClose={() => {
					addingFood = false;
					// Clear hash when closing the add form
					if (browser) {
						window.location.hash = '';
					}
				}}
				onSave={addFood}
				foodCount={getUserAddedFoodsCount()}
			/>
		{:else if hashNotFound}
			<!-- Food not found error -->
			<div class="flex h-full flex-col items-center justify-center p-6">
				<div class="text-center">
					<h2 class="text-error mb-2 text-2xl font-bold">Food Not Found</h2>
					<p class="m-6">
						Could not find a food with this ID. Note that custom-added foods are saved in the
						browser of the person who added them.
					</p>
					<button
						class="btn btn-primary"
						onclick={() => {
							hashNotFound = false;
							invalidHash = '';
							if (browser) {
								window.location.hash = '';
							}
						}}
					>
						Back to Food List
					</button>
				</div>
			</div>
		{:else}
			<!-- Food detail -->
			<FoodDetail
				{selectedFood}
				onClose={() => {
					selectedFood = null;
					// Clear hash when closing food detail
					if (browser) {
						window.location.hash = '';
					}
				}}
				onDelete={handleRemoveFood}
			/>
		{/if}
	</div>
</div>
