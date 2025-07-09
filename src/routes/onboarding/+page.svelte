<script lang="ts">
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { onMount } from 'svelte';
	
	// Onboarding state
	let currentStep = 1;
	let currentSubStep = 1;
	const totalSteps = 5;
	
	// Step 1 data
	let hasProject = '';
	let projectInterests = '';
	let timeCommitment = '';
	
	// Step titles
	const stepTitles: Record<number, string> = {
		1: "Let's get to know your project goals!",
		2: "Time to talk about your skills!",
		3: "Learning, your way journey!",
		4: "Let's tailor your journey!",
		5: "Your Preferences at a Glance"
	};
	
	// Update progress line with sub-steps
	let stepsContainer: HTMLElement;
	
	function calculateProgress(): number {
		let totalProgress = 0;
		
		// Calculate progress based on completed steps
		if (currentStep > 1) {
			// All previous steps are completed
			totalProgress = currentStep - 1;
		} else {
			// We're in step 1, calculate sub-step progress
			if (hasProject !== '') totalProgress += 1/3; // Sub-step 1 completed
			if (hasProject === 'yes' && projectInterests.trim()) totalProgress += 1/3; // Sub-step 2 completed  
			if (timeCommitment !== '') totalProgress += 1/3; // Sub-step 3 completed
		}
		
		return Math.min(totalProgress, totalSteps - 1); // Cap at totalSteps - 1
	}
	
	$: progress = calculateProgress();
	
	// Separate reactive statement to ensure CSS variable is always updated
	$: {
		if (stepsContainer) {
			stepsContainer.style.setProperty('--progress', progress.toString());
			document.documentElement.style.setProperty('--progress', progress.toString());
			stepsContainer.offsetHeight; // Force reflow
		}
	}
	
	onMount(() => {
		if (stepsContainer) {
			const initialProgress = calculateProgress();
			console.log('Initial progress on mount:', initialProgress);
			stepsContainer.style.setProperty('--progress', initialProgress.toString());
		}
	});
	
	// Helper function to determine step state
	function getStepState(stepNumber: number): 'completed' | 'active' | 'unreached' {
		if (stepNumber < currentStep) {
			return 'completed';
		} else if (stepNumber === currentStep) {
			return 'active';
		} else {
			return 'unreached';
		}
	}
	
	function selectProjectChoice(choice: string) {
		hasProject = choice;
		if (choice === 'yes') {
			currentSubStep = 2;
		} else {
			// Skip to time commitment if no project
			currentSubStep = 3;
		}
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function selectTimeCommitment(time: string) {
		timeCommitment = time;
		// Force progress recalculation before moving to next step
		progress = calculateProgress();
		nextStep();
	}
	
	function nextStep() {
		if (currentStep < totalSteps) {
			// Ensure step 1 is fully completed before moving to step 2
			if (currentStep === 1) {
				if (!hasProject) hasProject = 'no';
				if (!timeCommitment) timeCommitment = 'no-rush';
			}
			currentStep++;
			currentSubStep = 1;
		} else {
			// Onboarding complete
			goto('/');
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
			currentSubStep = 1;
		}
	}
	
	function goToStep(step: number) {
		if (step <= currentStep || step === currentStep + 1) {
			// If going to step 2 or beyond, ensure step 1 is completed
			if (step > 1 && currentStep === 1) {
				// Mark step 1 as completed by ensuring all required fields are set
				if (!hasProject) hasProject = 'no'; // Default value if not set
				if (!timeCommitment) timeCommitment = 'no-rush'; // Default value if not set
			}
			currentStep = step;
			currentSubStep = 1;
		}
	}
	
	function canProceedToNext(): boolean {
		if (currentStep === 1) {
			if (currentSubStep === 1) return hasProject !== '';
			if (currentSubStep === 2) return projectInterests.trim() !== '';
			if (currentSubStep === 3) return timeCommitment !== '';
		}
		return true;
	}
	
	function handleNext() {
		if (currentStep === 1 && currentSubStep === 2 && projectInterests.trim()) {
			currentSubStep = 3;
			// Force progress recalculation
			progress = calculateProgress();
		} else if (canProceedToNext()) {
			nextStep();
		}
	}
</script>

<svelte:head>
	<title>Onboarding - Circuitspace</title>
	<meta name="description" content="Let's get you started with Circuitspace" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Sidebar Navigation -->
<Sidebar />

<!-- Main Content with Sidebar Offset -->
<div class="onboarding-page">
	<div class="onboarding-container">
		<!-- Step Title (above stepper) -->
		<h1 class="step-title">{stepTitles[currentStep]}</h1>
		
		<!-- Progress Steps -->
		<div class="steps-container" bind:this={stepsContainer}>
			{#each Array(totalSteps) as _, index}
				{@const stepNumber = index + 1}
				{@const stepState = getStepState(stepNumber)}
				<div 
					class="step-item {stepState}"
					class:clickable={stepNumber <= currentStep || stepNumber === currentStep + 1}
					on:click={() => goToStep(stepNumber)}
					on:keydown={(e) => e.key === 'Enter' && goToStep(stepNumber)}
					role="button"
					tabindex="0"
				>
					<div class="step-icon">
						<img src="/onboarding/Step{stepNumber}.svg" alt="Step {stepNumber}" />
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Step Content -->
		<div class="step-content">
			
			<!-- Step 1 Content -->
			{#if currentStep === 1}
				{#if currentSubStep === 1}
					<div class="question-container">
						<h2 class="question">Do you have a project in mind?</h2>
						<div class="choice-buttons">
							<button 
								class="choice-btn"
								class:selected={hasProject === 'no'}
								on:click={() => selectProjectChoice('no')}
							>
								<img src="/onboarding/No.svg" alt="No" class="choice-icon" />
								No, I don't
							</button>
							<button 
								class="choice-btn"
								class:selected={hasProject === 'yes'}
								on:click={() => selectProjectChoice('yes')}
							>
								<img src="/onboarding/Yes.svg" alt="Yes" class="choice-icon" />
								Yes, I do
							</button>
						</div>
					</div>
				{:else if currentSubStep === 2}
					<div class="question-container">
						<h2 class="question">What topics or ideas are you most interested in?</h2>
						<div class="input-container">
							<textarea
								bind:value={projectInterests}
								placeholder="Tell me about your interests..."
								class="text-input"
								rows="4"
							></textarea>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = 1}>
								Back
							</button>
							<button 
								class="nav-btn primary"
								disabled={!projectInterests.trim()}
								on:click={() => currentSubStep = 3}
							>
								Next
							</button>
						</div>
					</div>
				{:else if currentSubStep === 3}
					<div class="question-container">
						<h2 class="question">How much time do you plan to spend on your project?</h2>
						<div class="time-buttons">
							<button 
								class="time-btn"
								class:selected={timeCommitment === 'few-hours'}
								on:click={() => selectTimeCommitment('few-hours')}
							>
								A few hours
							</button>
							<button 
								class="time-btn"
								class:selected={timeCommitment === 'couple-days'}
								on:click={() => selectTimeCommitment('couple-days')}
							>
								A couple of days
							</button>
							<button 
								class="time-btn"
								class:selected={timeCommitment === 'week-more'}
								on:click={() => selectTimeCommitment('week-more')}
							>
								A week or more
							</button>
							<button 
								class="time-btn"
								class:selected={timeCommitment === 'no-rush'}
								on:click={() => selectTimeCommitment('no-rush')}
							>
								No rush, taking it slow
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = hasProject === 'yes' ? 2 : 1}>
								Back
							</button>
						</div>
					</div>
				{/if}
			{:else if currentStep === 2}
				<div class="question-container">
					<h2 class="question">Have you worked with electronics or Arduino before?</h2>
					<div class="placeholder-content">
						<p>Step 2 content will be implemented next...</p>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={prevStep}>
								Back
							</button>
							<button class="nav-btn primary" on:click={nextStep}>
								Next
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="question-container">
					<div class="placeholder-content">
						<p>Step {currentStep} content will be implemented next...</p>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={prevStep}>
								Back
							</button>
							<button class="nav-btn primary" on:click={nextStep}>
								{currentStep === totalSteps ? 'Complete' : 'Next'}
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #191919;
		color: #e2e8f0;
		font-family: 'Inter', sans-serif;
	}
	
	:global(:root) {
		--sidebar-width: 280px;
	}
	
	.onboarding-page {
		min-height: 100vh;
		background: #191919;
		padding: 2rem;
		margin-left: var(--sidebar-width, 280px);
		transition: margin-left 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.onboarding-container {
		max-width: 800px;
		width: 100%;
		padding: 2rem 0;
	}
	
	/* Progress Steps */
	.steps-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4rem;
		gap: 0;
		position: relative;
	}
	
	/* Background progress line running through center of circles */
	.steps-container::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 12.5%;
		right: 12.5%;
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		z-index: 1;
		transform: translateY(-50%);
	}
	
	/* Progress line that fills up gradually */
	.steps-container::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 12.5%;
		height: 8px;
		background: #CABDF5;
		border-radius: 4px;
		z-index: 2;
		transform: translateY(-50%);
		width: calc((75% / 4) * var(--progress, 0));
		transition: width 0.6s ease-out;
		box-shadow: 0 0 12px rgba(202, 189, 245, 0.5);
	}
	
	.step-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0.5rem;
		border-radius: 12px;
		flex: 1;
		position: relative;
		z-index: 3;
	}
	
	.step-item:not(.clickable) {
		cursor: not-allowed;
	}
	
	.step-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
		transition: all 0.6s ease;
		position: relative;
		overflow: hidden;
		z-index: 4;
	}
	
	/* Unreached step (outline only with light icons) */
	.step-item.unreached .step-icon {
		background: #191919;
		border: 2px solid #CABDF5;
	}
	
	/* .step-item.unreached .step-icon img {
		filter: invert(1) sepia(1) saturate(0) hue-rotate(0deg) brightness(0.9) contrast(1.2);
		opacity: 0.8;
	} */
	
	/* Active step (filled background, dark icon) */
	.step-item.active .step-icon {
		background: #CABDF5;
		border: none;
		box-shadow: 0 0 20px rgba(202, 189, 245, 0.3);
		animation: pulseGlow 2s infinite ease-in-out;
	}
	
	.step-item.active .step-icon img {
		filter: brightness(0) saturate(100%) invert(12%) sepia(7%) saturate(1075%) hue-rotate(314deg) brightness(91%) contrast(94%); /* #191919 filter */
	}
	
	/* Completed step (same as active - no green) */
	.step-item.completed .step-icon {
		background: #CABDF5;
		border: none;
		box-shadow: 0 0 15px rgba(202, 189, 245, 0.2);
	}
	
	.step-item.completed .step-icon img {
		filter: brightness(0) saturate(100%) invert(12%) sepia(7%) saturate(1075%) hue-rotate(314deg) brightness(91%) contrast(94%); /* #191919 filter */
	}
	
	/* Remove old step connectors since we now have the continuous line */
	.step-connector {
		display: none;
	}
	
	/* Animations */
	@keyframes pulseGlow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(202, 189, 245, 0.3);
		}
		50% {
			box-shadow: 0 0 30px rgba(202, 189, 245, 0.6);
		}
	}
	
	@keyframes completedPulse {
		0% {
			transform: scale(1);
			background: #CABDF5;
		}
		50% {
			transform: scale(1.1);
			background: #22c55e;
		}
		100% {
			transform: scale(1);
			background: #22c55e;
		}
	}
	
	/* Step Content */
	.step-content {
		text-align: center;
	}
	
	.step-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #ffffff;
		margin: 0 0 3rem 0;
		line-height: 1.2;
		text-align: center;
	}
	
	.question-container {
		max-width: 600px;
		margin: 0 auto;
	}
	
	.question {
		font-size: 1.5rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 2rem 0;
		line-height: 1.4;
	}
	
	/* Choice Buttons */
	.choice-buttons {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		margin-bottom: 2rem;
	}
	
	.choice-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 2rem 1.5rem;
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 180px;
	}
	
	.choice-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}
	
	.choice-btn.selected {
		background: rgba(202, 189, 245, 0.2);
		border-color: #CABDF5;
		color: #CABDF5;
	}
	
	.choice-icon {
		width: 48px;
		height: 48px;
		filter: invert(1);
	}
	
	.choice-btn.selected .choice-icon {
		filter: none;
	}
	
	/* Input Container */
	.input-container {
		margin-bottom: 2rem;
	}
	
	.text-input {
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		font-size: 1rem;
		font-family: 'Inter', sans-serif;
		color: #1a1a1a;
		resize: vertical;
		min-height: 120px;
		transition: all 0.3s ease;
		outline: none;
	}
	
	.text-input:focus {
		border-color: #CABDF5;
		box-shadow: 0 0 0 3px rgba(202, 189, 245, 0.1);
	}
	
	.text-input::placeholder {
		color: rgba(26, 26, 26, 0.5);
	}
	
	/* Time Buttons */
	.time-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.time-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
	}
	
	.time-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}
	
	.time-btn.selected {
		background: rgba(202, 189, 245, 0.2);
		border-color: #CABDF5;
		color: #CABDF5;
	}
	
	/* Navigation Buttons */
	.nav-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}
	
	.nav-btn {
		padding: 0.875rem 2rem;
		border-radius: 12px;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
	}
	
	.nav-btn.primary {
		background: linear-gradient(135deg, #CABDF5 0%, #a78bfa 100%);
		color: #000000;
	}
	
	.nav-btn.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(202, 189, 245, 0.3);
	}
	
	.nav-btn.primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
	
	.nav-btn.secondary {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	
	.nav-btn.secondary:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}
	
	/* Placeholder Content */
	.placeholder-content {
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.onboarding-page {
			margin-left: 0;
		}
	}
	
	@media (max-width: 768px) {
		.onboarding-page {
			padding: 1rem;
		}
		
		.onboarding-container {
			padding: 1rem 0;
		}
		
		.step-title {
			font-size: 2rem;
		}
		
		.choice-buttons {
			flex-direction: column;
			align-items: center;
		}
		
		.choice-btn {
			min-width: 280px;
		}
		
		.steps-container {
			margin-bottom: 3rem;
		}
		
		.steps-container::before,
		.steps-container::after {
			left: 10%;
			right: 10%;
		}
		
		.steps-container::after {
			width: calc((80% / 4) * var(--progress, 0));
		}
		
		.time-buttons {
			grid-template-columns: 1fr;
		}
	}
	
	@media (max-width: 480px) {
		.step-title {
			font-size: 1.75rem;
		}
		
		.question {
			font-size: 1.25rem;
		}
		
		.choice-btn {
			padding: 1.5rem 1rem;
			min-width: 240px;
		}
		
		.nav-buttons {
			flex-direction: column;
			align-items: center;
		}
		
		.nav-btn {
			width: 200px;
		}
		
		.steps-container::before,
		.steps-container::after {
			left: 8%;
			right: 8%;
		}
		
		.steps-container::after {
			width: calc((84% / 4) * var(--progress, 0));
		}
	}
</style>
