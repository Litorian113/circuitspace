import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Sidebar state management
export const sidebarCollapsed = writable(false);

// Circuit Designer state management
export const circuitDesignerActive = writable(false);

// Active view type management
export type ActiveView = 'chat' | 'circuit-designer' | 'code-editor';
export const activeView = writable<ActiveView>('chat');

// Helper function to get current sidebar width
export const getSidebarWidth = (collapsed: boolean): number => {
	return collapsed ? 80 : 280;
};

// CSS custom property for dynamic margin
export const setSidebarWidth = (collapsed: boolean) => {
	// Only execute on client side, not during SSR
	if (browser) {
		const width = getSidebarWidth(collapsed);
		document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
	}
};

// Circuit Designer control functions
export const setCircuitDesignerActive = (active: boolean) => {
	circuitDesignerActive.set(active);
};

export const toggleCircuitDesigner = () => {
	circuitDesignerActive.update(active => !active);
};
