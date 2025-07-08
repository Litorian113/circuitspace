<script lang="ts">
	export let tutorialComponents: string[] | null = null;
	export let connections: any[] = [];
	export let tutorialRules: any[] = [];
	
	$: completedRules = tutorialRules.filter(rule => 
		connections.some(conn => 
			(conn.fromComponent === rule.from.component && conn.fromPin === rule.from.pin &&
			 conn.toComponent === rule.to.component && conn.toPin === rule.to.pin) ||
			(conn.fromComponent === rule.to.component && conn.fromPin === rule.to.pin &&
			 conn.toComponent === rule.from.component && conn.toPin === rule.from.pin)
		)
	);
	
	$: progress = tutorialRules.length > 0 ? (completedRules.length / tutorialRules.length) * 100 : 0;
</script>

{#if tutorialComponents}
	<div class="tutorial-panel">
		<div class="tutorial-header">
			<h3>LED Dimmer Pin-Out Guide</h3>
		</div>
		<div class="tutorial-content">
			<div class="connection-rules">
				{#each tutorialRules as rule, index}
					<div class="connection-rule" class:completed={completedRules.includes(rule)}>
						<span class="rule-number">{index + 1}</span>
						<span class="rule-description">{rule.description}</span>
						<div class="rule-connection">
							<span class="from-pin">{rule.from.component} • {rule.from.pin}</span>
							<span class="arrow">→</span>
							<span class="to-pin">{rule.to.component} • {rule.to.pin}</span>
						</div>
						{#if completedRules.includes(rule)}
							<span class="completion-mark">✓ Connected</span>
						{/if}
					</div>
				{/each}
			</div>
			
			<div class="tutorial-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
				<span class="progress-text">{completedRules.length} of {tutorialRules.length} connections completed</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.tutorial-panel {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 350px;
		max-height: 60vh;
		background: rgba(35, 35, 35, 0.95);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		overflow: hidden;
		z-index: 100;
		font-family: 'Inter', sans-serif;
	}
	
	.tutorial-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(202, 189, 245, 0.1);
	}
	
	.tutorial-header h3 {
		margin: 0;
		color: #CABDF5;
		font-size: 1.1rem;
		font-weight: 600;
	}
	
	.tutorial-content {
		padding: 1rem;
		max-height: 50vh;
		overflow-y: auto;
	}
	
	.connection-rules {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.connection-rule {
		padding: 0.75rem;
		background: rgba(35, 35, 35, 0.6);
		border: 1px solid rgba(202, 189, 245, 0.2);
		border-radius: 8px;
		transition: all 0.3s ease;
	}
	
	.connection-rule.completed {
		background: rgba(236, 246, 95, 0.1);
		border-color: #ECF65F;
	}
	
	.rule-number {
		display: inline-block;
		width: 20px;
		height: 20px;
		background: #CABDF5;
		color: #191919;
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: 600;
		text-align: center;
		line-height: 20px;
		margin-right: 0.75rem;
	}
	
	.rule-description {
		color: #e2e8f0;
		font-size: 0.8rem;
		display: block;
		margin-bottom: 0.5rem;
	}
	
	.rule-connection {
		font-family: 'Inter', monospace;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.from-pin, .to-pin {
		background: rgba(202, 189, 245, 0.1);
		color: #CABDF5;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}
	
	.arrow {
		color: #ECF65F;
		font-weight: bold;
	}
	
	.completion-mark {
		color: #ECF65F;
		font-size: 0.7rem;
		font-weight: 600;
		margin-top: 0.25rem;
		display: block;
	}
	
	.tutorial-progress {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(202, 189, 245, 0.1);
	}
	
	.progress-bar {
		width: 100%;
		height: 6px;
		background: rgba(35, 35, 35, 0.8);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #CABDF5, #ECF65F);
		border-radius: 3px;
		transition: width 0.5s ease;
	}
	
	.progress-text {
		color: #94a3b8;
		font-size: 0.75rem;
		text-align: center;
		display: block;
	}
</style>
