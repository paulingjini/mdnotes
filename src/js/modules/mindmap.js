/**
 * Mindmap Module - Handles mindmap visualization
 */
export class Mindmap {
    constructor() {
        this.container = null;
        this.instance = null;
        this.isFullscreen = false;
    }

    /**
     * Initialize mindmap
     */
    async init() {
        this.container = document.getElementById('mindmap');
        if (!this.container) {
            console.error('Mindmap container not found');
            return false;
        }

        // Wait for markmap to load
        try {
            await this.waitForMarkmap();
            console.log('Markmap ready');
            return true;
        } catch (error) {
            console.error('Markmap initialization failed:', error);
            this.container.innerHTML = '<div style="text-align:center;padding:50px;color:var(--text-secondary)">Markmap failed to load</div>';
            return false;
        }
    }

    /**
     * Wait for markmap library to load
     */
    waitForMarkmap() {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = setInterval(() => {
                if (window.markmap && window.markmap.Markmap) {
                    clearInterval(check);
                    resolve();
                }
                if (Date.now() - start > 10000) {
                    clearInterval(check);
                    reject(new Error('Markmap load timeout'));
                }
            }, 100);
        });
    }

    /**
     * Render mindmap from markdown
     */
    render(markdown) {
        if (!window.markmap || !this.container) return;

        try {
            // Destroy previous instance
            if (this.instance) {
                this.instance.destroy();
            }

            // Transform markdown to mindmap data
            const transformer = new window.markmap.Transformer();
            const { root } = transformer.transform(markdown || '# Empty');

            // Clear container
            this.container.innerHTML = '';

            // Create SVG
            const svg = window.d3.select('#mindmap')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%');

            // Create and render mindmap
            this.instance = window.markmap.Markmap.create(svg.node(), null, root);
            this.instance.fit();

        } catch (error) {
            console.error('Mindmap render error:', error);
            this.container.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary)">Error: ${error.message}</div>`;
        }
    }

    /**
     * Fit mindmap to container
     */
    fit() {
        if (this.instance) {
            this.instance.fit();
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const panel = document.getElementById('mindmapPanel');
        if (panel) {
            panel.classList.toggle('fullscreen-mode');
            this.isFullscreen = !this.isFullscreen;

            // Refresh mindmap after fullscreen toggle
            setTimeout(() => this.fit(), 100);
        }
    }

    /**
     * Clear mindmap
     */
    clear() {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Export mindmap to SVG
     */
    exportSVG() {
        if (!this.container) return null;

        const svg = this.container.querySelector('svg');
        if (!svg) return null;

        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg);
    }

    /**
     * Export mindmap to PNG (via canvas)
     */
    async exportPNG() {
        const svg = this.container.querySelector('svg');
        if (!svg || !window.html2canvas) return null;

        try {
            const canvas = await html2canvas(svg);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Mindmap PNG export error:', error);
            return null;
        }
    }
}
