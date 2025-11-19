/**
 * Mindmap Module - Handles mindmap visualization
 */
export class Mindmap {
    constructor() {
        this.container = null;
        this.instance = null;
        this.isFullscreen = false;
        this.focusEnabled = true;
        this.currentFocusNode = null;
        this.nodes = [];
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

            // Store nodes for focus management
            this.extractNodes(root);

            // Apply focus if enabled
            if (this.focusEnabled && this.currentFocusNode !== null) {
                this.highlightNode(this.currentFocusNode);
            }

        } catch (error) {
            console.error('Mindmap render error:', error);
            this.container.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary)">Error: ${error.message}</div>`;
        }
    }

    /**
     * Extract all nodes from mindmap tree for indexing
     */
    extractNodes(node, depth = 0, index = [0]) {
        if (!node) return;

        this.nodes = this.nodes || [];
        node.nodeIndex = index[0]++;
        this.nodes.push({
            index: node.nodeIndex,
            depth: depth,
            content: node.content,
            node: node
        });

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                this.extractNodes(child, depth + 1, index);
            });
        }
    }

    /**
     * Highlight a specific node by index
     */
    highlightNode(nodeIndex) {
        if (!this.instance || !this.focusEnabled) return;

        this.currentFocusNode = nodeIndex;

        // Remove previous highlights
        const svg = this.container.querySelector('svg');
        if (!svg) return;

        // Remove all existing highlights
        svg.querySelectorAll('.mindmap-active-node').forEach(el => {
            el.classList.remove('mindmap-active-node');
        });

        // Find and highlight the target node
        const circles = svg.querySelectorAll('circle');
        if (circles[nodeIndex]) {
            circles[nodeIndex].classList.add('mindmap-active-node');

            // Scroll to node if needed
            const node = circles[nodeIndex];
            const bbox = node.getBBox();
            const ctm = node.getCTM();

            if (ctm) {
                const x = bbox.x + ctm.e;
                const y = bbox.y + ctm.f;

                // Center the node in view (using markmap's pan/zoom)
                if (this.instance.svg) {
                    // Markmap uses d3 zoom, we can access it
                    const zoom = window.d3.zoom();
                    const svg = window.d3.select(this.container.querySelector('svg'));

                    // Calculate transform to center node
                    const width = this.container.clientWidth;
                    const height = this.container.clientHeight;
                    const scale = 1;
                    const translateX = width / 2 - x * scale;
                    const translateY = height / 2 - y * scale;

                    // Apply transform smoothly
                    svg.transition()
                        .duration(500)
                        .call(zoom.transform, window.d3.zoomIdentity.translate(translateX, translateY).scale(scale));
                }
            }
        }
    }

    /**
     * Toggle focus feature
     */
    toggleFocus() {
        this.focusEnabled = !this.focusEnabled;

        if (!this.focusEnabled) {
            // Remove all highlights
            const svg = this.container?.querySelector('svg');
            if (svg) {
                svg.querySelectorAll('.mindmap-active-node').forEach(el => {
                    el.classList.remove('mindmap-active-node');
                });
            }
        } else if (this.currentFocusNode !== null) {
            // Restore highlight
            this.highlightNode(this.currentFocusNode);
        }

        return this.focusEnabled;
    }

    /**
     * Set focus on specific heading by text
     */
    focusOnHeading(headingText) {
        if (!this.focusEnabled) return;

        const nodeInfo = this.nodes.find(n =>
            n.content && n.content.toLowerCase().includes(headingText.toLowerCase())
        );

        if (nodeInfo) {
            this.highlightNode(nodeInfo.index);
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
