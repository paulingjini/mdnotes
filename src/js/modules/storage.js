/**
 * Storage Module - Handles localStorage operations
 */
export const Storage = {
    keys: {
        files: 'mdnotes_files',
        settings: 'mdnotes_settings_v2'
    },

    /**
     * Load files from localStorage
     */
    loadFiles() {
        try {
            const data = localStorage.getItem(this.keys.files);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to load files:', e);
            return {};
        }
    },

    /**
     * Save files to localStorage
     */
    saveFiles(files) {
        try {
            localStorage.setItem(this.keys.files, JSON.stringify(files));
            return true;
        } catch (e) {
            console.error('Failed to save files:', e);
            return false;
        }
    },

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const data = localStorage.getItem(this.keys.settings);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load settings:', e);
            return null;
        }
    },

    /**
     * Save settings to localStorage
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.keys.settings, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    },

    /**
     * Clear all storage
     */
    clear() {
        try {
            localStorage.removeItem(this.keys.files);
            localStorage.removeItem(this.keys.settings);
            return true;
        } catch (e) {
            console.error('Failed to clear storage:', e);
            return false;
        }
    },

    /**
     * Get storage usage info
     */
    getStorageInfo() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            used: total,
            usedKB: (total / 1024).toFixed(2),
            usedMB: (total / (1024 * 1024)).toFixed(2)
        };
    }
};
