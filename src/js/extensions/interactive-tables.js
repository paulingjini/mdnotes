/**
 * Interactive Tables Extension
 * Adds sort, filter, and export capabilities to markdown tables
 */
export class InteractiveTablesExtension {
    constructor() {
        this.tables = [];
        this.sortState = new Map();
    }

    /**
     * Initialize extension
     */
    init() {
        console.log('Interactive Tables extension initialized');
    }

    /**
     * Process all tables in the preview
     */
    process(container) {
        if (!container) return;

        const tables = container.querySelectorAll('table');
        tables.forEach((table, index) => {
            this.enhanceTable(table, index);
        });
    }

    /**
     * Enhance a single table with interactive features
     */
    enhanceTable(table, index) {
        // Skip if already enhanced
        if (table.classList.contains('interactive-table')) return;

        table.classList.add('interactive-table');
        table.setAttribute('data-table-id', index);

        // Wrap table in container
        const wrapper = document.createElement('div');
        wrapper.className = 'interactive-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        // Add toolbar
        const toolbar = this.createToolbar(table, index);
        wrapper.insertBefore(toolbar, table);

        // Make headers sortable
        const headers = table.querySelectorAll('thead th');
        headers.forEach((header, colIndex) => {
            header.classList.add('sortable');
            header.setAttribute('data-col-index', colIndex);
            header.style.cursor = 'pointer';
            header.title = 'Click to sort';

            // Add sort icon
            const sortIcon = document.createElement('span');
            sortIcon.className = 'sort-icon';
            sortIcon.innerHTML = ' ⇅';
            header.appendChild(sortIcon);

            header.addEventListener('click', () => {
                this.sortTable(table, colIndex);
            });
        });

        // Store original rows for filtering
        this.storeTableData(table, index);
    }

    /**
     * Create toolbar with filter and export options
     */
    createToolbar(table, index) {
        const toolbar = document.createElement('div');
        toolbar.className = 'table-toolbar';

        // Filter input
        const filterContainer = document.createElement('div');
        filterContainer.className = 'table-filter';

        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = '🔍 Filter table...';
        filterInput.className = 'table-filter-input';
        filterInput.addEventListener('input', (e) => {
            this.filterTable(table, e.target.value);
        });

        filterContainer.appendChild(filterInput);

        // Export button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn table-export-btn';
        exportBtn.innerHTML = '📥 Export CSV';
        exportBtn.addEventListener('click', () => {
            this.exportTableToCSV(table, `table-${index}`);
        });

        // Row count
        const rowCount = document.createElement('span');
        rowCount.className = 'table-row-count';
        const rows = table.querySelectorAll('tbody tr').length;
        rowCount.textContent = `${rows} rows`;
        rowCount.setAttribute('data-total-rows', rows);

        toolbar.appendChild(filterContainer);
        toolbar.appendChild(exportBtn);
        toolbar.appendChild(rowCount);

        return toolbar;
    }

    /**
     * Store original table data
     */
    storeTableData(table, index) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        this.tables[index] = {
            table: table,
            originalRows: rows.map(row => row.cloneNode(true)),
            visibleRows: rows.length
        };
    }

    /**
     * Sort table by column
     */
    sortTable(table, colIndex) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const tableId = table.getAttribute('data-table-id');

        // Get current sort state
        const sortKey = `${tableId}-${colIndex}`;
        const currentSort = this.sortState.get(sortKey) || 'none';
        let newSort = 'asc';

        if (currentSort === 'none') newSort = 'asc';
        else if (currentSort === 'asc') newSort = 'desc';
        else newSort = 'none';

        // Update sort state
        this.sortState.clear(); // Only one column sorted at a time
        this.sortState.set(sortKey, newSort);

        // Update sort icons
        const headers = table.querySelectorAll('thead th');
        headers.forEach((header, idx) => {
            const icon = header.querySelector('.sort-icon');
            if (idx === colIndex) {
                icon.innerHTML = newSort === 'asc' ? ' ↑' : newSort === 'desc' ? ' ↓' : ' ⇅';
            } else {
                icon.innerHTML = ' ⇅';
            }
        });

        if (newSort === 'none') {
            // Restore original order
            const tableData = this.tables[parseInt(tableId)];
            if (tableData) {
                tbody.innerHTML = '';
                tableData.originalRows.forEach(row => {
                    tbody.appendChild(row.cloneNode(true));
                });
            }
            return;
        }

        // Sort rows
        rows.sort((a, b) => {
            const aCell = a.cells[colIndex];
            const bCell = b.cells[colIndex];

            if (!aCell || !bCell) return 0;

            let aValue = aCell.textContent.trim();
            let bValue = bCell.textContent.trim();

            // Try to parse as numbers
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return newSort === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // String comparison
            return newSort === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

    /**
     * Filter table rows
     */
    filterTable(table, filterText) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const filterLower = filterText.toLowerCase();
        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(filterLower)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update row count
        const wrapper = table.closest('.interactive-table-wrapper');
        if (wrapper) {
            const rowCount = wrapper.querySelector('.table-row-count');
            if (rowCount) {
                const total = rowCount.getAttribute('data-total-rows');
                rowCount.textContent = filterText
                    ? `${visibleCount} / ${total} rows`
                    : `${total} rows`;
            }
        }
    }

    /**
     * Export table to CSV
     */
    exportTableToCSV(table, filename) {
        const rows = [];

        // Get headers
        const headers = table.querySelectorAll('thead th');
        const headerRow = [];
        headers.forEach(header => {
            // Remove sort icon
            const text = header.textContent.replace(/[⇅↑↓]/g, '').trim();
            headerRow.push(this.escapeCSV(text));
        });
        rows.push(headerRow.join(','));

        // Get visible data rows
        const dataRows = table.querySelectorAll('tbody tr');
        dataRows.forEach(row => {
            if (row.style.display !== 'none') {
                const cells = row.querySelectorAll('td');
                const rowData = [];
                cells.forEach(cell => {
                    rowData.push(this.escapeCSV(cell.textContent.trim()));
                });
                rows.push(rowData.join(','));
            }
        });

        // Create CSV string
        const csv = rows.join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    }

    /**
     * Escape CSV value
     */
    escapeCSV(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    }

    /**
     * Clear all enhancements
     */
    clear() {
        this.tables = [];
        this.sortState.clear();
    }
}
