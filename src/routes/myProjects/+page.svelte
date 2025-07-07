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
			case 'done': return 'Abgeschlossen';
			case 'in-progress': return 'In Arbeit';
			case 'paused': return 'Pausiert';
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
		alert(`Vorschau für ${project.name}:\n\n${project.description}\n\nKomponenten: ${project.components.length}\nSchwierigkeit: ${project.difficulty}/5\nStatus: ${getStateText(project.state)}`);
	}

	function deleteProject(project: UserProject) {
		if (confirm(`Bist du sicher, dass du "${project.name}" löschen möchtest?`)) {
			userProjects.deleteProject(project.id);
		}
	}
</script>

<svelte:head>
	<title>Meine Projekte - Circuitspace</title>
</svelte:head>

<!-- Sidebar -->
<Sidebar />

<!-- Main Content -->
<div class="projects-page">
	<header class="page-header">
		<div class="header-content">
			<h1>Meine Projekte</h1>
			<p>Verwalte und bearbeite deine Electronics-Projekte</p>
		</div>
		<button on:click={() => goto('/')} class="back-btn">← Zurück</button>
	</header>
	
	<div class="filters-section">
		<div class="search-container">
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Nach Projekten suchen..."
				class="search-input"
			/>
		</div>
		
		<div class="category-filters">
			<button 
				class="filter-btn {selectedCategory === 'all' ? 'active' : ''}"
				on:click={() => selectedCategory = 'all'}
			>
				Alle
			</button>
			<button 
				class="filter-btn {selectedCategory === 'beginner' ? 'active' : ''}"
				on:click={() => selectedCategory = 'beginner'}
			>
				Anfänger
			</button>
			<button 
				class="filter-btn {selectedCategory === 'intermediate' ? 'active' : ''}"
				on:click={() => selectedCategory = 'intermediate'}
			>
				Fortgeschritten
			</button>
			<button 
				class="filter-btn {selectedCategory === 'advanced' ? 'active' : ''}"
				on:click={() => selectedCategory = 'advanced'}
			>
				Experte
			</button>
		</div>

		<div class="state-filters">
			<button 
				class="filter-btn {selectedState === 'all' ? 'active' : ''}"
				on:click={() => selectedState = 'all'}
			>
				Alle Status
			</button>
			<button 
				class="filter-btn {selectedState === 'in-progress' ? 'active' : ''}"
				on:click={() => selectedState = 'in-progress'}
			>
				In Arbeit
			</button>
			<button 
				class="filter-btn {selectedState === 'done' ? 'active' : ''}"
				on:click={() => selectedState = 'done'}
			>
				Abgeschlossen
			</button>
			<button 
				class="filter-btn {selectedState === 'paused' ? 'active' : ''}"
				on:click={() => selectedState = 'paused'}
			>
				Pausiert
			</button>
		</div>
	</div>
	
	<div class="projects-grid">
		{#each filteredProjects as project (project.id)}
			<div class="project-card">
				<div class="card-header">
					<div class="header-top">
						<h3>{project.name}</h3>
						<div class="badges">
							<div class="state-badge" style="background-color: {getStateColor(project.state)}">
								{getStateText(project.state)}
							</div>
							<div class="difficulty-badge" style="background-color: {getCategoryColor(project.category)}">
								{project.category}
							</div>
						</div>
					</div>
				</div>
				
				<div class="card-content">
					<p class="description">{project.description}</p>
					
					<div class="project-meta">
						<div class="meta-row">
							<span class="meta-label">Schwierigkeit:</span>
							<span class="difficulty-stars">{getDifficultyStars(project.difficulty)}</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">Dauer:</span>
							<span>{project.estimatedTime}</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">Komponenten:</span>
							<span>{project.componentsCount} Teile</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">Erstellt:</span>
							<span>{project.createdAt.toLocaleDateString('de-DE')}</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">Zuletzt bearbeitet:</span>
							<span>{project.updatedAt.toLocaleDateString('de-DE')}</span>
						</div>
					</div>
					
					<div class="learning-objectives">
						<h4>Lernziele:</h4>
						<ul>
							{#each project.learningGoals.slice(0, 3) as goal}
								<li>{goal}</li>
							{/each}
							{#if project.learningGoals.length > 3}
								<li class="more-objectives">+{project.learningGoals.length - 3} weitere...</li>
							{/if}
						</ul>
					</div>
					
					<div class="tags">
						{#each project.tags.slice(0, 4) as tag}
							<span class="tag">#{tag}</span>
						{/each}
					</div>
				</div>
				
				<div class="card-actions">
					<button 
						on:click={() => previewProject(project)}
						class="btn-secondary"
					>
						Vorschau
					</button>
					<button 
						on:click={() => continueProject(project)}
						class="btn-primary"
					>
						{project.state === 'done' ? 'Anzeigen' : 'Bearbeiten'}
					</button>
					<button 
						on:click={() => deleteProject(project)}
						class="btn-danger"
					>
						Löschen
					</button>
				</div>
			</div>
		{/each}
	</div>
	
	{#if filteredProjects.length === 0}
		<div class="no-results">
			<h3>Keine Projekte gefunden</h3>
			<p>Versuche es mit anderen Suchbegriffen oder wähle eine andere Kategorie/Status.</p>
			<button on:click={() => goto('/templates')} class="btn-primary">
				Neues Projekt aus Vorlage erstellen
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
		overflow-x: hidden;
	}
	
	:global(:root) {
		--sidebar-width: 280px; /* Default sidebar width */
	}

	.projects-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #0a0f1a 0%, #1e293b 100%);
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
		margin-left: var(--sidebar-width, 280px);
		transition: margin-left 0.3s ease;
		width: calc(100vw - var(--sidebar-width, 280px));
		position: relative;
	}
	
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 3rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.2);
		background: rgba(30, 41, 59, 0.5);
		backdrop-filter: blur(10px);
	}
	
	.header-content h1 {
		margin: 0;
		font-size: 2.5rem;
		background: linear-gradient(135deg, #00d4aa 0%, #00b8d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.header-content p {
		margin: 0.5rem 0 0 0;
		color: #94a3b8;
		font-size: 1.1rem;
	}
	
	.back-btn {
		padding: 0.75rem 1.5rem;
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	
	.back-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		transform: translateY(-1px);
	}
	
	.filters-section {
		padding: 2rem 3rem;
		display: flex;
		gap: 2rem;
		align-items: center;
		flex-wrap: wrap;
	}
	
	.search-container {
		flex: 1;
		min-width: 300px;
	}
	
	.search-input {
		width: 100%;
		padding: 1rem;
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		color: #e2e8f0;
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.2s ease;
	}
	
	.search-input:focus {
		outline: none;
		border-color: #00d4aa;
		box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
	}
	
	.category-filters,
	.state-filters {
		display: flex;
		gap: 0.5rem;
	}
	
	.state-filters {
		border-left: 1px solid rgba(0, 212, 170, 0.3);
		padding-left: 2rem;
	}
	
	.filter-btn {
		padding: 0.75rem 1.5rem;
		background: rgba(30, 41, 59, 0.8);
		color: #94a3b8;
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	
	.filter-btn:hover {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		border-color: rgba(0, 212, 170, 0.3);
	}
	
	.filter-btn.active {
		background: rgba(0, 212, 170, 0.2);
		color: #00d4aa;
		border-color: #00d4aa;
	}
	
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 2rem;
		padding: 0 3rem 3rem 3rem;
	}
	
	.project-card {
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}
	
	.project-card:hover {
		transform: translateY(-4px);
		border-color: #00d4aa;
		box-shadow: 0 20px 40px rgba(0, 212, 170, 0.1);
	}
	
	.card-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}
	
	.card-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #ffffff;
		flex: 1;
	}
	
	.badges {
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
		align-items: flex-end;
	}
	
	.state-badge,
	.difficulty-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #000000;
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
		padding: 1.5rem;
	}
	
	.description {
		color: #94a3b8;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}
	
	.template-meta {
		margin-bottom: 1.5rem;
	}
	
	.meta-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	
	.meta-label {
		color: #64748b;
	}
	
	.difficulty-stars {
		color: #fbbf24;
	}
	
	.learning-objectives {
		margin-bottom: 1.5rem;
	}
	
	.learning-objectives h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		color: #00d4aa;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
		color: #00d4aa;
	}
	
	.more-objectives {
		font-style: italic;
		color: #64748b;
	}
	
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	
	.tag {
		padding: 0.25rem 0.5rem;
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		border-radius: 6px;
		font-size: 0.8rem;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}
	
	.card-actions {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.btn-secondary,
	.btn-primary {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		font-family: inherit;
	}
	
	.btn-secondary {
		background: rgba(148, 163, 184, 0.1);
		color: #94a3b8;
		border: 1px solid rgba(148, 163, 184, 0.2);
	}
	
	.btn-secondary:hover {
		background: rgba(148, 163, 184, 0.2);
		color: #ffffff;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #00d4aa 0%, #00b8d4 100%);
		color: #000000;
	}
	
	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 8px 16px rgba(0, 212, 170, 0.3);
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
			margin-left: 0;
			width: 100vw;
		}
		
		.page-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
		
		.filters-section {
			flex-direction: column;
			align-items: stretch;
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
