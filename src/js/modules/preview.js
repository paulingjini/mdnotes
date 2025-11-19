/**
 * Preview Module - Handles markdown preview rendering
 */
export class Preview {
    constructor() {
        this.container = null;
        this.isFullscreen = false;
    }

    /**
     * Initialize preview
     */
    init() {
        this.container = document.getElementById('preview');
        if (!this.container) {
            console.error('Preview container not found');
            return false;
        }

        // Initialize marked.js with extensions
        if (window.marked) {
            this.initMarked();
        }

        // Initialize mermaid
        if (window.mermaid) {
            window.mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose'
            });
        }

        return true;
    }

    /**
     * Initialize marked with extensions
     */
    initMarked() {
        // Add GFM heading IDs
        if (window.markedGfmHeadingId) {
            marked.use(window.markedGfmHeadingId.gfmHeadingId());
        }

        // Add syntax highlighting
        if (window.markedHighlight && window.hljs) {
            marked.use(window.markedHighlight.markedHighlight({
                langPrefix: 'language-',
                highlight(code, lang) {
                    const language = window.hljs.getLanguage(lang) ? lang : 'plaintext';
                    return window.hljs.highlight(code, { language }).value;
                }
            }));
        }

        // Custom renderer for bidirectional editing
        this.setupBidirectionalRenderer();
    }

    /**
     * Setup custom renderer for line tracking
     */
    setupBidirectionalRenderer() {
        // This will be handled in parseWithLineNumbers method
    }

    /**
     * Update preview with markdown content
     */
    update(markdown) {
        if (!this.container || !window.marked) return;

        try {
            // Create line mapping
            this.createLineMapping(markdown);

            // Parse markdown with custom renderer
            let html = this.parseWithLineNumbers(markdown);

            // Process chart blocks
            html = this.processCharts(html);

            // Update container
            this.container.innerHTML = html;

            // Render mermaid diagrams
            if (window.mermaid) {
                window.mermaid.run({
                    nodes: this.container.querySelectorAll('.language-mermaid, .language-chart')
                });
            }

            // Render chart.js charts
            this.renderCharts();

            // Setup click handlers for bidirectional editing
            this.setupBidirectionalHandlers();

        } catch (error) {
            console.error('Preview render error:', error);
            this.container.innerHTML = `<p style="color: red;">Error rendering preview: ${error.message}</p>`;
        }
    }

    /**
     * Create line mapping from markdown
     */
    createLineMapping(markdown) {
        const lines = markdown.split('\n');
        this.lineMapping = {};

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed) {
                // Store line number for non-empty lines
                this.lineMapping[trimmed.substring(0, 50)] = index;
            }
        });
    }

    /**
     * Parse markdown with line number tracking
     */
    parseWithLineNumbers(markdown) {
        const lines = markdown.split('\n');
        let html = marked.parse(markdown);

        // Post-process HTML to add line numbers and editable class
        // Find text content in HTML and match it back to source lines
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const elements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');

        elements.forEach(element => {
            const text = element.textContent.trim();
            if (text) {
                // Find the line number in the source
                const lineNumber = this.findLineNumber(text, lines);
                if (lineNumber !== -1) {
                    element.setAttribute('data-source-line', lineNumber);
                    element.classList.add('editable-element');
                }
            }
        });

        return tempDiv.innerHTML;
    }

    /**
     * Find line number for given text in source
     */
    findLineNumber(text, lines) {
        // Try exact match first
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === text || lines[i].includes(text.substring(0, 30))) {
                return i;
            }
        }

        // Try fuzzy match (removing markdown syntax)
        const cleanText = text.replace(/[*_`#]/g, '').trim();
        for (let i = 0; i < lines.length; i++) {
            const cleanLine = lines[i].replace(/[*_`#]/g, '').trim();
            if (cleanLine.includes(cleanText.substring(0, 30))) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Setup bidirectional click handlers
     */
    setupBidirectionalHandlers() {
        if (!this.container) return;

        const editableElements = this.container.querySelectorAll('.editable-element');

        editableElements.forEach(element => {
            element.style.cursor = 'pointer';
            element.title = 'Click to jump to editor';

            element.addEventListener('click', (e) => {
                const sourceLine = element.getAttribute('data-source-line');
                if (sourceLine !== null && this.onElementClick) {
                    e.stopPropagation();
                    this.onElementClick(parseInt(sourceLine));
                }
            });
        });
    }

    /**
     * Process chart code blocks
     */
    processCharts(html) {
        // This will be enhanced by the charts extension
        return html;
    }

    /**
     * Render Chart.js charts
     */
    renderCharts() {
        if (!window.Chart) return;

        const chartBlocks = this.container.querySelectorAll('pre code.language-chart');
        chartBlocks.forEach((block, index) => {
            try {
                const config = JSON.parse(block.textContent);
                const canvas = document.createElement('canvas');
                canvas.id = `chart-${index}`;
                canvas.width = 400;
                canvas.height = 300;

                // Replace code block with canvas
                const pre = block.parentElement;
                pre.parentElement.replaceChild(canvas, pre);

                // Create chart
                new Chart(canvas, config);
            } catch (e) {
                console.error('Chart render error:', e);
            }
        });
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const panel = document.getElementById('previewPanel');
        if (panel) {
            panel.classList.toggle('fullscreen-mode');
            this.isFullscreen = !this.isFullscreen;

            // Update button icon if needed
            const icon = document.querySelector('#previewPanel .panel-header .icon-btn use');
            if (icon) {
                icon.setAttribute('href', this.isFullscreen ? '#icon-minimize' : '#icon-maximize');
            }
        }
    }

    /**
     * Clear preview
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Get preview HTML
     */
    getHTML() {
        return this.container ? this.container.innerHTML : '';
    }

    /**
     * Export preview to standalone HTML
     */
    exportHTML(markdown, theme) {
        const html = marked.parse(markdown);
        const themeColors = this.getThemeColors(theme);

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Document</title>
    <style>
        body {
            font-family: 'Consolas', monospace;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: ${themeColors.bg};
            color: ${themeColors.text};
            line-height: 1.6;
        }
        h1, h2 { color: ${themeColors.accent}; border-bottom: 1px solid ${themeColors.border}; }
        code { background: ${themeColors.codeBg}; padding: 2px 5px; border-radius: 3px; }
        pre { background: ${themeColors.codeBg}; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid ${themeColors.border}; padding-left: 1em; color: ${themeColors.mutedText}; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid ${themeColors.border}; padding: 8px 12px; }
        th { background: ${themeColors.codeBg}; font-weight: bold; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    }

    /**
     * Get theme colors for export
     */
    getThemeColors(theme) {
        const themes = {
            dark: { bg: '#1e1e1e', text: '#d4d4d4', accent: '#007acc', border: '#3e3e42', codeBg: '#2d2d30', mutedText: '#808080' },
            light: { bg: '#fff', text: '#000', accent: '#0066cc', border: '#ccc', codeBg: '#f0f0f0', mutedText: '#666' }
        };

        return themes[theme] || themes.dark;
    }
}
