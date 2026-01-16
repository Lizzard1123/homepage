// Window drag and control functionality
document.addEventListener('DOMContentLoaded', function() {
    const windowElement = document.querySelector('.macos-window');
    const headerElement = document.querySelector('.macos-header');
    const redLight = document.querySelector('.macos-traffic-light.red');
    const yellowLight = document.querySelector('.macos-traffic-light.yellow');
    const greenLight = document.querySelector('.macos-traffic-light.green');

    if (!windowElement || !headerElement) return;

    // Create snap zone indicators
    const leftSnapZone = document.createElement('div');
    const rightSnapZone = document.createElement('div');

    // Style the snap zone indicators
    const snapZoneStyle = `
        position: fixed;
        top: 32px;
        width: calc(50% - 24px);
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

    leftSnapZone.style.cssText = snapZoneStyle + 'left: 16px;';
    rightSnapZone.style.cssText = snapZoneStyle + 'left: calc(50% + 8px);';

    document.body.appendChild(leftSnapZone);
    document.body.appendChild(rightSnapZone);

    // Make window position absolute for dragging
    windowElement.style.position = 'absolute';
    windowElement.style.zIndex = '10';
    windowElement.style.left = '50%';
    windowElement.style.top = '32px'; // Position at top with padding
    windowElement.style.transform = 'translateX(-50%)'; // Only center horizontally
    windowElement.style.maxWidth = '1024px';
    windowElement.style.width = '100%';

    // Prevent text selection during drag
    windowElement.style.userSelect = 'none';
    windowElement.style.WebkitUserSelect = 'none';
    windowElement.style.MozUserSelect = 'none';
    windowElement.style.msUserSelect = 'none';

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let windowStartX = 0;
    let windowStartY = 0;

    // Mouse down on header to start dragging
    headerElement.addEventListener('mousedown', function(e) {
        isDragging = true;

        // Get current window position
        const rect = windowElement.getBoundingClientRect();
        windowStartX = rect.left;
        windowStartY = rect.top;

        // Store mouse position relative to window
        dragStartX = e.clientX - windowStartX;
        dragStartY = e.clientY - windowStartY;

        // Prevent text selection
        e.preventDefault();
    });

    // Mouse move to drag window
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const newX = e.clientX - dragStartX;
        const newY = e.clientY - dragStartY;

        // Constrain to viewport bounds (optional - remove if you want it to go off-screen)
        const rect = windowElement.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        windowElement.style.left = constrainedX + 'px';
        windowElement.style.top = constrainedY + 'px';
        windowElement.style.transform = 'none';

        // Check for snap zones (within 50px of edges)
        const snapThreshold = 50;
        const isNearLeft = constrainedX <= snapThreshold;
        const isNearRight = constrainedX >= maxX - snapThreshold;

        // Show/hide snap zone indicators
        leftSnapZone.style.opacity = isNearLeft ? '1' : '0';
        rightSnapZone.style.opacity = isNearRight ? '1' : '0';
    });

    // Mouse up to stop dragging
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;

        // Check if we should snap to a side based on current window position
        const rect = windowElement.getBoundingClientRect();
        const snapThreshold = 50;
        const isNearLeft = rect.left <= snapThreshold;
        const isNearRight = rect.left >= window.innerWidth - rect.width - snapThreshold;

        if (isNearLeft) {
            // Snap to left side - set width immediately, then animate position
            windowElement.style.width = 'calc(50% - 24px)';
            windowElement.style.maxWidth = 'none';
            windowElement.style.transition = 'left, top, transform 0.3s ease';
            windowElement.style.left = '16px';
            windowElement.style.top = '32px';
            windowElement.style.transform = 'none';

            setTimeout(() => {
                windowElement.style.transition = '';
            }, 300);
        } else if (isNearRight) {
            // Snap to right side - set width immediately, then animate position
            windowElement.style.width = 'calc(50% - 24px)';
            windowElement.style.maxWidth = 'none';
            windowElement.style.transition = 'left, top, transform 0.3s ease';
            windowElement.style.left = 'calc(50% + 8px)';
            windowElement.style.top = '32px';
            windowElement.style.transform = 'none';

            setTimeout(() => {
                windowElement.style.transition = '';
            }, 300);
        }

        // Hide snap indicators
        leftSnapZone.style.opacity = '0';
        rightSnapZone.style.opacity = '0';

        isDragging = false;
    });

    // Traffic light functionality
    function removeWindow() {
        windowElement.style.transition = 'opacity 0.6s ease';
        windowElement.style.opacity = '0';
        setTimeout(() => {
            windowElement.remove();
        }, 600);
    }

    function centerWindow() {
        windowElement.style.transition = 'all 0.6s ease';
        windowElement.style.left = '50%';
        windowElement.style.top = '32px';
        windowElement.style.transform = 'translateX(-50%)';
        windowElement.style.width = '100%';
        windowElement.style.maxWidth = '1024px';
        setTimeout(() => {
            windowElement.style.transition = '';
        }, 600);
    }

    // Add click handlers to traffic lights
    redLight.addEventListener('click', removeWindow);
    yellowLight.addEventListener('click', removeWindow);
    greenLight.addEventListener('click', centerWindow);

    // Set cursor for traffic lights
    redLight.style.cursor = 'pointer';
    yellowLight.style.cursor = 'pointer';
    greenLight.style.cursor = 'pointer';

    // Add hover effects with macOS symbols
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

    // Add cursor style to header for dragging
    headerElement.style.cursor = 'grab';

    // Change cursor during drag
    headerElement.addEventListener('mousedown', function() {
        headerElement.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', function() {
        headerElement.style.cursor = 'grab';
    });

    // Prevent resizing by overriding any resize handles
    windowElement.style.resize = 'none';

    // Handle window resize to update snap zones
    window.addEventListener('resize', function() {
        // Update snap zone sizes
        leftSnapZone.style.width = 'calc(50% - 24px)';
        leftSnapZone.style.height = 'calc(100vh - 64px)';
        rightSnapZone.style.width = 'calc(50% - 24px)';
        rightSnapZone.style.height = 'calc(100vh - 64px)';
        rightSnapZone.style.left = 'calc(50% + 8px)';
    });

    // Make sure content area doesn't interfere with dragging
    const contentElement = document.querySelector('.macos-content');
    if (contentElement) {
        contentElement.style.pointerEvents = 'auto';
    }
});