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
	<!-- Hero Section -->
	<section class="hero-section">
		<div class="container">
			<div class="hero-content">
				<h1 class="hero-title">Build Physical Prototypes with AI and AR Assistance</h1>
				<p class="hero-subtitle">For students, makers, and tinkerers. Get guidance, build smarter, and level up with every circuit.</p>
				
				<div class="project-start">
					<h2 class="project-start-title">Start Your Project</h2>
					<div class="chat-input-container">
						<div class="chat-input-wrapper">
							<textarea 
								bind:value={projectInput}
								placeholder="Tell me about your idea..."
								class="chat-input"
								rows="1"
							></textarea>
							<div class="chat-input-actions">
								<div class="left-actions">
									<button class="search-button" title="Search">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="11" cy="11" r="8"></circle>
											<path d="m21 21-4.35-4.35"></path>
										</svg>
									</button>
								</div>
								<div class="right-actions">
									<button class="attachment-button" title="Attach file">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
										</svg>
									</button>
									<button class="mic-button" title="Voice input">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
											<path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
											<line x1="12" y1="19" x2="12" y2="23"></line>
											<line x1="8" y1="23" x2="16" y2="23"></line>
										</svg>
									</button>
									<button 
										class="send-button" 
										class:transitioning={isTransitioning}
										on:click={handleProjectSubmit}
										disabled={!projectInput.trim() || isTransitioning}
										title="Send"
									>
										{#if isTransitioning}
											<span class="button-spinner"></span>
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
	</section>
	
	<!-- How It Works Section -->
	<section class="how-it-works-section">
		<div class="container">
			<div class="how-it-works-content">
				<h2 class="section-title">How It Works</h2>
				<div class="how-it-works-grid">
				<div class="work-card">
					<div class="work-card-image">🤖</div>
					<h3 class="work-card-title">AI-Powered Planning</h3>
					<p class="work-card-text">Describe your project idea and get intelligent component suggestions, wiring diagrams, and step-by-step guidance.</p>
				</div>
				<div class="work-card">
					<div class="work-card-image">🔧</div>
					<h3 class="work-card-title">Component Library</h3>
					<p class="work-card-text">Access our comprehensive database of electronic components with detailed specifications and usage examples.</p>
				</div>
				<div class="work-card">
					<div class="work-card-image">⚡</div>
					<h3 class="work-card-title">Circuit Designer</h3>
					<p class="work-card-text">Build and test your circuits virtually with our interactive designer before creating physical prototypes.</p>
				</div>
				<div class="work-card">
					<div class="work-card-image">�</div>
					<h3 class="work-card-title">AR Assistance</h3>
					<p class="work-card-text">Use augmented reality to overlay instructions and component information directly onto your physical workspace.</p>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', sans-serif;
		background: #191919;
		color: rgba(255, 255, 255, 0.9);
		overflow-x: hidden;
		min-height: 100vh;
	}
	
	:global(body::before) {
		display: none;
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
		position: relative;
		z-index: 1;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 3rem;
	}
	
	/* Hero Section */
	.hero-section {
		min-height: 75vh;
		display: flex;
		align-items: center;
		padding: 2rem 0;
		position: relative;
	}
	
	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: linear-gradient(rgba(37, 37, 37, 0.6) 1px, transparent 1px);
		background-size: 100% 75px;
		background-repeat: repeat-y;
		pointer-events: none;
		z-index: 0;
	}
	
	.hero-content {
		width: 100%;
		position: relative;
		z-index: 1;
		text-align: center;
	}
	
	.hero-title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(2.5rem, 5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.1;
		margin: 0 auto 1.5rem auto;
		color: #FFFFFF;
		max-width: 800px;
		text-align: center;
	}
	
	.hero-subtitle {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 auto 3rem auto;
		max-width: 600px;
		line-height: 1.6;
		text-align: center;
	}
	
	.project-start {
		max-width: 800px;
		margin: 0 auto;
		text-align: left;
	}
	
	.project-start-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		margin: 0 0 1rem 0;
	}
	
	.chat-input-container {
		position: relative;
	}
	
	.chat-input-wrapper {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1rem;
		position: relative;
		backdrop-filter: blur(20px);
		transition: all 0.3s ease;
	}
	
	.chat-input-wrapper:focus-within {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
	}
	
	.chat-input {
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
	
	.chat-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	
	.chat-input-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.left-actions, .right-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	
	.search-button, .attachment-button, .mic-button {
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
	
	.search-button:hover, .attachment-button:hover, .mic-button:hover {
		background: rgba(202, 189, 245, 0.1);
		color: #FFFFFF;
	}
	
	.send-button {
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
	
	.send-button:hover:not(:disabled) {
		background: #F0FA70;
		transform: scale(1.05);
	}
	
	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.send-button.transitioning {
		background: rgba(237, 247, 96, 0.7);
	}
	
	/* How It Works Section */
	.how-it-works-section {
		padding: 3rem 0 6rem 0;
		background: rgba(255, 255, 255, 0.02);
		margin-top: -5vh;
	}
	
	.section-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		text-align: left;
		margin: 0 0 3rem 0;
	}
	
	.how-it-works-content {
		max-width: 800px;
		margin: 0 auto;
	}
	
	.how-it-works-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}
	
	.work-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		transition: all 0.3s ease;
	}
	
	.work-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-4px);
	}
	
	.work-card-image {
		font-size: 3rem;
		margin-bottom: 1.5rem;
	}
	
	.work-card-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #FFFFFF;
		margin: 0 0 1rem 0;
	}
	
	.work-card-text {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		margin: 0;
	}
	
	/* Buttons */
	.button-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(0, 0, 0, 0.3);
		border-top: 2px solid #000000;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	/* Animations */
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
		}
		
		.container {
			padding: 0 2rem;
		}
		
		.how-it-works-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
		
		.hero-section {
			min-height: 80vh;
			padding: 1rem 0;
		}
		
		.hero-title {
			font-size: clamp(2rem, 8vw, 3rem);
		}
		
		.hero-subtitle {
			font-size: 1.1rem;
			margin-bottom: 3rem;
		}
		
		.how-it-works-section {
			padding: 4rem 0;
		}
		
		.section-title {
			font-size: 1.25rem;
			margin-bottom: 3rem;
		}
		
		.work-card {
			padding: 1.5rem;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
		
		.hero-title {
			font-size: clamp(1.8rem, 10vw, 2.5rem);
		}
		
		.hero-subtitle {
			font-size: 1rem;
			margin-bottom: 2rem;
		}
		
		.chat-input-wrapper {
			padding: 0.75rem;
		}
		
		.section-title {
			font-size: 2rem;
		}
		
		.work-card {
			padding: 1.25rem;
		}
		
		.work-card-image {
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
	}
</style>
