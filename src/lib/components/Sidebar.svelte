<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { sidebarCollapsed, setSidebarWidth, activeView } from '$lib/stores/sidebar';
	import { createEventDispatcher } from 'svelte';

	// Event dispatcher for parent components
	const dispatch = createEventDispatcher();
	
	// Sidebar state
	let isCollapsed = false;
	let isAiChatExpanded = false;
	
	// Subscribe to global sidebar state
	$: sidebarCollapsed.set(isCollapsed);
	
	// Set CSS custom property on mount and when collapsed state changes
	$: setSidebarWidth(isCollapsed);
	
	onMount(() => {
		// Initialize with collapsed state if on homepage
		if ($page.url.pathname === '/') {
			isCollapsed = true;
		}
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
		return (
			aiChatRoutes.some(route => $page.url.pathname === route) ||
			$activeView === 'circuit-designer' ||
			$activeView === 'code-editor'
		);
	}
	
	// Toggle sidebar collapse
	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}
	
	// Toggle AI Chat submenu
	function toggleAiChat() {
		isAiChatExpanded = !isAiChatExpanded;
		// Navigate to project-chat as default and reset to chat view
		if (isAiChatExpanded && $activeView !== 'circuit-designer') {
			navigateTo('/project-chat');
			activeView.set('chat');
		}
	}
	
	// Handle Circuit Designer navigation
	function handleCircuitDesignerClick() {
		if ($activeView === 'circuit-designer') {
			// We're already in circuit designer mode, don't navigate away
			// Just dispatch an event to show/focus the designer
			dispatch('showCircuitDesigner');
		} else {
			// Navigate to circuit designer route
			navigateTo('/circuit-designer');
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
		<button 
			class="section-header clickable" 
			on:click={() => navigateTo('/myProjects')}
		>
			<img src="/sidepanel-icons/tabler-icon-archive.svg" alt="Projects" class="section-icon">
			<span class="section-title">My Projects</span>
		</button>
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
		<!-- Top Section: My Projects & Search -->
		<div class="collapsed-section">
			<button 
				class="collapsed-icon-item" 
				title="My Projects" 
				on:click={() => navigateTo('/myProjects')}
			>
				<img src="/sidepanel-icons/tabler-icon-archive.svg" alt="Projects" class="collapsed-icon">
			</button>
			<div class="collapsed-icon-item" title="Search">
				<img src="/sidepanel-icons/Frame.svg" alt="Search" class="collapsed-icon">
			</div>
		</div>
		
		<!-- Separator -->
		<div class="collapsed-separator"></div>
		
		<!-- Middle Section: Main Navigation -->
		<div class="collapsed-section collapsed-nav-section">
			<button 
				class="collapsed-icon-item" 
				title="AI Chat"
				class:active={isAiChatParentActive()}
				on:click={toggleAiChat}
			>
				<img src="/nav-icon/AI-Chat.svg" alt="AI Chat" class="collapsed-icon">
			</button>
			<button 
				class="collapsed-icon-item" 
				title="Playground"
				class:active={isActiveRoute('/playground')}
				on:click={() => navigateTo('/playground')}
			>
				<img src="/nav-icon/Playground.svg" alt="Playground" class="collapsed-icon">
			</button>
			<button 
				class="collapsed-icon-item" 
				title="Components"
				class:active={isActiveRoute('/overview')}
				on:click={() => navigateTo('/overview')}
			>
				<img src="/nav-icon/Component.svg" alt="Components" class="collapsed-icon">
			</button>
			<button 
				class="collapsed-icon-item" 
				title="Tutorials"
				class:active={isActiveRoute('/tutorials')}
				on:click={() => navigateTo('/tutorials')}
			>
				<img src="/nav-icon/Tutorials.svg" alt="Tutorials" class="collapsed-icon">
			</button>
			<button 
				class="collapsed-icon-item" 
				title="Shop"
				class:active={isActiveRoute('/shop')}
				on:click={() => navigateTo('/shop')}
			>
				<img src="/nav-icon/Shop.svg" alt="Shop" class="collapsed-icon">
			</button>
			<button 
				class="collapsed-icon-item" 
				title="About"
				class:active={isActiveRoute('/about')}
				on:click={() => navigateTo('/about')}
			>
				<img src="/nav-icon/About.svg" alt="About" class="collapsed-icon">
			</button>
		</div>
		
		<!-- Separator -->
		<div class="collapsed-separator"></div>
		
		<!-- Bottom Section: Social Links -->
		<div class="collapsed-section">
			<a 
				href="https://github.com" 
				target="_blank" 
				rel="noopener noreferrer" 
				class="collapsed-icon-item social-icon" 
				title="GitHub"
			>
				<img src="/footer-icon/github.svg" alt="GitHub" class="collapsed-icon">
			</a>
			<a 
				href="https://youtube.com" 
				target="_blank" 
				rel="noopener noreferrer" 
				class="collapsed-icon-item social-icon" 
				title="YouTube"
			>
				<img src="/footer-icon/youtube.svg" alt="YouTube" class="collapsed-icon">
			</a>
			<a 
				href="https://linkedin.com" 
				target="_blank" 
				rel="noopener noreferrer" 
				class="collapsed-icon-item social-icon" 
				title="LinkedIn"
			>
				<img src="/footer-icon/linkedin.svg" alt="LinkedIn" class="collapsed-icon">
			</a>
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
					<div class="nav-link-content">
						<img src="/nav-icon/AI-Chat.svg" alt="AI Chat" class="nav-icon">
						<span>AI Chat</span>
					</div>
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
							class:active={isActiveRoute('/project-chat') && $activeView !== 'circuit-designer' && $activeView !== 'code-editor'}
							on:click={() => {
								navigateTo('/project-chat');
								activeView.set('chat');
							}}
						>
							Circuit Chat
						</button>
					</li>
					<li class="submenu-item">
						<button
							class="submenu-link"
							class:active={$activeView === 'circuit-designer'}
							on:click={handleCircuitDesignerClick}
						>
							Circuit Designer
							{#if $activeView === 'circuit-designer'}
								<span class="active-indicator">●</span>
							{/if}
						</button>
					</li>
					<li class="submenu-item">
						<button
							class="submenu-link"
							class:active={$activeView === 'code-editor' && isActiveRoute('/project-chat')}
							on:click={() => {
								navigateTo('/project-chat');
								activeView.set('code-editor');
							}}
						>
							Circuit Code
							{#if $activeView === 'code-editor' && isActiveRoute('/project-chat')}
								<span class="active-indicator">●</span>
							{/if}
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
					<img src="/nav-icon/Playground.svg" alt="Playground" class="nav-icon">
					<span>Playground</span>
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/overview')}
					on:click={() => navigateTo('/overview')}
				>
					<img src="/nav-icon/Component.svg" alt="Components" class="nav-icon">
					<span>Components</span>
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/tutorials')}
					on:click={() => navigateTo('/tutorials')}
				>
					<img src="/nav-icon/Tutorials.svg" alt="Tutorials" class="nav-icon">
					<span>Tutorials</span>
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/shop')}
					on:click={() => navigateTo('/shop')}
				>
					<img src="/nav-icon/Shop.svg" alt="Shop" class="nav-icon">
					<span>Shop</span>
				</button>
			</li>
			<li class="nav-item">
				<button 
					class="nav-link" 
					class:active={isActiveRoute('/about')}
					on:click={() => navigateTo('/about')}
				>
					<img src="/nav-icon/About.svg" alt="About" class="nav-icon">
					<span>About</span>
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
				<img src="/footer-icon/github.svg" alt="GitHub" width="20" height="20">
			</a>
			<a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-link">
				<img src="/footer-icon/youtube.svg" alt="YouTube" width="20" height="20">
			</a>
			<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-link">
				<img src="/footer-icon/linkedin.svg" alt="LinkedIn" width="20" height="20">
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
		width: 32px;
		height: 32px;
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
		padding-bottom: 0rem;
	}
	
	.sidebar-section.no-border + .sidebar-section {
		padding-top: 0rem;
	}
	
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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
		box-sizing: border-box;
		line-height: 1.5;
	}
	
	.section-header:hover {
		background-color: rgba(240, 240, 240, 0.1);
		color: #FFFFFF;
	}
	
	.section-header:hover .section-icon {
		filter: brightness(0) invert(1);
	}
	
	.section-header:hover .section-title {
		color: #FFFFFF;
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
		justify-content: space-between;
		border-bottom: 1px solid rgba(240, 240, 240, 0.1);
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		height: calc(100vh - 200px); /* Reserve space for header */
	}
	
	.collapsed-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
	
	.collapsed-nav-section {
		flex: 1;
		justify-content: center;
	}
	
	.collapsed-separator {
		width: 32px;
		height: 1px;
		background-color: rgba(240, 240, 240, 0.2);
		margin: 0.5rem 0;
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
		background: none;
		border: none;
		padding: 0;
	}
	
	.collapsed-icon-item:hover,
	.collapsed-icon-item.active {
		background-color: rgba(240, 240, 240, 0.15);
	}
	
	.social-icon {
		color: rgba(240, 240, 240, 0.7);
		text-decoration: none;
	}
	
	.social-icon:hover {
		color: rgba(240, 240, 240, 1);
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
		display: flex;
		align-items: center;
		gap: 0.75rem;
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
	
	.nav-link-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}
	
	.nav-icon {
		width: 20px;
		height: 20px;
		filter: brightness(0) invert(1);
		flex-shrink: 0;
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
	
	.active-indicator {
		color: #CABDF5;
		font-size: 1.2rem;
		margin-left: 0.5rem;
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
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
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.social-link:hover {
		opacity: 1;
	}
	
	.social-link img {
		filter: brightness(0) invert(1);
		transition: filter 0.2s ease;
	}
	
	.social-link:hover img {
		filter: brightness(0) invert(1);
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
