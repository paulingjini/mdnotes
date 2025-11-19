/**
 * MDNotes Pro - Main Application
 * Professional Markdown Editor with Presentation & Visualization
 */

import { Storage } from './modules/storage.js';
import { Theme } from './modules/theme.js';
import { AdvancedFileSystem } from './modules/file-system-advanced.js';
import { Editor } from './modules/editor.js';
import { Preview } from './modules/preview.js';
import { Mindmap } from './modules/mindmap.js';
import { Presentation } from './modules/presentation.js';
import { ExportManager } from './modules/export.js';
import { ChartsExtension } from './extensions/charts.js';
import { TimelineExtension } from './extensions/timeline.js';
import { InteractiveTablesExtension } from './extensions/interactive-tables.js';
import { TaskListsExtension } from './extensions/task-lists.js';
import { SyncManager } from './modules/sync.js';
import { PresentationTemplates } from './modules/presentation-templates.js';
import { AdvancedExport } from './modules/export-advanced.js';

class MDNotesApp {
    constructor() {
        // Core modules
        this.storage = Storage;
        this.theme = Theme;
        this.fileManager = null;
        this.editor = null;
        this.preview = null;
        this.mindmap = null;
        this.presentation = null;
        this.exportManager = null;

        // Extensions
        this.chartsExt = null;
        this.timelineExt = null;
        this.interactiveTablesExt = null;
        this.taskListsExt = null;

        // Advanced features
        this.syncManager = null;
        this.presentationTemplates = null;
        this.advancedExport = null;

        // State
        this.settings = {
            theme: 'dark',
            font: "'Consolas', monospace",
            fontSize: '13px',
            revealTheme: 'black',
            appName: 'MDNotes Pro',
            toolbarStyle: 'icon-only'
        };

        this.views = {
            editor: true,
            preview: false,
            mindmap: false
        };

        // Presentation templates
        this.templates = {
            basic: `---\ntheme: black\n---\n\n# Presentation Title\n\n---\n\n## Slide 2\n\nYour content here...`,
            principles: `---\ntheme: black\n---\n\n# 7 Key Principles\n\n---\n\n## Principle 1\n\nDescription...`,
            timeline: TimelineExtension.getAllExamples(),
            charts: ChartsExtension.getExample()
        };
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('Initializing MDNotes Pro...');

        // Load settings
        this.loadSettings();

        // Apply theme
        this.theme.apply(this.settings.theme);

        // Initialize modules
        this.fileManager = new AdvancedFileSystem(this.storage);
        this.editor = new Editor();
        this.preview = new Preview();
        this.mindmap = new Mindmap();
        this.presentation = new Presentation();

        // Initialize file manager
        this.fileManager.init();
        this.fileManager.onFileChange = (file) => this.loadFile(file);

        // Initialize editor
        await this.editor.init();
        this.editor.onChange = (content) => this.handleEditorChange(content);

        // Initialize preview
        this.preview.init();

        // Initialize mindmap
        await this.mindmap.init();

        // Initialize presentation
        this.presentation.init();

        // Initialize export manager
        this.exportManager = new ExportManager(this.preview, this.presentation);

        // Initialize extensions
        this.chartsExt = new ChartsExtension();
        this.chartsExt.init();

        this.timelineExt = new TimelineExtension();
        this.timelineExt.init();

        this.interactiveTablesExt = new InteractiveTablesExtension();
        this.interactiveTablesExt.init();

        this.taskListsExt = new TaskListsExtension();
        this.taskListsExt.init();

        // Initialize advanced features
        this.syncManager = new SyncManager(this.editor, this.preview, this.mindmap);
        this.syncManager.init();

        this.presentationTemplates = new PresentationTemplates();

        this.advancedExport = new AdvancedExport();

        // Load current file
        const currentFile = this.fileManager.getCurrentFile();
        if (currentFile) {
            this.loadFile(currentFile);
        }

        // Apply settings
        this.applySettings();

        // Setup event listeners
        this.setupEventListeners();

        console.log('MDNotes Pro initialized successfully!');
    }

    /**
     * Load settings from storage
     */
    loadSettings() {
        const saved = this.storage.loadSettings();
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
    }

    /**
     * Save settings to storage
     */
    saveSettings() {
        this.storage.saveSettings(this.settings);
    }

    /**
     * Apply all settings
     */
    applySettings() {
        // Apply theme
        this.theme.apply(this.settings.theme);

        // Apply font
        document.documentElement.style.setProperty('--font-family', this.settings.font);
        this.editor.setFontFamily(this.settings.font);

        // Apply font size
        document.documentElement.style.setProperty('--font-size', this.settings.fontSize);
        this.editor.setFontSize(this.settings.fontSize);

        // Apply app name
        const titleSpan = document.querySelector('#appTitle span');
        if (titleSpan) {
            titleSpan.textContent = this.settings.appName;
        }

        // Apply toolbar style
        document.body.setAttribute('data-toolbar-style', this.settings.toolbarStyle);

        // Apply Reveal theme
        this.presentation.setTheme(this.settings.revealTheme);

        // Update settings UI
        this.updateSettingsUI();
    }

    /**
     * Update settings UI elements
     */
    updateSettingsUI() {
        const appNameInput = document.getElementById('appNameInput');
        if (appNameInput) appNameInput.value = this.settings.appName;

        const toolbarStyleSelect = document.getElementById('toolbarStyleSelect');
        if (toolbarStyleSelect) toolbarStyleSelect.value = this.settings.toolbarStyle;

        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) fontSelect.value = this.settings.font;

        const sizeSelect = document.getElementById('sizeSelect');
        if (sizeSelect) sizeSelect.value = this.settings.fontSize;

        const revealThemeSelect = document.getElementById('revealThemeSelect');
        if (revealThemeSelect) revealThemeSelect.value = this.settings.revealTheme;
    }

    /**
     * Handle editor content change
     */
    handleEditorChange(content) {
        // Auto-save
        this.fileManager.saveCurrentFile(content);

        // Update preview if visible
        if (this.views.preview && !this.presentation.isActive) {
            this.preview.update(content);
            this.chartsExt.process(this.preview.container);
            this.interactiveTablesExt.process(this.preview.container);
            this.taskListsExt.process(this.preview.container, content);
        }

        // Update mindmap if visible
        if (this.views.mindmap) {
            this.mindmap.render(content);
        }

        // Update status
        this.updateStatus();
    }

    /**
     * Load file into editor
     */
    loadFile(file) {
        if (!file) return;

        this.editor.setValue(file.content);
        this.preview.update(file.content);

        if (this.views.mindmap) {
            this.mindmap.render(file.content);
        }

        this.updateStatus();
    }

    /**
     * Toggle view visibility
     */
    toggleView(viewName) {
        this.views[viewName] = !this.views[viewName];

        // Update UI
        const panels = {
            editor: document.getElementById('editorPanel'),
            preview: document.getElementById('previewPanel'),
            mindmap: document.getElementById('mindmapPanel')
        };

        const buttons = {
            editor: document.getElementById('btnEditor'),
            preview: document.getElementById('btnPreview'),
            mindmap: document.getElementById('btnMindmap')
        };

        Object.keys(this.views).forEach(key => {
            if (panels[key]) {
                panels[key].classList.toggle('hidden', !this.views[key]);
            }
            if (buttons[key]) {
                buttons[key].classList.toggle('active', this.views[key]);
            }
        });

        // Refresh view-specific content
        if (viewName === 'mindmap' && this.views.mindmap) {
            setTimeout(() => this.mindmap.render(this.editor.getValue()), 100);
        }

        if (viewName === 'preview' && this.views.preview) {
            const content = this.editor.getValue();
            this.preview.update(content);
            this.chartsExt.process(this.preview.container);
            this.interactiveTablesExt.process(this.preview.container);
            this.taskListsExt.process(this.preview.container, content);
        }

        // Refresh editor after layout change
        if (this.editor) {
            setTimeout(() => this.editor.refresh(), 100);
        }
    }

    /**
     * Toggle presentation mode
     */
    async togglePresentation() {
        const content = this.editor.getValue();
        const wasActive = this.presentation.isActive;

        if (wasActive) {
            this.presentation.stop();
            this.preview.update(content);
            this.chartsExt.process(this.preview.container);
        } else {
            const success = await this.presentation.start(content);
            if (!success) {
                return;
            }
        }

        // Update button state
        const btn = document.getElementById('btnPresentation');
        if (btn) {
            btn.classList.toggle('active', this.presentation.isActive);
        }

        // Update preview title
        const title = document.getElementById('previewTitle');
        if (title) {
            title.textContent = this.presentation.isActive ? 'PRESENTATION' : 'PREVIEW';
        }
    }

    /**
     * Update status bar
     */
    updateStatus() {
        const stats = this.editor.getStats();
        const statusRight = document.getElementById('statusRight');
        if (statusRight) {
            statusRight.textContent = `Lines: ${stats.lines} | Words: ${stats.words} | Chars: ${stats.chars}`;
        }

        const cursorInfo = this.editor.getCursorInfo();
        const statusLeft = document.getElementById('statusLeft');
        if (statusLeft) {
            statusLeft.textContent = `Ln ${cursorInfo.line}, Col ${cursorInfo.column}`;
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Save: Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.save();
            }

            // New file: Ctrl/Cmd + N
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showNewFileModal();
            }

            // Bold: Ctrl/Cmd + B (handled by editor)
            // Italic: Ctrl/Cmd + I (handled by editor)
        });

        // Close dropdowns when clicking outside
        document.body.addEventListener('click', (e) => {
            if (!e.target.closest('.export-btn-group')) {
                this.exportManager.hideMenu();
            }
        });
    }

    /**
     * Save current file
     */
    save() {
        const content = this.editor.getValue();
        this.fileManager.saveCurrentFile(content);
        this.showNotification('File saved!', 'success');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const statusLeft = document.getElementById('statusLeft');
        if (!statusLeft) return;

        const originalText = statusLeft.textContent;
        const originalColor = statusLeft.style.color;

        statusLeft.style.color = type === 'error' ? '#f44336' : '#4caf50';
        statusLeft.textContent = message;

        setTimeout(() => {
            statusLeft.textContent = originalText;
            statusLeft.style.color = originalColor;
        }, 3000);
    }

    /**
     * Show/hide modals
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    /**
     * Modal handlers
     */
    showNewFileModal() {
        this.showModal('newFileModal');
        const input = document.getElementById('newFileName');
        if (input) {
            input.value = '';
            input.focus();
        }
    }

    createFile() {
        const input = document.getElementById('newFileName');
        if (!input) return;

        const filename = input.value.trim();
        if (!filename) {
            this.showNotification('Filename cannot be empty', 'error');
            return;
        }

        try {
            this.fileManager.createFile(filename);
            this.closeModal();
            this.showNotification(`File "${filename}" created`, 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    showSettings() {
        this.updateSettingsUI();
        this.showModal('settingsModal');
    }

    showHelp() {
        this.showModal('helpModal');
    }

    showPresentationSettings() {
        this.showModal('templatesModal');
    }

    applyTemplateAndSettings() {
        const templateSelect = document.getElementById('templateSelect');
        const revealThemeSelect = document.getElementById('revealThemeSelect');

        if (templateSelect) {
            const template = this.templates[templateSelect.value];
            if (template) {
                this.editor.setValue(template);
            }
        }

        if (revealThemeSelect) {
            this.settings.revealTheme = revealThemeSelect.value;
            this.presentation.setTheme(this.settings.revealTheme);
            this.saveSettings();
        }

        this.closeModal();
    }

    /**
     * Settings handlers
     */
    setAppName(name) {
        this.settings.appName = name || 'MDNotes Pro';
        this.applySettings();
        this.saveSettings();
    }

    setToolbarStyle(style) {
        this.settings.toolbarStyle = style;
        this.applySettings();
        this.saveSettings();
    }

    setTheme(themeName) {
        this.settings.theme = themeName;
        this.theme.apply(themeName);
        this.editor.setTheme(themeName);
        this.saveSettings();

        // Re-render preview for mermaid theme sync
        if (this.views.preview && !this.presentation.isActive) {
            this.preview.update(this.editor.getValue());
            this.chartsExt.process(this.preview.container);
        }
    }

    setFont(font) {
        this.settings.font = font;
        this.applySettings();
        this.saveSettings();
    }

    setFontSize(size) {
        this.settings.fontSize = size;
        this.applySettings();
        this.saveSettings();
    }

    /**
     * File operations
     */
    loadExternalFiles(event) {
        this.fileManager.loadExternalFiles(event.target.files);
    }

    toggleFileManager() {
        this.fileManager.toggleVisibility();
    }

    /**
     * Export operations
     */
    async exportAs(format) {
        const filename = this.fileManager.currentFile?.replace('.md', '') || 'document';
        const content = this.editor.getValue();

        this.exportManager.hideMenu();
        this.showSpinner('Exporting...');

        try {
            await this.exportManager.export(format, content, filename);
            this.showNotification('Export successful!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed', 'error');
        } finally {
            this.hideSpinner();
        }
    }

    toggleExportMenu() {
        this.exportManager.showMenu();
    }

    /**
     * Markdown toolbar actions
     */
    insertMarkdown(prefix, suffix, placeholder) {
        this.editor.insertMarkdown(prefix, suffix, placeholder);
    }

    /**
     * Fullscreen toggles
     */
    toggleEditorFullscreen() {
        this.editor.toggleFullscreen();
    }

    togglePreviewFullscreen() {
        this.preview.toggleFullscreen();
    }

    toggleMindmapFullscreen() {
        this.mindmap.toggleFullscreen();
    }

    /**
     * Spinner helpers
     */
    showSpinner(text = 'Loading...') {
        const spinner = document.getElementById('spinnerOverlay');
        const spinnerText = document.getElementById('spinnerText');
        if (spinner) spinner.style.display = 'flex';
        if (spinnerText) spinnerText.textContent = text;
    }

    hideSpinner() {
        const spinner = document.getElementById('spinnerOverlay');
        if (spinner) spinner.style.display = 'none';
    }

    /**
     * Advanced Export Methods
     */
    async exportAdvancedPDF() {
        const filename = this.fileManager.currentFile?.replace('.md', '') || 'document';
        const content = this.editor.getValue();

        this.showSpinner('Generating PDF...');
        try {
            await this.advancedExport.exportToPDF(content, `${filename}.pdf`);
            this.showNotification('PDF exported successfully!', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showNotification('PDF export failed: ' + error.message, 'error');
        } finally {
            this.hideSpinner();
        }
    }

    async exportAdvancedDOCX() {
        const filename = this.fileManager.currentFile?.replace('.md', '') || 'document';
        const content = this.editor.getValue();

        this.showSpinner('Generating DOCX...');
        try {
            await this.advancedExport.exportToDOCX(content, `${filename}.docx`);
            this.showNotification('DOCX exported successfully!', 'success');
        } catch (error) {
            console.error('DOCX export error:', error);
            this.showNotification('DOCX export failed: ' + error.message, 'error');
        } finally {
            this.hideSpinner();
        }
    }

    async exportAdvancedPPTX(templateName = 'corporate') {
        const filename = this.fileManager.currentFile?.replace('.md', '') || 'presentation';
        const content = this.editor.getValue();
        const template = this.presentationTemplates.getTemplate(templateName);

        this.showSpinner('Generating PowerPoint...');
        try {
            await this.advancedExport.exportToPPTX(content, `${filename}.pptx`, template);
            this.showNotification('PowerPoint exported successfully!', 'success');
        } catch (error) {
            console.error('PPTX export error:', error);
            this.showNotification('PPTX export failed: ' + error.message, 'error');
        } finally {
            this.hideSpinner();
        }
    }

    /**
     * Presentation Template Methods
     */
    applyPresentationTemplate(templateName) {
        if (this.presentation.reveal) {
            this.presentationTemplates.applyTemplate(templateName, this.presentation.reveal);
            this.showNotification(`Template "${templateName}" applied`, 'success');
        }
    }

    exportPresentationTemplate(templateName) {
        this.presentationTemplates.exportTemplate(templateName);
    }

    importPresentationTemplate(jsonString, name) {
        if (this.presentationTemplates.importTemplate(jsonString, name)) {
            this.showNotification(`Template "${name}" imported`, 'success');
        } else {
            this.showNotification('Failed to import template', 'error');
        }
    }

    /**
     * Sync Manager Methods
     */
    toggleSync() {
        if (this.syncManager) {
            const newState = !this.syncManager.enabled;
            this.syncManager.setEnabled(newState);
            this.showNotification(`Sync ${newState ? 'enabled' : 'disabled'}`, 'success');
            return newState;
        }
        return false;
    }

    scrollToHeading(headingText) {
        if (this.syncManager) {
            this.syncManager.scrollToHeading(headingText);
        }
    }

    /**
     * Mindmap Focus Methods
     */
    toggleMindmapFocus() {
        if (this.mindmap) {
            const newState = this.mindmap.toggleFocus();
            this.showNotification(`Mindmap focus ${newState ? 'enabled' : 'disabled'}`, 'success');
            return newState;
        }
        return false;
    }

    focusMindmapNode(nodeIndex) {
        if (this.mindmap) {
            this.mindmap.highlightNode(nodeIndex);
        }
    }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
    window.app = new MDNotesApp();
    await window.app.init();
});

export default MDNotesApp;
