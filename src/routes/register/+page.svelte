<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	let name = '';
	let email = '';
	let password = '';
	let agreeToTerms = false;
	let showPassword = false;
	let errors: { [key: string]: string } = {};
	
	function validateForm(): boolean {
		errors = {};
		
		if (!name.trim()) {
			errors.name = 'Name is required';
		}
		
		if (!email.trim()) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			errors.email = 'Email format is invalid';
		}
		
		if (!password) {
			errors.password = 'Password is required';
		} else if (password.length < 4) {
			errors.password = 'Password must be at least 4 characters';
		}
		
		if (!agreeToTerms) {
			errors.terms = 'You must agree to the Terms of Use and Privacy Policy';
		}
		
		return Object.keys(errors).length === 0;
	}
	
	function handleCreateAccount() {
		if (validateForm()) {
			// Create account with authStore and redirect to onboarding
			const success = authStore.register(name, email, password);
			if (success) {
				console.log('Account created successfully for:', name);
				goto('/onboarding');
			} else {
				console.error('Failed to create account');
			}
		}
	}
	
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
	
	function goBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Create Account - Circuitspace</title>
	<meta name="description" content="Create your Circuitspace account" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Sidebar Navigation -->
<Sidebar />

<!-- Main Content with Sidebar Offset -->
<div class="register-page">
	<div class="register-container">
		<!-- Header -->
		<div class="register-header">
			<button class="back-button" on:click={goBack} aria-label="Back to home">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
				</svg>
			</button>
			<h1 class="register-title">Create your Account</h1>
		</div>
		
		<!-- Registration Form -->
		<form class="register-form" on:submit|preventDefault={handleCreateAccount}>
			<!-- Name Field -->
			<div class="form-group">
				<label for="name" class="form-label">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					class="form-input"
					class:error={errors.name}
					placeholder="Enter your full name"
				/>
				{#if errors.name}
					<span class="error-message">{errors.name}</span>
				{/if}
			</div>
			
			<!-- Email Field -->
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="form-input"
					class:error={errors.email}
					placeholder="Enter your email address"
				/>
				{#if errors.email}
					<span class="error-message">{errors.email}</span>
				{/if}
			</div>
			
			<!-- Password Field -->
			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<div class="password-wrapper">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						class="form-input password-input"
						class:error={errors.password}
						placeholder="Enter your password"
					/>
					<button
						type="button"
						class="password-toggle"
						on:click={togglePasswordVisibility}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
								<line x1="1" y1="1" x2="23" y2="23"/>
							</svg>
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
								<circle cx="12" cy="12" r="3"/>
							</svg>
						{/if}
					</button>
				</div>
				{#if errors.password}
					<span class="error-message">{errors.password}</span>
				{/if}
			</div>
			
			<!-- Terms Checkbox -->
			<div class="form-group">
				<label class="checkbox-label">
					<input
						type="checkbox"
						bind:checked={agreeToTerms}
						class="checkbox-input"
						class:error={errors.terms}
					/>
					<span class="checkbox-custom"></span>
					<span class="checkbox-text">
						I confirm that the above information is accurate and that I agree to the 
						<a href="/terms" class="terms-link">Terms of Use</a> and 
						<a href="/privacy" class="terms-link">Privacy Policy</a>
					</span>
				</label>
				{#if errors.terms}
					<span class="error-message">{errors.terms}</span>
				{/if}
			</div>
			
			<!-- Create Account Button -->
			<button type="submit" class="create-account-btn">
				Create Account
			</button>
		</form>
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
		--sidebar-width: 280px; /* Default sidebar width */
	}
	
	.register-page {
		min-height: 100vh;
		background: #191919;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		margin-left: var(--sidebar-width, 280px);
		transition: margin-left 0.3s ease;
	}
	
	.register-container {
		max-width: 500px;
		width: 100%;
		background: rgba(35, 35, 35, 0.8);
		border-radius: 16px;
		padding: 3rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.register-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2.5rem;
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
	
	.register-title {
		color: #ffffff;
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		font-family: 'Inter', sans-serif;
	}
	
	.register-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-label {
		color: #e2e8f0;
		font-weight: 600;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
	}
	
	.form-input {
		background: #1F1F1F;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 1rem;
		font-size: 1rem;
		font-family: 'Inter', sans-serif;
		color: #ffffff;
		transition: all 0.2s ease;
		outline: none;
	}
	
	.form-input:focus {
		border-color: #CABDF5;
		box-shadow: 0 0 0 3px rgba(202, 189, 245, 0.1);
	}
	
	.form-input.error {
		border-color: #ef4444;
	}
	
	.form-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}
	
	.password-wrapper {
		position: relative;
	}
	
	.password-input {
		padding-right: 3rem;
	}
	
	.password-toggle {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
	}
	
	.password-toggle:hover {
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
	}
	
	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
		line-height: 1.5;
	}
	
	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	
	.checkbox-custom {
		min-width: 20px;
		height: 20px;
		background: #1F1F1F;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		margin-top: 2px;
	}
	
	.checkbox-input:checked + .checkbox-custom {
		background: #CABDF5;
		border-color: #CABDF5;
	}
	
	.checkbox-input:checked + .checkbox-custom::after {
		content: '✓';
		color: #000000;
		font-weight: bold;
		font-size: 0.8rem;
	}
	
	.checkbox-input.error + .checkbox-custom {
		border-color: #ef4444;
	}
	
	.checkbox-text {
		color: #e2e8f0;
		font-size: 0.9rem;
	}
	
	.terms-link {
		color: #CABDF5;
		text-decoration: none;
		transition: color 0.2s ease;
	}
	
	.terms-link:hover {
		color: #a78bfa;
		text-decoration: underline;
	}
	
	.error-message {
		color: #ef4444;
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}
	
	.create-account-btn {
		background: linear-gradient(135deg, #CABDF5 0%, #a78bfa 100%);
		color: #000000;
		border: none;
		border-radius: 12px;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 1rem;
	}
	
	.create-account-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(202, 189, 245, 0.3);
	}
	
	.create-account-btn:active {
		transform: translateY(-1px);
	}
	
	/* Mobile Responsiveness */
	@media (max-width: 1024px) {
		.register-page {
			margin-left: 0;
		}
	}
	
	@media (max-width: 768px) {
		.register-page {
			padding: 1rem;
			margin-left: 0;
		}
		
		.register-container {
			padding: 2rem;
		}
		
		.register-title {
			font-size: 1.5rem;
		}
		
		.form-input {
			padding: 0.875rem 1rem;
		}
		
		.create-account-btn {
			padding: 0.875rem 1.5rem;
			font-size: 1rem;
		}
	}
	
	@media (max-width: 480px) {
		.register-page {
			padding: 0.5rem;
		}
		
		.register-container {
			padding: 1.5rem;
		}
		
		.register-title {
			font-size: 1.25rem;
		}
		
		.checkbox-text {
			font-size: 0.8rem;
		}
	}
</style>
