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
	let processedFile = null;

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

		// Load heic-to library
		const script = document.createElement('script');
		script.type = 'module';
		script.innerHTML = `
			import * as heicTo from 'https://cdn.jsdelivr.net/npm/heic-to@1.1.10/dist/csp/heic-to.min.js';
			window.heicToLib = heicTo;
			console.log('HEIC library loaded successfully');
		`;
		document.head.appendChild(script);
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

	// Debug logging function - console only
	function debugLog(message, data = null) {
		const timestamp = new Date().toLocaleTimeString();
		const formattedMsg = timestamp + ': ' + message;

		if (data) {
			console.log(formattedMsg, data);
		} else {
			console.log(formattedMsg);
		}
	}

	// Resize image using canvas - always applied
	async function resizeImage(file, maxDimension = MAX_DIMENSION) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function (e) {
				const img = new Image();
				img.src = e.target.result;

				img.onload = function () {
					// Get image dimensions
					let width = img.width;
					let height = img.height;

					// Check if resize is needed
					if (width <= maxDimension && height <= maxDimension) {
						debugLog('No resize needed, image dimensions are within limits', {
							width,
							height
						});
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
					ctx.drawImage(img, 0, 0, width, height);

					// Convert to blob
					canvas.toBlob(
						(blob) => {
							const resizedFile = new File([blob], file.name.split('.')[0] + '.jpg', {
								type: 'image/jpeg',
								lastModified: new Date().getTime()
							});
							resolve(resizedFile);
						},
						'image/jpeg',
						0.9
					);
				};
			};
		});
	}

	// Convert HEIC to JPEG using heic-to library
	async function convertHeicToJpeg(file) {
		debugLog('Starting HEIC conversion with heic-to library');

		try {
			// Check if heic-to library is available
			if (!window.heicToLib) {
				debugLog('heic-to library not loaded, skipping conversion');
				throw new Error('HEIC conversion library not available');
			}

			// First check if the file is actually a HEIC file
			debugLog('Checking if file is HEIC format');
			const isHeicFile = await window.heicToLib.isHeic(file).catch((err) => {
				debugLog('Error checking HEIC format', {
					message: err.message
				});
				return false;
			});

			debugLog('File HEIC check result', {
				isHeic: isHeicFile
			});

			if (!isHeicFile) {
				debugLog('File is not a HEIC image, skipping conversion');
				return file;
			}

			// Convert the HEIC file to JPEG
			debugLog('Converting HEIC to JPEG');
			const jpegBlob = await window.heicToLib.heicTo({
				blob: file,
				type: 'image/jpeg',
				quality: 0.9
			});

			debugLog('HEIC conversion successful', {
				size: jpegBlob.size,
				type: jpegBlob.type
			});

			// Create a new File from the blob
			return new File([jpegBlob], file.name.split('.')[0] + '.jpg', {
				type: 'image/jpeg',
				lastModified: new Date().getTime()
			});
		} catch (error) {
			debugLog('HEIC conversion error', {
				message: error.message,
				stack: error.stack
			});
			throw error;
		}
	}

	// Fallback method - directly use client-side resizing without format conversion
	async function clientSideResize(file, maxWidth = 1024, maxHeight = 1024) {
		debugLog('Using client-side resize fallback');

		return new Promise((resolve, reject) => {
			try {
				// Create a FileReader to read the file
				const reader = new FileReader();

				reader.onload = function (e) {
					// Create an image to get the dimensions
					const img = new Image();

					img.onload = function () {
						debugLog('Image loaded for resize', {
							width: img.width,
							height: img.height
						});

						// Calculate new dimensions maintaining aspect ratio
						let width = img.width;
						let height = img.height;

						if (width > height && width > maxWidth) {
							height = Math.round(height * (maxWidth / width));
							width = maxWidth;
						} else if (height > maxHeight) {
							width = Math.round(width * (maxHeight / height));
							height = maxHeight;
						}

						// Create a canvas to draw the resized image
						const canvas = document.createElement('canvas');
						canvas.width = width;
						canvas.height = height;

						// Draw image on canvas
						const ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0, width, height);

						// Get as JPEG
						canvas.toBlob(
							function (blob) {
								debugLog('Resize complete', {
									originalSize: file.size,
									newSize: blob.size,
									width: width,
									height: height
								});

								// Create a new File
								const resizedFile = new File([blob], file.name.split('.')[0] + '.jpg', {
									type: 'image/jpeg',
									lastModified: new Date().getTime()
								});

								resolve(resizedFile);
							},
							'image/jpeg',
							0.9
						);
					};

					img.onerror = function () {
						debugLog('Image failed to load for resize');
						reject(new Error('Failed to load image for resizing'));
					};

					// Load the image
					img.src = e.target.result;
				};

				reader.onerror = function () {
					debugLog('FileReader error', {
						error: reader.error
					});
					reject(new Error('Failed to read file for resizing'));
				};

				// Read the file as a data URL
				reader.readAsDataURL(file);
			} catch (error) {
				debugLog('Error in client-side resize', {
					message: error.message
				});
				reject(error);
			}
		});
	}

	// Handle file selection
	async function handleFileSelect() {
		if (fileInput && fileInput.files && fileInput.files.length > 0) {
			const file = fileInput.files[0];
			if (!file) return;

			try {
				isProcessing = true;
				errorMessage = '';

				debugLog('Processing file', {
					name: file.name,
					type: file.type,
					size: file.size + ' bytes'
				});

				let processedImageFile = file;

				// Handle HEIC/HEIF files
				if (
					file.type === 'image/heic' ||
					file.name.toLowerCase().endsWith('.heic') ||
					file.name.toLowerCase().endsWith('.heif')
				) {
					debugLog('Detected HEIC/HEIF image');

					try {
						// Try converting with heic-to
						processedImageFile = await convertHeicToJpeg(file);
						debugLog('HEIC conversion successful!');
					} catch (heicError) {
						debugLog('Primary HEIC conversion failed', {
							message: heicError.message
						});

						// Try direct resize instead of conversion
						try {
							debugLog('Trying direct resize fallback');

							// This method tries to load the image and resize it
							// bypassing format conversion issues
							processedImageFile = await clientSideResize(file, 2048, 2048);

							debugLog('Image processed with fallback method');
						} catch (fallbackError) {
							debugLog('All conversion methods failed', {
								message: fallbackError.message
							});

							// Last attempt - just treat it as JPEG and hope for the best
							debugLog('Last resort - trying to process as-is');

							// Just rename it to jpg and hope the server can handle it
							processedImageFile = new File([file], file.name.split('.')[0] + '.jpg', {
								type: 'image/jpeg',
								lastModified: new Date().getTime()
							});
						}
					}
				}

				// Always resize the image to MAX_DIMENSION
				debugLog('Resizing image to ' + MAX_DIMENSION + 'px');
				processedImageFile = await resizeImage(processedImageFile, MAX_DIMENSION);
				debugLog('Processing complete', {
					name: processedImageFile.name,
					type: processedImageFile.type,
					size: processedImageFile.size + ' bytes'
				});

				// Store processed file for upload
				processedFile = processedImageFile;

				// Create form data
				const formData = new FormData();
				formData.append('file', processedFile);

				// Send to API
				debugLog('Sending image to API for analysis');
				const response = await fetch('https://nutrients-from-image.vercel.app/analyze/', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const data = await response.json();
				debugLog('Nutrition data from image:', data);

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
