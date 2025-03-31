import { PUBLIC_DOMAIN } from '$env/static/public';

/**
 * @returns {Promise<{metadata: {title: string, description: string, url: string, image: string}}>}
 */
export function load() {
	const title = 'Nutri-Score Calculator';
	const description = 'A calculator and reference for the Nutri-Score of snacks and cereals.';
	const imageUrl = `${PUBLIC_DOMAIN}/nutri-score-scale.jpg`;

	return {
		metadata: {
			title,
			description,
			url: PUBLIC_DOMAIN,
			image: imageUrl
		}
	};
}
