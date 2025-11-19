/**
 * Sync Module - Handles synchronization between editor, preview, and mindmap
 */
export class SyncManager {
    constructor(editor, preview, mindmap) {
        this.editor = editor;
        this.preview = preview;
        this.mindmap = mindmap;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.enabled = true;
    }

    /**
     * Initialize synchronization
     */
    init() {
        this.setupEditorSync();
        this.setupPreviewSync();
        this.setupBidirectionalSync();
        console.log('Sync manager initialized');
    }

    /**
     * Setup bidirectional editing (preview to editor)
     */
    setupBidirectionalSync() {
        if (this.preview) {
            // Set callback for preview element clicks
            this.preview.onElementClick = (lineNumber) => {
                this.jumpToLine(lineNumber);
            };
        }
    }

    /**
     * Jump to specific line in editor
     */
    jumpToLine(lineNumber) {
        if (!this.editor || !this.editor.cm) return;

        // Scroll to line
        this.editor.cm.scrollIntoView({ line: lineNumber, ch: 0 }, 200);

        // Set cursor to that line
        this.editor.cm.setCursor({ line: lineNumber, ch: 0 });

        // Focus the editor
        this.editor.cm.focus();

        // Highlight the line temporarily
        this.highlightEditorLine(lineNumber);
    }

    /**
     * Highlight a line in the editor temporarily
     */
    highlightEditorLine(lineNumber) {
        if (!this.editor || !this.editor.cm) return;

        const lineHandle = this.editor.cm.getLineHandle(lineNumber);
        if (!lineHandle) return;

        // Add temporary highlight class
        this.editor.cm.addLineClass(lineNumber, 'background', 'editor-highlight-line');

        // Remove after 2 seconds
        setTimeout(() => {
            this.editor.cm.removeLineClass(lineNumber, 'background', 'editor-highlight-line');
        }, 2000);
    }

    /**
     * Enable/disable synchronization
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Setup editor scroll synchronization
     */
    setupEditorSync() {
        if (!this.editor.cm) return;

        // Sync scroll from editor to preview
        this.editor.cm.on('scroll', () => {
            if (!this.enabled || this.isScrolling) return;

            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.syncEditorToPreview();
            }, 100);
        });

        // Sync cursor position
        this.editor.cm.on('cursorActivity', () => {
            if (!this.enabled) return;
            this.syncCursorPosition();
        });
    }

    /**
     * Setup preview scroll synchronization
     */
    setupPreviewSync() {
        const previewEl = document.getElementById('preview');
        if (!previewEl) return;

        previewEl.addEventListener('scroll', () => {
            if (!this.enabled || this.isScrolling) return;

            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.syncPreviewToEditor();
            }, 100);
        });
    }

    /**
     * Sync editor scroll to preview
     */
    syncEditorToPreview() {
        if (!this.editor.cm || !this.preview.container) return;

        const editorScrollInfo = this.editor.cm.getScrollInfo();
        const scrollPercentage = editorScrollInfo.top / (editorScrollInfo.height - editorScrollInfo.clientHeight);

        const previewEl = this.preview.container;
        const previewScrollHeight = previewEl.scrollHeight - previewEl.clientHeight;

        this.isScrolling = true;
        previewEl.scrollTop = scrollPercentage * previewScrollHeight;

        setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }

    /**
     * Sync preview scroll to editor
     */
    syncPreviewToEditor() {
        if (!this.editor.cm || !this.preview.container) return;

        const previewEl = this.preview.container;
        const scrollPercentage = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight);

        const editorScrollInfo = this.editor.cm.getScrollInfo();
        const editorScrollHeight = editorScrollInfo.height - editorScrollInfo.clientHeight;

        this.isScrolling = true;
        this.editor.cm.scrollTo(null, scrollPercentage * editorScrollHeight);

        setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }

    /**
     * Sync cursor position to preview and mindmap
     */
    syncCursorPosition() {
        if (!this.editor.cm) return;

        const cursor = this.editor.cm.getCursor();
        const line = cursor.line;

        // Get the text up to cursor
        const textUpToCursor = this.editor.cm.getRange({ line: 0, ch: 0 }, cursor);

        // Count headings to sync with mindmap
        const headings = textUpToCursor.match(/^#+\s/gm);
        const headingCount = headings ? headings.length : 0;

        // Highlight current section in preview
        this.highlightPreviewSection(line);

        // Highlight current node in mindmap
        this.highlightMindmapNode(headingCount);
    }

    /**
     * Highlight section in preview based on editor line
     */
    highlightPreviewSection(line) {
        if (!this.preview.container) return;

        // Remove previous highlights
        const previews = this.preview.container.querySelectorAll('.sync-highlight');
        previews.forEach(el => el.classList.remove('sync-highlight'));

        // Find corresponding element
        // This is a simplified version - could be enhanced with line mapping
        const content = this.editor.getValue();
        const lines = content.split('\n');
        let currentHeading = null;

        for (let i = 0; i <= line; i++) {
            if (lines[i].match(/^#+\s/)) {
                currentHeading = lines[i];
            }
        }

        if (currentHeading) {
            const headingText = currentHeading.replace(/^#+\s/, '').trim();
            const headingElements = this.preview.container.querySelectorAll('h1, h2, h3, h4, h5, h6');

            headingElements.forEach(el => {
                if (el.textContent.trim() === headingText) {
                    el.classList.add('sync-highlight');
                    // Scroll into view if needed
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    /**
     * Highlight node in mindmap
     */
    highlightMindmapNode(nodeIndex) {
        if (this.mindmap && this.mindmap.instance && this.mindmap.focusEnabled) {
            // Highlight the node using the new focus feature
            this.mindmap.highlightNode(nodeIndex);
        }
    }

    /**
     * Get line mapping between editor and preview
     */
    getLineMapping() {
        const content = this.editor.getValue();
        const lines = content.split('\n');
        const mapping = [];

        let htmlOffset = 0;
        lines.forEach((line, index) => {
            mapping[index] = htmlOffset;
            // Estimate HTML offset (simplified)
            if (line.trim()) htmlOffset++;
        });

        return mapping;
    }

    /**
     * Scroll to specific heading in all panels
     */
    scrollToHeading(headingText) {
        // Scroll in editor
        if (this.editor.cm) {
            const content = this.editor.getValue();
            const lines = content.split('\n');
            const lineIndex = lines.findIndex(line =>
                line.match(/^#+\s/) && line.includes(headingText)
            );

            if (lineIndex >= 0) {
                this.editor.cm.scrollIntoView({ line: lineIndex, ch: 0 }, 200);
            }
        }

        // Scroll in preview
        if (this.preview.container) {
            const headings = this.preview.container.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(h => {
                if (h.textContent.includes(headingText)) {
                    h.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }
}
