export interface ServingNutrients {
	servingSize: {
		amount: number;
		unit: string; // e.g., "g", "ml"
	};
	calories: number;
	saturatedFat: number; // in g
	totalSugars: number; // in g
	sodium: number; // in mg
	protein: number; // in g
	dietaryFiber: number; // in g
	fruitVegPercent?: number; // Optional as it's not typically on labels
}

/**
 * Converts serving-based nutrition data to the format needed for Nutri-Score calculation
 */
export function convertToNutrientsPer100g(data: ServingNutrients) {
	// Convert serving size to 100g
	const conversionFactor = 100 / data.servingSize.amount;

	// Convert calories to kJ (1 kcal = 4.184 kJ)
	const energyKJ = data.calories * 4.184;

	// Convert sodium from mg to g
	const saltG = data.sodium / 1000;

	return {
		energyKJ: energyKJ * conversionFactor,
		saturatesG: data.saturatedFat * conversionFactor,
		sugarsG: data.totalSugars * conversionFactor,
		saltG: saltG * conversionFactor,
		proteinG: data.protein * conversionFactor,
		fibreG: data.dietaryFiber * conversionFactor,
		fruitVegPercent: data.fruitVegPercent ?? 0
	};
}
