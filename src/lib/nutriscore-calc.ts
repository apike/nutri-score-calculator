/**
 * nutriscore-calc.ts
 *
 * An implementation of the 2022 "main foods" Nutri-Score calculation.
 */

import type { Food } from './foodLoader';

export interface NutrientsPer100g {
	energyKJ: number;
	saturatesG: number;
	sugarsG: number;
	saltG: number;
	proteinG: number;
	fibreG: number;
	fruitVegPercent: number;
	isCheese?: boolean;
}

export interface NutrientPoints {
	// Individual component points - positive for unfavorable, negative for favorable
	energy: number;
	saturates: number;
	sugars: number;
	salt: number;
	protein: number;
	fibre: number;
	fruitVeg: number;
	// Total scores
	aPoints: number; // Total unfavorable points (positive value)
	cPoints: number; // Total favorable points (positive value)
	fnsScore: number; // Final score
	proteinExcluded: boolean; // Flag indicating if protein was excluded from calculation
}

/**
 * Returns how many thresholds the given value exceeds.
 * If value > thresholds[i], that's (i+1) points.
 */
function calculatePoints(value: number, thresholds: number[]): number {
	let pts = 0;
	for (let i = 0; i < thresholds.length; i++) {
		if (value > thresholds[i]) {
			pts = i + 1;
		}
	}
	return pts;
}

// Threshold arrays
const ENERGY_THRESHOLDS = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const SATURATES_THRESHOLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SUGARS_THRESHOLDS = [3.4, 6.8, 10, 14, 17, 20, 24, 27, 31, 34, 37, 41, 44, 48, 51];
const PROTEIN_THRESHOLDS = [2.4, 4.8, 7.2, 9.6, 12.0, 14.4, 16.8];
const FIBRE_THRESHOLDS = [3.0, 4.1, 5.2, 6.3, 7.4];

const SALT_THRESHOLDS = (() => {
	const arr = [0.12];
	const step = 0.225;
	for (let i = 1; i < 20; i++) {
		arr.push(arr[i - 1] + step);
	}
	return arr;
})();

// Unfavorable (A) points
function pointsForEnergy(kJ: number): number {
	return calculatePoints(kJ, ENERGY_THRESHOLDS);
}

function pointsForSaturates(g: number): number {
	return calculatePoints(g, SATURATES_THRESHOLDS);
}

function pointsForSugars(g: number): number {
	return calculatePoints(g, SUGARS_THRESHOLDS);
}

function pointsForSalt(g: number): number {
	return calculatePoints(g, SALT_THRESHOLDS);
}

// Favorable (C) points
function pointsForProtein(g: number): number {
	return calculatePoints(g, PROTEIN_THRESHOLDS);
}

function pointsForFibre(g: number): number {
	return calculatePoints(g, FIBRE_THRESHOLDS);
}

function pointsForFruitVeg(percent: number): number {
	if (percent < 40) return 0;
	if (percent < 60) return 1;
	if (percent < 80) return 2;
	if (percent < 90) return 3;
	if (percent < 100) return 4;
	return 5;
}

/**
 * Calculates component nutrient points and returns a detailed breakdown
 */
export function calculateNutrientPoints(data: NutrientsPer100g): NutrientPoints {
	// Calculate individual components
	const energyPoints = pointsForEnergy(data.energyKJ);
	const saturatesPoints = pointsForSaturates(data.saturatesG);
	const sugarsPoints = pointsForSugars(data.sugarsG);
	const saltPoints = pointsForSalt(data.saltG);

	const proteinPoints = pointsForProtein(data.proteinG);
	const fibrePoints = pointsForFibre(data.fibreG);
	const fruitVegPoints = pointsForFruitVeg(data.fruitVegPercent);

	// Calculate total A and C points (keeping these as positive for calculation purposes)
	const aPoints = energyPoints + saturatesPoints + sugarsPoints + saltPoints;

	// Apply special protein rule
	let cPoints;
	let fnsScore;
	let proteinExcluded = false;

	if (aPoints >= 11 && !data.isCheese) {
		// Exclude protein points if A ≥ 11 and not cheese
		cPoints = fibrePoints + fruitVegPoints;
		fnsScore = aPoints - cPoints;
		proteinExcluded = true;
	} else {
		cPoints = proteinPoints + fibrePoints + fruitVegPoints;
		fnsScore = aPoints - cPoints;
	}

	return {
		// Return unfavorable points as positive values (bad)
		energy: energyPoints,
		saturates: saturatesPoints,
		sugars: sugarsPoints,
		salt: saltPoints,
		// Return favorable points as negative values (good)
		protein: -proteinPoints,
		fibre: -fibrePoints,
		fruitVeg: -fruitVegPoints,
		// Keep original scoring values as positive for clarity
		aPoints,
		cPoints,
		fnsScore,
		proteinExcluded
	};
}

/**
 * Computes the numeric FNS ("Final Nutritional Score") points for a "main" food.
 * If A ≥ 11 and not cheese, omit protein points. Otherwise, subtract all C-points.
 */
export function computeFNSpoints(data: NutrientsPer100g): number {
	return calculateNutrientPoints(data).fnsScore;
}

/**
 * Maps a numeric FNS to an A–E Nutri-Score letter category.
 */
export function nutriScoreLetter(score: number): string {
	if (score <= 0) return 'A';
	if (score <= 2) return 'B';
	if (score <= 10) return 'C';
	if (score <= 18) return 'D';
	return 'E';
}

/**
 * Returns the standard color for a Nutri-Score letter.
 */
export function nutriScoreColor(letter: string): string {
	switch (letter) {
		case 'A':
			return '#038141'; // Dark green
		case 'B':
			return '#85bb2f'; // Light green
		case 'C':
			return '#fecb02'; // Yellow
		case 'D':
			return '#ee8100'; // Orange
		case 'E':
			return '#e63e11'; // Red
		default:
			return '#AAAAAA'; // Gray for unknown
	}
}

/**
 * Returns the standard text color for a Nutri-Score letter (for contrast).
 */
export function nutriScoreTextColor(letter: string): string {
	// Dark text for light backgrounds (B, C), white for others
	return letter === 'B' || letter === 'C' ? '#333333' : '#ffffff';
}

/**
 * Converts a Food object to NutrientsPer100g, normalizing to 100g portion
 * and converting units as needed.
 */
export function nutrientsFromFood(food: Food): NutrientsPer100g {
	const scaleFactor = 100 / food.servingG;

	return {
		energyKJ: food.calories * 4.184 * scaleFactor,
		saturatesG: food.saturatedFatG * scaleFactor,
		sugarsG: food.totalSugarG * scaleFactor,
		saltG: (food.sodiumMg * scaleFactor) / 1000, // Convert mg to g
		proteinG: food.proteinG * scaleFactor,
		fibreG: food.fibreG * scaleFactor,
		fruitVegPercent: food.fruitVegPercent ?? 0,
		isCheese: false // Default to false since we don't have this data
	};
}
