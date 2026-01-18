// Debug Window System
document.addEventListener('DOMContentLoaded', function() {
    let debugWindowInstance = null;

    // Function to initialize debug functionality once window manager is ready
    function initDebug() {
        if (!window.openDebugWindow) {
            setTimeout(initDebug, 100);
            return;
        }

        // Listen for backtick (`) key shortcut
        document.addEventListener('keydown', function(event) {
            // Check if backtick key is pressed
            if (event.key === '`') {
                event.preventDefault();

                // Check if debug window is already open
                if (debugWindowInstance && debugWindowInstance.element && document.body.contains(debugWindowInstance.element)) {
                    // Bring existing debug window to front
                    debugWindowInstance.windowManager.bringToFront(debugWindowInstance);
                } else {
                    // Create new debug window
                    debugWindowInstance = window.openDebugWindow();
                }
            }
        });
    }

    // Start initialization
    initDebug();
});