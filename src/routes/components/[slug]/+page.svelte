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
			<!-- Header Top Row -->
			<div class="header-top-row">
				<div class="header-left">
					<img src="/special-icon/tabler-icon-progress-check.svg" alt="Progress" class="progress-icon" />
					<span class="level-text">Level {component.level}</span>
				</div>
				<div class="difficulty-tag {component.difficulty}">
					{component.difficulty === 'beginner' ? 'Beginner' : 
					 component.difficulty === 'intermediate' ? 'Intermediate' : 'Expert'}
				</div>
			</div>

			<!-- Main Content Row -->
			<div class="header-main-content">
				<!-- Left Column -->
				<div class="left-column">
					<h1 class="component-title">{component.name}</h1>
					<div class="component-image-container">
						<img src={component.image} alt={component.name} />
					</div>
					<div class="component-tags">
						{#each component.commonUses.slice(0, 3) as tag}
							<span class="tag">#{tag.toLowerCase().replace(/\s+/g, '')}</span>
						{/each}
					</div>
				</div>

				<!-- Right Column -->
				<div class="right-column">
					<h3 class="info-title">General Info</h3>
					<p class="component-description">{component.description}</p>
					
					<!-- Progress Section -->
					<div class="progress-section">
						<div class="progress-header">
							<span class="progress-label">Level {component.level}/{component.maxLevel}</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill" style="width: {getCurrentLevelProgress()}%"></div>
						</div>
						<div class="progress-details">
							<span class="earn-exp">Earn {(component.maxLevel - component.level) * 20} exp</span>
							<span class="progress-percentage">{Math.round(getCurrentLevelProgress())}%</span>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="action-buttons">
						{#if canStartQuiz}
							<button class="quiz-button-new" on:click={startQuiz}>
								Start Quiz
							</button>
						{:else}
							<button class="quiz-button-new disabled" disabled>
								Quiz Completed
							</button>
						{/if}
						<button class="explore-button">
							Explore Projects
						</button>
					</div>
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
				<h3>Technical Specifications</h3>
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
				<h3>Working Principle</h3>
				<p>{component.workingPrinciple}</p>
			</div>

			<!-- Common Uses -->
			<div class="detail-card">
				<h3>Common Applications</h3>
				<div class="applications-grid">
					{#each component.commonUses as use}
						<div class="application-box">{use}</div>
					{/each}
				</div>
			</div>

			<!-- Safety Tips -->
			<div class="detail-card">
				<h3>Safety Guidelines</h3>
				<div class="safety-grid">
					{#each component.safetyTips as tip}
						<div class="safety-item">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="safety-icon">
								<path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="#CABDF5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<span class="safety-text">{tip}</span>
						</div>
					{/each}
				</div>
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
		background: rgba(35, 35, 35, 0.8);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 3rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.header-top-row {
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

	.header-main-content {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 3rem;
		align-items: start;
	}

	.left-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.component-title {
		font-size: 2rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0;
		font-family: 'Inter', sans-serif;
	}

	.component-image-container {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(25, 25, 25, 0.8);
		border-radius: 12px;
		padding: 2rem;
		min-height: 200px;
		border: 1px solid #2a2d3a;
	}

	.component-image-container img {
		max-width: 100%;
		max-height: 180px;
		object-fit: contain;
	}

	.component-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		background: rgba(202, 189, 245, 0.1);
		color: #CABDF5;
		padding: 0.375rem 0.75rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		border: 1px solid rgba(202, 189, 245, 0.3);
		font-family: 'Inter', sans-serif;
	}

	.right-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-title {
		color: #ffffff;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		font-family: 'Inter', sans-serif;
	}

	.component-description {
		font-size: 1.1rem;
		color: #e2e8f0;
		line-height: 1.6;
		margin: 0;
		font-family: 'Inter', sans-serif;
	}

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
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #CABDF5, #a78bfa);
		transition: width 0.5s ease;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
	}

	.quiz-button-new {
		flex: 1;
		background: transparent;
		color: #CABDF5;
		border: 2px solid #CABDF5;
		padding: 1rem 1.5rem;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: 'Inter', sans-serif;
	}

	.quiz-button-new:hover:not(.disabled) {
		background: rgba(202, 189, 245, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(202, 189, 245, 0.3);
	}

	.quiz-button-new.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.explore-button {
		flex: 1;
		background: transparent;
		color: #EDF760;
		border: 2px solid #EDF760;
		padding: 1rem 1.5rem;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: 'Inter', sans-serif;
	}

	.explore-button:hover {
		background: rgba(237, 247, 96, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(237, 247, 96, 0.3);
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
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: 0.5rem;
		margin: -0.5rem;
		margin-bottom: 0.5rem;
	}

	.specs-header h3 {
		margin: 0;
	}

	.expand-toggle {
		color: #ffffff;
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

	.applications-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.application-box {
		background: rgba(202, 189, 245, 0.05);
		border: 1px solid #CABDF5;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		color: #ffffff;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.3s ease;
		text-align: left;
	}

	.application-box:hover {
		background: rgba(202, 189, 245, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(202, 189, 245, 0.2);
	}

	.safety-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.safety-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.safety-icon {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		margin-top: 0.125rem;
	}

	.safety-text {
		flex: 1;
		color: #ffffff;
		font-size: 0.95rem;
		font-weight: 400;
		line-height: 1.5;
	}

	.specifications {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 200px;
		overflow-y: auto;
		transition: max-height 0.3s ease;
		scrollbar-width: thin;
		scrollbar-color: #CABDF5 #1a1b23;
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
		background: #CABDF5;
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
		color: #CABDF5;
		font-weight: 500;
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

		.header-main-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.component-title {
			font-size: 1.75rem;
		}

		.component-image-container {
			min-height: 150px;
		}

		.component-image-container img {
			max-height: 130px;
		}

		.action-buttons {
			flex-direction: column;
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
		.header-top-row {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.header-left {
			justify-content: center;
		}

		.difficulty-tag {
			text-align: center;
		}

		.component-title {
			font-size: 1.5rem;
		}

		.info-title {
			font-size: 1.25rem;
		}

		.component-description {
			font-size: 1rem;
		}

		.details-grid {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(6, auto);
		}
	}
</style>
