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
	
	// Step 2 data
	let hasElectronicsExperience = '';
	let wiringComfort = '';
	let knownComponents: string[] = [];
	
	// Step 3 data
	let learningPreference = '';
	let wantsTipsWarnings = '';
	
	// Step 4 data
	let experienceLevel = '';
	let userRole = '';
	let wantsGamification = '';
	
	// Step titles
	const stepTitles: Record<number, string> = {
		1: "Let's get to know your project goals!",
		2: "Time to talk about your skills!",
		3: "Learning, your way!",
		4: "Let's tailor your journey!",
		5: "Your Preferences at a Glance"
	};
	
	// Update progress line with sub-steps
	let stepsContainer: HTMLElement;
	
	function calculateProgress(): number {
		let totalProgress = 0;
		
		// Calculate progress based on completed steps
		if (currentStep > 4) {
			// All previous steps are completed
			totalProgress = currentStep - 1;
		} else if (currentStep === 4) {
			// We're in step 4, calculate sub-step progress
			totalProgress = 3; // Steps 1-3 are completed
			if (experienceLevel !== '') totalProgress += 1/3; // Sub-step 1 completed
			if (userRole !== '') totalProgress += 1/3; // Sub-step 2 completed
			if (wantsGamification !== '') totalProgress += 1/3; // Sub-step 3 completed
		} else if (currentStep === 3) {
			// We're in step 3, calculate sub-step progress
			totalProgress = 2; // Steps 1-2 are completed
			if (learningPreference !== '') totalProgress += 1/2; // Sub-step 1 completed
			if (wantsTipsWarnings !== '') totalProgress += 1/2; // Sub-step 2 completed
		} else if (currentStep === 2) {
			// We're in step 2, calculate sub-step progress
			totalProgress = 1; // Step 1 is completed
			if (hasElectronicsExperience !== '') totalProgress += 1/3; // Sub-step 1 completed
			if (wiringComfort !== '') totalProgress += 1/3; // Sub-step 2 completed
			if (knownComponents.length > 0) totalProgress += 1/3; // Sub-step 3 completed
		} else if (currentStep === 1) {
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
	
	function selectElectronicsExperience(choice: string) {
		hasElectronicsExperience = choice;
		currentSubStep = 2;
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function selectWiringComfort(comfort: string) {
		wiringComfort = comfort;
		currentSubStep = 3;
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function toggleComponent(component: string) {
		if (knownComponents.includes(component)) {
			knownComponents = knownComponents.filter(c => c !== component);
		} else {
			knownComponents = [...knownComponents, component];
		}
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function selectLearningPreference(preference: string) {
		learningPreference = preference;
		currentSubStep = 2;
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function selectTipsWarnings(choice: string) {
		wantsTipsWarnings = choice;
		// Force progress recalculation before moving to next step
		progress = calculateProgress();
		nextStep();
	}
	
	function selectExperienceLevel(level: string) {
		experienceLevel = level;
		currentSubStep = 2;
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function selectUserRole(role: string) {
		userRole = role;
		currentSubStep = 3;
		// Force progress recalculation
		progress = calculateProgress();
	}
	
	function selectGamification(choice: string) {
		wantsGamification = choice;
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
			// Ensure step 2 is fully completed before moving to step 3
			if (currentStep === 2) {
				if (!hasElectronicsExperience) hasElectronicsExperience = 'no';
				if (!wiringComfort) wiringComfort = 'not-at-all';
			}
			// Ensure step 3 is fully completed before moving to step 4
			if (currentStep === 3) {
				if (!learningPreference) learningPreference = 'step-by-step';
				if (!wantsTipsWarnings) wantsTipsWarnings = 'no';
			}
			// Ensure step 4 is fully completed before moving to step 5
			if (currentStep === 4) {
				if (!experienceLevel) experienceLevel = 'beginner';
				if (!userRole) userRole = 'hobbyist';
				if (!wantsGamification) wantsGamification = 'no';
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
				if (!hasProject) hasProject = 'no';
				if (!timeCommitment) timeCommitment = 'no-rush';
			}
			// If going to step 3 or beyond, ensure step 2 is completed
			if (step > 2 && currentStep === 2) {
				if (!hasElectronicsExperience) hasElectronicsExperience = 'no';
				if (!wiringComfort) wiringComfort = 'not-at-all';
			}
			// If going to step 4 or beyond, ensure step 3 is completed
			if (step > 3 && currentStep === 3) {
				if (!learningPreference) learningPreference = 'step-by-step';
				if (!wantsTipsWarnings) wantsTipsWarnings = 'no';
			}
			// If going to step 5 or beyond, ensure step 4 is completed
			if (step > 4 && currentStep === 4) {
				if (!experienceLevel) experienceLevel = 'beginner';
				if (!userRole) userRole = 'hobbyist';
				if (!wantsGamification) wantsGamification = 'no';
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
		if (currentStep === 2) {
			if (currentSubStep === 1) return hasElectronicsExperience !== '';
			if (currentSubStep === 2) return wiringComfort !== '';
			if (currentSubStep === 3) return knownComponents.length > 0;
		}
		if (currentStep === 3) {
			if (currentSubStep === 1) return learningPreference !== '';
			if (currentSubStep === 2) return wantsTipsWarnings !== '';
		}
		if (currentStep === 4) {
			if (currentSubStep === 1) return experienceLevel !== '';
			if (currentSubStep === 2) return userRole !== '';
			if (currentSubStep === 3) return wantsGamification !== '';
		}
		return true;
	}
	
	function handleNext() {
		if (currentStep === 1 && currentSubStep === 2 && projectInterests.trim()) {
			currentSubStep = 3;
			progress = calculateProgress();
		} else if (currentStep === 2 && currentSubStep === 2 && wiringComfort !== '') {
			currentSubStep = 3;
			progress = calculateProgress();
		} else if (currentStep === 3 && currentSubStep === 1 && learningPreference !== '') {
			currentSubStep = 2;
			progress = calculateProgress();
		} else if (currentStep === 4 && currentSubStep === 1 && experienceLevel !== '') {
			currentSubStep = 2;
			progress = calculateProgress();
		} else if (currentStep === 4 && currentSubStep === 2 && userRole !== '') {
			currentSubStep = 3;
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
				{#if currentSubStep === 1}
					<div class="question-container">
						<h2 class="question">Have you worked with electronics or Arduino before?</h2>
						<div class="choice-buttons">
							<button 
								class="choice-btn"
								class:selected={hasElectronicsExperience === 'no'}
								on:click={() => selectElectronicsExperience('no')}
							>
								<img src="/onboarding/No.svg" alt="No" class="choice-icon" />
								No, I haven't
							</button>
							<button 
								class="choice-btn"
								class:selected={hasElectronicsExperience === 'yes'}
								on:click={() => selectElectronicsExperience('yes')}
							>
								<img src="/onboarding/Yes.svg" alt="Yes" class="choice-icon" />
								Yes, I have
							</button>
						</div>
					</div>
				{:else if currentSubStep === 2}
					<div class="question-container">
						<h2 class="question">How comfortable are you with wiring?</h2>
						<div class="time-buttons">
							<button 
								class="time-btn"
								class:selected={wiringComfort === 'not-at-all'}
								on:click={() => selectWiringComfort('not-at-all')}
							>
								Not at all
							</button>
							<button 
								class="time-btn"
								class:selected={wiringComfort === 'basics'}
								on:click={() => selectWiringComfort('basics')}
							>
								I get the basics
							</button>
							<button 
								class="time-btn"
								class:selected={wiringComfort === 'comfortable'}
								on:click={() => selectWiringComfort('comfortable')}
							>
								Comfortable
							</button>
							<button 
								class="time-btn"
								class:selected={wiringComfort === 'very-confident'}
								on:click={() => selectWiringComfort('very-confident')}
							>
								Very Confident
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = 1}>
								Back
							</button>
						</div>
					</div>
				{:else if currentSubStep === 3}
					<div class="question-container">
						<h2 class="question">Which components or tools do you know?</h2>
						<div class="components-grid">
							{#each ['LED', 'Resistor', 'Potentiometer', 'Temperature sensor', 'Motion sensor (PIR)', 'Light sensor (LDR)', 'DC motor', 'Servo motor', 'Arduino board', 'OLED/LCD display', 'Push button / Switch', 'Relay'] as component}
								<button 
									class="component-btn"
									class:selected={knownComponents.includes(component)}
									on:click={() => toggleComponent(component)}
								>
									{component}
								</button>
							{/each}
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = 2}>
								Back
							</button>
							<button 
								class="nav-btn primary"
								disabled={knownComponents.length === 0}
								on:click={nextStep}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{:else if currentStep === 3}
				{#if currentSubStep === 1}
					<div class="question-container">
						<h2 class="question">How do you prefer to learn?</h2>
						<div class="time-buttons">
							<button 
								class="time-btn"
								class:selected={learningPreference === 'step-by-step'}
								on:click={() => selectLearningPreference('step-by-step')}
							>
								Step-by-step tutorials
							</button>
							<button 
								class="time-btn"
								class:selected={learningPreference === 'theory-first'}
								on:click={() => selectLearningPreference('theory-first')}
							>
								Theory first, then build
							</button>
							<button 
								class="time-btn"
								class:selected={learningPreference === 'simulate-build'}
								on:click={() => selectLearningPreference('simulate-build')}
							>
								Simulate, then build
							</button>
							<button 
								class="time-btn"
								class:selected={learningPreference === 'minimal-hints'}
								on:click={() => selectLearningPreference('minimal-hints')}
							>
								Minimal hints
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={prevStep}>
								Back
							</button>
						</div>
					</div>
				{:else if currentSubStep === 2}
					<div class="question-container">
						<h2 class="question">Do you want tips & warnings about mistakes?</h2>
						<div class="choice-buttons">
							<button 
								class="choice-btn"
								class:selected={wantsTipsWarnings === 'no'}
								on:click={() => selectTipsWarnings('no')}
							>
								<img src="/onboarding/No.svg" alt="No" class="choice-icon" />
								No, I prefer learning by doing
							</button>
							<button 
								class="choice-btn"
								class:selected={wantsTipsWarnings === 'yes'}
								on:click={() => selectTipsWarnings('yes')}
							>
								<img src="/onboarding/Yes.svg" alt="Yes" class="choice-icon" />
								Yes, help me avoid mistakes
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = 1}>
								Back
							</button>
						</div>
					</div>
				{/if}
			{:else if currentStep === 4}
				{#if currentSubStep === 1}
					<div class="question-container">
						<h2 class="question">What's your experience level with electronics?</h2>
						<div class="time-buttons">
							<button 
								class="time-btn"
								class:selected={experienceLevel === 'beginner'}
								on:click={() => selectExperienceLevel('beginner')}
							>
								Beginner
							</button>
							<button 
								class="time-btn"
								class:selected={experienceLevel === 'intermediate'}
								on:click={() => selectExperienceLevel('intermediate')}
							>
								Intermediate
							</button>
							<button 
								class="time-btn"
								class:selected={experienceLevel === 'advanced'}
								on:click={() => selectExperienceLevel('advanced')}
							>
								Advanced
							</button>
							<button 
								class="time-btn"
								class:selected={experienceLevel === 'expert'}
								on:click={() => selectExperienceLevel('expert')}
							>
								Expert
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={prevStep}>
								Back
							</button>
						</div>
					</div>
				{:else if currentSubStep === 2}
					<div class="question-container">
						<h2 class="question">What best describes your role?</h2>
						<div class="time-buttons">
							<button 
								class="time-btn"
								class:selected={userRole === 'student'}
								on:click={() => selectUserRole('student')}
							>
								Student
							</button>
							<button 
								class="time-btn"
								class:selected={userRole === 'hobbyist'}
								on:click={() => selectUserRole('hobbyist')}
							>
								Hobbyist
							</button>
							<button 
								class="time-btn"
								class:selected={userRole === 'educator'}
								on:click={() => selectUserRole('educator')}
							>
								Educator
							</button>
							<button 
								class="time-btn"
								class:selected={userRole === 'professional'}
								on:click={() => selectUserRole('professional')}
							>
								Professional / Engineer
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = 1}>
								Back
							</button>
						</div>
					</div>
				{:else if currentSubStep === 3}
					<div class="question-container">
						<h2 class="question">Do you want to enable gamification?</h2>
						<div class="choice-buttons">
							<button 
								class="choice-btn"
								class:selected={wantsGamification === 'no'}
								on:click={() => selectGamification('no')}
							>
								<img src="/onboarding/No.svg" alt="No" class="choice-icon" />
								No, keep it simple
							</button>
							<button 
								class="choice-btn"
								class:selected={wantsGamification === 'yes'}
								on:click={() => selectGamification('yes')}
							>
								<img src="/onboarding/Yes.svg" alt="Yes" class="choice-icon" />
								Yes, make it fun!
							</button>
						</div>
						<div class="nav-buttons">
							<button class="nav-btn secondary" on:click={() => currentSubStep = 2}>
								Back
							</button>
						</div>
					</div>
				{/if}
			{:else if currentStep === 5}
				<div class="summary-container">
					<h2 class="question">Your Preferences at a Glance</h2>
					<div class="summary-card">
						<!-- Project Goals Section -->
						<div class="summary-section">
							<div class="section-icon">
								<img src="/onboarding/Step1.svg" alt="Project Goals" />
							</div>
							<div class="section-content">
								<h3 class="section-title">Project Goals</h3>
								<div class="section-questions">
									<div class="question-answer-row">
										<span class="question-label">Do you have a project in mind?</span>
										<span class="answer-value">{hasProject === 'yes' ? 'Yes, I do' : "No, I don't"}</span>
									</div>
									{#if hasProject === 'yes' && projectInterests.trim()}
										<div class="question-answer-row">
											<span class="question-label">Your interests:</span>
											<span class="answer-value">{projectInterests}</span>
										</div>
									{/if}
									<div class="question-answer-row">
										<span class="question-label">Time commitment:</span>
										<span class="answer-value">{
											timeCommitment === 'few-hours' ? 'A few hours' :
											timeCommitment === 'couple-days' ? 'A couple of days' :
											timeCommitment === 'week-more' ? 'A week or more' :
											'No rush, taking it slow'
										}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Your Skills Section -->
						<div class="summary-section">
							<div class="section-icon">
								<img src="/onboarding/Step2.svg" alt="Your Skills" />
							</div>
							<div class="section-content">
								<h3 class="section-title">Your Skills</h3>
								<div class="section-questions">
									<div class="question-answer-row">
										<span class="question-label">Electronics experience:</span>
										<span class="answer-value">{hasElectronicsExperience === 'yes' ? 'Yes, I have' : "No, I haven't"}</span>
									</div>
									<div class="question-answer-row">
										<span class="question-label">Wiring comfort:</span>
										<span class="answer-value">{
											wiringComfort === 'not-at-all' ? 'Not at all' :
											wiringComfort === 'basics' ? 'I get the basics' :
											wiringComfort === 'comfortable' ? 'Comfortable' :
											'Very Confident'
										}</span>
									</div>
									<div class="question-answer-row">
										<span class="question-label">Known components:</span>
										<span class="answer-value">{knownComponents.length > 0 ? knownComponents.join(', ') : 'None selected'}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Learning Journey Section -->
						<div class="summary-section">
							<div class="section-icon">
								<img src="/onboarding/Step3.svg" alt="Learning Journey" />
							</div>
							<div class="section-content">
								<h3 class="section-title">Learning Journey</h3>
								<div class="section-questions">
									<div class="question-answer-row">
										<span class="question-label">Learning preference:</span>
										<span class="answer-value">{
											learningPreference === 'step-by-step' ? 'Step-by-step tutorials' :
											learningPreference === 'theory-first' ? 'Theory first, then build' :
											learningPreference === 'simulate-build' ? 'Simulate, then build' :
											'Minimal hints'
										}</span>
									</div>
									<div class="question-answer-row">
										<span class="question-label">Tips & warnings:</span>
										<span class="answer-value">{wantsTipsWarnings === 'yes' ? 'Yes, help me avoid mistakes' : 'No, I prefer learning by doing'}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Your Journey Section -->
						<div class="summary-section">
							<div class="section-icon">
								<img src="/onboarding/Step4.svg" alt="Your Journey" />
							</div>
							<div class="section-content">
								<h3 class="section-title">Your Journey</h3>
								<div class="section-questions">
									<div class="question-answer-row">
										<span class="question-label">Experience level:</span>
										<span class="answer-value">{
											experienceLevel === 'beginner' ? 'Beginner' :
											experienceLevel === 'intermediate' ? 'Intermediate' :
											experienceLevel === 'advanced' ? 'Advanced' :
											'Expert'
										}</span>
									</div>
									<div class="question-answer-row">
										<span class="question-label">Your role:</span>
										<span class="answer-value">{
											userRole === 'student' ? 'Student' :
											userRole === 'hobbyist' ? 'Hobbyist' :
											userRole === 'educator' ? 'Educator' :
											'Professional / Engineer'
										}</span>
									</div>
									<div class="question-answer-row">
										<span class="question-label">Gamification:</span>
										<span class="answer-value">{wantsGamification === 'yes' ? 'Yes, make it fun!' : 'No, keep it simple'}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					
					<div class="nav-buttons">
						<button class="nav-btn secondary" on:click={prevStep}>
							Back
						</button>
						<button class="nav-btn primary" on:click={() => goto('/')}>
							Save and Continue
						</button>
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
		margin-bottom: 8rem;
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
		text-align: center;
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
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1rem 1.5rem;
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 140px;
	}
	
	.choice-btn:hover {
		transform: translateY(-2px);
	}
	
	/* No Button - CABDF5 border */
	.choice-btn:first-child {
		border-color: #CABDF5;
	}
	
	.choice-btn:first-child.selected {
		background: rgba(202, 189, 245, 0.2);
		border-color: #CABDF5;
	}
	
	.choice-btn:first-child:hover {
		background: #CABDF5 !important;
		color: #000000 !important;
	}
	
	.choice-btn:first-child:hover .choice-icon {
		filter: brightness(0) saturate(100%) invert(12%) sepia(7%) saturate(1075%) hue-rotate(314deg) brightness(91%) contrast(94%);
	}
	
	/* Yes Button - EDF760 border */
	.choice-btn:last-child {
		border-color: #EDF760;
	}
	
	.choice-btn:last-child.selected {
		background: rgba(237, 247, 96, 0.2);
		border-color: #EDF760;
	}
	
	.choice-btn:last-child:hover {
		background: #EDF760 !important;
		color: #000000 !important;
	}
	
	.choice-btn:last-child:hover .choice-icon {
		filter: brightness(0) saturate(100%) invert(12%) sepia(7%) saturate(1075%) hue-rotate(314deg) brightness(91%) contrast(94%);
	}
	
	.choice-icon {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}
	
	/* Input Container */
	.input-container {
		margin-bottom: 2rem;
	}
	
	.text-input {
		width: 100%;
		background: #1F1F1F;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		font-size: 1rem;
		font-family: 'Inter', sans-serif;
		color: #ffffff;
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
		color: rgba(255, 255, 255, 0.5);
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
		border-color: #CABDF5;
		transform: translateY(-1px);
	}
	
	.time-btn.selected {
		background: rgba(202, 189, 245, 0.2);
		border-color: #CABDF5;
		color: #CABDF5;
	}
	
	/* Component Selection Grid */
	.components-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.component-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1rem;
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
	}
	
	.component-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: #CABDF5;
		transform: translateY(-1px);
	}
	
	.component-btn.selected {
		background: rgba(202, 189, 245, 0.2);
		border-color: #CABDF5;
		color: #CABDF5;
	}
	
	/* Summary Page Styles */
	.summary-container {
		max-width: 900px;
		margin: 0 auto;
	}
	
	.summary-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 3rem;
	}
	
	.summary-section {
		display: flex;
		gap: 1.5rem;
		align-items: flex-start;
		padding-bottom: 2rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.summary-section:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
	
	.section-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		background: #CABDF5;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
	}
	
	.section-icon img {
		filter: brightness(0) saturate(100%) invert(12%) sepia(7%) saturate(1075%) hue-rotate(314deg) brightness(91%) contrast(94%);
	}
	
	.section-content {
		flex: 1;
	}
	
	.section-title {
		color: #CABDF5;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		font-family: 'Inter', sans-serif;
        text-align: left;
	}
	
	.section-questions {
		display: flex;
		flex-direction: column;
	}
	
	.question-answer-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 0.5rem 0;
	}
	
	.question-label {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
		font-weight: 500;
		flex: 1;
		min-width: 0;
        text-align: left;
	}
	
	.answer-value {
		color: #CABDF5;
		font-size: 1rem;
		font-weight: 600;
		text-align: right;
		flex: 1;
		min-width: 0;
		word-wrap: break-word;
        text-align: left;
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
		background: transparent;
		border: 2px solid #EDF760;
		color: #EDF760;
	}
	
	.nav-btn.primary:hover:not(:disabled) {
		background: #EDF760;
		color: #000000;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(237, 247, 96, 0.3);
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
			min-width: 200px;
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
		
		.components-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		}
		
		.summary-section {
			flex-direction: column;
			gap: 5rem;
			text-align: left;
		}
		
		.section-icon {
			align-self: flex-start;
		}
		
		.question-answer-row {
			flex-direction: column;
			gap: 0.25rem;
			align-items: flex-start;
		}
		
		.answer-value {
			text-align: left;
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
			padding: 1rem;
			min-width: 180px;
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
		
		.components-grid {
			grid-template-columns: 1fr;
		}
		
		.summary-section {
			padding: 1.5rem;
		}
	}
</style>
