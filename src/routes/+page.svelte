<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import HowItWorksSection from '$lib/components/HowItWorksSection.svelte';
	import ArDeviceSection from '$lib/components/ArDeviceSection.svelte';
	import BuildFirstProjectSection from '$lib/components/BuildFirstProjectSection.svelte';
	import LearnTogetherSection from '$lib/components/LearnTogetherSection.svelte';
	import ArvisDevicePopup from '$lib/components/ArvisDevicePopup.svelte';
	
	let projectInput = '';
	let isTransitioning = false;
	let heroSectionElement: HTMLElement;
	let titleElement: HTMLElement;
	let particleCanvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let particles: Particle[] = [];
	let animationId: number;
	let isHovering = false;
	let showArvisPopup = false;
	
	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		life: number;
		maxLife: number;
		opacity: number;
		size: number;
	}
	
	onMount(() => {
		if (particleCanvas) {
			ctx = particleCanvas.getContext('2d');
			resizeCanvas();
			window.addEventListener('resize', resizeCanvas);
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const lastShownString = localStorage.getItem('arvisPopupLastShown');
						const now = new Date().getTime();
						const tenMinutes = 10 * 60 * 1000;

						if (lastShownString) {
							const lastShown = parseInt(lastShownString, 10);
							if (now - lastShown < tenMinutes) {
								observer.unobserve(entry.target); // Don't show again if recently shown
								return;
							}
						}

						setTimeout(() => {
							showArvisPopup = true;
							localStorage.setItem('arvisPopupLastShown', now.toString());
						}, 3000);
						observer.unobserve(entry.target); // Stop observing after it's scheduled to show
					}
				});
			},
			{ threshold: 0.1 } // Trigger when 10% of the element is visible
		);

		if (heroSectionElement) {
			observer.observe(heroSectionElement);
		}
		
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			window.removeEventListener('resize', resizeCanvas);
			if (heroSectionElement) {
				observer.unobserve(heroSectionElement);
			}
		};
	});
	
	function resizeCanvas() {
		if (particleCanvas && titleElement) {
			const rect = titleElement.getBoundingClientRect();
			particleCanvas.width = rect.width;
			particleCanvas.height = rect.height;
		}
	}
	
	function createParticle(x: number, y: number) {
		return {
			x,
			y,
			vx: (Math.random() - 0.5) * 2,
			vy: (Math.random() - 0.5) * 2,
			life: 0,
			maxLife: 60 + Math.random() * 40,
			opacity: 0,
			size: 2 + Math.random() * 3
		};
	}
	
	function updateParticles() {
		for (let i = particles.length - 1; i >= 0; i--) {
			const particle = particles[i];
			particle.life++;
			particle.x += particle.vx;
			particle.y += particle.vy;
			
			// Fade in, then fade out
			if (particle.life < particle.maxLife * 0.3) {
				particle.opacity = particle.life / (particle.maxLife * 0.3);
			} else if (particle.life > particle.maxLife * 0.7) {
				particle.opacity = 1 - (particle.life - particle.maxLife * 0.7) / (particle.maxLife * 0.3);
			} else {
				particle.opacity = 1;
			}
			
			if (particle.life > particle.maxLife) {
				particles.splice(i, 1);
			}
		}
	}
	
	function drawParticles() {
		if (!ctx || !particleCanvas) return;
		
		ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
		
		particles.forEach(particle => {
			ctx!.save();
			ctx!.globalAlpha = particle.opacity * 0.6;
			ctx!.fillStyle = '#EDF760';
			ctx!.shadowBlur = 8;
			ctx!.shadowColor = '#EDF760';
			ctx!.beginPath();
			ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			ctx!.fill();
			ctx!.restore();
		});
	}
	
	function animate() {
		updateParticles();
		drawParticles();
		animationId = requestAnimationFrame(animate);
	}
	
	function handleTitleMouseMove(event: MouseEvent) {
		if (!isHovering || !titleElement) return;
		
		const rect = titleElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		// Create particles on mouse movement
		if (Math.random() < 0.3) {
			particles.push(createParticle(x, y));
		}
		
		// Limit particle count
		if (particles.length > 40) {
			particles.splice(0, particles.length - 40);
		}
		
		if (!animationId) {
			animate();
		}
	}
	
	function handleTitleMouseEnter() {
		isHovering = true;
		if (titleElement) {
			titleElement.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(237, 247, 96, 0.3)';
		}
	}
	
	function handleTitleMouseLeave() {
		isHovering = false;
		if (titleElement) {
			titleElement.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
		}
		// Let existing particles fade out naturally
	}
	
	function scrollToHeroSection() {
		if (heroSectionElement) {
			heroSectionElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	}
	
	async function handleProjectSubmit() {
		if (projectInput.trim() && !isTransitioning) {
			isTransitioning = true;
			
			// Start the page transition animation
			await new Promise(resolve => setTimeout(resolve, 600));
			
			// Navigate to the new page
			goto(`/project-chat?prompt=${encodeURIComponent(projectInput)}`);
		}
	}
	
	function goToComponents() {
		goto('/overview');
	}
	
	function goToTemplates() {
		goto('/templates');
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<!-- Page Transition Overlay -->
{#if isTransitioning}
	<div class="transition-overlay">
		<div class="transition-content">
			<div class="loading-circuit">
				<div class="circuit-wave wave-1"></div>
				<div class="circuit-wave wave-2"></div>
				<div class="circuit-wave wave-3"></div>
			</div>
			<h3 class="transition-text">Initializing Project...</h3>
			<div class="loading-dots">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
	</div>
{/if}

<!-- Sidebar Navigation -->
<Sidebar />

<!-- Main Content with Sidebar Offset -->
<main class="main-container">
	<!-- Fullscreen Arvis Hero Section -->
	<section class="arvis-hero-section">
		<div class="arvis-hero-background">
			<img src="/arvis/arvis_hero.png" alt="Arvis Hero" class="arvis-hero-image" />
			<div class="arvis-hero-overlay"></div>
		</div>
		<div class="arvis-hero-logo">
			<img src="/logo/logo_dark.png" alt="Circuitspace Logo" class="hero-logo-image" />
			<span class="hero-logo-text">Circuitspace</span>
		</div>
		<div class="arvis-hero-content">
			<div class="title-container" 
				role="button"
				tabindex="0"
				on:mousemove={handleTitleMouseMove} 
				on:mouseenter={handleTitleMouseEnter}
				on:mouseleave={handleTitleMouseLeave}
			>
				<h1 class="arvis-hero-title" bind:this={titleElement}>Step into Circuitspace with Arvis</h1>
				<canvas bind:this={particleCanvas} class="particle-canvas"></canvas>
			</div>
		</div>
		<div class="scroll-indicator" on:click={scrollToHeroSection} on:keydown={(e) => e.key === 'Enter' && scrollToHeroSection()} tabindex="0" role="button" aria-label="Scroll to main content">
			<div class="scroll-arrow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M7 10l5 5 5-5"/>
				</svg>
			</div>
			<span class="scroll-text">Scroll to explore</span>
		</div>
	</section>

	<!-- Hero Section -->
	<section bind:this={heroSectionElement} class="hero-section-wrapper" id="main-hero">
		<HeroSection 
			bind:projectInput
			{isTransitioning}
			onProjectSubmit={handleProjectSubmit}
		/>
	</section>
	
	<!-- How It Works Section -->
	<HowItWorksSection />
	
	<!-- Our AR Device Section -->
	<ArDeviceSection />
	
	<!-- How You Can Build Your First Project Section -->
	<BuildFirstProjectSection />
	
	<!-- Learn Together Section -->
	<LearnTogetherSection />
</main>

<ArvisDevicePopup bind:show={showArvisPopup} />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', sans-serif;
		background: #191919;
		color: rgba(255, 255, 255, 0.9);
		overflow-x: hidden;
		min-height: 100vh;
		scroll-behavior: smooth;
	}
	
	:global(:root) {
		--sidebar-width: 280px; /* Default sidebar width */
	}
	
	:global(body::before) {
		display: none;
	}
	
	/* Page Transition Styles */
	.transition-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(25, 25, 25, 0.4);
		backdrop-filter: blur(40px) saturate(180%);
		-webkit-backdrop-filter: blur(40px) saturate(180%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		animation: fadeInOverlay 0.3s ease-out;
	}
	
	.transition-content {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}
	
	.loading-circuit {
		position: relative;
		width: 120px;
		height: 120px;
		border: 2px solid rgba(202, 189, 245, 0.2); /* #CABDF5 with opacity */
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(20px);
	}
	
	.circuit-wave {
		position: absolute;
		border: 2px solid #CABDF5;
		border-radius: 50%;
		animation: circuitPulse 2s infinite ease-out;
		box-shadow: 0 0 20px rgba(202, 189, 245, 0.3); /* #CABDF5 with opacity */
	}
	
	.wave-1 {
		width: 60px;
		height: 60px;
		animation-delay: 0s;
	}
	
	.wave-2 {
		width: 80px;
		height: 80px;
		animation-delay: 0.3s;
	}
	
	.wave-3 {
		width: 100px;
		height: 100px;
		animation-delay: 0.6s;
	}
	
	.transition-text {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		background: linear-gradient(135deg, #CABDF5, #ECF65F);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
		animation: textGlow 2s infinite ease-in-out;
	}
	
	.loading-dots {
		display: flex;
		gap: 0.5rem;
	}
	
	.dot {
		width: 8px;
		height: 8px;
		background: linear-gradient(135deg, #CABDF5, #ECF65F);
		border-radius: 50%;
		animation: dotBounce 1.4s infinite ease-in-out both;
		box-shadow: 0 0 10px rgba(202, 189, 245, 0.5); /* #CABDF5 with opacity */
	}
	
	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }
	.dot:nth-child(3) { animation-delay: 0s; }
	
	/* Main Content */
	.main-container {
		margin-left: var(--sidebar-width, 280px);
		min-height: 100vh;
		position: relative;
		z-index: 1;
		transition: margin-left 0.3s ease;
	}
	
	.main-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(90deg, rgba(37, 37, 37, 1) 1px, transparent 1px);
		background-size: 10% 100%;
		background-repeat: repeat-x;
		pointer-events: none;
		z-index: -1;
	}
	
	/* Animations */
	@keyframes fadeInOverlay {
		from {
			opacity: 0;
			backdrop-filter: blur(0px);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(40px);
		}
	}
	
	@keyframes circuitPulse {
		0% {
			transform: scale(0.8);
			opacity: 1;
			border-color: #CABDF5;
		}
		50% {
			transform: scale(1.1);
			opacity: 0.6;
			border-color: #ECF65F;
		}
		100% {
			transform: scale(1.3);
			opacity: 0;
			border-color: rgba(202, 189, 245, 0.4); /* #CABDF5 with opacity */
		}
	}
	
	@keyframes textGlow {
		0%, 100% {
			filter: drop-shadow(0 0 10px rgba(202, 189, 245, 0.4)); /* #CABDF5 glow */
		}
		50% {
			filter: drop-shadow(0 0 20px rgba(202, 189, 245, 0.6)) drop-shadow(0 0 30px rgba(236, 246, 95, 0.3)); /* #CABDF5 & #ECF65F glow */
		}
	}
	
	@keyframes dotBounce {
		0%, 80%, 100% {
			transform: scale(0);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
	
	/* Arvis Hero Section */
	.arvis-hero-section {
		position: relative;
		width: 100vw;
		height: 100vh;
		margin-left: calc(-1 * var(--sidebar-width, 280px));
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.arvis-hero-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
	
	.arvis-hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}
	
	.arvis-hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			rgba(25, 25, 25, 0.2) 0%,
			rgba(25, 25, 25, 0.1) 50%,
			rgba(25, 25, 25, 0.3) 100%
		);
		z-index: 2;
	}
	
	.arvis-hero-content {
		position: relative;
		z-index: 3;
		text-align: center;
		padding: 2rem;
		max-width: 900px;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}
	
	.title-container {
		position: relative;
		display: inline-block;
		cursor: pointer;
	}
	
	.particle-canvas {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 1;
	}
	
	.arvis-hero-title {
		font-family: 'Inter', sans-serif;
		font-size: 4rem;
		font-weight: 700;
		color: #FFFFFF;
		margin: 0;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		line-height: 1.1;
		position: relative;
		z-index: 2;
		/* Fade-up Animation */
		opacity: 0;
		transform: translateY(30px);
		animation: fadeUpTitle 1.2s ease-out 0.5s forwards;
		transition: text-shadow 0.3s ease;
	}
	
	.arvis-hero-logo {
		position: absolute;
		top: 2rem;
		right: 2rem;
		z-index: 4;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.hero-logo-image {
		width: 32px;
		height: 32px;
		object-fit: contain;
	}
	
	.hero-logo-text {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #191919;
		text-shadow: none;
	}
	
	.scroll-indicator {
		position: absolute;
		bottom: 3rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		animation: scrollBounce 2s ease-in-out infinite;
		cursor: pointer;
		z-index: 4;
	}
	
	.scroll-arrow {
		width: 48px;
		height: 48px;
		border: 2px solid rgba(255, 255, 255, 0.8);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}
	
	.scroll-arrow:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 1);
		transform: translateY(-2px);
	}
	
	.scroll-text {
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}
	
	@keyframes scrollBounce {
		0%, 100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(8px);
		}
	}
	
	@keyframes fadeUpTitle {
		0% {
			opacity: 0;
			transform: translateY(30px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* Hero Section Wrapper */
	.hero-section-wrapper {
		scroll-margin-top: 0;
		position: relative;
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.main-container {
			margin-left: 0;
		}
		
		.arvis-hero-section {
			margin-left: 0;
		}
		
		.arvis-hero-title {
			font-size: 3rem;
			margin: 0;
			/* Animation bleibt erhalten */
			opacity: 0;
			transform: translateY(20px);
			animation: fadeUpTitle 1.2s ease-out 0.5s forwards;
			transition: text-shadow 0.3s ease;
		}
	}
	
	@media (max-width: 768px) {
		.arvis-hero-content {
			margin: 4rem 0 0 3rem;
			padding: 1.5rem;
		}
		
		.arvis-hero-logo {
			top: 1.5rem;
			right: 1.5rem;
			gap: 0.5rem;
		}
		
		.hero-logo-image {
			width: 28px;
			height: 28px;
		}
		
		.hero-logo-text {
			font-size: 1.125rem;
		}
		
		.arvis-hero-title {
			font-size: 2.5rem;
			margin: 0;
			/* Animation bleibt erhalten */
			opacity: 0;
			transform: translateY(15px);
			animation: fadeUpTitle 1.2s ease-out 0.5s forwards;
			transition: text-shadow 0.3s ease;
		}
		
		.scroll-indicator {
			bottom: 2rem;
		}
		
		.scroll-arrow {
			width: 40px;
			height: 40px;
		}
		
		.scroll-text {
			font-size: 0.8rem;
		}
	}
	
	@media (max-width: 480px) {
		.arvis-hero-content {
			margin: 3rem 0 0 2rem;
		}
		
		.arvis-hero-logo {
			top: 1rem;
			right: 1rem;
		}
		
		.hero-logo-image {
			width: 24px;
			height: 24px;
		}
		
		.hero-logo-text {
			font-size: 1rem;
		}
		
		.arvis-hero-title {
			font-size: 2rem;
			/* Animation für Mobile */
			opacity: 0;
			transform: translateY(15px);
			animation: fadeUpTitle 1.2s ease-out 0.5s forwards;
		}
	}
</style>
