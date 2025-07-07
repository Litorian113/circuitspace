<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	let projectInput = '';
	let isTransitioning = false;
	
	async function handleProjectSubmit() {
		if (projectInput.trim() && !isTransitioning) {
			isTransitioning = true;
			
			// Start the page transition animation
			await new Promise(resolve => setTimeout(resolve, 600));
			
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

<!-- Sidebar Navigation -->
<Sidebar />

<!-- Main Content with Sidebar Offset -->
<main class="main-container">
	<div class="header-section">
		<h1 class="main-title">Welcome to Circuitspace</h1>
		<p class="subtitle">Build, Learn, and Create Electronic Circuits</p>
	</div>
	
	<div class="content-grid">
		<!-- Quick Start Card -->
		<div class="card quick-start-card">
			<h2>🚀 Quick Start</h2>
			<div class="input-section">
				<textarea 
					bind:value={projectInput}
					placeholder="Describe your circuit project idea..."
					class="project-input"
					rows="4"
				></textarea>
				<button 
					class="btn-primary" 
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
		
		<!-- Components Card -->
		<div class="card">
			<h2>🔧 Components</h2>
			<p>Explore our comprehensive component library and learn about electronic components, their functions, and how to use them in your projects.</p>
			<button class="btn-outline" on:click={goToComponents}>
				Explore Components
			</button>
		</div>
		
		<!-- Circuit Designer Card -->
		<div class="card">
			<h2>⚡ Circuit Designer</h2>
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
		
		<!-- Templates Card -->
		<div class="card">
			<h2>📋 Project Templates</h2>
			<p>Browse our collection of ready-to-build project templates. From beginner LED controllers to advanced IoT systems.</p>
			<button class="btn-outline" on:click={goToTemplates}>
				Browse Templates
			</button>
		</div>
		
		<!-- Features Grid -->
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🤖</div>
				<h3>AI-Powered</h3>
				<p>Get intelligent suggestions and help from our AI assistant</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎯</div>
				<h3>Interactive</h3>
				<p>Build and test circuits in real-time with visual feedback</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📚</div>
				<h3>Educational</h3>
				<p>Learn electronics with step-by-step tutorials and guides</p>
			</div>
		</div>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'IBM Plex Mono', monospace;
		background: linear-gradient(135deg, #000428 0%, #004e92 25%, #009ffd 50%, #00d2ff 75%, #ffffff 100%);
		background-size: 300% 300%;
		animation: gradientShift 15s ease infinite;
		color: rgba(255, 255, 255, 0.9);
		overflow-x: hidden;
		overflow-y: auto;
		min-height: 100vh;
		position: relative;
	}
	
	:global(body::before) {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: 
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.3) 0%, transparent 50%);
		pointer-events: none;
		z-index: -1;
	}
	
	/* Page Transition Styles */
	.transition-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
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
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(20px);
	}
	
	.circuit-wave {
		position: absolute;
		border: 2px solid rgba(120, 119, 198, 0.8);
		border-radius: 50%;
		animation: circuitPulse 2s infinite ease-out;
		box-shadow: 0 0 20px rgba(120, 119, 198, 0.3);
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
		background: linear-gradient(135deg, rgba(120, 119, 198, 1), rgba(255, 119, 198, 1));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
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
		background: linear-gradient(135deg, rgba(120, 119, 198, 0.8), rgba(255, 119, 198, 0.8));
		border-radius: 50%;
		animation: dotBounce 1.4s infinite ease-in-out both;
		box-shadow: 0 0 10px rgba(120, 119, 198, 0.5);
	}
	
	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }
	.dot:nth-child(3) { animation-delay: 0s; }
	
	/* Main Content */
	.main-container {
		margin-left: 280px;
		min-height: 100vh;
		padding: 4rem 3rem;
		position: relative;
		z-index: 1;
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
		margin: 0 0 1rem 0;
		background: linear-gradient(135deg, rgba(120, 119, 198, 1) 0%, rgba(255, 119, 198, 1) 50%, rgba(120, 219, 226, 1) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 0 40px rgba(120, 119, 198, 0.4);
		filter: drop-shadow(0 4px 8px rgba(120, 119, 198, 0.2));
	}
	
	.subtitle {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
	}
	
	.content-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}
	
	.quick-start-card {
		grid-column: 1 / -1;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.card {
		background: rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(60px) saturate(200%);
		-webkit-backdrop-filter: blur(60px) saturate(200%);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 20px;
		padding: 2rem;
		transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow: 
			0 16px 32px rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(255, 255, 255, 0.05);
		position: relative;
		overflow: hidden;
	}
	
	.card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.card:hover {
		border-color: rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.08);
		box-shadow: 
			0 24px 48px rgba(31, 38, 135, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(255, 255, 255, 0.1),
			0 0 80px rgba(120, 119, 198, 0.1);
		transform: translateY(-8px) scale(1.02);
	}
	
	.card:hover::before {
		opacity: 1;
	}
	
	.card h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		background: linear-gradient(135deg, rgba(120, 119, 198, 1), rgba(255, 119, 198, 1));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.card p {
		line-height: 1.6;
		margin-bottom: 2rem;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.input-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.project-input {
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(30px);
		-webkit-backdrop-filter: blur(30px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1rem;
		color: rgba(255, 255, 255, 0.9);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		resize: vertical;
		min-height: 100px;
		transition: all 0.3s ease;
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 4px 20px rgba(0, 0, 0, 0.05);
	}
	
	.project-input:focus {
		outline: none;
		border-color: rgba(120, 119, 198, 0.5);
		background: rgba(255, 255, 255, 0.06);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 0 0 3px rgba(120, 119, 198, 0.1),
			0 8px 32px rgba(120, 119, 198, 0.1);
	}
	
	.project-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	
	.demo-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.features-grid {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}
	
	.feature-card {
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(30px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.5rem;
		text-align: center;
		transition: all 0.3s ease;
	}
	
	.feature-card:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-4px);
	}
	
	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}
	
	.feature-card h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.feature-card p {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.5;
	}
	
	/* Buttons */
	.btn-primary, .btn-outline {
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		border: none;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		font-size: 1rem;
		position: relative;
		overflow: hidden;
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}
	
	.btn-primary {
		background: linear-gradient(135deg, rgba(120, 119, 198, 0.8) 0%, rgba(255, 119, 198, 0.8) 100%);
		color: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px rgba(120, 119, 198, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		width: 100%;
	}
	
	.btn-primary::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}
	
	.btn-primary:hover:not(:disabled) {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 
			0 12px 40px rgba(120, 119, 198, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		background: linear-gradient(135deg, rgba(120, 119, 198, 0.9) 0%, rgba(255, 119, 198, 0.9) 100%);
	}
	
	.btn-primary:hover::before {
		left: 100%;
	}
	
	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-primary.transitioning {
		background: rgba(120, 119, 198, 0.1);
		border-color: rgba(120, 119, 198, 0.6);
		transform: scale(0.98);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.button-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(120, 119, 198, 0.3);
		border-top: 2px solid rgba(120, 119, 198, 1);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	.btn-outline {
		background: rgba(255, 255, 255, 0.02);
		color: rgba(120, 119, 198, 1);
		border: 1px solid rgba(120, 119, 198, 0.4);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 4px 20px rgba(0, 0, 0, 0.05);
		width: 100%;
	}
	
	.btn-outline:hover {
		background: rgba(120, 119, 198, 0.08);
		border-color: rgba(120, 119, 198, 0.6);
		transform: translateY(-2px);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 8px 32px rgba(120, 119, 198, 0.2);
	}
	
	/* Animations */
	@keyframes gradientShift {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}
	
	@keyframes fadeInOverlay {
		from {
			opacity: 0;
			backdrop-filter: blur(0px);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(40px);
		}
	}
	
	@keyframes circuitPulse {
		0% {
			transform: scale(0.8);
			opacity: 1;
			border-color: rgba(120, 119, 198, 0.8);
		}
		50% {
			transform: scale(1.1);
			opacity: 0.6;
			border-color: rgba(255, 119, 198, 0.8);
		}
		100% {
			transform: scale(1.3);
			opacity: 0;
			border-color: rgba(120, 219, 226, 0.4);
		}
	}
	
	@keyframes textGlow {
		0%, 100% {
			filter: drop-shadow(0 0 10px rgba(120, 119, 198, 0.4));
		}
		50% {
			filter: drop-shadow(0 0 20px rgba(120, 119, 198, 0.6)) drop-shadow(0 0 30px rgba(255, 119, 198, 0.3));
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
	@media (max-width: 1024px) {
		.main-container {
			margin-left: 0;
			padding: 2rem 1.5rem;
		}
		
		.content-grid {
			grid-template-columns: 1fr;
		}
		
		.features-grid {
			grid-template-columns: 1fr;
		}
	}
	
	@media (max-width: 768px) {
		.main-container {
			padding: 1.5rem 1rem;
		}
		
		.header-section {
			margin-bottom: 2rem;
		}
		
		.card {
			padding: 1.5rem;
		}
		
		.demo-buttons {
			gap: 0.75rem;
		}
	}
	
	@media (max-width: 480px) {
		.main-container {
			padding: 1rem 0.5rem;
		}
		
		.card {
			padding: 1rem;
		}
		
		.content-grid {
			gap: 1.5rem;
		}
	}
</style>
