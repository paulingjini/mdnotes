/**
 * Task Lists Extension
 * Adds interactive checkboxes to task lists with persistence
 */
export class TaskListsExtension {
    constructor() {
        this.tasks = new Map();
    }

    /**
     * Initialize extension
     */
    init() {
        console.log('Task Lists extension initialized');
    }

    /**
     * Process all task lists in the preview
     */
    process(container, markdown) {
        if (!container) return;

        // Find all list items with checkboxes
        const listItems = container.querySelectorAll('li');

        listItems.forEach((li, index) => {
            const text = li.textContent.trim();

            // Check if it's a task list item (starts with [ ] or [x])
            if (text.startsWith('[ ]') || text.startsWith('[x]') || text.startsWith('[X]')) {
                this.enhanceTaskItem(li, index, markdown);
            }
        });
    }

    /**
     * Enhance a task list item
     */
    enhanceTaskItem(li, index, markdown) {
        // Skip if already enhanced
        if (li.classList.contains('task-list-item')) return;

        li.classList.add('task-list-item');

        const text = li.textContent.trim();
        const isChecked = text.startsWith('[x]') || text.startsWith('[X]');

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = isChecked;
        checkbox.setAttribute('data-task-index', index);

        // Create label with task text
        const label = document.createElement('label');
        label.className = 'task-label';
        const taskText = text.substring(3).trim(); // Remove [x] or [ ]
        label.textContent = taskText;

        if (isChecked) {
            label.classList.add('completed');
        }

        // Handle checkbox change
        checkbox.addEventListener('change', (e) => {
            this.handleTaskToggle(e, li, label, markdown);
        });

        // Clear existing content and add new elements
        li.innerHTML = '';
        li.appendChild(checkbox);
        li.appendChild(label);

        // Add progress indicator if this is in a list with multiple tasks
        const ul = li.closest('ul');
        if (ul) {
            this.updateTaskListProgress(ul);
        }
    }

    /**
     * Handle task checkbox toggle
     */
    handleTaskToggle(event, li, label, markdown) {
        const checkbox = event.target;
        const isChecked = checkbox.checked;

        // Update label styling
        if (isChecked) {
            label.classList.add('completed');
        } else {
            label.classList.remove('completed');
        }

        // Add visual feedback
        li.classList.add('task-updating');
        setTimeout(() => {
            li.classList.remove('task-updating');
        }, 300);

        // Update progress
        const ul = li.closest('ul');
        if (ul) {
            this.updateTaskListProgress(ul);
        }

        // Trigger callback for editor update (if connected)
        if (this.onTaskChange) {
            const taskIndex = checkbox.getAttribute('data-task-index');
            this.onTaskChange(taskIndex, isChecked, label.textContent);
        }
    }

    /**
     * Update task list progress indicator
     */
    updateTaskListProgress(ul) {
        // Skip if already has progress bar
        let progressBar = ul.previousElementSibling;
        if (!progressBar || !progressBar.classList.contains('task-progress')) {
            progressBar = document.createElement('div');
            progressBar.className = 'task-progress';
            ul.parentNode.insertBefore(progressBar, ul);
        }

        // Count tasks
        const taskItems = ul.querySelectorAll('.task-list-item');
        const total = taskItems.length;
        const completed = ul.querySelectorAll('.task-checkbox:checked').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update progress bar
        progressBar.innerHTML = `
            <div class="task-progress-bar">
                <div class="task-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="task-progress-text">
                ${completed} / ${total} tasks completed (${percentage}%)
            </div>
        `;
    }

    /**
     * Update markdown source with task state
     */
    updateMarkdownTask(markdown, taskIndex, isChecked) {
        const lines = markdown.split('\n');
        let taskCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/^[-*]\s\[[ xX]\]/)) {
                if (taskCount === parseInt(taskIndex)) {
                    // Update this line
                    const newState = isChecked ? '[x]' : '[ ]';
                    lines[i] = lines[i].replace(/\[[ xX]\]/, newState);
                    break;
                }
                taskCount++;
            }
        }

        return lines.join('\n');
    }

    /**
     * Export task list as checklist
     */
    exportTaskList(ul, filename) {
        const tasks = [];
        const taskItems = ul.querySelectorAll('.task-list-item');

        taskItems.forEach(item => {
            const checkbox = item.querySelector('.task-checkbox');
            const label = item.querySelector('.task-label');
            if (checkbox && label) {
                tasks.push({
                    completed: checkbox.checked,
                    text: label.textContent
                });
            }
        });

        // Create plain text format
        const text = tasks.map(task =>
            `${task.completed ? '[x]' : '[ ]'} ${task.text}`
        ).join('\n');

        // Download
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.txt`;
        link.click();
    }

    /**
     * Get task statistics
     */
    getTaskStats(container) {
        if (!container) return null;

        const taskItems = container.querySelectorAll('.task-list-item');
        const total = taskItems.length;
        const completed = container.querySelectorAll('.task-checkbox:checked').length;

        return {
            total,
            completed,
            pending: total - completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Clear all enhancements
     */
    clear() {
        this.tasks.clear();
    }
}
