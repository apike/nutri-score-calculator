<script lang="ts">
	import { computeFNSpoints, nutriScoreLetter, nutrientsFromFood } from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import { convertToNutrientsPer100g } from '$lib/canadian-nutrition';
	import type { ServingNutrients } from '$lib/canadian-nutrition';
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

	let servingData: ServingNutrients = $state({
		servingSize: {
			amount: 30,
			unit: 'g'
		},
		calories: 150,
		saturatedFat: 3,
		totalSugars: 6,
		sodium: 240,
		protein: 4,
		dietaryFiber: 2,
		fruitVegPercent: 0
	});

	let convertedData = $derived(convertToNutrientsPer100g(servingData));
	let convertedScore = $derived(computeFNSpoints(convertedData));
	let convertedNutriScore = $derived(nutriScoreLetter(convertedScore));
</script>

<h1 class="text-3xl font-bold">Nutri-Score Calculator</h1>

<div class="mt-8">
	<h2 class="mb-4 text-2xl font-semibold">Food Database</h2>
	<div class="overflow-x-auto">
		<table class="table-zebra table w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>Note</th>
					<th>Serving (g)</th>
					<th>Calories</th>
					<th>Saturated Fat (g)</th>
					<th>Sodium (mg)</th>
					<th>Fibre (g)</th>
					<th>Sugar (g)</th>
					<th>Protein (g)</th>
					<th>Nutri-Score</th>
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

<div class="mt-8">
	<h2 class="mb-4 text-2xl font-semibold">Nutrition Label Input</h2>
	<div class="bg-base-200 rounded-lg p-4">
		<p>Serving Size: {servingData.servingSize.amount}{servingData.servingSize.unit}</p>
		<p>Calories: {servingData.calories}</p>
		<p>Saturated Fat: {servingData.saturatedFat}g</p>
		<p>Sugars: {servingData.totalSugars}g</p>
		<p>Sodium: {servingData.sodium}mg</p>
		<p>Protein: {servingData.protein}g</p>
		<p>Dietary Fiber: {servingData.dietaryFiber}g</p>
		{#if servingData.fruitVegPercent !== undefined}
			<p>Fruit/Veg: {servingData.fruitVegPercent}%</p>
		{/if}
	</div>
	<div class="mt-4">
		<h3 class="mb-2 text-xl font-semibold">Converted to 100g:</h3>
		<div class="bg-base-300 rounded-lg p-4">
			<p>Energy: {convertedData.energyKJ.toFixed(1)} kJ</p>
			<p>Saturates: {convertedData.saturatesG.toFixed(1)}g</p>
			<p>Sugars: {convertedData.sugarsG.toFixed(1)}g</p>
			<p>Salt: {convertedData.saltG.toFixed(1)}g</p>
			<p>Protein: {convertedData.proteinG.toFixed(1)}g</p>
			<p>Fibre: {convertedData.fibreG.toFixed(1)}g</p>
		</div>
		<div class="mt-4">
			<p class="text-xl">Numeric Score: {convertedScore}</p>
			<p class="text-2xl font-bold">Nutri-Score: {convertedNutriScore}</p>
		</div>
	</div>
</div>
