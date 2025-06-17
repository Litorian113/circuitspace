// Pin-Out Definitionen für alle Komponenten im LED Dimmer Projekt

export interface Pin {
	name: string;
	type: 'power' | 'digital' | 'analog' | 'pwm' | 'ground';
	x: number;
	y: number;
	description: string;
}

export interface ComponentPinConfig {
	id: string;
	name: string;
	pins: Pin[];
}

// Arduino Leonardo Pin-Out (Relative Positionen in %)
export const arduinoLeonardoPins: ComponentPinConfig = {
	id: 'leonardo-keyestudio',
	name: 'Arduino Leonardo',
	pins: [
		// Power Pins (rechte Seite, oben nach unten)
		{ name: '5V', type: 'power', x: 85, y: 25, description: '5V power output' },
		{ name: '3.3V', type: 'power', x: 85, y: 35, description: '3.3V power output' },
		{ name: 'GND', type: 'ground', x: 85, y: 45, description: 'Ground connection' },
		
		// Digital/PWM Pins (linke Seite, verteilt)
		{ name: 'D9', type: 'pwm', x: 15, y: 25, description: 'Digital Pin 9 (PWM)' },
		{ name: 'D8', type: 'digital', x: 15, y: 35, description: 'Digital Pin 8' },
		{ name: 'D7', type: 'digital', x: 15, y: 45, description: 'Digital Pin 7' },
		
		// Analog Pins (unten)
		{ name: 'A0', type: 'analog', x: 65, y: 75, description: 'Analog Pin A0' },
		{ name: 'A1', type: 'analog', x: 80, y: 75, description: 'Analog Pin A1' },
		{ name: 'A2', type: 'analog', x: 95, y: 75, description: 'Analog Pin A2' }
	]
};

// LED Pin-Out (Relative Positionen in %)
export const ledPins: ComponentPinConfig = {
	id: 'leuchtdiode',
	name: 'LED',
	pins: [
		{ name: 'Anode', type: 'power', x: 50, y: 20, description: 'LED Anode (+)' },
		{ name: 'Kathode', type: 'ground', x: 50, y: 80, description: 'LED Kathode (-)' }
	]
};

// Widerstand Pin-Out (Relative Positionen in %)
export const resistorPins: ComponentPinConfig = {
	id: 'widerstand',
	name: 'Resistor (220Ω)',
	pins: [
		{ name: 'Pin1', type: 'power', x: 10, y: 50, description: 'Resistor Pin 1' },
		{ name: 'Pin2', type: 'ground', x: 90, y: 50, description: 'Resistor Pin 2' }
	]
};

// Potentiometer Pin-Out (Relative Positionen in %)
export const potentiometerPins: ComponentPinConfig = {
	id: 'poti',
	name: 'Potentiometer (10kΩ)',
	pins: [
		{ name: 'VCC', type: 'power', x: 20, y: 90, description: 'Power input (left pin)' },
		{ name: 'Wiper', type: 'analog', x: 50, y: 10, description: 'Variable output (middle pin)' },
		{ name: 'GND', type: 'ground', x: 80, y: 90, description: 'Ground (right pin)' }
	]
};

// Breadboard Pin-Out (Relative Positionen in %)
export const breadboardPins: ComponentPinConfig = {
	id: 'breadboard',
	name: 'Breadboard',
	pins: [
		// Power Rails (obere Seite)
		{ name: 'Power+', type: 'power', x: 15, y: 15, description: 'Positive power rail' },
		{ name: 'Power-', type: 'ground', x: 15, y: 25, description: 'Negative power rail' },
		
		// Power Rails (untere Seite)
		{ name: 'Power+2', type: 'power', x: 15, y: 75, description: 'Positive power rail (bottom)' },
		{ name: 'Power-2', type: 'ground', x: 15, y: 85, description: 'Negative power rail (bottom)' },
		
		// Connection points (Beispiel-Positionen)
		{ name: 'A1', type: 'power', x: 40, y: 40, description: 'Connection point A1' },
		{ name: 'A5', type: 'power', x: 70, y: 40, description: 'Connection point A5' },
		{ name: 'F1', type: 'ground', x: 40, y: 60, description: 'Connection point F1' },
		{ name: 'F5', type: 'ground', x: 70, y: 60, description: 'Connection point F5' }
	]
};

// Jumper Cable Pin-Out
export const jumperCablePins: ComponentPinConfig = {
	id: 'jumpercable',
	name: 'Jumper Cable',
	pins: [
		{ name: 'End1', type: 'power', x: 5, y: 5, description: 'Cable end 1' },
		{ name: 'End2', type: 'power', x: 75, y: 5, description: 'Cable end 2' }
	]
};

// Alle Pin-Konfigurationen sammeln
export const allComponentPins: ComponentPinConfig[] = [
	arduinoLeonardoPins,
	ledPins,
	resistorPins,
	potentiometerPins,
	breadboardPins,
	jumperCablePins
];

// Hilfsfunktion um Pin-Konfiguration für eine Komponente zu finden
export function getComponentPins(componentId: string): ComponentPinConfig | null {
	return allComponentPins.find(config => config.id === componentId) || null;
}

// Verbindungsregeln für das LED Dimmer Projekt
export interface ConnectionRule {
	from: { component: string; pin: string };
	to: { component: string; pin: string };
	description: string;
	required: boolean;
}

export const ledDimmerConnections: ConnectionRule[] = [
	{
		from: { component: 'leonardo-keyestudio', pin: 'GND' },
		to: { component: 'breadboard', pin: 'Power-' },
		description: 'Arduino GND zu Breadboard negative Schiene',
		required: true
	},
	{
		from: { component: 'leonardo-keyestudio', pin: '5V' },
		to: { component: 'breadboard', pin: 'Power+' },
		description: 'Arduino 5V zu Breadboard positive Schiene',
		required: true
	},
	{
		from: { component: 'leonardo-keyestudio', pin: 'D9' },
		to: { component: 'leuchtdiode', pin: 'Anode' },
		description: 'Arduino D9 (PWM) zu LED Anode',
		required: true
	},
	{
		from: { component: 'leonardo-keyestudio', pin: 'A1' },
		to: { component: 'poti', pin: 'Wiper' },
		description: 'Arduino A1 zu Potentiometer Schleifer',
		required: true
	},
	{
		from: { component: 'leuchtdiode', pin: 'Kathode' },
		to: { component: 'widerstand', pin: 'Pin1' },
		description: 'LED Kathode zu Widerstand',
		required: true
	},
	{
		from: { component: 'widerstand', pin: 'Pin2' },
		to: { component: 'breadboard', pin: 'Power-' },
		description: 'Widerstand zu GND',
		required: true
	},
	{
		from: { component: 'poti', pin: 'VCC' },
		to: { component: 'breadboard', pin: 'Power+' },
		description: 'Potentiometer VCC zu 5V',
		required: true
	},
	{
		from: { component: 'poti', pin: 'GND' },
		to: { component: 'breadboard', pin: 'Power-' },
		description: 'Potentiometer GND zu Ground',
		required: true
	}
];
