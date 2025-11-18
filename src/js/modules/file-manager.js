/**
 * File Manager Module - Handles file operations
 */
export class FileManager {
    constructor(storage) {
        this.storage = storage;
        this.files = {};
        this.currentFile = null;
        this.onFileChange = null; // Callback when file changes
    }

    /**
     * Initialize file manager
     */
    init() {
        this.files = this.storage.loadFiles();

        // Create welcome file if no files exist
        if (Object.keys(this.files).length === 0) {
            this.createWelcomeFile();
        }

        this.currentFile = Object.keys(this.files)[0];
        this.render();
    }

    /**
     * Create welcome file
     */
    createWelcomeFile() {
        this.files['welcome.md'] = {
            name: 'welcome.md',
            content: `# Welcome to MDNotes Pro

## Features

- **Advanced Editor** with CodeMirror
- **Fullscreen Mode** for all panels
- **Professional Export** (MD, HTML, PDF, PPTX)
- **Presentation Themes** via Reveal.js
- **Mindmap Generation**
- **Diagram Support** (Mermaid, Charts, Timelines)

## Quick Start

1. Write your markdown in the **Editor** panel
2. Preview it in real-time
3. Generate mindmaps from headings
4. Create presentations with \`---\` separators
5. Export to multiple formats

## Diagram Examples

### Mermaid Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Retry]
    D --> A
\`\`\`

### Gantt Timeline
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Design :2024-01-01, 30d
    Development :2024-02-01, 60d
    section Phase 2
    Testing :2024-04-01, 30d
    Deployment :2024-05-01, 15d
\`\`\`

### Chart
\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "datasets": [{
      "label": "Revenue",
      "data": [12, 19, 15, 25]
    }]
  }
}
\`\`\`

---

**Happy editing!** 🚀
`,
            modified: Date.now()
        };
    }

    /**
     * Render file list
     */
    render() {
        const list = document.getElementById('fileList');
        if (!list) return;

        list.innerHTML = '';

        Object.values(this.files).forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item' + (file.name === this.currentFile ? ' active' : '');
            item.innerHTML = `
                <span>${file.name}</span>
                <button class="delete-btn" title="Delete file">
                    <svg class="icon" style="width:14px; height:14px"><use href="#icon-trash"></use></svg>
                </button>
            `;

            item.querySelector('span').onclick = () => this.switchFile(file.name);
            item.querySelector('.delete-btn').onclick = (e) => {
                e.stopPropagation();
                this.deleteFile(file.name);
            };

            list.appendChild(item);
        });
    }

    /**
     * Switch to a different file
     */
    switchFile(filename) {
        if (filename === this.currentFile) return;

        this.currentFile = filename;
        this.render();

        if (this.onFileChange) {
            this.onFileChange(this.files[filename]);
        }
    }

    /**
     * Get current file
     */
    getCurrentFile() {
        return this.files[this.currentFile];
    }

    /**
     * Save current file content
     */
    saveCurrentFile(content) {
        if (!this.currentFile) return false;

        this.files[this.currentFile].content = content;
        this.files[this.currentFile].modified = Date.now();
        this.storage.saveFiles(this.files);

        return true;
    }

    /**
     * Create new file
     */
    createFile(filename, content = '') {
        if (!filename) {
            throw new Error('Filename is required');
        }

        if (!filename.endsWith('.md')) {
            filename += '.md';
        }

        if (this.files[filename]) {
            throw new Error('File already exists');
        }

        this.files[filename] = {
            name: filename,
            content: content || `# ${filename.replace('.md', '')}`,
            modified: Date.now()
        };

        this.currentFile = filename;
        this.storage.saveFiles(this.files);
        this.render();

        if (this.onFileChange) {
            this.onFileChange(this.files[filename]);
        }

        return true;
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

        this.storage.saveFiles(this.files);
        this.render();

        if (this.currentFile && this.onFileChange) {
            this.onFileChange(this.files[this.currentFile]);
        }

        return true;
    }

    /**
     * Load external files
     */
    loadExternalFiles(fileList) {
        Array.from(fileList).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.files[file.name] = {
                    name: file.name,
                    content: e.target.result,
                    modified: Date.now()
                };
                this.currentFile = file.name;
                this.storage.saveFiles(this.files);
                this.render();

                if (this.onFileChange) {
                    this.onFileChange(this.files[file.name]);
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * Toggle file manager visibility
     */
    toggleVisibility() {
        const fm = document.getElementById('fileManager');
        if (fm) {
            fm.classList.toggle('hidden');
        }
    }

    /**
     * Get all files
     */
    getAllFiles() {
        return this.files;
    }
}
