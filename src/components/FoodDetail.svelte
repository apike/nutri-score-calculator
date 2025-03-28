<script lang="ts">
	import type { Food } from '$lib/foodLoader';
	import {
		nutrientsFromFood,
		nutriScoreColor,
		nutriScoreTextColor,
		calculateNutrientPoints
	} from '$lib/nutriscore-calc';
	import NutrientCard from './NutrientCard.svelte';

	export let selectedFood:
		| (Food & {
				nutriScore: string;
				fnsScore: number;
				fnsScoreWithProtein?: number;
		  })
		| null = null;

	export let onClose: () => void = () => {};

	// Add a callback prop for deleting a food
	export let onDelete: (food: Food) => void = () => {};

	// Toggle for display mode: true = normalized to 50g, false = original serving
	let showNormalized = true;

	// Calculate nutrients for the selected food for detail view
	$: selectedFoodNutrients = selectedFood ? nutrientsFromFood(selectedFood) : null;

	// Get component nutrient scores using the utility function
	$: nutrientPoints = selectedFoodNutrients ? calculateNutrientPoints(selectedFoodNutrients) : null;

	// Also calculate with protein always included
	$: nutrientPointsWithProtein = selectedFoodNutrients
		? calculateNutrientPoints(selectedFoodNutrients, true)
		: null;

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

	// Extract domain name from URL for display
	function extractDomain(url: string): string {
		// Handle URLs with or without protocol
		try {
			// Try to parse as full URL first
			if (url.startsWith('http')) {
				const domain = new URL(url).hostname;
				return domain.startsWith('www.') ? domain.substring(4) : domain;
			}

			// For URLs without protocol
			const parts = url.split('/');
			const domainPart = parts[0];
			return domainPart.startsWith('www.') ? domainPart.substring(4) : domainPart;
		} catch (e) {
			// If URL parsing fails, return the original
			return url;
		}
	}
</script>

<div
	class={`bg-base-100 overflow-auto p-6 transition-all duration-300 ${selectedFood ? 'fixed inset-0 z-20 md:static md:z-auto' : 'hidden md:block'} md:w-1/2 md:border-l`}
>
	{#if selectedFood}
		<!-- Mobile close button -->
		<button class="btn btn-circle btn-ghost absolute top-4 right-4 md:hidden" onclick={onClose}>
			✕
		</button>

		<div class="mt-8 md:mt-0">
			<h2 class="text-2xl font-bold">{selectedFood.name}</h2>

			<div class="mt-3">
				{#if selectedFood.allenNote}
					<p class="mt-2 italic">{selectedFood.allenNote}</p>
				{/if}
			</div>

			<!-- Nutri-Score Card -->
			<div class="card bg-base-200 mt-4 p-4 shadow-sm">
				<div>
					<h3 class="text-base font-semibold">Nutri-Score</h3>

					<div class="relative mt-3 pb-2">
						<!-- Nutri-score legend -->
						<div class="flex w-full" id="nutri-score-legend">
							{#each ['A', 'B', 'C', 'D', 'E'] as letter}
								<div
									class="text-s flex h-6 flex-1 items-center justify-center py-4 font-bold"
									style="background-color: {nutriScoreColor(letter)}; 
										   color: {nutriScoreTextColor(letter)}; 
										   {selectedFood?.nutriScore !== letter ? 'opacity: 0.6;' : ''}"
								>
									{letter}
								</div>
							{/each}
						</div>

						<!-- Big letter positioned over the legend -->
						{#if selectedFood}
							<div
								class="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center"
							>
								<div
									class="absolute -translate-y-1/2 transform"
									style="left: {['A', 'B', 'C', 'D', 'E'].indexOf(selectedFood.nutriScore) * 20 +
										10}%; transform: translateX(-50%) translateY(50%);"
								>
									<span
										class="rounded-xl px-3 py-1 text-5xl font-bold shadow-md"
										id="big-letter"
										style="background-color: {nutriScoreColor(selectedFood.nutriScore)}; 
											   color: {nutriScoreTextColor(selectedFood.nutriScore)}"
									>
										{selectedFood.nutriScore}
									</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="mt-2">
				<span class="text-sm opacity-70">Score: {selectedFood?.fnsScoreWithProtein} points</span>
			</div>

			<!-- Nutritional Information -->
			<div class="mt-6">
				<h3 class="border-b pb-1 text-lg font-semibold">Nutritional Information</h3>
				<div class="mt-3">
					<p class="text-base-content/70 text-sm">
						Values {showNormalized
							? `per 50g (normalized)`
							: `per ${selectedFood.servingG}g (original serving)`}
					</p>

					<div class="mt-3 grid grid-cols-2 gap-4">
						<!-- Calories -->
						<NutrientCard
							name="Calories"
							value={showNormalized
								? Math.round((selectedFood.calories * 50) / selectedFood.servingG)
								: selectedFood.calories}
							unit="kcal"
							points={nutrientPoints ? nutrientPoints.energy : null}
						/>

						<!-- Saturated Fat -->
						<NutrientCard
							name="Saturated Fat"
							value={showNormalized
								? (selectedFood.saturatedFatG * 50) / selectedFood.servingG
								: selectedFood.saturatedFatG}
							unit="g"
							points={nutrientPoints ? nutrientPoints.saturates : null}
						/>

						<!-- Total Sugar -->
						<NutrientCard
							name="Sugar"
							value={showNormalized
								? (selectedFood.totalSugarG * 50) / selectedFood.servingG
								: selectedFood.totalSugarG}
							unit="g"
							points={nutrientPoints ? nutrientPoints.sugars : null}
						/>

						<!-- Sodium -->
						<NutrientCard
							name="Sodium"
							value={showNormalized
								? Math.round((selectedFood.sodiumMg * 50) / selectedFood.servingG)
								: selectedFood.sodiumMg}
							unit="mg"
							points={nutrientPoints ? nutrientPoints.salt : null}
							decimals={0}
						/>

						<!-- Protein -->
						<NutrientCard
							name="Protein"
							value={showNormalized
								? (selectedFood.proteinG * 50) / selectedFood.servingG
								: selectedFood.proteinG}
							unit="g"
							points={nutrientPoints ? nutrientPoints.protein : null}
							proteinExcluded={nutrientPoints ? nutrientPoints.proteinExcluded : false}
						/>

						<!-- Fibre -->
						<NutrientCard
							name="Fibre"
							value={showNormalized
								? (selectedFood.fibreG * 50) / selectedFood.servingG
								: selectedFood.fibreG}
							unit="g"
							points={nutrientPoints ? nutrientPoints.fibre : null}
						/>

						<!-- Fruit/Veg Percentage -->
						<NutrientCard
							name="Fruit & Veg %"
							value={selectedFood.fruitVegPercent ?? 0}
							unit="%"
							points={nutrientPoints ? nutrientPoints.fruitVeg : null}
							decimals={0}
						/>
					</div>
				</div>
			</div>

			<!-- Bottom section with toggle on left and source link on right -->
			<div class="mt-6 flex items-center justify-between">
				<!-- Toggle switch for display mode -->
				<div class="form-control">
					<label class="label cursor-pointer gap-2">
						<span class="label-text text-sm">Show per:</span>
						<div class="flex items-center gap-1">
							<span class="text-xs">{selectedFood.servingG}g</span>
							<input
								type="checkbox"
								class="toggle toggle-primary toggle-sm"
								bind:checked={showNormalized}
							/>
							<span class="text-xs">50g</span>
						</div>
					</label>
				</div>

				<!-- Source link -->
				<div class="flex">
					<span class="text-sm opacity-70">Source:&nbsp;</span>
					{#if selectedFood.category === 'user' && (!selectedFood.source || selectedFood.source.trim() === '')}
						<span class="text-primary text-sm">You</span>
					{:else}
						<a
							href={selectedFood.source.startsWith('http')
								? selectedFood.source
								: `https://${selectedFood.source}`}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary text-sm hover:underline"
						>
							{extractDomain(selectedFood.source)}
						</a>
					{/if}
				</div>
			</div>

			<!-- Delete button for user-added foods -->
			{#if selectedFood.category === 'user'}
				<div class="mt-6 flex justify-center pt-2">
					<button
						class="btn btn-outline hover:bg-error hover:text-error-content hover:border-error transition-colors"
						onclick={() => onDelete(selectedFood)}
					>
						Delete Food
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex h-full items-center justify-center">
			<p class="text-base-content/70 text-center text-lg">Select a food to view details</p>
		</div>
	{/if}
</div>
