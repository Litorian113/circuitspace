<script lang="ts">
	// No props needed for now, but we can add them later if needed
</script>

<!-- How You Can Build Your First Project Section -->
<section class="build-first-project-section">
	<div class="container">
		<div class="build-first-project-content">
			<h2 class="section-title">How You Can Build Your First Project</h2>
			<div class="build-steps-grid">
				<div class="build-step">
					<img src="/works-section/describe-your-project.svg" alt="Describe Your Project" class="build-step-icon" />
					<h3 class="build-step-title">Describe Your Project</h3>
					<p class="build-step-text">Tell us what you want to build in simple terms - like "a temperature monitor" or "smart plant watering system".</p>
				</div>
				<div class="build-step">
					<img src="/works-section/choose-your-experience.svg" alt="Choose Your Experience" class="build-step-icon" />
					<h3 class="build-step-title">Choose Your Experience</h3>
					<p class="build-step-text">Select your skill level and preferred learning style - beginner tutorials, advanced guides, or hands-on exploration.</p>
				</div>
				<div class="build-step">
					<img src="/works-section/connect-arvis.svg" alt="Connect with Arvis" class="build-step-icon" />
					<h3 class="build-step-title">Connect with Arvis</h3>
					<p class="build-step-text">Our AI assistant analyzes your project and provides personalized component recommendations and circuit suggestions.</p>
				</div>
				<div class="build-step">
					<img src="/works-section/build-with-live.svg" alt="Build with Live Feedback" class="build-step-icon" />
					<h3 class="build-step-title">Build with Live Feedback</h3>
					<p class="build-step-text">Get real-time guidance as you wire your circuit, with AR overlays and step-by-step visual instructions.</p>
				</div>
				<div class="build-step">
					<img src="/works-section/test-learn.svg" alt="Test and Learn" class="build-step-icon" />
					<h3 class="build-step-title">Test and Learn</h3>
					<p class="build-step-text">Test your circuit safely in our virtual environment before building the physical version, learning from each iteration.</p>
				</div>
				<div class="build-step">
					<img src="/works-section/level-up.svg" alt="Level Up" class="build-step-icon" />
					<h3 class="build-step-title">Level Up</h3>
					<p class="build-step-text">Expand your project with advanced features, save your work, and share it with the community for feedback.</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 3rem;
	}

	/* How You Can Build Your First Project Section */
	.build-first-project-section {
		padding: 4rem 0 6rem 0;
		position: relative;
		z-index: 1;
	}
	
	.build-first-project-content {
		max-width: 800px;
		margin: 0 auto;
	}
	
	.section-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		text-align: left;
		margin: 0 0 3rem 0;
	}
	
	.build-steps-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 3rem;
	}
	
	.build-step {
		text-align: left;
		padding: 0;
	}
	
	.build-step-icon {
		width: 60px;
		height: 60px;
		margin: 0 0 1.5rem 0;
		opacity: 0.9;
		transition: all 0.3s ease;
	}
	
	.build-step:hover .build-step-icon {
		opacity: 1;
		filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
		transform: translateY(-2px);
	}
	
	.build-step-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		color: #FFFFFF;
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}
	
	.build-step-text {
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
		
		.build-steps-grid {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, 1fr);
			gap: 2.5rem;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
		
		.build-first-project-section {
			padding: 3rem 0 4rem 0;
		}
		
		.section-title {
			font-size: 1.25rem;
			margin-bottom: 3rem;
		}
		
		.build-steps-grid {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(6, 1fr);
			gap: 2rem;
		}
		
		.build-step-icon {
			width: 50px;
			height: 50px;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
		
		.section-title {
			font-size: 1.2rem;
		}
		
		.build-first-project-section {
			padding: 2rem 0 3rem 0;
		}
		
		.build-steps-grid {
			gap: 1.5rem;
		}
		
		.build-step-icon {
			width: 45px;
			height: 45px;
			margin-bottom: 1rem;
		}
		
		.build-step-title {
			font-size: 1rem;
		}
		
		.build-step-text {
			font-size: 0.9rem;
		}
	}
</style>
