<script lang="ts">
	import type { Food } from '$lib/foodLoader';
	import { onMount } from 'svelte';

	export let onClose: () => void = () => {};
	export let onSave: (food: Food) => void = () => {};
	export let foodCount: number = 0;

	// Input reference for auto-selection
	let nameInput: HTMLInputElement;

	// Form field values
	let foodName = foodCount === 0 ? 'Snack Food' : `Snack Food ${foodCount + 1}`;
	let allenNote = '';
	let category = 'user'; // Default category for user-added foods
	let source = '';
	let servingG = '';
	let calories = '';
	let saturatedFatG = 0;
	let sodiumMg = 0;
	let fibreG = 0;
	let totalSugarG = 0;
	let proteinG = 0;
	let fruitVegPercent = 0;

	onMount(() => {
		// Select the text in the name input field
		if (nameInput) {
			nameInput.focus();
			nameInput.select();
		}
	});

	function handleSubmit() {
		// Create the food object with numeric conversions
		const completeFood: Food = {
			name: foodName,
			allenNote: allenNote || '',
			category,
			source: source || '',
			servingG: Number(servingG),
			calories: Number(calories),
			saturatedFatG,
			sodiumMg,
			fibreG,
			totalSugarG,
			proteinG,
			fruitVegPercent
		};
		onSave(completeFood);
		onClose();
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Add New Food</h2>
		<!-- Mobile close button -->
		<button class="btn btn-circle btn-ghost md:hidden" onclick={onClose}>✕</button>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="mt-6 space-y-4"
	>
		<div class="form-control">
			<label class="label" for="name">
				<span class="label-text font-medium">Food Name</span>
			</label>
			<input
				type="text"
				id="name"
				class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
				bind:value={foodName}
				bind:this={nameInput}
				required
				autocomplete="off"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label" for="servingG">
					<span class="label-text font-medium">Serving Size (g)</span>
				</label>
				<input
					type="number"
					id="servingG"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={servingG}
					min="1"
					required
					inputmode="numeric"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="calories">
					<span class="label-text font-medium">Calories</span>
				</label>
				<input
					type="number"
					id="calories"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={calories}
					min="0"
					required
					inputmode="numeric"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="saturatedFatG">
					<span class="label-text font-medium">Saturated Fat (g)</span>
				</label>
				<input
					type="number"
					id="saturatedFatG"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={saturatedFatG}
					min="0"
					step="0.1"
					required
					inputmode="decimal"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="fibreG">
					<span class="label-text font-medium">Fibre (g)</span>
				</label>
				<input
					type="number"
					id="fibreG"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={fibreG}
					min="0"
					step="0.1"
					required
					inputmode="decimal"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="totalSugarG">
					<span class="label-text font-medium">Total Sugar (g)</span>
				</label>
				<input
					type="number"
					id="totalSugarG"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={totalSugarG}
					min="0"
					step="0.1"
					required
					inputmode="decimal"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="proteinG">
					<span class="label-text font-medium">Protein (g)</span>
				</label>
				<input
					type="number"
					id="proteinG"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={proteinG}
					min="0"
					step="0.1"
					required
					inputmode="decimal"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="sodiumMg">
					<span class="label-text font-medium">Sodium (mg)</span>
				</label>
				<input
					type="number"
					id="sodiumMg"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={sodiumMg}
					min="0"
					required
					inputmode="numeric"
				/>
			</div>

			<div class="form-control">
				<label class="label" for="fruitVegPercent">
					<span class="label-text font-medium">Whole Fruit & Veg %</span>
				</label>
				<input
					type="number"
					id="fruitVegPercent"
					class="focus:border-primary focus:ring-primary w-full rounded-md border-gray-300 focus:ring-1 focus:outline-none"
					bind:value={fruitVegPercent}
					min="0"
					max="100"
					inputmode="numeric"
				/>
			</div>
		</div>

		<div class="mt-8 flex justify-end space-x-4">
			<button type="button" class="btn" onclick={onClose}>Cancel</button>
			<button type="submit" class="btn btn-primary">Save Food</button>
		</div>
	</form>
</div>
