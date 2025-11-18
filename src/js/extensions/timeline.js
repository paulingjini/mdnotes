/**
 * Timeline Extension - Adds timeline support via Mermaid Gantt
 */
export class TimelineExtension {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize timeline extension
     */
    init() {
        if (!window.mermaid) {
            console.warn('Mermaid not loaded, timeline support disabled');
            return false;
        }

        this.initialized = true;
        console.log('Timeline extension initialized');
        return true;
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
