<script lang="ts">
	import type { Food } from '$lib/foodLoader';
	import { nutrientsFromFood, nutriScoreColor, nutriScoreTextColor } from '$lib/nutriscore-calc';

	export let selectedFood:
		| (Food & {
				nutriScore: string;
				fnsScore: number;
		  })
		| null = null;

	export let onClose: () => void = () => {};

	// Calculate nutrients for the selected food for detail view
	$: selectedFoodNutrients = selectedFood ? nutrientsFromFood(selectedFood) : null;

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
	class={`bg-base-100 p-6 transition-all duration-300 ${selectedFood ? 'fixed inset-0 z-20 md:static md:z-auto' : 'hidden md:block'} md:w-1/2 md:border-l`}
>
	{#if selectedFood}
		<!-- Mobile close button -->
		<button class="btn btn-circle btn-ghost absolute top-4 right-4 md:hidden" on:click={onClose}>
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
				<div class="flex items-center">
					<div class="mr-4 flex-none">
						<h3 class="text-base font-semibold">Nutri-Score</h3>
						<div class="mt-1 flex items-baseline">
							<span
								class="rounded px-2 text-4xl font-bold"
								style="background-color: {selectedFood
									? nutriScoreColor(selectedFood.nutriScore)
									: '#777777'}; 
									   color: {selectedFood ? nutriScoreTextColor(selectedFood.nutriScore) : '#ffffff'}"
							>
								{selectedFood?.nutriScore || '?'}
							</span>
							<span class="ml-2 text-sm opacity-70">({selectedFood?.fnsScore} points)</span>
						</div>
					</div>

					<div class="flex-1">
						<div class="flex w-full">
							{#each ['A', 'B', 'C', 'D', 'E'] as letter}
								<div
									class="flex h-6 flex-1 items-center justify-center text-xs font-bold"
									style="background-color: {nutriScoreColor(letter)}; 
										   color: {nutriScoreTextColor(letter)}; 
										   {selectedFood?.nutriScore !== letter ? 'opacity: 0.6;' : ''}"
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

						<!-- Fruit/Veg Percentage -->
						<div class="card bg-base-200 p-3">
							<h4 class="font-medium">Fruit & Veg %</h4>
							<div class="flex items-baseline">
								<span class="text-xl font-bold">{selectedFood.fruitVegPercent ?? 0}%</span>
								{#if selectedFood.fruitVegPercent}
									<span class="ml-2 text-xs opacity-70">(counts toward favorable score)</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Source link - positioned at bottom right -->
			<div class="mt-6 flex justify-end">
				<span class="text-sm opacity-70">Source: </span>
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
			</div>
		</div>
	{:else}
		<div class="flex h-full items-center justify-center">
			<p class="text-base-content/70 text-center text-lg">Select a food to view details</p>
		</div>
	{/if}
</div>
