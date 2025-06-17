<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { 
		allComponentPins, 
		getComponentPins, 
		ledDimmerConnections,
		type Pin,
		type ComponentPinConfig,
		type ConnectionRule
	} from './CircuitDesignerPins.ts';
	
	const dispatch = createEventDispatcher();
	
	// Props
	export let tutorialComponents: string[] | null = null; // IDs of components to show for tutorial mode
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let selectedComponentId: string | null = null;
	let selectedComponent: PlacedComponent | null = null;
	let connectingFrom: {component: string, pin: string} | null = null;
	
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
		connections: Array<{from: string, to: string}>;
	}

	interface Connection {
		id: string;
		fromComponent: string;
		fromPin: string;
		toComponent: string;
		toPin: string;
		fromPos: {x: number, y: number};
		toPos: {x: number, y: number};
		color: string;
	}

	interface ConnectionStep {
		id: string;
		description: string;
		fromComponent: string;
		fromPin: string;
		toComponent: string;
		toPin: string;
		completed: boolean;
	}
	
	// Available components for the project
	const availableComponents: Component[] = [
		{
			id: 'arduino-leonardo',
			name: 'Arduino Leonardo',
			image: '/components/leonardoKeyestudio.png',
			category: 'Microcontroller',
			width: 100,
			height: 80,
			description: 'Main development board with USB connectivity'
		},
		{
			id: 'breadboard',
			name: 'Breadboard',
			image: '/components/breadboard.png',
			category: 'Prototyping',
			width: 120,
			height: 60,
			description: 'Solderless prototyping board'
		},
		{
			id: 'led',
			name: 'LED',
			image: '/components/leuchtdiode.png',
			category: 'Output',
			width: 40,
			height: 40,
			description: 'Light-emitting diode for visual feedback'
		},
		{
			id: 'potentiometer',
			name: 'Potentiometer',
			image: '/components/poti.png',
			category: 'Input',
			width: 50,
			height: 50,
			description: 'Variable resistor for analog input'
		},
		{
			id: 'pushbutton',
			name: 'Push Button',
			image: '/components/pushbutton.png',
			category: 'Input',
			width: 40,
			height: 40,
			description: 'Momentary switch for user input'
		},
		{
			id: 'resistor',
			name: 'Resistor',
			image: '/components/widerstand.png',
			category: 'Passive',
			width: 60,
			height: 20,
			description: 'Current limiting resistor'
		},
		{
			id: 'jumper-cable',
			name: 'Jumper Cable',
			image: '/components/jumpercable.png',
			category: 'Connection',
			width: 80,
			height: 10,
			description: 'Wire for connections between components'
		},
		{
			id: '5v-motor',
			name: '5V Motor',
			image: '/components/5vMotor.png',
			category: 'Output',
			width: 60,
			height: 60,
			description: 'Small DC motor for movement'
		},
		{
			id: 'arduino-micro',
			name: 'Arduino Micro',
			image: '/components/arduinomicro.png',
			category: 'Microcontroller',
			width: 80,
			height: 60,
			description: 'Compact Arduino board'
		}	];

	// Tutorial connection steps
	const tutorialConnectionSteps: ConnectionStep[] = [
		{
			id: 'power-connections',
			description: 'Verbinde 5V und GND vom Arduino mit dem Breadboard',
			fromComponent: 'arduino-leonardo',
			fromPin: '5V',
			toComponent: 'breadboard',
			toPin: 'Power+',
			completed: false
		},
		{
			id: 'pot-power',
			description: 'Verbinde Potentiometer VCC mit 5V Schiene',
			fromComponent: 'breadboard',
			fromPin: 'Power+',
			toComponent: 'potentiometer',
			toPin: 'VCC',
			completed: false
		},
		{
			id: 'pot-ground',
			description: 'Verbinde Potentiometer GND mit Ground Schiene',
			fromComponent: 'breadboard',
			fromPin: 'Power-',
			toComponent: 'potentiometer',
			toPin: 'GND',
			completed: false
		},
		{
			id: 'pot-signal',
			description: 'Verbinde Potentiometer Wiper mit Arduino A0',
			fromComponent: 'potentiometer',
			fromPin: 'Wiper',
			toComponent: 'arduino-leonardo',
			toPin: 'A0',
			completed: false
		},
		{
			id: 'led-resistor',
			description: 'Verbinde LED Anode mit Widerstand',
			fromComponent: 'led',
			fromPin: 'Anode',
			toComponent: 'resistor',
			toPin: 'Pin1',
			completed: false
		},
		{
			id: 'resistor-arduino',
			description: 'Verbinde Widerstand mit Arduino Pin 9 (PWM)',
			fromComponent: 'resistor',
			fromPin: 'Pin2',
			toComponent: 'arduino-leonardo',
			toPin: 'D9',
			completed: false
		},
		{
			id: 'led-ground',
			description: 'Verbinde LED Cathode mit Ground',
			fromComponent: 'led',
			fromPin: 'Cathode',
			toComponent: 'breadboard',
			toPin: 'Power-',
			completed: false
		}
	];

	let placedComponents: PlacedComponent[] = [];
	let connections: Connection[] = [];
	let connectionSteps = [...tutorialConnectionSteps];
	let currentConnectionStep = 0;
	let selectedComponent: PlacedComponent | null = null;
	let isDragging = false;
	let dragOffset = {x: 0, y: 0};
	let componentImages: Map<string, HTMLImageElement> = new Map();
	let gridSize = 20;
	let snapToGrid = true;
	
	// Connection/Wiring state
	let isDraggingConnection = false;
	let connectionStart: {component: PlacedComponent, pin: {name: string, x: number, y: number}} | null = null;
	let mousePos = {x: 0, y: 0};
	let highlightedPin: {component: PlacedComponent, pin: {name: string, x: number, y: number}} | null = null;
	
	// Component categories for filtering
	const categories = [...new Set(availableComponents.map(c => c.category))];
	let selectedCategory = 'All';
	
	// Snap position to grid
	function snapToGridPosition(x: number, y: number) {
		if (!snapToGrid) return {x, y};
		return {
			x: Math.round(x / gridSize) * gridSize,
			y: Math.round(y / gridSize) * gridSize
		};
	}
	
	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d')!;
			resizeCanvas();
			
			// Load component images
			loadComponentImages();
			
			// Add event listeners
			canvas.addEventListener('mousedown', handleMouseDown);
			canvas.addEventListener('mousemove', handleMouseMove);
			canvas.addEventListener('mouseup', handleMouseUp);
			canvas.addEventListener('click', handleClick);
			
			// Keyboard event listeners
			window.addEventListener('keydown', handleKeydown);
			
			// Handle window resize
			const handleResize = () => {
				resizeCanvas();
				drawBoard();
			};
			window.addEventListener('resize', handleResize);
			
			return () => {
				if (canvas) {
					canvas.removeEventListener('mousedown', handleMouseDown);
					canvas.removeEventListener('mousemove', handleMouseMove);
					canvas.removeEventListener('mouseup', handleMouseUp);
					canvas.removeEventListener('click', handleClick);
				}
				window.removeEventListener('keydown', handleKeydown);
				window.removeEventListener('resize', handleResize);
			};
		}
	});
	
	function resizeCanvas() {
		const container = canvas.parentElement;
		if (container) {
			canvas.width = container.offsetWidth;
			canvas.height = container.offsetHeight;
		}
	}
	
	function loadComponentImages() {
		availableComponents.forEach(component => {
			const img = new Image();
			img.src = component.image;
			img.onload = () => {
				componentImages.set(component.id, img);
				drawBoard();
			};
		});
	}
	
	function generatePins(component: PlacedComponent): Array<{name: string, x: number, y: number}> {
		switch(component.componentId) {
			case 'arduino-leonardo':
			case 'arduino-micro':
				return [
					{name: 'VCC', x: component.x + component.width, y: component.y + 10},
					{name: 'GND', x: component.x + component.width, y: component.y + 30},
					{name: 'A0', x: component.x + component.width, y: component.y + 50},
					{name: 'D9', x: component.x + component.width, y: component.y + 70}
				];
			case 'led':
				return [
					{name: 'Anode', x: component.x, y: component.y + component.height/2},
					{name: 'Cathode', x: component.x + component.width, y: component.y + component.height/2}
				];
			case 'potentiometer':
				return [
					{name: 'VCC', x: component.x + component.width/2, y: component.y},
					{name: 'GND', x: component.x, y: component.y + component.height},
					{name: 'Wiper', x: component.x + component.width, y: component.y + component.height}
				];
			case 'pushbutton':
				return [
					{name: 'Pin1', x: component.x, y: component.y + component.height/2},
					{name: 'Pin2', x: component.x + component.width, y: component.y + component.height/2}
				];
			case '5v-motor':
				return [
					{name: '+', x: component.x + component.width/4, y: component.y},
					{name: '-', x: component.x + 3*component.width/4, y: component.y}
				];
			default:
				return [
					{name: 'Pin1', x: component.x, y: component.y + component.height/2},
					{name: 'Pin2', x: component.x + component.width, y: component.y + component.height/2}
				];
		}
	}
	
	function addComponentToBoard(componentId: string) {
		const componentTemplate = availableComponents.find(c => c.id === componentId);
		if (!componentTemplate) return;
		
		// Calculate center position with some randomization
		const centerX = canvas.width / 2 - componentTemplate.width / 2;
		const centerY = canvas.height / 2 - componentTemplate.height / 2;
		const randomOffsetX = (Math.random() - 0.5) * 100;
		const randomOffsetY = (Math.random() - 0.5) * 100;
		
		const position = snapToGridPosition(
			centerX + randomOffsetX,
			centerY + randomOffsetY
		);
		
		const newComponent: PlacedComponent = {
			id: `${componentId}-${Date.now()}`,
			componentId: componentTemplate.id,
			x: position.x,
			y: position.y,
			width: componentTemplate.width,
			height: componentTemplate.height,
			name: componentTemplate.name,
			image: componentTemplate.image,
			pins: [],
			connections: []
		};
		
		newComponent.pins = generatePins(newComponent);
		placedComponents.push(newComponent);
		drawBoard();
		
		// Auto-select the newly added component
		selectedComponent = newComponent;
	}
	
	function drawBoard() {
		if (!ctx) return;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw grid
		drawGrid();
		
		// Draw placed components
		placedComponents.forEach(component => {
			drawComponent(component);
		});
		
		// Draw connections (in both tutorial and normal mode)
		drawConnections();
	}
	
	function drawGrid() {
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
		ctx.lineWidth = 1;
		
		// Major grid lines every 100px
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
		for (let x = 0; x < canvas.width; x += gridSize * 5) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}
		
		for (let y = 0; y < canvas.height; y += gridSize * 5) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
		
		// Minor grid lines
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
		for (let x = 0; x < canvas.width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}
		
		for (let y = 0; y < canvas.height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
	}
	
	function drawComponent(component: PlacedComponent) {
		// Enhanced component rendering with better quality
		
		// Draw component image if loaded (without white background)
		const img = componentImages.get(component.componentId);
		if (img) {
			// Save context state
			ctx.save();
			
			// Draw component with improved rendering quality
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			
			// Optional: Remove white background using composite operation
			ctx.globalCompositeOperation = 'multiply';
			ctx.drawImage(img, component.x, component.y, component.width, component.height);
			ctx.globalCompositeOperation = 'source-over';
			
			// Restore context state
			ctx.restore();
		} else {
			// Fallback rectangle with pattern (no white background)
			const gradient = ctx.createLinearGradient(component.x, component.y, component.x + component.width, component.y + component.height);
			gradient.addColorStop(0, 'rgba(0, 212, 170, 0.2)');
			gradient.addColorStop(1, 'rgba(0, 212, 170, 0.1)');
			ctx.fillStyle = gradient;
			ctx.fillRect(component.x, component.y, component.width, component.height);
		}
		
		// Draw component border with selection highlight
		if (selectedComponent?.id === component.id) {
			ctx.strokeStyle = '#00d4aa';
			ctx.lineWidth = 3;
			ctx.setLineDash([5, 5]);
		} else {
			ctx.strokeStyle = 'rgba(0, 212, 170, 0.4)';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
		}
		ctx.strokeRect(component.x - 2, component.y - 2, component.width + 4, component.height + 4);
		ctx.setLineDash([]);

		// Draw pins (in tutorial mode show all pins, in normal mode show pins when component is selected or when dragging connection)
		if (tutorialComponents || selectedComponent?.id === component.id || isDraggingConnection) {
			component.pins.forEach((pin, index) => {
				// Check if this pin should be highlighted
				const isHighlighted = highlightedPin && 
					highlightedPin.component.id === component.id && 
					highlightedPin.pin.name === pin.name;
				
				// Pin background circle (larger for highlighted pins)
				const pinRadius = isHighlighted ? 10 : 8;
				ctx.fillStyle = isHighlighted ? '#fbbf24' : '#1e293b';
				ctx.beginPath();
				ctx.arc(pin.x, pin.y, pinRadius, 0, 2 * Math.PI);
				ctx.fill();
				
				// Pin circle with connection state highlighting
				const isCurrentStepPin = isCurrentStepRelatedPin(component, pin);
				if (isHighlighted) {
					ctx.fillStyle = '#fbbf24'; // Bright yellow for highlighted target
				} else if (isCurrentStepPin) {
					ctx.fillStyle = '#fbbf24'; // Highlight current step pins
				} else if (selectedComponent?.id === component.id) {
					ctx.fillStyle = '#00d4aa';
				} else {
					ctx.fillStyle = '#64748b';
				}
				ctx.beginPath();
				ctx.arc(pin.x, pin.y, pinRadius - 2, 0, 2 * Math.PI);
				ctx.fill();
				
				// Pin border (thicker for highlighted)
				ctx.strokeStyle = isHighlighted ? '#fbbf24' : '#ffffff';
				ctx.lineWidth = isHighlighted ? 3 : 2;
				ctx.stroke();
				
				// Pulsing effect for highlighted pin
				if (isHighlighted) {
					const time = Date.now() * 0.005;
					const pulseRadius = pinRadius + Math.sin(time) * 3;
					ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(pin.x, pin.y, pulseRadius, 0, 2 * Math.PI);
					ctx.stroke();
				}
				
				// Pin label with better positioning (only pin names)
				ctx.fillStyle = '#ffffff';
				ctx.font = 'bold 10px IBM Plex Mono';
				ctx.textAlign = 'center';
				
				// Position label based on pin location relative to component
				let labelX = pin.x;
				let labelY = pin.y - 15;
				
				// Adjust label position for better readability
				if (pin.x <= component.x + 15) { // Left side pin
					labelX = pin.x - 20;
					ctx.textAlign = 'right';
				} else if (pin.x >= component.x + component.width - 15) { // Right side pin
					labelX = pin.x + 20;
					ctx.textAlign = 'left';
				}
				
				// Label background for better visibility
				const labelWidth = ctx.measureText(pin.name).width;
				const bgX = labelX - (ctx.textAlign === 'center' ? labelWidth/2 : ctx.textAlign === 'right' ? labelWidth : 0) - 3;
				ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
				ctx.fillRect(bgX, labelY - 12, labelWidth + 6, 14);
				
				// Label text (highlighted if this is the target pin)
				ctx.fillStyle = isHighlighted ? '#fbbf24' : (isCurrentStepPin ? '#fbbf24' : '#00d4aa');
				ctx.fillText(pin.name, labelX, labelY);
			});
		}
	}
	
	// Helper function to check if a pin is related to current connection step
	function isCurrentStepRelatedPin(component: PlacedComponent, pin: {name: string, x: number, y: number}): boolean {
		if (!tutorialComponents || currentConnectionStep >= connectionSteps.length) return false;
		
		const step = connectionSteps[currentConnectionStep];
		return (
			(component.componentId === step.fromComponent && pin.name === step.fromPin) ||
			(component.componentId === step.toComponent && pin.name === step.toPin)
		);
	}
	
	// Draw connections between pins
	function drawConnections() {
		connections.forEach(connection => {
			ctx.strokeStyle = '#00d4aa';
			ctx.lineWidth = 3;
			ctx.setLineDash([]);
			
			ctx.beginPath();
			ctx.moveTo(connection.fromPos.x, connection.fromPos.y);
			ctx.lineTo(connection.toPos.x, connection.toPos.y);
			ctx.stroke();
			
			// Draw connection endpoints
			ctx.fillStyle = '#00d4aa';
			ctx.beginPath();
			ctx.arc(connection.fromPos.x, connection.fromPos.y, 4, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(connection.toPos.x, connection.toPos.y, 4, 0, 2 * Math.PI);
			ctx.fill();
		});
		
		// Draw active connection being dragged with better visual feedback
		if (isDraggingConnection && connectionStart) {
			// Gradient line effect
			const gradient = ctx.createLinearGradient(
				connectionStart.pin.x, connectionStart.pin.y, 
				mousePos.x, mousePos.y
			);
			gradient.addColorStop(0, '#00d4aa');
			gradient.addColorStop(1, highlightedPin ? '#10b981' : '#fbbf24');
			
			ctx.strokeStyle = gradient;
			ctx.lineWidth = highlightedPin ? 5 : 4;
			ctx.setLineDash(highlightedPin ? [10, 2] : [8, 4]);
			
			ctx.beginPath();
			ctx.moveTo(connectionStart.pin.x, connectionStart.pin.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
			ctx.setLineDash([]);
			
			// Draw starting point with pulsing effect
			const time = Date.now() * 0.008;
			const pulseRadius = 6 + Math.sin(time) * 2;
			ctx.fillStyle = '#00d4aa';
			ctx.beginPath();
			ctx.arc(connectionStart.pin.x, connectionStart.pin.y, pulseRadius, 0, 2 * Math.PI);
			ctx.fill();
			
			// Draw target point if snapped to a pin
			if (highlightedPin) {
				const targetPulseRadius = 8 + Math.sin(time * 1.2) * 3;
				ctx.fillStyle = '#10b981';
				ctx.beginPath();
				ctx.arc(mousePos.x, mousePos.y, targetPulseRadius, 0, 2 * Math.PI);
				ctx.fill();
				
				// Draw snap indicator ring
				ctx.strokeStyle = '#10b981';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(mousePos.x, mousePos.y, targetPulseRadius + 8, 0, 2 * Math.PI);
				ctx.stroke();
			}
		}
	}
	
	// Get pin at specific coordinates with improved snapping
	function getPinAt(x: number, y: number): {component: PlacedComponent, pin: {name: string, x: number, y: number}} | null {
		for (const component of placedComponents) {
			for (const pin of component.pins) {
				const distance = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
				if (distance <= 15) { // Increased hit radius for better usability
					return { component, pin };
				}
			}
		}
		return null;
	}
	
	// Get nearest pin for snapping (within snapping distance)
	function getNearestSnapPin(x: number, y: number, maxDistance: number = 30): {component: PlacedComponent, pin: {name: string, x: number, y: number}} | null {
		let nearestPin = null;
		let minDistance = maxDistance;
		
		for (const component of placedComponents) {
			for (const pin of component.pins) {
				const distance = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
				if (distance < minDistance) {
					minDistance = distance;
					nearestPin = { component, pin };
				}
			}
		}
		
		return nearestPin;
	}
	
	// Complete a connection step
	function completeConnectionStep(fromComponent: PlacedComponent, fromPin: {name: string, x: number, y: number}, 
									toComponent: PlacedComponent, toPin: {name: string, x: number, y: number}) {
		// Check if this matches current step
		const step = connectionSteps[currentConnectionStep];
		if (step && 
			((fromComponent.componentId === step.fromComponent && fromPin.name === step.fromPin &&
			  toComponent.componentId === step.toComponent && toPin.name === step.toPin) ||
			 (fromComponent.componentId === step.toComponent && fromPin.name === step.toPin &&
			  toComponent.componentId === step.fromComponent && toPin.name === step.fromPin))) {
			
			// Mark step as completed
			connectionSteps[currentConnectionStep].completed = true;
			
			// Add connection
			const connection: Connection = {
				id: `conn-${Date.now()}`,
				fromComponent: fromComponent.id,
				fromPin: fromPin.name,
				toComponent: toComponent.id,
				toPin: toPin.name,
				fromPos: { x: fromPin.x, y: fromPin.y },
				toPos: { x: toPin.x, y: toPin.y }
			};
			connections.push(connection);
			
			// Move to next step
			currentConnectionStep++;
			
			drawBoard();
			return true;
		}
		return false;
	}
	
	function getComponentAt(x: number, y: number): PlacedComponent | null {
		return placedComponents.find(component => 
			x >= component.x && x <= component.x + component.width &&
			y >= component.y && y <= component.y + component.height
		) || null;
	}
		function handleMouseDown(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		// Check if clicking on a pin for connection (works in both tutorial and normal mode)
		let pinHit = getPinAt(x, y);
		
		// If no direct hit, try snapping to nearest pin
		if (!pinHit) {
			pinHit = getNearestSnapPin(x, y, 25);
		}
		
		if (pinHit) {
			if (!isDraggingConnection) {
				// Start a new connection
				connectionStart = pinHit;
				isDraggingConnection = true;
				mousePos = { x: pinHit.pin.x, y: pinHit.pin.y }; // Start from pin position
				canvas.style.cursor = 'crosshair';
				return;
			} else if (connectionStart && pinHit.component.id !== connectionStart.component.id) {
				// Complete connection
				if (tutorialComponents) {
					// Tutorial mode: use step validation
					const success = completeConnectionStep(
						connectionStart.component, 
						connectionStart.pin,
						pinHit.component, 
						pinHit.pin
					);
					
					if (success) {
						console.log('Connection completed successfully!');
					} else {
						console.log('Connection does not match current step.');
					}
				} else {
					// Normal mode: allow any connection
					const connection: Connection = {
						id: `conn-${Date.now()}`,
						fromComponent: connectionStart.component.id,
						fromPin: connectionStart.pin.name,
						toComponent: pinHit.component.id,
						toPin: pinHit.pin.name,
						fromPos: { x: connectionStart.pin.x, y: connectionStart.pin.y },
						toPos: { x: pinHit.pin.x, y: pinHit.pin.y }
					};
					connections.push(connection);
					console.log('Free connection created!');
				}
				
				isDraggingConnection = false;
				connectionStart = null;
				highlightedPin = null;
				canvas.style.cursor = 'default';
				drawBoard();
				return;
			}
		}

		selectedComponent = getComponentAt(x, y);
		if (selectedComponent) {
			isDragging = true;
			dragOffset.x = x - selectedComponent.x;
			dragOffset.y = y - selectedComponent.y;
			canvas.style.cursor = 'grabbing';
		}
		drawBoard();
	}
		function handleMouseMove(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		// Update mouse position for connection dragging
		mousePos = { x, y };

		if (isDragging && selectedComponent) {
			selectedComponent.x = x - dragOffset.x;
			selectedComponent.y = y - dragOffset.y;
			
			// Update pin positions
			selectedComponent.pins = generatePins(selectedComponent);
			
			drawBoard();
		} else if (isDraggingConnection) {
			// Enhanced target pin highlighting with snapping (works in both modes)
			if (connectionStart) {
				// First try to get exact pin hit
				let targetPin = getPinAt(x, y);
				
				// If no direct hit, try snapping to nearest pin
				if (!targetPin) {
					const snapPin = getNearestSnapPin(x, y, 40);
					if (snapPin && snapPin.component.id !== connectionStart.component.id) {
						targetPin = snapPin;
						// Update mouse position to snap to the pin
						mousePos = { x: snapPin.pin.x, y: snapPin.pin.y };
					}
				}
				
				if (targetPin && targetPin.component.id !== connectionStart.component.id) {
					if (tutorialComponents) {
						// Tutorial mode: check if this matches the current step
						const step = connectionSteps[currentConnectionStep];
						if (step && 
							((targetPin.component.componentId === step.toComponent && targetPin.pin.name === step.toPin) ||
							 (targetPin.component.componentId === step.fromComponent && targetPin.pin.name === step.fromPin))) {
							highlightedPin = targetPin;
							canvas.style.cursor = 'crosshair';
						} else {
							highlightedPin = null;
							canvas.style.cursor = 'not-allowed';
						}
					} else {
						// Normal mode: allow any valid pin connection
						highlightedPin = targetPin;
						canvas.style.cursor = 'crosshair';
					}
				} else {
					highlightedPin = null;
					canvas.style.cursor = 'crosshair';
				}
			}
			
			// Update connection preview
			drawBoard();
		} else {
			// Reset highlighted pin when not dragging
			highlightedPin = null;
			
			// Update cursor based on what's under mouse
			const pinHit = getPinAt(x, y);
			if (pinHit) {
				canvas.style.cursor = 'crosshair';
			} else {
				const componentUnderMouse = getComponentAt(x, y);
				canvas.style.cursor = componentUnderMouse ? 'grab' : 'default';
			}
		}
	}
	
	
	function handleMouseUp() {
		if (isDragging && selectedComponent) {
			// Final snap to grid when dropping
			const snappedPosition = snapToGridPosition(selectedComponent.x, selectedComponent.y);
			selectedComponent.x = snappedPosition.x;
			selectedComponent.y = snappedPosition.y;
			selectedComponent.pins = generatePins(selectedComponent);
			drawBoard();
		}
		
		// Cancel connection dragging on mouse up without hitting a pin
		if (isDraggingConnection) {
			isDraggingConnection = false;
			connectionStart = null;
			highlightedPin = null; // Clear highlighted pin
		}
		
		isDragging = false;
		canvas.style.cursor = 'default';
	}
	
	function handleClick(event: MouseEvent) {
		if (isDragging) return;
		
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const clickedComponent = getComponentAt(x, y);
		if (clickedComponent) {
			selectedComponent = selectedComponent?.id === clickedComponent.id ? null : clickedComponent;
			drawBoard();
		} else {
			selectedComponent = null;
			drawBoard();
		}
	}
	
	function clearBoard() {
		placedComponents = [];
		selectedComponent = null;
		drawBoard();
	}
	
	function exportBoard() {
		// Create a temporary canvas with white background for export
		const exportCanvas = document.createElement('canvas');
		exportCanvas.width = canvas.width;
		exportCanvas.height = canvas.height;
		const exportCtx = exportCanvas.getContext('2d')!;
		
		// White background
		exportCtx.fillStyle = '#ffffff';
		exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
		
		// Copy circuit board content
		exportCtx.drawImage(canvas, 0, 0);
		
		// Download
		const link = document.createElement('a');
		link.download = `circuit-design-${new Date().toISOString().split('T')[0]}.png`;
		link.href = exportCanvas.toDataURL();
		link.click();
	}
	
	function toggleGridSnap() {
		snapToGrid = !snapToGrid;
	}
	
	// Keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Delete' && selectedComponent) {
			placedComponents = placedComponents.filter(c => c.id !== selectedComponent?.id);
			selectedComponent = null;
			drawBoard();
		} else if (event.key === 'Escape') {
			selectedComponent = null;
			drawBoard();
		} else if (event.ctrlKey || event.metaKey) {
			if (event.key === 's') {
				event.preventDefault();
				exportBoard();
			}
		}
	}
	
	// Filter components by category
	$: filteredComponents = tutorialComponents 
		? availableComponents.filter(c => tutorialComponents.includes(c.id))
		: selectedCategory === 'All' 
			? availableComponents 
			: availableComponents.filter(c => c.category === selectedCategory);
	
	function exitFullscreen() {
		dispatch('exit');
	}
</script>

<div class="fullscreen-designer">
	<!-- Left Sidebar: Components -->
	<aside class="components-sidebar">
		<div class="sidebar-header">
			<button class="back-btn" on:click={exitFullscreen}>
				← Back to Chat
			</button>
			<h2>{tutorialComponents ? 'Tutorial Circuit Designer' : 'Circuit Designer'}</h2>
			{#if tutorialComponents}
				<p class="tutorial-note">🎯 Tutorial-Modus aktiv: Verwende nur die verfügbaren Komponenten und folge den Verbindungsschritten.</p>
			{/if}
		</div>
		
		<!-- Category Filter -->
		<div class="category-filter">
			<select bind:value={selectedCategory}>
				<option value="All">All Components</option>
				{#each categories as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</div>
		
		<!-- Components Grid -->
		<div class="components-grid">
			{#each filteredComponents as component}
				<div 
					class="component-card"
					class:selected={selectedComponentId === component.id}
					on:click={() => addComponentToBoard(component.id)}
					draggable="true"
				>
					<div class="component-image">
						<img src={component.image} alt={component.name} />
					</div>
					<div class="component-info">
						<h4>{component.name}</h4>
						<p class="category">{component.category}</p>
						<p class="description">{component.description}</p>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Tools -->
		<div class="tools-section">
			<h3>Tools</h3>
			<button class="tool-btn" on:click={clearBoard}>
				🗑️ Clear Board
			</button>
			<button class="tool-btn" on:click={toggleGridSnap}>
				{snapToGrid ? '📐' : '🎯'} Grid: {snapToGrid ? 'ON' : 'OFF'}
			</button>
			<button class="tool-btn" on:click={exportBoard}>
				💾 Export PNG
			</button>
		</div>
		
		<!-- Component Info -->
		{#if selectedComponent}
			<div class="selected-component-info">
				<h3>Selected Component</h3>
				<h4>{selectedComponent.name}</h4>
				<div class="component-details">
					<div class="detail-row">
						<span>Position:</span>
						<span>{selectedComponent.x}, {selectedComponent.y}</span>
					</div>
					<div class="detail-row">
						<span>Pins:</span>
						<span>{selectedComponent.pins.length}</span>
					</div>
				</div>
				<div class="pin-list">
					{#each selectedComponent.pins as pin}
						<div class="pin-item">
							<span class="pin-name">{pin.name}</span>
							<span class="pin-pos">({pin.x}, {pin.y})</span>
						</div>
					{/each}
				</div>
				<button class="delete-btn" on:click={() => {
					placedComponents = placedComponents.filter(c => c.id !== selectedComponent?.id);
					selectedComponent = null;
					drawBoard();
				}}>
					Delete Component
				</button>
			</div>
		{/if}
	</aside>
	
	<!-- Main Canvas Area -->
	<main class="canvas-area">
		<div class="canvas-header">
			<h1>Interactive Circuit Board</h1>
			<div class="canvas-stats">
				<span>{placedComponents.length} components placed</span>
				{#if selectedComponent}
					<span>• {selectedComponent.name} selected</span>
				{/if}
			</div>
		</div>
		
		<div class="canvas-container">
			<canvas bind:this={canvas} class="circuit-canvas"></canvas>
			
			<!-- Tutorial Connection Steps Panel (Top Right) -->
			{#if tutorialComponents}
				<div class="connection-steps-panel">
					<div class="steps-header">
						<h3>Verbindungsschritte</h3>
						<div class="progress">
							{currentConnectionStep} / {connectionSteps.length}
						</div>
					</div>
					
					<div class="current-step">
						{#if currentConnectionStep < connectionSteps.length}
							<div class="step-instruction">
								<div class="step-number">Schritt {currentConnectionStep + 1}</div>
								<div class="step-description">
									{connectionSteps[currentConnectionStep].description}
								</div>
								<div class="step-details">
									<span class="from-pin">{connectionSteps[currentConnectionStep].fromComponent}.{connectionSteps[currentConnectionStep].fromPin}</span>
									<span class="arrow">→</span>
									<span class="to-pin">{connectionSteps[currentConnectionStep].toComponent}.{connectionSteps[currentConnectionStep].toPin}</span>
								</div>
							</div>
						{:else}
							<div class="completion-message">
								<div class="success-icon">✅</div>
								<div class="success-text">Alle Verbindungen abgeschlossen!</div>
							</div>
						{/if}
					</div>
					
					<div class="completed-steps">
						{#each connectionSteps.slice(0, currentConnectionStep) as step, index}
							<div class="completed-step">
								<span class="check">✓</span>
								<span class="step-text">{step.description}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			{#if placedComponents.length === 0}
				<div class="empty-state">
					<h3>Start Building Your Circuit</h3>
					<p>Click components from the sidebar to add them to your board</p>
					<div class="shortcuts">
						<div class="shortcut-item">
							<kbd>Click</kbd> Select component
						</div>
						<div class="shortcut-item">
							<kbd>Drag</kbd> Move component
						</div>
						<div class="shortcut-item">
							<kbd>Del</kbd> Delete selected
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	.fullscreen-designer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		display: flex;
		z-index: 1000;
	}
	
	/* Components Sidebar */
	.components-sidebar {
		width: 320px;
		background: rgba(15, 23, 42, 0.95);
		border-right: 1px solid rgba(0, 212, 170, 0.3);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}
	
	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.back-btn {
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 8px;
		color: #00d4aa;
		padding: 0.5rem 1rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-bottom: 1rem;
		width: 100%;
	}
	
	.back-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		transform: translateY(-1px);
	}
	
	.sidebar-header h2 {
		margin: 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
	}
	
	.tutorial-note {
		margin: 0.75rem 0 0 0;
		color: #fbbf24;
		font-size: 0.8rem;
		line-height: 1.4;
		padding: 0.75rem;
		background: rgba(251, 191, 36, 0.1);
		border: 1px solid rgba(251, 191, 36, 0.3);
		border-radius: 6px;
	}
	
	.category-filter {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.category-filter select {
		width: 100%;
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.875rem;
	}
	
	.components-grid {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.component-card {
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	
	.component-card:hover {
		background: rgba(0, 212, 170, 0.1);
		border-color: rgba(0, 212, 170, 0.4);
		transform: translateY(-2px);
	}
	
	.component-card.selected {
		background: rgba(0, 212, 170, 0.15);
		border-color: #00d4aa;
	}
	
	.component-image {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(30, 41, 59, 0.4);
		border-radius: 6px;
		border: 2px solid rgba(0, 212, 170, 0.3);
		position: relative;
		overflow: hidden;
	}
	
	.component-image img {
		max-width: 40px;
		max-height: 40px;
		object-fit: contain;
		mix-blend-mode: multiply;
		filter: brightness(1.2) contrast(1.1);
	}
	
	.component-info {
		flex: 1;
		min-width: 0;
	}
	
	.component-info h4 {
		margin: 0 0 0.25rem 0;
		color: #e2e8f0;
		font-size: 0.9rem;
		font-weight: 600;
	}
	
	.component-info .category {
		margin: 0 0 0.25rem 0;
		color: #00d4aa;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
	}
	
	.component-info .description {
		margin: 0;
		color: #94a3b8;
		font-size: 0.75rem;
		line-height: 1.3;
	}
	
	.tools-section {
		padding: 1.5rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.tools-section h3 {
		margin: 0 0 1rem 0;
		color: #00d4aa;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.tool-btn {
		width: 100%;
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.75rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-bottom: 0.5rem;
		text-align: left;
	}
	
	.tool-btn:hover {
		background: rgba(0, 212, 170, 0.1);
		border-color: rgba(0, 212, 170, 0.5);
	}
	
	.selected-component-info {
		padding: 1.5rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
		background: rgba(0, 0, 0, 0.2);
	}
	
	.selected-component-info h3 {
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.selected-component-info h4 {
		margin: 0 0 1rem 0;
		color: #e2e8f0;
		font-size: 1.1rem;
	}
	
	.component-details {
		margin-bottom: 1rem;
	}
	
	.detail-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
	}
	
	.detail-row span:first-child {
		color: #94a3b8;
	}
	
	.detail-row span:last-child {
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
	}
	
	.pin-list {
		max-height: 120px;
		overflow-y: auto;
		margin-bottom: 1rem;
		border: 1px solid rgba(0, 212, 170, 0.1);
		border-radius: 6px;
		padding: 0.5rem;
	}
	
	.pin-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0;
		font-size: 0.75rem;
	}
	
	.pin-name {
		color: #00d4aa;
		font-weight: 500;
	}
	
	.pin-pos {
		color: #64748b;
		font-family: 'IBM Plex Mono', monospace;
	}
	
	.delete-btn {
		width: 100%;
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		color: #f87171;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}
	
	/* Main Canvas Area */
	.canvas-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	
	.canvas-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		background: rgba(15, 23, 42, 0.8);
		backdrop-filter: blur(8px);
	}
	
	.canvas-header h1 {
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.75rem;
		font-weight: 600;
	}
	
	.canvas-stats {
		color: #94a3b8;
		font-size: 0.875rem;
	}
	
	.canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}
	
	/* Tutorial Connection Steps Panel */
	.connection-steps-panel {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 320px;
		max-height: 400px;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		overflow: hidden;
		z-index: 100;
	}
	
	.steps-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.steps-header h3 {
		margin: 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
	}
	
	.progress {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.current-step {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.step-instruction {
		text-align: center;
	}
	
	.step-number {
		color: #fbbf24;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	
	.step-description {
		color: #e2e8f0;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		line-height: 1.4;
	}
	
	.step-details {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
	}
	
	.from-pin, .to-pin {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid rgba(0, 212, 170, 0.3);
	}
	
	.arrow {
		color: #fbbf24;
		font-weight: bold;
	}
	
	.completion-message {
		text-align: center;
		padding: 1rem 0;
	}
	
	.success-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}
	
	.success-text {
		color: #10b981;
		font-weight: 600;
		font-size: 1.1rem;
	}
	
	.completed-steps {
		padding: 1rem 1.5rem;
		max-height: 200px;
		overflow-y: auto;
	}
	
	.completed-step {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(100, 116, 139, 0.1);
		font-size: 0.8rem;
	}
	
	.completed-step:last-child {
		border-bottom: none;
	}
	
	.check {
		color: #10b981;
		font-weight: bold;
		flex-shrink: 0;
	}
	
	.step-text {
		color: #94a3b8;
		flex: 1;
	}
	
	.circuit-canvas {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		cursor: default;
	}
	
	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: #64748b;
		pointer-events: none;
	}
	
	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.5rem;
		color: #94a3b8;
	}
	
	.empty-state p {
		margin: 0 0 1.5rem 0;
		font-size: 1rem;
	}
	
	.shortcuts {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	
	.shortcut-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #94a3b8;
	}
	
	kbd {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 4px;
		padding: 0.3rem 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		color: #00d4aa;
	}
</style>
