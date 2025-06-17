import { writable } from 'svelte/store';

export interface DelayedStep {
	id: string;
	content: string;
	delay: number; // in milliseconds
	isCompleted?: boolean;
}

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
	showWorkspaceButtons?: boolean;
	showProjectButtons?: boolean;
	showRealTableButton?: boolean; // Neuer Button-Typ nur für "An den Tisch"
	delayedSteps?: DelayedStep[];
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
			id: 'project-understanding',
			type: 'ai',
			content: `Ich glaube das ich habe jetzt vollständig dein Projekt verstanden. 

Wir bauen einen **LED Dimmer mit Arduino Leonardo**, bei dem:
- Ein Potentiometer die LED-Helligkeit steuert
- PWM für stufenlose Helligkeitsregelung verwendet wird
- Alle Verbindungen über ein Breadboard laufen
- Ein Schutzwiderstand die LED vor Überstrom schützt

Hast du sonst noch Fragen zum Projekt oder können wir weitermachen?`,
			nextSteps: ['continue-project', 'ask-question'],
			showProjectButtons: true,
			isCompleted: false
		},
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
Diese Schaltung ermöglicht es Ihnen, die Helligkeit einer LED stufenlos über ein Potentiometer zu regulieren. Der Arduino Leonardo liest den analogen Wert des Potentiometers ein und wandelt ihn in ein PWM-Signal um, das die LED entsprechend dimmt.

**Wo möchten Sie mit dem Aufbau beginnen?**`,
			componentImages: [
				'/components/leonardoKeyestudio.png',
				'/components/jumpercable.png', 
				'/components/leuchtdiode.png',
				'/components/widerstand.png',
				'/components/poti.png',
				'/components/breadboard.png'
			],
			nextSteps: ['circuit-designer', 'real-workspace'],
			showWorkspaceButtons: true,
			isCompleted: false
		},
		{
			id: 'circuit-designer-path',
			type: 'ai',
			content: `Ausgezeichnet! Sie haben die Schaltung im Circuit Designer erfolgreich aufgebaut! 🎉

Alle Pin-Verbindungen sind korrekt:
✅ LED mit Schutzwiderstand an Pin 9 (PWM)
✅ Potentiometer an Pin A0 (Analog Input)
✅ Korrekte Stromversorgung und Ground-Verbindungen

**Jetzt können Sie zum praktischen Aufbau am Tisch übergehen!**`,
			nextSteps: ['real-workspace-after-designer'],
			showRealTableButton: true, // Nur "An den Tisch" Button zeigen
			isCompleted: false
		},
		{
			id: 'real-workspace-steps',
			type: 'ai',
			content: `Perfekt! Lassen Sie uns Schritt für Schritt die Schaltung am Arbeitsplatz aufbauen.

**Bereiten Sie folgende Komponenten vor:**
- Arduino Leonardo
- Breadboard
- LED, Widerstand (220Ω), Potentiometer
- Jumper Cables

Ich werde Ihnen beim Aufbau helfen und jeden Schritt verfolgen...`,
			delayedSteps: [
				{
					id: 'workspace-prep',
					content: '🔌 **Schritt 1/7:** Arduino Leonardo mit USB-Kabel an Computer angeschlossen - Erkannt! ✅',
					delay: 2000
				},
				{
					id: 'breadboard-ready', 
					content: '🛠️ **Schritt 2/7:** Breadboard auf dem Arbeitsplatz bereitgestellt - Erkannt! ✅',
					delay: 4000
				},
				{
					id: 'led-placement',
					content: '💡 **Schritt 3/7:** LED in Breadboard eingesteckt (Anode längeres Bein) - Korrekt platziert! ✅',
					delay: 6000
				},
				{
					id: 'resistor-connection',
					content: '⚡ **Schritt 4/7:** 220Ω Widerstand zwischen LED-Kathode und GND-Rail - Verbindung hergestellt! ✅',
					delay: 8000
				},
				{
					id: 'potentiometer-placement',
					content: '🎛️ **Schritt 5/7:** Potentiometer in Breadboard eingesteckt - Position bestätigt! ✅',
					delay: 10000
				},
				{
					id: 'power-connections',
					content: '🔗 **Schritt 6/7:** Stromversorgung: 5V und GND vom Arduino zum Breadboard - Verbindungen aktiv! ✅',
					delay: 12000
				},
				{
					id: 'signal-connections',
					content: '📡 **Schritt 7/7:** Signal-Verbindungen: Pin 9 → LED, Pin A0 → Potentiometer - Alle Pins korrekt! ✅',
					delay: 14000
				},
				{
					id: 'circuit-complete',
					content: `🎉 **Hardware-Aufbau komplett!** 

Ich habe erkannt, dass Sie die Schaltung erfolgreich verbunden haben:
✅ Arduino Leonardo → Breadboard Stromversorgung
✅ LED + Widerstand → Pin 9 (PWM-Ausgang)  
✅ Potentiometer → Pin A0 (Analog-Eingang)
✅ Alle Ground-Verbindungen hergestellt

**Die Hardware ist bereit für die Programmierung!**`,
					delay: 16000
				}
			],
			nextSteps: ['start-code-tutorial'],
			showTutorialButton: false, // Wird erst nach den delayed steps angezeigt
			isCompleted: false
		},
		{
			id: 'start-code-tutorial',
			type: 'ai',
			content: `🎉 **Hardware-Aufbau erfolgreich abgeschlossen!**

Ihre LED-Dimmer Schaltung ist jetzt bereit. Alle Komponenten sind korrekt verkabelt:
- LED + Widerstand an Pin 9 (PWM)
- Potentiometer an Pin A0 (Analog)
- Stromversorgung korrekt angeschlossen

**Jetzt fehlt nur noch der Code!** 

Das Arduino benötigt die Software um die Hardware zu steuern. Sind Sie bereit für das interaktive Code-Tutorial?`,
			nextSteps: ['code-tutorial'],
			showTutorialButton: true,
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
	console.log('nextConversationStep called');
	currentConversation.update(conv => {
		if (conv && conv.currentStep < conv.steps.length - 1) {
			console.log(`Moving from step ${conv.currentStep} to ${conv.currentStep + 1}`);
			return {
				...conv,
				currentStep: conv.currentStep + 1
			};
		}
		console.log('Cannot move to next step');
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

// Navigation zwischen den verschiedenen Conversation Steps
export function jumpToStep(stepId: string) {
	currentConversation.update(conv => {
		if (conv) {
			const stepIndex = conv.steps.findIndex(step => step.id === stepId);
			if (stepIndex !== -1) {
				return {
					...conv,
					currentStep: stepIndex
				};
			}
		}
		return conv;
	});
}

// Button-Handler für Project-Buttons
export function handleProjectButton(action: string) {
	console.log('handleProjectButton called with action:', action);
	switch (action) {
		case 'continue':
		case 'continue-project':
			console.log('Calling nextConversationStep');
			nextConversationStep();
			break;
		case 'question':
		case 'ask-question':
			// Hier könnte ein Frage-Dialog implementiert werden
			console.log('User has a question about the project');
			break;
	}
}

// Button-Handler für Workspace-Buttons  
export function handleWorkspaceButton(action: string) {
	console.log('handleWorkspaceButton called with action:', action);
	switch (action) {
		case 'circuit-designer':
			// Wird von der Chat-Komponente direkt behandelt (switchToView)
			break;
		case 'real-table':
		case 'real-workspace':
			console.log('Jumping to real-workspace-steps');
			// Springe direkt zum real-workspace-steps Schritt
			currentConversation.update(conv => {
				if (conv) {
					const stepIndex = conv.steps.findIndex(step => step.id === 'real-workspace-steps');
					if (stepIndex !== -1) {
						conversationStep.set(stepIndex);
						return {
							...conv,
							currentStep: stepIndex
						};
					}
				}
				return conv;
			});
			break;
		case 'real-workspace-after-designer':
			nextConversationStep();
			break;
	}
}

// Store für Circuit Designer Status
export const circuitDesignerCompleted = writable<boolean>(false);

// Funktion um Circuit Designer Completion zu markieren
export function markCircuitDesignerCompleted() {
	circuitDesignerCompleted.set(true);
	// Springe direkt zum circuit-designer-path Schritt
	currentConversation.update(conv => {
		if (conv) {
			const stepIndex = conv.steps.findIndex(step => step.id === 'circuit-designer-path');
			if (stepIndex !== -1) {
				conversationStep.set(stepIndex);
				return {
					...conv,
					currentStep: stepIndex
				};
			}
		}
		return conv;
	});
}
