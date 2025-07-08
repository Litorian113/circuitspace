<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<script lang="ts">
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let selectedComponent: PlacedComponent | null = null;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let selectedCategory = 'All';
	let mousePos = { x: 0, y: 0 };
	
	// Connection state
	let isConnecting = false;
	let connectionStart: { component: PlacedComponent, pin: Pin } | null = null;
	let hoveredPin: { component: PlacedComponent, pin: Pin } | null = null;
	
	// Canvas state
	let zoomLevel = 1.0;
	let panX = 0;
	let panY = 0;
	let isPanning = false;
	let panStartPos = { x: 0, y: 0 };
	
	const MIN_ZOOM = 0.3;
	const MAX_ZOOM = 3.0;
	const ZOOM_SENSITIVITY = 0.1;
	
	interface Component {
		id: string;
		name: string;
		image: string;
		category: string;
		width: number;
		height: number;
		description: string;
		pins?: Pin[];
	}
	
	interface PlacedComponent {
		id: string;
		componentId: string;
		x: number;
		y: number;
		width: number;
		height: number;
		name: string;
		image: string;
		pins: Pin[];
	}
	
	interface Pin {
		id: string;
		name: string;
		x: number;
		y: number;
		type: 'input' | 'output' | 'power' | 'ground';
		color: string;
	}
	
	interface Connection {
		id: string;
		fromComponent: string;
		fromPin: string;
		toComponent: string;
		toPin: string;
		fromPos: { x: number, y: number };
		toPos: { x: number, y: number };
		color: string;
	}
	
	// Available components for the playground
	const availableComponents: Component[] = [
		{
			id: 'arduino-leonardo',
			name: 'Arduino Leonardo',
			image: '/components/leonardoKeyestudio.png',
			category: 'Microcontrollers',
			width: 200,
			height: 140,
			description: 'Arduino Leonardo microcontroller board'
		},
		{
			id: 'arduino-micro',
			name: 'Arduino Micro',
			image: '/components/arduinomicro.png',
			category: 'Microcontrollers',
			width: 180,
			height: 120,
			description: 'Arduino Micro microcontroller board'
		},
		{
			id: 'breadboard',
			name: 'Breadboard',
			image: '/components/breadboard.png',
			category: 'Base Components',
			width: 220,
			height: 150,
			description: 'Solderless breadboard for prototyping'
		},
		{
			id: 'led',
			name: 'LED',
			image: '/components/leuchtdiode.png',
			category: 'Output',
			width: 70,
			height: 100,
			description: 'Light Emitting Diode'
		},
		{
			id: 'resistor',
			name: 'Resistor',
			image: '/components/widerstand.png',
			category: 'Passive Components',
			width: 120,
			height: 55,
			description: 'Current limiting resistor'
		},
		{
			id: 'potentiometer',
			name: 'Potentiometer',
			image: '/components/poti.png',
			category: 'Input',
			width: 100,
			height: 100,
			description: '10kΩ linear potentiometer'
		},
		{
			id: 'pushbutton',
			name: 'Push Button',
			image: '/components/pushbutton.png',
			category: 'Input',
			width: 80,
			height: 80,
			description: 'Momentary push button switch'
		},
		{
			id: 'jumper-cable',
			name: 'Jumper Cable',
			image: '/components/jumpercable.png',
			category: 'Connections',
			width: 140,
			height: 40,
			description: 'Wire for connections between components'
		},
		{
			id: '5v-motor',
			name: '5V Motor',
			image: '/components/5vMotor.png',
			category: 'Output',
			width: 120,
			height: 120,
			description: '5V DC motor'
		}
	];
	
	const categories = ['All', ...new Set(availableComponents.map(c => c.category))];
	let componentImages: Map<string, HTMLImageElement> = new Map();
	let placedComponents: PlacedComponent[] = [];
	let connections: Connection[] = [];
	let nextComponentId = 1;
	let nextConnectionId = 1;
	
	// Filtered components based on selected category
	$: filteredComponents = selectedCategory === 'All' 
		? availableComponents 
		: availableComponents.filter(c => c.category === selectedCategory);
	
	onMount(() => {
		const canvasContainer = document.getElementById('canvas-container');
		if (canvasContainer) {
			canvas = canvasContainer.querySelector('canvas') as HTMLCanvasElement;
			ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
			
			// Set canvas size
			resizeCanvas();
			window.addEventListener('resize', resizeCanvas);
			
			// Add keyboard event listeners
			window.addEventListener('keydown', handleKeyDown);
			
			// Preload component images
			preloadImages();
			
			// Start render loop
			animate();
		}
		
		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
	
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Delete' || event.key === 'Backspace') {
			deleteSelected();
		} else if (event.key === 'Escape') {
			isConnecting = false;
			connectionStart = null;
			selectedComponent = null;
		} else if (event.ctrlKey || event.metaKey) {
			if (event.key === 'a') {
				event.preventDefault();
				// Select all - could be implemented later
			} else if (event.key === '0') {
				event.preventDefault();
				resetView();
			}
		}
	}
	
	function resizeCanvas() {
		if (!canvas) return;
		
		const container = canvas.parentElement;
		if (container) {
			canvas.width = container.clientWidth;
			canvas.height = container.clientHeight;
			redraw();
		}
	}
	
	async function preloadImages() {
		for (const component of availableComponents) {
			const img = new Image();
			img.src = component.image;
			await new Promise((resolve) => {
				img.onload = resolve;
				img.onerror = resolve;
			});
			componentImages.set(component.id, img);
		}
		redraw();
	}
	
	function animate() {
		redraw();
		requestAnimationFrame(animate);
	}
	
	function redraw() {
		if (!ctx || !canvas) return;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Save context for transformations
		ctx.save();
		
		// Apply zoom and pan
		ctx.translate(panX, panY);
		ctx.scale(zoomLevel, zoomLevel);
		
		// Draw grid
		drawGrid();
		
		// Draw connections
		drawConnections();
		
		// Draw placed components
		drawPlacedComponents();
		
		// Draw connection being created
		if (isConnecting && connectionStart && mousePos) {
			drawTemporaryConnection();
		}
		
		// Restore context
		ctx.restore();
	}
	
	function drawGrid() {
		if (!ctx || !canvas) return;
		
		const gridSize = 20;
		ctx.strokeStyle = 'rgba(202, 189, 245, 0.1)';
		ctx.lineWidth = 1;
		
		const startX = Math.floor(-panX / zoomLevel / gridSize) * gridSize;
		const startY = Math.floor(-panY / zoomLevel / gridSize) * gridSize;
		const endX = startX + (canvas.width / zoomLevel) + gridSize;
		const endY = startY + (canvas.height / zoomLevel) + gridSize;
		
		for (let x = startX; x < endX; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, endY);
			ctx.stroke();
		}
		
		for (let y = startY; y < endY; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
			ctx.stroke();
		}
	}
	
	function drawPlacedComponents() {
		if (!ctx) return;
		
		for (const component of placedComponents) {
			const img = componentImages.get(component.componentId);
			if (img) {
				// Draw component image
				ctx.drawImage(img, component.x, component.y, component.width, component.height);
				
				// Draw component name
				ctx.fillStyle = '#F0F0F0';
				ctx.font = '12px Inter, Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(component.name, component.x + component.width / 2, component.y - 5);
				
				// Draw selection highlight
				if (selectedComponent?.id === component.id) {
					ctx.strokeStyle = '#CABDF5';
					ctx.lineWidth = 3;
					ctx.strokeRect(component.x - 2, component.y - 2, component.width + 4, component.height + 4);
				}
				
				// Draw pins (simplified for playground)
				drawComponentPins(component);
			}
		}
	}
	
	function drawComponentPins(component: PlacedComponent) {
		if (!ctx) return;
		
		// Generate basic pins for demonstration
		const pins = generateBasicPins(component);
		
		for (const pin of pins) {
			const pinX = component.x + pin.x;
			const pinY = component.y + pin.y;
			
			// Highlight hovered pin
			const isHovered = hoveredPin?.component.id === component.id && hoveredPin?.pin.id === pin.id;
			const isConnectionStart = connectionStart?.component.id === component.id && connectionStart?.pin.id === pin.id;
			
			// Draw pin circle with hover/connection effects
			ctx.beginPath();
			ctx.arc(pinX, pinY, isHovered || isConnectionStart ? 8 : 6, 0, 2 * Math.PI);
			ctx.fillStyle = isConnectionStart ? '#ECF65F' : isHovered ? '#CABDF5' : pin.color;
			ctx.fill();
			ctx.strokeStyle = isHovered || isConnectionStart ? '#F0F0F0' : '#888';
			ctx.lineWidth = isHovered || isConnectionStart ? 2 : 1;
			ctx.stroke();
			
			// Draw pin label
			ctx.fillStyle = '#F0F0F0';
			ctx.font = '10px Inter, Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(pin.name, pinX, pinY - 10);
		}
	}
	
	function generateBasicPins(component: PlacedComponent): Pin[] {
		// Simplified pin generation for playground
		const pins: Pin[] = [];
		const spacing = 30;
		
		switch (component.componentId) {
			case 'arduino-leonardo':
			case 'arduino-micro':
				// Power pins
				pins.push({ id: '5v', name: '5V', x: 20, y: 20, type: 'power', color: '#ff0000' });
				pins.push({ id: 'gnd', name: 'GND', x: 20, y: 50, type: 'ground', color: '#000000' });
				// Digital pins
				for (let i = 0; i < 6; i++) {
					pins.push({ 
						id: `d${i}`, 
						name: `D${i}`, 
						x: 50 + i * 20, 
						y: 20, 
						type: 'input', 
						color: '#00aa00' 
					});
				}
				break;
			case 'led':
				pins.push({ id: 'anode', name: '+', x: component.width / 2, y: 10, type: 'input', color: '#ff0000' });
				pins.push({ id: 'cathode', name: '-', x: component.width / 2, y: component.height - 10, type: 'input', color: '#000000' });
				break;
			case 'resistor':
				pins.push({ id: 'pin1', name: '1', x: 10, y: component.height / 2, type: 'input', color: '#666666' });
				pins.push({ id: 'pin2', name: '2', x: component.width - 10, y: component.height / 2, type: 'input', color: '#666666' });
				break;
			case 'pushbutton':
				pins.push({ id: 'pin1', name: '1', x: 15, y: 15, type: 'input', color: '#666666' });
				pins.push({ id: 'pin2', name: '2', x: component.width - 15, y: 15, type: 'input', color: '#666666' });
				pins.push({ id: 'pin3', name: '3', x: 15, y: component.height - 15, type: 'input', color: '#666666' });
				pins.push({ id: 'pin4', name: '4', x: component.width - 15, y: component.height - 15, type: 'input', color: '#666666' });
				break;
			default:
				// Default pins for other components
				pins.push({ id: 'pin1', name: '1', x: 10, y: component.height / 2, type: 'input', color: '#666666' });
				pins.push({ id: 'pin2', name: '2', x: component.width - 10, y: component.height / 2, type: 'input', color: '#666666' });
		}
		
		return pins;
	}
	
	function drawConnections() {
		if (!ctx) return;
		
		for (const connection of connections) {
			ctx.beginPath();
			ctx.moveTo(connection.fromPos.x, connection.fromPos.y);
			ctx.lineTo(connection.toPos.x, connection.toPos.y);
			ctx.strokeStyle = connection.color;
			ctx.lineWidth = 3;
			ctx.stroke();
		}
	}
	
	function drawTemporaryConnection() {
		if (!ctx || !connectionStart) return;
		
		ctx.beginPath();
		ctx.moveTo(connectionStart.component.x + connectionStart.pin.x, connectionStart.component.y + connectionStart.pin.y);
		ctx.lineTo((mousePos.x - panX) / zoomLevel, (mousePos.y - panY) / zoomLevel);
		ctx.strokeStyle = '#CABDF5';
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.stroke();
		ctx.setLineDash([]);
	}
	
	function handleDragStart(event: DragEvent, component: Component) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('component', JSON.stringify(component));
		}
	}
	
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}
	
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		
		const componentData = event.dataTransfer?.getData('component');
		if (componentData) {
			const component = JSON.parse(componentData) as Component;
			const rect = canvas.getBoundingClientRect();
			const x = (event.clientX - rect.left - panX) / zoomLevel;
			const y = (event.clientY - rect.top - panY) / zoomLevel;
			
			addComponent(component, x, y);
		}
	}
	
	function addComponent(component: Component, x: number, y: number) {
		const newComponent: PlacedComponent = {
			id: `component-${nextComponentId++}`,
			componentId: component.id,
			x: x,
			y: y,
			width: component.width,
			height: component.height,
			name: component.name,
			image: component.image,
			pins: generateBasicPins({
				id: `component-${nextComponentId}`,
				componentId: component.id,
				x: x,
				y: y,
				width: component.width,
				height: component.height,
				name: component.name,
				image: component.image,
				pins: []
			})
		};
		
		placedComponents = [...placedComponents, newComponent];
	}
	
	function handleCanvasMouseDown(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = (event.clientX - rect.left - panX) / zoomLevel;
		const y = (event.clientY - rect.top - panY) / zoomLevel;
		
		// Check if clicking on a pin for connection
		for (const component of placedComponents) {
			const pins = generateBasicPins(component);
			for (const pin of pins) {
				const pinX = component.x + pin.x;
				const pinY = component.y + pin.y;
				const distance = Math.sqrt((x - pinX) ** 2 + (y - pinY) ** 2);
				
				if (distance < 12) { // Pin click radius
					if (!isConnecting) {
						// Start connection
						isConnecting = true;
						connectionStart = { component, pin };
						return;
					} else if (connectionStart && connectionStart.component.id !== component.id) {
						// Complete connection
						createConnection(connectionStart, { component, pin });
						isConnecting = false;
						connectionStart = null;
						return;
					}
				}
			}
		}
		
		// Check if clicking on a component
		for (const component of placedComponents) {
			if (x >= component.x && x <= component.x + component.width &&
				y >= component.y && y <= component.y + component.height) {
				selectedComponent = component;
				isDragging = true;
				dragOffset = { x: x - component.x, y: y - component.y };
				return;
			}
		}
		
		// Cancel connection if clicking empty space
		if (isConnecting) {
			isConnecting = false;
			connectionStart = null;
			return;
		}
		
		// Start panning if not clicking on a component
		isPanning = true;
		panStartPos = { x: event.clientX - panX, y: event.clientY - panY };
		selectedComponent = null;
	}
	
	function handleCanvasMouseMove(event: MouseEvent) {
		mousePos = { x: event.clientX, y: event.clientY };
		
		if (isDragging && selectedComponent) {
			const rect = canvas.getBoundingClientRect();
			const x = (event.clientX - rect.left - panX) / zoomLevel;
			const y = (event.clientY - rect.top - panY) / zoomLevel;
			
			selectedComponent.x = x - dragOffset.x;
			selectedComponent.y = y - dragOffset.y;
		} else if (isPanning) {
			panX = event.clientX - panStartPos.x;
			panY = event.clientY - panStartPos.y;
		} else {
			// Update hovered pin for visual feedback
			updateHoveredPin(event);
		}
	}
	
	function updateHoveredPin(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = (event.clientX - rect.left - panX) / zoomLevel;
		const y = (event.clientY - rect.top - panY) / zoomLevel;
		
		hoveredPin = null;
		
		for (const component of placedComponents) {
			const pins = generateBasicPins(component);
			for (const pin of pins) {
				const pinX = component.x + pin.x;
				const pinY = component.y + pin.y;
				const distance = Math.sqrt((x - pinX) ** 2 + (y - pinY) ** 2);
				
				if (distance < 12) {
					hoveredPin = { component, pin };
					canvas.style.cursor = 'pointer';
					return;
				}
			}
		}
		
		canvas.style.cursor = isDragging ? 'grabbing' : isPanning ? 'grabbing' : 'grab';
	}
	
	function createConnection(from: { component: PlacedComponent, pin: Pin }, to: { component: PlacedComponent, pin: Pin }) {
		const connection: Connection = {
			id: `connection-${nextConnectionId++}`,
			fromComponent: from.component.id,
			fromPin: from.pin.id,
			toComponent: to.component.id,
			toPin: to.pin.id,
			fromPos: {
				x: from.component.x + from.pin.x,
				y: from.component.y + from.pin.y
			},
			toPos: {
				x: to.component.x + to.pin.x,
				y: to.component.y + to.pin.y
			},
			color: getConnectionColor(from.pin, to.pin)
		};
		
		connections = [...connections, connection];
	}
	
	function getConnectionColor(pin1: Pin, pin2: Pin): string {
		// Color coding based on pin types
		if (pin1.type === 'power' || pin2.type === 'power') return '#ff0000'; // Red for power
		if (pin1.type === 'ground' || pin2.type === 'ground') return '#000000'; // Black for ground
		return '#CABDF5'; // Purple for signal lines
	}
	
	function handleCanvasMouseUp() {
		if (isDragging && selectedComponent) {
			// Update connection positions when component is moved
			updateConnectionPositions(selectedComponent);
		}
		
		isDragging = false;
		isPanning = false;
		// Keep connection state for potential pin-to-pin connections
	}
	
	function updateConnectionPositions(component: PlacedComponent) {
		const pins = generateBasicPins(component);
		
		connections = connections.map(connection => {
			if (connection.fromComponent === component.id) {
				const pin = pins.find(p => p.id === connection.fromPin);
				if (pin) {
					return {
						...connection,
						fromPos: {
							x: component.x + pin.x,
							y: component.y + pin.y
						}
					};
				}
			}
			
			if (connection.toComponent === component.id) {
				const pin = pins.find(p => p.id === connection.toPin);
				if (pin) {
					return {
						...connection,
						toPos: {
							x: component.x + pin.x,
							y: component.y + pin.y
						}
					};
				}
			}
			
			return connection;
		});
	}
	
	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		
		const delta = event.deltaY > 0 ? -ZOOM_SENSITIVITY : ZOOM_SENSITIVITY;
		const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + delta));
		
		if (newZoom !== zoomLevel) {
			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;
			
			const worldX = (mouseX - panX) / zoomLevel;
			const worldY = (mouseY - panY) / zoomLevel;
			
			zoomLevel = newZoom;
			
			panX = mouseX - worldX * zoomLevel;
			panY = mouseY - worldY * zoomLevel;
		}
	}
	
	function clearCanvas() {
		placedComponents = [];
		connections = [];
		selectedComponent = null;
	}
	
	function deleteSelected() {
		if (selectedComponent) {
			placedComponents = placedComponents.filter(c => c.id !== selectedComponent?.id);
			connections = connections.filter(c => 
				c.fromComponent !== selectedComponent?.id && 
				c.toComponent !== selectedComponent?.id
			);
			selectedComponent = null;
		}
	}
	
	function resetView() {
		zoomLevel = 1.0;
		panX = 0;
		panY = 0;
	}
</script>

<div class="playground-container">
	<Sidebar />
	
	<main class="playground-main">
		<div class="playground-header">
			<h1>Circuit Playground</h1>
			<p>Experiment freely with electronic components! Drag components onto the workspace and connect them together.</p>
		</div>
		
		<div class="playground-content">
			<!-- Component Library -->
			<div class="component-library">
				<div class="library-header">
					<h3>Components</h3>
					<select bind:value={selectedCategory} class="category-select">
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
				
				<div class="components-grid">
					{#each filteredComponents as component}
						<div 
							class="component-item"
							draggable="true"
							on:dragstart={(e) => handleDragStart(e, component)}
							title={component.description}
						>
							<img src={component.image} alt={component.name} class="component-image" />
							<span class="component-name">{component.name}</span>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Canvas Area -->
			<div class="canvas-area">
				<div class="canvas-toolbar">
					<div class="toolbar-group">
						<button on:click={clearCanvas} class="toolbar-btn danger">
							Clear All
						</button>
						<button on:click={deleteSelected} class="toolbar-btn" disabled={!selectedComponent}>
							Delete Selected
						</button>
					</div>
					
					<div class="toolbar-info">
						{#if isConnecting}
							<span class="status-text connecting">Creating connection - Click on a pin to connect</span>
						{:else if selectedComponent}
							<span class="status-text selected">Component selected: {selectedComponent.name}</span>
						{:else}
							<span class="status-text">Drag components here • Click pins to connect • Drag components to move</span>
						{/if}
					</div>
					
					<div class="toolbar-group">
						<button on:click={resetView} class="toolbar-btn">
							Reset View
						</button>
						<span class="zoom-level">Zoom: {Math.round(zoomLevel * 100)}%</span>
					</div>
				</div>
				
				<div 
					id="canvas-container" 
					class="canvas-container"
					on:dragover={handleDragOver}
					on:drop={handleDrop}
				>
					<canvas
						on:mousedown={handleCanvasMouseDown}
						on:mousemove={handleCanvasMouseMove}
						on:mouseup={handleCanvasMouseUp}
						on:wheel={handleWheel}
					></canvas>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.playground-container {
		display: flex;
		height: 100vh;
		background-color: #191919;
		font-family: 'Inter', Arial, sans-serif;
		color: #F0F0F0;
	}
	
	.playground-main {
		flex: 1;
		margin-left: 280px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.playground-header {
		padding: 2rem;
		background: #2A2A2A;
		border-bottom: 1px solid #3A3A3A;
	}
	
	.playground-header h1 {
		margin: 0 0 0.5rem 0;
		color: #FFFFFF;
		font-size: 2rem;
		font-weight: 600;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.playground-header p {
		margin: 0;
		color: #B0B0B0;
		font-size: 1rem;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.playground-content {
		flex: 1;
		display: flex;
		gap: 1rem;
		padding: 1rem;
		overflow: hidden;
	}
	
	/* Component Library */
	.component-library {
		width: 300px;
		background: #2A2A2A;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid #3A3A3A;
	}
	
	.library-header {
		padding: 1rem;
		border-bottom: 1px solid #3A3A3A;
		background: #1F1F1F;
	}
	
	.library-header h3 {
		margin: 0 0 1rem 0;
		color: #CABDF5;
		font-size: 1.1rem;
		font-weight: 600;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.category-select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #3A3A3A;
		border-radius: 4px;
		background: #2A2A2A;
		color: #F0F0F0;
		font-size: 0.9rem;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.category-select option {
		background: #2A2A2A;
		color: #F0F0F0;
	}
	
	.components-grid {
		flex: 1;
		padding: 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		overflow-y: auto;
	}
	
	.component-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: #1F1F1F;
		border: 2px solid transparent;
		border-radius: 8px;
		cursor: grab;
		transition: all 0.2s ease;
		text-align: center;
	}
	
	.component-item:hover {
		background: #2A2A2A;
		border-color: #CABDF5;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(202, 189, 245, 0.15);
	}
	
	.component-item:active {
		cursor: grabbing;
		transform: translateY(0);
	}
	
	.component-image {
		width: 60px;
		height: 60px;
		object-fit: contain;
		margin-bottom: 0.5rem;
		filter: brightness(1.1);
	}
	
	.component-name {
		font-size: 0.8rem;
		color: #F0F0F0;
		font-weight: 500;
		line-height: 1.2;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	/* Canvas Area */
	.canvas-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #2A2A2A;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		border: 1px solid #3A3A3A;
	}
	
	.canvas-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #1F1F1F;
		border-bottom: 1px solid #3A3A3A;
		min-height: 60px;
	}
	
	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.toolbar-info {
		flex: 1;
		text-align: center;
		padding: 0 1rem;
	}
	
	.status-text {
		font-size: 0.9rem;
		color: #B0B0B0;
		font-style: italic;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.status-text.connecting {
		color: #CABDF5;
		font-weight: 500;
		animation: pulse 1.5s infinite;
	}
	
	.status-text.selected {
		color: #ECF65F;
		font-weight: 500;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}
	
	.toolbar-btn {
		padding: 0.5rem 1rem;
		background: #CABDF5;
		color: #191919;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.toolbar-btn:hover:not(:disabled) {
		background: #B8A9E8;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(202, 189, 245, 0.3);
	}
	
	.toolbar-btn:disabled {
		background: #3A3A3A;
		color: #666;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
	
	.toolbar-btn.danger {
		background: #ECF65F;
		color: #191919;
	}
	
	.toolbar-btn.danger:hover {
		background: #E8F049;
		box-shadow: 0 2px 8px rgba(236, 246, 95, 0.3);
	}
	
	.zoom-level {
		font-size: 0.9rem;
		color: #B0B0B0;
		padding: 0.5rem;
		font-family: 'Inter', Arial, sans-serif;
	}
	
	.canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
		cursor: grab;
	}
	
	.canvas-container:active {
		cursor: grabbing;
	}
	
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		background: #191919;
	}
	
	/* Responsive Design */
	@media (max-width: 1200px) {
		.component-library {
			width: 250px;
		}
		
		.components-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		}
	}
	
	@media (max-width: 768px) {
		.playground-main {
			margin-left: 0;
		}
		
		.playground-content {
			flex-direction: column;
		}
		
		.component-library {
			width: 100%;
			height: 200px;
		}
		
		.components-grid {
			grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		}
	}
</style>
