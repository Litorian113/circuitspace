<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { 
		componentLibrary, 
		getComponentProgress, 
		getPlayerLevel,
		getTotalExperience 
	} from '$lib/stores/components';
	import type { ComponentDetails } from '$lib/stores/components';

	let allComponents: ComponentDetails[] = [];
	let filteredComponents: ComponentDetails[] = [];
	let searchTerm = '';
	let selectedDifficulty = 'all';
	let selectedCategory = 'all';
	let sortBy = 'name';
	let userLevel = 1;
	let totalXP = 0;

	onMount(() => {
		allComponents = componentLibrary;
		filteredComponents = allComponents;
		userLevel = getPlayerLevel();
		totalXP = getTotalExperience();
	});

	$: {
		filteredComponents = allComponents.filter(component => {
			const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
								component.description.toLowerCase().includes(searchTerm.toLowerCase());
			
			const matchesDifficulty = selectedDifficulty === 'all' || 
									component.difficulty === selectedDifficulty;
			
			const matchesCategory = selectedCategory === 'all' || 
								   component.category === selectedCategory;
			
			return matchesSearch && matchesDifficulty && matchesCategory;
		});

		// Sort components
		filteredComponents.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'difficulty':
					const difficultyOrder: { [key: string]: number } = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
					return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
				case 'progress':
					const progressA = getComponentProgress(a.id).quizzesTaken;
					const progressB = getComponentProgress(b.id).quizzesTaken;
					return progressB - progressA;
				default:
					return 0;
			}
		});
	}

	function goToComponent(componentId: string) {
		goto(`/components/${componentId}`);
	}

	function getProgressPercentage(componentId: string): number {
		const progress = getComponentProgress(componentId);
		return (progress.quizzesTaken / 5) * 100; // 5 quizzes per component
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case 'beginner': return '#22c55e';
			case 'intermediate': return '#f59e0b';
			case 'advanced': return '#ef4444';
			default: return '#6b7280';
		}
	}

	function goHome() {
		goto('/');
	}

	function goToProjects() {
		goto('/project-chat');
	}

	function goToTemplates() {
		goto('/templates');
	}

	// Get categories for filter dropdown
	$: categories = [...new Set(allComponents.map(c => c.category))];
	$: difficulties = ['beginner', 'intermediate', 'advanced'];
</script>

<svelte:head>
	<title>Explore Components - Circuitspace</title>
	<meta name="description" content="Explore electronic components and learn with interactive quizzes" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
	<!-- Sidebar -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<button class="home-link" on:click={goHome}>
				<h2>Circuitspace</h2>
			</button>
			<div class="level-indicator">
				<span class="level-badge">Level {userLevel}</span>
			</div>
		</div>
		
		<nav class="sidebar-nav">
			<!-- <button class="nav-item" on:click={goHome}>
				🏠 Home
			</button> -->
			<button class="nav-item" on:click={goToProjects}>
				⚡ IDE / Projects
			</button>
			<button class="nav-item active">
				📚 Components
			</button>
			<button class="nav-item" on:click={goToTemplates}>
				🛠️ Templates
			</button>
		</nav>
		
		<div class="sidebar-footer">
			<div class="user-progress">
				<h4>Your Progress</h4>
				<div class="xp-info">
					<span class="xp-amount">{totalXP} XP</span>
					<span class="components-completed">{allComponents.filter(c => getProgressPercentage(c.id) === 100).length}/{allComponents.length} completed</span>
				</div>
				<div class="achievement-preview">
					<div class="achievement-icon">🏆</div>
					<div class="achievement-text">
						<span class="achievement-title">Component Explorer</span>
						<span class="achievement-desc">Keep learning!</span>
					</div>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="main-content">
		<!-- Header -->
		<header class="components-header">
			<div class="header-left">
				<h1>Explore Components</h1>
				<p class="page-description">Learn about electronic components and gain experience points through interactive quizzes!</p>
			</div>
			<div class="header-stats">
				<div class="stat-card">
					<span class="stat-number">{allComponents.length}</span>
					<span class="stat-label">Components</span>
				</div>
				<div class="stat-card">
					<span class="stat-number">{allComponents.filter(c => getProgressPercentage(c.id) > 0).length}</span>
					<span class="stat-label">Started</span>
				</div>
				<div class="stat-card">
					<span class="stat-number">{allComponents.filter(c => getProgressPercentage(c.id) === 100).length}</span>
					<span class="stat-label">Completed</span>
				</div>
			</div>
		</header>

		<!-- Filters -->
		<div class="filters-section">
			<div class="search-group">
				<div class="search-box">
					<input 
						type="text" 
						placeholder="Search components..." 
						bind:value={searchTerm}
					/>
				</div>
			</div>
			
			<div class="filter-controls">
				<div class="filter-group">
					<label for="category-select">Category:</label>
					<select id="category-select" bind:value={selectedCategory}>
						<option value="all">All Categories</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
				
				<div class="filter-group">
					<label for="difficulty-select">Difficulty:</label>
					<select id="difficulty-select" bind:value={selectedDifficulty}>
						<option value="all">All</option>
						{#each difficulties as difficulty}
							<option value={difficulty}>
								{difficulty === 'beginner' ? 'Beginner' : 
								 difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
							</option>
						{/each}
					</select>
				</div>
				
				<div class="filter-group">
					<label for="sort-select">Sort by:</label>
					<select id="sort-select" bind:value={sortBy}>
						<option value="name">Name</option>
						<option value="difficulty">Difficulty</option>
						<option value="progress">Progress</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Components Grid -->
		<div class="components-grid">
			{#each filteredComponents as component (component.id)}
				<div 
					class="component-card"
					on:click={() => goToComponent(component.id)}
					on:keydown={(e) => e.key === 'Enter' && goToComponent(component.id)}
					tabindex="0"
					role="button"
				>
					<div class="component-image">
						<img src={component.image} alt={component.name} />
						<div class="difficulty-badge" style="background-color: {getDifficultyColor(component.difficulty)}">
							{component.difficulty === 'beginner' ? 'Beginner' : 
							 component.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
						</div>
					</div>
					
					<div class="component-info">
						<h3>{component.name}</h3>
						<span class="category-tag">{component.category}</span>
						<p class="component-description">{component.description}</p>
						
						<div class="progress-section">
							<div class="progress-header">
								<span class="progress-label">Progress</span>
								<span class="progress-percentage">{Math.round(getProgressPercentage(component.id))}%</span>
							</div>
							<div class="progress-bar">
								<div 
									class="progress-fill" 
									style="width: {getProgressPercentage(component.id)}%"
								></div>
							</div>
							<div class="quiz-info">
								{getComponentProgress(component.id).quizzesTaken}/5 Quizzes completed
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredComponents.length === 0}
			<div class="no-results">
				<div class="no-results-icon">🔍</div>
				<h3>No components found</h3>
				<p>Try a different search or select different filters.</p>
				<button class="reset-filters-btn" on:click={() => {
					searchTerm = '';
					selectedCategory = 'all';
					selectedDifficulty = 'all';
				}}>
					Reset filters
				</button>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Space Grotesk', sans-serif;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		color: #e2e8f0;
		overflow-x: hidden;
	}

	.app-container {
		display: flex;
		height: 100vh;
		overflow: hidden;
	}

	/* Sidebar Styling - Same as project-chat */
	.sidebar {
		width: 320px;
		background: rgba(15, 23, 42, 0.95);
		border-right: 1px solid rgba(0, 212, 170, 0.2);
		display: flex;
		flex-direction: column;
		backdrop-filter: blur(12px);
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 2rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.home-link {
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0.5rem;
		border-radius: 8px;
	}

	.home-link:hover {
		background: rgba(0, 212, 170, 0.1);
		transform: scale(1.05);
	}

	.home-link h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: #00d4aa;
		transition: color 0.3s ease;
	}

	.home-link:hover h2 {
		color: #ffffff;
	}

	.level-indicator {
		display: flex;
		align-items: center;
	}

	.level-badge {
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		color: #0a0f1a;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1rem 2rem;
		background: none;
		border: none;
		color: rgba(226, 232, 240, 0.8);
		cursor: pointer;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.3s ease;
		border-left: 3px solid transparent;
	}

	.nav-item:hover {
		background: rgba(0, 212, 170, 0.1);
		color: #ffffff;
		border-left-color: rgba(0, 212, 170, 0.5);
		transform: translateX(4px);
	}

	.nav-item.active {
		background: rgba(0, 212, 170, 0.15);
		color: #00d4aa;
		border-left-color: #00d4aa;
		font-weight: 600;
	}

	.sidebar-footer {
		padding: 2rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}

	.user-progress h4 {
		color: #00d4aa;
		margin-bottom: 1rem;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.xp-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.xp-amount {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
	}

	.components-completed {
		font-size: 0.875rem;
		color: rgba(226, 232, 240, 0.7);
	}

	.achievement-preview {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(0, 212, 170, 0.1);
		border-radius: 8px;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}

	.achievement-icon {
		font-size: 2rem;
	}

	.achievement-text {
		display: flex;
		flex-direction: column;
	}

	.achievement-title {
		font-weight: 600;
		color: #ffffff;
		font-size: 0.9rem;
	}

	.achievement-desc {
		font-size: 0.8rem;
		color: rgba(226, 232, 240, 0.7);
	}

	/* Main Content */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	}

	.components-header {
		padding: 2rem 3rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
	}

	.header-left h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
	}

	.page-description {
		font-size: 1.1rem;
		color: rgba(226, 232, 240, 0.8);
		margin: 0;
	}

	.header-stats {
		display: flex;
		gap: 1.5rem;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 1.5rem;
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(8px);
	}

	.stat-number {
		font-size: 1.75rem;
		font-weight: 700;
		color: #00d4aa;
		font-family: 'IBM Plex Mono', monospace;
	}

	.stat-label {
		font-size: 0.875rem;
		color: rgba(226, 232, 240, 0.7);
		margin-top: 0.25rem;
	}

	/* Filters */
	.filters-section {
		padding: 2rem 3rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		background: rgba(30, 41, 59, 0.3);
	}

	.search-group {
		margin-bottom: 1.5rem;
	}

	.search-box input {
		width: 100%;
		max-width: 500px;
		padding: 1rem 1.5rem;
		border: 2px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		font-size: 1rem;
		background: rgba(15, 23, 42, 0.8);
		color: #e2e8f0;
		font-family: 'Space Grotesk', sans-serif;
		transition: all 0.3s ease;
	}

	.search-box input:focus {
		outline: none;
		border-color: #00d4aa;
		box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.2);
	}

	.search-box input::placeholder {
		color: rgba(226, 232, 240, 0.5);
	}

	.filter-controls {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-group label {
		font-weight: 500;
		color: rgba(226, 232, 240, 0.8);
		font-size: 0.875rem;
	}

	.filter-group select {
		padding: 0.75rem 1rem;
		border: 2px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		background: rgba(15, 23, 42, 0.8);
		color: #e2e8f0;
		font-family: 'Space Grotesk', sans-serif;
		cursor: pointer;
		transition: border-color 0.3s ease;
	}

	.filter-group select:focus {
		outline: none;
		border-color: #00d4aa;
	}

	/* Components Grid */
	.components-grid {
		padding: 3rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}

	.component-card {
		background: rgba(30, 41, 59, 0.8);
		border: 2px solid rgba(0, 212, 170, 0.2);
		border-radius: 16px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.component-card:hover {
		transform: translateY(-8px);
		border-color: #00d4aa;
		box-shadow: 0 20px 40px rgba(0, 212, 170, 0.2);
	}

	.component-card:focus {
		outline: none;
		border-color: #00d4aa;
		transform: translateY(-4px);
	}

	.component-image {
		height: 200px;
		background: rgba(15, 23, 42, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		position: relative;
	}

	.component-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
	}

	.difficulty-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.component-info {
		padding: 1.5rem;
	}

	.component-info h3 {
		color: #ffffff;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.category-tag {
		display: inline-block;
		background: rgba(0, 212, 170, 0.2);
		color: #00d4aa;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		margin-bottom: 1rem;
		border: 1px solid rgba(0, 212, 170, 0.3);
	}

	.component-description {
		color: rgba(226, 232, 240, 0.8);
		line-height: 1.6;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.progress-section {
		border-top: 1px solid rgba(0, 212, 170, 0.2);
		padding-top: 1rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.progress-label {
		font-weight: 500;
		color: rgba(226, 232, 240, 0.8);
		font-size: 0.875rem;
	}

	.progress-percentage {
		font-weight: 600;
		color: #00d4aa;
		font-family: 'IBM Plex Mono', monospace;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: rgba(15, 23, 42, 0.8);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #00d4aa, #0ea5e9);
		transition: width 0.3s ease;
		border-radius: 3px;
	}

	.quiz-info {
		font-size: 0.8rem;
		color: rgba(226, 232, 240, 0.6);
		text-align: center;
	}

	/* No Results */
	.no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		color: rgba(226, 232, 240, 0.8);
	}

	.no-results-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.no-results h3 {
		margin-bottom: 1rem;
		color: #ffffff;
		font-size: 1.5rem;
	}

	.no-results p {
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.reset-filters-btn {
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		border: none;
		border-radius: 12px;
		color: #0a0f1a;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.reset-filters-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.sidebar {
			width: 280px;
		}
		
		.components-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}
		
		.header-stats {
			align-self: stretch;
			justify-content: space-around;
		}
	}

	@media (max-width: 768px) {
		.app-container {
			flex-direction: column;
		}
		
		.sidebar {
			width: 100%;
			height: auto;
			max-height: 200px;
			overflow-y: auto;
		}
		
		.sidebar-header {
			padding: 1rem;
		}
		
		.sidebar-nav {
			display: flex;
			flex-direction: row;
			overflow-x: auto;
			padding: 0.5rem 0;
		}
		
		.nav-item {
			white-space: nowrap;
			padding: 0.75rem 1.5rem;
			border-left: none;
			border-bottom: 3px solid transparent;
		}
		
		.nav-item:hover,
		.nav-item.active {
			border-left: none;
			border-bottom-color: #00d4aa;
			transform: translateY(-2px);
		}
		
		.sidebar-footer {
			display: none;
		}
		
		.components-header {
			padding: 1.5rem;
		}
		
		.header-left h1 {
			font-size: 1.5rem;
		}
		
		.filters-section {
			padding: 1.5rem;
		}
		
		.filter-controls {
			flex-direction: column;
			gap: 1rem;
		}
		
		.components-grid {
			padding: 1.5rem;
			grid-template-columns: 1fr;
		}
		
		.stat-card {
			padding: 0.75rem 1rem;
		}
		
		.stat-number {
			font-size: 1.5rem;
		}
	}
</style>
