// Window Management System - Clean and Scalable
document.addEventListener('DOMContentLoaded', function() {
    // Configuration Constants
    const CONFIG = {
        SNAP_THRESHOLD: 50,
        WINDOW_OFFSET: 50,
        ANIMATION_DURATION: 300,
        FADE_DURATION: 600,
        Z_INDEX_BASE: 10,
        Z_INDEX_INCREMENT: 1,
        LEFT_SNAP_POSITION: '16px',
        RIGHT_SNAP_POSITION: 'calc(50% + 8px)',
        TOP_POSITION: '32px',
        WINDOW_WIDTH: 'calc(50% - 24px)',
        CENTERED_WIDTH: '100%',
        MAX_CENTERED_WIDTH: '1024px'
    };

    // Snap Zone States
    const SnapZone = {
        LEFT: 'left',
        RIGHT: 'right'
    };

    // Window Class - Encapsulates individual window behavior
    class Window {
        constructor(element, windowManager, options = {}) {
            this.element = element;
            this.windowManager = windowManager;
            this.options = { ...CONFIG, ...options };

            this.header = this.element.querySelector('.macos-header');
            this.redLight = this.element.querySelector('.macos-traffic-light.red');
            this.yellowLight = this.element.querySelector('.macos-traffic-light.yellow');
            this.greenLight = this.element.querySelector('.macos-traffic-light.green');

            this.snapZone = null;
            this.isDragging = false;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.windowStartX = 0;
            this.windowStartY = 0;

            this.init();
        }

        init() {
            if (!this.header) return;

            this.setupEventListeners();
            this.setupTrafficLights();
            this.setupStyling();
            this.createSnapZones();
            this.setupFocusEvents();
        }

        setupEventListeners() {
            // Mouse down on header to start dragging
            this.header.addEventListener('mousedown', this.handleMouseDown.bind(this));

            // Global mouse move and up for dragging
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));

            // Window resize handling
            window.addEventListener('resize', this.handleWindowResize.bind(this));
        }

        setupTrafficLights() {
            if (this.redLight) {
                this.redLight.addEventListener('click', this.remove.bind(this));
                this.redLight.style.cursor = 'pointer';
            }

            if (this.yellowLight) {
                this.yellowLight.addEventListener('click', this.remove.bind(this));
                this.yellowLight.style.cursor = 'pointer';
            }

            if (this.greenLight) {
                this.greenLight.addEventListener('click', this.center.bind(this));
                this.greenLight.style.cursor = 'pointer';
            }
        }

        setupStyling() {
            // Make window position absolute for dragging
            Object.assign(this.element.style, {
                position: 'absolute',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                resize: 'none'
            });

            this.header.style.cursor = 'grab';
        }

        createSnapZones() {
            const snapZoneStyle = `
                position: fixed;
                top: ${this.options.TOP_POSITION};
                width: ${this.options.WINDOW_WIDTH};
                height: calc(100vh - 64px);
                background: radial-gradient(circle, rgba(192, 192, 192, 0.05) 0%, rgba(192, 192, 192, 0.15) 100%);
                border: 1px solid rgba(192, 192, 192, 0.3);
                box-shadow: inset 0 0 30px rgba(192, 192, 192, 0.2);
                border-radius: 12px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 0;
            `;

            this.leftSnapZone = document.createElement('div');
            this.rightSnapZone = document.createElement('div');

            this.leftSnapZone.style.cssText = snapZoneStyle + `left: ${this.options.LEFT_SNAP_POSITION};`;
            this.rightSnapZone.style.cssText = snapZoneStyle + `left: ${this.options.RIGHT_SNAP_POSITION};`;

            document.body.appendChild(this.leftSnapZone);
            document.body.appendChild(this.rightSnapZone);
        }

        handleMouseDown(e) {
            this.isDragging = true;
            this.clearSnapZone();

            // When dragging starts from a snapped state, revert to fit-content
            // When dragging starts from centered state, keep current width
            if (this.snapZone) {
                this.element.style.width = 'fit-content';
                this.element.style.height = 'auto';
                this.element.style.maxWidth = 'none';
            }

            const rect = this.element.getBoundingClientRect();
            this.windowStartX = rect.left;
            this.windowStartY = rect.top;

            this.dragStartX = e.clientX - this.windowStartX;
            this.dragStartY = e.clientY - this.windowStartY;

            this.header.style.cursor = 'grabbing';
            e.preventDefault();
        }

        handleMouseMove(e) {
            if (!this.isDragging) return;

            const newX = e.clientX - this.dragStartX;
            const newY = e.clientY - this.dragStartY;

            const constrainedX = this.constrainToViewport(newX, newY);

            this.updatePosition(constrainedX.x, constrainedX.y);
            this.updateSnapIndicators(constrainedX.x, constrainedX.maxX);
        }

        handleMouseUp() {
            if (!this.isDragging) return;

            this.attemptSnap();
            this.hideSnapIndicators();
            this.resetDragState();
        }

        handleWindowResize() {
            // Update snap zone sizes
            const style = `calc(50% - 24px)`;
            this.leftSnapZone.style.width = style;
            this.leftSnapZone.style.height = 'calc(100vh - 64px)';
            this.rightSnapZone.style.width = style;
            this.rightSnapZone.style.height = 'calc(100vh - 64px)';
            this.rightSnapZone.style.left = this.options.RIGHT_SNAP_POSITION;
        }

        constrainToViewport(x, y) {
            const rect = this.element.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            return {
                x: Math.max(0, Math.min(x, maxX)),
                y: Math.max(0, Math.min(y, maxY)),
                maxX: maxX,
                maxY: maxY
            };
        }

        updatePosition(x, y) {
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
            this.element.style.transform = 'none';
        }

        updateSnapIndicators(x, maxX) {
            const isNearLeft = x <= this.options.SNAP_THRESHOLD;
            const isNearRight = x >= maxX - this.options.SNAP_THRESHOLD;

            this.leftSnapZone.style.opacity = (isNearLeft && !this.windowManager.isSnapZoneOccupied(SnapZone.LEFT)) ? '1' : '0';
            this.rightSnapZone.style.opacity = (isNearRight && !this.windowManager.isSnapZoneOccupied(SnapZone.RIGHT)) ? '1' : '0';
        }

        hideSnapIndicators() {
            this.leftSnapZone.style.opacity = '0';
            this.rightSnapZone.style.opacity = '0';
        }

        resetDragState() {
            this.isDragging = false;
            this.header.style.cursor = 'grab';
        }

        attemptSnap() {
            const rect = this.element.getBoundingClientRect();
            const snapThreshold = this.options.SNAP_THRESHOLD;
            const isNearLeft = rect.left <= snapThreshold;
            const isNearRight = rect.left >= window.innerWidth - rect.width - snapThreshold;

            // Clear previous snap zone occupation
            this.clearSnapZone();

            if (isNearLeft && !this.windowManager.isSnapZoneOccupied(SnapZone.LEFT)) {
                this.snapToSide(SnapZone.LEFT);
            } else if (isNearRight && !this.windowManager.isSnapZoneOccupied(SnapZone.RIGHT)) {
                this.snapToSide(SnapZone.RIGHT);
            }
        }

        snapToSide(zone) {
            this.snapZone = zone;
            this.windowManager.occupySnapZone(zone, this);

            Object.assign(this.element.style, {
                width: this.options.WINDOW_WIDTH,
                height: 'calc(100vh - 64px)',
                maxWidth: 'none',
                transition: 'left, top, transform, height 0.3s ease',
                left: zone === SnapZone.LEFT ? this.options.LEFT_SNAP_POSITION : this.options.RIGHT_SNAP_POSITION,
                top: this.options.TOP_POSITION,
                transform: 'none'
            });

            setTimeout(() => {
                this.element.style.transition = '';
            }, this.options.ANIMATION_DURATION);
        }

        clearSnapZone() {
            if (this.snapZone) {
                this.windowManager.freeSnapZone(this.snapZone);
                this.snapZone = null;
            }
        }

        center(immediate = false) {
            this.clearSnapZone();

            const centerStyles = {
                left: '50%',
                top: this.options.TOP_POSITION,
                transform: 'translateX(-50%)',
                width: this.options.CENTERED_WIDTH,
                height: 'auto',
                maxWidth: this.options.MAX_CENTERED_WIDTH
            };

            if (immediate) {
                Object.assign(this.element.style, centerStyles);
                this.element.style.transition = 'none';
                // Force a reflow to ensure transition: none is applied immediately if needed
                this.element.offsetHeight; 
                this.element.style.transition = '';
            } else {
                Object.assign(this.element.style, {
                    ...centerStyles,
                    transition: 'all 0.6s ease'
                });

                setTimeout(() => {
                    this.element.style.transition = '';
                }, this.options.FADE_DURATION);
            }
        }

        remove() {
            this.clearSnapZone();

            this.element.style.transition = 'opacity 0.6s ease';
            this.element.style.opacity = '0';

            setTimeout(() => {
                this.element.remove();
                this.leftSnapZone.remove();
                this.rightSnapZone.remove();
                this.windowManager.removeWindow(this);
            }, this.options.FADE_DURATION);
        }

        setupFocusEvents() {
            // Bring window to front when clicked or focused
            this.element.addEventListener('mousedown', () => {
                this.windowManager.bringToFront(this);
            });

            this.element.addEventListener('focus', () => {
                this.windowManager.bringToFront(this);
            }, true); // Use capture phase for focus events
        }

        setZIndex(zIndex) {
            this.element.style.zIndex = zIndex;
        }
    }

    // WindowManager Class - Handles global state and window creation
    class WindowManager {
        constructor() {
            this.windows = [];
            this.snapZones = {
                [SnapZone.LEFT]: null,
                [SnapZone.RIGHT]: null
            };
            this.nextZIndex = CONFIG.Z_INDEX_BASE;
        }

        createWindow(element, options = {}) {
            const window = new Window(element, this, options);
            this.windows.push(window);
            window.setZIndex(this.nextZIndex++);
            return window;
        }

        isSnapZoneOccupied(zone) {
            return this.snapZones[zone] !== null;
        }

        occupySnapZone(zone, window) {
            this.snapZones[zone] = window;
        }

        freeSnapZone(zone) {
            this.snapZones[zone] = null;
        }

        bringToFront(window) {
            window.setZIndex(this.nextZIndex++);
        }

        removeWindow(window) {
            // Remove window from the array
            const index = this.windows.indexOf(window);
            if (index > -1) {
                this.windows.splice(index, 1);
            }

            // Check if all windows are closed
            if (this.windows.length === 0) {
                this.showRestartButton();
            }
        }

        showRestartButton() {
            // Remove existing restart button if it exists
            const existingButton = document.getElementById('restart-button');
            if (existingButton) {
                existingButton.remove();
            }

            // Create restart button
            const restartButton = document.createElement('button');
            restartButton.id = 'restart-button';
            restartButton.textContent = 'restart';
            restartButton.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                padding: 16px 32px;
                font-family: 'Source Code Pro', monospace;
                font-size: 16px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 2s ease-in;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `;

            // Add hover effect
            restartButton.addEventListener('mouseenter', () => {
                restartButton.style.background = 'var(--bg-secondary)';
            });
            restartButton.addEventListener('mouseleave', () => {
                restartButton.style.background = 'var(--bg-primary)';
            });

            // Add click handler
            restartButton.addEventListener('click', () => {
                this.restart();
            });

            // Add to page
            document.body.appendChild(restartButton);

            // Trigger fade in after a short delay
            setTimeout(() => {
                restartButton.style.opacity = '1';
            }, 100);
        }

        restart() {
            // Immediately remove restart button
            const restartButton = document.getElementById('restart-button');
            if (restartButton) {
                restartButton.remove();
            }

            // Recreate the main window
            const mainWindow = this.loadWindowFromTemplate('main-window-template');
            if (mainWindow) {
                this.setupWindowLinks(mainWindow.element);
            }
        }

        setupWindowLinks(windowElement) {
            const manager = this;

            // Setup Activity link
            const activityLink = windowElement.querySelector('.activity-link');
            if (activityLink) {
                activityLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const activityWindow = manager.loadWindowFromTemplate('activity-window-template', { centered: false });
                    if (activityWindow) {
                        manager.positionWindowRelativeToLink(activityWindow.element, activityLink);
                        initializeContributionGraphs(activityWindow.element);
                    }
                });
            }

            // Setup Projects link
            const projectsLink = windowElement.querySelector('.projects-link');
            if (projectsLink) {
                projectsLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const projectsWindow = manager.loadWindowFromTemplate('projects-window-template', { centered: false });
                    if (projectsWindow) {
                        manager.positionWindowRelativeToLink(projectsWindow.element, projectsLink);
                    }
                });
            }

            // Setup Post links
            const postLinks = windowElement.querySelectorAll('.post-link');
            postLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const postUrl = this.getAttribute('href');

                    let templateId;
                    if (postUrl.includes('reinforcement-learning-scoundrel')) {
                        templateId = 'reinforcement-learning-post-template';
                    } else if (postUrl.includes('drone-development')) {
                        templateId = 'drone-development-post-template';
                    } else {
                        console.error('Unknown post URL:', postUrl);
                        return;
                    }

                    const postWindow = manager.loadWindowFromTemplate(templateId, { centered: false });
                    if (postWindow) {
                        manager.positionWindowRelativeToLink(postWindow.element, link);
                    }
                });
            });
        }

        positionWindowRelativeToLink(windowElement, linkElement) {
            const linkRect = linkElement.getBoundingClientRect();
            const windowWidth = windowElement.offsetWidth;
            
            // Position down and to the left of the link
            const newLeft = Math.max(0, linkRect.left - windowWidth + 20); // 20px padding from right edge
            const newTop = linkRect.bottom + 10; // 10px below the link

            Object.assign(windowElement.style, {
                left: newLeft + 'px',
                top: newTop + 'px',
                transform: 'none'
            });
        }

        loadWindowFromTemplate(templateId, options = {}) {
            const template = document.getElementById(templateId);
            if (!template) {
                console.error('Template not found:', templateId);
                return null;
            }

            // Clone the template content
            const windowElement = template.content.firstElementChild.cloneNode(true);

            // Use window container if it exists, otherwise fallback to body
            const container = document.getElementById('window-container') || document.body;
            container.appendChild(windowElement);
            
            // Create the window instance
            const windowInstance = this.createWindow(windowElement, options);
            
            // Set default centered state if not specified otherwise
            if (options.centered !== false) {
                windowInstance.center(true);
            }
            
            return windowInstance;
        }

        createNewWindowFromTemplate(templateSelector, options = {}) {
            const template = document.querySelector(templateSelector);
            if (!template) return null;

            const newWindow = template.cloneNode(true);

            // Clean up cloned window
            const activityLink = newWindow.querySelector('.activity-link');
            if (activityLink) {
                activityLink.classList.remove('activity-link');
                activityLink.classList.add('activity-link-cloned');
            }

            // Position offset from original
            const originalRect = template.getBoundingClientRect();
            Object.assign(newWindow.style, {
                left: (originalRect.left + CONFIG.WINDOW_OFFSET) + 'px',
                top: (originalRect.top + CONFIG.WINDOW_OFFSET) + 'px',
                transform: 'none'
            });

            document.body.appendChild(newWindow);
            return this.createWindow(newWindow, options);
        }
    }

    // Add hover effects with macOS symbols for traffic lights
    const style = document.createElement('style');
    style.textContent = `
        .macos-traffic-light::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-weight: 900;
            color: rgba(0, 0, 0, 0.7);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            line-height: 1;
        }

        .macos-traffic-light.red::before {
            content: '×';
            font-size: 16px;
            margin-top: 0px;
        }

        .macos-traffic-light.yellow::before {
            content: '−';
            font-size: 16px;
            margin-top: 0px;
        }

        .macos-traffic-light.green::before {
            content: '⤡';
            font-size: 14px;
            margin-top: -1px;
        }

        .macos-traffic-light:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Make sure content area doesn't interfere with dragging
    const contentElement = document.querySelector('.macos-content');
    if (contentElement) {
        contentElement.style.pointerEvents = 'auto';
    }

    // Initialize the system
    const windowManager = new WindowManager();

    // Load and create the main window from template
    const mainWindow = windowManager.loadWindowFromTemplate('main-window-template');
    if (mainWindow) {
        windowManager.setupWindowLinks(mainWindow.element);
    }
});
