<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import Prism from 'prismjs';
	import 'prismjs/components/prism-c';
	import 'prismjs/components/prism-cpp';
	import 'prismjs/themes/prism-tomorrow.css';
	import { currentProject } from '$lib/stores/project';
	
	// Tutorial support
	export let tutorialCode: string | undefined = undefined;
	export let isInTutorialMode: boolean = false; // New prop to control when to show empty editor
	
	// Event dispatcher for upload completion
	const dispatch = createEventDispatcher();
	
	let codeContent = `// Welcome to Circuitspace!
// Start a tutorial or create your own project.

void setup() {
  // Your setup code goes here
}

void loop() {
  // Your main program goes here
}`;

	let connectedBoard = "Arduino Uno";
	let isConnected = true;
	let isUploading = false;
	let isCompiling = false;
	let compilationStatus = 'Ready';
	let serialMonitor = '';
	let showSerialMonitor = false;
	let isSerialMonitorMinimized = false;
	let serialMessages: Array<{timestamp: string, message: string}> = [];
	let autoScroll = true;
	let codeEditor: HTMLTextAreaElement;
	let lineNumbers: HTMLDivElement;
	let highlightedCode = '';
	let syncScrolling = true;
	let scrollAnimationFrame: number | null = null;
	
	// Subscribe to project store for code updates
	$: if ($currentProject && $currentProject.code && tutorialCode === undefined) {
		// Only update if we're not in tutorial mode and there's actual code
		// Also check if this is from a completed tutorial (not default project code)
		if ($currentProject.code.trim().length > 50 && 
			!$currentProject.code.includes('// Welcome to Circuitspace!') && 
			$currentProject.name !== 'Smart LED Controller') { 
			codeContent = $currentProject.code;
			updateHighlighting();
			
			// Show success message in Serial Monitor
			const timestamp = new Date().toLocaleTimeString();
			if (!showSerialMonitor) {
				showSerialMonitor = true;
				serialMonitor = `[${timestamp}] ✅ Code successfully imported from tutorial!\n`;
				serialMonitor += `[${timestamp}] 📝 ${$currentProject.name} code loaded\n`;
				serialMonitor += `[${timestamp}] 🔧 Ready for compilation and upload\n\n`;
			}
		}
	}
	
	// Listen for code updates from chat
	onMount(() => {
		const handleCodeUpdate = (event: CustomEvent) => {
			if (event.detail) {
				codeContent = event.detail;
				updateHighlighting();
				const timestamp = new Date().toLocaleTimeString();
				if (showSerialMonitor) {
					serialMonitor += `[${timestamp}] ✅ Tutorial code successfully loaded into IDE!\n`;
					serialMonitor += `[${timestamp}] 📝 Arduino Leonardo LED Dimmer Code ready\n`;
					serialMonitor += `[${timestamp}] 🔧 Compilation and upload possible\n\n`;
				} else {
					// Show serial monitor briefly to show success message
					showSerialMonitor = true;
					serialMonitor = `[${timestamp}] ✅ Tutorial code successfully loaded into IDE!\n`;
					serialMonitor += `[${timestamp}] 📝 Arduino Leonardo LED Dimmer Code ready\n`;
					serialMonitor += `[${timestamp}] 🔧 Code ready for compilation and upload\n\n`;
				}
			}
		};
		
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && showSerialMonitor) {
				console.log('Escape pressed, closing Serial Monitor');
				toggleSerialMonitor();
			}
		};
		
		window.addEventListener('updateCode', handleCodeUpdate as EventListener);
		window.addEventListener('keydown', handleKeydown);
		
		// Initial highlighting
		updateHighlighting();
		
		return () => {
			window.removeEventListener('updateCode', handleCodeUpdate as EventListener);
			window.removeEventListener('keydown', handleKeydown);
			
			// Cleanup any pending animation frame
			if (scrollAnimationFrame) {
				cancelAnimationFrame(scrollAnimationFrame);
			}
		};
	});
	
	// Watch for tutorial code changes
	$: if (tutorialCode !== undefined) {
		codeContent = tutorialCode;
		updateHighlighting();
	} else if (isInTutorialMode) {
		// Show empty code editor when in tutorial mode and no tutorial code yet
		codeContent = '';
		updateHighlighting();
	}
	
	function updateHighlighting() {
		try {
			// Use C++ syntax highlighting for Arduino code
			highlightedCode = Prism.highlight(codeContent, Prism.languages.cpp, 'cpp');
		} catch (error) {
			console.warn('Syntax highlighting error:', error);
			highlightedCode = codeContent;
		}
	}
	
	function handleCodeInput() {
		updateHighlighting();
	}
	
	function handleScroll(event: Event) {
		if (!syncScrolling) return;
		
		// Cancel any pending animation frame
		if (scrollAnimationFrame) {
			cancelAnimationFrame(scrollAnimationFrame);
		}
		
		// Use requestAnimationFrame for smooth scrolling
		scrollAnimationFrame = requestAnimationFrame(() => {
			const target = event.target as HTMLTextAreaElement;
			const scrollTop = target.scrollTop;
			const scrollLeft = target.scrollLeft;
			
			// Update syntax highlighting
			const highlightElement = document.querySelector('.syntax-highlight') as HTMLElement;
			if (highlightElement) {
				highlightElement.scrollTop = scrollTop;
				highlightElement.scrollLeft = scrollLeft;
			}
			
			// Update line numbers
			if (lineNumbers) {
				lineNumbers.scrollTop = scrollTop;
			}
			
			scrollAnimationFrame = null;
		});
	}
	
	// Simulate real-time serial data
	function startSerialSimulation() {
		if (!showSerialMonitor) return;
		
		const messages = [
			'Circuitspace Project Started!',
			'Initializing sensors...',
			'Button state: Released',
			'LED state changed to: ON',
			'Temperature: 23.5°C',
			'Button pressed!',
			'LED state changed to: OFF',
			'Sensor reading: 1024',
			'Wifi connection established',
			'Data sent to server'
		];
		
		const interval = setInterval(() => {
			if (!showSerialMonitor) {
				clearInterval(interval);
				return;
			}
			
			const randomMessage = messages[Math.floor(Math.random() * messages.length)];
			const timestamp = new Date().toLocaleTimeString();
			const newLine = `[${timestamp}] ${randomMessage}\n`;
			
			serialMonitor += newLine;
			serialMessages = [...serialMessages, {timestamp, message: randomMessage}];
		}, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds
	}
	
	function uploadCode() {
		console.log('Upload button clicked'); // Debug log
		isUploading = true;
		// Simulate upload process with more realistic timing
		setTimeout(() => {
			isUploading = false;
			const timestamp = new Date().toLocaleTimeString();
			serialMonitor += `[${timestamp}] Code uploaded successfully to ${connectedBoard}\n`;
			serialMonitor += `[${timestamp}] Sketch uses 924 bytes (2%) of program storage space\n`;
			serialMonitor += `[${timestamp}] Global variables use 9 bytes (0%) of dynamic memory\n\n`;
			
			// Start serial simulation after upload
			setTimeout(startSerialSimulation, 1000);
			
			console.log('Dispatching uploadComplete event'); // Debug log
			// Dispatch upload completion event to parent component
			dispatch('uploadComplete');
		}, 2500);
	}
	
	function selectBoard() {
		const boards = [
			"Arduino Uno", 
			"Arduino Nano", 
			"ESP32 DevKit", 
			"Arduino Mega 2560",
			"NodeMCU",
			"Arduino Leonardo"
		];
		const currentIndex = boards.indexOf(connectedBoard);
		const nextIndex = (currentIndex + 1) % boards.length;
		connectedBoard = boards[nextIndex];
		
		// Update serial monitor header
		if (showSerialMonitor) {
			const timestamp = new Date().toLocaleTimeString();
			serialMonitor += `[${timestamp}] Switched to ${connectedBoard}\n`;
		}
	}
	
	function compileCode() {
		isCompiling = true;
		compilationStatus = 'Compiling...';
		
		// Simulate compilation with realistic messages
		setTimeout(() => {
			const lines = codeContent.split('\n').length;
			const size = new Blob([codeContent]).size;
			
			isCompiling = false;
			compilationStatus = `Compilation successful! ${lines} lines, ${size} bytes`;
			
			setTimeout(() => {
				compilationStatus = 'Ready';
			}, 4000);
		}, 2000 + Math.random() * 1000);
	}
	
	function toggleSerialMonitor() {
		console.log('toggleSerialMonitor called, current state:', showSerialMonitor, 'minimized:', isSerialMonitorMinimized);
		
		if (!showSerialMonitor) {
			// Open
			showSerialMonitor = true;
			isSerialMonitorMinimized = false;
			const timestamp = new Date().toLocaleTimeString();
			serialMonitor = `[${timestamp}] Serial Monitor connected to ${connectedBoard}\n`;
			serialMonitor += `[${timestamp}] Baud rate: 9600\n\n`;
			
			// Start simulation if connected
			if (isConnected) {
				startSerialSimulation();
			}
		} else if (!isSerialMonitorMinimized) {
			// Minimize
			isSerialMonitorMinimized = true;
		} else {
			// Close completely
			showSerialMonitor = false;
			isSerialMonitorMinimized = false;
		}
		
		console.log('toggleSerialMonitor new state:', showSerialMonitor, 'minimized:', isSerialMonitorMinimized);
	}
	
	function minimizeSerialMonitor() {
		console.log('minimizeSerialMonitor called, current minimized state:', isSerialMonitorMinimized);
		isSerialMonitorMinimized = !isSerialMonitorMinimized;
		console.log('minimizeSerialMonitor new state:', isSerialMonitorMinimized);
	}
	
	function clearSerialMonitor() {
		serialMonitor = '';
		serialMessages = [];
		const timestamp = new Date().toLocaleTimeString();
		serialMonitor = `[${timestamp}] Serial Monitor cleared\n\n`;
	}
	
	function sendSerialCommand(event: KeyboardEvent | MouseEvent) {
		if ((event instanceof KeyboardEvent && event.key === 'Enter') || event.type === 'click') {
			const target = event.target as HTMLElement;
			if (!target) return;
			
			const input = target.previousElementSibling || target.parentElement?.querySelector('input');
			if (!input) return;
			
			const command = (input as HTMLInputElement).value.trim();
			
			if (command) {
				const timestamp = new Date().toLocaleTimeString();
				serialMonitor += `[${timestamp}] > ${command}\n`;
				
				// Simulate device response
				setTimeout(() => {
					const responses = [
						'Command received',
						'OK',
						'Processing...',
						'Value updated',
						'Error: Unknown command',
						'Status: Ready'
					];
					const response = responses[Math.floor(Math.random() * responses.length)];
					const responseTime = new Date().toLocaleTimeString();
					serialMonitor += `[${responseTime}] < ${response}\n`;
				}, 200 + Math.random() * 800);
				
				(input as HTMLInputElement).value = '';
			}
		}
	}
</script>

<div class="ide-container">
	<!-- IDE Header - Same style as chat header -->
	<header class="ide-header">
		<div class="header-left">
			<h1>Arduino IDE</h1>
		</div>
		<div class="header-actions">
			<button class="action-btn" on:click={selectBoard}>
				{connectedBoard}
				<div class="connection-status {isConnected ? 'connected' : 'disconnected'}"></div>
			</button>
			<button class="action-btn" on:click={compileCode} disabled={isCompiling}>
				{#if isCompiling}
					<div class="compile-spinner"></div>
				{:else}
					Verify
				{/if}
			</button>
			<button class="action-btn" on:click={uploadCode} disabled={isUploading || isCompiling}>
				{#if isUploading}
					<div class="upload-spinner"></div>
				{:else}
					Upload
				{/if}
			</button>
		</div>
	</header>
	
	<!-- Code Editor Area -->
	<div class="editor-area">
		<div class="line-numbers" bind:this={lineNumbers}>
			{#each codeContent.split('\n') as line, i}
				<div class="line-number">{i + 1}</div>
			{/each}
		</div>
		<div class="editor-container">
			<!-- Syntax highlighting overlay -->
			<pre class="syntax-highlight"><code class="language-cpp">{@html highlightedCode}</code></pre>
			<!-- Textarea for editing -->
			<textarea
				bind:this={codeEditor}
				bind:value={codeContent}
				class="code-editor"
				spellcheck="false"
				on:input={handleCodeInput}
				on:scroll={handleScroll}
			></textarea>
		</div>
	</div>
	
	<!-- IDE Footer -->
	<footer class="ide-footer">
		<div class="footer-left">
			<div class="status-info">
				<span class="status-item">Lines: {codeContent.split('\n').length}</span>
				<span class="status-item">Size: {new Blob([codeContent]).size} bytes</span>
			</div>
		</div>
		<div class="footer-right">
			<button class="footer-btn" on:click={toggleSerialMonitor}>
				{showSerialMonitor ? (isSerialMonitorMinimized ? 'Maximize' : 'Minimize') : 'Show'} Serial Monitor
			</button>
		</div>
	</footer>
	
	<!-- Serial Monitor -->
	{#if showSerialMonitor}
		<div class="serial-monitor" class:minimized={isSerialMonitorMinimized}>
			<div class="serial-header">
				<h3>Serial Monitor - {connectedBoard}</h3>
				<div class="serial-controls">
					{#if !isSerialMonitorMinimized}
						<select class="baud-rate">
							<option value="9600">9600 baud</option>
							<option value="115200">115200 baud</option>
							<option value="57600">57600 baud</option>
						</select>
						<button class="serial-btn" on:click={clearSerialMonitor}>Clear</button>
					{/if}
					<button class="serial-btn minimize" on:click={minimizeSerialMonitor}>
						{isSerialMonitorMinimized ? '↑' : '↓'}
					</button>
					<button class="serial-btn close" on:click={toggleSerialMonitor}>×</button>
				</div>
			</div>
			{#if !isSerialMonitorMinimized}
				<div class="serial-output">
					<pre>{serialMonitor}</pre>
				</div>
				<div class="serial-input">
					<input 
						type="text" 
						placeholder="Send to {connectedBoard}..." 
						on:keypress={sendSerialCommand}
					/>
					<button class="send-btn" on:click={sendSerialCommand}>Send</button>
				</div>
			{/if}
		</div>
	{/if}
	
	<!-- Compilation Status Overlay -->
	{#if isCompiling || compilationStatus !== 'Ready'}
		<div class="compilation-overlay">
			<div class="compilation-popup">
				{#if isCompiling}
					<div class="compiling">
						<div class="compile-spinner"></div>
						<span>Compiling code...</span>
					</div>
				{:else}
					<div class="status-message" class:success={compilationStatus.includes('successful')}>
						{compilationStatus}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.ide-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		max-width: 100%;
		background: #191919;
		overflow: hidden;
		font-family: 'Inter', sans-serif;
	}
	
	/* IDE Header - Same style as chat header */
	.ide-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(237, 247, 96, 0.2);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #1F1F1F;
		backdrop-filter: blur(8px);
	}
	
	.ide-header h1 {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: #EDF760;
	}
	
	.header-actions {
		display: flex;
		gap: 1rem;
	}
	
	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		background: rgba(237, 247, 96, 0.1);
		border: 2px solid rgba(237, 247, 96, 0.5);
		border-radius: 10px;
		color: #EDF760;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		min-width: 100px;
	}
	
	.action-btn:hover:not(:disabled) {
		background: #EDF760;
		border-color: #EDF760;
		color: #191919;
		transform: translateY(-2px);
	}
	
	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
	
	.connection-status {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		position: absolute;
		top: 8px;
		right: 8px;
	}
	
	.connection-status.connected {
		background: #EDF760;
		box-shadow: 0 0 8px rgba(237, 247, 96, 0.6);
	}
	
	.connection-status.disconnected {
		background: #ef4444;
		box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
	}
	
	.compile-spinner, .upload-spinner {
		width: 12px;
		height: 12px;
		border: 2px solid transparent;
		border-top: 2px solid #EDF760;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	/* Editor Area */
	.editor-area {
		flex: 1;
		display: flex;
		background: #191919;
		overflow: hidden;
		min-height: 0;
	}
	
	.line-numbers {
		background: #1F1F1F;
		border-right: 1px solid rgba(237, 247, 96, 0.2);
		padding: 1rem 0;
		min-width: 60px;
		display: flex;
		flex-direction: column;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		color: rgba(202, 189, 245, 0.6);
		user-select: none;
		overflow: hidden;
		flex-shrink: 0;
		will-change: scroll-position;
		transform: translate3d(0, 0, 0);
	}
	
	.line-number {
		height: 1.5rem;
		padding: 0 1rem;
		text-align: right;
		line-height: 1.5;
		white-space: nowrap;
	}
	
	.editor-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}
	
	.syntax-highlight {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: 0;
		padding: 1rem;
		background: transparent;
		color: transparent;
		pointer-events: none;
		overflow: auto;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		z-index: 1;
		will-change: scroll-position;
		transform: translate3d(0, 0, 0);
	}
	
	.syntax-highlight code {
		background: transparent;
		padding: 0;
		margin: 0;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}
	
	/* Override Prism.js default styles for dark theme */
	.syntax-highlight :global(.token.comment),
	.syntax-highlight :global(.token.prolog),
	.syntax-highlight :global(.token.doctype),
	.syntax-highlight :global(.token.cdata) {
		color: #6b7280 !important;
	}
	
	.syntax-highlight :global(.token.punctuation) {
		color: #d1d5db !important;
	}
	
	.syntax-highlight :global(.token.property),
	.syntax-highlight :global(.token.tag),
	.syntax-highlight :global(.token.boolean),
	.syntax-highlight :global(.token.number),
	.syntax-highlight :global(.token.constant),
	.syntax-highlight :global(.token.symbol),
	.syntax-highlight :global(.token.deleted) {
		color: #f87171 !important;
	}
	
	.syntax-highlight :global(.token.selector),
	.syntax-highlight :global(.token.attr-name),
	.syntax-highlight :global(.token.string),
	.syntax-highlight :global(.token.char),
	.syntax-highlight :global(.token.builtin),
	.syntax-highlight :global(.token.inserted) {
		color: #34d399 !important;
	}
	
	.syntax-highlight :global(.token.operator),
	.syntax-highlight :global(.token.entity),
	.syntax-highlight :global(.token.url),
	.syntax-highlight :global(.token.variable) {
		color: #60a5fa !important;
	}
	
	.syntax-highlight :global(.token.atrule),
	.syntax-highlight :global(.token.attr-value),
	.syntax-highlight :global(.token.function),
	.syntax-highlight :global(.token.class-name) {
		color: #fbbf24 !important;
	}
	
	.syntax-highlight :global(.token.keyword) {
		color: #a78bfa !important;
		font-weight: 600;
	}
	
	.syntax-highlight :global(.token.regex),
	.syntax-highlight :global(.token.important) {
		color: #f59e0b !important;
	}
	
	.syntax-highlight :global(.token.important),
	.syntax-highlight :global(.token.bold) {
		font-weight: bold;
	}
	
	.syntax-highlight :global(.token.italic) {
		font-style: italic;
	}
	
	.code-editor {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		border: none;
		padding: 1rem;
		color: transparent;
		caret-color: #EDF760;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		line-height: 1.5;
		resize: none;
		outline: none;
		overflow: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		z-index: 2;
		will-change: scroll-position;
		transform: translate3d(0, 0, 0);
	}
	
	.code-editor::selection {
		background: rgba(237, 247, 96, 0.3);
		color: transparent;
	}
	
	.code-editor:focus {
		background: transparent;
	}
	
	/* IDE Footer */
	.ide-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: #1F1F1F;
		border-top: 1px solid rgba(237, 247, 96, 0.2);
	}
	
	.status-info {
		display: flex;
		gap: 1.5rem;
	}
	
	.status-item {
		font-size: 0.85rem;
		color: rgba(202, 189, 245, 0.8);
		font-family: 'Inter', sans-serif;
	}
	
	.footer-right {
		display: flex;
		gap: 1rem;
	}
	
	.footer-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		background: rgba(202, 189, 245, 0.1);
		border: 2px solid rgba(202, 189, 245, 0.5);
		border-radius: 10px;
		color: #CABDF5;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		min-width: 140px;
	}
	
	.footer-btn:hover:not(:disabled) {
		background: #CABDF5;
		border-color: #CABDF5;
		color: #191919;
		transform: translateY(-2px);
	}
	
	.footer-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	
	/* Serial Monitor */
	.serial-monitor {
		background: #1F1F1F;
		border-top: 1px solid rgba(237, 247, 96, 0.3);
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		animation: slide-down 0.4s ease-out;
		transition: all 0.3s ease;
	}
	
	/* Minimized Serial Monitor */
	.serial-monitor.minimized {
		flex: 0;
		min-height: auto;
		height: auto;
		overflow: hidden;
	}
	
	.serial-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: rgba(237, 247, 96, 0.1);
		border-bottom: 1px solid rgba(237, 247, 96, 0.3);
		border-top-left-radius: 12px;
		border-top-right-radius: 12px;
	}
	
	.serial-header h3 {
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: #EDF760;
	}
	
	.serial-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		z-index: 100;
		position: relative;
	}
	
	.baud-rate {
		padding: 0.5rem;
		background: #191919;
		border: 1px solid rgba(237, 247, 96, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
	}
	
	.serial-btn {
		padding: 0.5rem 1rem;
		background: rgba(237, 247, 96, 0.2);
		border: 1px solid rgba(237, 247, 96, 0.3);
		border-radius: 6px;
		color: #EDF760;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		font-size: 0.85rem;
		transition: all 0.2s ease;
	}
	
	.serial-btn:hover {
		background: rgba(237, 247, 96, 0.3);
		border-color: #EDF760;
	}
	
	.serial-btn.close {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.3);
		font-size: 1.2rem;
		padding: 0.3rem 0.8rem;
		z-index: 1000;
		position: relative;
		min-width: 32px;
		min-height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.serial-btn.close:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: #ef4444;
	}
	
	.serial-btn.minimize {
		background: rgba(237, 247, 96, 0.2);
		border-color: rgba(237, 247, 96, 0.3);
		font-size: 1.1rem;
		padding: 0.4rem 0.8rem;
		min-width: 32px;
		min-height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: #EDF760;
	}
	
	.serial-btn.minimize:hover {
		background: rgba(237, 247, 96, 0.3);
		border-color: #EDF760;
	}
	
	.serial-output {
		flex: 1;
		padding: 1rem 1.5rem;
		overflow-y: auto;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		color: #e2e8f0;
		background: #191919;
		line-height: 1.4;
	}
	
	.serial-output pre {
		margin: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
	
	.serial-input {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		background: #1F1F1F;
		border-top: 1px solid rgba(237, 247, 96, 0.3);
	}
	
	.serial-input input {
		flex: 1;
		padding: 0.75rem;
		background: #191919;
		border: 1px solid rgba(237, 247, 96, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		outline: none;
	}
	
	.serial-input input:focus {
		border-color: #EDF760;
		box-shadow: 0 0 0 2px rgba(237, 247, 96, 0.2);
	}
	
	.send-btn {
		padding: 0.75rem 1.5rem;
		background: #ECF65F;
		border: none;
		border-radius: 6px;
		color: #191919;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.3s ease;
	}
	
	.send-btn:hover {
		background: #E8F049;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(236, 246, 95, 0.3);
	}
	
	/* Compilation Status */
	.compilation-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		animation: fade-in 0.3s ease-out;
	}
	
	.compilation-popup {
		background: #1F1F1F;
		border: 1px solid rgba(237, 247, 96, 0.3);
		border-radius: 12px;
		padding: 2rem 3rem;
		box-shadow: 0 8px 32px rgba(237, 247, 96, 0.3);
		backdrop-filter: blur(10px);
		text-align: center;
	}
	
	.compiling {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		color: #e2e8f0;
	}
	
	.status-message {
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		color: #e2e8f0;
		padding: 1rem 2rem;
	}
	
	.status-message.success {
		color: #EDF760;
		font-weight: 600;
	}
	
	/* Animations */
	@keyframes fade-in {
		0% { opacity: 0; }
		100% { opacity: 1; }
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	@keyframes slide-up {
		0% {
			transform: translateY(100%);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	@keyframes slide-down {
		0% {
			opacity: 0;
			transform: scaleY(0);
		}
		100% {
			opacity: 1;
			transform: scaleY(1);
		}
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.ide-header {
			padding: 0.75rem 1rem;
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}
		
		.header-left {
			width: 100%;
		}
		
		.ide-footer {
			padding: 0.75rem 1rem;
			flex-direction: column;
			gap: 1rem;
		}
		
		.status-info {
			justify-content: center;
		}
		
		
		.serial-monitor {
			width: 100%;
			flex: 1;
			min-height: 200px;
			max-height: 60%;
		}
	}
	
</style>
