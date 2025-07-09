<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, currentUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	
	export let projectInput = '';
	export let isTransitioning = false;
	export let onProjectSubmit: () => void;
	
	let showLoginDropdown = false;
	
	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.login-section')) {
			showLoginDropdown = false;
		}
	}
	
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
	
	function toggleLoginDropdown() {
		showLoginDropdown = !showLoginDropdown;
	}
	
	function handleLogin() {
		showLoginDropdown = false;
		// TODO: Implement login modal or redirect to login page
		console.log('Login clicked');
	}
	
	function handleRegister() {
		showLoginDropdown = false;
		goto('/register');
	}
	
	function handleLogout() {
		showLoginDropdown = false;
		authStore.logout();
	}
</script>

<!-- Hero Section -->
<section class="hero-section">
	<div class="container">
		<!-- Login Section -->
		<div class="login-section">
			{#if $currentUser && $currentUser.isLoggedIn}
				<div class="user-info">
					<span class="user-name">Hello, {$currentUser.name || 'User'}!</span>
					<button class="logout-button" on:click={handleLogout} aria-label="Logout">
						Log Out
					</button>
				</div>
			{:else}
				<button class="login-button" on:click={toggleLoginDropdown} aria-label="Login">
					Log In
				</button>
				<button class="dropdown-button" on:click={toggleLoginDropdown} aria-label="Login Options">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="6,9 12,15 18,9"></polyline>
					</svg>
				</button>
				
				{#if showLoginDropdown}
					<div class="login-dropdown">
						<button class="dropdown-item" on:click={handleLogin}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
								<polyline points="10,17 15,12 10,7"/>
								<line x1="15" y1="12" x2="3" y2="12"/>
							</svg>
							Log In
						</button>
						<button class="dropdown-item" on:click={handleRegister}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
								<circle cx="8.5" cy="7" r="4"/>
								<line x1="20" y1="8" x2="20" y2="14"/>
								<line x1="23" y1="11" x2="17" y2="11"/>
							</svg>
							Register
						</button>
					</div>
				{/if}
			{/if}
		</div>
		
		<div class="hero-content">
			<h1 class="hero-title">Build Physical Prototypes with AI and AR Assistance</h1>
			<p class="hero-subtitle">For students, makers, and tinkerers. Get guidance, build smarter, and level up with every circuit.</p>
			
			<div class="project-start">
				<h2 class="project-start-title">Start Your Project</h2>
				<div class="chat-input-container">
					<div class="chat-input-wrapper">
						<textarea 
							bind:value={projectInput}
							placeholder="Tell me about your idea..."
							class="chat-input"
							rows="1"
						></textarea>
						<div class="chat-input-actions">
							<div class="left-actions">
								<button class="search-button" title="Search" aria-label="Search">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="11" cy="11" r="8"></circle>
										<path d="m21 21-4.35-4.35"></path>
									</svg>
								</button>
							</div>
							<div class="right-actions">
								<button class="attachment-button" title="Attach file" aria-label="Attach file">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
									</svg>
								</button>
								<button class="mic-button" title="Voice input" aria-label="Voice input">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
										<path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
										<line x1="12" y1="19" x2="12" y2="23"></line>
										<line x1="8" y1="23" x2="16" y2="23"></line>
									</svg>
								</button>
								<button 
									class="send-button" 
									class:transitioning={isTransitioning}
									on:click={onProjectSubmit}
									disabled={!projectInput.trim() || isTransitioning}
									title="Send"
								>
									{#if isTransitioning}
										<span class="button-spinner"></span>
									{:else}
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<line x1="22" y1="2" x2="11" y2="13"></line>
											<polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
										</svg>
									{/if}
								</button>
							</div>
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

	/* Hero Section */
	.hero-section {
		min-height: 75vh;
		display: flex;
		align-items: center;
		padding: 2rem 0;
		position: relative;
		z-index: 1;
	}
	
	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: linear-gradient(rgba(37, 37, 37, 0.6) 1px, transparent 1px);
		background-size: 100% 75px;
		background-repeat: repeat-y;
		pointer-events: none;
		z-index: 0;
	}
	
	/* Login Section */
	.login-section {
		position: absolute;
		top: 2rem;
		right: 2rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		z-index: 2;
	}
	
	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.user-name {
		color: #FFFFFF;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	.logout-button {
		background: rgba(255, 255, 255, 0.1);
		color: #FFFFFF;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.logout-button:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
	}
	
	.login-button {
		background: #EDF760;
		color: #000000;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 2rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.login-button:hover {
		background: #F0FA70;
		transform: translateY(-1px);
	}
	
	.dropdown-button {
		background: transparent;
		color: #FFFFFF;
		border: none;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.dropdown-button:hover {
		color: rgba(255, 255, 255, 0.7);
		transform: translateY(-1px);
	}
	
	.login-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background: rgba(25, 25, 25, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 0.5rem;
		min-width: 180px;
		backdrop-filter: blur(20px);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		animation: fadeInUp 0.2s ease-out;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.dropdown-item {
		width: 100%;
		background: transparent;
		color: #FFFFFF;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-align: left;
	}
	
	.dropdown-item:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #EDF760;
	}
	
	.dropdown-item svg {
		flex-shrink: 0;
	}
	
	.hero-content {
		width: 100%;
		position: relative;
		z-index: 1;
		text-align: center;
	}
	
	.hero-title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(2.5rem, 5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.1;
		margin: 0 auto 1.5rem auto;
		color: #FFFFFF;
		max-width: 800px;
		text-align: center;
	}
	
	.hero-subtitle {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 auto 3rem auto;
		max-width: 600px;
		line-height: 1.6;
		text-align: center;
	}
	
	.project-start {
		max-width: 800px;
		margin: 0 auto;
		text-align: left;
	}
	
	.project-start-title {
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #FFFFFF;
		margin: 0 0 1rem 0;
	}
	
	.chat-input-container {
		position: relative;
	}
	
	.chat-input-wrapper {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1rem;
		position: relative;
		backdrop-filter: blur(20px);
		transition: all 0.3s ease;
	}
	
	.chat-input-wrapper:focus-within {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
	}
	
	.chat-input {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		color: #FFFFFF;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		resize: none;
		margin-bottom: 1rem;
		min-height: 2.5rem;
		max-height: 200px;
		line-height: 1.5;
	}
	
	.chat-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	
	.chat-input-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.left-actions, .right-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	
	.search-button, .attachment-button, .mic-button {
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		color: #CABDF5;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.search-button:hover, .attachment-button:hover, .mic-button:hover {
		background: rgba(202, 189, 245, 0.1);
		color: #FFFFFF;
	}
	
	.send-button {
		width: 40px;
		height: 40px;
		border: none;
		background: #EDF760;
		color: #000000;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.send-button:hover:not(:disabled) {
		background: #F0FA70;
		transform: scale(1.05);
	}
	
	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.send-button.transitioning {
		background: rgba(237, 247, 96, 0.7);
	}

	/* Buttons */
	.button-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(0, 0, 0, 0.3);
		border-top: 2px solid #000000;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 1.5rem;
		}
		
		.hero-section {
			min-height: 80vh;
			padding: 1rem 0;
		}
		
		.login-section {
			top: 1rem;
			right: 1.5rem;
			position: absolute;
		}
		
		.user-name {
			font-size: 0.8rem;
		}
		
		.logout-button {
			padding: 0.5rem 0.875rem;
			font-size: 0.8rem;
		}
		
		.login-button {
			padding: 0.625rem 1.25rem;
			font-size: 0.8rem;
		}
		
		.dropdown-button {
			padding: 0.625rem;
		}
		
		.login-dropdown {
			min-width: 160px;
		}
		
		.dropdown-item {
			padding: 0.625rem 0.875rem;
			font-size: 0.8rem;
		}
		
		.hero-title {
			font-size: clamp(2rem, 8vw, 3rem);
		}
		
		.hero-subtitle {
			font-size: 1.1rem;
			margin-bottom: 3rem;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 1rem;
		}
		
		.login-section {
			top: 1rem;
			right: 1rem;
			position: absolute;
		}
		
		.user-name {
			font-size: 0.75rem;
		}
		
		.logout-button {
			padding: 0.4rem 0.75rem;
			font-size: 0.75rem;
		}
		
		.login-button {
			padding: 0.5rem 1rem;
			font-size: 0.75rem;
		}
		
		.dropdown-button {
			padding: 0.5rem;
		}
		
		.login-dropdown {
			min-width: 140px;
		}
		
		.dropdown-item {
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
		}
		
		.hero-title {
			font-size: clamp(1.8rem, 10vw, 2.5rem);
		}
		
		.hero-subtitle {
			font-size: 1rem;
			margin-bottom: 2rem;
		}
		
		.chat-input-wrapper {
			padding: 0.75rem;
		}
	}
</style>
