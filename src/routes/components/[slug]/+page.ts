import type { PageLoad } from './$types';
import { componentLibrary } from '$lib/stores/components.ts';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ params }) => {
	const component = componentLibrary.find(c => c.id === params.slug);
	
	if (!component) {
		throw error(404, 'Komponente nicht gefunden');
	}
	
	return {
		component
	};
};
