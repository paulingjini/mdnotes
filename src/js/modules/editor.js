/**
 * Editor Module - Handles editor with CodeMirror integration
 */
export class Editor {
    constructor() {
        this.cm = null; // CodeMirror instance
        this.fallbackTextarea = null;
        this.onChange = null; // Callback when content changes
        this.useCodeMirror = true;
    }

    /**
     * Initialize editor
     */
    async init() {
        const container = document.getElementById('editor');
        if (!container) {
            console.error('Editor container not found');
            return false;
        }

        try {
            // Try to initialize CodeMirror
            if (this.useCodeMirror && window.CodeMirror) {
                await this.initCodeMirror(container);
            } else {
                this.initFallback(container);
            }

            return true;
        } catch (error) {
            console.warn('CodeMirror failed, using fallback:', error);
            this.initFallback(container);
            return true;
        }
    }

    /**
     * Initialize CodeMirror
     */
    async initCodeMirror(container) {
        this.cm = window.CodeMirror.fromTextArea(container, {
            mode: 'markdown',
            theme: 'default',
            lineNumbers: true,
            lineWrapping: true,
            autofocus: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            extraKeys: {
                'Ctrl-S': () => { /* handled globally */ },
                'Cmd-S': () => { /* handled globally */ },
                'Ctrl-B': () => this.insertMarkdown('**', '**', 'bold'),
                'Cmd-B': () => this.insertMarkdown('**', '**', 'bold'),
                'Ctrl-I': () => this.insertMarkdown('*', '*', 'italic'),
                'Cmd-I': () => this.insertMarkdown('*', '*', 'italic'),
                'Ctrl-K': () => this.insertMarkdown('[', '](url)', 'link'),
                'Cmd-K': () => this.insertMarkdown('[', '](url)', 'link')
            },
            // Additional addons
            matchBrackets: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            highlightSelectionMatches: {
                showToken: /\w/,
                annotateScrollbar: true
            }
        });

        // Set change handler
        this.cm.on('change', () => {
            if (this.onChange) {
                this.onChange(this.getValue());
            }
        });

        console.log('CodeMirror initialized successfully');
    }

    /**
     * Initialize fallback textarea editor
     */
    initFallback(container) {
        this.fallbackTextarea = container;
        this.fallbackTextarea.style.display = 'block';

        this.fallbackTextarea.addEventListener('input', () => {
            if (this.onChange) {
                this.onChange(this.getValue());
            }
        });

        console.log('Using fallback textarea editor');
    }

    /**
     * Get editor content
     */
    getValue() {
        if (this.cm) {
            return this.cm.getValue();
        } else if (this.fallbackTextarea) {
            return this.fallbackTextarea.value;
        }
        return '';
    }

    /**
     * Set editor content
     */
    setValue(content) {
        if (this.cm) {
            this.cm.setValue(content || '');
        } else if (this.fallbackTextarea) {
            this.fallbackTextarea.value = content || '';
        }
    }

    /**
     * Insert markdown formatting
     */
    insertMarkdown(prefix, suffix, placeholder) {
        if (this.cm) {
            const doc = this.cm.getDoc();
            const cursor = doc.getCursor();
            const selection = doc.getSelection();

            if (selection) {
                doc.replaceSelection(prefix + selection + suffix);
            } else {
                const text = prefix + placeholder + suffix;
                doc.replaceRange(text, cursor);
                // Select the placeholder
                doc.setSelection(
                    { line: cursor.line, ch: cursor.ch + prefix.length },
                    { line: cursor.line, ch: cursor.ch + prefix.length + placeholder.length }
                );
            }

            this.cm.focus();
        } else if (this.fallbackTextarea) {
            const start = this.fallbackTextarea.selectionStart;
            const end = this.fallbackTextarea.selectionEnd;
            const text = this.fallbackTextarea.value;
            const selection = text.substring(start, end);

            let newText = selection ? (prefix + selection + suffix) : (prefix + placeholder + suffix);
            this.fallbackTextarea.value = text.substring(0, start) + newText + text.substring(end);

            if (selection) {
                this.fallbackTextarea.setSelectionRange(start + newText.length, start + newText.length);
            } else {
                this.fallbackTextarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
            }

            this.fallbackTextarea.focus();
        }

        if (this.onChange) {
            this.onChange(this.getValue());
        }
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        if (this.cm) {
            // Map app themes to CodeMirror themes
            const cmThemes = {
                'dark': 'material-darker',
                'light': 'default',
                'dracula': 'dracula',
                'nord': 'nord',
                'monokai': 'monokai'
            };

            const cmTheme = cmThemes[theme] || 'default';
            this.cm.setOption('theme', cmTheme);
        }
    }

    /**
     * Set font size
     */
    setFontSize(size) {
        if (this.cm) {
            this.cm.getWrapperElement().style.fontSize = size;
            this.cm.refresh();
        } else if (this.fallbackTextarea) {
            this.fallbackTextarea.style.fontSize = size;
        }
    }

    /**
     * Set font family
     */
    setFontFamily(family) {
        if (this.cm) {
            this.cm.getWrapperElement().style.fontFamily = family;
            this.cm.refresh();
        } else if (this.fallbackTextarea) {
            this.fallbackTextarea.style.fontFamily = family;
        }
    }

    /**
     * Refresh editor
     */
    refresh() {
        if (this.cm) {
            this.cm.refresh();
        }
    }

    /**
     * Focus editor
     */
    focus() {
        if (this.cm) {
            this.cm.focus();
        } else if (this.fallbackTextarea) {
            this.fallbackTextarea.focus();
        }
    }

    /**
     * Get cursor position info
     */
    getCursorInfo() {
        if (this.cm) {
            const cursor = this.cm.getCursor();
            const line = cursor.line + 1;
            const ch = cursor.ch + 1;
            return { line, column: ch };
        }
        return { line: 0, column: 0 };
    }

    /**
     * Get text statistics
     */
    getStats() {
        const content = this.getValue();
        const lines = content.split('\n').length;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const chars = content.length;

        return { lines, words, chars };
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const panel = document.getElementById('editorPanel');
        if (panel) {
            panel.classList.toggle('fullscreen-mode');
            if (this.cm) {
                setTimeout(() => this.cm.refresh(), 100);
            }
        }
    }
}
