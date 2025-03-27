<script lang="ts">
	import { computeFNSpoints, nutriScoreLetter } from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';
	import { convertToNutrientsPer100g } from '$lib/canadian-nutrition';
	import type { ServingNutrients } from '$lib/canadian-nutrition';
	import { onMount } from 'svelte';

	interface Food {
		name: string;
		allenNote: string;
		servingG: number;
		calories: number;
		fatG: number;
		sodiumMg: number;
		fibreG: number;
		totalSugarG: number;
		proteinG: number;
		source: string;
	}

	let foods: Food[] = $state([]);

	onMount(async () => {
		try {
			const response = await fetch('/cereals.csv');
			if (!response.ok) {
				console.error('Failed to fetch CSV:', response.status, response.statusText);
				return;
			}
			const text = await response.text();
			console.log('Raw CSV data:', text.substring(0, 200) + '...'); // Log first 200 chars

			// Skip header row and parse each line
			const lines = text.split('\n').slice(1);
			console.log('Number of lines:', lines.length);

			foods = lines
				.filter((line) => line.trim()) // Skip empty lines
				.map((line) => {
					// Parse CSV line, handling quoted fields
					const fields: string[] = [];
					let currentField = '';
					let inQuotes = false;
					let i = 0;

					while (i < line.length) {
						const char = line[i];
						if (char === '"') {
							if (inQuotes && line[i + 1] === '"') {
								// Handle escaped quotes
								currentField += '"';
								i += 2;
							} else {
								inQuotes = !inQuotes;
								i++;
							}
						} else if (char === ',' && !inQuotes) {
							fields.push(currentField);
							currentField = '';
							i++;
						} else {
							currentField += char;
							i++;
						}
					}
					fields.push(currentField);

					const [
						name,
						allenNote,
						servingG,
						calories,
						fatG,
						sodiumMg,
						fibreG,
						totalSugarG,
						proteinG,
						source
					] = fields;

					// Debug log the raw values
					console.log('Raw values:', {
						name,
						servingG,
						calories,
						fatG,
						sodiumMg,
						fibreG,
						totalSugarG,
						proteinG
					});

					// Helper function to parse numbers, handling quoted values
					const parseNumber = (value: string): number => {
						const cleanValue = value.replace(/^"|"$/g, '').trim();
						const num = Number(cleanValue);
						if (isNaN(num)) {
							console.warn(`Failed to parse number: "${cleanValue}"`);
						}
						return num;
					};

					return {
						name: name.replace(/^"|"$/g, ''),
						allenNote: allenNote.replace(/^"|"$/g, ''),
						servingG: parseNumber(servingG),
						calories: parseNumber(calories),
						fatG: parseNumber(fatG),
						sodiumMg: parseNumber(sodiumMg),
						fibreG: parseNumber(fibreG),
						totalSugarG: parseNumber(totalSugarG),
						proteinG: parseNumber(proteinG),
						source: source.replace(/^"|"$/g, '')
					};
				});

			console.log('Parsed foods:', foods.length);
			console.log('First food:', foods[0]);
		} catch (error) {
			console.error('Error loading foods:', error);
		}
	});

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
					<th>Fat (g)</th>
					<th>Sodium (mg)</th>
					<th>Fibre (g)</th>
					<th>Sugar (g)</th>
					<th>Protein (g)</th>
				</tr>
			</thead>
			<tbody>
				{#each foods as food}
					<tr>
						<td>{food.name}</td>
						<td class="max-w-xs">{food.allenNote}</td>
						<td>{food.servingG}</td>
						<td>{food.calories}</td>
						<td>{food.fatG}</td>
						<td>{food.sodiumMg}</td>
						<td>{food.fibreG}</td>
						<td>{food.totalSugarG}</td>
						<td>{food.proteinG}</td>
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
