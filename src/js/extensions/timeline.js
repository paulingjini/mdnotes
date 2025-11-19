/**
 * Timeline Extension - Adds timeline support via Mermaid Gantt and Timesheet.js
 */
export class TimelineExtension {
    constructor() {
        this.initialized = false;
        this.timesheetLoaded = false;
        this.timelineCounter = 0;
    }

    /**
     * Initialize timeline extension
     */
    init() {
        if (!window.mermaid) {
            console.warn('Mermaid not loaded, timeline support disabled');
            return false;
        }

        // Load timesheet.js CSS and JS
        this.loadTimesheetLibrary();

        this.initialized = true;
        console.log('Timeline extension initialized');
        return true;
    }

    /**
     * Load timesheet.js library
     */
    loadTimesheetLibrary() {
        // Add timesheet.js CSS
        if (!document.getElementById('timesheet-css')) {
            const css = document.createElement('style');
            css.id = 'timesheet-css';
            css.textContent = `
                /* Timesheet.js Styles */
                .timesheet {
                    margin: 20px 0;
                    background: var(--bg-secondary);
                    border-radius: 6px;
                    padding: 20px;
                    overflow-x: auto;
                }

                .timesheet .scale {
                    display: flex;
                    border-bottom: 2px solid var(--border);
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }

                .timesheet .scale .year {
                    flex: 1;
                    text-align: center;
                    font-weight: bold;
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .timesheet .timeline-row {
                    position: relative;
                    margin-bottom: 15px;
                    min-height: 40px;
                }

                .timesheet .timeline-label {
                    font-weight: 500;
                    color: var(--text-secondary);
                    margin-bottom: 5px;
                    font-size: 12px;
                }

                .timesheet .timeline-bar {
                    position: relative;
                    height: 30px;
                }

                .timesheet .timeline-event {
                    position: absolute;
                    height: 100%;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    font-size: 11px;
                    color: white;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .timesheet .timeline-event:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    z-index: 10;
                }

                .timesheet .timeline-event.color-1 { background: #007acc; }
                .timesheet .timeline-event.color-2 { background: #00aa66; }
                .timesheet .timeline-event.color-3 { background: #ff6b6b; }
                .timesheet .timeline-event.color-4 { background: #ffa500; }
                .timesheet .timeline-event.color-5 { background: #9b59b6; }
                .timesheet .timeline-event.color-6 { background: #3498db; }
            `;
            document.head.appendChild(css);
        }

        this.timesheetLoaded = true;
    }

    /**
     * Process timeline blocks in preview
     */
    process(container) {
        if (!container || !this.timesheetLoaded) return;

        // Find timesheet code blocks
        const timesheetBlocks = container.querySelectorAll('pre code.language-timesheet');

        timesheetBlocks.forEach((block) => {
            try {
                const data = JSON.parse(block.textContent);
                const timeline = this.createTimeline(data);

                // Replace code block with timeline
                const pre = block.parentElement;
                pre.parentElement.replaceChild(timeline, pre);
            } catch (error) {
                console.error('Timesheet render error:', error);
            }
        });
    }

    /**
     * Create timeline from data
     */
    createTimeline(data) {
        const container = document.createElement('div');
        container.className = 'timesheet';
        container.id = `timesheet-${this.timelineCounter++}`;

        // Parse years
        const years = this.extractYears(data.events);

        // Create scale
        const scale = document.createElement('div');
        scale.className = 'scale';
        years.forEach(year => {
            const yearEl = document.createElement('div');
            yearEl.className = 'year';
            yearEl.textContent = year;
            scale.appendChild(yearEl);
        });
        container.appendChild(scale);

        // Create timeline rows
        data.sections.forEach((section, sectionIndex) => {
            const row = document.createElement('div');
            row.className = 'timeline-row';

            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = section.name;
            row.appendChild(label);

            const bar = document.createElement('div');
            bar.className = 'timeline-bar';

            // Add events for this section
            data.events
                .filter(event => event.section === section.name)
                .forEach((event, eventIndex) => {
                    const eventEl = this.createEventElement(event, years, eventIndex, sectionIndex);
                    bar.appendChild(eventEl);
                });

            row.appendChild(bar);
            container.appendChild(row);
        });

        return container;
    }

    /**
     * Create event element
     */
    createEventElement(event, years, eventIndex, sectionIndex) {
        const el = document.createElement('div');
        el.className = `timeline-event color-${(sectionIndex % 6) + 1}`;
        el.textContent = event.label;
        el.title = `${event.label}\n${event.start} - ${event.end}`;

        // Calculate position and width
        const startYear = parseInt(event.start.split('-')[0]);
        const endYear = parseInt(event.end.split('-')[0]);
        const totalYears = years[years.length - 1] - years[0] + 1;

        const left = ((startYear - years[0]) / totalYears) * 100;
        const width = ((endYear - startYear + 1) / totalYears) * 100;

        el.style.left = `${left}%`;
        el.style.width = `${width}%`;

        return el;
    }

    /**
     * Extract years from events
     */
    extractYears(events) {
        const years = new Set();

        events.forEach(event => {
            const startYear = parseInt(event.start.split('-')[0]);
            const endYear = parseInt(event.end.split('-')[0]);

            for (let year = startYear; year <= endYear; year++) {
                years.add(year);
            }
        });

        return Array.from(years).sort((a, b) => a - b);
    }

    /**
     * Get timesheet.js example
     */
    static getTimesheetExample() {
        return `### Project History (Timesheet)

\`\`\`timesheet
{
  "sections": [
    { "name": "Development" },
    { "name": "Design" },
    { "name": "Marketing" }
  ],
  "events": [
    {
      "section": "Development",
      "label": "MVP Development",
      "start": "2020-01",
      "end": "2020-06"
    },
    {
      "section": "Development",
      "label": "Beta Release",
      "start": "2020-07",
      "end": "2020-12"
    },
    {
      "section": "Development",
      "label": "v1.0 Launch",
      "start": "2021-01",
      "end": "2021-03"
    },
    {
      "section": "Development",
      "label": "v2.0 Development",
      "start": "2021-06",
      "end": "2022-06"
    },
    {
      "section": "Design",
      "label": "Brand Identity",
      "start": "2020-01",
      "end": "2020-03"
    },
    {
      "section": "Design",
      "label": "UI/UX Redesign",
      "start": "2020-10",
      "end": "2021-02"
    },
    {
      "section": "Design",
      "label": "Dark Mode",
      "start": "2021-05",
      "end": "2021-07"
    },
    {
      "section": "Marketing",
      "label": "Launch Campaign",
      "start": "2020-12",
      "end": "2021-04"
    },
    {
      "section": "Marketing",
      "label": "Content Marketing",
      "start": "2021-03",
      "end": "2022-12"
    }
  ]
}
\`\`\`

**Timesheet Format:**
- Use JSON to define sections and events
- Each event has: section, label, start (YYYY-MM), end (YYYY-MM)
- Events are automatically color-coded by section
- Hover over events to see details
`;
    }

    /**
     * Get example timeline markdown
     */
    static getGanttExample() {
        return `### Project Timeline (Gantt)
\`\`\`mermaid
gantt
    title Project Development Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements      :done,    req1, 2024-01-01, 2024-01-15
    Design           :done,    des1, 2024-01-16, 2024-01-31
    section Development
    Frontend         :active,  dev1, 2024-02-01, 45d
    Backend          :         dev2, 2024-02-15, 60d
    section Testing
    Unit Tests       :         test1, after dev1, 20d
    Integration      :         test2, after dev2, 15d
    section Deployment
    Staging          :         dep1, after test2, 5d
    Production       :         dep2, after dep1, 3d
\`\`\``;
    }

    /**
     * Get simple timeline example
     */
    static getTimelineExample() {
        return `### Company History (Timeline)
\`\`\`mermaid
timeline
    title History of Our Company
    2010 : Founded in San Francisco
         : First product launch
    2012 : Series A funding
         : Expanded to 50 employees
    2015 : Reached 1M users
         : Opened European office
    2018 : IPO on NASDAQ
         : 500+ employees globally
    2020 : Acquired competitor
         : Launched mobile app
    2024 : 10M+ active users
         : AI-powered features
\`\`\``;
    }

    /**
     * Get journey example
     */
    static getJourneyExample() {
        return `### User Journey
\`\`\`mermaid
journey
    title My Product Development Journey
    section Discovery
      Research: 5: Me, Team
      Brainstorm: 4: Me, Team
      Validate: 3: Me, Users
    section Design
      Wireframes: 4: Me, Designer
      Mockups: 5: Designer
      Prototype: 4: Designer, Dev
    section Development
      Code: 3: Dev Team
      Review: 4: Me, Dev Team
      Test: 2: QA Team
    section Launch
      Deploy: 5: DevOps
      Monitor: 4: Me, Team
      Celebrate: 5: Everyone
\`\`\``;
    }

    /**
     * Get all timeline examples
     */
    static getAllExamples() {
        return `# Timeline & Gantt Chart Examples

${this.getTimesheetExample()}

${this.getGanttExample()}

${this.getTimelineExample()}

${this.getJourneyExample()}

## Gantt Chart Syntax

### Date Formats
- \`YYYY-MM-DD\` : 2024-01-15
- \`YYYY-MM-DD HH:mm\` : 2024-01-15 14:30

### Task Statuses
- \`done\` : Completed task
- \`active\` : Currently in progress
- \`crit\` : Critical path
- (blank) : Scheduled/future task

### Duration
- \`2024-01-01, 2024-01-31\` : Start and end date
- \`2024-01-01, 30d\` : Start date and duration
- \`after task1, 20d\` : After another task

### Sections
\`\`\`
section Section Name
    Task 1 :done, id1, 2024-01-01, 10d
    Task 2 :active, id2, after id1, 15d
\`\`\`

## Tips

1. Use sections to group related tasks
2. Use task IDs to create dependencies
3. Mark critical tasks with \`crit\`
4. Use descriptive task names
5. Keep timelines readable (not too many tasks)
`;
    }
}
