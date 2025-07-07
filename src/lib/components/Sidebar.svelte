<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { sidebarCollapsed, setSidebarWidth } from '$lib/stores/sidebar';
	
	// Sidebar state
	let isCollapsed = false;
	let isAiChatExpanded = false;
	
	// Subscribe to global sidebar state
	$: sidebarCollapsed.set(isCollapsed);
	
	// Set CSS custom property on mount and when collapsed state changes
	$: setSidebarWidth(isCollapsed);
	
	onMount(() => {
		// Initialize CSS custom property
		setSidebarWidth(isCollapsed);
	});
	
	// Navigation functions
	function navigateTo(path: string) {
		goto(path);
	}
	
	// Check if current route is active
	function isActiveRoute(path: string): boolean {
		return $page.url.pathname === path;
	}
	
	// Check if AI Chat parent is active (any AI Chat subpage)
	function isAiChatParentActive(): boolean {
		const aiChatRoutes = ['/project-chat', '/circuit-designer', '/circuit-code'];
		return aiChatRoutes.some(route => $page.url.pathname === route);
	}
	
	// Toggle sidebar collapse
	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}
	
	// Toggle AI Chat submenu
	function toggleAiChat() {
		isAiChatExpanded = !isAiChatExpanded;
		// Navigate to project-chat as default
		if (isAiChatExpanded) {
			navigateTo('/project-chat');
		}
	}
	
	// Auto-expand AI Chat if on any AI Chat subpage
	$: if (isAiChatParentActive()) {
		isAiChatExpanded = true;
	}
</script>

<aside class="sidebar" class:collapsed={isCollapsed}>
	<!-- Panel Header -->
	<div class="sidebar-header">
		<div class="logo-section">
			<span 
				class="logo-text" 
				class:hidden={isCollapsed}
				on:click={() => navigateTo('/')}
				on:keydown={(e) => e.key === 'Enter' && navigateTo('/')}
				tabindex="0"
				role="button"
				aria-label="Go to homepage"
			>
				Circuitspace
			</span>
			<img 
				src="/sidepanel-icons/tabler-icon-layout-sidebar-right.svg" 
				alt="Toggle Sidebar" 
				class="logo-icon" 
				class:rotated={isCollapsed}
				on:click={toggleSidebar}
				on:keydown={(e) => e.key === 'Enter' && toggleSidebar()}
				tabindex="0"
				role="button"
				aria-label="Toggle sidebar"
			>
		</div>
	</div>
	
	<!-- My Projects Section -->
	<div class="sidebar-section no-border" class:hidden={isCollapsed}>
		<div class="section-header">
			<img src="/sidepanel-icons/tabler-icon-archive.svg" alt="Projects" class="section-icon">
			<span class="section-title">My Projects</span>
		</div>
	</div>
	
	<!-- Search Section -->
	<div class="sidebar-section" class:hidden={isCollapsed}>
		<div class="section-header">
			<img src="/sidepanel-icons/Frame.svg" alt="Search" class="section-icon">
			<span class="section-title">Search</span>
		</div>
	</div>
	
	<!-- Collapsed Icons Section -->
	<div class="collapsed-icons" class:hidden={!isCollapsed}>
		<div class="collapsed-icon-item" title="My Projects">
			<img src="/sidepanel-icons/tabler-icon-archive.svg" alt="Projects" class="collapsed-icon">
		</div>
		<div class="collapsed-icon-item" title="Search">
			<img src="/sidepanel-icons/Frame.svg" alt="Search" class="collapsed-icon">
		</div>
	</div>
	
	<!-- Main Navigation Section -->
	<nav class="sidebar-nav" class:hidden={isCollapsed}>
		<ul class="nav-list">
			<!-- AI Chat with Submenu -->
			<li class="nav-item">
				<button 
					class="nav-link parent-nav" 
					class:active={isAiChatParentActive()}
					on:click={toggleAiChat}
				>
					<span>AI Chat</span>
					<svg 
						class="chevron" 
						class:expanded={isAiChatExpanded}
						width="16" 
						height="16" 
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor" 
						stroke-width="2"
					>
						<polyline points="6,9 12,15 18,9"></polyline>
					</svg>
				</button>
				
				<!-- AI Chat Submenu -->
				<ul class="submenu" class:expanded={isAiChatExpanded}>
					<li class="submenu-item">
						<button 
							class="submenu-link" 
							class:active={isActiveRoute('/project-chat')}
							on:click={() => navigateTo('/project-chat')}
						>
							Circuit Chat
						</button>
					</li>
					<li class="submenu-item">
						<button 
							class="submenu-link" 
							class:active={isActiveRoute('/circuit-designer')}
							on:click={() => navigateTo('/circuit-designer')}
						>
							Circuit Designer
						</button>
					</li>
					<li class="submenu-item">
						<button 
							class="submenu-link" 
							class:active={isActiveRoute('/circuit-code')}
							on:click={() => navigateTo('/circuit-code')}
						>
							Circuit Code
						</button>
					</li>
				</ul>
			</li>
			
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/playground')}
					on:click={() => navigateTo('/playground')}
				>
					Playground
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/overview')}
					on:click={() => navigateTo('/overview')}
				>
					Components
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/tutorials')}
					on:click={() => navigateTo('/tutorials')}
				>
					Tutorials
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/shop')}
					on:click={() => navigateTo('/shop')}
				>
					Shop
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/about')}
					on:click={() => navigateTo('/about')}
				>
					About
				</button>
			</li>
		</ul>
	</nav>
	
	<!-- Panel Footer -->
	<div class="sidebar-footer" class:hidden={isCollapsed}>
		<div class="footer-links">
			<button class="footer-link" on:click={() => navigateTo('/privacy')}>
				Privacy Policy
			</button>
			<button class="footer-link" on:click={() => navigateTo('/terms')}>
				Terms of Use
			</button>
		</div>
		
		<div class="social-links">
			<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-link">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
			</a>
			<a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-link">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
				</svg>
			</a>
			<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-link">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
				</svg>
			</a>
		</div>
		
		<div class="copyright">
			<p>© 2025 Circuitspace.</p>
			<p>All rights reserved.</p>
		</div>
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		width: 280px;
		height: 100vh;
		background-color: #1F1F1F;
		color: #F0F0F0;
		display: flex;
		flex-direction: column;
		padding: 0;
		z-index: 1000;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
		overflow-y: auto;
		transition: width 0.3s ease;
		font-family: 'Inter', sans-serif !important;
		/* Prevent font scaling during layout changes */
		font-size: 1rem !important;
		box-sizing: border-box;
	}
	
	.sidebar.collapsed {
		width: 80px;
	}
	
	.hidden {
		display: none !important;
	}
	
	/* Panel Header */
	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(240, 240, 240, 0.1);
	}
	
	.logo-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	
	.sidebar.collapsed .logo-section {
		justify-content: center;
	}
	
	.logo-icon {
		width: 24px;
		height: 24px;
		filter: brightness(0) invert(1);
		cursor: pointer;
		transition: transform 0.3s ease;
		padding: 4px;
		border-radius: 4px;
	}
	
	.logo-icon:hover {
		background-color: rgba(240, 240, 240, 0.1);
	}
	
	.logo-icon.rotated {
		transform: rotate(180deg);
	}
	
	.logo-text {
		font-family: 'Inter', sans-serif !important;
		font-size: 1.25rem !important;
		font-weight: 600;
		color: #F0F0F0;
		cursor: pointer;
		transition: color 0.2s ease;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}
	
	.logo-text:hover {
		color: #FFFFFF;
		background-color: rgba(240, 240, 240, 0.1);
	}
	
	/* My Projects Section */
	.sidebar-section {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(240, 240, 240, 0.1);
	}
	
	.sidebar-section.no-border {
		border-bottom: none;
		padding-bottom: 0.75rem;
	}
	
	.sidebar-section.no-border + .sidebar-section {
		padding-top: 0.75rem;
	}
	
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.section-icon {
		width: 20px;
		height: 20px;
		filter: brightness(0) invert(1);
	}
	
	.section-title {
		font-family: 'Inter', sans-serif !important;
		font-size: 1rem !important;
		font-weight: 500;
		color: #F0F0F0;
	}
	
	/* Collapsed Icons Section */
	.collapsed-icons {
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		border-bottom: 1px solid rgba(240, 240, 240, 0.1);
	}
	
	.collapsed-icon-item {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		position: relative;
	}
	
	.collapsed-icon-item:hover {
		background-color: rgba(240, 240, 240, 0.1);
	}
	
	.collapsed-icon {
		width: 20px;
		height: 20px;
		filter: brightness(0) invert(1);
	}
	
	.section-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-left: 2rem;
		cursor: pointer;
		padding: 0.5rem 0 0.5rem 2rem;
		border-radius: 6px;
		transition: background-color 0.2s ease;
	}
	
	.section-item:hover {
		background-color: rgba(240, 240, 240, 0.1);
	}
	
	.item-icon {
		width: 18px;
		height: 18px;
		filter: brightness(0) invert(1);
	}
	
	.item-text {
		font-family: 'Inter', sans-serif !important;
		font-size: 0.9rem !important;
		color: #F0F0F0;
	}
	
	/* Main Navigation */
	.sidebar-nav {
		flex: 1;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Prevent layout shifts */
		min-height: 0;
		box-sizing: border-box;
	}
	
	.nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.nav-item {
		width: 100%;
	}
	
	.nav-link {
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: #F0F0F0;
		font-family: 'Inter', sans-serif !important;
		font-size: 1rem !important;
		font-weight: 400;
		text-align: left;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		/* Prevent layout shifts */
		box-sizing: border-box;
		line-height: 1.5;
	}
	
	.nav-link:hover {
		background-color: rgba(240, 240, 240, 0.1);
		color: #FFFFFF;
	}
	
	.nav-link.active {
		background-color: rgba(240, 240, 240, 0.15);
		color: #FFFFFF;
		font-weight: 500;
	}
	
	/* Parent Navigation with Submenu */
	.parent-nav {
		display: flex !important;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	
	.chevron {
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}
	
	.chevron.expanded {
		transform: rotate(180deg);
	}
	
	/* Submenu Styles */
	.submenu {
		list-style: none;
		padding: 0;
		margin: 0;
		height: 0;
		overflow: hidden;
		transition: height 0.3s ease;
		border-radius: 6px;
		margin-top: 0.5rem;
		/* Prevent layout shift by using fixed sizing */
		box-sizing: border-box;
	}
	
	.submenu.expanded {
		height: 120px; /* Fixed height instead of max-height */
		padding: 0.5rem 0;
	}
	
	.submenu-item {
		width: 100%;
	}
	
	.submenu-link {
		display: block;
		width: calc(100% - 1rem);
		padding: 0.5rem 1rem;
		background: none;
		border: none;
		color: rgba(240, 240, 240, 0.8);
		font-family: 'Inter', sans-serif !important;
		font-size: 0.9rem !important;
		font-weight: 400;
		text-align: left;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		margin: 0 0.5rem;
		/* Prevent layout shifts */
		box-sizing: border-box;
		line-height: 1.4;
	}
	
	.submenu-link:hover {
		background-color: rgba(240, 240, 240, 0.1);
		color: #FFFFFF;
	}
	
	.submenu-link.active {
		background-color: rgba(240, 240, 240, 0.15);
		color: #FFFFFF;
		font-weight: 500;
	}
	
	/* Panel Footer */
	.sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid rgba(240, 240, 240, 0.1);
		margin-top: auto;
	}
	
	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.footer-link {
		background: none;
		border: none;
		color: #F0F0F0;
		font-family: 'Inter', sans-serif !important;
		font-size: 0.8rem !important;
		text-align: left;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s ease;
		padding: 0;
	}
	
	.footer-link:hover {
		opacity: 1;
	}
	
	.social-links {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.social-link {
		color: #F0F0F0;
		opacity: 0.7;
		transition: opacity 0.2s ease;
		text-decoration: none;
	}
	
	.social-link:hover {
		opacity: 1;
	}
	
	.copyright {
		font-family: 'Inter', sans-serif !important;
		font-size: 0.75rem !important;
		color: #F0F0F0;
		opacity: 0.6;
		line-height: 1.4;
	}
	
	.copyright p {
		margin: 0;
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
			position: relative;
			height: auto;
		}
		
		.sidebar-nav {
			align-items: flex-start;
		}
		
		.nav-list {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0.25rem;
		}
		
		.nav-item {
			width: auto;
			flex: 1;
		}
		
		.nav-link {
			text-align: center;
			font-size: 0.9rem !important;
			padding: 0.5rem;
		}
	}
</style>
