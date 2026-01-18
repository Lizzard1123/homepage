// Template Store System
document.addEventListener('DOMContentLoaded', function() {
    let templateStoreInstance = null;

    // Function to initialize template store functionality once window manager is ready
    function initTemplateStore() {
        if (!window.openDebugWindow) {
            setTimeout(initTemplateStore, 100);
            return;
        }

        // Listen for backtick (`) key shortcut
        document.addEventListener('keydown', function(event) {
            // Check if backtick key is pressed
            if (event.key === '`') {
                event.preventDefault();

                try {
                    // Check if template store is already open
                    if (templateStoreInstance && templateStoreInstance.element && document.body.contains(templateStoreInstance.element)) {
                        // Bring existing template store to front
                        if (templateStoreInstance.windowManager) {
                            templateStoreInstance.windowManager.bringToFront(templateStoreInstance);
                        }
                    } else {
                        // Create new template store window
                        templateStoreInstance = window.openDebugWindow();
                        if (templateStoreInstance) {
                            // Initialize KaTeX and Mermaid after window is created
                            setTimeout(initializeTemplateStore, 50);
                        }
                    }
                } catch (e) {
                    console.error('Error opening debug window:', e);
                }
            }
        });
    }

    // Initialize KaTeX, Highlight.js, and Mermaid for the template store
    function initializeTemplateStore() {
        if (!templateStoreInstance || !templateStoreInstance.element) return;

        const content = templateStoreInstance.element.querySelector('.debug-content');
        if (!content) return;

        // 1. Handle Mermaid diagrams FIRST to avoid raw code flash
        if (window.mermaid) {
            const mermaidContainers = [];
            // Find all mermaid code blocks
            const mermaidBlocks = content.querySelectorAll('pre code.language-mermaid');
            
            mermaidBlocks.forEach((block) => {
                const pre = block.parentElement;
                if (!pre) return;

                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = block.textContent.trim();
                
                // Replace pre with the mermaid div
                pre.replaceWith(mermaidDiv);
                mermaidContainers.push(mermaidDiv);
            });

            if (mermaidContainers.length > 0) {
                try {
                    window.mermaid.initialize({
                        startOnLoad: false, // We'll run it manually
                        theme: 'base',
                        themeVariables: {
                            primaryColor: '#1a1a1a',
                            primaryTextColor: '#e6e6e6',
                            primaryBorderColor: '#86efac',
                            lineColor: '#707070',
                            secondaryColor: '#242424',
                            tertiaryColor: '#0d0d0d',
                            background: '#1a1a1a',
                            mainBkg: '#1a1a1a',
                            secondBkg: '#242424',
                            textColor: '#e6e6e6',
                            fontSize: '14px',
                            fontFamily: 'Source Code Pro, monospace',
                            edgeLabelBackground: '#1a1a1a'
                        },
                        flowchart: {
                            useMaxWidth: true,
                            htmlLabels: true,
                            curve: 'linear',
                            padding: 10,
                            nodeSpacing: 30,
                            rankSpacing: 40
                        }
                    });

                    // Force mermaid to render all diagrams
                    window.mermaid.run().then(() => {
                        // Fade in diagrams after rendering is complete
                        setTimeout(() => {
                            mermaidContainers.forEach(container => {
                                container.style.opacity = '1';
                            });
                        }, 100);
                    }).catch(err => {
                        console.error('Mermaid render error:', err);
                        // Still try to show them if there's an error
                        mermaidContainers.forEach(container => {
                            container.style.opacity = '1';
                        });
                    });
                } catch (e) {
                    console.error('Mermaid initialization error:', e);
                }
            }
        }

        // 2. Initialize syntax highlighting with Highlight.js
        if (window.hljs) {
            // Highlight all code blocks that weren't converted to mermaid
            content.querySelectorAll('pre code').forEach((codeBlock) => {
                try {
                    window.hljs.highlightElement(codeBlock);
                } catch (e) {
                    console.error('Highlight.js error:', e);
                }
            });
        }

        // 3. Initialize KaTeX for math expressions
        if (window.renderMathInElement) {
            try {
                window.renderMathInElement(content, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false}
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.error('KaTeX error:', e);
            }
        }
    }

    // Start initialization
    initTemplateStore();
});
