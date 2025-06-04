<script lang="ts">
	export let value = '';
	export let onSend: (message: string) => void;
	export let disabled = false;
	export let placeholder = 'Type your message...';
	
	function handleSendMessage() {
		if (!value.trim() || disabled) return;
		const message = value.trim();
		value = '';
		onSend(message);
	}
	
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	}
</script>

<div class="input-area">
	<div class="input-container">
		<textarea
			bind:value
			on:keydown={handleKeyPress}
			{placeholder}
			rows="3"
			class="message-input"
			{disabled}
		></textarea>
		<button 
			class="send-button" 
			on:click={handleSendMessage}
			disabled={!value.trim() || disabled}
			aria-label="Send message"
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
	</div>
</div>

<style>
	.input-area {
		padding: 2rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
		background: rgba(15, 23, 42, 0.3);
		backdrop-filter: blur(8px);
	}
	
	.input-container {
		max-width: 100%;
		display: flex;
		gap: 1rem;
		align-items: flex-end;
	}
	
	.message-input {
		flex: 1;
		background: rgba(30, 41, 59, 0.8);
		border: 2px solid rgba(0, 212, 170, 0.3);
		border-radius: 16px;
		padding: 1.25rem 1.5rem;
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1rem;
		resize: none;
		min-height: 60px;
		max-height: 160px;
		transition: all 0.3s ease;
		line-height: 1.5;
	}
	
	.message-input:focus {
		outline: none;
		border-color: #00d4aa;
		box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
		background: rgba(30, 41, 59, 0.9);
	}
	
	.message-input::placeholder {
		color: rgba(226, 232, 240, 0.5);
	}
	
	.send-button {
		width: 56px;
		height: 56px;
		background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
		border: none;
		border-radius: 16px;
		color: #0a0f1a;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(0, 212, 170, 0.2);
	}
	
	.send-button:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(0, 212, 170, 0.4);
	}
	
	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: 0 4px 16px rgba(0, 212, 170, 0.1);
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.input-area {
			padding: 1.5rem;
		}
		
		.message-input {
			min-height: 50px;
			padding: 1rem 1.25rem;
		}
		
		.send-button {
			width: 48px;
			height: 48px;
		}
	}
</style>
