import { writable } from 'svelte/store';
import { activeView } from './sidebar';

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
			content: `Oh cool, that sounds fun! I actually have a great project idea for you.
			How about building a simple LED dimmer circuit? It’s a neat little setup where:

- A potentiometer controls the LED brightness,
- PWM (Pulse Width Modulation) lets you dim the LED smoothly,
- Everything connects through a breadboard, and
- A resistor protects the LED from too much current.

It’s a great beginner-friendly project that teaches you about analog input,
PWM output, and safe circuit design.
If you like the idea, press continue — otherwise,
feel free to ask me anything or suggest an alternative. I'm here to help!`,
			nextSteps: ['continue-project', 'ask-question'],
			showProjectButtons: true,
			isCompleted: false
		},
		{
			id: 'component-analysis',
			type: 'ai',
			content: `Perfect! For this LED dimmer project with an Arduino Leonardo, you will need the following components:

**Component List:**

🔸 **Arduino Leonardo (Keyestudio)** - The main controller
🔸 **Breadboard** - For the circuit assembly
🔸 **LED (Diode)** - The light-emitting diode to be dimmed
🔸 **Resistor** - Protection for the LED (220Ω recommended)
🔸 **Potentiometer** - For controlling the LED brightness
🔸 **Jumper Cables** - Connection cables for the circuit

**About the project:**
This circuit allows you to steplessly regulate the brightness of an LED using a potentiometer. The Arduino Leonardo reads the analog value of the potentiometer and converts it into a PWM signal that dims the LED accordingly.

**Where would you like to start building?**`,
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
			content: `Excellent! You have successfully built the circuit in the Circuit Designer! 🎉

All pin connections are correct:
✅ LED with protective resistor on Pin 9 (PWM)
✅ Potentiometer on Pin A0 (Analog Input)
✅ Correct power and ground connections

**Now you can proceed to the practical setup at your desk!**`,
			nextSteps: ['real-workspace-after-designer'],
			showRealTableButton: true, // Show "Let's build on the desk" button only
			isCompleted: false
		},
		{
			id: 'real-workspace-steps',
			type: 'ai',
			content: `Perfect! Let's build the circuit step by step at the workspace.

**Prepare the following components:**
- Arduino Leonardo
- Breadboard
- LED, Resistor (220Ω), Potentiometer
- Jumper Cables

I will help you with the assembly and follow every step...`,
			delayedSteps: [
				{
					id: 'workspace-prep',
					content: '🔌 **Step 1/7:** Arduino Leonardo connected to computer with USB cable - Detected! ✅',
					delay: 2000
				},
				{
					id: 'breadboard-ready',
					content: '🛠️ **Step 2/7:** Breadboard placed on the workspace - Detected! ✅',
					delay: 4000
				},
				{
					id: 'led-placement',
					content: '💡 **Step 3/7:** LED inserted into breadboard (anode is the longer leg) - Correctly placed! ✅',
					delay: 6000
				},
				{
					id: 'resistor-connection',
					content: '⚡ **Step 4/7:** 220Ω resistor between LED cathode and GND rail - Connection established! ✅',
					delay: 8000
				},
				{
					id: 'potentiometer-placement',
					content: '🎛️ **Step 5/7:** Potentiometer inserted into breadboard - Position confirmed! ✅',
					delay: 10000
				},
				{
					id: 'power-connections',
					content: '🔗 **Step 6/7:** Power supply: 5V and GND from Arduino to breadboard - Connections active! ✅',
					delay: 12000
				},
				{
					id: 'signal-connections',
					content: '📡 **Step 7/7:** Signal connections: Pin 9 → LED, Pin A0 → Potentiometer - All pins correct! ✅',
					delay: 14000
				},
				{
					id: 'circuit-complete',
					content: `🎉 **Hardware setup complete!**

I have detected that you have successfully connected the circuit:
✅ Arduino Leonardo → Breadboard power supply
✅ LED + Resistor → Pin 9 (PWM output)
✅ Potentiometer → Pin A0 (Analog input)
✅ All ground connections established

**The hardware is ready for programming!**`,
					delay: 16000
				}
			],
			nextSteps: ['start-code-tutorial'],
			showTutorialButton: false, // Will be shown after the delayed steps
			isCompleted: false
		},
		{
			id: 'start-code-tutorial',
			type: 'ai',
			content: `🎉 **Hardware setup successfully completed!**

Your LED dimmer circuit is now ready. All components are correctly wired:
- LED + Resistor on Pin 9 (PWM)
- Potentiometer on Pin A0 (Analog)
- Power supply correctly connected

**Now, only the code is missing!**

The Arduino needs the software to control the hardware. Are you ready for the interactive code tutorial?`,
			nextSteps: ['code-tutorial'],
			showTutorialButton: true,
			isCompleted: false
		}
	]
};

// Code Tutorial Steps for interactive IDE guide
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
		title: 'Step 1: Basic Structure & Comments',
		description: 'Let\'s start with the basic structure and documentation.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Control the brightness of an LED via a potentiometer

  Hardware:
  - Arduino Leonardo
  - LED on Pin 9 (PWM-capable)
  - Potentiometer on Pin A0
  - 220Ω resistor for LED
*/`,
		explanation: 'Good code always starts with documentation. Here we define what our project does and what hardware is used.'
	},
	{
		id: 'step-2-pins',
		title: 'Step 2: Pin Definitions',
		description: 'Now we define the hardware pins for our project.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Control the brightness of an LED via a potentiometer

  Hardware:
  - Arduino Leonardo
  - LED on Pin 9 (PWM-capable)
  - Potentiometer on Pin A0
  - 220Ω resistor for LED
*/

// Pin Definitions
const int potPin = A0;      // Potentiometer on Analog Pin A0
const int ledPin = 9;       // LED on Digital Pin 9 (PWM-capable)`,
		explanation: 'With const int, we define unchangeable constants for our pins. Pin 9 supports PWM (Pulse Width Modulation) for LED brightness control.'
	},
	{
		id: 'step-3-setup',
		title: 'Step 3: Setup Function',
		description: 'The setup() function runs once when the Arduino starts.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Control the brightness of an LED via a potentiometer

  Hardware:
  - Arduino Leonardo
  - LED on Pin 9 (PWM-capable)
  - Potentiometer on Pin A0
  - 220Ω resistor for LED
*/

// Pin Definitions
const int potPin = A0;      // Potentiometer on Analog Pin A0
const int ledPin = 9;       // LED on Digital Pin 9 (PWM-capable)

void setup() {
  // Start serial communication for debugging
  Serial.begin(9600);

  // Define LED pin as an output
  pinMode(ledPin, OUTPUT);

  // Potentiometer pin is automatically configured as an input
  Serial.println("Arduino Leonardo LED Dimmer started!");
}`,
		explanation: 'Serial.begin() starts the communication with the computer. pinMode() configures Pin 9 as an output for the LED. Analog pins are inputs by default.'
	},
	{
		id: 'step-4-loop-basic',
		title: 'Step 4: Basic Loop Structure',
		description: 'The loop() function runs endlessly and contains our main logic.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Control the brightness of an LED via a potentiometer

  Hardware:
  - Arduino Leonardo
  - LED on Pin 9 (PWM-capable)
  - Potentiometer on Pin A0
  - 220Ω resistor for LED
*/

// Pin Definitions
const int potPin = A0;      // Potentiometer on Analog Pin A0
const int ledPin = 9;       // LED on Digital Pin 9 (PWM-capable)

void setup() {
  // Start serial communication for debugging
  Serial.begin(9600);

  // Define LED pin as an output
  pinMode(ledPin, OUTPUT);

  // Potentiometer pin is automatically configured as an input
  Serial.println("Arduino Leonardo LED Dimmer started!");
}

void loop() {
  // Read potentiometer value (0-1023)
  int potValue = analogRead(potPin);

  // The logic comes here...
}`,
		explanation: 'analogRead() reads the analog value of the potentiometer. The value range is 0-1023 (10-bit resolution).'
	},
	{
		id: 'step-5-mapping',
		title: 'Step 5: Value Mapping for PWM',
		description: 'We convert the potentiometer value into PWM values for the LED.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Control the brightness of an LED via a potentiometer

  Hardware:
  - Arduino Leonardo
  - LED on Pin 9 (PWM-capable)
  - Potentiometer on Pin A0
  - 220Ω resistor for LED
*/

// Pin Definitions
const int potPin = A0;      // Potentiometer on Analog Pin A0
const int ledPin = 9;       // LED on Digital Pin 9 (PWM-capable)

void setup() {
  // Start serial communication for debugging
  Serial.begin(9600);

  // Define LED pin as an output
  pinMode(ledPin, OUTPUT);

  // Potentiometer pin is automatically configured as an input
  Serial.println("Arduino Leonardo LED Dimmer started!");
}

void loop() {
  // Read potentiometer value (0-1023)
  int potValue = analogRead(potPin);

  // Map value to PWM range (0-255)
  int brightness = map(potValue, 0, 1023, 0, 255);

  // Set LED brightness
  analogWrite(ledPin, brightness);
}`,
		explanation: 'map() converts the potentiometer range (0-1023) to the PWM range (0-255). analogWrite() controls the LED brightness via PWM.'
	},
	{
		id: 'step-6-debugging',
		title: 'Step 6: Debug Output & Timing',
		description: 'Let\'s add debug outputs and optimal timing.',
		code: `/*
  Arduino Leonardo LED Dimmer
  Control the brightness of an LED via a potentiometer

  Hardware:
  - Arduino Leonardo
  - LED on Pin 9 (PWM-capable)
  - Potentiometer on Pin A0
  - 220Ω resistor for LED
*/

// Pin Definitions
const int potPin = A0;      // Potentiometer on Analog Pin A0
const int ledPin = 9;       // LED on Digital Pin 9 (PWM-capable)

void setup() {
  // Start serial communication for debugging
  Serial.begin(9600);

  // Define LED pin as an output
  pinMode(ledPin, OUTPUT);

  // Potentiometer pin is automatically configured as an input
  Serial.println("Arduino Leonardo LED Dimmer started!");
}

void loop() {
  // Read potentiometer value (0-1023)
  int potValue = analogRead(potPin);

  // Map value to PWM range (0-255)
  int brightness = map(potValue, 0, 1023, 0, 255);

  // Set LED brightness
  analogWrite(ledPin, brightness);

  // Debug output
  Serial.print("Potentiometer: ");
  Serial.print(potValue);
  Serial.print(" | LED Brightness: ");
  Serial.println(brightness);

  // Short pause for stable values
  delay(50);
}`,
		explanation: 'Serial.print() displays the current values in the Serial Monitor. delay(50) ensures stable values and prevents spam in the output.'
	}
];

// Store for current conversation
export const currentConversation = writable<Conversation | null>(null);

// Store for Konversationsschritt
export const conversationStep = writable<number>(0);

// Store for current tutorial step
export const currentTutorialStep = writable<number>(0);
export const isTutorialActive = writable<boolean>(false);

// Helper functions
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

	// Keywords for LED Dimmer project
	const ledKeywords = ['led', 'diode', 'leuchtdiode'];
	const dimmerKeywords = [
		'dimmer',
		'helligkeit',
		'potentiometer',
		'brightness',
		'poti',
		'regulieren',
		'controller'
	];
	const projectKeywords = ['project', 'build', 'create', 'make', 'new'];

	const hasLed = ledKeywords.some(kw => lowerInput.includes(kw));
	const hasDimmer = dimmerKeywords.some(kw => lowerInput.includes(kw));
	const hasProject = projectKeywords.some(kw => lowerInput.includes(kw));

	// Trigger if it's clearly about a new LED project or a dimmer
	if (hasLed && (hasDimmer || hasProject || lowerInput.includes('leonardo'))) {
		return 'leonardo-led-dimmer';
	}

	return null;
}

// Helper functions for Tutorial
export function startCodeTutorial() {
	currentTutorialStep.set(0);
	isTutorialActive.set(true);
	activeView.set('code-editor'); // Switch view to code editor
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
