import { writable, get } from 'svelte/store';

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	isLoggedIn: boolean;
}

// Mock user for the flow
export const mockUser: User = {
	id: '1',
	name: 'Lisa Mustermann',
	email: 'Lisa.Mustermann@hfg-gmuend.de',
	password: 'Admin',
	isLoggedIn: false
};

// Current user store
export const currentUser = writable<User | null>(null);

// Authentication functions
export const authStore = {
	login: (email: string, password: string): boolean => {
		if (email === mockUser.email && password === mockUser.password) {
			currentUser.set({ ...mockUser, isLoggedIn: true });
			return true;
		}
		return false;
	},
	
	logout: (): void => {
		currentUser.set(null);
	},
	
	register: (name: string, email: string, password: string): boolean => {
		// For demo purposes, we'll just update the mock user
		// In a real app, this would create a new user
		const newUser: User = {
			id: '1',
			name,
			email,
			password,
			isLoggedIn: true
		};
		currentUser.set(newUser);
		return true;
	},
	
	isLoggedIn: (): boolean => {
		const user = get(currentUser);
		return user?.isLoggedIn ?? false;
	}
};
