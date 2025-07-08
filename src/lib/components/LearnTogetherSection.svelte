<script lang="ts">
	import { goto } from '$app/navigation';
	
	function handleBrowseProjects() {
		goto('/overview');
	}
</script>

<!-- Learn Together Section -->
<section class="learn-together-section">
	<div class="container">
		<div class="learn-together-content">
			<div class="learn-together-text">
				<h2 class="section-title">Learn Together, Build Together</h2>
				<p class="section-description">Explore projects and helpful tutorials created by fellow makers. And exchange your ideas!</p>
				<button class="browse-button" on:click={handleBrowseProjects}>
					<span class="arrow-icon">→</span>
					Browse More Projects
				</button>
			</div>
			<div class="stacked-cards">
				<div class="project-card">
					<img src="/image-stack/bottom-layer.png" alt="Project Example 1" class="project-card__background" />
					<div class="project-card__overlay">
						<div class="project-card__details">
							<span class="project-card__name">Smart Garden</span>
							<span class="project-card__desc">Automated watering</span>
							<div class="project-card__difficulty">Beginner</div>
						</div>
					</div>
				</div>
				
				<div class="project-card">
					<img src="/image-stack/middle-layer.png" alt="Project Example 2" class="project-card__background" />
					<div class="project-card__overlay">
						<div class="project-card__details">
							<span class="project-card__name">LED Matrix</span>
							<span class="project-card__desc">Interactive display</span>
							<div class="project-card__difficulty">Advanced</div>
						</div>
					</div>
				</div>
				
				<div class="project-card">
					<img src="/image-stack/top-layer.png" alt="Project Example 3" class="project-card__background" />
					<div class="project-card__overlay">
						<div class="project-card__details">
							<span class="project-card__name">Home Security</span>
							<span class="project-card__desc">Motion detector</span>
							<div class="project-card__difficulty">Intermediate</div>
						</div>
					</div>
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

	/* Learn Together Section */
	.learn-together-section {
		padding: 4rem 0 6rem 0;
		position: relative;
		z-index: 1;
	}
	
	.learn-together-content {
		max-width: 800px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}
	
	
	.section-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		text-align: left;
		margin: 0 0 1.5rem 0;
		line-height: 1.3;
	}
	
	.section-description {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		margin: 0 0 2rem 0;
	}
	
	.browse-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #ECF65F;
		color: #191919;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
	}
	
	.browse-button:hover {
		background: #E8F555;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(236, 246, 95, 0.3);
	}
	
	.arrow-icon {
		font-size: 1.1rem;
		transition: transform 0.3s ease;
	}
	
	.browse-button:hover .arrow-icon {
		transform: translateX(4px);
	}
	
	/* 3D Stacked Cards Animation */
	.stacked-cards {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		height: 400px;
		perspective: 2000px;
	}
	
	.project-card {
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: absolute;
		width: 280px;
		height: 200px;
		overflow: hidden;
		border-radius: 20px;
		box-shadow: -20px 50px 100px -15px rgba(0, 0, 0, 0.4);
		transform-style: preserve-3d;
		transform: rotateX(22deg) rotate(-14deg) rotateY(17deg) translateZ(var(--z));
		transition: transform 0.4s ease, z-index 0.1s ease;
		cursor: pointer;
	}
	
	.project-card:nth-child(1) {
		left: 20%;
		top: 5%;
		z-index: 1;
		--z: 30px;
	}
	
	.project-card:nth-child(1):hover {
		--z: 60px;
		z-index: 5;
	}
	
	.project-card:nth-child(2) {
		left: 61%;
		top: 28%;
		z-index: 2;
		--z: 10px;
	}
	
	.project-card:nth-child(2):hover {
		--z: 80px;
		z-index: 5;
	}
	/* links*/ 
	.project-card:nth-child(3) {
		top: 40%;
		left: 5%;
		z-index: 3;
		--z: 10px;
	}
	
	.project-card:nth-child(3):hover {
		--z: 40px;
		z-index: 10;
	}
	
	.project-card__background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 0.4s ease;
		z-index: 1;
	}
	
	.project-card:hover .project-card__background {
		transform: scale(1.1);
	}
	
	.project-card__overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			180deg,
			rgba(0, 0, 0, 0) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.8) 100%
		);
		z-index: 2;
		display: flex;
		align-items: flex-end;
		padding: 0;
		transition: background 0.4s ease;
	}
	
	.project-card:hover .project-card__overlay {
		background: linear-gradient(
			180deg,
			rgba(0, 0, 0, 0.1) 0%,
			rgba(0, 0, 0, 0.4) 50%,
			rgba(0, 0, 0, 0.9) 100%
		);
	}
	
	.project-card__details {
		display: grid;
		grid-template: 1fr 1fr / 1fr auto;
		grid-row-gap: 4px;
		padding: 16px 20px;
		width: 100%;
	}
	
	.project-card__name {
		grid-column: 1;
		grid-row: 1;
		font-family: 'Inter', sans-serif;
		font-size: 18px;
		font-weight: 700;
		color: #FFFFFF;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}
	
	.project-card__difficulty {
		grid-column: 2;
		grid-row: 1;
		font-family: 'Inter', sans-serif;
		font-size: 12px;
		font-weight: 600;
		color: #191919;
		background: #ECF65F;
		border-radius: 12px;
		padding: 4px 10px;
		align-self: start;
		justify-self: end;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	.project-card__desc {
		grid-column: 1 / 3;
		grid-row: 2;
		font-family: 'Inter', sans-serif;
		font-size: 14px;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
		
		.learn-together-content {
			grid-template-columns: 1fr;
			gap: 3rem;
			text-align: center;
		}
		
		.section-title {
			text-align: center;
		}
		
		.stacked-cards {
			height: 350px;
		}
		
		.project-card {
			width: 240px;
			height: 170px;
		}
		
		.project-card:nth-child(1) {
			left: 35%;
			top: 15%;
		}
		
		.project-card:nth-child(2) {
			left: 48%;
			top: 20%;
		}
		
		.project-card:nth-child(3) {
			left: 32%;
			top: 25%;
		}
		
		.project-card__details {
			padding: 12px 16px;
		}
		
		.project-card__name {
			font-size: 16px;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
		
		.learn-together-section {
			padding: 3rem 0 4rem 0;
		}
		
		.learn-together-content {
			gap: 2rem;
		}
		
		.section-title {
			font-size: 1.25rem;
		}
		
		.stacked-cards {
			height: 300px;
		}
		
		.project-card {
			width: 200px;
			height: 140px;
			transform: rotateX(15deg) rotate(-10deg) rotateY(12deg) translateZ(var(--z));
		}
		
		.project-card:nth-child(1) {
			left: 30%;
			top: 10%;
			--z: 20px;
		}
		
		.project-card:nth-child(2) {
			left: 45%;
			top: 15%;
			--z: 35px;
		}
		
		.project-card:nth-child(3) {
			left: 25%;
			top: 20%;
			--z: 5px;
		}
		
		.project-card__details {
			padding: 10px 14px;
		}
		
		.project-card__name {
			font-size: 15px;
		}
		
		.project-card__desc {
			font-size: 13px;
		}
		
		.project-card__difficulty {
			font-size: 11px;
			padding: 3px 8px;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
		
		.section-title {
			font-size: 1.2rem;
		}
		
		.section-description {
			font-size: 0.95rem;
		}
		
		.browse-button {
			padding: 0.7rem 1.3rem;
			font-size: 0.9rem;
		}
		
		.stacked-cards {
			height: 250px;
		}
		
		.project-card {
			width: 160px;
			height: 120px;
			transform: rotateX(10deg) rotate(-8deg) rotateY(8deg) translateZ(var(--z));
		}
		
		.project-card:nth-child(1) {
			left: 25%;
			top: 5%;
			--z: 15px;
		}
		
		.project-card:nth-child(2) {
			left: 42%;
			top: 10%;
			--z: 25px;
		}
		
		.project-card:nth-child(3) {
			left: 20%;
			top: 15%;
			--z: 0px;
		}
		
		.project-card__details {
			padding: 8px 12px;
		}
		
		.project-card__name {
			font-size: 14px;
		}
		
		.project-card__desc {
			font-size: 12px;
		}
		
		.project-card__difficulty {
			font-size: 10px;
			padding: 2px 6px;
		}
	}
</style>
