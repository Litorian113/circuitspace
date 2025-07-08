<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import Sidebar from './Sidebar.svelte';
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
			ctx.strokeStyle = '#CABDF5';
			ctx.lineWidth = 3;
			ctx.setLineDash([5, 5]);
		} else {
			ctx.strokeStyle = 'rgba(202, 189, 245, 0.4)';
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
				
				// Check if this pin is already connected
				const isConnected = connections.some(conn => 
					(conn.fromComponent === component.id && conn.fromPin === pin.name) ||
					(conn.toComponent === component.id && conn.toPin === pin.name)
				);
				
				// Enhanced pin radius for better connectivity
				const pinRadius = isHighlighted ? 18 : (isConnected ? 16 : 14); // Vergrößert für bessere Klickbarkeit
				ctx.fillStyle = isHighlighted ? '#ECF65F' : (isConnected ? '#1e293b' : '#1e293b');
				ctx.beginPath();
				ctx.arc(pin.x, pin.y, pinRadius, 0, 2 * Math.PI);
				ctx.fill();
				
				// Pin circle with type-based coloring
				if (isHighlighted) {
					ctx.fillStyle = '#ECF65F';
				} else if (isConnected) {
					// Connected pins get a brighter color with border
					switch (pin.type) {
						case 'power': ctx.fillStyle = '#f87171'; break;
						case 'ground': ctx.fillStyle = '#6b7280'; break;
						case 'digital': ctx.fillStyle = '#CABDF5'; break;
						case 'analog': ctx.fillStyle = '#CABDF5'; break;
						case 'pwm': ctx.fillStyle = '#ECF65F'; break;
						default: ctx.fillStyle = '#94a3b8';
					}
				} else {
					switch (pin.type) {
						case 'power': ctx.fillStyle = '#ef4444'; break;
						case 'ground': ctx.fillStyle = '#374151'; break;
						case 'digital': ctx.fillStyle = '#CABDF5'; break;
						case 'analog': ctx.fillStyle = '#CABDF5'; break;
						case 'pwm': ctx.fillStyle = '#ECF65F'; break;
						default: ctx.fillStyle = '#64748b';
					}
				}
				ctx.beginPath();
				ctx.arc(pin.x, pin.y, pinRadius - 4, 0, 2 * Math.PI); // Angepasst für größere Pins
				ctx.fill();
				
				// Pin border - special styling for connected pins
				if (isHighlighted) {
					ctx.strokeStyle = '#ECF65F';
					ctx.lineWidth = 5; // Vergrößert für bessere Sichtbarkeit
				} else if (isConnected) {
					ctx.strokeStyle = '#CABDF5';
					ctx.lineWidth = 4;
				} else {
					ctx.strokeStyle = '#ffffff';
					ctx.lineWidth = 3;
				}
				ctx.stroke();
				
				// Add connection indicator for connected pins
				if (isConnected && !isHighlighted) {
					ctx.beginPath();
					ctx.arc(pin.x, pin.y, pinRadius + 4, 0, 2 * Math.PI); // Angepasst für größere Pins
					ctx.strokeStyle = '#CABDF5';
					ctx.lineWidth = 3; // Vergrößert von 2
					ctx.setLineDash([4, 4]);
					ctx.stroke();
					ctx.setLineDash([]);
				}
				
				// Pin label with enhanced spacing and readability
				ctx.fillStyle = isConnected ? '#CABDF5' : '#ffffff';
				ctx.font = 'bold 13px Inter'; // Vergrößert von 12px für bessere Lesbarkeit
				ctx.textAlign = 'center';
				
				let labelX = pin.x;
				let labelY = pin.y - 25; // Mehr Abstand für größere Pins
				
				// Adjust label position for better readability with more spacing
				if (pin.x <= component.x + 25) { // Angepasst für bessere Abstände
					labelX = pin.x - 30; // Mehr Abstand
					ctx.textAlign = 'right';
				} else if (pin.x >= component.x + component.width - 25) { // Angepasst für bessere Abstände
					labelX = pin.x + 30; // Mehr Abstand
					ctx.textAlign = 'left';
				}
				
				// Enhanced label background
				const labelWidth = ctx.measureText(pin.name).width;
				const bgX = labelX - (ctx.textAlign === 'center' ? labelWidth/2 : ctx.textAlign === 'right' ? labelWidth : 0) - 4;
				ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
				ctx.fillRect(bgX, labelY - 14, labelWidth + 8, 16);
				
				// Label text
				ctx.fillStyle = isHighlighted ? '#ECF65F' : '#CABDF5';
				ctx.fillText(pin.name, labelX, labelY);
			});
		}
	}

	function drawConnections() {
		connections.forEach(connection => {
			// Enhanced connection drawing with bezier curves
			ctx.strokeStyle = connection.color || '#CABDF5';
			ctx.lineWidth = 6; // Vergrößert von 4 für bessere Sichtbarkeit
			ctx.setLineDash([]);
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			
			// Add glow effect
			ctx.shadowColor = connection.color || '#CABDF5';
			ctx.shadowBlur = 8;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			
			// Calculate control points for smoother curve
			const fromX = connection.fromPos.x;
			const fromY = connection.fromPos.y;
			const toX = connection.toPos.x;
			const toY = connection.toPos.y;
			
			// Determine if connection is horizontal or vertical
			const deltaX = Math.abs(toX - fromX);
			const deltaY = Math.abs(toY - fromY);
			
			ctx.beginPath();
			
			if (deltaX > deltaY) {
				// Horizontal connection - curved
				const midX = fromX + (toX - fromX) * 0.5;
				const offsetY = Math.min(50, deltaY * 0.3);
				const cp1X = fromX + deltaX * 0.3;
				const cp1Y = fromY;
				const cp2X = toX - deltaX * 0.3;
				const cp2Y = toY;
				
				ctx.moveTo(fromX, fromY);
				ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
			} else {
				// Vertical connection - curved
				const midY = fromY + (toY - fromY) * 0.5;
				const offsetX = Math.min(50, deltaX * 0.3);
				const cp1X = fromX;
				const cp1Y = fromY + deltaY * 0.3;
				const cp2X = toX;
				const cp2Y = toY - deltaY * 0.3;
				
				ctx.moveTo(fromX, fromY);
				ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
			}
			
			ctx.stroke();
			
			// Reset shadow
			ctx.shadowBlur = 0;
			
			// Draw enhanced connection endpoints - vergrößert für bessere Sichtbarkeit
			ctx.fillStyle = connection.color || '#CABDF5';
			
			// From endpoint
			ctx.beginPath();
			ctx.arc(connection.fromPos.x, connection.fromPos.y, 8, 0, 2 * Math.PI); // Vergrößert von 6
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 3; // Vergrößert von 2
			ctx.stroke();
			
			// To endpoint
			ctx.beginPath();
			ctx.arc(connection.toPos.x, connection.toPos.y, 8, 0, 2 * Math.PI); // Vergrößert von 6
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 3; // Vergrößert von 2
			ctx.stroke();
		});
		
		// Draw active connection being dragged
		if (isDraggingConnection && connectionStart) {
			const gradient = ctx.createLinearGradient(
				connectionStart.pin.x, connectionStart.pin.y, 
				mousePos.x, mousePos.y
			);
			gradient.addColorStop(0, '#CABDF5');
			gradient.addColorStop(1, highlightedPin ? '#ECF65F' : '#ECF65F');
			
			ctx.strokeStyle = gradient;
			ctx.lineWidth = highlightedPin ? 8 : 6; // Vergrößert von 5/4 für bessere Sichtbarkeit
			ctx.setLineDash(highlightedPin ? [12, 3] : [10, 5]); // Vergrößerte Dash-Pattern
			ctx.lineCap = 'round';
			
			// Add pulsing glow effect
			ctx.shadowColor = '#CABDF5';
			ctx.shadowBlur = highlightedPin ? 15 : 10; // Verstärkter Glow-Effekt
			
			ctx.beginPath();
			ctx.moveTo(connectionStart.pin.x, connectionStart.pin.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.shadowBlur = 0;
		}
	}

	function getPinAt(x: number, y: number): {component: PlacedComponent, pin: Pin} | null {
		for (const component of placedComponents) {
			for (const pin of component.pins) {
				const distance = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
				if (distance <= 30) { // Vergrößert von 25 für bessere Klickbarkeit mit vergrößerten Pins
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
		// Check if connection already exists
		const existingConnection = connections.find(conn => 
			(conn.fromComponent === from.component.id && conn.fromPin === from.pin.name &&
			 conn.toComponent === to.component.id && conn.toPin === to.pin.name) ||
			(conn.fromComponent === to.component.id && conn.fromPin === to.pin.name &&
			 conn.toComponent === from.component.id && conn.toPin === from.pin.name)
		);
		
		if (existingConnection) {
			console.log('Connection already exists');
			return;
		}
		
		// Determine wire color based on pin types
		let color = '#CABDF5'; // Default
		if (from.pin.type === 'power' || to.pin.type === 'power') color = '#ef4444'; // Red for power
		if (from.pin.type === 'ground' || to.pin.type === 'ground') color = '#374151'; // Black for ground
		if (from.pin.type === 'pwm' || to.pin.type === 'pwm') color = '#ECF65F'; // Yellow for PWM
		if (from.pin.type === 'analog' || to.pin.type === 'analog') color = '#CABDF5'; // Lilac for analog
		
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
		
		// Add connection to array and trigger reactivity
		connections = [...connections, connection];
		
		// Track completion for tutorial mode with improved matching
		if (tutorialComponents) {
			const connectionKey = `${from.component.componentId}-${from.pin.name}-${to.component.componentId}-${to.pin.name}`;
			const reverseKey = `${to.component.componentId}-${to.pin.name}-${from.component.componentId}-${from.pin.name}`;
			
			// Check if this matches any required connection
			const matchedRule = ledDimmerConnections.find(rule => 
				(rule.from.component === from.component.componentId && rule.from.pin === from.pin.name &&
				 rule.to.component === to.component.componentId && rule.to.pin === to.pin.name) ||
				(rule.from.component === to.component.componentId && rule.from.pin === to.pin.name &&
				 rule.to.component === from.component.componentId && rule.to.pin === from.pin.name)
			);
			
			if (matchedRule && !completedConnections.includes(connectionKey) && !completedConnections.includes(reverseKey)) {
				completedConnections = [...completedConnections, connectionKey]; // Trigger reactivity
				
				// Visual feedback for correct connection
				console.log(`✅ Tutorial connection completed: ${matchedRule.description}`);
				
				// Show completion progress
				const totalConnections = ledDimmerConnections.length;
				const completed = completedConnections.length;
				console.log(`Progress: ${completed}/${totalConnections} connections completed`);
				
				// Success animation for connection endpoints
				console.log(`✅ Connection completed: ${matchedRule.description}`);
				
				if (completed === totalConnections) {
					console.log('🎉 All tutorial connections completed!');
					// Dispatch completion event
					setTimeout(() => {
						dispatch('complete');
					}, 1000);
				}
			}
		}
		
		// Force redraw to show the new connection
		requestAnimationFrame(() => {
			drawBoard();
		});
		
		console.log(`🔗 Connection created: ${from.component.name}.${from.pin.name} → ${to.component.name}.${to.pin.name} (${color})`);
		console.log(`📊 Total connections: ${connections.length}`);
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
			
			// Check if we're dropping on a valid pin
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
			
			// Reset connection state completely - no automatic new connection
			isDraggingConnection = false;
			connectionStart = null;
			highlightedPin = null;
			canvas.style.cursor = 'default'; // Cursor zurück auf default
		}
		
		if (isDragging) {
			// Update connections for the moved component
			updateConnectionsForComponent(selectedComponent);
		}
		
		isDragging = false;
		canvas.style.cursor = 'default';
		
		// Redraw to ensure UI is updated
		drawBoard();
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
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="fullscreen-designer">
	<!-- Navigation Sidebar -->
	<Sidebar />
	
	<!-- Main Content Area -->
	<div class="main-content">
		<!-- Canvas Area -->
		<main class="canvas-area">
			<div class="canvas-header">
				<button class="back-btn" on:click={exitFullscreen}>
					← Back to Chat
				</button>
				<h1>{tutorialComponents ? 'LED Dimmer Circuit Designer' : 'Circuit Designer'}</h1>
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
			</div>
		</main>
		
		<!-- Bottom Components Panel -->
		<aside class="components-panel">
			<!-- Components Grid -->
			<div class="components-grid">
				{#each filteredComponents as component}
					<div 
						class="component-card"
						class:selected={selectedComponentId === component.id}
						on:click={() => addComponentToBoard(component.id)}
						on:keydown={(e) => e.key === 'Enter' && addComponentToBoard(component.id)}
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
			
			<!-- Tutorial Step Guide (only in tutorial mode) -->
			{#if tutorialComponents}
				<div class="tutorial-step-guide">
					{#if completedConnections.length < ledDimmerConnections.length}
						{@const currentStep = ledDimmerConnections[completedConnections.length]}
						<div class="current-step-card">
							<div class="step-header">
								<span class="step-number">{completedConnections.length + 1}</span>
								<div class="step-progress">
									<span class="step-title">Current Step</span>
									<span class="progress-text">{completedConnections.length + 1} of {ledDimmerConnections.length}</span>
								</div>
							</div>
							<div class="step-content">
								<h4 class="step-description">{currentStep.description}</h4>
								<div class="connection-visual">
									<span class="from-pin">{currentStep.from.component}.{currentStep.from.pin}</span>
									<span class="arrow">→</span>
									<span class="to-pin">{currentStep.to.component}.{currentStep.to.pin}</span>
								</div>
								<div class="step-instructions">
									<p>🎯 Click on <strong>{currentStep.from.pin}</strong> pin, then drag to <strong>{currentStep.to.pin}</strong> pin</p>
								</div>
							</div>
						</div>
					{:else}
						<div class="completion-card">
							<div class="completion-icon">🎉</div>
							<h4>All Steps Complete!</h4>
							<p>Your LED Dimmer circuit is ready!</p>
							<div class="completion-stats">
								{completedConnections.length} / {ledDimmerConnections.length} connections
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</aside>
	</div>
</div>

<style>
	.fullscreen-designer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: #191919;
		display: flex;
		z-index: 1000;
		font-family: 'Inter', sans-serif;
	}
	
	/* Main Content Area */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-left: var(--sidebar-width, 280px);
		height: 100vh;
		overflow: hidden;
	}
	
	/* Canvas Area */
	.canvas-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		height: calc(100vh - 200px); /* Reserve space for bottom panel */
	}
	
	.canvas-header {
		padding: 1rem 2rem;
		border-bottom: 1px solid rgba(202, 189, 245, 0.1);
		background: rgba(35, 35, 35, 0.8);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.back-btn {
		background: rgba(202, 189, 245, 0.1);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 8px;
		color: #CABDF5;
		padding: 0.5rem 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
	}
	
	.back-btn:hover {
		background: rgba(202, 189, 245, 0.2);
		transform: translateY(-1px);
	}
	
	.canvas-header h1 {
		margin: 0;
		color: #CABDF5;
		font-family: 'Inter', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		flex: 1;
	}
	
	.canvas-stats {
		color: #94a3b8;
		font-size: 0.875rem;
		font-family: 'Inter', sans-serif;
		white-space: nowrap;
	}
	
	.category-filter {
		min-width: 200px;
		margin-right: 1rem;
	}
	
	.category-filter select {
		width: 100%;
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		padding: 0.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
	}
	
	.components-grid {
		display: flex;
		gap: 0.75rem;
		min-width: 0;
		flex: 1;
	}
	
	.component-card {
		background: rgba(35, 35, 35, 0.6);
		border: 1px solid rgba(202, 189, 245, 0.2);
		border-radius: 8px;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 120px;
		max-width: 140px;
		text-align: center;
	}
	
	.component-card:hover {
		background: rgba(202, 189, 245, 0.1);
		border-color: rgba(202, 189, 245, 0.4);
		transform: translateY(-2px);
	}
	
	.component-image {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(35, 35, 35, 0.4);
		border-radius: 6px;
		border: 2px solid rgba(202, 189, 245, 0.3);
		margin-bottom: 0.5rem;
	}
	
	.component-image img {
		max-width: 32px;
		max-height: 32px;
		object-fit: contain;
	}
	
	.component-info h4 {
		margin: 0 0 0.25rem 0;
		color: #e2e8f0;
		font-size: 0.8rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
	}
	
	.component-info .category {
		margin: 0 0 0.25rem 0;
		color: #CABDF5;
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		font-family: 'Inter', sans-serif;
	}
	
	.component-info .description {
		margin: 0;
		color: #94a3b8;
		font-size: 0.65rem;
		line-height: 1.3;
		font-family: 'Inter', sans-serif;
	}
	

	
	/* Bottom Components Panel */
	.components-panel {
		height: 200px;
		background: rgba(35, 35, 35, 0.95);
		border-top: 1px solid rgba(202, 189, 245, 0.3);
		display: flex;
		gap: 1rem;
		padding: 1rem;
		overflow-x: auto;
		overflow-y: hidden;
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
		overflow: hidden;
		border-radius: 12px;
		margin: 1rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		background: linear-gradient(135deg, #191919 0%, #2a2a2a 100%);
	}
	
	.circuit-canvas {
		width: 100%;
		height: 100%;
		display: block;
		background: transparent;
		cursor: default;
	}
	
	/* Tutorial Step Guide in Components Panel */
	.tutorial-step-guide {
		flex: 1;
		min-width: 300px;
		max-width: 400px;
		margin-left: 1rem;
		background: rgba(45, 45, 45, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}
	
	.current-step-card {
		background: rgba(202, 189, 245, 0.1);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 8px;
		padding: 1rem;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.step-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	
	.step-number {
		background: #CABDF5;
		color: #191919;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.85rem;
		font-family: 'Inter', sans-serif;
		flex-shrink: 0;
	}
	
	.step-progress {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.step-title {
		color: #CABDF5;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0;
	}
	
	.progress-text {
		color: #94a3b8;
		font-size: 0.7rem;
		font-family: 'Inter', sans-serif;
	}
	
	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.step-description {
		color: #e2e8f0;
		font-size: 0.85rem;
		line-height: 1.4;
		margin: 0;
		font-family: 'Inter', sans-serif;
		font-weight: 500;
	}
	
	.connection-visual {
		background: rgba(35, 35, 35, 0.8);
		border: 1px solid rgba(202, 189, 245, 0.2);
		border-radius: 6px;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.75rem;
		overflow-x: auto;
	}
	
	.from-pin, .to-pin {
		background: rgba(202, 189, 245, 0.1);
		border: 1px solid rgba(202, 189, 245, 0.3);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		color: #CABDF5;
		font-weight: 500;
		white-space: nowrap;
		font-size: 0.7rem;
	}
	
	.arrow {
		color: #ECF65F;
		font-weight: bold;
		font-size: 0.9rem;
		margin: 0 0.25rem;
	}
	
	.step-instructions {
		background: rgba(35, 35, 35, 0.6);
		border-radius: 6px;
		padding: 0.75rem;
		margin-top: auto;
	}
	
	.step-instructions p {
		margin: 0;
		color: #e2e8f0;
		font-size: 0.75rem;
		line-height: 1.4;
		font-family: 'Inter', sans-serif;
	}
	
	.step-instructions strong {
		color: #ECF65F;
		font-weight: 600;
	}
	
	.completion-card {
		text-align: center;
		padding: 1.5rem 1rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		border-radius: 8px;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}
	
	.completion-icon {
		font-size: 2rem;
	}
	
	.completion-card h4 {
		margin: 0;
		color: #22c55e;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.completion-card p {
		margin: 0;
		color: #e2e8f0;
		font-size: 0.8rem;
		line-height: 1.4;
		font-family: 'Inter', sans-serif;
	}
	
	.completion-stats {
		color: #22c55e;
		font-size: 0.75rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
	}
</style>
