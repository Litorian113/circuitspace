<script lang="ts">
	import { goto } from '$app/navigation';
	import { 
		allComponentPins, 
		ledDimmerConnections,
		type ConnectionRule 
	} from '$lib/components/CircuitDesignerPins';

	function goBack() {
		goto('/');
	}

	function testConnections() {
		goto('/test-circuit');
	}
</script>

<svelte:head>
	<title>Pin-Out Demo - LED Dimmer Verbindungen</title>
</svelte:head>

<div class="demo-page">
	<header class="demo-header">
		<button class="back-btn" on:click={goBack}>← Zurück zur Homepage</button>
		<h1>Pin-Out System Demonstration</h1>
		<p>LED Dimmer Projekt - Korrekte Verbindungen für Arduino Leonardo</p>
		<button class="test-btn" on:click={testConnections}>
			🔧 Circuit Designer testen
		</button>
	</header>

	<div class="content">
		<div class="components-section">
			<h2>🔌 Verfügbare Komponenten & Pin-Konfigurationen</h2>
			<div class="components-grid">
				{#each allComponentPins as component}
					<div class="component-card">
						<h3>{component.name}</h3>
						<div class="pins-list">
							{#each component.pins as pin}
								<div class="pin-item pin-{pin.type}">
									<span class="pin-name">{pin.name}</span>
									<span class="pin-type">{pin.type}</span>
									<span class="pin-pos">({pin.x}%, {pin.y}%)</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="connections-section">
			<h2>🔗 LED Dimmer Projekt - Erforderliche Verbindungen</h2>
			<div class="connections-list">
				{#each ledDimmerConnections as connection, index}
					<div class="connection-item" class:required={connection.required}>
						<div class="connection-number">{index + 1}</div>
						<div class="connection-details">
							<div class="connection-from">
								<strong>{connection.from.component}</strong>
								<span class="pin-label">{connection.from.pin}</span>
							</div>
							<div class="connection-arrow">→</div>
							<div class="connection-to">
								<strong>{connection.to.component}</strong>
								<span class="pin-label">{connection.to.pin}</span>
							</div>
						</div>
						<div class="connection-description">
							{connection.description}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="info-section">
			<h2>ℹ️ Implementierte Features</h2>
			<ul class="features-list">
				<li>✅ Relative Pin-Positionierung (%-basiert)</li>
				<li>✅ Pin-Typ-System (power, ground, digital, analog, pwm)</li>
				<li>✅ Verbindungsvalidierung für LED Dimmer</li>
				<li>✅ Tutorial-Modus mit spezifischen Komponenten</li>
				<li>✅ Drag & Drop Funktionalität</li>
				<li>✅ Snap-to-Grid System</li>
				<li>✅ Visual Pin-Highlighting</li>
				<li>✅ Verbindungsfortschritt-Tracking</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%);
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
		padding: 2rem;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		background: rgba(15, 23, 42, 0.8);
		border-radius: 12px;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}

	.back-btn, .test-btn {
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		color: #00d4aa;
		padding: 0.75rem 1.5rem;
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin: 0.5rem;
	}

	.back-btn:hover, .test-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
	}

	.demo-header h1 {
		margin: 1rem 0 0.5rem 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.demo-header p {
		color: #94a3b8;
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
	}

	.content {
		display: grid;
		gap: 3rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.components-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.component-card {
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.3s ease;
	}

	.component-card:hover {
		border-color: rgba(0, 212, 170, 0.4);
		transform: translateY(-2px);
	}

	.component-card h3 {
		color: #00d4aa;
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}

	.pins-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.pin-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.pin-power { background: rgba(255, 107, 107, 0.1); border-left: 3px solid #ff6b6b; }
	.pin-ground { background: rgba(64, 64, 64, 0.3); border-left: 3px solid #404040; }
	.pin-digital { background: rgba(74, 144, 226, 0.1); border-left: 3px solid #4a90e2; }
	.pin-analog { background: rgba(155, 89, 182, 0.1); border-left: 3px solid #9b59b6; }
	.pin-pwm { background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; }

	.pin-name {
		font-weight: 600;
		color: #e2e8f0;
	}

	.pin-type {
		text-transform: uppercase;
		font-size: 0.7rem;
		opacity: 0.7;
	}

	.pin-pos {
		font-size: 0.7rem;
		opacity: 0.5;
	}

	.connections-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.connection-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.connection-item.required {
		border-color: rgba(255, 193, 7, 0.4);
		background: rgba(255, 193, 7, 0.05);
	}

	.connection-item:hover {
		transform: translateX(5px);
		border-color: rgba(0, 212, 170, 0.4);
	}

	.connection-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: rgba(0, 212, 170, 0.2);
		color: #00d4aa;
		border-radius: 50%;
		font-weight: 700;
		font-size: 1.1rem;
	}

	.connection-details {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.connection-from, .connection-to {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.connection-from strong, .connection-to strong {
		color: #e2e8f0;
		font-size: 0.9rem;
	}

	.pin-label {
		color: #00d4aa;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.connection-arrow {
		color: #00d4aa;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.connection-description {
		color: #94a3b8;
		font-size: 0.85rem;
		max-width: 300px;
	}

	.features-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		list-style: none;
		padding: 0;
	}

	.features-list li {
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 8px;
		padding: 1rem;
		transition: all 0.3s ease;
	}

	.features-list li:hover {
		border-color: rgba(0, 212, 170, 0.4);
		background: rgba(0, 212, 170, 0.05);
	}

	.info-section {
		background: rgba(15, 23, 42, 0.4);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 12px;
		padding: 2rem;
	}
</style>
