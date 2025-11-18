/**
 * Theme Module - Handles theme management
 */
export const Theme = {
    themes: {
        dark: {
            '--bg-primary': '#1e1e1e',
            '--bg-secondary': '#252526',
            '--bg-tertiary': '#2d2d30',
            '--text-primary': '#d4d4d4',
            '--text-secondary': '#808080',
            '--border': '#3e3e42',
            '--accent': '#007acc'
        },
        light: {
            '--bg-primary': '#fff',
            '--bg-secondary': '#f0f0f0',
            '--bg-tertiary': '#e0e0e0',
            '--text-primary': '#000',
            '--text-secondary': '#666',
            '--border': '#ccc',
            '--accent': '#0066cc'
        },
        dracula: {
            '--bg-primary': '#282a36',
            '--bg-secondary': '#1e1f29',
            '--bg-tertiary': '#44475a',
            '--text-primary': '#f8f8f2',
            '--text-secondary': '#6272a4',
            '--border': '#44475a',
            '--accent': '#bd93f9'
        },
        nord: {
            '--bg-primary': '#2e3440',
            '--bg-secondary': '#3b4252',
            '--bg-tertiary': '#434c5e',
            '--text-primary': '#eceff4',
            '--text-secondary': '#d8dee9',
            '--border': '#4c566a',
            '--accent': '#88c0d0'
        },
        monokai: {
            '--bg-primary': '#272822',
            '--bg-secondary': '#1e1f1c',
            '--bg-tertiary': '#3e3d32',
            '--text-primary': '#f8f8f2',
            '--text-secondary': '#75715e',
            '--border': '#3e3d32',
            '--accent': '#66d9ef'
        }
    },

    currentTheme: 'dark',

    /**
     * Apply a theme
     */
    apply(themeName) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.warn(`Theme '${themeName}' not found`);
            return false;
        }

        // Apply CSS variables
        Object.keys(theme).forEach(key => {
            document.documentElement.style.setProperty(key, theme[key]);
        });

        // Update data attribute
        document.documentElement.setAttribute('data-theme', themeName);

        this.currentTheme = themeName;

        // Update theme presets
        document.querySelectorAll('.theme-preset').forEach(el => {
            el.classList.toggle('active', el.dataset.theme === themeName);
        });

        // Sync Mermaid theme
        if (window.mermaid) {
            const mermaidTheme = (themeName === 'light') ? 'default' : 'dark';
            window.mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
        }

        return true;
    },

    /**
     * Get current theme name
     */
    getCurrent() {
        return this.currentTheme;
    },

    /**
     * Get all available themes
     */
    getAll() {
        return Object.keys(this.themes);
    }
};
