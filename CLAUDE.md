# CLAUDE.md - AI Assistant Guide for mdnotes

## Project Overview

**mdnotes** is a single-file, browser-based Markdown editor with advanced presentation and visualization capabilities. It combines:

- **Markdown Editor** with live preview
- **Presentation Mode** powered by Reveal.js
- **Mindmap Visualization** using markmap
- **PDF Export** for both preview and slides
- **Mermaid Diagram Support**
- **Multi-file Management** with localStorage persistence

The entire application is contained in a single `index.html` file (59,889 bytes) with no external dependencies required at runtime - all libraries are loaded via CDN.

## Codebase Structure

### Single-File Architecture

```
/home/user/mdnotes/
├── .git/                 # Git repository
└── index.html           # Complete application (HTML + CSS + JS)
```

### index.html Sections

The file is organized into distinct sections:

1. **Lines 1-15**: HTML Head & External CSS Links
2. **Lines 16-352**: Embedded CSS (`<style>` tag)
   - CSS Variables for theming (`:root`)
   - Component styles (header, toolbar, panels, etc.)
   - Modal dialogs
   - Responsive layout
3. **Lines 354-663**: HTML Structure
   - Header with title and controls
   - Toolbar with view toggles and actions
   - Main container with three panels (editor, preview, mindmap)
   - File manager sidebar
   - Modal dialogs (settings, help, templates)
4. **Lines 664-683**: External JavaScript Libraries
   - marked.js (Markdown parsing)
   - d3.js (visualizations)
   - markmap (mindmaps)
   - reveal.js (presentations)
   - html2canvas & jsPDF (PDF export)
   - highlight.js (syntax highlighting)
   - mermaid.js (diagrams)
5. **Lines 685-1288**: Application JavaScript (`app` object)
6. **Lines 1291-1320**: SVG Icon Sprite Sheet

## Key Application Features

### 1. File Management (lines 686-688, 869-965)
- Files stored in `app.files` object
- Each file: `{name, content, modified}`
- Persisted to localStorage as `itil_files`
- Current file tracked in `app.currentFile`

### 2. View System (lines 689, 1083-1095)
- Three views: `editor`, `preview`, `mindmap`
- Toggle visibility via `app.toggleView()`
- Views tracked in `app.views` object

### 3. Theme System (lines 702-708, 810-828)
- Five themes: dark, light, dracula, nord, monokai
- CSS variables for consistency
- Theme state in `app.settings.theme`
- Applied via `app.setTheme()`

### 4. Presentation Mode (lines 1142-1194)
- Uses Reveal.js for slide rendering
- Slides separated by `---` in Markdown
- YAML frontmatter support for theme
- Fullscreen toggle available

### 5. Export Capabilities (lines 971-1064)
- Markdown (.md)
- HTML (standalone with inline styles)
- PDF Preview (screenshot of rendered markdown)
- PDF Slides (each slide as separate page)

### 6. Mermaid Diagram Support (lines 719-720, 1066-1076)
- Auto-renders code blocks with `language-mermaid` class
- Theme synced with app theme
- Re-renders on preview updates

## Development Workflow

### Testing Changes

Since this is a single HTML file:

```bash
# 1. Edit index.html directly
# 2. Open in browser (or refresh if already open)
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# 3. Check browser console for errors
# 4. Test features in the UI
```

### Local Development Server (Optional)

```bash
# Simple HTTP server for testing
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Debugging Tips

1. **Console Errors**: Check browser DevTools console (F12)
2. **LocalStorage**: View in Application tab of DevTools
3. **CSS Issues**: Use Elements inspector to check computed styles
4. **JavaScript**: Add `console.log()` or use debugger breakpoints

## Code Architecture

### The `app` Object (lines 686-1282)

The application is organized as a single object with methods:

```javascript
const app = {
    // State
    files: {},           // All loaded files
    currentFile: null,   // Active file name
    views: {},           // View visibility state
    mm: null,           // Markmap instance
    reveal: null,       // Reveal.js instance
    presentMode: false, // Presentation active?
    settings: {},       // User preferences
    themes: {},         // Theme definitions
    templates: {},      // Presentation templates

    // Methods (see sections below)
    init() {},
    render() {},
    // ... etc
};
```

### Key Methods Reference

| Method | Purpose | Lines |
|--------|---------|-------|
| `init()` | Initialize app on page load | 717-764 |
| `loadStorage()` | Load from localStorage | 778-790 |
| `saveStorage()` | Save to localStorage | 792-799 |
| `render()` | Update file list UI | 869-885 |
| `updatePreview()` | Convert markdown to HTML | 1066-1076 |
| `saveFile()` | Save current file | 955-960 |
| `newFile()` | Create new file | 907-911 |
| `toggleView()` | Show/hide panels | 1083-1095 |
| `togglePresentation()` | Enter/exit presentation | 1181-1194 |
| `exportAs()` | Export to various formats | 971-991 |
| `setTheme()` | Apply color theme | 810-828 |
| `insertMarkdown()` | Add markdown formatting | 1204-1222 |
| `refreshMindmap()` | Update mindmap view | 1244-1258 |

## Extension Patterns

### Adding a New Theme

1. Add theme to `app.themes` object (line 702):
```javascript
themes: {
    // ... existing themes
    myTheme: {
        '--bg-primary': '#...',
        '--bg-secondary': '#...',
        // ... all CSS variables
    }
}
```

2. Add preset button in Settings Modal (line 526):
```html
<div class="theme-preset" data-theme="myTheme"
     style="background:linear-gradient(...)"
     onclick="app.setTheme('myTheme')"></div>
```

### Adding a New Export Format

1. Add option to export menu (line 403):
```html
<div class="dropdown-item" onclick="app.exportAs('newformat')">
    <svg class="icon">...</svg>
    <span>as New Format</span>
</div>
```

2. Add handler in `exportAs()` method (line 971):
```javascript
exportAs(fmt) {
    // ... existing cases
    case 'newformat':
        // Your export logic
        break;
}
```

### Adding a Toolbar Button

1. Add button to toolbar (line 373):
```html
<button class="toolbar-btn" onclick="app.myNewFeature()" title="...">
    <svg class="icon"><use href="#icon-name"></use></svg>
    <span>Label</span>
</button>
```

2. Add icon to sprite sheet (line 1291):
```html
<symbol id="icon-name" viewBox="0 0 24 24">
    <!-- SVG path data -->
</symbol>
```

3. Add method to `app` object:
```javascript
myNewFeature() {
    // Your feature logic
}
```

### Adding a Modal Dialog

1. Add modal HTML (after line 656):
```html
<div class="modal" id="myModal">
    <div class="modal-content">
        <div class="modal-header">
            <div class="modal-title">Title</div>
            <button class="icon-btn" onclick="app.closeModal()">
                <svg class="icon"><use href="#icon-close"></use></svg>
            </button>
        </div>
        <!-- Modal content -->
    </div>
</div>
```

2. Add show method:
```javascript
showMyModal() {
    document.getElementById('myModal').classList.add('show');
}
```

## Styling System

### CSS Variables (lines 19-28)

All colors and fonts use CSS variables for easy theming:

```css
:root {
    --bg-primary: #1e1e1e;      /* Main background */
    --bg-secondary: #252526;     /* Secondary panels */
    --bg-tertiary: #2d2d30;      /* Buttons, inputs */
    --text-primary: #d4d4d4;     /* Main text */
    --text-secondary: #808080;   /* Muted text */
    --border: #3e3e42;           /* Borders */
    --accent: #007acc;           /* Accent color */
    --font-family: 'Consolas', monospace;
}
```

### Responsive Classes

- `.hidden` - Hides elements
- `.active` - Highlights active buttons
- `.fullscreen` - Fullscreen mode for preview
- `.show` - Shows modal dialogs

### Toolbar Styles (lines 112-114)

Body attribute controls toolbar appearance:
- `data-toolbar-style="icon-only"` - Icons only (default)
- `data-toolbar-style="icon-text"` - Icons with labels
- `data-toolbar-style="text-only"` - Text labels only

## External Dependencies

All loaded via CDN (no npm/build process needed):

| Library | Version | Purpose | Lines |
|---------|---------|---------|-------|
| marked.js | Latest | Markdown → HTML parsing | 665 |
| d3.js | v7 | Data visualization | 666 |
| markmap-autoloader | Latest | Mindmap generation | 667 |
| reveal.js | 4.6.1 | Presentation framework | 670-671 |
| html2canvas | 1.4.1 | Screenshot for PDF | 674 |
| jsPDF | 2.5.1 | PDF generation | 675 |
| highlight.js | 11.9.0 | Syntax highlighting | 680 |
| mermaid.js | 10.9.1 | Diagram rendering | 683 |

### Library Integration Notes

**marked.js**: Enhanced with extensions (lines 767-776)
- `markedGfmHeadingId` for heading IDs
- `markedHighlight` for code syntax highlighting

**Mermaid**: Initialized with theme sync (line 720)
```javascript
mermaid.initialize({ startOnLoad: false, theme: 'dark' });
```

**Reveal.js**: Dynamically initialized only in presentation mode (lines 1142-1171)

## Storage System

### LocalStorage Keys

- `itil_files` - All files (JSON object)
- `itil_settings_v4` - User settings (JSON object)

### Data Structures

**Files Object**:
```javascript
{
    "filename.md": {
        name: "filename.md",
        content: "# Markdown content...",
        modified: 1234567890  // timestamp
    }
}
```

**Settings Object**:
```javascript
{
    theme: 'dark',
    font: "'Consolas',monospace",
    size: '13px',
    revealTheme: 'black',
    appName: 'ITIL 4 Editor',
    toolbarStyle: 'icon-only'
}
```

### Storage Methods

- `loadStorage()` (line 778) - Load on init
- `saveStorage()` (line 792) - Save state
- `save()` (line 962) - Auto-save on edit

## Best Practices for AI Assistants

### When Modifying Code

1. **Always read the full file first** - It's only ~1300 lines
2. **Use Edit tool for changes** - Never rewrite the entire file
3. **Test in browser** - Changes won't work until loaded in browser
4. **Check console for errors** - JavaScript errors will break features
5. **Preserve formatting** - Maintain consistent indentation (4 spaces)

### Common Modification Patterns

**Adding a feature**:
1. Add UI elements (HTML)
2. Add styles (CSS in `<style>`)
3. Add method to `app` object
4. Wire up event handlers

**Fixing bugs**:
1. Locate the method in `app` object
2. Add console.log() for debugging
3. Fix the logic
4. Test in browser

**Changing styles**:
1. Modify CSS variables for theme changes
2. Add new classes for new components
3. Use existing classes when possible

### Security Considerations

⚠️ **Important**: This application runs entirely in the browser with no backend:

1. **No authentication** - Anyone with file access can use it
2. **LocalStorage limits** - ~5-10MB total storage
3. **No server-side validation** - All validation client-side
4. **XSS via Markdown** - Marked.js should sanitize, but be careful with user input
5. **No file encryption** - All data stored in plain text

### Performance Notes

- **Large files** may slow down preview rendering
- **Complex Mermaid diagrams** can be slow to render
- **PDF export** is CPU-intensive (uses html2canvas)
- **Mindmap** performance degrades with >100 nodes

## Common Tasks

### Changing Default Theme
Edit line 694:
```javascript
settings: {
    theme: 'dark',  // Change to: 'light', 'dracula', 'nord', 'monokai'
    // ...
}
```

### Changing App Name
Edit line 698:
```javascript
settings: {
    // ...
    appName: 'ITIL 4 Editor',  // Change to your name
}
```

### Adding a Keyboard Shortcut
Add to event listener at line 1285:
```javascript
document.addEventListener('keydown', e => {
    // ... existing shortcuts
    if ((e.ctrlKey||e.metaKey) && e.key==='x') {
        e.preventDefault();
        app.yourFunction();
    }
});
```

### Modifying Default Welcome Content
Edit lines 724-745 in `init()` method:
```javascript
this.files['welcome.md'] = {
    name: 'welcome.md',
    content: `# Your custom welcome message...`,
    modified: Date.now()
};
```

## Troubleshooting

### Preview Not Updating
- Check `updatePreview()` method (line 1066)
- Verify marked.js is loaded: `typeof marked` in console
- Check for JavaScript errors in console

### Presentation Mode Not Working
- Ensure `---` separators in markdown
- Check reveal.js loaded: `typeof Reveal` in console
- Verify `initReveal()` returns true

### PDF Export Failing
- Check html2canvas loaded: `typeof html2canvas`
- Check jsPDF loaded: `typeof jspdf`
- Look for canvas rendering errors in console

### Mindmap Not Rendering
- Wait ~1 second after page load (autoloader delay)
- Check `window.markmap` exists
- Verify markdown has heading structure

### LocalStorage Full
- Check storage: `localStorage.length` in console
- Clear old files or reduce content size
- LocalStorage limit: ~5MB per domain

## Git Workflow

Current branch: `claude/claude-md-mi4bibsgbfp4zd3r-0188DDvU1Dm7w4QQcoZNzxUg`

### Making Changes

```bash
# 1. Make changes to index.html or add new files
# 2. Test in browser
# 3. Stage changes
git add index.html CLAUDE.md

# 4. Commit with clear message
git commit -m "Add: feature description"

# 5. Push to feature branch
git push -u origin claude/claude-md-mi4bibsgbfp4zd3r-0188DDvU1Dm7w4QQcoZNzxUg
```

### Commit Message Conventions

- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Enhancements to existing features
- `Refactor:` - Code reorganization
- `Docs:` - Documentation changes
- `Style:` - CSS/visual changes

## Quick Reference

### File Locations
- Main application: `/home/user/mdnotes/index.html`
- This documentation: `/home/user/mdnotes/CLAUDE.md`

### Key Line Numbers
- CSS Variables: 19-28
- Theme System: 702-708
- App Init: 717-764
- File Management: 869-965
- Preview Rendering: 1066-1076
- Presentation Mode: 1142-1194
- Export Functions: 971-1064

### Important Methods
```javascript
app.init()              // Initialize app
app.render()            // Render file list
app.updatePreview()     // Update markdown preview
app.save()              // Save current file
app.toggleView(name)    // Toggle view visibility
app.setTheme(name)      // Change theme
app.exportAs(format)    // Export file
```

## Additional Resources

- Markdown Guide: https://www.markdownguide.org/
- Reveal.js Docs: https://revealjs.com/
- Mermaid Docs: https://mermaid.js.org/
- Marked.js Docs: https://marked.js.org/

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Maintainer**: AI Assistant Documentation
