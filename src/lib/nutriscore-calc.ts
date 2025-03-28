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
 * Computes the numeric FNS ("Final Nutritional Score") points for a "main" food.
 * If A ≥ 11 and not cheese, omit protein points. Otherwise, subtract all C-points.
 */
export function computeFNSpoints(data: NutrientsPer100g): number {
	const A =
		pointsForEnergy(data.energyKJ) +
		pointsForSugars(data.sugarsG) +
		pointsForSaturates(data.saturatesG) +
		pointsForSalt(data.saltG);

	const cProtein = pointsForProtein(data.proteinG);
	const cFibre = pointsForFibre(data.fibreG);
	const cFruitVeg = pointsForFruitVeg(data.fruitVegPercent);

	if (A >= 11 && !data.isCheese) {
		return A - (cFibre + cFruitVeg);
	}
	return A - (cProtein + cFibre + cFruitVeg);
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
