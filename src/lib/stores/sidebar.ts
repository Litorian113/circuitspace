import { writable } from 'svelte/store';

// Sidebar state management
export const sidebarCollapsed = writable(false);

// Helper function to get current sidebar width
export const getSidebarWidth = (collapsed: boolean): number => {
	return collapsed ? 80 : 280;
};

// CSS custom property for dynamic margin
export const setSidebarWidth = (collapsed: boolean) => {
	const width = getSidebarWidth(collapsed);
	document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
};
