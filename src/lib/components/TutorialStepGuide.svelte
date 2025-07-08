<script lang="ts">
	import { ledDimmerConnections } from './CircuitDesignerPins';
	
	// Props
	export let completedConnections: string[] = [];
	
	// Reactive statements
	$: currentStepIndex = completedConnections.length;
	$: isCompleted = completedConnections.length >= ledDimmerConnections.length;
	$: currentStep = isCompleted ? null : ledDimmerConnections[currentStepIndex];
	$: totalSteps = ledDimmerConnections.length;
</script>

<div class="tutorial-step-guide">
	{#if !isCompleted && currentStep}
		<div class="step-header">
			<span class="step-number">{currentStepIndex + 1}</span>
			<div class="step-progress">
				<span class="step-title">Current Step</span>
				<span class="progress-text">{currentStepIndex + 1} of {totalSteps}</span>
			</div>
		</div>
		<div class="step-content">
			<h4 class="step-description">{currentStep.description}</h4>
			<div class="connection-visual">
				<span class="from-pin">{currentStep.from.component}.{currentStep.from.pin}</span>
				<span class="arrow">→</span>
				<span class="to-pin">{currentStep.to.component}.{currentStep.to.pin}</span>
			</div>
		</div>
	{:else}
		<div class="completion-content">
			<div class="completion-icon">🎉</div>
			<h4>All Steps Complete!</h4>
			<p>Your LED Dimmer circuit is ready!</p>
			<div class="completion-stats">
				{completedConnections.length} / {totalSteps} connections
			</div>
		</div>
	{/if}
</div>

<style>
	.tutorial-step-guide {
		flex: 1;
		min-width: 300px;
		max-width: 400px;
		margin-left: 1rem;
		background: rgba(45, 45, 45, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		font-family: 'Inter', sans-serif;
	}
	
	.step-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	
	.step-number {
		background: #CABDF5;
		color: #191919;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.85rem;
		font-family: 'Inter', sans-serif;
		flex-shrink: 0;
	}
	
	.step-progress {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.step-title {
		color: #CABDF5;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0;
	}
	
	.progress-text {
		color: #94a3b8;
		font-size: 0.7rem;
		font-family: 'Inter', sans-serif;
	}
	
	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.step-description {
		color: #e2e8f0;
		font-size: 0.85rem;
		line-height: 1.4;
		margin: 0;
		font-family: 'Inter', sans-serif;
		font-weight: 500;
	}
	
	.connection-visual {
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.2);
		border-radius: 6px;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.75rem;
		overflow-x: auto;
	}
	
	.from-pin, .to-pin {
		background: rgba(202, 189, 245, 0.1);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		color: #CABDF5;
		font-weight: 500;
		white-space: nowrap;
		font-size: 0.7rem;
	}
	
	.arrow {
		color: #ECF65F;
		font-weight: bold;
		font-size: 0.9rem;
		margin: 0 0.25rem;
	}
	
	.completion-content {
		text-align: center;
		padding: 1.5rem 1rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		border-radius: 8px;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}
	
	.completion-icon {
		font-size: 2rem;
	}
	
	.completion-content h4 {
		margin: 0;
		color: #22c55e;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.completion-content p {
		margin: 0;
		color: #e2e8f0;
		font-size: 0.8rem;
		line-height: 1.4;
		font-family: 'Inter', sans-serif;
	}
	
	.completion-stats {
		color: #22c55e;
		font-size: 0.75rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
	}
</style>
