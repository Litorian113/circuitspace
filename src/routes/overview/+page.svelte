<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
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
		
		// Initialize mock progress data for demo purposes
		initializeMockProgress();
		
		userLevel = getPlayerLevel();
		totalXP = getTotalExperience();
	});
	
	function initializeMockProgress() {
		// Check if we already have progress data
		const existingProgress = localStorage.getItem('circuitspace-component-progress');
		if (existingProgress && JSON.parse(existingProgress)) {
			const parsed = JSON.parse(existingProgress);
			// Only initialize if there's no meaningful progress yet
			if (Object.keys(parsed).length < 5) {
				createMockProgressData();
			}
		} else {
			createMockProgressData();
		}
	}
	
	function createMockProgressData() {
		// Create realistic mock progress data
		const mockProgress = {
			'led': {
				level: 5,
				experience: 500,
				quizzesTaken: 5,
				lastQuizDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
			},
			'resistor': {
				level: 4,
				experience: 380,
				quizzesTaken: 3,
				lastQuizDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
			},
			'breadboard': {
				level: 3,
				experience: 240,
				quizzesTaken: 4,
				lastQuizDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
			},
			'arduino-leonardo': {
				level: 2,
				experience: 160,
				quizzesTaken: 2,
				lastQuizDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
			},
			'pushbutton': {
				level: 3,
				experience: 220,
				quizzesTaken: 5,
				lastQuizDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
			},
			'potentiometer': {
				level: 2,
				experience: 140,
				quizzesTaken: 1,
				lastQuizDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
			},
			'5v-motor': {
				level: 1,
				experience: 60,
				quizzesTaken: 1,
				lastQuizDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
			},
			'capacitor': {
				level: 2,
				experience: 120,
				quizzesTaken: 2,
				lastQuizDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
			}
		};
		
		localStorage.setItem('circuitspace-component-progress', JSON.stringify(mockProgress));
	}

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
		
		// If no progress yet, return 0
		if (progress.level === 1 && progress.experience === 0) {
			return 0;
		}
		
		// Calculate progress within current level
		const experiencePerLevel = 100;
		const currentLevelStartExp = (progress.level - 1) * experiencePerLevel;
		const expInCurrentLevel = progress.experience - currentLevelStartExp;
		const progressInLevel = Math.min(100, (expInCurrentLevel / experiencePerLevel) * 100);
		
		// Overall progress considering all levels (out of 5 levels max)
		const maxLevels = 5;
		const levelProgress = ((progress.level - 1) / maxLevels) * 100;
		const currentLevelContribution = (progressInLevel / 100) * (100 / maxLevels);
		
		return Math.min(100, levelProgress + currentLevelContribution);
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case 'beginner': return '#22c55e';
			case 'intermediate': return '#f59e0b';
			case 'advanced': return '#ef4444';
			default: return '#6b7280';
		}
	}
	
	function getLevelIndicator(componentId: string): string {
		const progress = getComponentProgress(componentId);
		return `L${progress.level}`;
	}
	
	function getLevelColor(componentId: string): string {
		const progress = getComponentProgress(componentId);
		const level = progress.level;
		
		// Gestuftes System in unserem Circuitspace-Farbschema (Cyan/Teal)
		if (level === 5) return 'linear-gradient(135deg, #00d4aa 0%, #0ea5e9 50%, #06b6d4 100%)'; // Bright cyan gradient
		if (level === 4) return 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'; // Blue-cyan gradient
		if (level === 3) return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'; // Cyan gradient
		if (level === 2) return 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'; // Dark cyan gradient
		return '#374151'; // Simple dark gray for level 1
	}
	
	function getSpecialBadge(componentId: string): string | null {
		// Special badges removed for cleaner design
		return null;
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
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Sidebar -->
<Sidebar />

<!-- Main Content -->
<main class="main-content">
	<!-- Header -->
	<header class="components-header">
		<div class="header-left">
			<h1>Component Library</h1>
		</div>
	</header>

	<!-- Filters -->
	<div class="filters-section">
		<div class="filter-row">
			<!-- Search Box with Icon -->
			<div class="search-box">
				<input 
					type="text" 
					placeholder="Search..." 
					bind:value={searchTerm}
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
					<select id="category-select" bind:value={selectedCategory}>
						<option value="all">All Categories</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
				
				<div class="filter-group">
					<select id="difficulty-select" bind:value={selectedDifficulty}>
						<option value="all">Difficulty</option>
						{#each difficulties as difficulty}
							<option value={difficulty}>
								{difficulty === 'beginner' ? 'Beginner' : 
								 difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
							</option>
						{/each}
					</select>
				</div>
				
				<div class="filter-group">
					<select id="sort-select" bind:value={sortBy}>
						<option value="name">Name</option>
						<option value="difficulty">Difficulty</option>
						<option value="progress">Progress</option>
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Section -->
	<div class="stats-section">
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
	</div>

	<!-- Components Grid -->
	<div class="components-grid">
		{#each filteredComponents as component (component.id)}
			<div class="component-card">
				<!-- Header Section -->
				<div class="card-header">
					<div class="header-left">
						<img src="/special-icon/tabler-icon-progress-check.svg" alt="Progress" class="progress-icon" />
						<span class="level-text">Level {getComponentProgress(component.id).level}</span>
					</div>
					<div class="difficulty-tag {component.difficulty}">
						{component.difficulty === 'beginner' ? 'Beginner' : 
						 component.difficulty === 'intermediate' ? 'Intermediate' : 'Expert'}
					</div>
				</div>

				<!-- Title and Description -->
				<div class="card-content">
					<h3 class="component-title">{component.name}</h3>
					<p class="component-description">{component.description}</p>
				</div>

				<!-- Component Image Box -->
				<div class="component-image-box">
					<img src={component.image} alt={component.name} />
				</div>

				<!-- Tag Section -->
				<div class="tag-section">
					<span class="category-tag">{component.category}</span>
				</div>

				<!-- Progress Section -->
				<div class="progress-section">
					<div class="progress-header">
						<span class="progress-label">Level {getComponentProgress(component.id).level}/5</span>
					</div>
					<div class="progress-bar">
						<div 
							class="progress-fill" 
							style="width: {getProgressPercentage(component.id)}%"
						></div>
					</div>
                    <div class="progress-details">
						<span class="earn-exp">Earn {(5 - getComponentProgress(component.id).level) * 20} exp</span>
						<span class="progress-percentage">{Math.round(getProgressPercentage(component.id))}%</span>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="action-buttons">
					<button 
						class="action-btn learn-btn"
						on:click={(e) => {
							e.stopPropagation();
							goToComponent(component.id);
						}}
					>
						Learn more
					</button>
					<button 
						class="action-btn explore-btn"
						on:click={(e) => {
							e.stopPropagation();
							// Navigate to project creation with this component
							goto(`/project-chat?component=${component.id}`);
						}}
					>
						Explore Projects
					</button>
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

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', sans-serif;
		background: #191919;
		color: #e2e8f0;
		overflow-x: hidden;
	}

	:global(:root) {
		--sidebar-width: 280px; /* Default sidebar width */
	}

	.app-container {
		min-height: 100vh;
		background: #191919;
	}

	/* Sidebar Styling - Same as project-chat */

	/* Main Content */
	.main-content {
		margin-left: calc(var(--sidebar-width) + 4rem);
		margin-right: 6rem;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		background: #191919;
		transition: margin-left 0.3s ease;
		width: calc(100vw - var(--sidebar-width) - 10rem);
	}

	.components-header {
		padding: 2rem 3rem;
		border-bottom: 1px solid rgba(202, 189, 245, 0.1);
		background: rgba(25, 25, 25, 0.5);
		backdrop-filter: blur(8px);
	}

	.header-left h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #FFFFFF;
	}

	.page-description {
		font-size: 1.1rem;
		color: rgba(226, 232, 240, 0.8);
		margin: 0;
	}

	/* Stats Section */
	.stats-section {
		padding: 2rem 3rem;
		border-bottom: 1px solid rgba(202, 189, 245, 0.1);
	}

	.header-stats {
		display: flex;
		gap: 1.5rem;
		justify-content: left;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 1.5rem;
		background: rgba(202, 189, 245, 0.1);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(8px);
	}

	.stat-number {
		font-size: 1.75rem;
		font-weight: 700;
		color: #CABDF5;
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
	}

	.filter-row {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.search-box {
		position: relative;
		flex: 1;
		max-width: 500px;
		display: flex;
		align-items: center;
		background: #191919;
		border: none;
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.search-box:focus-within {
		box-shadow: 0 0 0 2px rgba(202, 189, 245, 0.3);
	}

	.search-box input {
		flex: 1;
		padding: 1rem 1.5rem;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: #e2e8f0;
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
		color: #00d4aa;
	}

	/* Components Grid */
	.components-grid {
		padding: 3rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}

	.component-card {
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

	.component-card:hover {
		transform: translateY(-8px);


	}

	/* Card Header */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.progress-icon {
		width: 20px;
		height: 20px;
		filter: brightness(0) invert(1);
	}

	.level-text {
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		color: #e2e8f0;
		font-size: 0.9rem;
	}

	.difficulty-tag {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.difficulty-tag.beginner {
		background: #CABDF5;
		color: #000000;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	.difficulty-tag.intermediate {
		background: #CABDF5;
		color: #000000;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	.difficulty-tag.advanced {
		background: #CABDF5;
		color: #000000;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	/* Card Content */
	.card-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.component-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0;
		line-height: 1.2;
	}

	.component-description {
		font-size: 0.9rem;
		color: #94a3b8;
		line-height: 1.4;
		margin: 0;
	}

	/* Component Image Box */
	.component-image-box {
		background: rgba(25, 25, 25, 0.6);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
	}

	.component-image-box img {
		max-width: 100%;
		max-height: 150px;
		object-fit: contain;
	}

	/* Tag Section */
	.tag-section {
		display: flex;
		gap: 0.5rem;
	}

	.category-tag {
		background: rgba(202, 189, 245, 0.1);
		color: #CABDF5;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	/* Progress Section */
	.progress-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.progress-header {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.progress-label {
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		color: #CABDF5;
		font-size: 0.9rem;
	}

	.progress-details {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-size: 0.8rem;
		margin-bottom: 0.75rem;
	}

	.earn-exp {
		color: #CABDF5;
		font-weight: 500;
	}

	.progress-percentage {
		color: #CABDF5;
		font-weight: 600;
	}

	.progress-bar {
		height: 8px;
		background: rgba(25, 25, 25, 0.8);
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #CABDF5, #a78bfa);
		transition: width 0.5s ease;
		border-radius: 4px;
		box-shadow: 0 0 8px rgba(202, 189, 245, 0.4);
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.action-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 2px solid #CABDF5;
		background: transparent;
		color: #CABDF5;
	}

	.action-btn:hover {
		background: rgba(202, 189, 245, 0.1);
		transform: translateY(-1px);
	}

	.learn-btn:hover {
		background: #CABDF5;
		color: #0f172a;
	}

	.explore-btn {
		border-color: #EDF760;
		color: #EDF760;
	}

	.explore-btn:hover {
		background: rgba(237, 247, 96, 0.1);
		border-color: #EDF760;
		color: #EDF760;
	}

	.component-image {
		height: 200px;
		background: rgba(25, 25, 25, 0.8);
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
	
	.component-level-badge {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 0.8rem;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 800;
		color: #ffffff;
		backdrop-filter: blur(8px);
		border: 2px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: 'IBM Plex Mono', monospace;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
		min-width: 50px;
	}
	
	/* Level 1 - Einfach, kein Glow */
	.component-level-badge.level-1 {
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: none;
	}
	
	/* Level 2 - Sanfter Glow */
	.component-level-badge.level-2 {
		border: 2px solid rgba(14, 116, 144, 0.5);
		box-shadow: 0 0 10px rgba(14, 116, 144, 0.3);
	}
	
	/* Level 3 - Mittlerer Glow */
	.component-level-badge.level-3 {
		border: 2px solid rgba(6, 182, 212, 0.6);
		box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
		animation: level3-glow 3s ease-in-out infinite;
	}
	
	/* Level 4 - Starker Glow */
	.component-level-badge.level-4 {
		border: 2px solid rgba(14, 165, 233, 0.7);
		box-shadow: 
			0 0 20px rgba(14, 165, 233, 0.5),
			0 0 40px rgba(14, 165, 233, 0.2);
		animation: level4-glow 2.5s ease-in-out infinite;
	}
	
	/* Level 5 - Epic Glow */
	.component-level-badge.level-5 {
		border: 2px solid #00d4aa;
		box-shadow: 
			0 0 25px rgba(0, 212, 170, 0.6),
			0 0 50px rgba(0, 212, 170, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		animation: level5-epic-glow 2s ease-in-out infinite;
		font-weight: 900;
		transform: scale(1.05);
	}
	
	.level-number {
		font-weight: inherit;
		font-size: 0.75rem;
	}

	.component-info {
		padding: 1.5rem;
	}
	
	.component-title-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.component-info h3 {
		color: #ffffff;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
	}

	.category-tag {
		display: inline-block;
		background: rgba(202, 189, 245, 0.1);
		color: #CABDF5;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		margin-bottom: 1rem;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	.component-description {
		color: rgba(226, 232, 240, 0.8);
		line-height: 1.6;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.progress-section {
		border-top: 1px solid rgba(202, 189, 245, 0.3);
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
		color: #CABDF5;
		font-family: 'IBM Plex Mono', monospace;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: rgba(25, 25, 25, 0.8);
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid rgba(202, 189, 245, 0.3);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #CABDF5, #a78bfa);
		transition: width 0.3s ease;
		border-radius: 3px;
		position: relative;
		box-shadow: 0 0 8px rgba(202, 189, 245, 0.4);
	}

	.quiz-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8rem;
		color: rgba(226, 232, 240, 0.6);
		margin-top: 0.5rem;
	}
	
	.xp-earned {
		color: #fbbf24;
		font-weight: 600;
		font-family: 'IBM Plex Mono', monospace;
	}
	
	.quiz-count {
		color: rgba(226, 232, 240, 0.7);
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
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.reset-filters-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
	}
	
	/* Animations */
	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
		}
		50% {
			box-shadow: 0 2px 4px rgba(239, 68, 68, 0.6), 0 0 12px rgba(239, 68, 68, 0.4);
		}
	}
	
	@keyframes level3-glow {
		0%, 100% {
			box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
		}
		50% {
			box-shadow: 0 0 20px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.3);
		}
	}
	
	@keyframes level4-glow {
		0%, 100% {
			box-shadow: 
				0 0 20px rgba(14, 165, 233, 0.5),
				0 0 40px rgba(14, 165, 233, 0.2);
		}
		50% {
			box-shadow: 
				0 0 25px rgba(14, 165, 233, 0.7),
				0 0 50px rgba(14, 165, 233, 0.4);
		}
	}
	
	@keyframes level5-epic-glow {
		0%, 100% {
			box-shadow: 
				0 0 25px rgba(0, 212, 170, 0.6),
				0 0 50px rgba(0, 212, 170, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
		50% {
			box-shadow: 
				0 0 35px rgba(0, 212, 170, 0.8),
				0 0 70px rgba(0, 212, 170, 0.5),
				0 0 100px rgba(0, 212, 170, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.4);
		}
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.filter-row {
			flex-direction: column;
			align-items: stretch;
			gap: 1.5rem;
		}

		.search-box {
			max-width: none;
		}

		.filter-controls {
			justify-content: center;
		}
	}

	@media (max-width: 768px) {
		.main-content {
			margin-left: 1.5rem;
			margin-right: 1.5rem;
			width: calc(100vw - 3rem);
		}
		
		.components-header {
			padding: 1.5rem;
		}
		
		.header-left h1 {
			font-size: 1.5rem;
		}
		
		.stats-section {
			padding: 1.5rem;
		}
		
		.header-stats {
			flex-direction: column;
			gap: 1rem;
		}
		
		.filters-section {
			padding: 1.5rem;
		}
		
		.filter-controls {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.filter-group {
			justify-content: space-between;
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
