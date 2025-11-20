/**
 * Toast Notification System
 * Modern toast notifications with animations and auto-dismiss
 */

export class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.defaultDuration = 3000; // 3 seconds
    }

    /**
     * Initialize the toast container
     */
    init() {
        // Create container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (0 for persistent)
     * @returns {HTMLElement} The toast element
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        if (!this.container) {
            this.init();
        }

        // Create toast element
        const toast = this.createToast(message, type);

        // Add to container
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Auto dismiss if duration > 0
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Create toast element
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @returns {HTMLElement} Toast element
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Get icon based on type
        const icon = this.getIcon(type);

        toast.innerHTML = `
            <div class="toast-icon">
                ${icon}
            </div>
            <div class="toast-content">
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 5 5 L 15 15 M 15 5 L 5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="toast-progress"></div>
        `;

        // Add close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toast));

        return toast;
    }

    /**
     * Get icon SVG for toast type
     * @param {string} type - Toast type
     * @returns {string} SVG icon
     */
    getIcon(type) {
        const icons = {
            success: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M 6 10 L 9 13 L 14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `,
            error: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M 7 7 L 13 13 M 13 7 L 7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `,
            warning: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 10 2 L 18 16 L 2 16 Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <path d="M 10 7 L 10 11 M 10 13.5 L 10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `,
            info: `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M 10 9 L 10 14 M 10 6 L 10 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `
        };

        return icons[type] || icons.info;
    }

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    dismiss(toast) {
        // Add removing class for animation
        toast.classList.add('toast-removing');

        // Remove after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }

            // Remove from array
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300); // Match animation duration
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        this.toasts.forEach(toast => this.dismiss(toast));
    }

    /**
     * Show success toast
     * @param {string} message - Toast message
     * @param {number} duration - Duration in ms
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     * @param {string} message - Toast message
     * @param {number} duration - Duration in ms
     */
    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning toast
     * @param {string} message - Toast message
     * @param {number} duration - Duration in ms
     */
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info toast
     * @param {string} message - Toast message
     * @param {number} duration - Duration in ms
     */
    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create singleton instance
export const Toast = new ToastManager();
