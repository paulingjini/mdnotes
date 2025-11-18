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
    }

    /**
     * Update preview with markdown content
     */
    update(markdown) {
        if (!this.container || !window.marked) return;

        try {
            // Parse markdown
            let html = marked.parse(markdown || '');

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

        } catch (error) {
            console.error('Preview render error:', error);
            this.container.innerHTML = `<p style="color: red;">Error rendering preview: ${error.message}</p>`;
        }
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
