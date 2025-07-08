<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let tutorialComponents: string[] | null = null;
	export let selectedCategory = 'All';
	export let availableComponents: any[] = [];
	export let categories: string[] = [];
	export let selectedComponentId: string | null = null;
	export let snapToGrid = false;
	
	$: filteredComponents = tutorialComponents 
		? availableComponents.filter(comp => tutorialComponents.includes(comp.id))
		: selectedCategory === 'All' 
			? availableComponents 
			: availableComponents.filter(comp => comp.category === selectedCategory);
	
	function addComponentToBoard(componentId: string) {
		dispatch('addComponent', componentId);
	}
	
	function clearBoard() {
		dispatch('clearBoard');
	}
	
	function toggleGridSnap() {
		dispatch('toggleGridSnap');
	}
	
	function exportBoard() {
		dispatch('exportBoard');
	}
</script>

<div class="components-panel">
	<div class="panel-header">
		<h3>{tutorialComponents ? 'LED Dimmer Components' : 'Components'}</h3>
		{#if tutorialComponents}
			<p class="tutorial-note">🎯 Tutorial Mode: Use the components for the LED Dimmer project with the correct pin connections.</p>
		{/if}
	</div>
	
	<!-- Category Filter (if not in tutorial mode) -->
	{#if !tutorialComponents}
		<div class="category-filter">
			<select bind:value={selectedCategory}>
				<option value="All">All Components</option>
				{#each categories as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</div>
	{/if}
	
	<!-- Components Grid -->
	<div class="components-grid">
		{#each filteredComponents as component}
			<div 
				class="component-card"
				class:selected={selectedComponentId === component.id}
				on:click={() => addComponentToBoard(component.id)}
				on:keydown={(e) => e.key === 'Enter' && addComponentToBoard(component.id)}
				role="button"
				tabindex="0"
			>
				<div class="component-image">
					<img src={component.image} alt={component.name} />
				</div>
				<div class="component-info">
					<h4>{component.name}</h4>
					<p class="category">{component.category}</p>
					<p class="description">{component.description}</p>
				</div>
			</div>
		{/each}
	</div>
	
	<!-- Tools -->
	<div class="tools-section">
		<h4>Tools</h4>
		<div class="tools-grid">
			<button class="tool-btn" on:click={clearBoard}>
				🗑️ Clear
			</button>
			<button class="tool-btn" on:click={toggleGridSnap}>
				{snapToGrid ? '📐' : '🎯'} Grid
			</button>
			<button class="tool-btn" on:click={exportBoard}>
				💾 Export
			</button>
		</div>
	</div>
</div>

<style>
	.components-panel {
		background: rgba(35, 35, 35, 0.95);
		border-top: 1px solid rgba(202, 189, 245, 0.3);
		display: flex;
		gap: 1rem;
		padding: 1rem;
		font-family: 'Inter', sans-serif;
		height: 180px;
		overflow-y: auto;
	}
	
	.panel-header {
		min-width: 200px;
	}
	
	.panel-header h3 {
		margin: 0 0 0.5rem 0;
		color: #CABDF5;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.tutorial-note {
		margin: 0;
		color: #ECF65F;
		font-size: 0.7rem;
		line-height: 1.3;
		padding: 0.5rem;
		background: rgba(236, 246, 95, 0.1);
		border: 1px solid rgba(236, 246, 95, 0.3);
		border-radius: 6px;
	}
	
	.category-filter {
		min-width: 150px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
	
	.category-filter select {
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
	}
	
	.components-grid {
		flex: 1;
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}
	
	.component-card {
		background: rgba(35, 35, 35, 0.6);
		border: 1px solid rgba(202, 189, 245, 0.2);
		border-radius: 8px;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		min-width: 120px;
		max-width: 120px;
		text-align: center;
	}
	
	.component-card:hover {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.4);
		transform: translateY(-2px);
	}
	
	.component-image {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(35, 35, 35, 0.4);
		border-radius: 6px;
		border: 2px solid rgba(202, 189, 245, 0.3);
	}
	
	.component-image img {
		max-width: 30px;
		max-height: 30px;
		object-fit: contain;
	}
	
	.component-info h4 {
		margin: 0;
		color: #e2e8f0;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.component-info .category {
		margin: 0;
		color: #CABDF5;
		font-size: 0.6rem;
		font-weight: 500;
		text-transform: uppercase;
	}
	
	.component-info .description {
		display: none; /* Hide in compact view */
	}
	
	.tools-section {
		min-width: 200px;
	}
	
	.tools-section h4 {
		margin: 0 0 0.5rem 0;
		color: #CABDF5;
		font-size: 0.9rem;
		font-weight: 600;
	}
	
	.tools-grid {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	
	.tool-btn {
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.5rem 0.75rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}
	
	.tool-btn:hover {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.5);
	}
</style>
