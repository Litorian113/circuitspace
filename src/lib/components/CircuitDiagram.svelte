<script lang="ts">
	import { onMount } from 'svelte';
	import { currentProject } from '$lib/stores/project';
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let showComponentPanel = false;
	
	interface Component {
		id: string;
		name: string;
		image: string;
		category: string;
		width: number;
		height: number;
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
		pins: Array<{name: string, x: number, y: number}>;
		connections: Array<{from: string, to: string}>;
	}
	
	// Available components for the project
	const availableComponents: Component[] = [
		{
			id: 'arduino-leonardo',
			name: 'Arduino Leonardo',
			image: '/components/leonardoKeyestudio.png',
			category: 'microcontroller',
			width: 180,  // Optimiert für PNG-Auflösung
			height: 120  // Besseres Seitenverhältnis
		},
		{
			id: 'breadboard',
			name: 'Breadboard',
			image: '/components/breadboard.png',
			category: 'prototyping',
			width: 200,  // Optimiert für PNG-Auflösung
			height: 130  // Besseres Seitenverhältnis
		},
		{
			id: 'led',
			name: 'LED',
			image: '/components/leuchtdiode.png',
			category: 'output',
			width: 50,   // Optimiert für PNG-Auflösung
			height: 80   // Besseres Seitenverhältnis für LED
		},
		{
			id: 'potentiometer',
			name: 'Potentiometer',
			image: '/components/poti.png',
			category: 'input',
			width: 80,   // Quadratischer für Potentiometer
			height: 80   // Besseres Seitenverhältnis
		},
		{
			id: 'pushbutton',
			name: 'Push Button',
			image: '/components/pushbutton.png',
			category: 'input',
			width: 60,   // Optimiert für PNG-Auflösung
			height: 60   // Besseres Seitenverhältnis
		},
		{
			id: 'resistor',
			name: 'Resistor',
			image: '/components/widerstand.png',
			category: 'passive',
			width: 100,  // Optimiert für PNG-Auflösung
			height: 35   // Besseres Seitenverhältnis für Resistor
		},
		{
			id: 'jumper-cable',
			name: 'Jumper Cable',
			image: '/components/jumpercable.png',
			category: 'connection',
			width: 120,  // Optimiert für Kabel
			height: 20   // Besseres Seitenverhältnis für Kabel
		}
	];
	
	let placedComponents: PlacedComponent[] = [];
	let selectedComponent: PlacedComponent | null = null;
	let isDragging = false;
	let dragOffset = {x: 0, y: 0};
	let componentImages: Map<string, HTMLImageElement> = new Map();
	let gridSize = 20;
	let snapToGrid = true;
	
	// Zoom and Pan State
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
	
	// Coordinate transformation functions
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
	
	// Zoom control functions
	function zoomIn() {
		applyZoom(zoomLevel * (1 + ZOOM_SENSITIVITY), canvas.width / 2, canvas.height / 2);
	}
	
	function zoomOut() {
		applyZoom(zoomLevel * (1 - ZOOM_SENSITIVITY), canvas.width / 2, canvas.height / 2);
	}
	
	function applyZoom(newZoomLevel: number, centerX: number, centerY: number) {
		const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel));
		if (clampedZoom !== zoomLevel) {
			const worldPos = screenToWorld(centerX, centerY);
			zoomLevel = clampedZoom;
			const newScreenPos = worldToScreen(worldPos.x, worldPos.y);
			
			panX += centerX - newScreenPos.x;
			panY += centerY - newScreenPos.y;
			
			drawBoard();
		}
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
		
		// Calculate bounding box of all components
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		
		placedComponents.forEach(comp => {
			minX = Math.min(minX, comp.x);
			minY = Math.min(minY, comp.y);
			maxX = Math.max(maxX, comp.x + comp.width);
			maxY = Math.max(maxY, comp.y + comp.height);
		});
		
		// Add some padding
		const padding = 50;
		minX -= padding;
		minY -= padding;
		maxX += padding;
		maxY += padding;
		
		// Calculate zoom level to fit content
		const contentWidth = maxX - minX;
		const contentHeight = maxY - minY;
		const scaleX = canvas.width / contentWidth;
		const scaleY = canvas.height / contentHeight;
		
		zoomLevel = Math.min(scaleX, scaleY, MAX_ZOOM);
		zoomLevel = Math.max(zoomLevel, MIN_ZOOM);
		
		// Center the content
		panX = (canvas.width - contentWidth * zoomLevel) / 2 - minX * zoomLevel;
		panY = (canvas.height - contentHeight * zoomLevel) / 2 - minY * zoomLevel;
		
		drawBoard();
	}
	
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
			
			// Initial canvas setup
			resizeCanvas();
			
			// Load component images
			loadComponentImages();
			
			// Initialize view - center the board
			resetView();
			
			// Add event listeners
			canvas.addEventListener('mousedown', handleMouseDown);
			canvas.addEventListener('mousemove', handleMouseMove);
			canvas.addEventListener('mouseup', handleMouseUp);
			canvas.addEventListener('click', handleClick);
			canvas.addEventListener('wheel', handleWheel, { passive: false });
			canvas.addEventListener('contextmenu', handleContextMenu);
			
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
					canvas.removeEventListener('wheel', handleWheel);
					canvas.removeEventListener('contextmenu', handleContextMenu);
				}
				window.removeEventListener('keydown', handleKeydown);
				window.removeEventListener('resize', handleResize);
			};
		}
	});

	function resizeCanvas() {
		const wrapper = canvas.parentElement; // canvas-wrapper
		if (wrapper) {
			const rect = wrapper.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			
			// Berücksichtige Wrapper-Padding und -Margin
			const availableWidth = rect.width - 20; // 20px für Padding/Margin
			const availableHeight = rect.height - 20;
			
			// Canvas-Größe für High-DPI Displays optimieren
			canvas.width = availableWidth * dpr;
			canvas.height = availableHeight * dpr;
			
			canvas.style.width = availableWidth + 'px';
			canvas.style.height = availableHeight + 'px';
			
			ctx.scale(dpr, dpr);
			
			// Optimale Rendering-Einstellungen für scharfe Bilder
			ctx.imageSmoothingEnabled = false;
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
		const pins: Array<{name: string, x: number, y: number}> = [];
		
		switch(component.componentId) {
			case 'arduino-leonardo':
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
			pins: [],
			connections: []
		};
		
		newComponent.pins = generatePins(newComponent);
		placedComponents.push(newComponent);
		drawBoard();
		showComponentPanel = false;
		
		// Auto-select the newly added component
		selectedComponent = newComponent;
	}
	
	function drawBoard() {
		if (!ctx) return;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Save context and apply transformation
		ctx.save();
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
		
		// Restore context
		ctx.restore();
	}
	
	function drawGrid() {
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
		ctx.lineWidth = 1 / zoomLevel; // Anpassung für Zoom
		
		const gridSize = 20;
		
		// Calculate visible area in world coordinates
		const worldTopLeft = screenToWorld(0, 0);
		const worldBottomRight = screenToWorld(canvas.width, canvas.height);
		
		// Calculate grid range with some padding
		const startX = Math.floor(worldTopLeft.x / gridSize) * gridSize;
		const endX = Math.ceil(worldBottomRight.x / gridSize) * gridSize;
		const startY = Math.floor(worldTopLeft.y / gridSize) * gridSize;
		const endY = Math.ceil(worldBottomRight.y / gridSize) * gridSize;
		
		// Major grid lines every 100px
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
		for (let x = startX; x <= endX; x += gridSize * 5) {
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, endY);
			ctx.stroke();
		}
		
		for (let y = startY; y <= endY; y += gridSize * 5) {
			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
			ctx.stroke();
		}
		
		// Minor grid lines
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
		for (let x = startX; x <= endX; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, endY);
			ctx.stroke();
		}
		
		for (let y = startY; y <= endY; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
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
		
		// Draw component shadow
		ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 4;
		
		// Draw component background
		ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
		ctx.fillRect(displayX, displayY, displayWidth, displayHeight);
		
		// Reset shadow
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		
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
			// Fallback rectangle with pattern and margin
			const gradient = ctx.createLinearGradient(displayX, displayY, displayX + displayWidth, displayY + displayHeight);
			gradient.addColorStop(0, 'rgba(0, 212, 170, 0.2)');
			gradient.addColorStop(1, 'rgba(0, 212, 170, 0.1)');
			ctx.fillStyle = gradient;
			ctx.fillRect(displayX, displayY, displayWidth, displayHeight);
		}
		
		// Draw component label with background
		const labelY = component.y + component.height + 30; // Mehr Abstand
		const labelText = component.name;
		ctx.font = '12px IBM Plex Mono'; // Vergrößert
		ctx.textAlign = 'center';
		const textWidth = ctx.measureText(labelText).width;
		
		// Label background
		ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
		ctx.fillRect(component.x + component.width/2 - textWidth/2 - 6, labelY - 16, textWidth + 12, 20);
		
		// Label text
		ctx.fillStyle = '#e2e8f0';
		ctx.fillText(labelText, component.x + component.width/2, labelY);
		
		// Draw pins with enhanced visibility and spacing
		component.pins.forEach((pin, index) => {
			// Enhanced pin background circle
			ctx.fillStyle = '#1e293b';
			ctx.beginPath();
			ctx.arc(pin.x, pin.y, 8, 0, 2 * Math.PI); // Vergrößert
			ctx.fill();
			
			// Pin circle
			ctx.fillStyle = selectedComponent?.id === component.id ? '#00d4aa' : '#64748b';
			ctx.beginPath();
			ctx.arc(pin.x, pin.y, 6, 0, 2 * Math.PI); // Vergrößert
			ctx.fill();
			
			// Pin border
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2; // Vergrößert
			ctx.stroke();
			
			// Pin label with better positioning and enhanced spacing
			ctx.fillStyle = '#ffffff';
			ctx.font = '10px IBM Plex Mono'; // Vergrößert
			ctx.textAlign = 'center';
			
			// Position label based on pin location relative to component
			let labelX = pin.x;
			let labelY = pin.y - 12; // Mehr Abstand
			
			// Adjust label position for better readability with enhanced spacing
			if (pin.x <= component.x + 15) { // Left side pin
				labelX = pin.x - 20; // Mehr Abstand
				ctx.textAlign = 'right';
			} else if (pin.x >= component.x + component.width - 15) { // Right side pin
				labelX = pin.x + 20; // Mehr Abstand
				ctx.textAlign = 'left';
			}
			
			// Enhanced label background
			const labelWidth = ctx.measureText(pin.name).width;
			const bgX = labelX - (ctx.textAlign === 'center' ? labelWidth/2 : ctx.textAlign === 'right' ? labelWidth : 0) - 3;
			ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
			ctx.fillRect(bgX, labelY - 12, labelWidth + 6, 16);
			
			// Label text
			ctx.fillStyle = '#00d4aa';
			ctx.fillText(pin.name, labelX, labelY);
		});
	}
	
	function drawConnections() {
		// TODO: Implement connection drawing when components are connected
	}
	
	function getComponentAt(x: number, y: number): PlacedComponent | null {
		return placedComponents.find(component => 
			x >= component.x && x <= component.x + component.width &&
			y >= component.y && y <= component.y + component.height
		) || null;
	}
	
	function handleMouseDown(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;
		
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
		
		// Transformiere Screen-Koordinaten zu Welt-Koordinaten
		const worldPos = screenToWorld(screenX, screenY);
		const x = worldPos.x;
		const y = worldPos.y;
		
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
		
		if (isDragging && selectedComponent) {
			const newX = x - dragOffset.x;
			const newY = y - dragOffset.y;
			
			// Apply grid snapping
			const snappedPosition = snapToGridPosition(newX, newY);
			selectedComponent.x = snappedPosition.x;
			selectedComponent.y = snappedPosition.y;
			
			// Update pin positions
			selectedComponent.pins = generatePins(selectedComponent);
			
			drawBoard();
		} else {
			// Update cursor
			const componentUnderMouse = getComponentAt(x, y);
			canvas.style.cursor = componentUnderMouse ? 'grab' : 'default';
		}
	}
	
	function handleMouseUp() {
		// Panning beenden
		if (isPanning) {
			isPanning = false;
			canvas.style.cursor = 'default';
			return;
		}
		
		if (isDragging && selectedComponent) {
			// Final snap to grid when dropping
			const snappedPosition = snapToGridPosition(selectedComponent.x, selectedComponent.y);
			selectedComponent.x = snappedPosition.x;
			selectedComponent.y = snappedPosition.y;
			selectedComponent.pins = generatePins(selectedComponent);
			drawBoard();
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
			console.log('Selected component:', clickedComponent.name);
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
	
	function toggleComponentPanel() {
		showComponentPanel = !showComponentPanel;
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
			showComponentPanel = false;
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
		} else if (event.ctrlKey || event.metaKey) {
			if (event.key === 's') {
				event.preventDefault();
				exportBoard();
			} else if (event.key === 'a') {
				event.preventDefault();
				showComponentPanel = true;
			}
		}
	}
</script>

<div class="diagram-container">
	<!-- Circuit Header -->
	<header class="diagram-header">
		<div class="header-left">
			<h1>Interactive Circuit Designer</h1>
			<p class="diagram-description">Design your circuit by adding and connecting components</p>
		</div>
		<div class="header-actions">
			<button class="action-btn" on:click={toggleComponentPanel}>
				<span>Add Component</span>
				<span class="shortcut">Ctrl+A</span>
			</button>
			<button class="action-btn secondary" on:click={toggleGridSnap}>
				<span>{snapToGrid ? 'Grid: ON' : 'Grid: OFF'}</span>
			</button>
			<button class="action-btn" on:click={clearBoard}>
				Clear Board
			</button>
			<button class="action-btn" on:click={exportBoard}>
				<span>Export PNG</span>
				<span class="shortcut">Ctrl+S</span>
			</button>
		</div>
		
		<!-- Zoom Controls -->
		<div class="zoom-controls">
			<button class="zoom-btn" on:click={zoomOut} title="Zoom Out (-)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M19 13H5v-2h14v2z" fill="currentColor"/>
				</svg>
			</button>
			<span class="zoom-level">{Math.round(zoomLevel * 100)}%</span>
			<button class="zoom-btn" on:click={zoomIn} title="Zoom In (+)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
				</svg>
			</button>
			<button class="zoom-btn" on:click={resetView} title="Reset View (0)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
					<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
				</svg>
			</button>
			<button class="zoom-btn" on:click={fitToView} title="Fit to View (F)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" fill="currentColor"/>
				</svg>
			</button>
		</div>
	</header>
	
	<!-- Component Selection Panel -->
	{#if showComponentPanel}
		<div class="component-panel">
			<div class="panel-header">
				<h3>Available Components</h3>
				<button class="close-btn" on:click={toggleComponentPanel}>×</button>
			</div>
			<div class="component-grid">
				{#each availableComponents as component}
					<div class="component-item" on:click={() => addComponentToBoard(component.id)}>
						<div class="component-preview">
							<img src={component.image} alt={component.name} />
						</div>
						<span class="component-name">{component.name}</span>
						<span class="component-category">{component.category}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<div class="diagram-canvas-container">
		<div class="canvas-wrapper">
			<canvas bind:this={canvas} class="diagram-canvas"></canvas>
		</div>
		
		<!-- Canvas Overlay Info -->
		{#if placedComponents.length === 0}
			<div class="empty-state">
				<h3>Start Building Your Circuit</h3>
				<p>Click "Add Component" to begin designing your circuit</p>
				<div class="shortcuts">
					<div class="shortcut-item">
						<kbd>Ctrl+A</kbd> Add Component
					</div>
					<div class="shortcut-item">
						<kbd>Del</kbd> Delete Selected
					</div>
					<div class="shortcut-item">
						<kbd>Esc</kbd> Deselect
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
		
		<!-- Component Info Panel -->
		{#if selectedComponent}
			<div class="component-info-panel">
				<h4>{selectedComponent.name}</h4>
				<div class="info-grid">
					<div class="info-item">
						<span class="label">Type:</span>
						<span class="value">{selectedComponent.componentId}</span>
					</div>
					<div class="info-item">
						<span class="label">Position:</span>
						<span class="value">{selectedComponent.x}, {selectedComponent.y}</span>
					</div>
					<div class="info-item">
						<span class="label">Pins:</span>
						<span class="value">{selectedComponent.pins.length}</span>
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
	</div>
	
	<div class="diagram-info">
		<p>Drag components to move • Use mouse wheel to zoom • Middle/right-click + drag to pan • Components show pins for connections</p>
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
		justify-content: space-between;
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
		min-width: 120px;
	}
	
	.action-btn.secondary {
		background: rgba(100, 116, 139, 0.1);
		border-color: rgba(100, 116, 139, 0.3);
	}
	
	.action-btn.secondary:hover {
		background: rgba(100, 116, 139, 0.2);
		border-color: #64748b;
	}
	
	.shortcut {
		font-size: 0.7rem;
		background: rgba(0, 0, 0, 0.3);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		color: #94a3b8;
	}
	
	.action-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		border-color: #00d4aa;
		transform: translateY(-2px);
	}
	
	/* Zoom Controls */
	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(0, 212, 170, 0.2);
		border-radius: 8px;
		backdrop-filter: blur(8px);
	}
	
	.zoom-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: rgba(0, 212, 170, 0.1);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 6px;
		color: #e2e8f0;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.zoom-btn:hover {
		background: rgba(0, 212, 170, 0.2);
		border-color: #00d4aa;
		color: #00d4aa;
		transform: translateY(-1px);
	}
	
	.zoom-level {
		min-width: 50px;
		text-align: center;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		color: #00d4aa;
		font-weight: 500;
	}
	
	/* Component Panel Styles */
	.component-panel {
		position: absolute;
		top: 100px;
		left: 2rem;
		width: 320px;
		max-height: 500px;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		z-index: 100;
		overflow: hidden;
	}
	
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 212, 170, 0.1);
	}
	
	.panel-header h3 {
		margin: 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
	}
	
	.close-btn {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
	}
	
	.close-btn:hover {
		background: rgba(0, 212, 170, 0.1);
		color: #00d4aa;
	}
	
	.component-grid {
		padding: 1rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		max-height: 400px;
		overflow-y: auto;
	}
	
	.component-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem;
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(0, 212, 170, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.component-item:hover {
		background: rgba(0, 212, 170, 0.1);
		border-color: rgba(0, 212, 170, 0.3);
		transform: translateY(-2px);
	}
	
	.component-preview {
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
		border: 2px solid rgba(0, 212, 170, 0.2);
		border-radius: 6px;
		background: rgba(0, 212, 170, 0.05);
	}
	
	.component-preview img {
		max-width: 50px;
		max-height: 50px;
		object-fit: contain;
	}
	
	.component-name {
		font-size: 0.8rem;
		font-weight: 500;
		color: #e2e8f0;
		text-align: center;
		margin-bottom: 0.25rem;
	}
	
	.component-category {
		font-size: 0.7rem;
		color: #94a3b8;
		text-transform: capitalize;
	}
	
	/* Empty State */
	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: #64748b;
	}
	
	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		color: #94a3b8;
	}
	
	.empty-state p {
		margin: 0 0 1.5rem 0;
		font-size: 0.9rem;
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
		font-size: 0.8rem;
		color: #94a3b8;
	}
	
	kbd {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 4px;
		padding: 0.2rem 0.4rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.7rem;
		color: #00d4aa;
	}
	
	/* Component Info Panel */
	.component-info-panel {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 280px;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(0, 212, 170, 0.3);
		border-radius: 12px;
		backdrop-filter: blur(12px);
		padding: 1.5rem;
		z-index: 50;
	}
	
	.component-info-panel h4 {
		margin: 0 0 1rem 0;
		color: #00d4aa;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
	}
	
	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.info-item .label {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
	}
	
	.info-item .value {
		font-size: 0.8rem;
		color: #e2e8f0;
		font-family: 'IBM Plex Mono', monospace;
	}
	
	.pin-list {
		max-height: 150px;
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
	

	
	.diagram-canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0; /* Wichtig für Flexbox-Sizing */
	}
	
	/* Responsiver Canvas Wrapper */
	.canvas-wrapper {
		flex: 1;
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 300px;
		max-height: calc(100vh - 250px); /* Verhindert Overflow */
		overflow: hidden;
		border-radius: 8px;
		margin: 1rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	}
	
	/* Responsive Anpassungen für kleinere Bildschirme */
	@media (max-width: 1200px) {
		.canvas-wrapper {
			margin: 0.75rem;
			max-height: calc(100vh - 200px);
		}
	}
	
	@media (max-width: 768px) {
		.canvas-wrapper {
			margin: 0.5rem;
			max-height: calc(100vh - 180px);
			min-height: 250px;
		}
	}
	
	@media (max-height: 600px) {
		.canvas-wrapper {
			max-height: calc(100vh - 150px);
			min-height: 200px;
		}
	}
	
	.diagram-canvas {
		width: 100%;
		height: 100%;
		display: block;
		background: transparent;
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
