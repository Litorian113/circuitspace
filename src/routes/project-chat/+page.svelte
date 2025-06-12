<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PromptInput from '$lib/components/PromptInput.svelte';
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
		getCompleteTutorialCode
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
		showNextStepsButtons?: boolean;
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
	
	// Subscribe to current project and conversation
	$: projectName = $currentProject.name;
	$: conversation = $currentConversation;
	$: currentStepIndex = $conversationStep;
	$: tutorialActive = $isTutorialActive;
	$: tutorialStepIndex = $currentTutorialStep;
	
	// Navigation functions
	function switchToView(view: ViewMode) {
		currentView = view;
		if (view === 'designer') {
			tutorialComponents = ['arduino-leonardo', 'breadboard', 'led', 'resistor', 'potentiometer', 'jumper-cable'];
		}
	}
	
	function goBackHome() {
		goto('/');
	}
	
	function exportCode() {
		// Export code functionality
		showExportModal = true;
	}
	
	// ... (Rest of the functions remain the same as in original file)
	
	onMount(() => {
		// Check if there's an initial prompt from the URL
		const initialPrompt = $page.url.searchParams.get('prompt');
		if (initialPrompt) {
			// Check if this is a structured conversation
			const projectType = detectProjectType(initialPrompt);
			if (projectType) {
				isStructuredConversation = true;
				startConversation(projectType);
				
				// Add user message
				addMessage('user', initialPrompt);
				
				// Start the structured conversation flow
				startStructuredConversationFlow();
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
	
	function addMessage(type: 'user' | 'ai' | 'system', content: string, extras?: Partial<Message>, componentImages?: string[]) {
		const newMessage: Message = {
			id: messageId++,
			type,
			content,
			timestamp: new Date(),
			componentImages,
			...extras
		};
		messages = [...messages, newMessage];
		
		// Auto-scroll to bottom
		setTimeout(() => {
			const chatContainer = document.querySelector('.chat-messages');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}
	
	function startStructuredConversationFlow() {
		if (!$currentConversation) return;
		
		// Show first step (components) immediately
		const firstStep = $currentConversation.steps[0];
		setTimeout(() => {
			addMessage('ai', firstStep.content, {}, firstStep.componentImages);
			
			// Auto-simulate user response after 3 seconds
			setTimeout(() => {
				addMessage('user', 'okay ich habe alle komponenten');
				
				// Trigger the next step automatically
				handleStructuredConversation('okay ich habe alle komponenten');
			}, 3000);
		}, 1000);
	}
	
	function startTutorial() {
		// Start the code tutorial
		startCodeTutorial();
		
		// Add confirmation message
		addMessage('ai', '🚀 Perfekt! Das Code Tutorial wurde gestartet. Wechseln Sie zur "Circuit Code" Ansicht für die Schritt-für-Schritt Anleitung.');
		
		// Switch to code view
		setTimeout(() => {
			switchToView('code');
		}, 1500);
	}
	
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
		
		// Handle structured conversation
		if (isStructuredConversation && conversation) {
			handleStructuredConversation(message);
		} else {
			// Normal AI response
			isLoading = true;
			setTimeout(() => {
				isLoading = false;
				generateAIResponse(message);
			}, 1000 + Math.random() * 1000);
		}
	}
	
	function handleStructuredConversation(userMessage: string) {
		if (!conversation) return;
		
		const lowerMessage = userMessage.toLowerCase();
		
		// Check if user confirms having components
		if (lowerMessage.includes('okay ich habe alle komponenten') || 
			lowerMessage.includes('ok ich habe alle komponenten') ||
			lowerMessage.includes('ja ich habe alle') ||
			lowerMessage.includes('habe alle komponenten')) {
			
			// Move to code preparation step
			markStepCompleted('component-analysis');
			nextConversationStep();
			
			// Show code preparation message
			isLoading = true;
			setTimeout(() => {
				isLoading = false;
				const codeStep = conversation.steps[2]; // code-preparation step
				addMessage('ai', codeStep.content, { showTutorialButton: true });
			}, 1000);
			
		} else if (lowerMessage.includes('circuit') || lowerMessage.includes('schaltung')) {
			// User wants to go to circuit designer
			addMessage('ai', 'Perfekt! Ich wechsle zum Circuit Designer für Sie. Dort können Sie die Schaltung virtuell aufbauen und testen.');
			setTimeout(() => {
				switchToView('designer');
			}, 1000);
		} else {
			// Default response for unrecognized input in structured conversation
			isLoading = true;
			setTimeout(() => {
				isLoading = false;
				generateAIResponse(userMessage);
			}, 1000);
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
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
	<!-- Sidebar Navigation -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<button class="home-link" on:click={goBackHome}>
				<h2>← Circuitspace</h2>
			</button>
			<div class="project-name">
				<h3>{projectName}</h3>
				<p>Circuit Project</p>
			</div>
		</div>
		
		<nav class="view-navigation">
			<h4>Navigation</h4>
			<button 
				class="nav-item" 
				class:active={currentView === 'chat'}
				on:click={() => switchToView('chat')}
			>
				<span class="nav-icon">💬</span>
				Circuit Chat
			</button>
			<button 
				class="nav-item" 
				class:active={currentView === 'designer'}
				on:click={() => switchToView('designer')}
			>
				<span class="nav-icon">⚡</span>
				Circuit Designer
			</button>
			<button 
				class="nav-item" 
				class:active={currentView === 'code'}
				on:click={() => switchToView('code')}
			>
				<span class="nav-icon">💻</span>
				Circuit Code
			</button>
		</nav>
		
		<div class="sidebar-info">
			<div class="session-info">
				<h4>Current Session</h4>
				<p>{messages.length} messages</p>
				<p class="timestamp">Started {new Date().toLocaleTimeString()}</p>
			</div>
			
			{#if tutorialActive}
				<div class="tutorial-info">
					<h4>Tutorial Progress</h4>
					<p>Step {tutorialStepIndex + 1} of {leonardoCodeTutorial.length}</p>
					<div class="progress-bar">
						<div class="progress" style="width: {((tutorialStepIndex + 1) / leonardoCodeTutorial.length) * 100}%"></div>
					</div>
				</div>
			{/if}
		</div>
	</aside>

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
						<button class="action-btn" on:click={() => switchToView('designer')}>
							⚡ Circuit Designer
						</button>
						<button class="action-btn" on:click={() => switchToView('code')}>
							💻 Circuit Code
						</button>
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
								<div class="message-avatar">
									{#if message.type === 'user'}
										<div class="user-avatar">👤</div>
									{:else if message.type === 'ai'}
										<div class="ai-avatar">🤖</div>
									{:else}
										<div class="system-avatar">⚡</div>
									{/if}
								</div>
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
										<button class="tutorial-start-btn" on:click={startTutorial}>
											💻 Code Tutorial starten
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
								
								<div class="message-timestamp">
									{message.timestamp.toLocaleTimeString()}
								</div>
							</div>
						</div>
					{/each}
					
					{#if isLoading}
						<div class="message ai">
							<div class="message-avatar">
								<div class="ai-avatar">🤖</div>
							</div>
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
						<PromptInput 
							bind:value={currentInput}
							onSend={handleSendMessage}
							disabled={isLoading || (isStructuredConversation && tutorialActive)}
							placeholder={isStructuredConversation ? "Strukturierte Konversation läuft..." : "Describe your circuit requirements, ask questions, or request component suggestions..."}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Circuit Designer View -->
		{#if currentView === 'designer'}
			<div class="designer-view">
				<FullscreenCircuitDesigner 
					{tutorialComponents} 
					on:exit={() => switchToView('chat')} 
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
						<button class="action-btn" on:click={() => switchToView('designer')}>
							⚡ Circuit Designer
						</button>
						{#if tutorialActive}
							<button class="action-btn tutorial" on:click={completeTutorial}>
								Finish Tutorial
							</button>
						{/if}
						<button class="action-btn secondary" on:click={exportCode}>
							Export Code
						</button>
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
							/>
						</div>
					</div>
				{:else}
					<!-- Normal Code Editor -->
					<div class="code-editor-container">
						<CodeEditor />
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
		font-family: 'IBM Plex Mono', monospace;
		background: #0a0f1a;
		color: #e2e8f0;
		overflow: hidden;
	}
	
	.app-container {
		display: flex;
		height: 100vh;
		width: 100vw;
	}
	
	/* Sidebar */
	.sidebar {
		width: 280px;
		background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
		border-right: 1px solid rgba(0, 212, 170, 0.2);
		display: flex;
		flex-direction: column;
		position: relative;
	}
	
	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.home-link {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		margin-bottom: 1rem;
	}
	
	.home-link:hover {
		background: rgba(0, 212, 170, 0.1);
		transform: scale(1.02);
	}
	
	.sidebar-header h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #00d4aa;
		transition: color 0.2s ease;
	}
	
	.home-link:hover h2 {
		color: #ffffff;
	}
	
	.project-name {
		text-align: center;
	}
	
	.project-name h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: #e2e8f0;
	}
	
	.project-name p {
		font-size: 0.8rem;
		margin: 0;
		color: #94a3b8;
	}
	
	.view-navigation {
		padding: 1.5rem;
		flex: 1;
	}
	
	.view-navigation h4 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #00d4aa;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.nav-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: #e2e8f0;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-bottom: 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		text-align: left;
	}
	
	.nav-item:hover {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
	}
	
	.nav-item.active {
		background: rgba(0, 212, 170, 0.15);
		color: #00d4aa;
		border: 1px solid rgba(0, 212, 170, 0.3);
		box-shadow: 0 0 12px rgba(0, 212, 170, 0.1);
	}
	
	.nav-icon {
		font-size: 1rem;
	}
	
	.sidebar-info {
		padding: 1.5rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.session-info h4, .tutorial-info h4 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
	}
	
	.session-info p, .tutorial-info p {
		font-size: 0.8rem;
		margin: 0.25rem 0;
		opacity: 0.7;
	}
	
	.timestamp {
		font-size: 0.75rem !important;
		opacity: 0.5 !important;
	}
	
	.tutorial-info {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.progress-bar {
		width: 100%;
		height: 4px;
		background: rgba(0, 212, 170, 0.2);
		border-radius: 2px;
		overflow: hidden;
		margin-top: 0.5rem;
	}
	
	.progress {
		height: 100%;
		background: linear-gradient(90deg, #00d4aa, #0ea5e9);
		border-radius: 2px;
		transition: width 0.3s ease;
	}
	
	/* Main Content Area */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #0a0f1a;
		min-height: 0;
		overflow: hidden;
	}
	
	/* View Headers */
	.view-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
		flex-shrink: 0;
	}
	
	.view-header h1 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0;
		color: #00d4aa;
	}
	
	.view-header p {
		font-size: 0.9rem;
		margin: 0.25rem 0 0 0;
		color: #94a3b8;
	}
	
	.header-actions {
		display: flex;
		gap: 1rem;
	}
	
	.action-btn {
		padding: 0.5rem 1rem;
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 6px;
		color: #00d4aa;
		cursor: pointer;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}
	
	.action-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		border-color: #00d4aa;
	}
	
	.action-btn.secondary {
		background: rgba(30, 41, 59, 0.5);
		border-color: rgba(100, 116, 139, 0.3);
		color: #94a3b8;
	}
	
	.action-btn.secondary:hover {
		background: rgba(30, 41, 59, 0.8);
		border-color: rgba(100, 116, 139, 0.5);
		color: #e2e8f0;
	}
	
	.action-btn.tutorial {
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		color: #0a0f1a;
		border-color: transparent;
	}
	
	.action-btn.tutorial:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
	}
	
	/* Chat View */
	.chat-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 100%;
		/* margin: 0 auto; */
	}
	
	.chat-container {
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
		padding: 0 1rem;
	}
	
	.message {
		display: flex;
		gap: 1rem;
		width: 100%;
		max-width: 700px;
	}
	
	.message.user {
		justify-content: flex-end;
		margin-left: auto;
		margin-right: 0;
		max-width: 600px;
		align-self: flex-end;
	}
	
	.message.user .message-content {
		order: 1;
	}
	
	.message.user .message-avatar {
		order: 2;
	}
	
	.message.ai {
		justify-content: flex-start;
		margin-left: 0;
		margin-right: auto;
		max-width: 650px;
		align-self: flex-start;
	}
	
	.message.system {
		justify-content: flex-start;
		margin-left: 0;
		margin-right: auto;
		max-width: 700px;
		align-self: flex-start;
	}
	
	.message-avatar {
		flex-shrink: 0;
	}
	
	.user-avatar, .ai-avatar, .system-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1.2rem;
	}
	
	.user-avatar {
		background: linear-gradient(135deg, #0ea5e9 0%, #00d4aa 100%);
		color: #0a0f1a;
	}
	
	.ai-avatar {
		background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
		border: 2px solid #00d4aa;
		color: #00d4aa;
	}
	
	.system-avatar {
		background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
		color: #f8fafc;
	}
	
	.message-content {
		flex: 1;
		min-width: 0;
		margin-bottom: 16px;
	}
	
	.message-text {
		background: rgba(30, 41, 59, 0.6);
		padding: 1rem 1.25rem;
		border-radius: 16px;
		line-height: 1.6;
		border: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.message.user .message-text {
		background: rgba(0, 212, 170, 0.1);
		border-color: rgba(0, 212, 170, 0.3);
	}
	
	.message.system .message-text {
		background: rgba(124, 58, 237, 0.1);
		border-color: rgba(124, 58, 237, 0.3);
	}
	
	.chat-input {
		flex-shrink: 0;
		padding: 1rem 2rem 2rem 2rem;
		background: rgba(15, 23, 42, 0.5);
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.chat-input :global(.chat-container) {
		max-width: 900px;
		margin: 0 auto;
		padding: 0;
	}
	
	.chat-input :global(.prompt-input) {
		width: 100%;
		max-width: none;
	}
	
	.chat-input :global(.prompt-input) {
		width: 100%;
		max-width: none;
	}
	
	/* Component Suggestions */
	.component-suggestions {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(15, 23, 42, 0.8);
		border-radius: 12px;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}
	
	.component-suggestions h4 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #00d4aa;
	}
	
	.component-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
	
	.component-card {
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 8px;
		padding: 1rem;
		transition: all 0.3s ease;
		cursor: pointer;
	}
	
	.component-card:hover {
		border-color: #00d4aa;
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 212, 170, 0.2);
	}
	
	.component-card h5 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #e2e8f0;
	}
	
	.component-card p {
		font-size: 0.85rem;
		margin: 0 0 0.75rem 0;
		opacity: 0.8;
		line-height: 1.4;
	}
	
	.component-card .price {
		display: inline-block;
		background: rgba(0, 212, 170, 0.2);
		color: #00d4aa;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		font-family: 'IBM Plex Mono', monospace;
	}
	
	/* Code Block */
	.code-block {
		margin-top: 1rem;
		background: rgba(15, 23, 42, 0.9);
		border-radius: 12px;
		border: 1px solid rgba(0, 212, 170, 0.2);
		overflow: hidden;
	}
	
	.code-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: rgba(0, 212, 170, 0.1);
		border-bottom: 1px solid rgba(0, 212, 170, 0.2);
	}
	
	.code-header span {
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 600;
		color: #00d4aa;
		font-size: 0.9rem;
	}
	
	.copy-code-btn {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		border: none;
		border-radius: 6px;
		color: #0a0f1a;
		cursor: pointer;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 600;
		font-size: 0.85rem;
		transition: all 0.3s ease;
	}
	
	.copy-code-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
	}
	
	.code-block pre {
		margin: 0;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.3);
		overflow-x: auto;
	}
	
	.code-block code {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		color: #e2e8f0;
	}
	
	.message-timestamp {
		font-size: 0.75rem;
		opacity: 0.5;
		margin-top: 0.5rem;
		padding: 0 1.25rem;
	}
	
	/* Typing Indicator */
	.typing-indicator {
		background: rgba(30, 41, 59, 0.6);
		padding: 1rem 1.25rem;
		border-radius: 16px;
		border: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		gap: 4px;
		align-items: center;
	}
	
	.typing-indicator span {
		width: 8px;
		height: 8px;
		background: #00d4aa;
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
		background: rgba(15, 23, 42, 0.8);
		border-radius: 12px;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}
	
	.component-images h4 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #00d4aa;
	}
	
	.images-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: flex-start;
	}
	
	.component-image {
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.2);
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
		border-color: #00d4aa;
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 212, 170, 0.2);
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
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		border: none;
		border-radius: 12px;
		color: #0a0f1a;
		cursor: pointer;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(0, 212, 170, 0.3);
	}
	
	.tutorial-start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 212, 170, 0.4);
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
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		min-width: 200px;
	}
	
	.next-step-btn.circuit {
		background: rgba(0, 212, 170, 0.1);
		border-color: #00d4aa;
		color: #00d4aa;
	}
	
	.next-step-btn.real-table {
		background: rgba(234, 179, 8, 0.1);
		border-color: #eab308;
		color: #eab308;
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
		background: rgba(15, 23, 42, 0.8);
		border-right: 1px solid rgba(0, 212, 170, 0.2);
		display: flex;
		flex-direction: column;
	}
	
	.tutorial-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.tutorial-header h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
	}
	
	.tutorial-description {
		margin: 0 0 1rem 0;
		color: #94a3b8;
		font-size: 0.875rem;
	}
	
	.tutorial-progress {
		display: inline-block;
		background: rgba(0, 212, 170, 0.2);
		color: #00d4aa;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		font-family: 'IBM Plex Mono', monospace;
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
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #e2e8f0;
	}
	
	.step-description {
		margin: 0 0 1rem 0;
		color: #94a3b8;
		font-size: 0.9rem;
	}
	
	.step-explanation {
		background: rgba(30, 41, 59, 0.6);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid rgba(0, 212, 170, 0.1);
		line-height: 1.6;
		color: #e2e8f0;
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
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}
	
	.nav-btn.prev {
		background: rgba(30, 41, 59, 0.8);
		color: #94a3b8;
	}
	
	.nav-btn.next {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
	}
	
	.nav-btn.finish {
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		color: #0a0f1a;
		border-color: transparent;
	}
	
	.nav-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 212, 170, 0.2);
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
		.sidebar {
			width: 240px;
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
		
		.message.user {
			max-width: 85%;
		}
		
		.message.ai {
			max-width: 90%;
		}
		
		.message.system {
			max-width: 95%;
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
		.app-container {
			flex-direction: column;
		}
		
		.sidebar {
			width: 100%;
			height: auto;
			flex-direction: row;
			border-right: none;
			border-bottom: 1px solid rgba(0, 212, 170, 0.2);
		}
		
		.view-navigation {
			display: flex;
			gap: 0.5rem;
			padding: 0.5rem;
		}
		
		.view-navigation h4 {
			display: none;
		}
		
		.nav-item {
			margin-bottom: 0;
			white-space: nowrap;
			flex: 1;
			justify-content: center;
		}
		
		.sidebar-info {
			display: none;
		}
		
		.chat-messages {
			padding: 0.75rem;
		}
		
		.chat-input {
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
	
	@media (max-width: 640px) {
		.app-container {
			flex-direction: column;
		}
		
		.sidebar {
			width: 100%;
			height: auto;
			flex-direction: row;
			border-right: none;
			border-bottom: 1px solid rgba(0, 212, 170, 0.2);
		}
		
		.view-navigation {
			display: flex;
			gap: 0.5rem;
			padding: 0.5rem;
		}
		
		.view-navigation h4 {
			display: none;
		}
		
		.nav-item {
			margin-bottom: 0;
			white-space: nowrap;
			flex: 1;
			justify-content: center;
		}
		
		.sidebar-info {
			display: none;
		}
		
		.chat-messages {
			padding: 0.75rem;
		}
		
		.chat-container {
			max-width: 100%;
			padding: 0;
		}
		
		.chat-input {
			padding: 0.75rem;
		}
		
		.message.user {
			max-width: 90%;
		}
		
		.message.ai, .message.system {
			max-width: 95%;
		}
		
		.message-text {
			padding: 0.75rem 1rem;
		}
		
		.sidebar-header {
			padding: 1rem;
		}
	}
</style>
