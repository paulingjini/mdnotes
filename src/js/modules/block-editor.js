/**
 * Block Editor - Manages collection of blocks for a page
 * Main editor component for Notion-style block editing
 */

// Note: db and Block are global, defined in blocks-db.js and block.js

export class BlockEditor {
    constructor(container) {
        this.container = container;
        this.pageId = null;
        this.blocks = new Map(); // blockId -> Block instance
        this.blockElements = new Map(); // blockId -> DOM element

        // Callbacks
        this.onPageUpdate = null;
        this.onBlockUpdate = null;
    }

    /**
     * Initialize editor with a page
     */
    async init(pageId) {
        this.pageId = pageId;

        // Clear existing
        this.clearBlocks();

        // Load page
        const page = await db.getPage(pageId);
        if (!page) {
            throw new Error('Page not found');
        }

        // Render editor UI
        this.render(page);

        // Load and render blocks
        await this.loadBlocks();
    }

    /**
     * Render editor UI
     */
    render(page) {
        this.container.innerHTML = '';
        this.container.className = 'block-editor';

        // Title
        const titleEl = document.createElement('div');
        titleEl.className = 'block-editor-title';
        titleEl.contentEditable = true;
        titleEl.textContent = page.title;
        titleEl.addEventListener('input', (e) => {
            this.updatePageTitle(e.target.textContent);
        });
        titleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Focus first block
                const firstBlock = this.blocks.values().next().value;
                if (firstBlock) {
                    firstBlock.focus();
                }
            }
        });

        // Blocks container
        const blocksContainer = document.createElement('div');
        blocksContainer.className = 'block-editor-blocks';
        blocksContainer.id = 'blocksContainer';

        this.container.appendChild(titleEl);
        this.container.appendChild(blocksContainer);

        this.blocksContainer = blocksContainer;
    }

    /**
     * Load blocks from database
     */
    async loadBlocks() {
        const blocks = await db.getPageBlocks(this.pageId);

        if (blocks.length === 0) {
            // Create initial empty block
            await db.createBlock(this.pageId, 'text', '', null, 0);
            await this.loadBlocks();
            return;
        }

        // Render blocks
        for (const blockData of blocks) {
            await this.renderBlock(blockData);
        }
    }

    /**
     * Render a single block
     */
    async renderBlock(blockData, position = null) {
        const block = new Block(
            blockData,
            this.pageId,
            (blockId, updates) => this.handleBlockUpdate(blockId, updates),
            (blockId, content) => this.handleBlockDelete(blockId, content),
            (blockId, content) => this.handleCreateBlockBelow(blockId, content),
            (blockId) => this.handleFocusPrevious(blockId)
        );

        const element = block.render();

        // Add to container at position
        if (position !== null && position < this.blocksContainer.children.length) {
            this.blocksContainer.insertBefore(element, this.blocksContainer.children[position]);
        } else {
            this.blocksContainer.appendChild(element);
        }

        // Store references
        this.blocks.set(blockData.id, block);
        this.blockElements.set(blockData.id, element);

        return block;
    }

    /**
     * Handle block update
     */
    async handleBlockUpdate(blockId, updates) {
        if (updates.action === 'indent' || updates.action === 'outdent') {
            // Reload blocks to reflect hierarchy changes
            await this.reloadBlocks();
        }

        if (this.onBlockUpdate) {
            this.onBlockUpdate(blockId, updates);
        }
    }

    /**
     * Handle block delete
     */
    async handleBlockDelete(blockId, content) {
        // Find previous block
        const blocksArray = Array.from(this.blocks.values());
        const currentIndex = blocksArray.findIndex(b => b.id === blockId);

        if (currentIndex > 0) {
            const previousBlock = blocksArray[currentIndex - 1];

            // Append content to previous block
            if (content) {
                previousBlock.content += content;
                previousBlock.setTextContent(previousBlock.content);
                await previousBlock.saveContent();
            }

            // Focus previous block
            previousBlock.focus();
        }

        // Delete from database
        await db.deleteBlock(blockId);

        // Remove from UI
        const block = this.blocks.get(blockId);
        if (block) {
            block.destroy();
        }
        this.blocks.delete(blockId);
        this.blockElements.delete(blockId);
    }

    /**
     * Handle create block below
     */
    async handleCreateBlockBelow(blockId, content = '') {
        const currentBlock = this.blocks.get(blockId);
        if (!currentBlock) return;

        // Get position of current block
        const blocksArray = Array.from(this.blocks.values());
        const currentIndex = blocksArray.findIndex(b => b.id === blockId);
        const newPosition = currentIndex + 1;

        // Create new block in database
        const newBlockId = await db.createBlock(
            this.pageId,
            'text',
            content,
            currentBlock.parentId,
            newPosition
        );

        // Get new block data
        const newBlockData = await db.blocks.get(newBlockId);

        // Render new block
        const newBlock = await this.renderBlock(newBlockData, newPosition);

        // Focus new block
        newBlock.focus();

        // Update positions of blocks below
        await this.updateBlockPositions();
    }

    /**
     * Handle focus previous block
     */
    handleFocusPrevious(blockId) {
        const blocksArray = Array.from(this.blocks.values());
        const currentIndex = blocksArray.findIndex(b => b.id === blockId);

        if (currentIndex > 0) {
            const previousBlock = blocksArray[currentIndex - 1];
            previousBlock.focus();
        }
    }

    /**
     * Update block positions
     */
    async updateBlockPositions() {
        const blocksArray = Array.from(this.blocks.values());
        const updates = blocksArray.map((block, index) => ({
            key: block.id,
            changes: { position: index }
        }));

        if (updates.length > 0) {
            await db.blocks.bulkUpdate(updates);
        }
    }

    /**
     * Reload all blocks
     */
    async reloadBlocks() {
        this.clearBlocks();
        await this.loadBlocks();
    }

    /**
     * Clear all blocks
     */
    clearBlocks() {
        // Destroy all block instances
        this.blocks.forEach(block => block.destroy());
        this.blocks.clear();
        this.blockElements.clear();

        // Clear container
        if (this.blocksContainer) {
            this.blocksContainer.innerHTML = '';
        }
    }

    /**
     * Update page title
     */
    async updatePageTitle(title) {
        await db.updatePage(this.pageId, { title });

        if (this.onPageUpdate) {
            this.onPageUpdate({ title });
        }
    }

    /**
     * Export page to markdown
     */
    async exportToMarkdown() {
        return await db.blocksToMarkdown(this.pageId);
    }

    /**
     * Import from markdown
     */
    async importFromMarkdown(markdown) {
        // Clear existing blocks
        const existingBlocks = await db.getAllPageBlocks(this.pageId);
        for (const block of existingBlocks) {
            await db.deleteBlock(block.id);
        }

        // Convert markdown to blocks
        await db.markdownToBlocks(this.pageId, markdown);

        // Reload
        await this.reloadBlocks();
    }

    /**
     * Get page data
     */
    async getPageData() {
        return await db.exportPage(this.pageId);
    }

    /**
     * Destroy editor
     */
    destroy() {
        this.clearBlocks();
        this.container.innerHTML = '';
        this.pageId = null;
    }
}
