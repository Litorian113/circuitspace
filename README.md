# Circuitspace - AR-Enhanced Circuit Design Platform

## 📋 Projektübersicht

Circuitspace ist eine moderne Web-Anwendung für Circuit-Design mit AR-Integration, entwickelt mit SvelteKit. Die Platform bietet eine intuitive Benutzeroberfläche für das Erstellen und Lernen von elektronischen Schaltungen mit innovativer Arvis AR-Device Integration.

## 🚀 Schnellstart

```bash
# Dependencies installieren
npm install

# Development Server starten (localhost:5173)
npm run dev

# Type Checking
npm run check

# Production Build
npm run build

# Preview Production Build
npm run preview
```

## 🏗️ Architektur & Struktur

### Haupt-Framework
- **Frontend**: SvelteKit mit TypeScript
- **Styling**: Vanilla CSS mit modernen Animationen
- **Navigation**: SvelteKit App Router
- **Fonts**: Inter & IBM Plex Mono (Google Fonts)

### Projektstruktur
```
circuitspace/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Hauptseite (Landing Page)
│   │   ├── project-chat/             # Projekt-Chat Interface
│   │   ├── overview/                 # Komponenten-Übersicht
│   │   ├── templates/                # Projekt-Templates
│   │   ├── myProjects/               # Benutzer-Projekte
│   │   ├── onboarding/               # Onboarding-Flow
│   │   ├── playground/               # Interactive Playground
│   │   ├── demo-connections/         # Demo-Verbindungen
│   │   ├── test-circuit/             # Schaltkreis-Tests
│   │   └── register/                 # Registrierung
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Sidebar.svelte        # Navigation Sidebar
│   │   │   ├── HeroSection.svelte    # Haupt-Hero Section
│   │   │   ├── HowItWorksSection.svelte
│   │   │   ├── ArDeviceSection.svelte
│   │   │   ├── BuildFirstProjectSection.svelte
│   │   │   ├── LearnTogetherSection.svelte
│   │   │   └── ArvisDevicePopup.svelte
│   │   └── stores/                   # Svelte Stores
│   └── app.html
├── static/
│   ├── logo/                         # Brand Assets
│   ├── arvis/                        # AR Device Images
│   ├── components/                   # Elektronik-Komponenten
│   ├── big_components/               # Große Komponenten-Bilder
│   ├── small_components/             # Kleine Komponenten-Icons
│   ├── nav-icon/                     # Navigation Icons
│   ├── footer-icon/                  # Footer Icons
│   ├── how-it-works/                 # Feature-Illustrationen
│   ├── onboarding/                   # Onboarding-Assets
│   └── myProjectsIMG/                # Projekt-Vorschaubilder
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎯 Hauptfunktionen

### 1. **Arvis AR Hero Section**
- Vollbild-Hero mit Arvis AR-Device Showcase
- Interaktiver Titel mit Partikel-Animation beim Mouse-Hover
- Smooth Scroll Navigation zu den Haupt-Sektionen
- Responsive Design für alle Bildschirmgrößen
- Fade-up Animation beim Laden der Seite

### 2. **Interaktive Partikel-Animation**
```typescript
interface Particle {
    x: number;           // X-Position
    y: number;           // Y-Position
    vx: number;          // Geschwindigkeit X
    vy: number;          // Geschwindigkeit Y
    life: number;        // Aktuelle Lebensdauer
    maxLife: number;     // Maximale Lebensdauer
    opacity: number;     // Transparenz (Fade-Effekt)
    size: number;        // Partikelgröße
}
```

**Features:**
- Canvas-basierte Partikel-Generierung auf Maus-Bewegung
- Automatisches Fade-in/Fade-out System
- Performance-optimiert mit 40 Partikel-Limit
- Glow-Effekte mit Markenfarben (#EDF760)

### 3. **Smart Project Input System**
- Direkteingabe für Projektideen über Input-Field
- Smooth Page Transitions mit Loading-Animation
- Navigation zu `/project-chat?prompt={userInput}`
- Circuit-Wave Loading Animation während Transition
- Backdrop-Filter Glasmorphism-Effekte

### 4. **Intelligentes Popup Management**
```typescript
// Arvis Device Popup Logic
const observer = new IntersectionObserver((entries) => {
    // Trigger wenn Hero Section 10% sichtbar ist
    // 10-Minuten Cooldown via LocalStorage
    // 3-Sekunden Delay vor Popup-Anzeige
});
```

**Features:**
- Zeitgesteuerte Popup-Anzeige (3s Delay)
- LocalStorage-basierte Cooldown-Logik (10 Minuten)
- Intersection Observer für Performance
- Automatisches Cleanup nach Anzeige

### 5. **Responsive Sidebar Navigation**
- Fixierte Sidebar mit 280px Breite (Desktop)
- CSS Custom Properties für dynamische Layouts
- Automatisches Ausblenden auf Mobile (< 1024px)
- Smooth Transitions bei Größenänderungen
- Accessibility-Features (ARIA, Keyboard Navigation)

## 🔄 User Flows

### Hauptflow - Projektstart
1. **Landing Page** → Arvis Hero Section mit Intro
2. **Scroll** → Hero Section mit Projekt-Input
3. **Input** → Projektbeschreibung eingeben
4. **Submit** → Transition Animation (Circuit-Waves)
5. **Navigate** → `/project-chat?prompt={userInput}`

### Sekundäre Navigation Flows
- **Komponenten erkunden**: Sidebar → `/overview`
- **Templates nutzen**: Sidebar → `/templates`
- **Eigene Projekte**: Sidebar → `/myProjects`
- **Playground**: Sidebar → `/playground`
- **Onboarding**: Sidebar → `/onboarding`

### AR Device Information Flow
1. **Trigger**: Hero Section wird sichtbar (10% Threshold)
2. **Delay**: 3 Sekunden Wartezeit
3. **Check**: LocalStorage für letzten Popup-Zeitpunkt
4. **Cooldown**: 10 Minuten zwischen Popup-Anzeigen
5. **Display**: ArvisDevicePopup Component

## ⚡ Performance Features

### Animationen & Effekte
- **Canvas 2D API**: Hardware-beschleunigte Partikel-Rendering
- **RequestAnimationFrame**: 60 FPS optimierte Animationen
- **Intersection Observer**: Lazy-Loading und Performance-optimierte Triggers
- **CSS Transforms**: Hardware-Beschleunigung statt Position-Changes
- **Backdrop-Filter**: Native Browser-Blur-Effekte

### Responsive Breakpoints
```css
/* Desktop First Approach */
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile Large */ }
@media (max-width: 480px)  { /* Mobile Small */ }
```

### Loading States & Transitions
- **Circuit-Wave Animation**: Pulsierende Kreise während Loading
- **Glasmorphism Loading**: Backdrop-filter mit Blur-Effekten
- **Progressive Animations**: Gestaffelte Text- und Element-Animationen
- **Memory Management**: Cleanup von Event Listeners und Animations

## 🎨 Design System

### Farb-Palette
```css
/* Primäre Farben */
--background: #191919;           /* Dark Theme Background */
--text-primary: rgba(255, 255, 255, 0.9);  /* Haupt-Text */
--accent-purple: #CABDF5;        /* Primärer Akzent */
--accent-yellow: #ECF65F;        /* Sekundärer Akzent */
--accent-alt: #EDF760;           /* Partikel-Farbe */

/* Transparenzen */
--overlay-light: rgba(25, 25, 25, 0.2);
--overlay-medium: rgba(25, 25, 25, 0.4);
--glass-bg: rgba(255, 255, 255, 0.1);
```

### Typographie-System
```css
/* Font Families */
--font-primary: 'Inter', sans-serif;     /* UI Text */
--font-mono: 'IBM Plex Mono', monospace; /* Code/Technical */

/* Font Weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Font Sizes (Responsive) */
--text-hero: 4rem;    /* Desktop Hero */
--text-hero-mobile: 2rem;  /* Mobile Hero */
--text-large: 1.5rem;
--text-base: 1rem;
--text-small: 0.9rem;
```

### Effekt-Bibliothek
- **Glasmorphism**: `backdrop-filter: blur(40px) saturate(180%)`
- **Text Shadows**: Layered shadows für Depth-Effekte
- **Gradients**: Linear gradients mit Brand Colors
- **Glow Effects**: Box-shadow mit Brand Color Glows
- **Transitions**: Smooth 0.3s ease Übergänge

## 🛠️ Technische Implementation

### State Management
```typescript
// Lokaler Component State (Reactive)
let projectInput = '';           // User Input für Projekt
let isTransitioning = false;     // Loading State Management
let showArvisPopup = false;      // Popup Visibility Control
let particles: Particle[] = [];  // Animation State Array
let isHovering = false;         // Mouse Interaction State

// DOM References
let heroSectionElement: HTMLElement;
let titleElement: HTMLElement;
let particleCanvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
```

### Browser APIs Integration
```typescript
// Canvas 2D Kontext für Partikel-Rendering
ctx = particleCanvas.getContext('2d');

// Intersection Observer für Performance
const observer = new IntersectionObserver(callback, {
    threshold: 0.1  // 10% Sichtbarkeit
});

// LocalStorage für Popup-Timing
localStorage.setItem('arvisPopupLastShown', timestamp);
localStorage.getItem('arvisPopupLastShown');

// Smooth Scrolling API
element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
});
```

### Navigation System
```typescript
// SvelteKit Navigation
import { goto } from '$app/navigation';

// Programmatische Navigation mit Query Parameters
goto(`/project-chat?prompt=${encodeURIComponent(projectInput)}`);

// Route-spezifische Navigation
goto('/overview');    // Komponenten-Übersicht
goto('/templates');   // Projekt-Templates
```

## 📱 Mobile Optimierungen

### Touch-Friendly Design
- **Minimum Touch Target**: 44px für alle interaktiven Elemente
- **Tap Highlights**: Entfernt für Custom Styling
- **Viewport Meta**: Optimiert für Mobile Rendering
- **Touch Events**: Unterstützung für Touch-basierte Interaktionen

### Performance auf Mobile
- **Reduzierte Partikel**: Weniger Partikel auf Mobile-Geräten
- **Optimierte Bilder**: `object-fit: cover` für Hero-Images
- **Lazy Loading**: Intersection Observer für Content
- **Hardware Acceleration**: CSS Transforms für Animationen

### Responsive Layout
- **Flexible Grid**: CSS Grid mit Auto-Fit
- **Fluid Typography**: `clamp()` für responsive Font-Sizes
- **Sidebar Collapse**: Automatisch auf < 1024px
- **Content Reflow**: Optimierte Content-Anordnung per Breakpoint

## 📈 Zukünftige Erweiterungen

### AR Integration
- **WebXR APIs**: Native AR-Funktionalität für Arvis Device
- **Camera Access**: Kamera-Integration für Circuit-Erkennung
- **3D Rendering**: Three.js für 3D-Circuit Visualisierung
- **Gesture Control**: Hand-Tracking für AR-Interaktionen

### Erweiterte Features
- **Real-time Collaboration**: Socket.io für Multi-User-Editing
- **Cloud Storage**: Firebase/Supabase für Projekt-Synchronisation
- **Component Library**: Erweiterte Circuit-Komponenten-Bibliothek
- **Code Generation**: Arduino/Python Code-Export
- **Educational Content**: Interaktive Tutorials und Kurse

### Technical Improvements
- **PWA Features**: Offline-Funktionalität und App-Installation
- **Performance Monitoring**: Real User Monitoring (RUM)
- **A/B Testing**: Feature-Flag System für UX-Tests
- **Analytics**: User Behavior Tracking und Insights
- **Internationalization**: Multi-Language Support

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 🤝 Contributing

Beiträge sind willkommen! Bitte lesen Sie die Contributing Guidelines vor dem Erstellen von Pull Requests.

## 📞 Kontakt

- **GitHub**: [@Litorian113](https://github.com/Litorian113)
- **Repository**: [circuitspace](https://github.com/Litorian113/circuitspace)
