<script lang="ts">
	// No props needed for now, but we can add them later if needed
</script>

<!-- How It Works Section -->
<section class="how-it-works-section">
	<div class="container">
		<div class="how-it-works-content">
			<h2 class="section-title">How It Works</h2>
			<div class="how-it-works-grid">
				<div class="work-card">
					<div class="work-card-image">🤖</div>
					<h3 class="work-card-title">AI-Powered Planning</h3>
					<p class="work-card-text">Describe your project idea and get intelligent component suggestions, wiring diagrams, and step-by-step guidance.</p>
				</div>
				<div class="work-card">
					<div class="work-card-image">🔧</div>
					<h3 class="work-card-title">Component Library</h3>
					<p class="work-card-text">Access our comprehensive database of electronic components with detailed specifications and usage examples.</p>
				</div>
				<div class="work-card">
					<div class="work-card-image">⚡</div>
					<h3 class="work-card-title">Circuit Designer</h3>
					<p class="work-card-text">Build and test your circuits virtually with our interactive designer before creating physical prototypes.</p>
				</div>
				<div class="work-card">
					<div class="work-card-image">🔍</div>
					<h3 class="work-card-title">AR Assistance</h3>
					<p class="work-card-text">Use augmented reality to overlay instructions and component information directly onto your physical workspace.</p>
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

	/* How It Works Section */
	.how-it-works-section {
		padding: 3rem 0 6rem 0;
		/* background: rgba(37, 37, 37, 0.6); */
		margin-top: -5vh;
		position: relative;
		z-index: 1;
	}
	
	.section-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		text-align: left;
		margin: 0 0 3rem 0;
	}
	
	.how-it-works-content {
		max-width: 800px;
		margin: 0 auto;
	}
	
	.how-it-works-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}
	
	.work-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		transition: all 0.3s ease;
	}
	
	.work-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-4px);
	}
	
	.work-card-image {
		font-size: 3rem;
		margin-bottom: 1.5rem;
	}
	
	.work-card-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #FFFFFF;
		margin: 0 0 1rem 0;
	}
	
	.work-card-text {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		margin: 0;
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
		
		.how-it-works-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
		
		.how-it-works-section {
			padding: 4rem 0;
		}
		
		.section-title {
			font-size: 1.25rem;
			margin-bottom: 3rem;
		}
		
		.work-card {
			padding: 1.5rem;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
		
		.section-title {
			font-size: 1.2rem;
		}
		
		.work-card {
			padding: 1.25rem;
		}
		
		.work-card-image {
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
	}
</style>
