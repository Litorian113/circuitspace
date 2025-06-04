<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PromptInput from '$lib/components/PromptInput.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	import CircuitDiagram from '$lib/components/CircuitDiagram.svelte';
	import { currentProject, updateProjectCode, addChatMessage, componentLibrary, type Component } from '$lib/stores/project';
	
	type Message = {
		id: number;
		type: 'user' | 'ai' | 'system';
		content: string;
		timestamp: Date;
		codeGenerated?: string;
		componentSuggestions?: Array<{name: string, description: string, price?: string}>;
	};
	
	let messages: Message[] = [];
	let currentInput = '';
	let isLoading = false;
	let messageId = 0;
	let chatHistory: string[] = [];
	let showExportModal = false;
	let showCircuitDiagram = false;
	
	// Subscribe to current project
	$: projectName = $currentProject.name;
	
	// Mock AI responses for different types of queries
	const aiResponses = {
		components: [
			"For an LED controller project, I'd recommend these components:\n\n• **Arduino Uno** - Main microcontroller ($25)\n• **LED Strip (WS2812B)** - Addressable RGB LEDs ($15)\n• **Potentiometer** - For brightness control ($2)\n• **Push Buttons** - Mode switching ($3)\n• **Breadboard & Jumper Wires** - Prototyping ($8)\n\nWould you like me to generate the Arduino code for this setup?",
			
			"Based on your requirements, here are some additional components to consider:\n\n• **ESP32** - For WiFi connectivity ($12)\n• **OLED Display** - Status information ($8)\n• **Rotary Encoder** - Better user interface ($5)\n• **Power Supply** - 5V 2A adapter ($10)\n\nThis setup will give you remote control capabilities through WiFi.",
			
			"For advanced features, you might want:\n\n• **PIR Motion Sensor** - Automatic activation ($4)\n• **LDR Sensor** - Ambient light detection ($2)\n• **Real-time Clock Module** - Scheduling features ($6)\n• **Relay Module** - High-power switching ($8)"
		],
		
		code: [
			"Here's a basic Arduino sketch for your LED controller:\n\n```cpp\n#include <FastLED.h>\n\n#define LED_PIN 6\n#define NUM_LEDS 30\n#define BRIGHTNESS 100\n\nCRGB leds[NUM_LEDS];\n\nvoid setup() {\n  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);\n  FastLED.setBrightness(BRIGHTNESS);\n}\n\nvoid loop() {\n  // Rainbow effect\n  for(int i = 0; i < NUM_LEDS; i++) {\n    leds[i] = CHSV(i * 8, 255, 255);\n  }\n  FastLED.show();\n  delay(50);\n}\n```\n\nThis creates a rainbow effect. Would you like me to add button controls or other features?",
			
			"I'll add button controls and multiple modes:\n\n```cpp\n#include <FastLED.h>\n\n#define LED_PIN 6\n#define BUTTON_PIN 2\n#define NUM_LEDS 30\n\nCRGB leds[NUM_LEDS];\nint currentMode = 0;\nint buttonState = 0;\nint lastButtonState = 0;\n\nvoid setup() {\n  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n  FastLED.setBrightness(100);\n}\n\nvoid loop() {\n  checkButton();\n  \n  switch(currentMode) {\n    case 0: rainbowMode(); break;\n    case 1: breathingMode(); break;\n    case 2: strobeMode(); break;\n  }\n  \n  FastLED.show();\n  delay(50);\n}\n\nvoid checkButton() {\n  buttonState = digitalRead(BUTTON_PIN);\n  if (buttonState != lastButtonState && buttonState == LOW) {\n    currentMode = (currentMode + 1) % 3;\n    delay(200); // Debounce\n  }\n  lastButtonState = buttonState;\n}\n```\n\nThis adds three different lighting modes that you can cycle through with a button."
		],
		
		help: [
			"I'm here to help you with your circuit projects! I can assist with:\n\n• **Component Selection** - Find the right parts for your project\n• **Circuit Design** - Plan connections and power requirements with interactive diagrams\n• **Code Generation** - Arduino sketches and programming\n• **Troubleshooting** - Debug hardware and software issues\n• **Project Ideas** - Inspiration for new builds\n\n💡 **Tip**: Use the '⚡ Circuit' button to switch to the interactive circuit diagram view!\n\nWhat would you like to work on today?",
			
			"Let me help you plan your next steps:\n\n1. **Define Requirements** - What should your circuit do?\n2. **Select Components** - Choose the right parts\n3. **Design Circuit** - Plan connections using the circuit diagram tool\n4. **Write Code** - Program the microcontroller\n5. **Test & Debug** - Verify everything works\n\nWhich step would you like to focus on? I can guide you through each one!"
		]
	};
	
	onMount(() => {
		const prompt = $page.url.searchParams.get('prompt');
		if (prompt) {
			addMessage('user', prompt);
			setTimeout(() => {
				generateAIResponse(prompt);
			}, 1000);
		} else {
			// Welcome message with circuit diagram feature highlight
			addMessage('system', `Welcome to your Circuitspace project workspace! I'm here to help you design and build "${projectName}". 

**New Feature**: Switch between **Code Editor** and **Circuit Diagram** views using the toggle button above!

Ask me about components, code, circuit design, or wiring - I'll guide you through the entire development process.`);
		}
	});
	
	function addMessage(type: 'user' | 'ai' | 'system', content: string, extras?: Partial<Message>) {
		const newMessage: Message = {
			id: messageId++,
			type,
			content,
			timestamp: new Date(),
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
	
	function generateAIResponse(userMessage: string) {
		const lowercaseMessage = userMessage.toLowerCase();
		let response = '';
		let codeGenerated = '';
		let componentSuggestions: Array<{name: string, description: string, price?: string}> = [];
		
		if (lowercaseMessage.includes('component') || lowercaseMessage.includes('part') || lowercaseMessage.includes('buy')) {
			response = aiResponses.components[Math.floor(Math.random() * aiResponses.components.length)];
			// Get relevant components from library
			const relevantComponents = componentLibrary.slice(0, 3).map(comp => ({
				name: comp.name,
				description: comp.description,
				price: comp.price
			}));
			componentSuggestions = relevantComponents;
		} else if (lowercaseMessage.includes('code') || lowercaseMessage.includes('program') || lowercaseMessage.includes('sketch')) {
			response = aiResponses.code[Math.floor(Math.random() * aiResponses.code.length)];
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
			response = "I can help you design the circuit layout! **Click the '⚡ Circuit' button** in the top-right to open the interactive circuit diagram. There you can:\n\n• **Drag and drop components** onto the canvas\n• **Auto-generate connections** between components\n• **Export your circuit design** as an image\n• **Switch back to code view** anytime\n\nWould you like me to suggest which components to add for your specific project?";
			
			// Auto-switch to circuit diagram view after a short delay
			setTimeout(() => {
				showCircuitDiagram = true;
			}, 2000);
		} else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('start')) {
			response = aiResponses.help[Math.floor(Math.random() * aiResponses.help.length)];
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
		
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
			generateAIResponse(message);
		}, 1000 + Math.random() * 1000);
	}
	
	function copyCodeToEditor(code: string) {
		// Update the project store with new code
		updateProjectCode(code);
		// Dispatch event to CodeEditor component
		const event = new CustomEvent('updateCode', { detail: code });
		window.dispatchEvent(event);
	}
	
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage(currentInput);
			currentInput = '';
		}
	}
	
	function goHome() {
		goto('/');
	}
	
	function newProject() {
		goto('/');
	}
	
	function exportChat() {
		showExportModal = true;
	}
	
	function shareProject() {
		showExportModal = true;
	}
	
	function toggleCircuitDiagram() {
		showCircuitDiagram = !showCircuitDiagram;
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
	<!-- Sidebar -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<button class="home-link" on:click={goHome}>
				<h2>Circuitspace</h2>
			</button>
			<div class="status-indicator"></div>
		</div>
		
		<nav class="sidebar-nav">
			<button class="nav-item" on:click={newProject}>
				New Project +
			</button>
            <button class="nav-item active">
				Current Project
			</button>
			<!-- <button class="nav-item" on:click={goHome}>
				Home
			</button> -->
		</nav>
		
		<div class="sidebar-footer">
			<div class="project-info">
				<h4>Current Session</h4>
				<p>{messages.length} messages</p>
				<p class="timestamp">Started {new Date().toLocaleTimeString()}</p>
			</div>
		</div>
	</aside>
	
	<!-- Main Content Area with Two Columns -->
	<main class="main-content">
		<div class="columns-wrapper">
			<!-- Left Column: Chat Area -->
			<div class="chat-column">
				<!-- Chat Header -->
				<header class="chat-header">
					<div class="header-left">
						<h1>Project: {projectName}</h1>
						<p class="project-description">AI-powered circuit design assistant</p>
					</div>
					<div class="header-actions">
						<button class="action-btn" on:click={toggleCircuitDiagram}>
							{showCircuitDiagram ? 'Code' : '⚡ Circuit'}
						</button>
						<button class="action-btn" on:click={exportChat}>Export Chat</button>
						<button class="action-btn" on:click={shareProject}>Share Project</button>
					</div>
				</header>
				
				<!-- Messages Area -->
				<div class="chat-messages">
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
				
				<!-- Input Area -->
				<PromptInput 
					bind:value={currentInput}
					onSend={handleSendMessage}
					disabled={isLoading}
					placeholder="Describe your circuit requirements, ask questions, or request component suggestions..."
				/>
			</div>
			
			<!-- Right Column: IDE/Circuit Area -->
			<div class="ide-column">
				{#if showCircuitDiagram}
					<div class="circuit-diagram-container">
						<div class="diagram-header">
							<h3>Circuit Diagram</h3>
							<p class="diagram-description">Interactive circuit design for your project</p>
						</div>
						<CircuitDiagram />
					</div>
				{:else}
					<CodeEditor />
				{/if}
			</div>
		</div>
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
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.home-link {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 8px;
		padding: 0.5rem 1rem;
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
	
	.status-indicator {
		width: 8px;
		height: 8px;
		background: #00d4aa;
		border-radius: 50%;
		box-shadow: 0 0 8px #00d4aa;
		animation: pulse 2s infinite;
	}
	
	.sidebar-nav {
		padding: 1rem;
		flex: 1;
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
	}
	
	.nav-item:hover {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
	}
	
	.nav-item.active {
		background: rgba(0, 212, 170, 0.15);
		color: #00d4aa;
		border: 1px solid rgba(0, 212, 170, 0.3);
	}
	
	.nav-icon {
		font-size: 1rem;
	}
	
	.sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.project-info h4 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
	}
	
	.project-info p {
		font-size: 0.8rem;
		margin: 0.25rem 0;
		opacity: 0.7;
	}
	
	.timestamp {
		font-size: 0.75rem !important;
		opacity: 0.5 !important;
	}
	
	/* Main Content Area */
	.main-content {
		flex: 1;
		display: flex;
		background: #0a0f1a;
		min-height: 0; /* Important for proper flex behavior */
		width: 100%;
	}
	
	/* Columns Wrapper - Contains both chat and IDE columns */
	.columns-wrapper {
		display: flex;
		width: 100%;
		height: 100%;
		flex: 1;
	}
	
	/* Chat Column (Left) - Exactly 50% */
	.chat-column {
		width: 50%;
		flex: 0 0 50%;
		display: flex;
		flex-direction: column;
		border-right: 1px solid rgba(0, 212, 170, 0.2);
		min-width: 0; /* Important for proper flex behavior */
	}
	
	/* IDE Column (Right) - Exactly 50% */
	.ide-column {
		width: 50%;
		flex: 0 0 50%;
		display: flex;
		min-width: 0; /* Important for proper flex behavior */
		max-width: 50%; /* Prevent expansion beyond 50% */
		overflow: hidden; /* Contain content within bounds */
	}
	
	.chat-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
	}
	
	.chat-header h1 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: #00d4aa;
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
	
	/* Messages Area */
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.message {
		display: flex;
		gap: 1rem;
		max-width: 800px;
	}
	
	.message.user {
		align-self: flex-end;
		flex-direction: row-reverse;
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
	
	/* Animations */
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	@keyframes typing {
		0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
		40% { transform: scale(1); opacity: 1; }
	}
	
	/* Circuit Diagram Styles */
	.circuit-diagram-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	}
	
	.diagram-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
	}
	
	.diagram-header h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
	}
	
	.diagram-description {
		margin: 0;
		color: #94a3b8;
		font-size: 0.875rem;
	}
	
	/* Responsive Design */
	@media (max-width: 1200px) {
		.main-content {
			flex-direction: column;
		}
		
		.columns-wrapper {
			flex-direction: column;
		}
		
		.chat-column {
			width: 100%;
			flex: 0 0 auto;
			border-right: none;
			border-bottom: 1px solid rgba(0, 212, 170, 0.2);
			min-height: 50vh;
		}
		
		.ide-column {
			width: 100%;
			flex: 0 0 auto;
			min-height: 50vh;
		}
	}
	
	@media (max-width: 768px) {
		.sidebar {
			width: 240px;
		}
		
		.chat-messages {
			padding: 1rem;
		}
		
		.chat-header {
			padding: 1rem;
		}
		
		.header-actions {
			display: none;
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
		
		.sidebar-nav {
			display: flex;
			gap: 0.5rem;
			padding: 0.5rem;
		}
		
		.nav-item {
			margin-bottom: 0;
			white-space: nowrap;
		}
		
		.sidebar-footer {
			display: none;
		}
		
		.main-content {
			flex-direction: column;
		}
		
		.columns-wrapper {
			flex-direction: column;
		}
		
		.chat-column {
			width: 100%;
			flex: 0 0 auto;
			min-height: 60vh;
		}
		
		.ide-column {
			width: 100%;
			flex: 0 0 auto;
			min-height: 40vh;
		}
	}
</style>
