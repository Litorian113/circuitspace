<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let selectedComponent: any = null;
	export let zoomLevel = 1.0;
	export let showPinDetails = false;
	
	function deleteComponent() {
		dispatch('deleteComponent');
	}
	
	function zoomIn() {
		dispatch('zoomIn');
	}
	
	function zoomOut() {
		dispatch('zoomOut');
	}
	
	function resetView() {
		dispatch('resetView');
	}
	
	function fitAll() {
		dispatch('fitAll');
	}
	
	function togglePinDetails() {
		showPinDetails = !showPinDetails;
		dispatch('togglePinDetails', showPinDetails);
	}
</script>

<div class="component-controls">
	<!-- Zoom Controls -->
	<div class="zoom-controls">
		<h4>View Controls</h4>
		<div class="zoom-buttons">
			<button class="zoom-btn" on:click={zoomOut}>-</button>
			<button class="zoom-btn" on:click={zoomIn}>+</button>
		</div>
		<div class="zoom-level">{Math.round(zoomLevel * 100)}%</div>
		<div class="view-buttons">
			<button class="view-btn" on:click={resetView}>Reset</button>
			<button class="view-btn" on:click={fitAll}>Fit All</button>
		</div>
	</div>
	
	<!-- Selected Component Info -->
	{#if selectedComponent}
		<div class="selected-component-info">
			<h3>Selected Component</h3>
			<h4>{selectedComponent.name}</h4>
			
			<div class="component-details">
				<div class="detail-row">
					<span>Position:</span>
					<span>{Math.round(selectedComponent.x)}, {Math.round(selectedComponent.y)}</span>
				</div>
				<div class="detail-row">
					<span>Size:</span>
					<span>{selectedComponent.width} × {selectedComponent.height}</span>
				</div>
				<div class="detail-row">
					<span>Pins:</span>
					<span>{selectedComponent.pins?.length || 0}</span>
				</div>
			</div>
			
			{#if selectedComponent.pins && selectedComponent.pins.length > 0}
				<button class="tool-btn" on:click={togglePinDetails}>
					{showPinDetails ? 'Hide' : 'Show'} Pin Details
				</button>
				
				{#if showPinDetails}
					<div class="pin-list">
						<h5>Pin Configuration</h5>
						{#each selectedComponent.pins as pin}
							<div class="pin-item">
								<span class="pin-name">{pin.name}</span>
								<span class="pin-type">{pin.type}</span>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
			
			<button class="delete-btn" on:click={deleteComponent}>
				Delete Component
			</button>
		</div>
	{/if}
</div>

<style>
	.component-controls {
		width: 280px;
		background: rgba(35, 35, 35, 0.95);
		border-left: 1px solid rgba(202, 189, 245, 0.3);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		font-family: 'Inter', sans-serif;
	}
	
	.zoom-controls {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(202, 189, 245, 0.1);
	}
	
	.zoom-controls h4 {
		margin: 0 0 1rem 0;
		color: #CABDF5;
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.zoom-buttons {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.zoom-btn, .view-btn {
		flex: 1;
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 8px;
		color: #e2e8f0;
		padding: 0.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
	}
	
	.zoom-btn:hover, .view-btn:hover {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.5);
		transform: translateY(-1px);
	}
	
	.zoom-level {
		text-align: center;
		font-size: 0.8rem;
		color: #94a3b8;
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background: rgba(35, 35, 35, 0.4);
		border-radius: 6px;
		border: 1px solid rgba(202, 189, 245, 0.1);
	}
	
	.view-buttons {
		display: flex;
		gap: 0.5rem;
	}
	
	.selected-component-info {
		padding: 1.5rem;
		border-top: 1px solid rgba(202, 189, 245, 0.1);
		background: rgba(35, 35, 35, 0.4);
	}
	
	.selected-component-info h3 {
		margin: 0 0 0.5rem 0;
		color: #CABDF5;
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.selected-component-info h4 {
		margin: 0 0 1rem 0;
		color: #e2e8f0;
		font-size: 1.1rem;
	}
	
	.component-details {
		margin-bottom: 1rem;
	}
	
	.detail-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
	}
	
	.detail-row span:first-child {
		color: #94a3b8;
	}
	
	.detail-row span:last-child {
		color: #e2e8f0;
	}
	
	.pin-list {
		margin-bottom: 1rem;
		border: 1px solid rgba(202, 189, 245, 0.1);
		border-radius: 8px;
		padding: 0.75rem;
		max-height: 150px;
		overflow-y: auto;
	}
	
	.pin-list h5 {
		margin: 0 0 0.5rem 0;
		color: #CABDF5;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.pin-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0;
		font-size: 0.75rem;
	}
	
	.pin-name {
		font-weight: 500;
		color: #e2e8f0;
	}
	
	.pin-type {
		color: #64748b;
		font-size: 0.7rem;
	}
	
	.tool-btn {
		width: 100%;
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.75rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-bottom: 0.5rem;
		text-align: center;
	}
	
	.tool-btn:hover {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.5);
	}
	
	.delete-btn {
		width: 100%;
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #f87171;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: 'Inter', sans-serif;
	}
	
	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}
</style>
