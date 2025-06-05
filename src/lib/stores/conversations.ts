import { writable } from 'svelte/store';

export interface ConversationStep {
	id: string;
	type: 'ai' | 'user' | 'system';
	content: string;
	componentImages?: string[];
	codeGenerated?: string;
	nextSteps?: string[];
	userResponse?: string;
	isCompleted?: boolean;
	showTutorialButton?: boolean;
}

export interface Conversation {
	id: string;
	projectType: string;
	title: string;
	description: string;
	currentStep: number;
	steps: ConversationStep[];
	components: string[];
	isCompleted: boolean;
}

// Arduino Leonardo LED Dimmer Conversation
export const leonardoLedDimmerConversation: Conversation = {
	id: 'leonardo-led-dimmer',
	projectType: 'led-dimmer',
	title: 'Arduino Leonardo LED Dimmer',
	description: 'Build a LED brightness controller using an Arduino Leonardo, potentiometer, and LED',
	currentStep: 0,
	isCompleted: false,
	components: ['leonardo-keyestudio', 'breadboard', 'leuchtdiode', 'widerstand', 'poti', 'jumpercable'],
	steps: [
		{
			id: 'component-analysis',
			type: 'ai',
			content: `Perfekt! Für dieses LED-Dimmer Projekt mit einem Arduino Leonardo benötigen Sie folgende Komponenten:

**Komponenten Liste:**

🔸 **Arduino Leonardo (Keyestudio)** - Der Hauptcontroller
🔸 **Breadboard** - Für die Schaltungsaufbau  
🔸 **LED (Diode)** - Die Leuchtdiode die gedimmt werden soll
🔸 **Resistor (Widerstand)** - Schutz für die LED (220Ω empfohlen)
🔸 **Potentiometer** - Zur Helligkeitsregelung der LED
🔸 **Jumper Cables** - Verbindungskabel für die Schaltung

**Über das Projekt:**
Diese Schaltung ermöglicht es Ihnen, die Helligkeit einer LED stufenlos über ein Potentiometer zu regulieren. Der Arduino Leonardo liest den analogen Wert des Potentiometers ein und wandelt ihn in ein PWM-Signal um, das die LED entsprechend dimmt.`,
			componentImages: [
				'/components/leonardoKeyestudio.png',
				'/components/jumpercable.png', 
				'/components/leuchtdiode.png',
				'/components/widerstand.png',
				'/components/poti.png',
				'/components/breadboard.png'
			],
			nextSteps: ['user-confirms-components'],
			isCompleted: false
		},
		{
			id: 'user-confirms-components',
			type: 'user',
			content: 'okay ich habe alle komponenten',
			userResponse: 'okay ich habe alle komponenten',
			nextSteps: ['code-preparation'],
			isCompleted: false
		},
		{
			id: 'code-preparation',
			type: 'ai',
			content: `Ausgezeichnet! Alle Komponenten sind verfügbar. Wir können jetzt mit der Schritt-für-Schritt Programmierung beginnen.

**Was wir programmieren werden:**
1. **Pin-Konfiguration** - Potentiometer und LED Pins definieren
2. **Setup-Funktion** - Initialisierung der Hardware
3. **Analoges Einlesen** - Potentiometer-Werte erfassen
4. **PWM-Steuerung** - LED-Helligkeit per PWM regulieren
5. **Mapping & Debugging** - Werte umrechnen und überwachen

Sollen wir mit der Code-Implementierung beginnen?`,
			nextSteps: ['start-coding'],
			showTutorialButton: true,
			isCompleted: false
		},
		{
			id: 'start-coding',
			type: 'ai',
			content: `Perfekt! Der Code ist fertig und bereit zum Hochladen auf Ihren Arduino Leonardo.

**Nächste Schritte:**
Jetzt sind wir bereit für die praktische Umsetzung! Möchten Sie:

🔹 **Circuit Designer** - Die Schaltung hier virtuell aufbauen und testen
🔹 **Realer Tisch** - Direkt zur physischen Umsetzung am Arbeitsplatz wechseln

Wie möchten Sie fortfahren?`,
			nextSteps: ['circuit-designer', 'real-workspace'],
			isCompleted: false
		}
	]
};

// Code Tutorial Steps für interaktive IDE-Anleitung
export interface CodeTutorialStep {
	id: string;
	title: string;
	description: string;
	code: string;
	explanation: string;
	highlight?: { start: number; end: number };
}

export const leonardoCodeTutorial: CodeTutorialStep[] = [
	{
		id: 'step-1-setup',
		title: 'Schritt 1: Grundstruktur & Kommentare',
		description: 'Lassen Sie uns mit der Grundstruktur und Dokumentation beginnen.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Helligkeit einer LED über Potentiometer steuern
  
  Hardware:
  - Arduino Leonardo
  - LED an Pin 9 (PWM-fähig)
  - Potentiometer an Pin A0
  - 220Ω Widerstand für LED
*/`,
		explanation: 'Ein guter Code beginnt immer mit Dokumentation. Hier definieren wir was unser Projekt macht und welche Hardware verwendet wird.'
	},
	{
		id: 'step-2-pins',
		title: 'Schritt 2: Pin-Definitionen',
		description: 'Jetzt definieren wir die Hardware-Pins für unser Projekt.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Helligkeit einer LED über Potentiometer steuern
  
  Hardware:
  - Arduino Leonardo
  - LED an Pin 9 (PWM-fähig)
  - Potentiometer an Pin A0
  - 220Ω Widerstand für LED
*/

// Pin-Definitionen
const int potPin = A0;      // Potentiometer an Analog Pin A0
const int ledPin = 9;       // LED an Digital Pin 9 (PWM-fähig)`,
		explanation: 'Mit const int definieren wir unveränderliche Konstanten für unsere Pins. Pin 9 unterstützt PWM (Pulsweitenmodulation) für die LED-Helligkeitssteuerung.'
	},
	{
		id: 'step-3-setup',
		title: 'Schritt 3: Setup-Funktion',
		description: 'Die setup() Funktion läuft einmal beim Start des Arduino.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Helligkeit einer LED über Potentiometer steuern
  
  Hardware:
  - Arduino Leonardo
  - LED an Pin 9 (PWM-fähig)
  - Potentiometer an Pin A0
  - 220Ω Widerstand für LED
*/

// Pin-Definitionen
const int potPin = A0;      // Potentiometer an Analog Pin A0
const int ledPin = 9;       // LED an Digital Pin 9 (PWM-fähig)

void setup() {
  // Serielle Kommunikation starten für Debugging
  Serial.begin(9600);
  
  // LED Pin als Ausgang definieren
  pinMode(ledPin, OUTPUT);
  
  // Potentiometer Pin ist automatisch als Eingang konfiguriert
  Serial.println("Arduino Leonardo LED Dimmer gestartet!");
}`,
		explanation: 'Serial.begin() startet die Kommunikation zum Computer. pinMode() konfiguriert Pin 9 als Ausgang für die LED. Analog-Pins sind automatisch Eingänge.'
	},
	{
		id: 'step-4-loop-basic',
		title: 'Schritt 4: Grundlegende Loop-Struktur',
		description: 'Die loop() Funktion läuft endlos und enthält unsere Hauptlogik.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Helligkeit einer LED über Potentiometer steuern
  
  Hardware:
  - Arduino Leonardo
  - LED an Pin 9 (PWM-fähig)
  - Potentiometer an Pin A0
  - 220Ω Widerstand für LED
*/

// Pin-Definitionen
const int potPin = A0;      // Potentiometer an Analog Pin A0
const int ledPin = 9;       // LED an Digital Pin 9 (PWM-fähig)

void setup() {
  // Serielle Kommunikation starten für Debugging
  Serial.begin(9600);
  
  // LED Pin als Ausgang definieren
  pinMode(ledPin, OUTPUT);
  
  // Potentiometer Pin ist automatisch als Eingang konfiguriert
  Serial.println("Arduino Leonardo LED Dimmer gestartet!");
}

void loop() {
  // Potentiometer-Wert lesen (0-1023)
  int potValue = analogRead(potPin);
  
  // Hier kommt die Logik...
}`,
		explanation: 'analogRead() liest den analogen Wert des Potentiometers. Der Wertebereich ist 0-1023 (10-bit Auflösung).'
	},
	{
		id: 'step-5-mapping',
		title: 'Schritt 5: Werte-Mapping für PWM',
		description: 'Wir wandeln den Potentiometer-Wert in PWM-Werte für die LED um.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Helligkeit einer LED über Potentiometer steuern
  
  Hardware:
  - Arduino Leonardo
  - LED an Pin 9 (PWM-fähig)
  - Potentiometer an Pin A0
  - 220Ω Widerstand für LED
*/

// Pin-Definitionen
const int potPin = A0;      // Potentiometer an Analog Pin A0
const int ledPin = 9;       // LED an Digital Pin 9 (PWM-fähig)

void setup() {
  // Serielle Kommunikation starten für Debugging
  Serial.begin(9600);
  
  // LED Pin als Ausgang definieren
  pinMode(ledPin, OUTPUT);
  
  // Potentiometer Pin ist automatisch als Eingang konfiguriert
  Serial.println("Arduino Leonardo LED Dimmer gestartet!");
}

void loop() {
  // Potentiometer-Wert lesen (0-1023)
  int potValue = analogRead(potPin);
  
  // Wert auf PWM-Bereich (0-255) abbilden
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // LED-Helligkeit setzen
  analogWrite(ledPin, brightness);
}`,
		explanation: 'map() wandelt den Potentiometer-Bereich (0-1023) in PWM-Bereich (0-255) um. analogWrite() steuert die LED-Helligkeit per PWM.'
	},
	{
		id: 'step-6-debugging',
		title: 'Schritt 6: Debug-Ausgabe & Timing',
		description: 'Fügen wir Debug-Ausgaben und optimales Timing hinzu.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Helligkeit einer LED über Potentiometer steuern
  
  Hardware:
  - Arduino Leonardo
  - LED an Pin 9 (PWM-fähig)
  - Potentiometer an Pin A0
  - 220Ω Widerstand für LED
*/

// Pin-Definitionen
const int potPin = A0;      // Potentiometer an Analog Pin A0
const int ledPin = 9;       // LED an Digital Pin 9 (PWM-fähig)

void setup() {
  // Serielle Kommunikation starten für Debugging
  Serial.begin(9600);
  
  // LED Pin als Ausgang definieren
  pinMode(ledPin, OUTPUT);
  
  // Potentiometer Pin ist automatisch als Eingang konfiguriert
  Serial.println("Arduino Leonardo LED Dimmer gestartet!");
}

void loop() {
  // Potentiometer-Wert lesen (0-1023)
  int potValue = analogRead(potPin);
  
  // Wert auf PWM-Bereich (0-255) abbilden
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // LED-Helligkeit setzen
  analogWrite(ledPin, brightness);
  
  // Debug-Ausgabe
  Serial.print("Potentiometer: ");
  Serial.print(potValue);
  Serial.print(" | LED Helligkeit: ");
  Serial.println(brightness);
  
  // Kurze Pause für stabile Werte
  delay(50);
}`,
		explanation: 'Serial.print() zeigt die aktuellen Werte im Serial Monitor. delay(50) sorgt für stabile Werte und verhindert Spam in der Ausgabe.'
	}
];

// Store für aktuelle Konversation
export const currentConversation = writable<Conversation | null>(null);

// Store für Konversationsschritt
export const conversationStep = writable<number>(0);

// Store für aktuellen Tutorial-Schritt
export const currentTutorialStep = writable<number>(0);
export const isTutorialActive = writable<boolean>(false);

// Hilfsfunktionen
export function startConversation(conversationId: string) {
	if (conversationId === 'leonardo-led-dimmer') {
		currentConversation.set(leonardoLedDimmerConversation);
		conversationStep.set(0);
	}
}

export function nextConversationStep() {
	currentConversation.update(conv => {
		if (conv && conv.currentStep < conv.steps.length - 1) {
			return {
				...conv,
				currentStep: conv.currentStep + 1
			};
		}
		return conv;
	});
	
	conversationStep.update(step => step + 1);
}

export function markStepCompleted(stepId: string) {
	currentConversation.update(conv => {
		if (conv) {
			const updatedSteps = conv.steps.map(step => 
				step.id === stepId ? { ...step, isCompleted: true } : step
			);
			return {
				...conv,
				steps: updatedSteps
			};
		}
		return conv;
	});
}

export function resetConversation() {
	currentConversation.set(null);
	conversationStep.set(0);
}

// Funktion um zu prüfen ob eine Eingabe ein vordefiniertes Projekt ist
export function detectProjectType(input: string): string | null {
	const lowerInput = input.toLowerCase();
	
	// Arduino Leonardo LED Dimmer keywords
	if (lowerInput.includes('leonardo') && 
		(lowerInput.includes('led') || lowerInput.includes('diode') || lowerInput.includes('leuchtdiode')) &&
		(lowerInput.includes('dimmer') || lowerInput.includes('helligkeit') || 
		 lowerInput.includes('potentiometer') || lowerInput.includes('brightness') || 
		 lowerInput.includes('poti') || lowerInput.includes('regulieren'))) {
		return 'leonardo-led-dimmer';
	}
	
	return null;
}

// Hilfsfunktionen für Tutorial
export function startCodeTutorial() {
	currentTutorialStep.set(0);
	isTutorialActive.set(true);
}

export function nextTutorialStep() {
	currentTutorialStep.update(step => {
		if (step < leonardoCodeTutorial.length - 1) {
			return step + 1;
		}
		return step;
	});
}

export function previousTutorialStep() {
	currentTutorialStep.update(step => {
		if (step > 0) {
			return step - 1;
		}
		return step;
	});
}

export function finishTutorial() {
	isTutorialActive.set(false);
	currentTutorialStep.set(0);
}

// Funktion um den kompletten Tutorial-Code zu generieren
export function getCompleteTutorialCode(): string {
	// Return the complete code from the last tutorial step
	const lastStep = leonardoCodeTutorial[leonardoCodeTutorial.length - 1];
	return lastStep.code;
}
