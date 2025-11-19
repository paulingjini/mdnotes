/**
 * Block Component - Notion-style editable block
 * Handles rendering, keyboard events, and block operations
 */

// Note: db is global, defined in blocks-db.js

export class Block {
    constructor(blockData, pageId, onUpdate, onDelete, onCreateBelow, onFocusPrevious) {
        this.id = blockData.id;
        this.pageId = pageId;
        this.type = blockData.type || 'text';
        this.content = blockData.content || '';
        this.properties = blockData.properties || {};
        this.parentId = blockData.parentId;
        this.childIds = blockData.childIds || [];
        this.position = blockData.position || 0;

        // Callbacks
        this.onUpdate = onUpdate;
        this.onDelete = onDelete;
        this.onCreateBelow = onCreateBelow;
        this.onFocusPrevious = onFocusPrevious;

        // DOM element
        this.element = null;
        this.contentElement = null;

        // State
        this.isSlashMenuOpen = false;
        this.slashMenuElement = null;
    }

    /**
     * Render the block
     */
    render() {
        const container = document.createElement('div');
        container.className = 'block-container';
        container.dataset.blockId = this.id;
        container.dataset.blockType = this.type;

        // Block handle (drag icon)
        const handle = document.createElement('div');
        handle.className = 'block-handle';
        handle.innerHTML = '⋮⋮';
        handle.draggable = true;

        // Block content area
        const contentArea = document.createElement('div');
        contentArea.className = 'block-content-area';

        // Render based on type
        const content = this.renderContent();
        contentArea.appendChild(content);

        container.appendChild(handle);
        container.appendChild(contentArea);

        // Setup event listeners
        this.setupEventListeners(content);

        this.element = container;
        this.contentElement = content;

        return container;
    }

    /**
     * Render content based on block type
     */
    renderContent() {
        const element = document.createElement('div');
        element.className = `block-content block-type-${this.type}`;
        element.contentEditable = true;
        element.setAttribute('data-placeholder', this.getPlaceholder());

        // Add prefix for specific block types
        if (this.type !== 'text') {
            const prefix = document.createElement('span');
            prefix.className = 'block-prefix';
            prefix.contentEditable = false;
            prefix.textContent = this.getPrefix();
            element.appendChild(prefix);
        }

        // Add content
        const textNode = document.createTextNode(this.content);
        element.appendChild(textNode);

        return element;
    }

    /**
     * Get placeholder text for block type
     */
    getPlaceholder() {
        const placeholders = {
            text: "Type '/' for commands",
            h1: 'Heading 1',
            h2: 'Heading 2',
            h3: 'Heading 3',
            todo: 'To-do',
            bullet: 'List',
            numbered: 'Numbered list',
            quote: 'Quote',
            code: 'Code',
            toggle: 'Toggle list'
        };
        return placeholders[this.type] || "Type '/' for commands";
    }

    /**
     * Get prefix for block type
     */
    getPrefix() {
        const prefixes = {
            h1: '# ',
            h2: '## ',
            h3: '### ',
            todo: '☐ ',
            bullet: '• ',
            numbered: '1. ',
            quote: '❝ ',
            toggle: '▶ '
        };
        return prefixes[this.type] || '';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners(content) {
        // Input event for content updates
        content.addEventListener('input', (e) => this.handleInput(e));

        // Keydown for special keys
        content.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Paste event
        content.addEventListener('paste', (e) => this.handlePaste(e));

        // Focus/blur events
        content.addEventListener('focus', () => this.handleFocus());
        content.addEventListener('blur', () => this.handleBlur());
    }

    /**
     * Handle input event
     */
    handleInput(e) {
        const newContent = this.getTextContent();

        // Check for slash command
        if (newContent.startsWith('/') && !this.isSlashMenuOpen) {
            this.openSlashMenu();
        } else if (this.isSlashMenuOpen && !newContent.startsWith('/')) {
            this.closeSlashMenu();
        }

        // Update content
        this.content = newContent;
        this.saveContent();

        // Notify parent
        if (this.onUpdate) {
            this.onUpdate(this.id, { content: newContent });
        }
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(e) {
        // Enter key - create new block below
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            if (this.isSlashMenuOpen) {
                this.closeSlashMenu();
            }

            // Get cursor position
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const cursorOffset = range.startOffset;
            const textContent = this.getTextContent();

            // Split content at cursor
            const beforeCursor = textContent.substring(0, cursorOffset);
            const afterCursor = textContent.substring(cursorOffset);

            // Update current block
            this.content = beforeCursor;
            this.setTextContent(beforeCursor);
            this.saveContent();

            // Create new block with remaining text
            if (this.onCreateBelow) {
                this.onCreateBelow(this.id, afterCursor);
            }
        }

        // Backspace at start - delete block and merge with previous
        else if (e.key === 'Backspace') {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);

            if (range.startOffset === 0 && range.endOffset === 0) {
                e.preventDefault();

                const content = this.getTextContent();

                // Delete this block
                if (this.onDelete) {
                    this.onDelete(this.id, content);
                }
            }
        }

        // Tab - indent block
        else if (e.key === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                // Shift+Tab - outdent
                this.outdent();
            } else {
                // Tab - indent
                this.indent();
            }
        }

        // Arrow Up - focus previous block
        else if (e.key === 'ArrowUp') {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);

            // Only if at start of block
            if (range.startOffset === 0) {
                e.preventDefault();
                if (this.onFocusPrevious) {
                    this.onFocusPrevious(this.id);
                }
            }
        }

        // Escape - close slash menu
        else if (e.key === 'Escape') {
            if (this.isSlashMenuOpen) {
                e.preventDefault();
                this.closeSlashMenu();
            }
        }
    }

    /**
     * Handle paste event
     */
    handlePaste(e) {
        e.preventDefault();

        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');

        // Insert at cursor
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));

        // Move cursor to end of inserted text
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger input event
        this.contentElement.dispatchEvent(new Event('input'));
    }

    /**
     * Handle focus
     */
    handleFocus() {
        this.element.classList.add('block-focused');
    }

    /**
     * Handle blur
     */
    handleBlur() {
        this.element.classList.remove('block-focused');
        this.saveContent();

        // Close slash menu
        if (this.isSlashMenuOpen) {
            setTimeout(() => this.closeSlashMenu(), 200);
        }
    }

    /**
     * Get text content (without HTML)
     */
    getTextContent() {
        let text = this.contentElement.textContent;

        // Remove prefix if present
        const prefix = this.getPrefix();
        if (prefix && text.startsWith(prefix)) {
            text = text.substring(prefix.length);
        }

        return text;
    }

    /**
     * Set text content
     */
    setTextContent(text) {
        // Clear content
        while (this.contentElement.firstChild) {
            this.contentElement.removeChild(this.contentElement.firstChild);
        }

        // Add prefix if needed
        if (this.type !== 'text') {
            const prefix = document.createElement('span');
            prefix.className = 'block-prefix';
            prefix.contentEditable = false;
            prefix.textContent = this.getPrefix();
            this.contentElement.appendChild(prefix);
        }

        // Add text
        this.contentElement.appendChild(document.createTextNode(text));
    }

    /**
     * Save content to database
     */
    async saveContent() {
        await db.updateBlockContent(this.id, this.content);
    }

    /**
     * Indent block
     */
    async indent() {
        const success = await db.indentBlock(this.id);
        if (success && this.onUpdate) {
            this.onUpdate(this.id, { action: 'indent' });
        }
    }

    /**
     * Outdent block
     */
    async outdent() {
        const success = await db.outdentBlock(this.id);
        if (success && this.onUpdate) {
            this.onUpdate(this.id, { action: 'outdent' });
        }
    }

    /**
     * Change block type
     */
    async changeType(newType) {
        this.type = newType;
        await db.updateBlockType(this.id, newType);

        // Re-render
        const newContent = this.renderContent();
        this.contentElement.parentNode.replaceChild(newContent, this.contentElement);
        this.contentElement = newContent;
        this.setupEventListeners(newContent);

        // Focus
        this.focus();

        if (this.onUpdate) {
            this.onUpdate(this.id, { type: newType });
        }
    }

    /**
     * Focus this block
     */
    focus() {
        this.contentElement.focus();

        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(this.contentElement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Open slash command menu
     */
    openSlashMenu() {
        this.isSlashMenuOpen = true;

        const menu = document.createElement('div');
        menu.className = 'slash-menu';
        menu.innerHTML = `
            <div class="slash-menu-item" data-type="text">
                <span class="slash-menu-icon">📝</span>
                <div>
                    <div class="slash-menu-title">Text</div>
                    <div class="slash-menu-desc">Plain text</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="h1">
                <span class="slash-menu-icon">H1</span>
                <div>
                    <div class="slash-menu-title">Heading 1</div>
                    <div class="slash-menu-desc">Large heading</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="h2">
                <span class="slash-menu-icon">H2</span>
                <div>
                    <div class="slash-menu-title">Heading 2</div>
                    <div class="slash-menu-desc">Medium heading</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="h3">
                <span class="slash-menu-icon">H3</span>
                <div>
                    <div class="slash-menu-title">Heading 3</div>
                    <div class="slash-menu-desc">Small heading</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="todo">
                <span class="slash-menu-icon">☐</span>
                <div>
                    <div class="slash-menu-title">To-do list</div>
                    <div class="slash-menu-desc">Track tasks</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="bullet">
                <span class="slash-menu-icon">•</span>
                <div>
                    <div class="slash-menu-title">Bulleted list</div>
                    <div class="slash-menu-desc">Simple bullet list</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="numbered">
                <span class="slash-menu-icon">1.</span>
                <div>
                    <div class="slash-menu-title">Numbered list</div>
                    <div class="slash-menu-desc">Ordered list</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="quote">
                <span class="slash-menu-icon">❝</span>
                <div>
                    <div class="slash-menu-title">Quote</div>
                    <div class="slash-menu-desc">Quotation block</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="code">
                <span class="slash-menu-icon">{ }</span>
                <div>
                    <div class="slash-menu-title">Code</div>
                    <div class="slash-menu-desc">Code snippet</div>
                </div>
            </div>
            <div class="slash-menu-item" data-type="toggle">
                <span class="slash-menu-icon">▶</span>
                <div>
                    <div class="slash-menu-title">Toggle list</div>
                    <div class="slash-menu-desc">Collapsible content</div>
                </div>
            </div>
        `;

        // Position menu
        const rect = this.contentElement.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left}px`;

        // Add click handlers
        menu.querySelectorAll('.slash-menu-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const type = item.dataset.type;

                // Remove slash from content
                const newContent = this.getTextContent().substring(1);
                this.content = newContent;
                this.setTextContent(newContent);

                // Change type
                this.changeType(type);

                this.closeSlashMenu();
            });
        });

        document.body.appendChild(menu);
        this.slashMenuElement = menu;
    }

    /**
     * Close slash command menu
     */
    closeSlashMenu() {
        if (this.slashMenuElement) {
            this.slashMenuElement.remove();
            this.slashMenuElement = null;
        }
        this.isSlashMenuOpen = false;
    }

    /**
     * Destroy block
     */
    destroy() {
        this.closeSlashMenu();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
