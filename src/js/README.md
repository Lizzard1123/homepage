# Window Management System

A clean, scalable, and programmatic window management system for web applications. Built with modern JavaScript classes and designed for extensibility.

## 🚀 Quick Start

```javascript
// The system initializes automatically on DOMContentLoaded
// Access the global windowManager instance
const windowManager = new WindowManager();

// Create a new window from a template
const newWindow = windowManager.createNewWindowFromTemplate('.my-window-template');
```

## 📋 Table of Contents

- [Core Concepts](#core-concepts)
- [WindowManager API](#windowmanager-api)
- [Window API](#window-api)
- [Configuration](#configuration)
- [Extending the System](#extending-the-system)
- [Examples](#examples)
- [Best Practices](#best-practices)

## 🏗️ Core Concepts

### WindowManager
The central orchestrator that manages all windows and global state like snap zones.

### Window
Individual window instances that handle their own behavior (dragging, snapping, controls).

### Snap Zones
Predefined areas (left/right sides) where windows can snap to. Only one window can occupy each zone at a time.

## 🎛️ WindowManager API

### Constructor
```javascript
const windowManager = new WindowManager();
```

### Methods

#### `createWindow(element, options)`
Creates a window instance from an existing DOM element.

```javascript
const element = document.querySelector('.my-window');
const window = windowManager.createWindow(element, {
    SNAP_THRESHOLD: 60, // Custom snap threshold
    WINDOW_OFFSET: 30   // Custom offset for new windows
});
```

#### `createNewWindowFromTemplate(selector, options)`
Creates a new window by cloning an existing template element.

```javascript
// Clone the original window template
const newWindow = windowManager.createNewWindowFromTemplate('.macos-window');

// Clone a custom template
const customWindow = windowManager.createNewWindowFromTemplate('.custom-window-template');
```

#### `isSnapZoneOccupied(zone)`
Check if a snap zone is currently occupied.

```javascript
if (!windowManager.isSnapZoneOccupied(SnapZone.LEFT)) {
    // Left zone is available
}
```

#### `occupySnapZone(zone, window)`
Manually occupy a snap zone (internal use).

#### `freeSnapZone(zone)`
Manually free a snap zone (internal use).

## 🪟 Window API

### Properties

- `element` - The DOM element representing the window
- `snapZone` - Current snap zone (`SnapZone.LEFT`, `SnapZone.RIGHT`, or `null`)
- `isDragging` - Whether the window is currently being dragged

### Methods

#### `center()`
Centers the window and frees any snap zone.

```javascript
window.center();
```

#### `remove()`
Removes the window with fade animation and cleans up resources.

```javascript
window.remove();
```

#### `setZIndex(zIndex)`
Sets the z-index for layering.

```javascript
window.setZIndex(100);
```

## ⚙️ Configuration

The system uses a centralized `CONFIG` object with sensible defaults:

```javascript
const CONFIG = {
    SNAP_THRESHOLD: 50,        // Distance from edge to trigger snap
    WINDOW_OFFSET: 50,         // Offset for new windows
    ANIMATION_DURATION: 300,   // Snap animation duration (ms)
    FADE_DURATION: 600,        // Fade animation duration (ms)
    Z_INDEX_BASE: 10,          // Starting z-index
    Z_INDEX_INCREMENT: 1,      // Z-index increment
    LEFT_SNAP_POSITION: '16px',
    RIGHT_SNAP_POSITION: 'calc(50% + 8px)',
    TOP_POSITION: '32px',
    WINDOW_WIDTH: 'calc(50% - 24px)',
    CENTERED_WIDTH: '100%',
    MAX_CENTERED_WIDTH: '1024px'
};
```

Override configuration when creating windows:

```javascript
const window = windowManager.createWindow(element, {
    SNAP_THRESHOLD: 100,
    ANIMATION_DURATION: 500
});
```

## 🛠️ Extending the System

### Adding New Window Types

1. Create a custom window class that extends the base `Window` class:

```javascript
class CustomWindow extends Window {
    constructor(element, windowManager, options = {}) {
        super(element, windowManager, options);
        this.setupCustomFeatures();
    }

    setupCustomFeatures() {
        // Add custom event listeners or behavior
        this.element.addEventListener('dblclick', () => {
            this.toggleMaximize();
        });
    }

    toggleMaximize() {
        // Custom maximize logic
        if (this.isMaximized) {
            this.center();
        } else {
            this.maximize();
        }
        this.isMaximized = !this.isMaximized;
    }

    maximize() {
        // Implement maximize functionality
        Object.assign(this.element.style, {
            width: '100vw',
            height: '100vh',
            left: '0',
            top: '0',
            transform: 'none'
        });
    }
}
```

2. Create a custom WindowManager:

```javascript
class CustomWindowManager extends WindowManager {
    createCustomWindow(element, options = {}) {
        const window = new CustomWindow(element, this, options);
        this.windows.push(window);
        window.setZIndex(this.nextZIndex++);
        return window;
    }
}
```

### Adding New Snap Zones

1. Extend the `SnapZone` enum:

```javascript
const SnapZone = {
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom'
};
```

2. Update the WindowManager to handle new zones:

```javascript
class ExtendedWindowManager extends WindowManager {
    constructor() {
        super();
        this.snapZones = {
            ...this.snapZones,
            [SnapZone.TOP]: null,
            [SnapZone.BOTTOM]: null
        };
    }
}
```

3. Add snap logic in the Window class:

```javascript
attemptSnap() {
    // Existing left/right logic...

    // Add top/bottom snapping
    const isNearTop = rect.top <= this.options.SNAP_THRESHOLD;
    const isNearBottom = rect.top >= window.innerHeight - rect.height - this.options.SNAP_THRESHOLD;

    if (isNearTop && !this.windowManager.isSnapZoneOccupied(SnapZone.TOP)) {
        this.snapToSide(SnapZone.TOP);
    } else if (isNearBottom && !this.windowManager.isSnapZoneOccupied(SnapZone.BOTTOM)) {
        this.snapToSide(SnapZone.BOTTOM);
    }
}
```

### Custom Event System

Add a pub/sub system for window events:

```javascript
class EventedWindow extends Window {
    constructor(element, windowManager, options = {}) {
        super(element, windowManager, options);
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    center() {
        super.center();
        this.emit('centered');
    }

    remove() {
        this.emit('beforeRemove');
        super.remove();
        this.emit('removed');
    }
}
```

## 💡 Examples

### Basic Window Creation

```javascript
// HTML
<div class="my-window macos-window">
    <div class="macos-header">...</div>
    <div class="macos-content">...</div>
</div>

// JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const windowManager = new WindowManager();

    // Create from existing element
    const windowElement = document.querySelector('.my-window');
    const window = windowManager.createWindow(windowElement);

    // Listen for window events
    window.on('centered', () => console.log('Window centered'));
    window.on('removed', () => console.log('Window removed'));
});
```

### Dynamic Window Creation

```javascript
// Create windows programmatically
function createProjectWindow(projectData) {
    // Create window element
    const windowElement = document.createElement('div');
    windowElement.className = 'macos-window project-window';
    windowElement.innerHTML = `
        <div class="macos-header">
            <div class="macos-traffic-lights">
                <div class="macos-traffic-light red"></div>
                <div class="macos-traffic-light yellow"></div>
                <div class="macos-traffic-light green"></div>
            </div>
            <div class="macos-title">
                <span class="macos-title-text">${projectData.title}</span>
            </div>
        </div>
        <div class="macos-content">
            <h2>${projectData.title}</h2>
            <p>${projectData.description}</p>
        </div>
    `;

    document.body.appendChild(windowElement);

    // Create window instance
    const window = windowManager.createWindow(windowElement);

    // Position it nicely
    window.center();

    return window;
}

// Usage
document.getElementById('add-project-btn').addEventListener('click', () => {
    const projectWindow = createProjectWindow({
        title: 'New Project',
        description: 'Project description here...'
    });
});
```

### Custom Window Behavior

```javascript
class ResizableWindow extends Window {
    constructor(element, windowManager, options = {}) {
        super(element, windowManager, options);
        this.setupResizeHandles();
    }

    setupResizeHandles() {
        // Add resize handles to corners
        const corners = ['nw', 'ne', 'sw', 'se'];
        corners.forEach(corner => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${corner}`;
            handle.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: transparent;
                cursor: ${corner}-resize;
                z-index: 1000;
            `;

            // Position the handle
            const positions = {
                nw: { top: '-5px', left: '-5px' },
                ne: { top: '-5px', right: '-5px' },
                sw: { bottom: '-5px', left: '-5px' },
                se: { bottom: '-5px', right: '-5px' }
            };
            Object.assign(handle.style, positions[corner]);

            this.element.appendChild(handle);

            // Add resize logic
            handle.addEventListener('mousedown', (e) => {
                this.startResize(corner, e);
                e.stopPropagation();
            });
        });
    }

    startResize(corner, e) {
        // Implement resize logic...
        console.log(`Starting resize from ${corner} corner`);
    }
}

// Usage
const resizableWindow = new ResizableWindow(element, windowManager);
```

## ✅ Best Practices

### 1. **Memory Management**
- Always call `window.remove()` when destroying windows
- Windows automatically clean up their event listeners and DOM elements

### 2. **Performance**
- Avoid creating too many windows simultaneously
- Use `requestAnimationFrame` for heavy animations
- Debounce resize events if implementing custom resize logic

### 3. **Accessibility**
- Ensure keyboard navigation support
- Add proper ARIA labels for screen readers
- Respect user's motion preferences for animations

### 4. **Responsive Design**
- Test snap zones on different screen sizes
- Consider mobile/touch interactions
- Use CSS media queries for responsive behavior

### 5. **Error Handling**
- Check for element existence before creating windows
- Provide fallbacks for missing DOM elements
- Log errors in development mode

### 6. **Extensibility**
- Use composition over inheritance where possible
- Keep core classes focused on single responsibilities
- Document custom extensions thoroughly

## 🔧 Troubleshooting

### Common Issues

**Windows not snapping correctly:**
- Check that snap zones aren't occupied
- Verify CONFIG values are appropriate for your layout
- Ensure window elements have proper positioning

**Memory leaks:**
- Always call `remove()` on windows you no longer need
- Check for lingering event listeners
- Monitor DOM element cleanup

**Z-index issues:**
- Use `setZIndex()` to control layering
- Ensure new windows get higher z-indexes than existing ones

## 📝 API Reference

### Constants

- `SnapZone.LEFT` - Left snap zone identifier
- `SnapZone.RIGHT` - Right snap zone identifier

### Events

Windows can emit these events (when using EventedWindow):
- `centered` - Window was centered
- `beforeRemove` - Window is about to be removed
- `removed` - Window was removed
- `snapped` - Window snapped to a zone (data: zone)
- `dragged` - Window was dragged (data: {x, y})

## 🤝 Contributing

When extending the system:
1. Follow the existing code style and patterns
2. Add comprehensive documentation
3. Include examples for new features
4. Test across different browsers
5. Update this README with new APIs

---

**Happy window managing! 🎉**