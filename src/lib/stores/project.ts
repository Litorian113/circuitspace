import { writable } from 'svelte/store';

export interface Component {
	id: string;
	name: string;
	description: string;
	price?: string;
	category: string;
	pinouts?: string[];
	specifications?: Record<string, string>;
}

export interface Project {
	id: string;
	name: string;
	description: string;
	components: Component[];
	code: string;
	createdAt: Date;
	updatedAt: Date;
	chatHistory: Array<{
		id: number;
		type: 'user' | 'ai' | 'system';
		content: string;
		timestamp: Date;
		codeGenerated?: string;
		componentSuggestions?: Component[];
	}>;
}

// Default project template
const defaultProject: Project = {
	id: 'default',
	name: 'Smart LED Controller',
	description: 'An intelligent LED strip controller with multiple lighting modes and remote control capabilities',
	components: [
		{
			id: 'arduino-uno',
			name: 'Arduino Uno',
			description: 'Main microcontroller board',
			price: '$25',
			category: 'microcontroller',
			pinouts: ['D0-D13', 'A0-A5', '5V', '3.3V', 'GND'],
			specifications: {
				'MCU': 'ATmega328P',
				'Clock Speed': '16 MHz',
				'Flash Memory': '32 KB',
				'SRAM': '2 KB',
				'EEPROM': '1 KB'
			}
		},
		{
			id: 'led-strip',
			name: 'WS2812B LED Strip',
			description: 'Addressable RGB LED strip - 1 meter, 30 LEDs',
			price: '$15',
			category: 'output',
			pinouts: ['VCC', 'GND', 'Data In', 'Data Out'],
			specifications: {
				'LEDs per meter': '30',
				'Voltage': '5V',
				'Current per LED': '50mA',
				'Color depth': '24-bit'
			}
		}
	],
	code: `#include <FastLED.h>

#define LED_PIN 6
#define NUM_LEDS 30
#define BRIGHTNESS 100

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  Serial.begin(9600);
  Serial.println("Circuitspace LED Controller Started!");
}

void loop() {
  // Rainbow effect
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(i * 8, 255, 255);
  }
  FastLED.show();
  delay(50);
}`,
	createdAt: new Date(),
	updatedAt: new Date(),
	chatHistory: []
};

// Project store
export const currentProject = writable<Project>(defaultProject);

// Helper functions
export function updateProjectCode(code: string) {
	currentProject.update(project => ({
		...project,
		code,
		updatedAt: new Date()
	}));
}

export function addComponent(component: Component) {
	currentProject.update(project => ({
		...project,
		components: [...project.components, component],
		updatedAt: new Date()
	}));
}

export function removeComponent(componentId: string) {
	currentProject.update(project => ({
		...project,
		components: project.components.filter(c => c.id !== componentId),
		updatedAt: new Date()
	}));
}

export function updateProjectName(name: string) {
	currentProject.update(project => ({
		...project,
		name,
		updatedAt: new Date()
	}));
}

export function addChatMessage(message: Project['chatHistory'][0]) {
	currentProject.update(project => ({
		...project,
		chatHistory: [...project.chatHistory, message],
		updatedAt: new Date()
	}));
}

// Local storage persistence
export function saveProject() {
	currentProject.subscribe(project => {
		localStorage.setItem('circuitspace-project', JSON.stringify(project));
	});
}

export function loadProject(): Project | null {
	if (typeof window === 'undefined') return null;
	
	const saved = localStorage.getItem('circuitspace-project');
	if (saved) {
		try {
			const project = JSON.parse(saved);
			// Convert date strings back to Date objects
			project.createdAt = new Date(project.createdAt);
			project.updatedAt = new Date(project.updatedAt);
			project.chatHistory = project.chatHistory.map((msg: any) => ({
				...msg,
				timestamp: new Date(msg.timestamp)
			}));
			return project;
		} catch (error) {
			console.error('Failed to load project from localStorage:', error);
		}
	}
	
	return null;
}

// Component library for suggestions
export const componentLibrary: Component[] = [
	{
		id: 'arduino-uno',
		name: 'Arduino Uno',
		description: 'Main microcontroller board',
		price: '$25',
		category: 'microcontroller'
	},
	{
		id: 'arduino-nano',
		name: 'Arduino Nano',
		description: 'Compact microcontroller board',
		price: '$12',
		category: 'microcontroller'
	},
	{
		id: 'esp32',
		name: 'ESP32 DevKit',
		description: 'WiFi/Bluetooth microcontroller',
		price: '$12',
		category: 'microcontroller'
	},
	{
		id: 'led-strip-ws2812b',
		name: 'WS2812B LED Strip',
		description: 'Addressable RGB LED strip',
		price: '$15',
		category: 'output'
	},
	{
		id: 'breadboard',
		name: 'Breadboard',
		description: 'Solderless prototyping board',
		price: '$8',
		category: 'prototyping'
	},
	{
		id: 'jumper-wires',
		name: 'Jumper Wires',
		description: 'Male-to-male connecting wires',
		price: '$5',
		category: 'prototyping'
	},
	{
		id: 'resistor-pack',
		name: 'Resistor Pack',
		description: 'Assorted resistors 1/4W',
		price: '$8',
		category: 'passive'
	},
	{
		id: 'push-button',
		name: 'Push Button',
		description: 'Momentary push button switch',
		price: '$3',
		category: 'input'
	},
	{
		id: 'potentiometer',
		name: 'Potentiometer',
		description: '10kΩ rotary potentiometer',
		price: '$2',
		category: 'input'
	},
	{
		id: 'oled-display',
		name: 'OLED Display',
		description: '0.96" 128x64 I2C OLED',
		price: '$8',
		category: 'output'
	}
];
