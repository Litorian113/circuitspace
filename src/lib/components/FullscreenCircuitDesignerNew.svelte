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
	} from './CircuitDesignerPins';
	
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

	// State variables
	let placedComponents: PlacedComponent[] = [];
	let connections: Connection[] = [];
	let draggedComponent: Component | null = null;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let selectedCategory = 'All';
	let showPinDetails = false;
	let hoveredPin: {component: string, pin: string} | null = null;
	let isDraggingConnection = false;
	let connectionStart: {component: PlacedComponent, pin: Pin} | null = null;
	let mousePos = {x: 0, y: 0};
	let highlightedPin: {component: PlacedComponent, pin: Pin} | null = null;

	// Zoom und Pan State
	let zoomLevel = 1.0;
	let panX = 0;
	let panY = 0;
	let isPanning = false;
	let panStartPos = { x: 0, y: 0 };
	let lastPanPos = { x: 0, y: 0 };
	
	// Zoom Limits
	const MIN_ZOOM = 0.1;
	const MAX_ZOOM = 5.0;
	const ZOOM_SENSITIVITY = 0.1;

	// Tutorial LED Dimmer Komponenten
	const availableComponents: Component[] = [
		{
			id: 'leonardo-keyestudio',
			name: 'Arduino Leonardo',
			image: '/components/leonardoKeyestudio.png',
			category: 'Microcontroller',
			width: 200,  // Vergrößert für bessere Margins und Pin-Spacing
			height: 140, // Vergrößert für bessere Proportionen
			description: 'Arduino Leonardo microcontroller board'
		},
		{
			id: 'breadboard',
			name: 'Breadboard',
			image: '/components/breadboard.png',
			category: 'Base',
			width: 220,  // Vergrößert für bessere Margins
			height: 150, // Vergrößert für bessere Proportionen
			description: 'Solderless breadboard for prototyping'
		},
		{
			id: 'leuchtdiode',
			name: 'LED',
			image: '/components/leuchtdiode.png',
			category: 'Output',
			width: 70,   // Vergrößert für bessere Pin-Spacing
			height: 100, // Vergrößert für bessere Proportionen
			description: 'Light Emitting Diode'
		},
		{
			id: 'widerstand',
			name: 'Resistor',
			image: '/components/widerstand.png',
			category: 'Passive',
			width: 120,  // Vergrößert für bessere Pin-Spacing
			height: 55,  // Vergrößert für bessere Proportionen
			description: 'Current limiting resistor (220Ω - 1kΩ)'
		},
		{
			id: 'poti',
			name: 'Potentiometer',
			image: '/components/poti.png',
			category: 'Input',
			width: 100,  // Vergrößert für bessere Margins
			height: 100, // Bleibt quadratisch für Potentiometer
			description: '10kΩ linear potentiometer'
		},
		{
			id: 'jumpercable',
			name: 'Jumper Cable',
			image: '/components/jumpercable.png',
			category: 'Connection',
			width: 140,  // Vergrößert für bessere Sichtbarkeit
			height: 40,  // Vergrößert für bessere Proportionen
			description: 'Wire for connections between components'
		}
	];

	const categories = [...new Set(availableComponents.map(c => c.category))];
	let componentImages: Map<string, HTMLImageElement> = new Map();
	let gridSize = 20;
	let snapToGrid = true;
	
	// Tutorial connection tracking
	let currentConnectionIndex = 0;
	let completedConnections: string[] = [];

	onMount(() => {
		console.log('🔧 FullscreenCircuitDesigner mounted');
		if (canvas) {
			ctx = canvas.getContext('2d')!;
			resizeCanvas();
			loadComponentImages();
			
			// Initialize view - center the board
			resetView();
			
			setupEventListeners();
			drawBoard();
		}
	});

	function setupEventListeners() {
		canvas.addEventListener('mousedown', handleMouseDown);
		canvas.addEventListener('mousemove', handleMouseMove);
		canvas.addEventListener('mouseup', handleMouseUp);
		canvas.addEventListener('click', handleClick);
		canvas.addEventListener('wheel', handleWheel, { passive: false });
		canvas.addEventListener('contextmenu', handleContextMenu);
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('resize', () => {
			resizeCanvas();
			drawBoard();
		});
	}

	function resizeCanvas() {
		const wrapper = canvas.parentElement; // canvas-wrapper
		if (wrapper) {
			const rect = wrapper.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			
			// Berücksichtige Wrapper-Padding und -Margin
			const availableWidth = rect.width - 20; // 20px für Padding/Margin
			const availableHeight = rect.height - 20;
			
			// Canvas-Größe für Retina/High-DPI Displays optimieren
			canvas.width = availableWidth * dpr;
			canvas.height = availableHeight * dpr;
			
			// CSS-Größe beibehalten
			canvas.style.width = availableWidth + 'px';
			canvas.style.height = availableHeight + 'px';
			
			// Kontext für High-DPI skalieren
			ctx.scale(dpr, dpr);
			
			// Optimale Rendering-Einstellungen für Schärfe
			ctx.imageSmoothingEnabled = false; // Pixel-perfekte Darstellung
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

	function addComponentToBoard(componentId: string) {
		const componentTemplate = availableComponents.find(c => c.id === componentId);
		if (!componentTemplate) return;
		
		// Get pin configuration
		const pinConfig = getComponentPins(componentId);
		if (!pinConfig) {
			console.warn(`No pin configuration found for component: ${componentId}`);
			return;
		}

		// Calculate top-left position in current viewport (world coordinates)
		const topLeftScreenX = 50; // 50px from left edge
		const topLeftScreenY = 50; // 50px from top edge
		const worldTopLeft = screenToWorld(topLeftScreenX, topLeftScreenY);
		
		// Place component in top-left area with some randomization
		const baseX = worldTopLeft.x;
		const baseY = worldTopLeft.y;
		const randomOffsetX = Math.random() * 150; // 0-150px random offset
		const randomOffsetY = Math.random() * 150; // 0-150px random offset
		
		const position = snapToGridPosition(
			baseX + randomOffsetX,
			baseY + randomOffsetY
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
			pins: calculatePinPositions(pinConfig.pins, position.x, position.y, componentTemplate.width, componentTemplate.height),
			connections: []
		};
		
		// Use proper Svelte reactivity - trigger reactive update
		placedComponents = [...placedComponents, newComponent];
		drawBoard();
		
		// Auto-select the newly added component
		selectedComponent = newComponent;
	}

	function calculatePinPositions(pins: Pin[], x: number, y: number, width: number, height: number): Pin[] {
		return pins.map(pin => ({
			...pin,
			x: x + (pin.x / 100) * width, // Convert relative to absolute position
			y: y + (pin.y / 100) * height
		}));
	}

	function snapToGridPosition(x: number, y: number) {
		if (!snapToGrid) return {x, y};
		return {
			x: Math.round(x / gridSize) * gridSize,
			y: Math.round(y / gridSize) * gridSize
		};
	}

	function drawBoard() {
		if (!ctx) return;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Speichere aktuellen Kontext
		ctx.save();
		
		// Wende Transformation an
		ctx.translate(panX, panY);
		ctx.scale(zoomLevel, zoomLevel);
		
		// Draw grid
		drawGrid();
		
		// Draw placed components
		placedComponents.forEach(component => {
			drawComponent(component);
		});
		
		// Draw connections
		drawConnections();
		
		// Kontext wiederherstellen
		ctx.restore();
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
		// Add margin around component for better visual separation
		const componentMargin = 12;
		const displayX = component.x + componentMargin;
		const displayY = component.y + componentMargin;
		const displayWidth = component.width - (componentMargin * 2);
		const displayHeight = component.height - (componentMargin * 2);
		
		// Draw component image if loaded
		const img = componentImages.get(component.componentId);
		if (img) {
			ctx.save();
			
			// Enable high-quality image rendering for maximum sharpness
			ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
			ctx.imageSmoothingQuality = 'high';
			
			// Calculate aspect ratio preserving dimensions with margin
			const imgAspectRatio = img.naturalWidth / img.naturalHeight;
			const componentAspectRatio = displayWidth / displayHeight;
			
			let drawWidth = displayWidth;
			let drawHeight = displayHeight;
			let offsetX = 0;
			let offsetY = 0;
			
			// Preserve aspect ratio by fitting image within component bounds
			if (imgAspectRatio > componentAspectRatio) {
				// Image is wider, fit to width
				drawHeight = displayWidth / imgAspectRatio;
				offsetY = (displayHeight - drawHeight) / 2;
			} else {
				// Image is taller, fit to height  
				drawWidth = displayHeight * imgAspectRatio;
				offsetX = (displayWidth - drawWidth) / 2;
			}
			
			// Draw the image with pixel-perfect positioning for maximum sharpness
			const pixelPerfectX = Math.round(displayX + offsetX);
			const pixelPerfectY = Math.round(displayY + offsetY);
			const pixelPerfectWidth = Math.round(drawWidth);
			const pixelPerfectHeight = Math.round(drawHeight);
			
			ctx.drawImage(
				img, 
				pixelPerfectX, 
				pixelPerfectY, 
				pixelPerfectWidth, 
				pixelPerfectHeight
			);
			
			ctx.restore();
		} else {
			// Fallback rectangle with margin
			const gradient = ctx.createLinearGradient(displayX, displayY, displayX + displayWidth, displayY + displayHeight);
			gradient.addColorStop(0, 'rgba(0, 212, 170, 0.2)');
			gradient.addColorStop(1, 'rgba(0, 212, 170, 0.1)');
			ctx.fillStyle = gradient;
			ctx.fillRect(displayX, displayY, displayWidth, displayHeight);
		}
		
		// Draw component border with selection highlight (full size including margin)
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

		// Draw pins when component is selected or when connecting
		if (selectedComponent?.id === component.id || isDraggingConnection) {
			component.pins.forEach((pin, index) => {
				const isHighlighted = highlightedPin && 
					highlightedPin.component.id === component.id && 
					highlightedPin.pin.name === pin.name;
				
				// Enhanced pin radius for better connectivity
				const pinRadius = isHighlighted ? 12 : 10;
				ctx.fillStyle = isHighlighted ? '#fbbf24' : '#1e293b';
				ctx.beginPath();
				ctx.arc(pin.x, pin.y, pinRadius, 0, 2 * Math.PI);
				ctx.fill();
				
				// Pin circle with type-based coloring
				if (isHighlighted) {
					ctx.fillStyle = '#fbbf24';
				} else {
					switch (pin.type) {
						case 'power': ctx.fillStyle = '#ef4444'; break;
						case 'ground': ctx.fillStyle = '#374151'; break;
						case 'digital': ctx.fillStyle = '#3b82f6'; break;
						case 'analog': ctx.fillStyle = '#10b981'; break;
						case 'pwm': ctx.fillStyle = '#f59e0b'; break;
						default: ctx.fillStyle = '#64748b';
					}
				}
				ctx.beginPath();
				ctx.arc(pin.x, pin.y, pinRadius - 2, 0, 2 * Math.PI);
				ctx.fill();
				
				// Pin border with enhanced visibility
				ctx.strokeStyle = isHighlighted ? '#fbbf24' : '#ffffff';
				ctx.lineWidth = isHighlighted ? 4 : 3;
				ctx.stroke();
				
				// Pin label with enhanced spacing
				ctx.fillStyle = '#ffffff';
				ctx.font = 'bold 11px IBM Plex Mono';
				ctx.textAlign = 'center';
				
				let labelX = pin.x;
				let labelY = pin.y - 18;
				
				// Adjust label position for better readability with more spacing
				if (pin.x <= component.x + 20) { // Left side pin
					labelX = pin.x - 25;
					ctx.textAlign = 'right';
				} else if (pin.x >= component.x + component.width - 20) { // Right side pin
					labelX = pin.x + 25;
					ctx.textAlign = 'left';
				}
				
				// Enhanced label background
				const labelWidth = ctx.measureText(pin.name).width;
				const bgX = labelX - (ctx.textAlign === 'center' ? labelWidth/2 : ctx.textAlign === 'right' ? labelWidth : 0) - 4;
				ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
				ctx.fillRect(bgX, labelY - 14, labelWidth + 8, 16);
				
				// Label text
				ctx.fillStyle = isHighlighted ? '#fbbf24' : '#00d4aa';
				ctx.fillText(pin.name, labelX, labelY);
			});
		}
	}

	function drawConnections() {
		connections.forEach(connection => {
			ctx.strokeStyle = connection.color || '#00d4aa';
			ctx.lineWidth = 3;
			ctx.setLineDash([]);
			
			ctx.beginPath();
			ctx.moveTo(connection.fromPos.x, connection.fromPos.y);
			ctx.lineTo(connection.toPos.x, connection.toPos.y);
			ctx.stroke();
			
			// Draw connection endpoints
			ctx.fillStyle = connection.color || '#00d4aa';
			ctx.beginPath();
			ctx.arc(connection.fromPos.x, connection.fromPos.y, 4, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(connection.toPos.x, connection.toPos.y, 4, 0, 2 * Math.PI);
			ctx.fill();
		});
		
		// Draw active connection being dragged
		if (isDraggingConnection && connectionStart) {
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
		}
	}

	function getPinAt(x: number, y: number): {component: PlacedComponent, pin: Pin} | null {
		for (const component of placedComponents) {
			for (const pin of component.pins) {
				const distance = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
				if (distance <= 20) { // Vergrößert für bessere Klickbarkeit
					return { component, pin };
				}
			}
		}
		return null;
	}

	function getComponentAt(x: number, y: number): PlacedComponent | null {
		return placedComponents.find(component => 
			x >= component.x && x <= component.x + component.width &&
			y >= component.y && y <= component.y + component.height
		) || null;
	}

	function validateConnection(from: {component: PlacedComponent, pin: Pin}, to: {component: PlacedComponent, pin: Pin}): boolean {
		// Check if this connection is required in the tutorial
		return ledDimmerConnections.some(rule => 
			(rule.from.component === from.component.componentId && rule.from.pin === from.pin.name &&
			 rule.to.component === to.component.componentId && rule.to.pin === to.pin.name) ||
			(rule.from.component === to.component.componentId && rule.from.pin === to.pin.name &&
			 rule.to.component === from.component.componentId && rule.to.pin === from.pin.name)
		);
	}

	function createConnection(from: {component: PlacedComponent, pin: Pin}, to: {component: PlacedComponent, pin: Pin}) {
		// Determine wire color based on pin types
		let color = '#00d4aa'; // Default
		if (from.pin.type === 'power' || to.pin.type === 'power') color = '#ef4444'; // Red for power
		if (from.pin.type === 'ground' || to.pin.type === 'ground') color = '#374151'; // Black for ground
		if (from.pin.type === 'pwm' || to.pin.type === 'pwm') color = '#f59e0b'; // Orange for PWM
		
		const connection: Connection = {
			id: `conn-${Date.now()}`,
			fromComponent: from.component.id,
			fromPin: from.pin.name,
			toComponent: to.component.id,
			toPin: to.pin.name,
			fromPos: { x: from.pin.x, y: from.pin.y },
			toPos: { x: to.pin.x, y: to.pin.y },
			color
		};
		
		connections.push(connection);
		console.log(`Connection created: ${from.component.name}.${from.pin.name} → ${to.component.name}.${to.pin.name}`);
	}

	// Funktion zum Aktualisieren der Verbindungen wenn eine Komponente bewegt wird
	function updateConnectionsForComponent(component: PlacedComponent | null) {
		if (!component) return;
		
		// Update all connections that involve this component
		connections = connections.map(conn => {
			// Check if this connection involves the moved component
			if (conn.fromComponent === component.id) {
				// Find the corresponding pin in the component
				const pin = component.pins.find(p => p.name === conn.fromPin);
				if (pin) {
					return {
						...conn,
						fromPos: { x: pin.x, y: pin.y }
					};
				}
			}
			
			if (conn.toComponent === component.id) {
				// Find the corresponding pin in the component
				const pin = component.pins.find(p => p.name === conn.toPin);
				if (pin) {
					return {
						...conn,
						toPos: { x: pin.x, y: pin.y }
					};
				}
			}
			
			return conn;
		});
	}

	function handleMouseDown(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;
		
		// Transformiere Screen-Koordinaten zu Welt-Koordinaten
		const worldPos = screenToWorld(screenX, screenY);
		const x = worldPos.x;
		const y = worldPos.y;
		
		// Mittlere Maustaste oder Rechtsklick für Panning
		if (event.button === 1 || event.button === 2) {
			isPanning = true;
			panStartPos = { x: screenX, y: screenY };
			lastPanPos = { x: panX, y: panY };
			canvas.style.cursor = 'grab';
			event.preventDefault();
			return;
		}
		
		// Nur Linksklick für normale Interaktionen
		if (event.button !== 0) return;
		
		const pinHit = getPinAt(x, y);
		
		if (pinHit) {
			if (!isDraggingConnection) {
				// Start a new connection
				connectionStart = pinHit;
				isDraggingConnection = true;
				mousePos = { x: pinHit.pin.x, y: pinHit.pin.y };
				canvas.style.cursor = 'crosshair';
				return;
			} else if (connectionStart && pinHit.component.id !== connectionStart.component.id) {
				// Complete connection
				if (tutorialComponents) {
					// Tutorial mode: validate connection
					if (validateConnection(connectionStart, pinHit)) {
						createConnection(connectionStart, pinHit);
						console.log('✅ Correct connection made!');
					} else {
						console.log('❌ This connection is not part of the tutorial.');
					}
				} else {
					// Free mode: allow any connection
					createConnection(connectionStart, pinHit);
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
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;
		
		// Handle panning
		if (isPanning) {
			const deltaX = screenX - panStartPos.x;
			const deltaY = screenY - panStartPos.y;
			panX = lastPanPos.x + deltaX;
			panY = lastPanPos.y + deltaY;
			canvas.style.cursor = 'grabbing';
			drawBoard();
			return;
		}
		
		// Transformiere Screen-Koordinaten zu Welt-Koordinaten
		const worldPos = screenToWorld(screenX, screenY);
		const x = worldPos.x;
		const y = worldPos.y;
		
		mousePos = { x, y };

		if (isDragging && selectedComponent) {
			const newX = x - dragOffset.x;
			const newY = y - dragOffset.y;
			const snappedPos = snapToGridPosition(newX, newY);
			
			selectedComponent.x = snappedPos.x;
			selectedComponent.y = snappedPos.y;
			
			// Update pin positions
			const pinConfig = getComponentPins(selectedComponent.componentId);
			if (pinConfig) {
				selectedComponent.pins = calculatePinPositions(pinConfig.pins, snappedPos.x, snappedPos.y, selectedComponent.width, selectedComponent.height);
			}
			
			// Update connections in real-time while dragging
			updateConnectionsForComponent(selectedComponent);
			
			drawBoard();
		} else if (isDraggingConnection) {
			if (connectionStart) {
				const targetPin = getPinAt(x, y);
				
				if (targetPin && targetPin.component.id !== connectionStart.component.id) {
					if (tutorialComponents) {
						// Tutorial mode: check if valid
						if (validateConnection(connectionStart, targetPin)) {
							highlightedPin = targetPin;
							mousePos = { x: targetPin.pin.x, y: targetPin.pin.y };
							canvas.style.cursor = 'crosshair';
						} else {
							highlightedPin = null;
							canvas.style.cursor = 'not-allowed';
						}
					} else {
						// Free mode: highlight any valid target
						highlightedPin = targetPin;
						mousePos = { x: targetPin.pin.x, y: targetPin.pin.y };
						canvas.style.cursor = 'crosshair';
					}
				} else {
					highlightedPin = null;
					canvas.style.cursor = 'crosshair';
				}
			}
			
			drawBoard();
		} else {
			const pinHit = getPinAt(x, y);
			if (pinHit) {
				canvas.style.cursor = 'crosshair';
			} else {
				const componentUnderMouse = getComponentAt(x, y);
				canvas.style.cursor = componentUnderMouse ? 'grab' : 'default';
			}
		}
	}

	function handleMouseUp(event: MouseEvent) {
		// Panning beenden
		if (isPanning) {
			isPanning = false;
			canvas.style.cursor = 'default';
			return;
		}
		
		if (isDraggingConnection && connectionStart) {
			const rect = canvas.getBoundingClientRect();
			const screenX = event.clientX - rect.left;
			const screenY = event.clientY - rect.top;
			
			// Transformiere Screen-Koordinaten zu Welt-Koordinaten
			const worldPos = screenToWorld(screenX, screenY);
			const x = worldPos.x;
			const y = worldPos.y;
			
			const targetPin = getPinAt(x, y);
			
			if (targetPin && targetPin.component.id !== connectionStart.component.id) {
				if (tutorialComponents) {
					// Tutorial mode: validate connection
					if (validateConnection(connectionStart, targetPin)) {
						createConnection(connectionStart, targetPin);
						console.log('✅ Correct connection made!');
					} else {
						console.log('❌ This connection is not part of the tutorial.');
					}
				} else {
					// Free mode: allow any connection
					createConnection(connectionStart, targetPin);
				}
			}
			
			isDraggingConnection = false;
			connectionStart = null;
			highlightedPin = null;
			canvas.style.cursor = 'default';
			drawBoard();
			return;
		}
		
		isDragging = false;
		canvas.style.cursor = 'default';
	}

	function handleClick(event: MouseEvent) {
		if (isDragging) return;
		
		const rect = canvas.getBoundingClientRect();
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;
		
		// Transformiere Screen-Koordinaten zu Welt-Koordinaten
		const worldPos = screenToWorld(screenX, screenY);
		const x = worldPos.x;
		const y = worldPos.y;
		
		const clickedComponent = getComponentAt(x, y);
		if (clickedComponent) {
			selectedComponent = selectedComponent?.id === clickedComponent.id ? null : clickedComponent;
			drawBoard();
		} else {
			selectedComponent = null;
			drawBoard();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Delete' && selectedComponent) {
			placedComponents = placedComponents.filter(c => c.id !== selectedComponent?.id);
			selectedComponent = null;
			drawBoard();
		} else if (event.key === 'Escape') {
			selectedComponent = null;
			// Reset connection dragging completely
			isDraggingConnection = false;
			connectionStart = null;
			highlightedPin = null;
			canvas.style.cursor = 'default'; // Cursor zurück auf default
			drawBoard();
		} else if (event.key === '+' || event.key === '=') {
			// Zoom in with keyboard
			event.preventDefault();
			zoomIn();
		} else if (event.key === '-' || event.key === '_') {
			// Zoom out with keyboard
			event.preventDefault();
			zoomOut();
		} else if (event.key === '0') {
			// Reset view with keyboard
			event.preventDefault();
			resetView();
		} else if (event.key === 'f' || event.key === 'F') {
			// Fit to view with keyboard
			event.preventDefault();
			fitToView();
		}
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		
		const rect = canvas.getBoundingClientRect();
		const centerX = event.clientX - rect.left;
		const centerY = event.clientY - rect.top;
		
		// Zoom-Richtung bestimmen
		const zoomFactor = event.deltaY > 0 ? (1 - ZOOM_SENSITIVITY) : (1 + ZOOM_SENSITIVITY);
		
		// Neuen Zoom-Level berechnen und begrenzen
		const newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel * zoomFactor));
		
		// Zoom um Mausposition zentrieren
		if (newZoomLevel !== zoomLevel) {
			const worldPos = screenToWorld(centerX, centerY);
			zoomLevel = newZoomLevel;
			const newScreenPos = worldToScreen(worldPos.x, worldPos.y);
			
			panX += centerX - newScreenPos.x;
			panY += centerY - newScreenPos.y;
			
			drawBoard();
		}
	}

	function handleContextMenu(event: MouseEvent) {
		event.preventDefault(); // Verhindert das Standard-Kontextmenü
	}

	function clearBoard() {
		placedComponents = [];
		connections = [];
		selectedComponent = null;
		drawBoard();
	}

	function toggleGridSnap() {
		snapToGrid = !snapToGrid;
	}

	function exportBoard() {
		const exportCanvas = document.createElement('canvas');
		exportCanvas.width = canvas.width;
		exportCanvas.height = canvas.height;
		const exportCtx = exportCanvas.getContext('2d')!;
		
		exportCtx.fillStyle = '#ffffff';
		exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
		exportCtx.drawImage(canvas, 0, 0);
		
		const link = document.createElement('a');
		link.download = `led-dimmer-circuit-${new Date().toISOString().split('T')[0]}.png`;
		link.href = exportCanvas.toDataURL();
		link.click();
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
	
	// Koordinatentransformation für Zoom und Pan
	function screenToWorld(screenX: number, screenY: number) {
		return {
			x: (screenX - panX) / zoomLevel,
			y: (screenY - panY) / zoomLevel
		};
	}

	function worldToScreen(worldX: number, worldY: number) {
		return {
			x: worldX * zoomLevel + panX,
			y: worldY * zoomLevel + panY
		};
	}

	// Zoom-Funktionen
	function zoomIn(centerX?: number, centerY?: number) {
		const newZoom = Math.min(zoomLevel + ZOOM_SENSITIVITY, MAX_ZOOM);
		applyZoom(newZoom, centerX, centerY);
	}

	function zoomOut(centerX?: number, centerY?: number) {
		const newZoom = Math.max(zoomLevel - ZOOM_SENSITIVITY, MIN_ZOOM);
		applyZoom(newZoom, centerX, centerY);
	}

	function applyZoom(newZoom: number, centerX?: number, centerY?: number) {
		if (centerX !== undefined && centerY !== undefined) {
			// Zoom zu einem bestimmten Punkt
			const worldPos = screenToWorld(centerX, centerY);
			zoomLevel = newZoom;
			const newScreenPos = worldToScreen(worldPos.x, worldPos.y);
			panX += centerX - newScreenPos.x;
			panY += centerY - newScreenPos.y;
		} else {
			// Zoom zum Canvas-Zentrum
			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2;
			const worldPos = screenToWorld(centerX, centerY);
			zoomLevel = newZoom;
			const newScreenPos = worldToScreen(worldPos.x, worldPos.y);
			panX += centerX - newScreenPos.x;
			panY += centerY - newScreenPos.y;
		}
		drawBoard();
	}

	function resetView() {
		zoomLevel = 1.0;
		panX = 0;
		panY = 0;
		drawBoard();
	}

	function fitToView() {
		if (placedComponents.length === 0) {
			resetView();
			return;
		}

		// Berechne Bounding Box aller Komponenten
		let minX = placedComponents[0].x;
		let minY = placedComponents[0].y;
		let maxX = placedComponents[0].x + placedComponents[0].width;
		let maxY = placedComponents[0].y + placedComponents[0].height;

		placedComponents.forEach(comp => {
			minX = Math.min(minX, comp.x);
			minY = Math.min(minY, comp.y);
			maxX = Math.max(maxX, comp.x + comp.width);
			maxY = Math.max(maxY, comp.y + comp.height);
		});

		// Füge Padding hinzu
		const padding = 100;
		minX -= padding;
		minY -= padding;
		maxX += padding;
		maxY += padding;

		// Berechne Zoom Level
		const contentWidth = maxX - minX;
		const contentHeight = maxY - minY;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		const zoomX = canvasWidth / contentWidth;
		const zoomY = canvasHeight / contentHeight;
		zoomLevel = Math.min(zoomX, zoomY, MAX_ZOOM);

		// Zentriere den Inhalt
		const scaledWidth = contentWidth * zoomLevel;
		const scaledHeight = contentHeight * zoomLevel;
		panX = (canvasWidth - scaledWidth) / 2 - minX * zoomLevel;
		panY = (canvasHeight - scaledHeight) / 2 - minY * zoomLevel;

		drawBoard();
	}
</script>

<div class="fullscreen-designer">
	<!-- Left Sidebar: Components -->
	<aside class="components-sidebar">
		<div class="sidebar-header">
			<button class="back-btn" on:click={exitFullscreen}>
				← Back to Chat
			</button>
			<h2>{tutorialComponents ? 'LED Dimmer Circuit Designer' : 'Circuit Designer'}</h2>
			{#if tutorialComponents}
				<p class="tutorial-note">🎯 Tutorial-Modus: Verwende die Komponenten für das LED Dimmer Projekt mit den korrekten Pin-Verbindungen.</p>
			{/if}
		</div>
		
		<!-- Category Filter (if not in tutorial mode) -->
		{#if !tutorialComponents}
			<div class="category-filter">
				<select bind:value={selectedCategory}>
					<option value="All">All Components</option>
					{#each categories as category}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</div>
		{/if}
		
		<!-- Components Grid -->
		<div class="components-grid">
			{#each filteredComponents as component}
				<div 
					class="component-card"
					class:selected={selectedComponentId === component.id}
					on:click={() => addComponentToBoard(component.id)}
					role="button"
					tabindex="0"
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
			
			<!-- Zoom Controls -->
			<div class="zoom-controls">
				<h4>Zoom & View</h4>
				<div class="zoom-buttons">
					<button class="zoom-btn" on:click={() => zoomIn()}>
						🔍+ Zoom In
					</button>
					<button class="zoom-btn" on:click={() => zoomOut()}>
						🔍- Zoom Out
					</button>
				</div>
				<div class="zoom-level">
					Zoom: {Math.round(zoomLevel * 100)}%
				</div>
				<div class="view-buttons">
					<button class="view-btn" on:click={resetView}>
						🎯 Reset View
					</button>
					<button class="view-btn" on:click={fitToView}>
						📦 Fit All
					</button>
				</div>
			</div>
		</div>
		
		<!-- Component Info -->
		{#if selectedComponent}
			<div class="selected-component-info">
				<h3>Selected Component</h3>
				<h4>{selectedComponent.name}</h4>
				<div class="component-details">
					<div class="detail-row">
						<span>Position:</span>
						<span>{Math.round(selectedComponent.x)}, {Math.round(selectedComponent.y)}</span>
					</div>
					<div class="detail-row">
						<span>Pins:</span>
						<span>{selectedComponent.pins.length}</span>
					</div>
				</div>
				<div class="pin-list">
					<h5>Pin Configuration:</h5>
					{#each selectedComponent.pins as pin}
						<div class="pin-item">
							<span class="pin-name" style="color: {
								pin.type === 'power' ? '#ef4444' : 
								pin.type === 'ground' ? '#374151' : 
								pin.type === 'pwm' ? '#f59e0b' : 
								pin.type === 'analog' ? '#10b981' : 
								pin.type === 'digital' ? '#3b82f6' : '#64748b'
							}">{pin.name}</span>
							<span class="pin-type">({pin.type})</span>
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
			<h1>LED Dimmer Circuit Board</h1>
			<div class="canvas-stats">
				<span>{placedComponents.length} components • {connections.length} connections</span>
				{#if selectedComponent}
					<span>• {selectedComponent.name} selected</span>
				{/if}
			</div>
		</div>
		
		<div class="canvas-container">
			<div class="canvas-wrapper">
				<canvas bind:this={canvas} class="circuit-canvas"></canvas>
			</div>
			
			<!-- Tutorial Instructions -->
			{#if tutorialComponents}
				<div class="tutorial-panel">
					<div class="tutorial-header">
						<h3>LED Dimmer Pin-Out Guide</h3>
					</div>
					<div class="tutorial-content">
						<div class="connection-rules">
							{#each ledDimmerConnections as rule, index}
								<div class="connection-rule" class:completed={completedConnections.includes(rule.from.component + rule.from.pin + rule.to.component + rule.to.pin)}>
									<span class="rule-number">{index + 1}</span>
									<span class="rule-description">{rule.description}</span>
									<div class="rule-connection">
										<span class="from-pin">{rule.from.component}.{rule.from.pin}</span>
										<span class="arrow">→</span>
										<span class="to-pin">{rule.to.component}.{rule.to.pin}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
			
			{#if placedComponents.length === 0}
				<div class="empty-state">
					<h3>Build Your LED Dimmer Circuit</h3>
					<p>Click components from the sidebar to add them to your board</p>
					<div class="shortcuts">
						<div class="shortcut-item">
							<kbd>Click</kbd> Select component
						</div>
						<div class="shortcut-item">
							<kbd>Drag</kbd> Move component
						</div>
						<div class="shortcut-item">
							<kbd>Pin-to-Pin</kbd> Create connections
						</div>
						<div class="shortcut-item">
							<kbd>Mouse Wheel</kbd> Zoom in/out
						</div>
						<div class="shortcut-item">
							<kbd>Middle/Right Click + Drag</kbd> Pan view
						</div>
						<div class="shortcut-item">
							<kbd>+/-</kbd> Zoom in/out
						</div>
						<div class="shortcut-item">
							<kbd>0</kbd> Reset view
						</div>
						<div class="shortcut-item">
							<kbd>F</kbd> Fit all components
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
		font-family: 'IBM Plex Mono', monospace;
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
		font-family: inherit;
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
		font-size: 1.3rem;
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
		font-family: inherit;
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
	
	.component-image {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(30, 41, 59, 0.4);
		border-radius: 6px;
		border: 2px solid rgba(0, 212, 170, 0.3);
	}
	
	.component-image img {
		max-width: 40px;
		max-height: 40px;
		object-fit: contain;
	}
	
	.component-info {
		flex: 1;
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
		font-family: inherit;
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
	
	/* Zoom Controls */
	.zoom-controls {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.zoom-controls h4 {
		margin: 0 0 1rem 0;
		color: #00d4aa;
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.zoom-buttons {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.zoom-btn, .view-btn {
		flex: 1;
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.5rem;
		font-family: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
	}
	
	.zoom-btn:hover, .view-btn:hover {
		background: rgba(0, 212, 170, 0.1);
		border-color: rgba(0, 212, 170, 0.5);
		transform: translateY(-1px);
	}
	
	.zoom-level {
		text-align: center;
		font-size: 0.8rem;
		color: #94a3b8;
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		border: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.view-buttons {
		display: flex;
		gap: 0.5rem;
	}

	/* Selected Component Info */
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
	}
	
	.pin-list {
		margin-bottom: 1rem;
		border: 1px solid rgba(0, 212, 170, 0.1);
		border-radius: 6px;
		padding: 0.75rem;
		max-height: 150px;
		overflow-y: auto;
	}
	
	.pin-list h5 {
		margin: 0 0 0.5rem 0;
		color: #00d4aa;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.pin-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0;
		font-size: 0.75rem;
	}
	
	.pin-name {
		font-weight: 500;
	}
	
	.pin-type {
		color: #64748b;
		font-size: 0.7rem;
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
		min-height: 0; /* Wichtig für Flexbox-Sizing */
		display: flex;
		flex-direction: column;
	}
	
	/* Responsiver Canvas Wrapper */
	.canvas-wrapper {
		flex: 1;
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
		max-height: calc(100vh - 200px); /* Verhindert Overflow */
		overflow: hidden;
		border-radius: 8px;
		margin: 1rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	}
	
	/* Responsive Anpassungen für kleinere Bildschirme */
	@media (max-width: 1200px) {
		.canvas-wrapper {
			margin: 0.5rem;
			max-height: calc(100vh - 150px);
		}
	}
	
	@media (max-width: 768px) {
		.canvas-wrapper {
			margin: 0.25rem;
			max-height: calc(100vh - 120px);
			min-height: 300px;
		}
	}
	
	@media (max-height: 600px) {
		.canvas-wrapper {
			max-height: calc(100vh - 100px);
			min-height: 250px;
		}
	}
	
	.circuit-canvas {
		width: 100%;
		height: 100%;
		display: block;
		background: transparent;
		cursor: default;
	}
	
	/* Tutorial Panel */
	.tutorial-panel {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 350px;
		max-height: 60vh;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		overflow: hidden;
		z-index: 100;
	}
	
	.tutorial-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.tutorial-header h3 {
		margin: 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
	}
	
	.tutorial-content {
		padding: 1rem;
		max-height: 50vh;
		overflow-y: auto;
	}
	
	.connection-rules {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.connection-rule {
		padding: 0.75rem;
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 8px;
		transition: all 0.3s ease;
	}
	
	.connection-rule.completed {
		background: rgba(16, 185, 129, 0.1);
		border-color: #10b981;
	}
	
	.rule-number {
		display: inline-block;
		width: 20px;
		height: 20px;
		background: #00d4aa;
		color: #0f172a;
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: 600;
		text-align: center;
		line-height: 20px;
		margin-right: 0.75rem;
	}
	
	.rule-description {
		color: #e2e8f0;
		font-size: 0.8rem;
		display: block;
		margin-bottom: 0.5rem;
	}
	
	.rule-connection {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		font-family: inherit;
		font-size: 0.8rem;
		color: #00d4aa;
	}
</style>
