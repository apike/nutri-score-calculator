<script lang="ts">
	import type { Food } from '$lib/foodLoader';

	export let onClose: () => void = () => {};
	export let onSave: (food: Food) => void = () => {};

	// Initial empty food state
	let newFood: Food = {
		name: '',
		allenNote: '',
		source: '',
		servingG: 100,
		calories: 0,
		saturatedFatG: 0,
		sodiumMg: 0,
		fibreG: 0,
		totalSugarG: 0,
		proteinG: 0,
		fruitVegPercent: 0
	};

	function handleSubmit() {
		// Fill in empty values for allenNote and source
		const completeFood: Food = {
			...newFood,
			allenNote: newFood.allenNote || '',
			source: newFood.source || ''
		};
		onSave(completeFood);
		onClose();
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Add New Food</h2>
		<!-- Mobile close button -->
		<button class="btn btn-circle btn-ghost md:hidden" on:click={onClose}>✕</button>
	</div>

	<form on:submit|preventDefault={handleSubmit} class="mt-6 space-y-4">
		<div class="form-control">
			<label class="label" for="name">
				<span class="label-text font-medium">Food Name*</span>
			</label>
			<input
				type="text"
				id="name"
				class="input input-bordered w-full"
				bind:value={newFood.name}
				required
			/>
		</div>

		<div class="form-control">
			<label class="label" for="servingG">
				<span class="label-text font-medium">Serving Size (g)*</span>
			</label>
			<input
				type="number"
				id="servingG"
				class="input input-bordered w-full"
				bind:value={newFood.servingG}
				min="1"
				required
			/>
		</div>

		<div class="form-control">
			<label class="label" for="calories">
				<span class="label-text font-medium">Calories*</span>
			</label>
			<input
				type="number"
				id="calories"
				class="input input-bordered w-full"
				bind:value={newFood.calories}
				min="0"
				required
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="form-control">
				<label class="label" for="saturatedFatG">
					<span class="label-text font-medium">Saturated Fat (g)*</span>
				</label>
				<input
					type="number"
					id="saturatedFatG"
					class="input input-bordered w-full"
					bind:value={newFood.saturatedFatG}
					min="0"
					step="0.1"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="sodiumMg">
					<span class="label-text font-medium">Sodium (mg)*</span>
				</label>
				<input
					type="number"
					id="sodiumMg"
					class="input input-bordered w-full"
					bind:value={newFood.sodiumMg}
					min="0"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="fibreG">
					<span class="label-text font-medium">Fibre (g)*</span>
				</label>
				<input
					type="number"
					id="fibreG"
					class="input input-bordered w-full"
					bind:value={newFood.fibreG}
					min="0"
					step="0.1"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="totalSugarG">
					<span class="label-text font-medium">Total Sugar (g)*</span>
				</label>
				<input
					type="number"
					id="totalSugarG"
					class="input input-bordered w-full"
					bind:value={newFood.totalSugarG}
					min="0"
					step="0.1"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="proteinG">
					<span class="label-text font-medium">Protein (g)*</span>
				</label>
				<input
					type="number"
					id="proteinG"
					class="input input-bordered w-full"
					bind:value={newFood.proteinG}
					min="0"
					step="0.1"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="fruitVegPercent">
					<span class="label-text font-medium">Fruit & Veg %</span>
				</label>
				<input
					type="number"
					id="fruitVegPercent"
					class="input input-bordered w-full"
					bind:value={newFood.fruitVegPercent}
					min="0"
					max="100"
				/>
			</div>
		</div>

		<div class="mt-8 flex justify-end space-x-4">
			<button type="button" class="btn" on:click={onClose}>Cancel</button>
			<button type="submit" class="btn btn-primary">Save Food</button>
		</div>
	</form>
</div>
