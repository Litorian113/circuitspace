<script lang="ts">
	// Add any needed imports or logic here
</script>

<section class="ar-device-section">
	<div class="container">
		<div class="ar-device-content">
			<h2 class="section-title">Our AR Device</h2>
			<div class="content-wrapper">
				<!-- Left Side Content -->
				<div class="content-left">
					<h3 class="device-title">Arvis</h3>
					<p class="section-subtitle">Augmented Reality Device for hands-on project assistance</p>
					
					<div class="description-break"></div>
					
					<p class="section-description">
						Arvis recognizes electronic components in real-time, guides your hands with contextual feedback, and brings your hardware ideas to life through seamless AI and AR integration.
					</p>
					
					<div class="button-group">
						<button class="btn btn-outline">More Details</button>
						<button class="btn btn-filled">Add to Cart</button>
					</div>
				</div>
				
				<!-- Right Side Image -->
				<div class="content-right">
					<div class="image-container">
						<img src="/arvis/arvis_one.png" alt="Arvis AR Device" class="ar-device-image" />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.ar-device-section {
		padding: 3rem 0 6rem 0;
		position: relative;
		z-index: 1;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 3rem;
	}
	
	.section-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		text-align: left;
		margin: 0 0 3rem 0;
	}
	
	.ar-device-content {
		max-width: 800px;
		margin: 0 auto;
	}
	
	.content-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}
	
	.content-left {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.device-title {
		font-family: 'Inter', sans-serif;
		font-size: 3.5rem;
		font-weight: 700;
		color: #CABDF5;
		margin: 0;
		line-height: 1.2;
	}
	
	.section-subtitle {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		line-height: 1.4;
	}
	
	.description-break {
		height: 1rem;
	}
	
	.section-description {
		font-family: 'Inter', sans-serif;
		font-size: 1.1rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		line-height: 1.6;
	}
	
	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
	
	.btn {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		padding: 0.875rem 1.75rem;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 160px;
	}
	
	.btn-outline {
		background: transparent;
		color: #CABDF5;
		border: 2px solid #CABDF5;
	}
	
	.btn-outline:hover {
		background: rgba(202, 189, 245, 0.1);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(202, 189, 245, 0.2);
	}
	
	.btn-filled {
		background: #ECF65F;
		color: #191919;
		border: 2px solid #ECF65F;
	}
	
	.btn-filled:hover {
		background: #e8f248;
		border-color: #e8f248;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(236, 246, 95, 0.3);
	}
	
	.content-right {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.image-container {
		position: relative;
		width: 100%;
		max-width: 500px;
	}
	
	.ar-device-image {
		width: 100%;
		height: auto;
		transition: transform 0.3s ease;
	}
	
	.ar-device-image:hover {
		transform: scale(1.02);
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.content-wrapper {
			gap: 3rem;
		}
		
		.device-title {
			font-size: 3rem;
		}
		
		.section-subtitle {
			font-size: 1.125rem;
		}
		
		.section-description {
			font-size: 1rem;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
		
		.content-wrapper {
			grid-template-columns: 1fr;
			gap: 3rem;
			text-align: center;
		}
		
		.device-title {
			font-size: 2.5rem;
		}
		
		.section-subtitle {
			font-size: 1rem;
		}
		
		.section-description {
			font-size: 0.95rem;
		}
		
		.button-group {
			justify-content: center;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
		
		.device-title {
			font-size: 2rem;
		}
		
		.button-group {
			flex-direction: column;
			align-items: center;
		}
		
		.btn {
			width: 100%;
			max-width: 280px;
		}
	}
</style>
