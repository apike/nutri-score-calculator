export interface Food {
	name: string;
	allenNote: string;
	category: string;
	source: string;
	servingG: number;
	calories: number;
	saturatedFatG: number;
	sodiumMg: number;
	fibreG: number;
	totalSugarG: number;
	proteinG: number;
	fruitVegPercent?: number; // Optional as it's not typically on labels
}

// In-memory array to hold user-added foods
let userAddedFoods: Food[] = [];

// Helper function to clean quotes from CSV fields
function cleanQuotes(value: string): string {
	return value.replace(/^"|"$/g, '');
}

export async function loadFoods(): Promise<Food[]> {
	try {
		const response = await fetch('/snacks.csv');
		if (!response.ok) {
			console.error('Failed to fetch CSV:', response.status, response.statusText);
			return [...userAddedFoods];
		}
		const text = await response.text();

		// Skip header row and parse each line
		const lines = text.split('\n').slice(1);

		const csvFoods = lines
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
					category,
					servingG,
					calories,
					saturatedFatG,
					sodiumMg,
					fibreG,
					totalSugarG,
					proteinG,
					source
				] = fields;

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
					name: cleanQuotes(name),
					allenNote: cleanQuotes(allenNote),
					source: cleanQuotes(source),
					servingG: parseNumber(servingG),
					calories: parseNumber(calories),
					saturatedFatG: parseNumber(saturatedFatG),
					sodiumMg: parseNumber(sodiumMg),
					fibreG: parseNumber(fibreG),
					totalSugarG: parseNumber(totalSugarG),
					proteinG: parseNumber(proteinG)
				};
			});

		// Combine user-added foods with foods from CSV
		return [...userAddedFoods, ...csvFoods];
	} catch (error) {
		console.error('Error loading foods:', error);
		return [...userAddedFoods];
	}
}

// Function to add a new food to the in-memory array
export function addNewFood(food: Food): void {
	userAddedFoods = [food, ...userAddedFoods];
}

// Function to get the count of user-added foods
export function getUserAddedFoodsCount(): number {
	return userAddedFoods.length;
}
