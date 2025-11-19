# Changelog

All notable changes to MDNotes Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-11-19

### Added

#### Hierarchical File Management
- Notion-like file system with folders and nested structure
- Tag system with auto-generated colors
- Favorites and archive functionality
- Advanced search and filter by folder/tag/status
- Drag & drop support for file organization
- File metadata (created, modified, folder, tags)
- Automatic migration from v1.x file format

#### Bidirectional Editing
- Click on preview elements to jump to source line in editor
- Automatic line number tracking with fuzzy matching
- Visual feedback with cursor styles and hover effects
- Temporary editor line highlighting with fade animation
- Integration with sync system for seamless navigation

#### Mindmap Enhancements
- Active node focus with highlighting
- Animated pulse effect on focused nodes
- Toggle-able focus feature (on/off)
- Smooth panning to center focused node
- Node indexing system for efficient lookups
- Integration with cursor position tracking

#### Interactive Tables
- Sort by column (ascending/descending/none)
- Real-time filter with search
- Export to CSV format
- Dynamic row counter
- Toolbar with filter input and export button
- Visual feedback on hover

#### Enhanced Task Lists
- Interactive checkboxes in preview
- Progress bars with percentage
- Task completion tracking
- Strikethrough styling for completed tasks
- Visual feedback animations
- Statistics (total/completed/pending)

#### Timeline Visualization
- Timesheet.js integration for visual timelines
- JSON-based configuration format
- Automatic year-based scaling
- Color-coded sections (6 color palette)
- Interactive hover states
- Multi-row timeline support
- Responsive bar positioning

#### Library Management
- Download script for all external libraries (~27 libraries)
- Local vendoring support for offline usage
- npm script: `npm run download-libs`
- Comprehensive documentation (LIBRARIES.md)
- Version pinning for stability

#### Synchronization
- Bi-directional scroll sync (editor ↔ preview)
- Cursor position tracking across panels
- Section highlighting in preview
- Sync toggle control
- scrollToHeading functionality

#### Presentation Templates
- JSON-based template system
- 4 professional templates (corporate, modern, academic, startup)
- Full customization (colors, fonts, logo, footer)
- Logo positioning (4 corners)
- Dynamic CSS injection
- Template import/export

#### Advanced Export
- Programmatic PDF generation (jsPDF)
- DOCX (Word) export with docx.js 8.5.0
- Enhanced PPTX with template support
- Markdown token-based export (no DOM rendering)

### Changed
- File manager width increased from 200px to 250px
- Build output increased from ~60KB to 199.39 KB (with all features)
- Updated package.json to v2.1.0
- Improved CSS organization with new component styles

### Fixed
- Mermaid diagrams rendering on first load
- CodeMirror theme synchronization
- Export menu closing on mobile
- Line number tracking in preview

### Documentation
- Added LIBRARIES.md (library management guide)
- Added DEPLOYMENT.md (production deployment guide)
- Added CHANGELOG.md (this file)
- Updated README.md with v2.1.0 features
- Updated TODO.md with completed features
- Updated CLAUDE.md with v2.1.0 architecture

## [2.0.0] - 2025-11-18

### Added

#### Modular Architecture
- Complete codebase restructuring (src/css, src/js, src/html)
- ES6 modules with import/export
- Node.js build system (build.js, watch.js)
- Single-file output (dist/index.html)
- Source map support

#### Core Modules
- Storage module (localStorage operations)
- Theme module (5 themes: dark, light, dracula, nord, monokai)
- File manager module (multi-file support)
- Editor module (CodeMirror integration)
- Preview module (markdown rendering)
- Mindmap module (markmap visualization)
- Presentation module (Reveal.js integration)
- Export manager module (multi-format export)

#### Extensions
- Charts extension (Chart.js integration)
- Timeline extension (Mermaid gantt/timeline)

#### Editor Features
- CodeMirror with markdown mode
- Syntax highlighting
- Line numbers and active line highlighting
- Auto-close brackets
- Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
- Markdown toolbar
- Auto-save functionality
- Fullscreen mode

#### Preview Features
- Live markdown rendering with marked.js
- GFM (GitHub Flavored Markdown) support
- Syntax highlighting (highlight.js)
- Mermaid diagram rendering
- Chart.js visualization
- Fullscreen preview mode

#### Presentation Features
- Reveal.js integration with 10+ themes
- Slide separators (`---`)
- YAML frontmatter support
- Auto-fitting content in slides
- Fullscreen presentation mode
- PDF slides export
- PowerPoint (.pptx) export

#### Mindmap Features
- Markmap integration
- Auto-generation from markdown headings
- Interactive pan/zoom
- Fullscreen mindmap mode
- SVG export
- PNG export

#### File Management
- Multi-file support with localStorage
- Create/delete/rename files
- Load external markdown files
- File switching
- Auto-save on content change

#### Themes
- 5 professional themes
- CSS variables system
- Theme switching
- Dark/light mode support
- Custom color schemes

#### Diagrams & Visualizations
- Mermaid flowcharts
- Sequence diagrams
- Gantt charts
- Timeline diagrams
- Journey maps
- Chart.js charts (bar, line, pie, doughnut)

#### UI/UX
- Responsive layout
- Toolbar customization (icon-only, icon-text, text-only)
- Modal dialogs (settings, help, templates)
- Loading spinner
- Status bar with statistics
- Dropdown menus
- Icon sprite system

#### Export Formats
- Markdown (.md)
- HTML (standalone)
- PDF (preview and slides)
- PowerPoint (.pptx)

### Changed
- Migrated from single-file to modular architecture
- Improved code organization and maintainability
- Enhanced performance with module splitting

### Documentation
- Created comprehensive README.md
- Created TODO.md with roadmap
- Created CLAUDE.md for AI assistants
- Added inline code documentation

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Basic markdown editor
- Live preview
- Simple file management
- Local storage persistence
- Basic export (markdown, HTML)

---

## Version Support

| Version | Status | Support Until |
|---------|--------|---------------|
| 2.1.x   | Active | Current       |
| 2.0.x   | Active | 2025-12-31    |
| 1.x     | Legacy | 2025-06-30    |

## Upgrade Guide

### From 2.0.x to 2.1.0
- No breaking changes
- All features are backward compatible
- Files from v2.0.0 automatically migrate to new format
- Recommended: Clear browser cache after update

### From 1.x to 2.x
- Major architectural changes
- Manual migration required for custom modifications
- localStorage structure changed (automatic migration included)
- Some API changes in modules

## Contributors

- MDNotes Team
- Community contributors (see GitHub)

## Links

- [Repository](https://github.com/paulingjini/mdnotes)
- [Documentation](README.md)
- [Issues](https://github.com/paulingjini/mdnotes/issues)
- [Releases](https://github.com/paulingjini/mdnotes/releases)

---

**Format**: Keep a Changelog v1.0.0
**Last Updated**: 2025-11-19
