<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { 
		getComponentById,
		getComponentProgress, 
		updateComponentProgress, 
		canTakeQuiz, 
		getQuizQuestions,
		submitQuizAnswer,
		getPlayerLevel,
		getTotalExperience,
		saveComponentProgress,
		type ComponentDetails
	} from '$lib/stores/components';

	export let data: PageData;
	
	let component: ComponentDetails | null = null;
	let showQuiz = false;
	let currentQuestionIndex = 0;
	let selectedAnswer: number | null = null;
	let showQuizResult = false;
	let correctAnswers = 0;
	let isQuizCompleted = false;
	let quizQuestions: any[] = [];
	let canStartQuiz = true;
	let dailyQuizCount = 0;
	let userLevel = 1;
	let totalXP = 0;
	let componentProgress: any = {};

	onMount(() => {
		component = data.component;
		if (component) {
			loadProgressData();
		}
		userLevel = getPlayerLevel();
		totalXP = getTotalExperience();
	});

	function loadProgressData() {
		if (!component) return;
		
		componentProgress = getComponentProgress(component.id);
		canStartQuiz = canTakeQuiz(component.id);
		
		// Load quiz questions for this component
		quizQuestions = getQuizQuestions(component.id);
	}

	function goHome() {
		goto('/');
	}

	function goBack() {
		goto('/components/overview');
	}

	function startQuiz() {
		if (!canStartQuiz || !component) return;
		
		quizQuestions = getQuizQuestions(component.id);
		showQuiz = true;
		currentQuestionIndex = 0;
		selectedAnswer = null;
		showQuizResult = false;
		correctAnswers = 0;
		isQuizCompleted = false;
	}

	function selectAnswer(answerIndex: number) {
		selectedAnswer = answerIndex;
	}

	function submitAnswer() {
		if (selectedAnswer === null) return;
		
		const isCorrect = selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer;
		if (isCorrect) {
			correctAnswers++;
		}
		
		showQuizResult = true;
		
		// Auto-advance after 2 seconds
		setTimeout(() => {
			if (currentQuestionIndex < quizQuestions.length - 1) {
				nextQuestion();
			} else {
				completeQuiz();
			}
		}, 2000);
	}

	function nextQuestion() {
		currentQuestionIndex++;
		selectedAnswer = null;
		showQuizResult = false;
	}

	function completeQuiz() {
		if (!component) return;
		
		isQuizCompleted = true;
		
		// Calculate experience gained (20 XP per correct answer)
		const experienceGained = correctAnswers * 20;
		
		// Update component progress
		const result = submitQuizAnswer(component.id, correctAnswers, quizQuestions.length);
		component.level = result.newLevel;
		component.experience = result.newExperience;
		component.quizzesTaken = result.quizzesTaken;
		component.lastQuizDate = new Date();
		
		// Update daily quiz count
		dailyQuizCount++;
		canStartQuiz = dailyQuizCount < component.maxQuizzesPerDay;
		
		// Save progress
		saveComponentProgress({
			[component.id]: {
				level: component.level,
				experience: component.experience,
				quizzesTaken: component.quizzesTaken,
				lastQuizDate: component.lastQuizDate
			}
		});
	}

	function closeQuiz() {
		showQuiz = false;
		showQuizResult = false;
		isQuizCompleted = false;
	}

	function getProgressPercentage(): number {
		if (!component) return 0;
		return Math.min((component.experience / (component.maxLevel * 100)) * 100, 100);
	}

	function getCurrentLevelProgress(): number {
		if (!component) return 0;
		const currentLevelExp = component.experience % 100;
		return (currentLevelExp / 100) * 100;
	}

	function goToProjects() {
		goto('/project-chat');
	}

	function goToTemplates() {
		goto('/templates');
	}

	function goToComponents() {
		goto('/components/overview');
	}
</script>

<svelte:head>
	<title>{component?.name || 'Komponente'} - Circuitspace</title>
	<meta name="description" content={component?.description || 'Elektronische Komponente'} />
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
			<button class="nav-item" on:click={goHome}>
				🏠 Home
			</button>
			<button class="nav-item" on:click={goToProjects}>
				⚡ IDE / Projects
			</button>
			<button class="nav-item active" on:click={goToComponents}>
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
		{#if component}
		<!-- Back Button -->
		<div class="back-button-container">
			<button class="back-button" on:click={goToComponents}>
				← Zurück zur Übersicht
			</button>
		</div>
		<!-- Component Header -->
		<div class="component-header">
			<div class="component-image-large">
				<img src={component.image} alt={component.name} />
			</div>
			<div class="component-meta">
				<span class="category-badge">{component.category}</span>
				<h1>{component.name}</h1>
				<p class="description">{component.description}</p>
				
				<!-- Progress Section -->
				<div class="progress-section">
					<div class="level-info">
						<span class="level-badge">Level {component.level}/{component.maxLevel}</span>
						<span class="experience-text">{component.experience}/{component.maxLevel * 100} XP</span>
					</div>
					<div class="progress-bars">
						<div class="progress-bar total">
							<div class="progress-fill" style="width: {getProgressPercentage()}%"></div>
						</div>
						<div class="progress-bar current">
							<div class="progress-fill" style="width: {getCurrentLevelProgress()}%"></div>
						</div>
					</div>
				</div>

				<!-- Quiz Button -->
				<div class="quiz-section">
					{#if canStartQuiz}
						<button class="quiz-button" on:click={startQuiz}>
							🧠 Quiz starten ({component.maxQuizzesPerDay - dailyQuizCount} verbleibend)
						</button>
					{:else}
						<div class="quiz-limit-message">
							Tägliches Quiz-Limit erreicht. Versuchen Sie es morgen erneut!
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Component Details -->
		<div class="details-grid">
			<!-- Detailed Description -->
			<div class="detail-card">
				<h3>Detaillierte Beschreibung</h3>
				<p>{component.detailedDescription}</p>
			</div>

			<!-- Specifications -->
			<div class="detail-card">
				<h3>Technische Daten</h3>
				<div class="specifications">
					{#each Object.entries(component.specifications) as [key, value]}
						<div class="spec-row">
							<span class="spec-key">{key}:</span>
							<span class="spec-value">{value}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Working Principle -->
			<div class="detail-card">
				<h3>Funktionsweise</h3>
				<p>{component.workingPrinciple}</p>
			</div>

			<!-- Common Uses -->
			<div class="detail-card">
				<h3>Häufige Anwendungen</h3>
				<ul>
					{#each component.commonUses as use}
						<li>{use}</li>
					{/each}
				</ul>
			</div>

			<!-- Safety Tips -->
			<div class="detail-card">
				<h3>Sicherheitshinweise</h3>
				<ul class="safety-list">
					{#each component.safetyTips as tip}
						<li>⚠️ {tip}</li>
					{/each}
				</ul>
			</div>

			<!-- Pinouts (if available) -->
			{#if component.pinouts && component.pinouts.length > 0}
				<div class="detail-card">
					<h3>Pin-Belegung</h3>
					<ul>
						{#each component.pinouts as pinout}
							<li>{pinout}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
		{/if}
	</main>
</div>

<!-- Quiz Modal -->
{#if showQuiz}
	<div class="quiz-modal-overlay">
		<div class="quiz-modal">
			{#if !isQuizCompleted}
				<div class="quiz-header">
					<h3>Quiz: {component?.name || 'Komponente'}</h3>
					<span class="question-counter">Frage {currentQuestionIndex + 1} von {quizQuestions.length}</span>
				</div>

				<div class="quiz-question">
					<h4>{quizQuestions[currentQuestionIndex].question}</h4>
					
					<div class="quiz-options">
						{#each quizQuestions[currentQuestionIndex].options as option, index}
							<button 
								class="quiz-option {selectedAnswer === index ? 'selected' : ''} {showQuizResult ? (index === quizQuestions[currentQuestionIndex].correctAnswer ? 'correct' : selectedAnswer === index ? 'incorrect' : '') : ''}"
								on:click={() => selectAnswer(index)}
								disabled={showQuizResult}
							>
								{option}
							</button>
						{/each}
					</div>

					{#if showQuizResult}
						<div class="quiz-explanation">
							<strong>Erklärung:</strong> {quizQuestions[currentQuestionIndex].explanation}
						</div>
					{/if}

					{#if !showQuizResult}
						<button 
							class="submit-answer-btn"
							on:click={submitAnswer}
							disabled={selectedAnswer === null}
						>
							Antwort bestätigen
						</button>
					{/if}
				</div>
			{:else}
				<div class="quiz-results">
					<h3>Quiz abgeschlossen! 🎉</h3>
					<div class="results-summary">
						<div class="score">{correctAnswers}/{quizQuestions.length}</div>
						<div class="score-text">richtige Antworten</div>
						<div class="experience-gained">+{correctAnswers * 20} XP erhalten!</div>
						{#if component && component.level > 1}
							<div class="level-up">Level {component.level - 1} → {component.level}! 🚀</div>
						{/if}
					</div>
					<button class="close-quiz-btn" on:click={closeQuiz}>Schließen</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #0f1115;
		color: #e2e8f0;
		font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	/* App Layout */
	.app-container {
		display: flex;
		min-height: 100vh;
		background: #0f1115;
	}

	/* Main Content */
	.main-content {
		flex: 1;
		margin-left: 320px;
		overflow-y: auto;
		height: 100vh;
		background: #0f1115;
	}

	/* Sidebar Styles */
	.sidebar {
		width: 320px;
		background: linear-gradient(145deg, #1a1b23 0%, #14161b 100%);
		border-right: 1px solid #2a2d3a;
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 2rem 1.5rem 1rem;
		border-bottom: 1px solid #2a2d3a;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.home-link {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0;
	}

	.home-link h2 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.025em;
	}

	.level-indicator {
		display: flex;
		justify-content: center;
	}

	.level-badge {
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.025em;
	}

	/* Sidebar Navigation */
	.sidebar-nav {
		padding: 1.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 1;
	}

	.nav-item {
		background: none;
		border: none;
		color: #94a3b8;
		padding: 1rem 1.25rem;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: 'Space Grotesk', sans-serif;
	}

	.nav-item:hover {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		transform: translateX(4px);
	}

	.nav-item.active {
		background: linear-gradient(135deg, rgba(0, 212, 170, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%);
		color: #00d4aa;
		border: 1px solid rgba(0, 212, 170, 0.3);
	}

	/* Sidebar Footer */
	.sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid #2a2d3a;
		background: rgba(0, 0, 0, 0.2);
	}

	.user-progress h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #e2e8f0;
	}

	.xp-info {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.xp-amount {
		font-size: 1.25rem;
		font-weight: 700;
		color: #00d4aa;
	}

	.achievement-preview {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgba(0, 212, 170, 0.1);
		border-radius: 8px;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}

	.achievement-icon {
		font-size: 1.5rem;
	}

	.achievement-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.achievement-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #e2e8f0;
	}

	.achievement-desc {
		font-size: 0.75rem;
		color: #94a3b8;
	}

	/* Main Content */
	.main-content {
		flex: 1;
		margin-left: 320px;
		padding: 2rem;
		background: #0f1115;
		min-height: 100vh;
	}

	.back-button-container {
		margin-bottom: 2rem;
	}

	.back-button {
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		color: #00d4aa;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: 'Space Grotesk', sans-serif;
	}

	.back-button:hover {
		background: rgba(0, 212, 170, 0.2);
		transform: translateY(-1px);
	}

	.component-header {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 3rem;
		margin-bottom: 3rem;
		background: linear-gradient(145deg, #1a1b23 0%, #14161b 100%);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #2a2d3a;
	}

	.component-image-large {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0f1115;
		border-radius: 12px;
		padding: 2rem;
		min-height: 300px;
		border: 1px solid #2a2d3a;
	}

	.component-image-large img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.component-meta h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 1rem 0;
		font-family: 'Space Grotesk', sans-serif;
	}

	.category-badge {
		display: inline-block;
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.description {
		font-size: 1.125rem;
		color: #94a3b8;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.progress-section {
		background: rgba(0, 212, 170, 0.05);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.level-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.level-badge {
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
	}

	.experience-text {
		color: #94a3b8;
		font-weight: 500;
	}

	.progress-bars {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-bar {
		height: 8px;
		background: #1a1b23;
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar.total {
		height: 12px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #00d4aa, #06b6d4);
		transition: width 0.5s ease;
	}

	.quiz-section {
		margin-top: 1rem;
	}

	.quiz-button {
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 12px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 100%;
		font-family: 'Space Grotesk', sans-serif;
	}

	.quiz-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
	}

	.quiz-limit-message {
		background: #1a1b23;
		color: #94a3b8;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		border: 1px solid #2a2d3a;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.detail-card {
		background: linear-gradient(145deg, #1a1b23 0%, #14161b 100%);
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid #2a2d3a;
	}

	.detail-card h3 {
		color: #00d4aa;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		font-family: 'Space Grotesk', sans-serif;
	}

	.detail-card p {
		color: #94a3b8;
		line-height: 1.6;
	}

	.detail-card ul {
		color: #94a3b8;
		line-height: 1.6;
		padding-left: 1.5rem;
	}

	.detail-card li {
		margin-bottom: 0.5rem;
	}

	.specifications {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.spec-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		background: #0f1115;
		border-radius: 6px;
		border: 1px solid #2a2d3a;
	}

	.spec-key {
		font-weight: 600;
		color: #e2e8f0;
	}

	.spec-value {
		color: #00d4aa;
		font-weight: 500;
	}

	.safety-list li {
		color: #fbbf24;
		margin-bottom: 0.75rem;
	}

	/* Quiz Modal Styles */
	.quiz-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.quiz-modal {
		background: linear-gradient(145deg, #1a1b23 0%, #14161b 100%);
		border-radius: 16px;
		padding: 2rem;
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		border: 1px solid #2a2d3a;
	}

	.quiz-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #2a2d3a;
	}

	.quiz-header h3 {
		color: #00d4aa;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		font-family: 'Space Grotesk', sans-serif;
	}

	.question-counter {
		color: #94a3b8;
		font-weight: 500;
	}

	.quiz-question h4 {
		color: #f1f5f9;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		line-height: 1.5;
		font-family: 'Space Grotesk', sans-serif;
	}

	.quiz-options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.quiz-option {
		background: #0f1115;
		color: #e2e8f0;
		border: 2px solid #2a2d3a;
		padding: 1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		font-size: 1rem;
		font-family: 'Space Grotesk', sans-serif;
	}

	.quiz-option:hover {
		border-color: #00d4aa;
		background: rgba(0, 212, 170, 0.1);
	}

	.quiz-option.selected {
		border-color: #00d4aa;
		background: rgba(0, 212, 170, 0.1);
	}

	.quiz-option.correct {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.quiz-option.incorrect {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.quiz-option:disabled {
		cursor: not-allowed;
	}

	.quiz-explanation {
		background: #0f1115;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		color: #94a3b8;
		line-height: 1.5;
		border: 1px solid #2a2d3a;
	}

	.submit-answer-btn {
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 100%;
		font-family: 'Space Grotesk', sans-serif;
	}

	.submit-answer-btn:disabled {
		background: #2a2d3a;
		cursor: not-allowed;
	}

	.submit-answer-btn:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
	}

	.quiz-results {
		text-align: center;
	}

	.quiz-results h3 {
		color: #00d4aa;
		font-size: 2rem;
		margin-bottom: 2rem;
		font-family: 'Space Grotesk', sans-serif;
	}

	.results-summary {
		margin-bottom: 2rem;
	}

	.score {
		font-size: 3rem;
		font-weight: 700;
		color: #00d4aa;
		margin-bottom: 0.5rem;
		font-family: 'Space Grotesk', sans-serif;
	}

	.score-text {
		color: #94a3b8;
		font-size: 1.125rem;
		margin-bottom: 1rem;
	}

	.experience-gained {
		color: #10b981;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.level-up {
		color: #f59e0b;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.close-quiz-btn {
		background: linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: 'Space Grotesk', sans-serif;
	}

	.close-quiz-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
	}

	/* Mobile Responsiveness */
	@media (max-width: 1024px) {
		.sidebar {
			width: 280px;
		}

		.main-content {
			margin-left: 280px;
		}
	}

	@media (max-width: 768px) {
		.sidebar {
			position: fixed;
			left: -100%;
			transition: left 0.3s ease;
			z-index: 50;
			width: 280px;
		}

		.main-content {
			margin-left: 0;
			padding: 1rem;
		}

		.component-header {
			grid-template-columns: 1fr;
			gap: 2rem;
			padding: 1.5rem;
		}

		.component-meta h1 {
			font-size: 2rem;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.quiz-modal {
			margin: 1rem;
			padding: 1.5rem;
		}
	}
</style>
