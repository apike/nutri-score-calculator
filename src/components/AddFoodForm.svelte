<script lang="ts">
	import type { Food } from '$lib/foodLoader';
	import { onMount } from 'svelte';

	export let onClose: () => void = () => {};
	export let onSave: (food: Food) => void = () => {};
	export let foodCount: number = 0;

	// Input reference for auto-selection
	let nameInput: HTMLInputElement;
	let fileInput: HTMLInputElement;
	let isProcessing = false;
	let errorMessage = '';

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

	// Image processing constants
	const MAX_DIMENSION = 1024;

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

	// Resize image using canvas
	async function resizeImage(file: File, maxDimension = MAX_DIMENSION): Promise<File> {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function (e) {
				const img = new Image();
				img.src = e.target?.result as string;

				img.onload = function () {
					// Get image dimensions
					let width = img.width;
					let height = img.height;

					// Check if resize is needed
					if (width <= maxDimension && height <= maxDimension) {
						console.log('No resize needed, image dimensions are within limits', { width, height });
						resolve(file);
						return;
					}

					// Calculate new dimensions
					if (width > height && width > maxDimension) {
						height = Math.round(height * (maxDimension / width));
						width = maxDimension;
					} else if (height > maxDimension) {
						width = Math.round(width * (maxDimension / height));
						height = maxDimension;
					}

					// Create canvas and draw resized image
					const canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext('2d');
					ctx?.drawImage(img, 0, 0, width, height);

					// Convert to blob
					canvas.toBlob(
						(blob) => {
							if (blob) {
								const resizedFile = new File([blob], file.name.split('.')[0] + '.jpg', {
									type: 'image/jpeg',
									lastModified: new Date().getTime()
								});
								resolve(resizedFile);
							} else {
								resolve(file);
							}
						},
						'image/jpeg',
						0.9
					);
				};
			};
		});
	}

	// Handle file selection
	async function handleFileSelect() {
		if (fileInput && fileInput.files && fileInput.files.length > 0) {
			const file = fileInput.files[0];
			try {
				isProcessing = true;
				errorMessage = '';

				// Process image - resize it
				console.log('Processing image file:', file.name);
				const processedFile = await resizeImage(file);

				// Create form data
				const formData = new FormData();
				formData.append('file', processedFile);

				// Send to API
				console.log('Sending image to API for analysis');
				const response = await fetch('https://nutrients-from-image.vercel.app/analyze/', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const data = await response.json();
				console.log('Nutrition data from image:', data);

				// Check if nutrition label was found
				if (data.nutrition_label_found === 'true') {
					// Populate form fields with the returned data
					if (data.guessed_packaged_food_name) {
						foodName = data.guessed_packaged_food_name;
					}

					servingG = data.serving_grams?.toString() || '';
					calories = data.calories?.toString() || '';
					saturatedFatG = data.saturated_fat_grams || 0;
					sodiumMg = data.sodium_mg || 0;
					fibreG = data.fibre_grams || 0;
					totalSugarG = data.total_sugar_grams || 0;
					proteinG = data.protein_grams || 0;
					fruitVegPercent = data.percent_whole_fruit_or_veg_guess || 0;

					// Set source to indicate it came from image scan
					source = 'Image Scan';
				} else {
					errorMessage = 'No nutrition label detected in the image.';
				}
			} catch (error) {
				console.error('Error processing image:', error);
				errorMessage = 'Error analyzing the image. Please try again.';
			} finally {
				isProcessing = false;
			}
		}
	}

	// Trigger file input click
	function openFileSelector() {
		if (fileInput) {
			fileInput.click();
		}
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Add New Food</h2>
		<!-- Mobile close button -->
		<button class="btn btn-circle btn-ghost text-xl md:hidden" onclick={onClose}>✕</button>
	</div>

	<!-- Add from Photo button -->
	<div class="mt-4">
		<div class="flex flex-col">
			<div class="flex items-center gap-3">
				<button
					type="button"
					class="btn btn-secondary"
					onclick={openFileSelector}
					disabled={isProcessing}
				>
					{isProcessing ? 'Processing...' : 'Add from Photo'}
				</button>
				{#if errorMessage}
					<span class="text-error text-sm">{errorMessage}</span>
				{/if}
			</div>
			<input
				type="file"
				accept="image/*"
				bind:this={fileInput}
				onchange={handleFileSelect}
				class="hidden"
			/>
		</div>
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
