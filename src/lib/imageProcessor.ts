// Image processing constants
const MAX_DIMENSION = 1024;

// Debug logging function - console only
function debugLog(message: string, data: any = null) {
	const timestamp = new Date().toLocaleTimeString();
	const formattedMsg = timestamp + ': ' + message;

	if (data) {
		console.log(formattedMsg, data);
	} else {
		console.log(formattedMsg);
	}
}

// Resize image using canvas - always applied
export async function resizeImage(file: File, maxDimension = MAX_DIMENSION): Promise<File> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function (e) {
			if (!e.target || !e.target.result) {
				reject(new Error('Failed to read file'));
				return;
			}

			const img = new Image();
			img.src = e.target.result as string;

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
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}
				ctx.drawImage(img, 0, 0, width, height);

				// Convert to blob
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('Failed to convert to blob'));
							return;
						}
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
				reject(new Error('Failed to load image for resizing'));
			};
		};

		reader.onerror = function () {
			reject(new Error('Failed to read file'));
		};
	});
}

// Convert HEIC to JPEG using heic-to library
export async function convertHeicToJpeg(file: File): Promise<File> {
	debugLog('Starting HEIC conversion with heic-to library');

	try {
		// Check if heic-to library is available
		if (!(window as any).heicToLib) {
			debugLog('heic-to library not loaded, skipping conversion');
			throw new Error('HEIC conversion library not available');
		}

		// First check if the file is actually a HEIC file
		debugLog('Checking if file is HEIC format');
		const isHeicFile = await (window as any).heicToLib.isHeic(file).catch((err: Error) => {
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
		const jpegBlob = await (window as any).heicToLib.heicTo({
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
	} catch (error: any) {
		debugLog('HEIC conversion error', {
			message: error.message,
			stack: error.stack
		});
		throw error;
	}
}

// Fallback method - directly use client-side resizing without format conversion
export async function clientSideResize(
	file: File,
	maxWidth = 1024,
	maxHeight = 1024
): Promise<File> {
	debugLog('Using client-side resize fallback');

	return new Promise((resolve, reject) => {
		try {
			// Create a FileReader to read the file
			const reader = new FileReader();

			reader.onload = function (e) {
				if (!e.target || !e.target.result) {
					reject(new Error('Failed to read file'));
					return;
				}

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
					if (!ctx) {
						reject(new Error('Failed to get canvas context'));
						return;
					}
					ctx.drawImage(img, 0, 0, width, height);

					// Get as JPEG
					canvas.toBlob(
						function (blob) {
							if (!blob) {
								reject(new Error('Failed to convert to blob'));
								return;
							}

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
				img.src = e.target.result as string;
			};

			reader.onerror = function () {
				debugLog('FileReader error', {
					error: reader.error
				});
				reject(new Error('Failed to read file for resizing'));
			};

			// Read the file as a data URL
			reader.readAsDataURL(file);
		} catch (error: any) {
			debugLog('Error in client-side resize', {
				message: error.message
			});
			reject(error);
		}
	});
}

// Load HEIC library script asynchronously
export function loadHeicLibrary(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined') {
			reject(new Error('Window not available'));
			return;
		}

		// If already loaded, resolve immediately
		if ((window as any).heicToLib) {
			resolve();
			return;
		}

		const script = document.createElement('script');
		script.type = 'module';
		script.innerHTML = `
            import * as heicTo from 'https://cdn.jsdelivr.net/npm/heic-to@1.1.10/dist/csp/heic-to.min.js';
            window.heicToLib = heicTo;
            console.log('HEIC library loaded successfully');
        `;

		script.onload = () => resolve();
		script.onerror = (error) => {
			console.error('Failed to load HEIC library:', error);
			reject(error);
		};

		document.head.appendChild(script);
	});
}

// Process an image file - handles HEIC conversion and resizing
export async function processImageFile(file: File): Promise<File> {
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
				message: (heicError as Error).message
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
					message: (fallbackError as Error).message
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

	return processedImageFile;
}
