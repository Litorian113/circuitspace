<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	let showConnectionModal = true;
	let autoConnect = false;
	let projectInput = '';
	let isTransitioning = false;
	
	onMount(() => {
		// Check if user has previously set auto-connect
		const savedAutoConnect = localStorage.getItem('circuitspace-autoconnect');
		if (savedAutoConnect === 'true') {
			showConnectionModal = false;
		}
	});
	
	function handleConnectionClose() {
		showConnectionModal = false;
		if (autoConnect) {
			localStorage.setItem('circuitspace-autoconnect', 'true');
		}
	}
	
	async function handleProjectSubmit() {
		if (projectInput.trim() && !isTransitioning) {
			isTransitioning = true;
			
			// Start the page transition animation
			await new Promise(resolve => setTimeout(resolve, 600)); // Wait for animation
			
			// Navigate to the new page
			goto(`/project-chat?prompt=${encodeURIComponent(projectInput)}`);
		}
	}
	
	function goToComponents() {
		goto('/components/overview');
	}
	
	function goToTemplates() {
		goto('/templates');
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Connection Modal -->
{#if showConnectionModal}
	<div class="modal-overlay">
		<div class="modal">
			<div class="modal-header">
				<div class="status-indicator connected"></div>
				<h3>Connected to Workstation</h3>
			</div>
			<div class="modal-body">
				<p>Your Circuitspace workstation is ready for action!</p>
				<label class="checkbox-container">
					<input type="checkbox" bind:checked={autoConnect}>
					<span class="checkmark"></span>
					Connect automatically on next visit
				</label>
			</div>
			<div class="modal-footer">
				<button class="btn-primary" on:click={handleConnectionClose}>
					Continue to Workspace
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Page Transition Overlay -->
{#if isTransitioning}
	<div class="transition-overlay">
		<div class="transition-content">
			<div class="loading-circuit">
				<div class="circuit-wave wave-1"></div>
				<div class="circuit-wave wave-2"></div>
				<div class="circuit-wave wave-3"></div>
			</div>
			<h3 class="transition-text">Initializing Project...</h3>
			<div class="loading-dots">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
	</div>
{/if}

<!-- Animated Background -->
<div class="circuit-bg">
	<div class="circuit-line line-1"></div>
	<div class="circuit-line line-2"></div>
	<div class="circuit-line line-3"></div>
	<div class="circuit-line line-4"></div>
	<div class="circuit-node node-1"></div>
	<div class="circuit-node node-2"></div>
	<div class="circuit-node node-3"></div>
</div>

<!-- Main Content -->
<main class="main-container">
	<div class="header-section">
		<h1 class="main-title">Welcome to Circuitspace</h1>
		<div class="subtitle-glow"></div>
	</div>
	
	<div class="content-grid">
		<!-- Left Column: New Project -->
		<div class="card project-card">
			<h2>Want to start a new Project?</h2>
			<div class="input-section">
				<textarea 
					bind:value={projectInput}
					placeholder="Describe your circuit project idea..."
					class="project-input"
					rows="4"
				></textarea>
				<button 
					class="btn-secondary" 
					class:transitioning={isTransitioning}
					on:click={handleProjectSubmit}
					disabled={!projectInput.trim() || isTransitioning}
				>
					{#if isTransitioning}
						<span class="button-spinner"></span>
						Launching...
					{:else}
						Start Planning
					{/if}
				</button>
			</div>
		</div>
		
		<!-- Right Column: Learn Components -->
		<div class="card components-card">
			<h2>Want to learn more about components?</h2>
			<p>Explore our comprehensive component library and learn about electronic components, their functions, and how to use them in your projects.</p>
			<button class="btn-outline" on:click={goToComponents}>
				Explore Components
			</button>
		</div>
		
		<!-- Demo Circuit Designer -->
		<div class="card demo-card">
			<h2>🔧 Circuit Designer Demo</h2>
			<p>Test the new Pin-Out system with the LED Dimmer project. See how components connect with Arduino Leonardo.</p>
			<div class="demo-buttons">
				<button class="btn-outline" on:click={() => goto('/demo-connections')}>
					📋 View Pin-Out Demo
				</button>
				<button class="btn-outline" on:click={() => goto('/test-circuit')}>
					🛠️ Test Circuit Designer
				</button>
			</div>
		</div>
		
		<!-- Third Column: Project Templates -->
		<div class="card templates-card">
			<h2>Need inspiration?</h2>
			<p>Browse our collection of ready-to-build project templates. From beginner LED controllers to advanced IoT systems.</p>
			<button class="btn-outline" on:click={goToTemplates}>
				Browse Templates
			</button>
		</div>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'IBM Plex Mono', monospace;
		background: #0a0f1a;
		color: #e2e8f0;
		overflow-x: hidden;
		overflow-y: auto;
		min-height: 100vh;
	}
	
	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(10, 15, 26, 0.8);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	
	.modal {
		background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
		border: 1px solid #00d4aa;
		border-radius: 16px;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 20px 40px rgba(0, 212, 170, 0.1);
	}
	
	.modal-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 1.5rem;
	}
	
	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #00d4aa;
		box-shadow: 0 0 12px #00d4aa;
		animation: pulse 2s infinite;
	}
	
	.modal h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #00d4aa;
	}
	
	.modal-body p {
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}
	
	.checkbox-container {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		user-select: none;
	}
	
	.checkbox-container input {
		display: none;
	}
	
	.checkmark {
		width: 20px;
		height: 20px;
		border: 2px solid #00d4aa;
		border-radius: 4px;
		position: relative;
		transition: all 0.2s ease;
	}
	
	.checkbox-container input:checked + .checkmark {
		background: #00d4aa;
	}
	
	.checkbox-container input:checked + .checkmark::after {
		content: '✓';
		position: absolute;
		color: #0a0f1a;
		font-size: 14px;
		font-weight: bold;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	
	.modal-footer {
		margin-top: 2rem;
	}
	
	/* Page Transition Styles */
	.transition-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #0a0f1a 0%, #1e293b 50%, #0f172a 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		animation: fadeInOverlay 0.3s ease-out;
	}
	
	.transition-content {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}
	
	.loading-circuit {
		position: relative;
		width: 120px;
		height: 120px;
		border: 2px solid rgba(0, 212, 170, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.circuit-wave {
		position: absolute;
		border: 2px solid #00d4aa;
		border-radius: 50%;
		animation: circuitPulse 2s infinite ease-out;
	}
	
	.wave-1 {
		width: 60px;
		height: 60px;
		animation-delay: 0s;
	}
	
	.wave-2 {
		width: 80px;
		height: 80px;
		animation-delay: 0.3s;
	}
	
	.wave-3 {
		width: 100px;
		height: 100px;
		animation-delay: 0.6s;
	}
	
	.transition-text {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #00d4aa;
		margin: 0;
		animation: textGlow 2s infinite ease-in-out;
	}
	
	.loading-dots {
		display: flex;
		gap: 0.5rem;
	}
	
	.dot {
		width: 8px;
		height: 8px;
		background: #00d4aa;
		border-radius: 50%;
		animation: dotBounce 1.4s infinite ease-in-out both;
	}
	
	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }
	.dot:nth-child(3) { animation-delay: 0s; }
	
	/* Circuit Background Animation */
	.circuit-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 0;
	}
	
	.circuit-line {
		position: absolute;
		background: linear-gradient(90deg, transparent, #00d4aa, transparent);
		opacity: 0.3;
	}
	
	.line-1 {
		width: 300px;
		height: 2px;
		top: 20%;
		left: 10%;
		animation: circuit-flow 4s infinite;
	}
	
	.line-2 {
		width: 2px;
		height: 200px;
		top: 30%;
		right: 20%;
		background: linear-gradient(0deg, transparent, #00d4aa, transparent);
		animation: circuit-flow-vertical 3s infinite reverse;
	}
	
	.line-3 {
		width: 250px;
		height: 2px;
		bottom: 25%;
		right: 15%;
		animation: circuit-flow 5s infinite;
	}
	
	.line-4 {
		width: 2px;
		height: 150px;
		bottom: 20%;
		left: 25%;
		background: linear-gradient(0deg, transparent, #00d4aa, transparent);
		animation: circuit-flow-vertical 3.5s infinite;
	}
	
	.circuit-node {
		position: absolute;
		width: 8px;
		height: 8px;
		background: #00d4aa;
		border-radius: 50%;
		box-shadow: 0 0 12px #00d4aa;
		animation: node-pulse 2s infinite;
	}
	
	.node-1 {
		top: 20%;
		left: 40%;
	}
	
	.node-2 {
		top: 60%;
		right: 30%;
	}
	
	.node-3 {
		bottom: 30%;
		left: 60%;
	}
	
	/* Main Content */
	.main-container {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		padding: 4rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
	}
	
	.header-section {
		text-align: center;
		margin-bottom: 4rem;
		position: relative;
	}
	
	.main-title {
		font-family: 'Space Grotesk', sans-serif;
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 700;
		margin: 0;
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 0 30px rgba(0, 212, 170, 0.3);
	}
	
	.subtitle-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 200px;
		height: 2px;
		background: linear-gradient(90deg, transparent, #00d4aa, transparent);
		opacity: 0.6;
		animation: glow-pulse 3s infinite;
	}
	
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
		gap: 2rem;
		max-width: 1200px;
		width: 100%;
	}
	
	.project-card {
		grid-column: 1 / -1; /* Nimmt die gesamte erste Zeile ein */
	}
	
	.demo-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.card {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
		backdrop-filter: blur(16px);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 16px;
		padding: 2rem;
		transition: all 0.3s ease;
	}
	
	.card:hover {
		border-color: rgba(0, 212, 170, 0.4);
		box-shadow: 0 8px 32px rgba(0, 212, 170, 0.1);
		transform: translateY(-4px);
	}
	
	.card h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		color: #00d4aa;
	}
	
	.card p {
		line-height: 1.6;
		margin-bottom: 2rem;
		opacity: 0.9;
	}
	
	.input-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.project-input {
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		padding: 1rem;
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		resize: vertical;
		min-height: 100px;
		transition: all 0.2s ease;
	}
	
	.project-input:focus {
		outline: none;
		border-color: #00d4aa;
		box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.1);
	}
	
	.project-input::placeholder {
		color: rgba(226, 232, 240, 0.5);
	}
	
	/* Buttons */
	.btn-primary, .btn-secondary, .btn-outline {
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 1rem;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		color: #0a0f1a;
	}
	
	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 212, 170, 0.3);
	}
	
	.btn-secondary {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		border: 1px solid rgba(0, 212, 170, 0.3);
		width: fit-content;
		align-self: flex-start;
	}
	
	.btn-secondary:hover:not(:disabled) {
		background: rgba(0, 212, 170, 0.2);
		border-color: #00d4aa;
	}
	
	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-secondary.transitioning {
		background: rgba(0, 212, 170, 0.3);
		border-color: #00d4aa;
		transform: scale(0.98);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.button-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(0, 212, 170, 0.3);
		border-top: 2px solid #00d4aa;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	.btn-outline {
		background: transparent;
		color: #00d4aa;
		border: 1px solid #00d4aa;
	}
	
	.btn-outline:hover {
		background: rgba(0, 212, 170, 0.1);
		transform: translateY(-2px);
	}
	
	/* Animations */
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	@keyframes circuit-flow {
		0% { transform: translateX(-100px); opacity: 0; }
		50% { opacity: 1; }
		100% { transform: translateX(100px); opacity: 0; }
	}
	
	@keyframes circuit-flow-vertical {
		0% { transform: translateY(-100px); opacity: 0; }
		50% { opacity: 1; }
		100% { transform: translateY(100px); opacity: 0; }
	}
	
	@keyframes node-pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.2); opacity: 0.8; }
	}
	
	@keyframes glow-pulse {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 0.3; }
	}
	
	/* Transition Animations */
	@keyframes fadeInOverlay {
		from {
			opacity: 0;
			backdrop-filter: blur(0px);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(8px);
		}
	}
	
	@keyframes circuitPulse {
		0% {
			transform: scale(0.8);
			opacity: 1;
			border-color: #00d4aa;
		}
		50% {
			transform: scale(1.1);
			opacity: 0.6;
			border-color: #0ea5e9;
		}
		100% {
			transform: scale(1.3);
			opacity: 0;
			border-color: #00d4aa;
		}
	}
	
	@keyframes textGlow {
		0%, 100% {
			text-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
		}
		50% {
			text-shadow: 0 0 20px rgba(0, 212, 170, 0.8), 0 0 30px rgba(0, 212, 170, 0.4);
		}
	}
	
	@keyframes dotBounce {
		0%, 80%, 100% {
			transform: scale(0);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
			gap: 1.5rem;
		}
		
		.project-card {
			grid-column: 1; /* Auf mobilen Geräten normale Spalte */
		}
		
		.main-container {
			padding: 2rem 1rem;
			min-height: calc(100vh - 4rem);
		}
		
		.card {
			padding: 1.5rem;
		}
		
		.header-section {
			margin-bottom: 2rem;
		}
	}
	
	@media (max-width: 480px) {
		.main-container {
			padding: 1rem 0.5rem;
		}
		
		.card {
			padding: 1rem;
		}
		
		.demo-buttons {
			gap: 0.75rem;
		}
	}
</style>
