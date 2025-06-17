<script lang="ts">
	import FullscreenCircuitDesigner from '$lib/components/FullscreenCircuitDesigner.svelte';
	import { goto } from '$app/navigation';

	// Tutorial Komponenten für LED Dimmer
	const tutorialComponents = [
		'leonardo-keyestudio',
		'breadboard',
		'leuchtdiode',
		'widerstand',
		'poti'
	];

	function goBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Circuit Designer Test - LED Dimmer Pin-Out</title>
</svelte:head>

<div class="test-page">
	<header class="test-header">
		<button class="back-btn" on:click={goBack}>← Zurück zur Homepage</button>
		<h1>Circuit Designer Test - LED Dimmer Pin-Out System</h1>
		<p>Teste die Pin-Verbindungen für das LED Dimmer Projekt mit Arduino Leonardo</p>
	</header>

	<div class="designer-container">
		<FullscreenCircuitDesigner 
			tutorialComponents={tutorialComponents}
			on:exit={goBack}
		/>
	</div>
</div>

<style>
	.test-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #0a0f1a;
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
	}

	.test-header {
		padding: 1rem 2rem;
		background: rgba(15, 23, 42, 0.9);
		border-bottom: 1px solid rgba(0, 212, 170, 0.3);
		backdrop-filter: blur(8px);
	}

	.back-btn {
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 6px;
		color: #00d4aa;
		padding: 0.5rem 1rem;
		font-family: inherit;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-bottom: 1rem;
	}

	.back-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		transform: translateY(-1px);
	}

	.test-header h1 {
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.test-header p {
		margin: 0;
		color: #94a3b8;
		font-size: 0.9rem;
	}

	.designer-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}
</style>
