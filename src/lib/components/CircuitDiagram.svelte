<script lang="ts">
	import { onMount } from 'svelte';
	import { currentProject } from '$lib/stores/project';
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	
	interface DiagramNode {
		id: string;
		x: number;
		y: number;
		width: number;
		height: number;
		label: string;
		type: 'component' | 'connection' | 'power';
		color: string;
		pins: Array<{name: string, x: number, y: number}>;
	}
	
	interface DiagramConnection {
		from: {nodeId: string, pinName: string};
		to: {nodeId: string, pinName: string};
		color: string;
		label?: string;
	}
	
	let nodes: DiagramNode[] = [];
	let connections: DiagramConnection[] = [];
	let selectedNode: DiagramNode | null = null;
	let isDragging = false;
	let dragOffset = {x: 0, y: 0};
	
	$: if (canvas && $currentProject) {
		generateDiagram();
	}
	
	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d')!;
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			
			// Add event listeners
			canvas.addEventListener('mousedown', handleMouseDown);
			canvas.addEventListener('mousemove', handleMouseMove);
			canvas.addEventListener('mouseup', handleMouseUp);
			canvas.addEventListener('click', handleClick);
		}
		
		return () => {
			if (canvas) {
				canvas.removeEventListener('mousedown', handleMouseDown);
				canvas.removeEventListener('mousemove', handleMouseMove);
				canvas.removeEventListener('mouseup', handleMouseUp);
				canvas.removeEventListener('click', handleClick);
			}
		};
	});
	
	function generateDiagram() {
		nodes = [];
		connections = [];
		
		// Generate nodes for each component
		$currentProject.components.forEach((component, index) => {
			const x = 150 + (index % 3) * 200;
			const y = 100 + Math.floor(index / 3) * 150;
			
			let color = '#00d4aa';
			let pins: Array<{name: string, x: number, y: number}> = [];
			
			// Determine component type and color
			switch(component.category) {
				case 'microcontroller':
					color = '#3b82f6';
					pins = [
						{name: 'VCC', x: x + 80, y: y},
						{name: 'GND', x: x + 80, y: y + 60},
						{name: 'D6', x: x + 80, y: y + 20},
						{name: 'D2', x: x + 80, y: y + 40}
					];
					break;
				case 'output':
					color = '#f59e0b';
					pins = [
						{name: 'VCC', x: x, y: y + 10},
						{name: 'GND', x: x, y: y + 30},
						{name: 'DATA', x: x, y: y + 50}
					];
					break;
				case 'input':
					color = '#10b981';
					pins = [
						{name: 'VCC', x: x, y: y + 10},
						{name: 'GND', x: x, y: y + 30},
						{name: 'OUT', x: x + 80, y: y + 20}
					];
					break;
				default:
					pins = [
						{name: 'PIN1', x: x, y: y + 15},
						{name: 'PIN2', x: x + 80, y: y + 15}
					];
			}
			
			const node: DiagramNode = {
				id: component.id,
				x,
				y,
				width: 80,
				height: 60,
				label: component.name,
				type: 'component',
				color,
				pins
			};
			
			nodes.push(node);
		});
		
		// Generate some example connections
		if (nodes.length >= 2) {
			// Connect Arduino to LED strip (if present)
			const arduino = nodes.find(n => n.id.includes('arduino'));
			const ledStrip = nodes.find(n => n.id.includes('led'));
			
			if (arduino && ledStrip) {
				connections.push({
					from: {nodeId: arduino.id, pinName: 'D6'},
					to: {nodeId: ledStrip.id, pinName: 'DATA'},
					color: '#00d4aa',
					label: 'Data'
				});
				
				connections.push({
					from: {nodeId: arduino.id, pinName: 'VCC'},
					to: {nodeId: ledStrip.id, pinName: 'VCC'},
					color: '#ef4444',
					label: '5V'
				});
				
				connections.push({
					from: {nodeId: arduino.id, pinName: 'GND'},
					to: {nodeId: ledStrip.id, pinName: 'GND'},
					color: '#000000',
					label: 'GND'
				});
			}
		}
		
		drawDiagram();
	}
	
	function drawDiagram() {
		if (!ctx) return;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw grid
		drawGrid();
		
		// Draw connections
		connections.forEach(connection => {
			drawConnection(connection);
		});
		
		// Draw nodes
		nodes.forEach(node => {
			drawNode(node);
		});
		
		// Draw legend
		drawLegend();
	}
	
	function drawGrid() {
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
		ctx.lineWidth = 1;
		
		// Vertical lines
		for (let x = 0; x < canvas.width; x += 20) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}
		
		// Horizontal lines
		for (let y = 0; y < canvas.height; y += 20) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
	}
	
	function drawNode(node: DiagramNode) {
		// Draw component rectangle
		ctx.fillStyle = node.color + '20';
		ctx.strokeStyle = node.color;
		ctx.lineWidth = 2;
		
		ctx.fillRect(node.x, node.y, node.width, node.height);
		ctx.strokeRect(node.x, node.y, node.width, node.height);
		
		// Draw label
		ctx.fillStyle = '#ffffff';
		ctx.font = '12px IBM Plex Mono';
		ctx.textAlign = 'center';
		const textX = node.x + node.width / 2;
		const textY = node.y + node.height / 2 + 4;
		ctx.fillText(node.label, textX, textY);
		
		// Draw pins
		node.pins.forEach(pin => {
			ctx.fillStyle = pin.name.includes('VCC') ? '#ef4444' : 
			                 pin.name.includes('GND') ? '#000000' : node.color;
			ctx.beginPath();
			ctx.arc(pin.x, pin.y, 4, 0, 2 * Math.PI);
			ctx.fill();
			
			// Pin label
			ctx.fillStyle = '#ffffff';
			ctx.font = '10px IBM Plex Mono';
			ctx.textAlign = 'center';
			ctx.fillText(pin.name, pin.x, pin.y - 8);
		});
	}
	
	function drawConnection(connection: DiagramConnection) {
		const fromNode = nodes.find(n => n.id === connection.from.nodeId);
		const toNode = nodes.find(n => n.id === connection.to.nodeId);
		
		if (!fromNode || !toNode) return;
		
		const fromPin = fromNode.pins.find(p => p.name === connection.from.pinName);
		const toPin = toNode.pins.find(p => p.name === connection.to.pinName);
		
		if (!fromPin || !toPin) return;
		
		ctx.strokeStyle = connection.color;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(fromPin.x, fromPin.y);
		
		// Create curved connection
		const midX = (fromPin.x + toPin.x) / 2;
		const midY = (fromPin.y + toPin.y) / 2;
		ctx.quadraticCurveTo(midX, midY - 30, toPin.x, toPin.y);
		ctx.stroke();
		
		// Connection label
		if (connection.label) {
			ctx.fillStyle = connection.color;
			ctx.font = '10px IBM Plex Mono';
			ctx.textAlign = 'center';
			ctx.fillText(connection.label, midX, midY - 35);
		}
	}
	
	function drawLegend() {
		const legendX = canvas.width - 200;
		const legendY = 20;
		
		// Legend background
		ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
		ctx.fillRect(legendX, legendY, 180, 120);
		ctx.strokeStyle = '#00d4aa';
		ctx.lineWidth = 1;
		ctx.strokeRect(legendX, legendY, 180, 120);
		
		// Legend title
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 12px IBM Plex Mono';
		ctx.textAlign = 'left';
		ctx.fillText('Component Types', legendX + 10, legendY + 20);
		
		// Legend items
		const legendItems = [
			{color: '#3b82f6', label: 'Microcontroller'},
			{color: '#f59e0b', label: 'Output'},
			{color: '#10b981', label: 'Input'},
			{color: '#00d4aa', label: 'Other'}
		];
		
		legendItems.forEach((item, index) => {
			const y = legendY + 40 + index * 20;
			
			// Color square
			ctx.fillStyle = item.color;
			ctx.fillRect(legendX + 10, y - 10, 12, 12);
			
			// Label
			ctx.fillStyle = '#cccccc';
			ctx.font = '10px IBM Plex Mono';
			ctx.fillText(item.label, legendX + 30, y);
		});
	}
	
	function getNodeAt(x: number, y: number): DiagramNode | null {
		return nodes.find(node => 
			x >= node.x && x <= node.x + node.width &&
			y >= node.y && y <= node.y + node.height
		) || null;
	}
	
	function handleMouseDown(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		selectedNode = getNodeAt(x, y);
		if (selectedNode) {
			isDragging = true;
			dragOffset.x = x - selectedNode.x;
			dragOffset.y = y - selectedNode.y;
			canvas.style.cursor = 'grabbing';
		}
	}
	
	function handleMouseMove(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		if (isDragging && selectedNode) {
			selectedNode.x = x - dragOffset.x;
			selectedNode.y = y - dragOffset.y;
			
			// Update pin positions
			selectedNode.pins.forEach(pin => {
				pin.x = selectedNode!.x + (pin.name === 'VCC' || pin.name === 'GND' || pin.name === 'DATA' ? 80 : 
				                          pin.name.includes('OUT') ? 80 : 
				                          pin.name === 'PIN2' ? 80 : 0);
				pin.y = selectedNode!.y + (pin.name === 'VCC' ? 0 : 
				                          pin.name === 'GND' ? 60 : 
				                          pin.name === 'DATA' ? 50 : 
				                          pin.name.includes('D') ? (pin.name === 'D6' ? 20 : 40) :
				                          pin.name.includes('OUT') ? 20 :
				                          15);
			});
			
			drawDiagram();
		} else {
			// Update cursor
			const nodeUnderMouse = getNodeAt(x, y);
			canvas.style.cursor = nodeUnderMouse ? 'grab' : 'default';
		}
	}
	
	function handleMouseUp() {
		isDragging = false;
		selectedNode = null;
		canvas.style.cursor = 'default';
	}
	
	function handleClick(event: MouseEvent) {
		if (isDragging) return;
		
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const clickedNode = getNodeAt(x, y);
		if (clickedNode) {
			// Show component details or perform action
			console.log('Clicked node:', clickedNode.label);
		}
	}
	
	function exportDiagram() {
		const link = document.createElement('a');
		link.download = 'circuit-diagram.png';
		link.href = canvas.toDataURL();
		link.click();
	}
	
	function resetDiagram() {
		generateDiagram();
	}
	
	function addComponent() {
		// Simulate adding a new component
		console.log('Add component functionality');
	}
</script>

<div class="diagram-container">
	<!-- Circuit Header - Same style as IDE header -->
	<header class="diagram-header">
		<div class="header-left">
			<h1>Circuit Diagram</h1>
			<p class="diagram-description">Interactive circuit design for your project</p>
		</div>
		<div class="header-actions">
			<button class="action-btn" on:click={addComponent}>
				Add Component
			</button>
			<button class="action-btn" on:click={resetDiagram}>
				Reset
			</button>
			<button class="action-btn" on:click={exportDiagram}>
				Export
			</button>
		</div>
	</header>
	
	<div class="diagram-canvas-container">
		<canvas bind:this={canvas} class="diagram-canvas"></canvas>
	</div>
	
	<div class="diagram-info">
		<p>Drag components to rearrange • Click for details • Auto-generated from your project</p>
	</div>
</div>

<style>
	.diagram-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	}
	
	/* Circuit Header - Same style as IDE and chat headers */
	.diagram-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
	}
	
	.diagram-header h1 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: #00d4aa;
	}
	
	.diagram-description {
		margin: 0;
		color: #94a3b8;
		font-size: 0.875rem;
	}
	
	.header-actions {
		display: flex;
		gap: 1rem;
	}
	
	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.action-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		border-color: #00d4aa;
		transform: translateY(-2px);
	}
	

	
	.diagram-canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}
	
	.diagram-canvas {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		cursor: default;
	}
	
	.diagram-info {
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(0, 212, 170, 0.3);
		background: rgba(30, 41, 59, 0.8);
		border-radius: 0 0 16px 16px;
	}
	
	.diagram-info p {
		margin: 0;
		color: #94a3b8;
		font-size: 0.85rem;
		text-align: center;
	}
</style>
