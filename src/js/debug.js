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

                // Check if template store is already open
                if (templateStoreInstance && templateStoreInstance.element && document.body.contains(templateStoreInstance.element)) {
                    // Bring existing template store to front
                    templateStoreInstance.windowManager.bringToFront(templateStoreInstance);
                } else {
                    // Create new template store window
                    templateStoreInstance = window.openDebugWindow();
                    // Initialize KaTeX and Mermaid after window is created
                    setTimeout(initializeTemplateStore, 100);
                }
            }
        });
    }

    // Initialize KaTeX, Prism.js, and Mermaid for the template store
    function initializeTemplateStore() {
        if (templateStoreInstance && templateStoreInstance.element) {
            const content = templateStoreInstance.element.querySelector('.debug-content');

            if (content) {
                // Initialize syntax highlighting with Highlight.js
                if (window.hljs) {
                    // Configure highlight.js for common languages
                    setTimeout(() => {
                        // Highlight all code blocks in the template store
                        content.querySelectorAll('pre code:not(.language-mermaid)').forEach((codeBlock) => {
                            window.hljs.highlightElement(codeBlock);
                        });
                    }, 200);
                }

                // Initialize KaTeX for math expressions
                if (window.renderMathInElement) {
                    window.renderMathInElement(content, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '\\[', right: '\\]', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\(', right: '\\)', display: false}
                        ],
                        throwOnError: false
                    });
                }

                // Initialize Mermaid diagrams (James Akl style)
                if (window.mermaid) {
                    // Convert pre code.language-mermaid to mermaid divs first
                    content.querySelectorAll('pre code.language-mermaid').forEach((block) => {
                        const pre = block.parentElement;
                        const mermaidDiv = document.createElement('div');
                        mermaidDiv.className = 'mermaid';
                        mermaidDiv.textContent = block.textContent.trim();
                        pre.replaceWith(mermaidDiv);
                    });

                    // Initialize mermaid after DOM changes
                    setTimeout(() => {
                        window.mermaid.initialize({
                            startOnLoad: true,
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
                        window.mermaid.run();
                    }, 200);
                }
            }
        }
    }

    // Start initialization
    initTemplateStore();
});