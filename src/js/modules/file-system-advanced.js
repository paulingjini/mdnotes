/**
 * Advanced File System - Notion-like hierarchical file management
 * Supports folders, tags, nested structure, drag & drop
 */
export class AdvancedFileSystem {
    constructor(storage) {
        this.storage = storage;
        this.files = {};
        this.folders = {};
        this.tags = {};
        this.currentFile = null;
        this.currentFolder = null;
        this.onFileChange = null;
    }

    /**
     * Initialize file system
     */
    init() {
        this.loadData();
        this.render();
    }

    /**
     * Load data from storage
     */
    loadData() {
        // Load files
        const filesData = this.storage.loadFiles();

        // Convert old format to new format if needed
        Object.keys(filesData).forEach(key => {
            if (!filesData[key].metadata) {
                filesData[key] = this.migrateToNewFormat(filesData[key]);
            }
        });

        this.files = filesData;

        // Load folders
        try {
            const foldersData = localStorage.getItem('mdnotes_folders');
            this.folders = foldersData ? JSON.parse(foldersData) : this.createDefaultFolders();
        } catch (e) {
            this.folders = this.createDefaultFolders();
        }

        // Load tags
        try {
            const tagsData = localStorage.getItem('mdnotes_tags');
            this.tags = tagsData ? JSON.parse(tagsData) : {};
        } catch (e) {
            this.tags = {};
        }
    }

    /**
     * Create default folder structure
     */
    createDefaultFolders() {
        return {
            root: {
                id: 'root',
                name: 'All Files',
                parent: null,
                children: [],
                expanded: true,
                icon: '📁'
            }
        };
    }

    /**
     * Migrate old file format to new format
     */
    migrateToNewFormat(oldFile) {
        return {
            ...oldFile,
            metadata: {
                folder: 'root',
                tags: [],
                created: oldFile.modified || Date.now(),
                modified: oldFile.modified || Date.now(),
                favorite: false,
                archived: false,
                color: null
            }
        };
    }

    /**
     * Save all data
     */
    saveData() {
        this.storage.saveFiles(this.files);
        localStorage.setItem('mdnotes_folders', JSON.stringify(this.folders));
        localStorage.setItem('mdnotes_tags', JSON.stringify(this.tags));
    }

    /**
     * Create new folder
     */
    createFolder(name, parentId = 'root') {
        const id = 'folder_' + Date.now();
        const folder = {
            id,
            name,
            parent: parentId,
            children: [],
            expanded: true,
            icon: '📁'
        };

        this.folders[id] = folder;

        // Add to parent's children
        if (this.folders[parentId]) {
            this.folders[parentId].children.push(id);
        }

        this.saveData();
        this.render();
        return id;
    }

    /**
     * Rename folder
     */
    renameFolder(folderId, newName) {
        if (this.folders[folderId]) {
            this.folders[folderId].name = newName;
            this.saveData();
            this.render();
        }
    }

    /**
     * Delete folder
     */
    deleteFolder(folderId) {
        if (folderId === 'root') return false;

        const folder = this.folders[folderId];
        if (!folder) return false;

        // Move files to parent folder
        Object.keys(this.files).forEach(key => {
            if (this.files[key].metadata.folder === folderId) {
                this.files[key].metadata.folder = folder.parent || 'root';
            }
        });

        // Move subfolders to parent
        folder.children.forEach(childId => {
            if (this.folders[childId]) {
                this.folders[childId].parent = folder.parent || 'root';
                this.folders[folder.parent || 'root'].children.push(childId);
            }
        });

        // Remove from parent's children
        if (folder.parent && this.folders[folder.parent]) {
            this.folders[folder.parent].children = this.folders[folder.parent].children.filter(id => id !== folderId);
        }

        delete this.folders[folderId];
        this.saveData();
        this.render();
        return true;
    }

    /**
     * Move file to folder
     */
    moveFile(filename, folderId) {
        if (this.files[filename]) {
            this.files[filename].metadata.folder = folderId;
            this.saveData();
            this.render();
        }
    }

    /**
     * Add tag to file
     */
    addTag(filename, tagName) {
        if (!this.files[filename]) return;

        const tags = this.files[filename].metadata.tags || [];
        if (!tags.includes(tagName)) {
            tags.push(tagName);
            this.files[filename].metadata.tags = tags;

            // Track tag usage
            if (!this.tags[tagName]) {
                this.tags[tagName] = { count: 0, color: this.generateTagColor() };
            }
            this.tags[tagName].count++;

            this.saveData();
            this.render();
        }
    }

    /**
     * Remove tag from file
     */
    removeTag(filename, tagName) {
        if (!this.files[filename]) return;

        const tags = this.files[filename].metadata.tags || [];
        const index = tags.indexOf(tagName);
        if (index > -1) {
            tags.splice(index, 1);
            this.files[filename].metadata.tags = tags;

            // Update tag count
            if (this.tags[tagName]) {
                this.tags[tagName].count--;
                if (this.tags[tagName].count <= 0) {
                    delete this.tags[tagName];
                }
            }

            this.saveData();
            this.render();
        }
    }

    /**
     * Generate random tag color
     */
    generateTagColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Toggle favorite
     */
    toggleFavorite(filename) {
        if (this.files[filename]) {
            this.files[filename].metadata.favorite = !this.files[filename].metadata.favorite;
            this.saveData();
            this.render();
        }
    }

    /**
     * Toggle archive
     */
    toggleArchive(filename) {
        if (this.files[filename]) {
            this.files[filename].metadata.archived = !this.files[filename].metadata.archived;
            this.saveData();
            this.render();
        }
    }

    /**
     * Search files
     */
    searchFiles(query) {
        query = query.toLowerCase();
        return Object.values(this.files).filter(file => {
            return file.name.toLowerCase().includes(query) ||
                   file.content.toLowerCase().includes(query) ||
                   (file.metadata.tags && file.metadata.tags.some(tag => tag.toLowerCase().includes(query)));
        });
    }

    /**
     * Filter files by criteria
     */
    filterFiles(criteria) {
        return Object.values(this.files).filter(file => {
            if (criteria.folder && file.metadata.folder !== criteria.folder) return false;
            if (criteria.tag && !file.metadata.tags?.includes(criteria.tag)) return false;
            if (criteria.favorite && !file.metadata.favorite) return false;
            if (criteria.archived !== undefined && file.metadata.archived !== criteria.archived) return false;
            return true;
        });
    }

    /**
     * Get folder tree
     */
    getFolderTree(folderId = 'root', level = 0) {
        const folder = this.folders[folderId];
        if (!folder) return null;

        return {
            ...folder,
            level,
            children: folder.children.map(childId => this.getFolderTree(childId, level + 1)).filter(Boolean)
        };
    }

    /**
     * Render file system UI
     */
    render() {
        const container = document.getElementById('fileList');
        if (!container) return;

        container.innerHTML = '';

        // Render folder tree
        const tree = this.getFolderTree();
        this.renderFolderNode(tree, container);
    }

    /**
     * Render folder node recursively
     */
    renderFolderNode(node, container) {
        if (!node) return;

        // Folder element
        const folderEl = document.createElement('div');
        folderEl.className = 'folder-item';
        folderEl.style.paddingLeft = `${node.level * 15}px`;
        folderEl.innerHTML = `
            <span class="folder-toggle">${node.expanded ? '▼' : '▶'}</span>
            <span class="folder-icon">${node.icon}</span>
            <span class="folder-name">${node.name}</span>
            <div class="folder-actions">
                ${node.id !== 'root' ? '<button class="action-btn" data-action="rename" title="Rename">✏️</button>' : ''}
                ${node.id !== 'root' ? '<button class="action-btn" data-action="delete" title="Delete">🗑️</button>' : ''}
                <button class="action-btn" data-action="add" title="Add Subfolder">➕</button>
            </div>
        `;

        // Toggle expansion
        folderEl.querySelector('.folder-toggle').onclick = () => {
            node.expanded = !node.expanded;
            this.saveData();
            this.render();
        };

        // Actions
        folderEl.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'add') this.showAddFolderDialog(node.id);
                if (action === 'rename') this.showRenameFolderDialog(node.id);
                if (action === 'delete') this.deleteFolder(node.id);
            };
        });

        container.appendChild(folderEl);

        // Render files in this folder
        if (node.expanded) {
            const filesInFolder = this.filterFiles({ folder: node.id, archived: false });
            filesInFolder.forEach(file => {
                const fileEl = this.renderFileItem(file, node.level + 1);
                container.appendChild(fileEl);
            });

            // Render child folders
            node.children.forEach(childNode => {
                this.renderFolderNode(childNode, container);
            });
        }
    }

    /**
     * Render file item
     */
    renderFileItem(file, level) {
        const fileEl = document.createElement('div');
        fileEl.className = 'file-item' + (file.name === this.currentFile ? ' active' : '');
        fileEl.style.paddingLeft = `${level * 15}px`;
        fileEl.draggable = true;

        const tags = file.metadata.tags || [];
        const tagsHTML = tags.map(tag =>
            `<span class="file-tag" style="background:${this.tags[tag]?.color || '#999'}">${tag}</span>`
        ).join('');

        fileEl.innerHTML = `
            <span class="file-icon">${file.metadata.favorite ? '⭐' : '📄'}</span>
            <span class="file-name">${file.name}</span>
            ${tagsHTML}
            <div class="file-actions">
                <button class="action-btn" data-action="favorite" title="Favorite">${file.metadata.favorite ? '★' : '☆'}</button>
                <button class="action-btn" data-action="tag" title="Add Tag">🏷️</button>
                <button class="action-btn" data-action="archive" title="Archive">📦</button>
                <button class="action-btn" data-action="delete" title="Delete">🗑️</button>
            </div>
        `;

        // Click to open
        fileEl.querySelector('.file-name').onclick = () => this.switchFile(file.name);

        // Actions
        fileEl.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'favorite') this.toggleFavorite(file.name);
                if (action === 'tag') this.showAddTagDialog(file.name);
                if (action === 'archive') this.toggleArchive(file.name);
                if (action === 'delete') this.deleteFile(file.name);
            };
        });

        // Drag and drop
        fileEl.ondragstart = (e) => {
            e.dataTransfer.setData('filename', file.name);
        };

        return fileEl;
    }

    /**
     * Switch to file
     */
    switchFile(filename) {
        this.currentFile = filename;
        this.render();
        if (this.onFileChange) {
            this.onFileChange(this.files[filename]);
        }
    }

    /**
     * Delete file
     */
    deleteFile(filename) {
        if (!confirm(`Delete ${filename}?`)) return false;

        delete this.files[filename];

        if (this.currentFile === filename) {
            const keys = Object.keys(this.files);
            this.currentFile = keys.length ? keys[0] : null;
        }

        this.saveData();
        this.render();
        return true;
    }

    /**
     * Show dialogs (to be implemented with proper modals)
     */
    showAddFolderDialog(parentId) {
        const name = prompt('Folder name:');
        if (name) {
            this.createFolder(name, parentId);
        }
    }

    showRenameFolderDialog(folderId) {
        const currentName = this.folders[folderId].name;
        const newName = prompt('New folder name:', currentName);
        if (newName && newName !== currentName) {
            this.renameFolder(folderId, newName);
        }
    }

    showAddTagDialog(filename) {
        const tag = prompt('Tag name:');
        if (tag) {
            this.addTag(filename, tag);
        }
    }

    /**
     * Get current file
     */
    getCurrentFile() {
        return this.files[this.currentFile];
    }

    /**
     * Create file
     */
    createFile(filename, content = '', folderId = 'root') {
        if (!filename.endsWith('.md')) {
            filename += '.md';
        }

        if (this.files[filename]) {
            throw new Error('File already exists');
        }

        this.files[filename] = {
            name: filename,
            content: content || `# ${filename.replace('.md', '')}`,
            modified: Date.now(),
            metadata: {
                folder: folderId,
                tags: [],
                created: Date.now(),
                modified: Date.now(),
                favorite: false,
                archived: false,
                color: null
            }
        };

        this.currentFile = filename;
        this.saveData();
        this.render();

        if (this.onFileChange) {
            this.onFileChange(this.files[filename]);
        }

        return true;
    }

    /**
     * Save current file
     */
    saveCurrentFile(content) {
        if (!this.currentFile || !this.files[this.currentFile]) return false;

        this.files[this.currentFile].content = content;
        this.files[this.currentFile].modified = Date.now();
        this.files[this.currentFile].metadata.modified = Date.now();
        this.saveData();

        return true;
    }

    /**
     * Get all files
     */
    getAllFiles() {
        return this.files;
    }

    /**
     * Export folder structure
     */
    exportStructure() {
        return {
            files: this.files,
            folders: this.folders,
            tags: this.tags
        };
    }

    /**
     * Import folder structure
     */
    importStructure(data) {
        if (data.files) this.files = data.files;
        if (data.folders) this.folders = data.folders;
        if (data.tags) this.tags = data.tags;
        this.saveData();
        this.render();
    }
}
