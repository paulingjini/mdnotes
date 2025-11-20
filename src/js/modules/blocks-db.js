/**
 * Blocks Database - IndexedDB with Dexie.js
 * Notion-style block-based editor persistence
 *
 * Note: Requires Dexie.js to be loaded globally via CDN
 * Example: <script src="https://cdn.jsdelivr.net/npm/dexie@3/dist/dexie.min.js"><\/script>
 */

// Function to create the BlocksDatabase class only when Dexie is available
function createBlocksDatabase() {
    if (typeof Dexie === 'undefined') {
        console.error('Dexie.js is not loaded! Cannot create BlocksDatabase.');
        return null;
    }

    class BlocksDatabase extends Dexie {
        constructor() {
            super('MDNotesBlocks');

            this.version(1).stores({
                pages: '++id, title, icon, coverImage, createdAt, updatedAt, isFavorite, parentId',
                blocks: '++id, pageId, type, content, properties, parentId, *childIds, position, createdAt, updatedAt'
            });

            // Type definitions for better IDE support
            this.pages = this.table('pages');
            this.blocks = this.table('blocks');
        }

    /**
     * Create a new page
     */
    async createPage(title = 'Untitled', parentId = null) {
        const now = Date.now();
        const pageId = await this.pages.add({
            title,
            icon: '📄',
            coverImage: null,
            createdAt: now,
            updatedAt: now,
            isFavorite: false,
            parentId
        });

        // Create initial empty block
        await this.createBlock(pageId, 'text', '', null, 0);

        return pageId;
    }

    /**
     * Create a new block
     */
    async createBlock(pageId, type = 'text', content = '', parentId = null, position = 0) {
        const now = Date.now();
        const blockId = await this.blocks.add({
            pageId,
            type,
            content,
            properties: {},
            parentId,
            childIds: [],
            position,
            createdAt: now,
            updatedAt: now
        });

        return blockId;
    }

    /**
     * Get all blocks for a page (root level only)
     */
    async getPageBlocks(pageId) {
        return await this.blocks
            .where({ pageId, parentId: null })
            .sortBy('position');
    }

    /**
     * Get all blocks for a page (including nested)
     */
    async getAllPageBlocks(pageId) {
        return await this.blocks
            .where('pageId')
            .equals(pageId)
            .sortBy('position');
    }

    /**
     * Get child blocks
     */
    async getChildBlocks(parentId) {
        return await this.blocks
            .where({ parentId })
            .sortBy('position');
    }

    /**
     * Update block content
     */
    async updateBlock(blockId, updates) {
        return await this.blocks.update(blockId, {
            ...updates,
            updatedAt: Date.now()
        });
    }

    /**
     * Update block content only
     */
    async updateBlockContent(blockId, content) {
        return await this.updateBlock(blockId, { content });
    }

    /**
     * Update block type
     */
    async updateBlockType(blockId, type) {
        return await this.updateBlock(blockId, { type });
    }

    /**
     * Delete block and its children
     */
    async deleteBlock(blockId) {
        const block = await this.blocks.get(blockId);
        if (!block) return false;

        // Delete children recursively
        if (block.childIds && block.childIds.length > 0) {
            for (const childId of block.childIds) {
                await this.deleteBlock(childId);
            }
        }

        // Remove from parent's childIds
        if (block.parentId) {
            const parent = await this.blocks.get(block.parentId);
            if (parent) {
                const updatedChildIds = parent.childIds.filter(id => id !== blockId);
                await this.blocks.update(block.parentId, { childIds: updatedChildIds });
            }
        }

        // Delete the block
        await this.blocks.delete(blockId);
        return true;
    }

    /**
     * Indent block (make it child of previous sibling)
     */
    async indentBlock(blockId) {
        const block = await this.blocks.get(blockId);
        if (!block) return false;

        // Find previous sibling
        const siblings = await this.blocks
            .where({ pageId: block.pageId, parentId: block.parentId })
            .sortBy('position');

        const currentIndex = siblings.findIndex(b => b.id === blockId);
        if (currentIndex <= 0) return false; // Can't indent if first

        const previousSibling = siblings[currentIndex - 1];

        // Add to previous sibling's children
        const updatedChildIds = [...(previousSibling.childIds || []), blockId];
        await this.blocks.update(previousSibling.id, { childIds: updatedChildIds });

        // Update current block's parentId
        await this.blocks.update(blockId, {
            parentId: previousSibling.id,
            position: updatedChildIds.length - 1
        });

        return true;
    }

    /**
     * Outdent block (move to parent's level)
     */
    async outdentBlock(blockId) {
        const block = await this.blocks.get(blockId);
        if (!block || !block.parentId) return false;

        const parent = await this.blocks.get(block.parentId);
        if (!parent) return false;

        // Remove from current parent's childIds
        const updatedChildIds = parent.childIds.filter(id => id !== blockId);
        await this.blocks.update(parent.id, { childIds: updatedChildIds });

        // Move to grandparent level
        await this.blocks.update(blockId, {
            parentId: parent.parentId,
            position: parent.position + 1
        });

        return true;
    }

    /**
     * Reorder blocks
     */
    async reorderBlocks(pageId, parentId, blockIds) {
        const updates = blockIds.map((id, index) => ({
            key: id,
            changes: { position: index }
        }));

        await this.blocks.bulkUpdate(updates);
    }

    /**
     * Get page by ID
     */
    async getPage(pageId) {
        return await this.pages.get(pageId);
    }

    /**
     * Get all pages
     */
    async getAllPages() {
        return await this.pages.toArray();
    }

    /**
     * Update page
     */
    async updatePage(pageId, updates) {
        return await this.pages.update(pageId, {
            ...updates,
            updatedAt: Date.now()
        });
    }

    /**
     * Delete page and all its blocks
     */
    async deletePage(pageId) {
        // Delete all blocks
        await this.blocks.where('pageId').equals(pageId).delete();

        // Delete page
        await this.pages.delete(pageId);
        return true;
    }

    /**
     * Export page to JSON (for backup/migration)
     */
    async exportPage(pageId) {
        const page = await this.getPage(pageId);
        const blocks = await this.getAllPageBlocks(pageId);

        return {
            page,
            blocks
        };
    }

    /**
     * Import page from JSON
     */
    async importPage(data) {
        const { page, blocks } = data;

        // Create page
        delete page.id; // Let DB generate new ID
        const newPageId = await this.pages.add(page);

        // Create blocks with ID mapping
        const idMap = {};
        for (const block of blocks) {
            const oldId = block.id;
            delete block.id;
            block.pageId = newPageId;

            // Update parentId if it references an old ID
            if (block.parentId && idMap[block.parentId]) {
                block.parentId = idMap[block.parentId];
            }

            const newId = await this.blocks.add(block);
            idMap[oldId] = newId;
        }

        return newPageId;
    }

    /**
     * Convert markdown file to blocks
     */
    async markdownToBlocks(pageId, markdown) {
        const lines = markdown.split('\n');
        let position = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue; // Skip empty lines

            let type = 'text';
            let content = trimmed;

            // Detect block type
            if (trimmed.startsWith('# ')) {
                type = 'h1';
                content = trimmed.substring(2);
            } else if (trimmed.startsWith('## ')) {
                type = 'h2';
                content = trimmed.substring(3);
            } else if (trimmed.startsWith('### ')) {
                type = 'h3';
                content = trimmed.substring(4);
            } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
                type = 'todo';
                content = trimmed.substring(6);
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                type = 'bullet';
                content = trimmed.substring(2);
            } else if (trimmed.match(/^\d+\. /)) {
                type = 'numbered';
                content = trimmed.replace(/^\d+\. /, '');
            } else if (trimmed.startsWith('> ')) {
                type = 'quote';
                content = trimmed.substring(2);
            } else if (trimmed.startsWith('```')) {
                type = 'code';
                content = trimmed.substring(3);
            }

            await this.createBlock(pageId, type, content, null, position++);
        }
    }

    /**
     * Convert blocks to markdown
     */
    async blocksToMarkdown(pageId) {
        const blocks = await this.getAllPageBlocks(pageId);
        let markdown = '';

        for (const block of blocks) {
            let line = '';

            switch (block.type) {
                case 'h1':
                    line = `# ${block.content}`;
                    break;
                case 'h2':
                    line = `## ${block.content}`;
                    break;
                case 'h3':
                    line = `### ${block.content}`;
                    break;
                case 'todo':
                    line = `- [ ] ${block.content}`;
                    break;
                case 'bullet':
                    line = `- ${block.content}`;
                    break;
                case 'numbered':
                    line = `1. ${block.content}`;
                    break;
                case 'quote':
                    line = `> ${block.content}`;
                    break;
                case 'code':
                    line = `\`\`\`${block.content}`;
                    break;
                default:
                    line = block.content;
            }

            markdown += line + '\n';
        }

        return markdown;
    }
    } // End of BlocksDatabase class

    return BlocksDatabase;
}

// Create singleton instance and expose globally
// Deferred initialization to ensure Dexie is loaded
let dbInstance = null;
let BlocksDatabase = null;

function initDatabase() {
    if (!dbInstance) {
        if (typeof Dexie === 'undefined') {
            console.error('Dexie.js not loaded! Block editor will not work.');
            return null;
        }
        try {
            // Create the class if not already created
            if (!BlocksDatabase) {
                BlocksDatabase = createBlocksDatabase();
                if (!BlocksDatabase) {
                    return null;
                }
            }
            dbInstance = new BlocksDatabase();
            console.log('BlocksDatabase initialized successfully');
        } catch (error) {
            console.error('Failed to initialize BlocksDatabase:', error);
            return null;
        }
    }
    return dbInstance;
}

// Initialize on first access or immediately if Dexie is available
if (typeof Dexie !== 'undefined') {
    window.db = initDatabase();
} else {
    // Wait for Dexie to load
    console.warn('Dexie not yet loaded, deferring database initialization');
    Object.defineProperty(window, 'db', {
        get: function() {
            return initDatabase();
        },
        configurable: true
    });
}

export default window.db;
