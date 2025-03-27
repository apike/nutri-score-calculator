export interface Food {
	name: string;
	allenNote: string;
	servingG: number;
	calories: number;
	saturatedFatG: number;
	sodiumMg: number;
	fibreG: number;
	totalSugarG: number;
	proteinG: number;
	source: string;
}

// Helper function to clean quotes from CSV fields
function cleanQuotes(value: string): string {
	return value.replace(/^"|"$/g, '');
}

export async function loadFoods(): Promise<Food[]> {
	try {
		const response = await fetch('/cereals.csv');
		if (!response.ok) {
			console.error('Failed to fetch CSV:', response.status, response.statusText);
			return [];
		}
		const text = await response.text();

		// Skip header row and parse each line
		const lines = text.split('\n').slice(1);

		return lines
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
					servingG: parseNumber(servingG),
					calories: parseNumber(calories),
					saturatedFatG: parseNumber(fatG) * 0.1, // Estimate saturated fat as 10% of total fat, spreadsheet needs updated
					sodiumMg: parseNumber(sodiumMg),
					fibreG: parseNumber(fibreG),
					totalSugarG: parseNumber(totalSugarG),
					proteinG: parseNumber(proteinG),
					source: cleanQuotes(source)
				};
			});
	} catch (error) {
		console.error('Error loading foods:', error);
		return [];
	}
}
