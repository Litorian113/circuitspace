<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import HowItWorksSection from '$lib/components/HowItWorksSection.svelte';
	import BuildFirstProjectSection from '$lib/components/BuildFirstProjectSection.svelte';
	
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
		goto('/overview');
	}
	
	function goToTemplates() {
		goto('/templates');
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
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
	<HeroSection 
		bind:projectInput
		{isTransitioning}
		onProjectSubmit={handleProjectSubmit}
	/>
	
	<!-- How It Works Section -->
	<HowItWorksSection />
	
	<!-- How You Can Build Your First Project Section -->
	<BuildFirstProjectSection />
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
	
	:global(:root) {
		--sidebar-width: 280px; /* Default sidebar width */
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
		font-family: 'Inter', sans-serif;
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
		margin-left: var(--sidebar-width, 280px);
		min-height: 100vh;
		position: relative;
		z-index: 1;
		transition: margin-left 0.3s ease;
	}
	
	.main-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(90deg, rgba(37, 37, 37, 1) 1px, transparent 1px);
		background-size: 10% 100%;
		background-repeat: repeat-x;
		pointer-events: none;
		z-index: -1;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 3rem;
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
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.main-container {
			margin-left: 0;
		}
		
		.container {
			padding: 0 2rem;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
	}
</style>
