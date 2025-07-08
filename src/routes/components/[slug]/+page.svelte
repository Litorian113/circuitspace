<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
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
	let specsExpanded = false;

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

	function goBack() {
		goto('/overview');
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
</script>

<svelte:head>
	<title>{component?.name || 'Component'} - Circuitspace</title>
	<meta name="description" content={component?.description || 'Electronic Component'} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div>
	<!-- Sidebar -->
	<Sidebar />

	<!-- Main Content -->
	<main class="main-content">
		{#if component}
		<!-- Header Section -->
		<div class="page-header">
			<button class="back-button" on:click={goBack} aria-label="Back to Overview">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
				</svg>
			</button>
			<h2 class="page-title">Component Information</h2>
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
							🧠 Start Quiz ({component.maxQuizzesPerDay - dailyQuizCount} remaining)
						</button>
					{:else}
						<div class="quiz-limit-message">
							Daily quiz limit reached. Try again tomorrow!
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Component Details -->
		<div class="details-grid">
			<!-- Detailed Description -->
			<div class="detail-card">
				<h3>Detailed Description</h3>
				<p>{component.detailedDescription}</p>
			</div>

			<!-- Specifications -->
			<div class="detail-card specs-card">
				<button class="specs-header" on:click={() => specsExpanded = !specsExpanded} aria-label="Toggle technical specifications">
					<h3>Technical Specifications</h3>
					<span class="expand-toggle" class:expanded={specsExpanded} aria-hidden="true">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
							<path d="M8 12l-4-4h8l-4 4z"/>
						</svg>
					</span>
				</button>
				<div class="specifications" class:expanded={specsExpanded}>
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
				<h3>Working Principle</h3>
				<p>{component.workingPrinciple}</p>
			</div>

			<!-- Common Uses -->
			<div class="detail-card">
				<h3>Common Applications</h3>
				<ul>
					{#each component.commonUses as use}
						<li>{use}</li>
					{/each}
				</ul>
			</div>

			<!-- Safety Tips -->
			<div class="detail-card">
				<h3>Safety Guidelines</h3>
				<ul class="safety-list">
					{#each component.safetyTips as tip}
						<li>⚠️ {tip}</li>
					{/each}
				</ul>
			</div>

			<!-- Pinouts (if available) -->
			{#if component.pinouts && component.pinouts.length > 0}
				<div class="detail-card">
					<h3>Pin Configuration</h3>
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
					<h3>Quiz: {component?.name || 'Component'}</h3>
					<span class="question-counter">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
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
							<strong>Explanation:</strong> {quizQuestions[currentQuestionIndex].explanation}
						</div>
					{/if}

					{#if !showQuizResult}
						<button 
							class="submit-answer-btn"
							on:click={submitAnswer}
							disabled={selectedAnswer === null}
						>
							Confirm Answer
						</button>
					{/if}
				</div>
			{:else}
				<div class="quiz-results">
					<h3>Quiz completed! 🎉</h3>
					<div class="results-summary">
						<div class="score">{correctAnswers}/{quizQuestions.length}</div>
						<div class="score-text">correct answers</div>
						<div class="experience-gained">+{correctAnswers * 20} XP earned!</div>
						{#if component && component.level > 1}
							<div class="level-up">Level {component.level - 1} → {component.level}! 🚀</div>
						{/if}
					</div>
					<button class="close-quiz-btn" on:click={closeQuiz}>Close</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #191919;
		color: #e2e8f0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}
	
	:global(:root) {
		--sidebar-width: 280px; /* Default sidebar width */
	}

	/* Main Content */
	.main-content {
		margin-left: var(--sidebar-width, 280px);
		overflow-y: auto;
		height: 100vh;
		background: #191919;
		padding: 2rem;
		min-height: 100vh;
		transition: margin-left 0.3s ease;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.page-title {
		color: #f1f5f9;
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		font-family: 'Inter', sans-serif;
	}

	.back-button {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.75rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.component-header {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 3rem;
		margin-bottom: 3rem;
		background: rgba(35, 35, 35, 0.8);
		border-radius: 16px;
		padding: 2rem;
	}

	.component-image-large {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(35, 35, 35, 0.8);
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
		font-family: 'Inter', sans-serif;
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
		font-family: 'Inter', sans-serif;
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
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, auto);
		gap: 2rem;
	}

	.detail-card {
		background: rgba(35, 35, 35, 0.8);
		border-radius: 12px;
		padding: 2rem;
		overflow: hidden;
	}

	.specs-card {
		display: flex;
		flex-direction: column;
	}

	.specs-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		margin-bottom: 1rem;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		padding: 0;
		color: inherit;
		font-family: inherit;
	}

	.specs-header:hover {
		background: rgba(0, 212, 170, 0.05);
		border-radius: 8px;
		padding: 0.5rem;
		margin: -0.5rem;
		margin-bottom: 0.5rem;
	}

	.specs-header h3 {
		margin: 0;
	}

	.expand-toggle {
		color: #00d4aa;
		padding: 0.5rem;
		border-radius: 6px;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.expand-toggle svg {
		transition: transform 0.3s ease;
	}

	.expand-toggle.expanded svg {
		transform: rotate(180deg);
	}

	.detail-card h3 {
		color: #ffffff;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		font-family: 'Inter', sans-serif;
	}

	.detail-card p {
		color: #ffffff;
		line-height: 1.6;
	}

	.detail-card ul {
		color: #ffffff;
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
		max-height: 200px;
		overflow-y: auto;
		transition: max-height 0.3s ease;
		scrollbar-width: thin;
		scrollbar-color: #00d4aa #1a1b23;
	}

	.specifications.expanded {
		max-height: 400px;
	}

	.specifications::-webkit-scrollbar {
		width: 8px;
	}

	.specifications::-webkit-scrollbar-track {
		background: #1a1b23;
		border-radius: 4px;
	}

	.specifications::-webkit-scrollbar-thumb {
		background: #00d4aa;
		border-radius: 4px;
	}

	.specifications::-webkit-scrollbar-thumb:hover {
		background: #06b6d4;
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
		background: rgba(35, 35, 35, 0.8);
		border-radius: 16px;
		padding: 2rem;
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
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
		font-family: 'Inter', sans-serif;
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
		font-family: 'Inter', sans-serif;
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
		font-family: 'Inter', sans-serif;
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
		font-family: 'Inter', sans-serif;
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
		font-family: 'Inter', sans-serif;
	}

	.results-summary {
		margin-bottom: 2rem;
	}

	.score {
		font-size: 3rem;
		font-weight: 700;
		color: #00d4aa;
		margin-bottom: 0.5rem;
		font-family: 'Inter', sans-serif;
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
		font-family: 'Inter', sans-serif;
	}

	.close-quiz-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
	}

	/* Mobile Responsiveness */
	@media (max-width: 1024px) {
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
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, auto);
		}

		.quiz-modal {
			margin: 1rem;
			padding: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.details-grid {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(6, auto);
		}
	}
</style>
