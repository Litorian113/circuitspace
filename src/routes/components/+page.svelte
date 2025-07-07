<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	function goHome() {
		goto('/');
	}
	
	// Automatically redirect to overview page
	onMount(() => {
		goto('/overview');
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Animated Background -->
<div class="circuit-bg">
	<div class="circuit-line line-1"></div>
	<div class="circuit-line line-2"></div>
	<div class="circuit-node node-1"></div>
	<div class="circuit-node node-2"></div>
</div>

<!-- Navigation -->
<nav class="nav-container">
	<button class="nav-back" on:click={goHome}>
		← Back to Workspace
	</button>
</nav>

<!-- Main Content -->
<main class="main-container">
	<div class="header-section">
		<h1 class="main-title">Component Library</h1>
		<p class="subtitle">Coming Soon - Your Electronics Learning Hub</p>
	</div>
	
	<div class="placeholder-card">
		<div class="icon-placeholder">
			<div class="component-icon"></div>
		</div>
		<h2>Component Library Under Construction</h2>
		<p>We're building an amazing learning experience for electronic components. This will include:</p>
		<ul>
			<li>Interactive component database</li>
			<li>Circuit simulation tools</li>
			<li>Component specifications and datasheets</li>
			<li>Project examples and tutorials</li>
		</ul>
		<div class="coming-soon">
			<span class="pulse-dot"></span>
			Development in Progress
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
	}
	
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
		opacity: 0.2;
	}
	
	.line-1 {
		width: 400px;
		height: 2px;
		top: 25%;
		left: 15%;
		animation: circuit-flow 6s infinite;
	}
	
	.line-2 {
		width: 2px;
		height: 300px;
		top: 20%;
		right: 25%;
		background: linear-gradient(0deg, transparent, #00d4aa, transparent);
		animation: circuit-flow-vertical 4s infinite reverse;
	}
	
	.circuit-node {
		position: absolute;
		width: 10px;
		height: 10px;
		background: #00d4aa;
		border-radius: 50%;
		box-shadow: 0 0 15px #00d4aa;
		animation: node-pulse 2.5s infinite;
	}
	
	.node-1 {
		top: 25%;
		left: 50%;
	}
	
	.node-2 {
		bottom: 30%;
		right: 40%;
	}
	
	/* Navigation */
	.nav-container {
		position: relative;
		z-index: 10;
		padding: 1.5rem 2rem;
	}
	
	.nav-back {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		border: 1px solid rgba(0, 212, 170, 0.3);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 500;
		transition: all 0.2s ease;
	}
	
	.nav-back:hover {
		background: rgba(0, 212, 170, 0.2);
		border-color: #00d4aa;
		transform: translateX(-4px);
	}
	
	/* Main Content */
	.main-container {
		position: relative;
		z-index: 1;
		min-height: 80vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.header-section {
		text-align: center;
		margin-bottom: 3rem;
	}
	
	.main-title {
		font-family: 'Space Grotesk', sans-serif;
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 700;
		margin: 0 0 1rem 0;
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.subtitle {
		font-size: 1.2rem;
		opacity: 0.8;
		margin: 0;
	}
	
	.placeholder-card {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
		backdrop-filter: blur(16px);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 16px;
		padding: 3rem;
		max-width: 600px;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 212, 170, 0.1);
	}
	
	.icon-placeholder {
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
	}
	
	.component-icon {
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		border-radius: 12px;
		position: relative;
		animation: float 3s ease-in-out infinite;
	}
	
	.component-icon::before,
	.component-icon::after {
		content: '';
		position: absolute;
		background: #0a0f1a;
		border-radius: 2px;
	}
	
	.component-icon::before {
		width: 20px;
		height: 4px;
		top: 50%;
		left: 10px;
		transform: translateY(-50%);
	}
	
	.component-icon::after {
		width: 20px;
		height: 4px;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
	}
	
	.placeholder-card h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.8rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #00d4aa;
	}
	
	.placeholder-card p {
		line-height: 1.6;
		margin-bottom: 1.5rem;
		opacity: 0.9;
	}
	
	.placeholder-card ul {
		text-align: left;
		margin: 1.5rem 0;
		padding-left: 1.5rem;
	}
	
	.placeholder-card li {
		margin-bottom: 0.5rem;
		opacity: 0.8;
	}
	
	.coming-soon {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 2rem;
		padding: 1rem;
		background: rgba(0, 212, 170, 0.05);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 8px;
		font-weight: 500;
		color: #00d4aa;
	}
	
	.pulse-dot {
		width: 8px;
		height: 8px;
		background: #00d4aa;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}
	
	/* Animations */
	@keyframes circuit-flow {
		0% { transform: translateX(-200px); opacity: 0; }
		50% { opacity: 1; }
		100% { transform: translateX(200px); opacity: 0; }
	}
	
	@keyframes circuit-flow-vertical {
		0% { transform: translateY(-150px); opacity: 0; }
		50% { opacity: 1; }
		100% { transform: translateY(150px); opacity: 0; }
	}
	
	@keyframes node-pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.3); opacity: 0.7; }
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.main-container {
			padding: 1rem;
		}
		
		.placeholder-card {
			padding: 2rem;
		}
		
		.nav-container {
			padding: 1rem;
		}
	}
</style>
