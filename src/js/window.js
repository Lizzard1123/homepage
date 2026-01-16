// Window drag and control functionality
document.addEventListener('DOMContentLoaded', function() {
    const windowElement = document.querySelector('.macos-window');
    const headerElement = document.querySelector('.macos-header');
    const redLight = document.querySelector('.macos-traffic-light.red');
    const yellowLight = document.querySelector('.macos-traffic-light.yellow');
    const greenLight = document.querySelector('.macos-traffic-light.green');

    if (!windowElement || !headerElement) return;

    // Make window position absolute for dragging
    windowElement.style.position = 'absolute';
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
    });

    // Mouse up to stop dragging
    document.addEventListener('mouseup', function() {
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

    // Make sure content area doesn't interfere with dragging
    const contentElement = document.querySelector('.macos-content');
    if (contentElement) {
        contentElement.style.pointerEvents = 'auto';
    }
});