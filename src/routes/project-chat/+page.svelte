<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	import CircuitDiagram from '$lib/components/CircuitDiagram.svelte';
	import FullscreenCircuitDesigner from '$lib/components/FullscreenCircuitDesigner.svelte';
	import { currentProject, updateProjectCode, updateProjectName, addChatMessage, componentLibrary, type Component } from '$lib/stores/project';
	import { 
		currentConversation, 
		conversationStep, 
		startConversation, 
		nextConversationStep, 
		markStepCompleted,
		detectProjectType,
		startCodeTutorial,
		isTutorialActive,
		currentTutorialStep,
		leonardoCodeTutorial,
		nextTutorialStep,
		previousTutorialStep,
		finishTutorial,
		getCompleteTutorialCode,
		jumpToStep,
		handleProjectButton,
		handleWorkspaceButton,
		markCircuitDesignerCompleted,
		resetConversation
	} from '$lib/stores/conversations';
	
	type Message = {
		id: number;
		type: 'user' | 'ai' | 'system';
		content: string;
		timestamp: Date;
		codeGenerated?: string;
		componentSuggestions?: Array<{name: string, description: string, price?: string}>;
		componentImages?: string[];
		showTutorialButton?: boolean;
		showProjectButtons?: boolean;
		showWorkspaceButtons?: boolean;
		showRealTableButton?: boolean; // Neuer Button-Typ nur für "An den Tisch"
		showNextStepsButtons?: boolean;
		showCompletionButtons?: boolean; // Neue Button-Typ für "Neues Chat" / "Home"
		delayedSteps?: Array<{id: string, content: string, delay: number}>;
		stepId?: string;
	};
	
	// App state
	type ViewMode = 'chat' | 'designer' | 'code';
	let currentView: ViewMode = 'chat';
	
	let messages: Message[] = [];
	let currentInput = '';
	let isLoading = false;
	let messageId = 0;
	let chatHistory: string[] = [];
	let showExportModal = false;
	let isStructuredConversation = false;
	let tutorialComponents: string[] | undefined = undefined;
	let currentStepId = '';
	let delayedStepTimeouts: number[] = [];
	let delayedStepsStarted = false; // Prevent duplicate delayed steps
	
	// Subscribe to current project and conversation
	$: projectName = $currentProject.name;
	$: conversation = $currentConversation;
	$: currentStepIndex = $conversationStep;
	$: tutorialActive = $isTutorialActive;
	$: tutorialStepIndex = $currentTutorialStep;
	
	let tutorialWasActive = false;
	let tutorialCompleted = false;

	// Reactive statement um Tutorial Completion zu erkennen
	$: if (tutorialWasActive && !$isTutorialActive && !tutorialCompleted && currentView === 'chat' && !isStructuredConversation) {
		tutorialCompleted = true;
		// Add completion message after a short delay
		setTimeout(() => {
			addMessage('ai', `🎉 **Fantastisch! Code Tutorial erfolgreich abgeschlossen!** 

✅ **Der Arduino Code wurde erfolgreich hochgeladen**
✅ **Die LED sollte nun leuchten und auf das Potentiometer reagieren**
✅ **Ihr LED-Dimmer Projekt ist vollständig funktionsfähig!**

**Herzlichen Glückwunsch!** Sie haben erfolgreich:
- Die Hardware korrekt verkabelt
- Den Arduino Code verstanden und implementiert  
- Ein voll funktionsfähiges LED-Dimmer System erstellt

**Was möchten Sie als nächstes tun?**`, {
				showCompletionButtons: true
			});
		}, 1000);
	}

	// Track wenn Tutorial aktiv wird
	$: if ($isTutorialActive) {
		tutorialWasActive = true;
	}

	// Reactive statement für Conversation Updates
	$: if ($currentConversation && isStructuredConversation) {
		updateMessagesFromConversation();
	}
	
	// Zusätzliches reactive statement für Step-Änderungen
	$: if ($conversationStep !== undefined && $currentConversation && isStructuredConversation) {
		updateMessagesFromConversation();
	}

	// Navigation functions
	function switchToView(view: ViewMode) {
		currentView = view;
		if (view === 'designer') {
			tutorialComponents = ['leonardo-keyestudio', 'breadboard', 'leuchtdiode', 'widerstand', 'poti', 'jumpercable'];
		}
	}
	
	function goBackHome() {
		goto('/');
	}
	
	function exportCode() {
		showExportModal = true;
	}

	// Neue Funktionen für den Dialog-Flow
	function updateMessagesFromConversation() {
		if (!$currentConversation || !isStructuredConversation) return;
		
		// Additional safety check: if tutorial was completed, don't update
		if (tutorialCompleted) return;
		
		console.log('updateMessagesFromConversation called, currentStep:', $currentConversation.currentStep);
		
		// Clear delayed timeouts
		delayedStepTimeouts.forEach(timeout => clearTimeout(timeout));
		delayedStepTimeouts = [];
		
		// Reset delayed steps flag when reloading conversation, BUT only if we're not already in the delayed steps
		const hasDelayedMessages = messages.some(msg => msg.stepId?.startsWith('delayed-'));
		if (!hasDelayedMessages) {
			delayedStepsStarted = false;
		}
		
		// Keep user messages, remove AI messages from structured conversations
		messages = messages.filter(msg => msg.type === 'user');
		
		const conversation = $currentConversation;
		
		// Zeige alle Schritte bis zum aktuellen Schritt
		for (let i = 0; i <= conversation.currentStep; i++) {
			const step = conversation.steps[i];
			if (step) {
				console.log(`Adding step ${i}: ${step.id}`);
				const message: Message = {
					id: ++messageId,
					type: step.type as 'user' | 'ai' | 'system',
					content: step.content,
					timestamp: new Date(),
					componentImages: step.componentImages,
					showProjectButtons: step.showProjectButtons && !step.isCompleted,
					showWorkspaceButtons: step.showWorkspaceButtons && !step.isCompleted,
					showRealTableButton: step.showRealTableButton && !step.isCompleted,
					showTutorialButton: step.showTutorialButton && !step.isCompleted,
					stepId: step.id
				};
				
				// Always add the message (we already filtered out AI messages above)
				messages.push(message);
				
				currentStepId = step.id;
				
				// Handle delayed steps - aktiviere sie wenn der Schritt gerade erreicht wurde
				if (step.delayedSteps && step.id === 'real-workspace-steps' && i === conversation.currentStep && !delayedStepsStarted) {
					console.log('Starting delayed steps for real-workspace-steps');
					delayedStepsStarted = true; // Mark as started to prevent duplicates
					step.delayedSteps.forEach((delayedStep, index) => {
						const timeout = setTimeout(() => {
							const delayedMessage: Message = {
								id: ++messageId,
								type: 'ai',
								content: delayedStep.content,
								timestamp: new Date(),
								stepId: `delayed-${delayedStep.id}`
							};
							messages = [...messages, delayedMessage];
							
							// Nach dem allerletzten delayed step zeige Tutorial Button
							if (index === step.delayedSteps!.length - 1) {
								setTimeout(() => {
									// Separate Message mit Tutorial Button
									const tutorialMessage: Message = {
										id: ++messageId,
										type: 'ai',
										content: 'Möchten Sie jetzt mit dem Code Tutorial beginnen?',
										timestamp: new Date(),
										showTutorialButton: true,
										stepId: 'tutorial-prompt'
									};
									messages = [...messages, tutorialMessage];
								}, 2000);
							}
						}, delayedStep.delay);
						delayedStepTimeouts.push(timeout);
					});
				}
			}
		}
		
		// Trigger reactivity
		messages = [...messages];
	}

	// Button-Handler
	function onProjectButton(action: string) {
		console.log('onProjectButton called with action:', action);
		if (currentStepId) {
			markStepCompleted(currentStepId);
		}
		handleProjectButton(action);
		
		// Force update after a short delay
		setTimeout(() => {
			updateMessagesFromConversation();
		}, 100);
	}

	function onWorkspaceButton(action: string) {
		console.log('onWorkspaceButton called with action:', action);
		if (currentStepId) {
			markStepCompleted(currentStepId);
		}
		
		if (action === 'circuit-designer') {
			switchToView('designer');
		} else if (action === 'real-table') {
			// Für "An den Tisch" springen wir direkt zu real-workspace-steps
			handleWorkspaceButton(action);
			
			// Force update after a short delay
			setTimeout(() => {
				updateMessagesFromConversation();
			}, 100);
		} else {
			handleWorkspaceButton(action);
			
			// Force update after a short delay
			setTimeout(() => {
				updateMessagesFromConversation();
			}, 100);
		}
	}

	function onTutorialButton() {
		if (currentStepId) {
			markStepCompleted(currentStepId);
		}
		switchToView('code');
		startCodeTutorial();
	}

	// Completion Button Handler
	function onCompletionButton(action: string) {
		if (action === 'new-chat') {
			// Reset alles und starte neuen Chat
			tutorialCompleted = false;
			tutorialWasActive = false;
			isStructuredConversation = false;
			delayedStepsStarted = false; // Reset delayed steps flag
			resetConversation();
			messages = [];
			messageId = 0;
			// Clear any remaining timeouts
			delayedStepTimeouts.forEach(timeout => clearTimeout(timeout));
			delayedStepTimeouts = [];
			addMessage('ai', "Willkommen zurück bei Circuitspace! Beschreiben Sie Ihr nächstes Projekt und ich helfe Ihnen beim Design und der Implementierung.");
		} else if (action === 'go-home') {
			// Zurück zur Startseite
			goBackHome();
		}
	}

	// Circuit Designer Handler
	function onCircuitDesignerComplete() {
		markCircuitDesignerCompleted();
		switchToView('chat');
	}

	function onCircuitDesignerClose() {
		switchToView('chat');
	}

	// Tutorial completion function
	function completeTutorial() {
		// Get the complete tutorial code
		const completeCode = getCompleteTutorialCode();
		
		// Update the project with tutorial info
		updateProjectCode(completeCode);
		updateProjectName('Arduino Leonardo LED Dimmer');
		copyCodeToEditor(completeCode);
		
		// Add final message about next steps
		addMessage('ai', `✅ Perfekt! Der komplette Arduino Leonardo LED Dimmer Code wurde erfolgreich in die IDE geladen.

**Was wurde implementiert:**
- Pin-Definitionen für Potentiometer und LED
- Setup-Funktion mit serieller Kommunikation
- Loop mit analogem Einlesen und PWM-Steuerung
- Debug-Ausgabe und optimales Timing

**Nächste Schritte:**
Jetzt sind wir bereit für die praktische Umsetzung! Möchten Sie:

🔹 **Circuit Designer** - Die Schaltung hier virtuell aufbauen und testen
🔹 **Realer Tisch** - Direkt zur physischen Umsetzung am Arbeitsplatz wechseln

Wie möchten Sie fortfahren?`, {
			showNextStepsButtons: true
		});
		
		// Finish tutorial mode AFTER updating code
		finishTutorial();
		
		// Force update of CodeEditor after a brief delay to ensure store is updated
		setTimeout(() => {
			const event = new CustomEvent('updateCode', { detail: completeCode });
			window.dispatchEvent(event);
		}, 100);
	}

	// Upload Code function - direkt completion ohne conversation flow
	function uploadCodeAndComplete() {
		console.log('uploadCodeAndComplete called'); // Debug log
		
		// Get the current code from editor (or complete tutorial code if in tutorial)
		const completeCode = tutorialActive ? getCompleteTutorialCode() : $currentProject.code;
		
		// Update the project 
		updateProjectCode(completeCode);
		updateProjectName('Arduino Leonardo LED Dimmer');
		
		// Finish tutorial if active
		if (tutorialActive) {
			console.log('Finishing tutorial'); // Debug log
			finishTutorial();
		}
		
		// Mark tutorial as completed to prevent re-triggering
		tutorialCompleted = true;
		
		// COMPLETE SHUTDOWN OF STRUCTURED CONVERSATION
		isStructuredConversation = false;
		delayedStepsStarted = true; // Prevent any future delayed steps
		
		// Clear any remaining timeouts
		delayedStepTimeouts.forEach(timeout => clearTimeout(timeout));
		delayedStepTimeouts = [];
		
		// Reset conversation completely
		resetConversation();
		
		// REMOVE DELAYED MESSAGES AND TUTORIAL-RELATED MESSAGES - keep all other messages
		messages = messages.filter(msg => 
			!msg.stepId?.startsWith('delayed-') && 
			!msg.stepId?.includes('tutorial') &&
			!(msg.content.includes('Circuit Designer') && msg.content.includes('Realer Tisch')) &&
			!msg.content.includes('Code Tutorial erfolgreich abgeschlossen') &&
			!msg.content.includes('Was wurde implementiert') &&
			!msg.content.includes('Nächste Schritte')
		);
		
		console.log('Switching to chat view'); // Debug log
		// Switch back to chat
		currentView = 'chat'; // Direct assignment instead of function call
		
		// Add completion message directly without triggering conversation flow
		setTimeout(() => {
			console.log('Adding completion message'); // Debug log
			addMessage('ai', `🎉 **Code erfolgreich hochgeladen!**

✅ **Der Arduino Leonardo LED Dimmer Code wurde auf das Board übertragen**
✅ **Die LED sollte nun funktionieren und auf das Potentiometer reagieren**
✅ **Ihr Projekt ist vollständig einsatzbereit!**

**Herzlichen Glückwunsch!** Das Projekt wurde erfolgreich abgeschlossen:
- ✅ Hardware korrekt verkabelt
- ✅ Code programmiert und hochgeladen
- ✅ System getestet und funktionsfähig

**Was möchten Sie als nächstes tun?**`, {
				showCompletionButtons: true
			});
		}, 500);
	}

	// Existing functions (simplified versions)
	function addMessage(type: 'user' | 'ai' | 'system', content: string, options?: Partial<Message>) {
		const message: Message = {
			id: ++messageId,
			type,
			content,
			timestamp: new Date(),
			...options
		};
		
		messages = [...messages, message];
		
		// Auto-scroll to bottom
		setTimeout(() => {
			const chatContainer = document.querySelector('.chat-messages');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
		
		return message;
	}
	
	onMount(() => {
		console.log('onMount called');
		// Check if there's an initial prompt from the URL
		const initialPrompt = $page.url.searchParams.get('prompt');
		if (initialPrompt) {
			console.log('Initial prompt found:', initialPrompt);
			// Check if this is a structured conversation
			const projectType = detectProjectType(initialPrompt);
			if (projectType) {
				console.log('Project type detected:', projectType);
				isStructuredConversation = true;
				startConversation(projectType);
				
				// Add user message
				addMessage('user', initialPrompt);
				
				// Force initial conversation update after a short delay
				setTimeout(() => {
					console.log('Forcing initial conversation update');
					updateMessagesFromConversation();
				}, 100);
			} else {
				// Normal conversation
				addMessage('user', initialPrompt);
				generateAIResponse(initialPrompt);
			}
		} else {
			// Default welcome message
			addMessage('ai', "Willkommen bei Circuitspace! Beschreiben Sie Ihr Projekt und ich helfe Ihnen beim Design und der Implementierung.");
		}
	});
		function generateAIResponse(userMessage: string) {
		const lowercaseMessage = userMessage.toLowerCase();
		let response = '';
		let codeGenerated = '';
		let componentSuggestions: Array<{name: string, description: string, price?: string}> = [];
		
		if (lowercaseMessage.includes('component') || lowercaseMessage.includes('part') || lowercaseMessage.includes('buy')) {
			response = "For an LED controller project, I'd recommend these components:\n\n• **Arduino Uno** - Main microcontroller ($25)\n• **LED Strip (WS2812B)** - Addressable RGB LEDs ($15)\n• **Potentiometer** - For brightness control ($2)\n• **Push Buttons** - Mode switching ($3)\n• **Breadboard & Jumper Wires** - Prototyping ($8)\n\nWould you like me to generate the Arduino code for this setup?";
			// Get relevant components from library
			const relevantComponents = componentLibrary.slice(0, 3).map(comp => ({
				name: comp.name,
				description: comp.description,
				price: comp.price
			}));
			componentSuggestions = relevantComponents;
		} else if (lowercaseMessage.includes('code') || lowercaseMessage.includes('program') || lowercaseMessage.includes('sketch')) {
			response = "Here's a basic Arduino sketch for your LED controller:\n\n```cpp\n#include <FastLED.h>\n\n#define LED_PIN 6\n#define NUM_LEDS 30\n#define BRIGHTNESS 100\n\nCRGB leds[NUM_LEDS];\n\nvoid setup() {\n  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);\n  FastLED.setBrightness(BRIGHTNESS);\n}\n\nvoid loop() {\n  // Rainbow effect\n  for(int i = 0; i < NUM_LEDS; i++) {\n    leds[i] = CHSV(i * 8, 255, 255);\n  }\n  FastLED.show();\n  delay(50);\n}\n```\n\nThis creates a rainbow effect. Would you like me to add button controls or other features?";
			codeGenerated = `#include <FastLED.h>

#define LED_PIN 6
#define NUM_LEDS 30
CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(100);
}

void loop() {
  // Your code here
  FastLED.show();
  delay(50);
}`;
		} else if (lowercaseMessage.includes('circuit') || lowercaseMessage.includes('diagram') || lowercaseMessage.includes('connection') || lowercaseMessage.includes('wiring')) {
			response = "I can help you design the circuit layout! **Switch to 'Circuit Designer'** to open the interactive circuit diagram. There you can:\n\n• **Drag and drop components** onto the canvas\n• **Auto-generate connections** between components\n• **Export your circuit design** as an image\n• **Switch back to other views** anytime\n\nWould you like me to suggest which components to add for your specific project?";
			
			// Auto-switch to circuit designer view after a short delay
			setTimeout(() => {
				switchToView('designer');
			}, 2000);
		} else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('start')) {
			response = "I'm here to help you with your circuit projects! I can assist with:\n\n• **Component Selection** - Find the right parts for your project\n• **Circuit Design** - Plan connections and power requirements with interactive diagrams\n• **Code Generation** - Arduino sketches and programming\n• **Troubleshooting** - Debug hardware and software issues\n• **Project Ideas** - Inspiration for new builds\n\n💡 **Tip**: Use the sidebar to switch between different views!\n\nWhat would you like to work on today?";
		} else {
			response = "I understand you're working on a circuit project. Could you tell me more about what you'd like to build? I can help with component selection, circuit design, or Arduino programming.";
		}
		
		addMessage('ai', response, { codeGenerated, componentSuggestions });
	}
	
	function handleSendMessage(message: string) {
		if (!message.trim()) return;
		
		addMessage('user', message);
		currentInput = '';
		chatHistory.push(message);
		
		// Save message to project store
		addChatMessage({
			id: messageId - 1,
			type: 'user',
			content: message,
			timestamp: new Date()
		});
		
		// Handle structured conversation vs normal AI response
		if (isStructuredConversation && conversation) {
			// In structured conversations, user input is typically not processed
			// The flow is controlled by buttons and conversation steps
			isLoading = true;
			setTimeout(() => {
				isLoading = false;
				addMessage('ai', 'In der strukturierten Unterhaltung verwenden Sie bitte die Buttons, um fortzufahren.');
			}, 1000);
		} else {
			// Normal AI response
			isLoading = true;
			setTimeout(() => {
				isLoading = false;
				generateAIResponse(message);
			}, 1000 + Math.random() * 1000);
		}
	}
	
	function copyCodeToEditor(code: string) {
		// Update the project store with new code
		updateProjectCode(code);
		// Dispatch event to CodeEditor component
		const event = new CustomEvent('updateCode', { detail: code });
		window.dispatchEvent(event);
	}
	
	function exportChat() {
		showExportModal = true;
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
	<!-- Sidebar Navigation -->
	<Sidebar />

	<!-- Main Content Area -->
	<main class="main-content">
		<!-- Circuit Chat View -->
		{#if currentView === 'chat'}
			<div class="chat-view">
				<!-- Chat Header -->
				<header class="view-header">
					<div class="header-left">
						<h1>Circuit Chat</h1>
						<p>AI-powered circuit design assistant</p>
					</div>
					<div class="header-actions">
						<button class="action-btn secondary" on:click={exportChat}>
							Export Chat
						</button>
					</div>
				</header>

				<!-- Messages Area -->
				<div class="chat-messages">
					<div class="chat-container">
						{#each messages as message (message.id)}
							<div class="message {message.type}">
								<div class="message-content">
								<div class="message-text">
									{@html message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
								</div>
								
								{#if message.componentImages && message.componentImages.length > 0}
									<div class="component-images">
										<h4>Benötigte Komponenten:</h4>
										<div class="images-grid">
											{#each message.componentImages as imagePath}
												<div class="component-image">
													<img src={imagePath} alt="Component" />
												</div>
											{/each}
										</div>
									</div>
								{/if}
								
								{#if message.componentSuggestions && message.componentSuggestions.length > 0}
									<div class="component-suggestions">
										<h4>Recommended Components:</h4>
										<div class="component-grid">
											{#each message.componentSuggestions as component}
												<div class="component-card">
													<h5>{component.name}</h5>
													<p>{component.description}</p>
													{#if component.price}
														<span class="price">{component.price}</span>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}
								
								{#if message.codeGenerated}
									<div class="code-block">
										<div class="code-header">
											<span>Generated Arduino Code</span>
											<button class="copy-code-btn" on:click={() => copyCodeToEditor(message.codeGenerated || '')}>
												Copy to Editor
											</button>
										</div>
										<pre><code>{message.codeGenerated}</code></pre>
									</div>
								{/if}
								
								{#if message.showTutorialButton}
									<div class="tutorial-button-container">
										<button class="tutorial-start-btn" on:click={onTutorialButton}>
											💻 Code Tutorial starten
										</button>
									</div>
								{/if}
								
								{#if message.showProjectButtons}
									<div class="project-buttons-container">
										<button class="project-btn continue" on:click={() => onProjectButton('continue')}>
											Weiter
										</button>
										<button class="project-btn question" on:click={() => onProjectButton('question')}>
											Frage
										</button>
									</div>
								{/if}
								
								{#if message.showWorkspaceButtons}
									<div class="workspace-buttons-container">
										<button class="workspace-btn circuit-designer" on:click={() => onWorkspaceButton('circuit-designer')}>
											Circuit Designer
										</button>
										<button class="workspace-btn real-table" on:click={() => onWorkspaceButton('real-table')}>
											An den Tisch
										</button>
									</div>
								{/if}
								
								{#if message.showRealTableButton}
									<div class="real-table-button-container">
										<button class="real-table-btn" on:click={() => onWorkspaceButton('real-workspace-after-designer')}>
											An den Tisch
										</button>
									</div>
								{/if}
								
								{#if message.showNextStepsButtons}
									<div class="next-steps-container">
										<button class="next-step-btn circuit" on:click={() => switchToView('designer')}>
											⚡ Circuit Designer
										</button>
										<button class="next-step-btn real-table" on:click={() => addMessage('ai', 'Perfekt! Gehen Sie zu Ihrem realen Arbeitsplatz und bauen Sie die Schaltung physisch auf.')}>
											🔧 Realer Tisch
										</button>
									</div>
								{/if}
								
								{#if message.showCompletionButtons}
									<div class="completion-buttons-container">
										<button class="completion-btn new-chat" on:click={() => onCompletionButton('new-chat')}>
											💬 Neues Chat
										</button>
										<button class="completion-btn go-home" on:click={() => onCompletionButton('go-home')}>
											🏠 Zur Startseite
										</button>
									</div>
								{/if}
								
								<div class="message-timestamp">
									{message.timestamp.toLocaleTimeString()}
								</div>
							</div>
						</div>
					{/each}
					
					{#if isLoading}
						<div class="message ai">
							<div class="message-content">
								<div class="typing-indicator">
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						</div>
					{/if}
					</div>
				</div>
				
				<!-- Input Area -->
				<div class="chat-input">
					<div class="chat-container">
						<div class="modern-input-container">
							<div class="modern-input-wrapper">
								<textarea 
									bind:value={currentInput}
									on:keydown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage(currentInput);
										}
									}}
									placeholder={isStructuredConversation ? "Strukturierte Konversation läuft..." : "Describe your circuit requirements, ask questions, or request component suggestions..."}
									class="modern-chat-input"
									rows="1"
									disabled={isLoading || (isStructuredConversation && tutorialActive)}
								></textarea>
								<div class="modern-input-actions">
									<div class="left-actions">
										<button class="modern-search-button" title="Search" aria-label="Search">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<circle cx="11" cy="11" r="8"></circle>
												<path d="m21 21-4.35-4.35"></path>
											</svg>
										</button>
									</div>
									<div class="right-actions">
										<button class="modern-attachment-button" title="Attach file" aria-label="Attach file">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
											</svg>
										</button>
										<button class="modern-mic-button" title="Voice input" aria-label="Voice input">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
												<path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
												<line x1="12" y1="19" x2="12" y2="23"></line>
												<line x1="8" y1="23" x2="16" y2="23"></line>
											</svg>
										</button>
										<button 
											class="modern-send-button" 
											class:loading={isLoading}
											on:click={() => handleSendMessage(currentInput)}
											disabled={!currentInput.trim() || isLoading || (isStructuredConversation && tutorialActive)}
											title="Send"
										>
											{#if isLoading}
												<span class="modern-button-spinner"></span>
											{:else}
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<line x1="22" y1="2" x2="11" y2="13"></line>
													<polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
												</svg>
											{/if}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Circuit Designer View -->
		{#if currentView === 'designer'}
			<div class="designer-view">
				<FullscreenCircuitDesigner 
					{tutorialComponents} 
					on:exit={onCircuitDesignerClose}
					on:complete={onCircuitDesignerComplete}
				/>
			</div>
		{/if}

		<!-- Circuit Code View -->
		{#if currentView === 'code'}
			<div class="code-view">
				<!-- Code Header -->
				<header class="view-header">
					<div class="header-left">
						<h1>Circuit Code</h1>
						<p>Arduino IDE Environment</p>
					</div>
					<div class="header-actions">
						<button class="action-btn" on:click={() => switchToView('chat')}>
							💬 Back to Chat
						</button>
						{#if tutorialActive}
							<button class="action-btn tutorial" on:click={completeTutorial}>
								Finish Tutorial
							</button>
						{/if}
					</div>
				</header>

				<!-- Code Content -->
				{#if tutorialActive}
					<!-- Tutorial Mode -->
					<div class="tutorial-code-container">
						<div class="tutorial-sidebar">
							<div class="tutorial-header">
								<h3>Code Tutorial</h3>
								<p class="tutorial-description">Schritt-für-Schritt Arduino Programmierung</p>
								<div class="tutorial-progress">
									Schritt {tutorialStepIndex + 1} von {leonardoCodeTutorial.length}
								</div>
							</div>
							
							<div class="tutorial-content">
								<div class="tutorial-step">
									<h4>{leonardoCodeTutorial[tutorialStepIndex]?.title}</h4>
									<p class="step-description">{leonardoCodeTutorial[tutorialStepIndex]?.description}</p>
									<div class="step-explanation">
										{leonardoCodeTutorial[tutorialStepIndex]?.explanation}
									</div>
								</div>
								
								<div class="tutorial-navigation">
									<button 
										class="nav-btn prev"
										on:click={previousTutorialStep}
										disabled={tutorialStepIndex === 0}
									>
										← Zurück
									</button>
									
									{#if tutorialStepIndex < leonardoCodeTutorial.length - 1}
										<button 
											class="nav-btn next"
											on:click={nextTutorialStep}
										>
											Weiter →
										</button>
									{:else}
										<button 
											class="nav-btn finish"
											on:click={completeTutorial}
										>
											Tutorial beenden
										</button>
									{/if}
								</div>
							</div>
						</div>
						
						<div class="code-editor-area">
							<CodeEditor 
								tutorialCode={leonardoCodeTutorial[tutorialStepIndex]?.code} 
								isInTutorialMode={true}
								on:uploadComplete={uploadCodeAndComplete}
							/>
						</div>
					</div>
				{:else}
					<!-- Normal Code Editor -->
					<div class="code-editor-container">
						<CodeEditor on:uploadComplete={uploadCodeAndComplete} />
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>

<!-- Export Modal -->
<ExportModal bind:isOpen={showExportModal} />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', sans-serif;
		background: #191919;
		color: rgba(255, 255, 255, 0.9);
		overflow: hidden;
		min-height: 100vh;
	}
	
	:global(body::before) {
		display: none;
	}
	
	.app-container {
		display: flex;
		height: 100vh;
		width: 100vw;
	}
	
	/* Main Content Area */
	.main-content {
		margin-left: 280px;
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #191919;
		min-height: 0;
		overflow: hidden;
	}
	
	.main-content::before {
		content: '';
		position: absolute;
		top: 0;
		left: 280px;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(90deg, rgba(37, 37, 37, 1) 1px, transparent 1px);
		background-size: 10% 100%;
		background-repeat: repeat-x;
		pointer-events: none;
		z-index: -1;
	}
	
	/* View Headers */
	.view-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		background: #191919;
		flex-shrink: 0;
		position: relative;
		overflow: hidden;
	}
	
	.view-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(90deg, rgba(37, 37, 37, 0.3) 1px, transparent 1px);
		background-size: 8% 100%;
		background-repeat: repeat-x;
		pointer-events: none;
		z-index: 0;
	}
	
	.view-header > * {
		position: relative;
		z-index: 1;
	}
	
	.header-left {
		max-width: 800px;
		margin: 0 auto;
		flex: 1;
	}
	
	.header-actions {
		position: absolute;
		right: 2rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: 1rem;
	}
	
	.view-header h1 {
		font-family: 'Inter', sans-serif;
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0;
		color: #FFFFFF;
	}
	
	.view-header p {
		font-size: 0.9rem;
		margin: 0.25rem 0 0 0;
		color: rgba(255, 255, 255, 0.7);
	}
	
	.action-btn {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 6px;
		color: #FFFFFF;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}
	
	.action-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}
	
	.action-btn.secondary {
		background: rgba(37, 37, 37, 0.5);
		border-color: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.7);
	}
	
	.action-btn.secondary:hover {
		background: rgba(37, 37, 37, 0.8);
		border-color: rgba(255, 255, 255, 0.3);
		color: #FFFFFF;
	}
	
	.action-btn.tutorial {
		background: linear-gradient(135deg, rgba(120, 119, 198, 1), rgba(255, 119, 198, 1));
		color: #FFFFFF;
		border-color: transparent;
	}
	
	.action-btn.tutorial:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(120, 119, 198, 0.3);
	}
	
	/* Chat View */
	.chat-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
		background: #191919;
	}
	
	.chat-view::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(90deg, rgba(37, 37, 37, 0.3) 1px, transparent 1px),
			linear-gradient(rgba(37, 37, 37, 0.25) 1px, transparent 1px);
		background-size: 8% 100%, 100% 10%;
		background-repeat: repeat-x, repeat-y;
		pointer-events: none;
		z-index: 0;
	}
	
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 100%;
		position: relative;
		z-index: 1;
		/* margin: 0 auto; */
	}
	
	.chat-container {
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
		padding: 0 1rem;
		position: relative;
		z-index: 1;
	}
	
	.message {
		display: flex;
		width: 100%;
		margin-bottom: 1.5rem;
	}
	
	.message.user {
		justify-content: flex-end;
	}
	
	.message.ai, .message.system {
		justify-content: flex-start;
	}
	
	.message-content {
		flex: 1;
		min-width: 0;
		margin-bottom: 16px;
	}
	
	.message.user .message-content {
		max-width: 70%;
	}
	
	.message.ai .message-content,
	.message.system .message-content {
		max-width: 100%;
	}
	
	.message-text {
		padding: 1rem 1.25rem;
		border-radius: 16px;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.message.user .message-text {
		background: rgba(120, 119, 198, 0.2);
		border: 1px solid rgba(120, 119, 198, 0.3);
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
	}
	
	.message.ai .message-text,
	.message.system .message-text {
		background: transparent;
		border: none;
		padding: 0;
	}
	
	/* Chat Input */
	.chat-input {
		flex-shrink: 0;
		padding: 1rem 2rem 2rem 2rem;
		background: #191919;
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	/* Modern Input Design */
	.modern-input-container {
		position: relative;
		max-width: 800px;
		margin: 0 auto;
	}
	
	.modern-input-wrapper {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1rem;
		position: relative;
		backdrop-filter: blur(20px);
		transition: all 0.3s ease;
	}
	
	.modern-input-wrapper:focus-within {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
	}
	
	.modern-chat-input {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		color: #FFFFFF;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		resize: none;
		margin-bottom: 1rem;
		min-height: 2.5rem;
		max-height: 200px;
		line-height: 1.5;
	}
	
	.modern-chat-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	
	.modern-chat-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.modern-input-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.left-actions, .right-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	
	.modern-search-button, .modern-attachment-button, .modern-mic-button {
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		color: #CABDF5;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.modern-search-button:hover, .modern-attachment-button:hover, .modern-mic-button:hover {
		background: rgba(202, 189, 245, 0.1);
		color: #FFFFFF;
	}
	
	.modern-send-button {
		width: 40px;
		height: 40px;
		border: none;
		background: #EDF760;
		color: #000000;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.modern-send-button:hover:not(:disabled) {
		background: #F0FA70;
		transform: scale(1.05);
	}
	
	.modern-send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.modern-send-button.loading {
		background: rgba(237, 247, 96, 0.7);
	}
	
	.modern-button-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(0, 0, 0, 0.3);
		border-top: 2px solid #000000;
		border-radius: 50%;
		animation: modernSpin 1s linear infinite;
	}
	
	@keyframes modernSpin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.chat-input :global(.chat-container) {
		max-width: 800px;
		margin: 0 auto;
		padding: 0;
	}
	
	/* Component Suggestions */
	.component-suggestions {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.component-suggestions h4 {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: rgba(120, 119, 198, 1);
	}
	
	.component-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
	
	.component-card {
		background: rgba(37, 37, 37, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 1rem;
		transition: all 0.3s ease;
		cursor: pointer;
	}
	
	.component-card:hover {
		border-color: rgba(120, 119, 198, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(120, 119, 198, 0.2);
	}
	
	.component-card h5 {
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #FFFFFF;
	}
	
	.component-card p {
		font-size: 0.85rem;
		margin: 0 0 0.75rem 0;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.4;
	}
	
	.component-card .price {
		display: inline-block;
		background: rgba(120, 119, 198, 0.2);
		color: rgba(120, 119, 198, 1);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
	}
	
	/* Code Block */
	.code-block {
		margin-top: 1rem;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}
	
	.code-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: rgba(120, 119, 198, 0.1);
		border-bottom: 1px solid rgba(120, 119, 198, 0.2);
	}
	
	.code-header span {
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		color: rgba(120, 119, 198, 1);
		font-size: 0.9rem;
	}
	
	.copy-code-btn {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgba(120, 119, 198, 1), rgba(255, 119, 198, 1));
		border: none;
		border-radius: 6px;
		color: #FFFFFF;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.85rem;
		transition: all 0.3s ease;
	}
	
	.copy-code-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(120, 119, 198, 0.3);
	}
	
	.code-block pre {
		margin: 0;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.6);
		overflow-x: auto;
	}
	
	.code-block code {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.message-timestamp {
		font-size: 0.75rem;
		opacity: 0.5;
		margin-top: 0.5rem;
		text-align: right;
	}
	
	.message.ai .message-timestamp,
	.message.system .message-timestamp {
		text-align: left;
	}
	
	/* Typing Indicator */
	.typing-indicator {
		background: transparent;
		padding: 1rem 0;
		border-radius: 16px;
		display: flex;
		gap: 4px;
		align-items: center;
	}
	
	.typing-indicator span {
		width: 8px;
		height: 8px;
		background: rgba(120, 119, 198, 1);
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out;
	}
	
	.typing-indicator span:nth-child(2) {
		animation-delay: 0.2s;
	}
	
	.typing-indicator span:nth-child(3) {
		animation-delay: 0.4s;
	}
	
	/* Component Images */
	.component-images {
		margin-top: 1rem;
		padding: 1rem;
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
		border-radius: 12px;
	}
	
	.component-images h4 {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: rgba(120, 119, 198, 1);
	}
	
	.images-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: flex-start;
	}
	
	.component-image {
		/* background: rgba(37, 37, 37, 0.8); */
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.5rem;
		transition: all 0.3s ease;
		cursor: pointer;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.component-image:hover {
		border-color: rgba(120, 119, 198, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(120, 119, 198, 0.2);
	}
	
	.component-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 4px;
		mix-blend-mode: multiply;
		filter: brightness(1.2) contrast(1.1);
	}
	
	/* Tutorial Button */
	.tutorial-button-container {
		margin-top: 1rem;
		text-align: center;
	}
	
	.tutorial-start-btn {
		padding: 1rem 2rem;
		background: linear-gradient(135deg, rgba(120, 119, 198, 1), rgba(255, 119, 198, 1));
		border: none;
		border-radius: 12px;
		color: #FFFFFF;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(120, 119, 198, 0.3);
	}
	
	.tutorial-start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(120, 119, 198, 0.4);
	}
	
	/* Project Buttons */
	.project-buttons-container {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.project-btn {
		padding: 0.875rem 1.5rem;
		border: 2px solid;
		border-radius: 10px;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.95rem;
		transition: all 0.3s ease;
		min-width: 120px;
	}
	
	.project-btn.continue {
		background: rgba(237, 247, 96, 0.1);
		border-color: rgba(237, 247, 96, 0.5);
		color: #EDF760;
	}
	
	.project-btn.question {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.5);
		color: #CABDF5;
	}
	
	.project-btn:hover {
		transform: translateY(-2px);
	}
	
	.project-btn.continue:hover {
		background: #EDF760;
		border-color: #EDF760;
		color: #191919;
	}
	
	.project-btn.question:hover {
		background: #CABDF5;
		border-color: #CABDF5;
		color: #191919;
	}
	
	/* Workspace Buttons */
	.workspace-buttons-container {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.workspace-btn {
		padding: 1rem 1.5rem;
		border: 2px solid;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		min-width: 180px;
	}
	
	.workspace-btn.circuit-designer {
		background: rgba(237, 247, 96, 0.1);
		border-color: rgba(237, 247, 96, 0.5);
		color: #EDF760;
	}
	
	.workspace-btn.real-table {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.5);
		color: #CABDF5;
	}
	
	.workspace-btn:hover {
		transform: translateY(-2px);
	}
	
	.workspace-btn.circuit-designer:hover {
		background: #EDF760;
		border-color: #EDF760;
		color: #191919;
	}
	
	.workspace-btn.real-table:hover {
		background: #CABDF5;
		border-color: #CABDF5;
		color: #191919;
	}
	
	/* Real Table Button (nach Circuit Designer) */
	.real-table-button-container {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
	}
	
	.real-table-btn {
		padding: 1rem 2rem;
		background: rgba(202, 189, 245, 0.1);
		border: 2px solid rgba(202, 189, 245, 0.5);
		border-radius: 12px;
		color: #CABDF5;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		min-width: 200px;
	}
	
	.real-table-btn:hover {
		transform: translateY(-2px);
		background: #CABDF5;
		border-color: #CABDF5;
		color: #191919;
	}
	
	/* Next Steps Buttons */
	.next-steps-container {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.next-step-btn {
		padding: 1rem 1.5rem;
		border: 2px solid;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		min-width: 200px;
	}
	
	.next-step-btn.circuit {
		background: rgba(120, 119, 198, 0.1);
		border-color: rgba(120, 119, 198, 0.5);
		color: rgba(120, 119, 198, 1);
	}
	
	.next-step-btn.real-table {
		background: rgba(255, 119, 198, 0.1);
		border-color: rgba(255, 119, 198, 0.5);
		color: rgba(255, 119, 198, 1);
	}
	
	.next-step-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(120, 119, 198, 0.3);
	}
	
	/* Completion Buttons */
	.completion-buttons-container {
		margin-top: 1.5rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.completion-btn {
		padding: 0.875rem 1.5rem;
		border: 2px solid;
		border-radius: 10px;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.95rem;
		transition: all 0.3s ease;
		min-width: 140px;
	}
	
	.completion-btn.new-chat {
		background: rgba(120, 119, 198, 0.1);
		border-color: rgba(120, 119, 198, 0.5);
		color: rgba(120, 119, 198, 1);
	}
	
	.completion-btn.go-home {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
		color: rgba(255, 255, 255, 0.7);
	}
	
	.completion-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(120, 119, 198, 0.3);
	}
	
	.next-step-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
	}
	
	/* Designer View */
	.designer-view {
		flex: 1;
		display: flex;
		min-height: 0;
	}
	
	/* Code View */
	.code-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	
	.code-editor-container {
		flex: 1;
		min-height: 0;
	}
	
	.tutorial-code-container {
		flex: 1;
		display: flex;
		min-height: 0;
	}
	
	.tutorial-sidebar {
		width: 320px;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
		border-right: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
	}
	
	.tutorial-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.tutorial-header h3 {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: rgba(120, 119, 198, 1);
	}
	
	.tutorial-description {
		margin: 0 0 1rem 0;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
	}
	
	.tutorial-progress {
		display: inline-block;
		background: rgba(120, 119, 198, 0.2);
		color: rgba(120, 119, 198, 1);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
	}
	
	.tutorial-content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.tutorial-step {
		flex: 1;
		margin-bottom: 1.5rem;
	}
	
	.tutorial-step h4 {
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #FFFFFF;
	}
	
	.step-description {
		margin: 0 0 1rem 0;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
	}
	
	.step-explanation {
		background: rgba(37, 37, 37, 0.6);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
	}
	
	.tutorial-navigation {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: auto;
	}
	
	.nav-btn {
		padding: 0.75rem 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}
	
	.nav-btn.prev {
		background: rgba(37, 37, 37, 0.8);
		color: rgba(255, 255, 255, 0.7);
	}
	
	.nav-btn.next {
		background: rgba(120, 119, 198, 0.1);
		color: rgba(120, 119, 198, 1);
	}
	
	.nav-btn.finish {
		background: linear-gradient(135deg, rgba(120, 119, 198, 1), rgba(255, 119, 198, 1));
		color: #FFFFFF;
		border-color: transparent;
	}
	
	.nav-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(120, 119, 198, 0.2);
	}
	
	.nav-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.code-editor-area {
		flex: 1;
		min-height: 0;
	}
	
	/* Animations */
	@keyframes typing {
		0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
		40% { transform: scale(1); opacity: 1; }
	}
	
	/* Responsive Design */
	@media (max-width: 1200px) {
		.tutorial-code-container {
			flex-direction: column;
		}
		
		.tutorial-sidebar {
			width: 100%;
			height: 40vh;
		}
		
		.code-editor-area {
			height: 60vh;
		}
		
		.chat-messages {
			padding: 2rem 1.5rem;
		}
		
		.chat-container {
			max-width: 700px;
			padding: 0 0.5rem;
		}
		
		.chat-input {
			padding: 1rem 1.5rem 2rem 1.5rem;
		}
		
		.modern-input-wrapper {
			padding: 0.75rem;
		}
		
		.message.user {
			max-width: 500px;
		}
		
		.message.ai {
			max-width: 550px;
		}
		
		.message.system {
			max-width: 600px;
		}
	}
	
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
		}
		
		.chat-messages {
			padding: 1rem;
		}
		
		.chat-container {
			max-width: 100%;
			padding: 0;
		}
		
		.chat-input {
			padding: 1rem;
		}
		
		.modern-input-wrapper {
			padding: 0.75rem;
		}
		
		.message.user {
			margin-right: 5%;
		}
		
		.message.ai, .message.system {
			margin-left: 0;
		}
		
		.message.user .message-content {
			max-width: 85%;
		}
		
		.view-header {
			padding: 1rem;
		}
		
		.header-actions {
			display: none;
		}
		
		.tutorial-sidebar {
			height: 50vh;
		}
		
		.code-editor-area {
			height: 50vh;
		}
	}
	
	@media (max-width: 640px) {
		.main-content {
			margin-left: 0;
		}
		
		.chat-messages {
			padding: 0.75rem;
		}
		
		.chat-input {
			padding: 0.75rem;
		}
		
		.modern-input-wrapper {
			padding: 0.75rem;
		}
		
		.message.user {
			margin-left: 5%;
		}
		
		.message.ai, .message.system {
			margin-right: 0%;
		}
		
		.message-text {
			padding: 0.75rem 1rem;
		}
	}
</style>
