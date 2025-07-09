<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { userProjects, type UserProject } from '$lib/stores/userProjects';
	import { currentProject, updateProjectCode, addComponent } from '$lib/stores/project';
	
	let selectedCategory: 'all' | 'beginner' | 'intermediate' | 'advanced' = 'all';
	let selectedState: 'all' | 'in-progress' | 'done' | 'paused' = 'all';
	let searchQuery = '';
	let filteredProjects: UserProject[] = [];
	
	$: {
		filteredProjects = $userProjects.filter(project => {
			const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
			const matchesState = selectedState === 'all' || project.state === selectedState;
			const matchesSearch = searchQuery === '' || 
				project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
			
			return matchesCategory && matchesState && matchesSearch;
		});
	}
	
	function getDifficultyStars(difficulty: number): string {
		return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
	}
	
	function getCategoryColor(category: string): string {
		switch(category) {
			case 'beginner': return '#00d4aa';
			case 'intermediate': return '#ffa500';
			case 'advanced': return '#ff6b6b';
			default: return '#888';
		}
	}

	function getStateColor(state: string): string {
		switch(state) {
			case 'done': return '#00d4aa';
			case 'in-progress': return '#ffa500';
			case 'paused': return '#64748b';
			default: return '#888';
		}
	}

	function getStateText(state: string): string {
		switch(state) {
			case 'done': return 'Completed';
			case 'in-progress': return 'In Progress';
			case 'paused': return 'Paused';
			default: return state;
		}
	}
	
	function continueProject(project: UserProject) {
		// Update the current project with user project data
		currentProject.update(currentProj => ({
			...currentProj,
			name: project.name,
			description: project.description,
			components: project.components,
			code: project.code,
			updatedAt: new Date()
		}));
		
		// Navigate to project chat with project loaded
		goto('/project-chat');
	}
	
	function previewProject(project: UserProject) {
		// For now, just show an alert. In the future, this could open a modal
		alert(`Preview for ${project.name}:\n\n${project.description}\n\nComponents: ${project.components.length}\nDifficulty: ${project.difficulty}/5\nStatus: ${getStateText(project.state)}`);
	}

	function deleteProject(project: UserProject) {
		if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
			userProjects.deleteProject(project.id);
		}
	}
</script>

<svelte:head>
	<title>My Projects - Circuitspace</title>
	<meta name="description" content="Manage and edit your electronics projects" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Sidebar -->
<Sidebar />

<!-- Main Content -->
<div class="projects-page">
	<header class="page-header">
		<div class="header-content">
			<h1>My Projects</h1>
		</div>
	</header>
	
	<div class="filters-section">
		<div class="filter-row">
			<!-- Search Box with Icon -->
			<div class="search-box">
				<input 
					type="text" 
					placeholder="Search..." 
					bind:value={searchQuery}
				/>
				<div class="search-divider"></div>
				<div class="search-icon">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"/>
						<path d="21 21l-4.35-4.35"/>
					</svg>
				</div>
			</div>
			
			<!-- Filter Controls -->
			<div class="filter-controls">
				<div class="filter-group">
					<select id="difficulty-select" bind:value={selectedCategory}>
						<option value="all">All</option>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Expert</option>
					</select>
				</div>
				
				<div class="filter-group">
					<select id="status-select" bind:value={selectedState}>
						<option value="all">All Status</option>
						<option value="in-progress">In Progress</option>
						<option value="done">Completed</option>
						<option value="paused">Paused</option>
					</select>
				</div>
			</div>
		</div>
	</div>
	
	<div class="projects-grid">
		{#each filteredProjects as project (project.id)}
			<div class="project-card">
				<div class="card-header">
					<div class="badges-row">
						<div class="state-badge {project.state}">
							{getStateText(project.state)}
						</div>
						<div class="difficulty-badge {project.category}">
							{project.category}
						</div>
					</div>
					<h3>{project.name}</h3>
				</div>
				
				<div class="card-content">
					<p class="description">{project.description}</p>
					
					<div class="project-meta">
						<div class="meta-row">
							<span class="meta-label">Duration:</span>
							<span>{project.estimatedTime}</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">Components:</span>
							<span>{project.componentsCount} Parts</span>
						</div>
					</div>
					
					<!-- Project Image -->
					{#if project.imageUrl}
						<div class="project-image">
							<img src={project.imageUrl} alt={project.name} />
						</div>
					{/if}
					<div class="tags">
						{#each project.tags.slice(0, 4) as tag}
							<span class="tag">#{tag}</span>
						{/each}
					</div>
					<div class="learning-objectives">
						<h4>Learning Goals:</h4>
						<ul>
							{#each project.learningGoals.slice(0, 3) as goal}
								<li>{goal}</li>
							{/each}
							{#if project.learningGoals.length > 3}
								<li class="more-objectives">+{project.learningGoals.length - 3} more...</li>
							{/if}
						</ul>
					</div>
					
				</div>
				
				<div class="card-actions">
					<button 
						on:click={() => previewProject(project)}
						class="btn-secondary"
					>
						Preview
					</button>
					<button 
						on:click={() => continueProject(project)}
						class="btn-primary"
					>
						{project.state === 'done' ? 'View' : 'Edit'}
					</button>
					<button 
						on:click={() => deleteProject(project)}
						class="btn-danger"
					>
						Delete
					</button>
				</div>
			</div>
		{/each}
	</div>
	
	{#if filteredProjects.length === 0}
		<div class="no-results">
			<h3>No projects found</h3>
			<p>Try different search terms or select a different category/status.</p>
			<button on:click={() => goto('/templates')} class="btn-primary">
				Create new project from template
			</button>
		</div>
	{/if}
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	
	:global(body) {
		margin: 0;
		padding: 0;
		background: #191919;
		color: #e2e8f0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		overflow-x: hidden;
	}
	
	:global(:root) {
		--sidebar-width: 280px; /* Default sidebar width */
	}

	.projects-page {
		min-height: 100vh;
		background: #191919;
		color: #e2e8f0;
		font-family: 'Inter', sans-serif;
		margin-left: calc(var(--sidebar-width, 280px) + 4rem);
		margin-right: 6rem;
		transition: margin-left 0.3s ease;
		width: calc(100vw - var(--sidebar-width, 280px) - 10rem);
		position: relative;
	}
	
	.page-header {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 2rem 3rem;
		border-bottom: 1px solid rgba(202, 189, 245, 0.2);
		background: #191919;
		backdrop-filter: blur(10px);
	}
	
	.header-content h1 {
		margin: 0;
		font-size: 2.5rem;
		color: #ffffff;
	}
	
	.filters-section {
		padding: 2rem 3rem;
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}
	
	.filter-row {
		display: flex;
		align-items: center;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: flex-start;
		width: 100%;
		max-width: 1200px;
	}
	
	/* Search Box Styling */
	.search-box {
		display: flex;
		align-items: center;
		background: rgba(35, 35, 35, 0.8);
		border-radius: 12px;
		border: 1px solid rgba(226, 232, 240, 0.2);
		transition: all 0.2s ease;
		min-width: 350px;
		flex: 1;
		max-width: 500px;
	}
	
	.search-box:focus-within {
		border-color: rgba(226, 232, 240, 0.4);
		box-shadow: 0 0 0 3px rgba(226, 232, 240, 0.1);
	}
	
	.search-box input {
		flex: 1;
		padding: 0.875rem 1rem;
		background: transparent;
		border: none;
		color: #e2e8f0;
		font-size: 0.875rem;
		font-family: 'Inter', sans-serif;
		outline: none;
	}
	
	.search-box input::placeholder {
		color: rgba(226, 232, 240, 0.5);
	}
	
	.search-divider {
		width: 1px;
		height: 24px;
		background: rgba(226, 232, 240, 0.2);
		margin: 0 0.75rem;
	}
	
	.search-icon {
		padding: 0 1rem;
		color: rgba(226, 232, 240, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 50px;
	}
	
	.search-icon svg {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}
	
	.filter-controls {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}
	
	.filter-group {
		display: flex;
		align-items: center;
	}
	
	.filter-group select {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		border: none;
		background: transparent;
		color: #e2e8f0;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		cursor: pointer;
		outline: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
	}
	
	.filter-group select:hover {
		color: #CABDF5;
	}
	
	.projects-grid {
		padding: 3rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}
	
	.project-card {
		background: rgba(35, 35, 35, 0.8);
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		position: relative;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.project-card:hover {
		transform: translateY(-8px);
	}
	
	.card-header {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.badges-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	
	.card-header h3 {
		margin: 0;
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #f1f5f9;
		line-height: 1.2;
		width: 100%;
	}
	
	.state-badge,
	.difficulty-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.state-badge {
		background: #CABDF5;
		color: #000000;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}
	
	.state-badge.done {
		background: #EDF760;
		color: #000000;
		border: 1px solid rgba(237, 247, 96, 0.3);
	}
	
	.difficulty-badge {
		background: #CABDF5;
		color: #000000;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}
	
	.difficulty-badge.advanced {
		background: #EDF760;
		color: #000000;
		border: 1px solid rgba(237, 247, 96, 0.3);
	}
	
	.template-meta {
		margin-bottom: 1.5rem;
	}
	
	.btn-danger {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		font-family: inherit;
		background: rgba(255, 107, 107, 0.1);
		color: #ff6b6b;
		border: 1px solid rgba(255, 107, 107, 0.2);
	}
	
	.btn-danger:hover {
		background: rgba(255, 107, 107, 0.2);
		color: #ffffff;
		transform: translateY(-1px);
	}
	
	.card-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.description {
		font-size: 0.9rem;
		color: #94a3b8;
		line-height: 1.4;
		margin: 0;
	}
	
	.template-meta {
		margin-bottom: 1.5rem;
	}
	
	.meta-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.2rem;
	}
	
	.meta-label {
		color: #64748b;
	}
	
	.meta-row span:not(.meta-label) {
		color: #94a3b8;
	}
	
	.difficulty-stars {
		color: #fbbf24;
	}
	
	.project-image {
		background: rgba(25, 25, 25, 0.6);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		margin-bottom: 1rem;
	}
	
	.project-image img {
		max-width: 100%;
		max-height: 150px;
		object-fit: contain;
		border-radius: 8px;
	}
	
	.learning-objectives {
		margin-bottom: 1rem;
	}
	
	.learning-objectives h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		color: #CABDF5;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
	}
	
	.learning-objectives ul {
		margin: 0;
		padding-left: 1.2rem;
		list-style: none;
	}
	
	.learning-objectives li {
		position: relative;
		margin-bottom: 0.5rem;
		color: #94a3b8;
		font-size: 0.9rem;
	}
	
	.learning-objectives li::before {
		content: '▸';
		position: absolute;
		left: -1rem;
		color: #CABDF5;
	}
	
	.more-objectives {
		font-style: italic;
		color: #64748b;
	}
	
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.tag {
		background: rgba(202, 189, 245, 0.1);
		color: #CABDF5;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}
	
	.card-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
	
	.btn-secondary,
	.btn-primary,
	.btn-danger {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 2px solid;
	}
	
	.btn-secondary {
		background: transparent;
		color: #CABDF5;
		border-color: #CABDF5;
	}
	
	.btn-secondary:hover {
		background: rgba(202, 189, 245, 0.1);
		transform: translateY(-1px);
	}
	
	.btn-primary {
		background: transparent;
		color: #CABDF5;
		border-color: #CABDF5;
	}
	
	.btn-primary:hover {
		background: #CABDF5;
		color: #0f172a;
		transform: translateY(-1px);
	}
	
	.btn-danger {
		background: transparent;
		color: #ff6b6b;
		border-color: #ff6b6b;
	}
	
	.btn-danger:hover {
		background: rgba(255, 107, 107, 0.1);
		transform: translateY(-1px);
	}
	
	.no-results {
		text-align: center;
		padding: 4rem 2rem;
		color: #64748b;
	}
	
	.no-results h3 {
		margin-bottom: 1rem;
		color: #94a3b8;
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.projects-page {
			margin-left: 2rem;
			margin-right: 2rem;
			width: calc(100vw - 4rem);
		}
		
		.page-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
		
		.filters-section {
			flex-direction: column;
			align-items: flex-start;
			padding: 1rem 1.5rem;
		}
		
		.filter-row {
			justify-content: flex-start;
		}
		
		.category-filters {
			justify-content: center;
		}
		
		.projects-grid {
			grid-template-columns: 1fr;
			padding: 0 1rem 2rem 1rem;
		}
		
		.project-card {
			margin: 0;
		}
	}
</style>
