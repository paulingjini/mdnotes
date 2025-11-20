/**
 * Layout Manager - Modern UI Layout Controller
 * Handles sidebar, tabs, responsive behavior
 */

export class LayoutManager {
    constructor() {
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.tabs = [];
        this.activeTab = null;
        this.isSidebarCollapsed = false;
        this.isMobile = false;

        // Callbacks
        this.onTabChange = null;
        this.onSidebarToggle = null;
    }

    /**
     * Initialize layout manager
     */
    init() {
        console.log('Initializing LayoutManager...');

        // Get DOM elements
        this.sidebar = document.querySelector('.app-sidebar');
        this.sidebarToggle = document.querySelector('.sidebar-toggle');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        this.tabsContainer = document.querySelector('.editor-tabs');
        this.panelsContainer = document.querySelector('.editor-panels');

        // Check if mobile
        this.checkMobile();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize tabs
        this.initTabs();

        // Load saved state
        this.loadState();

        console.log('LayoutManager initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar toggle button
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Sidebar overlay (mobile)
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    /**
     * Initialize tabs system
     */
    initTabs() {
        const tabElements = this.tabsContainer?.querySelectorAll('.editor-tab');
        const panelElements = this.panelsContainer?.querySelectorAll('.editor-panel');

        if (!tabElements || !panelElements) return;

        tabElements.forEach((tab, index) => {
            const tabId = tab.dataset.tab;
            const panel = panelElements[index];

            this.tabs.push({
                id: tabId,
                element: tab,
                panel: panel
            });

            // Click handler
            tab.addEventListener('click', () => {
                this.switchTab(tabId);
            });
        });

        // Activate first tab
        if (this.tabs.length > 0) {
            this.switchTab(this.tabs[0].id);
        }
    }

    /**
     * Switch active tab
     */
    switchTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Deactivate all tabs
        this.tabs.forEach(t => {
            t.element.classList.remove('active');
            t.panel.classList.remove('active');
        });

        // Activate selected tab
        tab.element.classList.add('active');
        tab.panel.classList.add('active');

        this.activeTab = tabId;

        // Trigger callback
        if (this.onTabChange) {
            this.onTabChange(tabId);
        }

        // Save state
        this.saveState();
    }

    /**
     * Get active tab
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Toggle sidebar open/closed
     */
    toggleSidebar() {
        if (this.isSidebarCollapsed) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }

    /**
     * Open sidebar
     */
    openSidebar() {
        if (!this.sidebar) return;

        this.sidebar.classList.remove('collapsed');
        this.isSidebarCollapsed = false;

        // Show overlay on mobile
        if (this.isMobile && this.sidebarOverlay) {
            this.sidebarOverlay.classList.add('active');
        }

        // Trigger callback
        if (this.onSidebarToggle) {
            this.onSidebarToggle(false);
        }

        this.saveState();
    }

    /**
     * Close sidebar
     */
    closeSidebar() {
        if (!this.sidebar) return;

        this.sidebar.classList.add('collapsed');
        this.isSidebarCollapsed = true;

        // Hide overlay
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }

        // Trigger callback
        if (this.onSidebarToggle) {
            this.onSidebarToggle(true);
        }

        this.saveState();
    }

    /**
     * Check if mobile viewport
     */
    checkMobile() {
        this.isMobile = window.innerWidth <= 1024;

        // Auto-collapse sidebar on mobile
        if (this.isMobile && !this.isSidebarCollapsed) {
            this.closeSidebar();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.checkMobile();

        // If transitioning from desktop to mobile, close sidebar
        if (!wasMobile && this.isMobile) {
            this.closeSidebar();
        }

        // If transitioning from mobile to desktop, restore sidebar state
        if (wasMobile && !this.isMobile) {
            const savedState = this.loadState();
            if (!savedState.sidebarCollapsed) {
                this.openSidebar();
            }
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Cmd/Ctrl + B - Toggle sidebar
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }

        // Cmd/Ctrl + 1-4 - Switch tabs
        if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            if (this.tabs[index]) {
                this.switchTab(this.tabs[index].id);
            }
        }

        // Escape - Close sidebar on mobile
        if (e.key === 'Escape' && this.isMobile && !this.isSidebarCollapsed) {
            this.closeSidebar();
        }
    }

    /**
     * Save layout state to localStorage
     */
    saveState() {
        const state = {
            activeTab: this.activeTab,
            sidebarCollapsed: this.isSidebarCollapsed
        };

        try {
            localStorage.setItem('mdnotes_layout_state', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save layout state:', error);
        }
    }

    /**
     * Load layout state from localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem('mdnotes_layout_state');
            if (saved) {
                const state = JSON.parse(saved);

                // Restore tab
                if (state.activeTab && this.tabs.find(t => t.id === state.activeTab)) {
                    this.switchTab(state.activeTab);
                }

                // Restore sidebar (only on desktop)
                if (!this.isMobile && state.sidebarCollapsed !== undefined) {
                    if (state.sidebarCollapsed) {
                        this.closeSidebar();
                    } else {
                        this.openSidebar();
                    }
                }

                return state;
            }
        } catch (error) {
            console.warn('Failed to load layout state:', error);
        }

        return {};
    }

    /**
     * Add a new tab programmatically
     */
    addTab(config) {
        const { id, label, icon, panel } = config;

        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'editor-tab';
        tabElement.dataset.tab = id;

        if (icon) {
            const iconEl = document.createElement('span');
            iconEl.innerHTML = icon;
            tabElement.appendChild(iconEl);
        }

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        tabElement.appendChild(labelEl);

        // Add to DOM
        this.tabsContainer.appendChild(tabElement);

        // Create panel element if not provided
        let panelElement = panel;
        if (!panelElement) {
            panelElement = document.createElement('div');
            panelElement.className = 'editor-panel';
            panelElement.dataset.panel = id;
            this.panelsContainer.appendChild(panelElement);
        }

        // Add to tabs array
        this.tabs.push({
            id,
            element: tabElement,
            panel: panelElement
        });

        // Add click handler
        tabElement.addEventListener('click', () => {
            this.switchTab(id);
        });

        return panelElement;
    }

    /**
     * Remove a tab
     */
    removeTab(tabId) {
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        const tab = this.tabs[index];

        // Remove from DOM
        tab.element.remove();
        tab.panel.remove();

        // Remove from array
        this.tabs.splice(index, 1);

        // If this was the active tab, switch to first tab
        if (this.activeTab === tabId && this.tabs.length > 0) {
            this.switchTab(this.tabs[0].id);
        }
    }

    /**
     * Show/hide tab
     */
    setTabVisibility(tabId, visible) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        tab.element.style.display = visible ? 'flex' : 'none';
    }

    /**
     * Update tab badge/counter
     */
    updateTabBadge(tabId, count) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        let badge = tab.element.querySelector('.tab-badge');

        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tab-badge';
                tab.element.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    }

    /**
     * Get sidebar collapsed state
     */
    isSidebarOpen() {
        return !this.isSidebarCollapsed;
    }

    /**
     * Destroy layout manager
     */
    destroy() {
        // Remove event listeners
        if (this.sidebarToggle) {
            this.sidebarToggle.removeEventListener('click', this.toggleSidebar);
        }

        if (this.sidebarOverlay) {
            this.sidebarOverlay.removeEventListener('click', this.closeSidebar);
        }

        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboard);

        console.log('LayoutManager destroyed');
    }
}

export default LayoutManager;
