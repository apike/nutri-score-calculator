<script lang="ts">
	import { computeFNSpoints, nutriScoreLetter } from '$lib/nutriscore-calc';
	import type { NutrientsPer100g } from '$lib/nutriscore-calc';

	let sampleData: NutrientsPer100g = $state({
		energyKJ: 1200,
		saturatesG: 3.5,
		sugarsG: 12,
		saltG: 1.2,
		proteinG: 8,
		fibreG: 4,
		fruitVegPercent: 60
	});

	let numericScore = $derived(computeFNSpoints(sampleData));
	let nutriScore = $derived(nutriScoreLetter(numericScore));
</script>

<h1 class="text-3xl font-bold">Nutri-Score Calculator</h1>
<p class="pt-4 text-lg">Sample calculation:</p>

<div class="bg-base-200 mt-4 rounded-lg p-4">
	<p>Energy: {sampleData.energyKJ} kJ</p>
	<p>Saturates: {sampleData.saturatesG}g</p>
	<p>Sugars: {sampleData.sugarsG}g</p>
	<p>Salt: {sampleData.saltG}g</p>
	<p>Protein: {sampleData.proteinG}g</p>
	<p>Fibre: {sampleData.fibreG}g</p>
	<p>Fruit/Veg: {sampleData.fruitVegPercent}%</p>
</div>

<div class="mt-4">
	<p class="text-xl">Numeric Score: {numericScore}</p>
	<p class="text-2xl font-bold">Nutri-Score: {nutriScore}</p>
</div>
