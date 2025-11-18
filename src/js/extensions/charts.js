/**
 * Charts Extension - Adds Chart.js support to markdown
 */
export class ChartsExtension {
    constructor() {
        this.charts = [];
    }

    /**
     * Initialize charts extension
     */
    init() {
        if (!window.Chart) {
            console.warn('Chart.js not loaded');
            return false;
        }

        console.log('Charts extension initialized');
        return true;
    }

    /**
     * Process markdown and render charts
     */
    process(container) {
        if (!window.Chart || !container) return;

        // Find chart code blocks
        const chartBlocks = container.querySelectorAll('pre code.language-chart');

        chartBlocks.forEach((block, index) => {
            try {
                const config = JSON.parse(block.textContent);

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.id = `chart-${Date.now()}-${index}`;
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';

                // Replace code block with canvas
                const pre = block.parentElement;
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-wrapper';
                wrapper.style.padding = '20px';
                wrapper.style.background = 'var(--bg-secondary)';
                wrapper.style.borderRadius = '8px';
                wrapper.style.margin = '1em 0';
                wrapper.appendChild(canvas);

                pre.parentElement.replaceChild(wrapper, pre);

                // Create chart
                const chart = new Chart(canvas, config);
                this.charts.push(chart);

            } catch (error) {
                console.error('Chart render error:', error);
                block.parentElement.innerHTML = `<p style="color: red;">Chart Error: ${error.message}</p>`;
            }
        });
    }

    /**
     * Destroy all charts
     */
    destroy() {
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];
    }

    /**
     * Get example chart markdown
     */
    static getExample() {
        return `### Bar Chart Example
\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [{
      "label": "Sales 2024",
      "data": [12, 19, 15, 25, 22, 30],
      "backgroundColor": "rgba(0, 122, 204, 0.6)",
      "borderColor": "rgba(0, 122, 204, 1)",
      "borderWidth": 1
    }]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "legend": {
        "display": true,
        "position": "top"
      }
    },
    "scales": {
      "y": {
        "beginAtZero": true
      }
    }
  }
}
\`\`\`

### Line Chart Example
\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "datasets": [{
      "label": "Revenue",
      "data": [65, 78, 90, 81],
      "fill": false,
      "borderColor": "rgb(75, 192, 192)",
      "tension": 0.1
    }]
  },
  "options": {
    "responsive": true
  }
}
\`\`\`

### Pie Chart Example
\`\`\`chart
{
  "type": "pie",
  "data": {
    "labels": ["Product A", "Product B", "Product C"],
    "datasets": [{
      "data": [300, 150, 100],
      "backgroundColor": [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)"
      ]
    }]
  },
  "options": {
    "responsive": true
  }
}
\`\`\``;
    }
}
