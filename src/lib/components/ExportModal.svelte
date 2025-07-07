<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { currentProject } from '$lib/stores/project';
	
	export let isOpen = false;
	
	const dispatch = createEventDispatcher();
	
	let exportFormat = 'json';
	let includeChat = true;
	let includeCode = true;
	let includeComponents = true;
	let shareLink = '';
	let showShareLink = false;
	
	function closeModal() {
		isOpen = false;
		dispatch('close');
	}
	
	function exportProject() {
		const project = $currentProject;
		let exportData: any = {
			name: project.name,
			description: project.description,
			exportedAt: new Date().toISOString(),
			format: exportFormat
		};
		
		if (includeComponents) {
			exportData.components = project.components;
		}
		
		if (includeCode) {
			exportData.code = project.code;
		}
		
		if (includeChat) {
			exportData.chatHistory = project.chatHistory.map(msg => ({
				type: msg.type,
				content: msg.content,
				timestamp: msg.timestamp.toISOString(),
				codeGenerated: msg.codeGenerated
			}));
		}
		
		if (exportFormat === 'json') {
			downloadJSON(exportData);
		} else if (exportFormat === 'markdown') {
			downloadMarkdown(exportData);
		} else if (exportFormat === 'share') {
			generateShareLink(exportData);
		}
	}
	
	function downloadJSON(data: any) {
		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.name.replace(/\s+/g, '_')}_export.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		
		closeModal();
	}
	
	function downloadMarkdown(data: any) {
		let markdown = `# ${data.name}\n\n`;
		markdown += `**Description:** ${data.description}\n\n`;
		markdown += `**Exported:** ${new Date(data.exportedAt).toLocaleString()}\n\n`;
		
		if (data.components) {
			markdown += `## Components\n\n`;
			data.components.forEach((comp: any) => {
				markdown += `- **${comp.name}** (${comp.price || 'N/A'}) - ${comp.description}\n`;
			});
			markdown += `\n`;
		}
		
		if (data.code) {
			markdown += `## Arduino Code\n\n\`\`\`cpp\n${data.code}\n\`\`\`\n\n`;
		}
		
		if (data.chatHistory) {
			markdown += `## Chat History\n\n`;
			data.chatHistory.forEach((msg: any) => {
				const timestamp = new Date(msg.timestamp).toLocaleString();
				markdown += `### ${msg.type.toUpperCase()} (${timestamp})\n\n${msg.content}\n\n`;
				if (msg.codeGenerated) {
					markdown += `**Generated Code:**\n\`\`\`cpp\n${msg.codeGenerated}\n\`\`\`\n\n`;
				}
			});
		}
		
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.name.replace(/\s+/g, '_')}_export.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		
		closeModal();
	}
	
	function generateShareLink(data: any) {
		// Encode project data in base64 for sharing
		const encodedData = btoa(JSON.stringify(data));
		shareLink = `${window.location.origin}/shared?data=${encodedData}`;
		showShareLink = true;
	}
	
	function copyShareLink() {
		navigator.clipboard.writeText(shareLink).then(() => {
			// Show copied feedback
			const copyBtn = document.querySelector('.copy-btn');
			if (copyBtn) {
				copyBtn.textContent = 'Kopiert!';
				setTimeout(() => {
					copyBtn.textContent = 'Link kopieren';
				}, 2000);
			}
		});
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal-overlay" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()} role="dialog" aria-modal="true" tabindex="-1">
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="document">
			<div class="modal-header">
				<h2>Projekt exportieren</h2>
				<button class="close-btn" on:click={closeModal}>×</button>
			</div>
			
			<div class="modal-body">
				{#if !showShareLink}
					<div class="export-options">
						<div class="format-selection">
							<h3>Export-Format</h3>
							<label class="radio-option">
								<input type="radio" bind:group={exportFormat} value="json" />
								<span class="radio-label">
									<strong>JSON</strong> - Maschinenlesbares Format für Backup
								</span>
							</label>
							<label class="radio-option">
								<input type="radio" bind:group={exportFormat} value="markdown" />
								<span class="radio-label">
									<strong>Markdown</strong> - Menschenlesbares Dokumentationsformat
								</span>
							</label>
							<label class="radio-option">
								<input type="radio" bind:group={exportFormat} value="share" />
								<span class="radio-label">
									<strong>Share-Link</strong> - Projekt über URL teilen
								</span>
							</label>
						</div>
						
						<div class="include-options">
							<h3>Zu exportierende Inhalte</h3>
							<label class="checkbox-option">
								<input type="checkbox" bind:checked={includeComponents} />
								<span>Komponenten-Liste</span>
							</label>
							<label class="checkbox-option">
								<input type="checkbox" bind:checked={includeCode} />
								<span>Arduino-Code</span>
							</label>
							<label class="checkbox-option">
								<input type="checkbox" bind:checked={includeChat} />
								<span>Chat-Verlauf</span>
							</label>
						</div>
					</div>
				{:else}
					<div class="share-link-container">
						<h3>Share-Link generiert</h3>
						<p>Teile diesen Link, um dein Projekt mit anderen zu teilen:</p>
						<div class="share-link-box">
							<input type="text" readonly value={shareLink} class="share-link-input" />
							<button on:click={copyShareLink} class="copy-btn">Link kopieren</button>
						</div>
						<p class="share-info">
							<small>
								Hinweis: Der Link enthält alle Projektdaten und kann ohne Anmeldung geöffnet werden.
							</small>
						</p>
					</div>
				{/if}
			</div>
			
			<div class="modal-footer">
				{#if !showShareLink}
					<button on:click={closeModal} class="btn-secondary">Abbrechen</button>
					<button on:click={exportProject} class="btn-primary">
						{exportFormat === 'share' ? 'Link generieren' : 'Exportieren'}
					</button>
				{:else}
					<button on:click={() => { showShareLink = false; }} class="btn-secondary">Zurück</button>
					<button on:click={closeModal} class="btn-primary">Fertig</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}
	
	.modal-content {
		background: #191919;
		border-radius: 16px;
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
		font-family: 'Inter', sans-serif;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: #191919;
	}
	
	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #888;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
	}
	
	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}
	
	.modal-body {
		padding: 24px;
		overflow-y: auto;
		max-height: 60vh;
	}
	
	.export-options {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	
	.format-selection h3,
	.include-options h3 {
		margin: 0 0 16px 0;
		font-size: 1rem;
		color: #ffffff;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
	}
	
	.radio-option,
	.checkbox-option {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 12px;
		cursor: pointer;
		padding: 12px;
		border-radius: 8px;
		transition: background 0.2s ease;
	}
	
	.radio-option:hover,
	.checkbox-option:hover {
		background: #2a2a2a;
	}
	
	.radio-label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	
	.radio-label strong {
		color: #ffffff;
	}
	
	.radio-option input,
	.checkbox-option input {
		margin: 0;
		accent-color: #00d4aa;
	}
	
	.checkbox-option span {
		color: #cccccc;
	}
	
	.share-link-container {
		text-align: center;
	}
	
	.share-link-container h3 {
		margin: 0 0 16px 0;
		color: #ffffff;
	}
	
	.share-link-container p {
		margin: 0 0 16px 0;
		color: #cccccc;
	}
	
	.share-link-box {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}
	
	.share-link-input {
		flex: 1;
		padding: 12px;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 8px;
		color: #ffffff;
		font-family: monospace;
		font-size: 0.9rem;
	}
	
	.copy-btn {
		padding: 12px 20px;
		background: #00d4aa;
		color: #000000;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
		white-space: nowrap;
	}
	
	.copy-btn:hover {
		background: #00b8d4;
	}
	
	.share-info {
		font-size: 0.85rem;
		color: #888;
	}
	
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 20px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background: #191919;
	}
	
	.btn-secondary,
	.btn-primary {
		padding: 12px 24px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: 2px solid;
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
	}
	
	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
		color: #ffffff;
	}
	
	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-1px);
	}
	
	.btn-primary {
		background: rgba(237, 247, 96, 0.1);
		border-color: rgba(237, 247, 96, 0.5);
		color: #EDF760;
	}
	
	.btn-primary:hover {
		background: #EDF760;
		border-color: #EDF760;
		color: #191919;
		transform: translateY(-1px);
	}
</style>
