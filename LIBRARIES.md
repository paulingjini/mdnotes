# External Libraries Management

MDNotes Pro uses several external libraries for its functionality. By default, these are loaded from CDN for optimal single-file distribution. However, you can download and vendor them locally for offline use or production deployments.

## Quick Start

### Download Libraries Locally

```bash
npm run download-libs
```

This will download all required libraries into the `libs/` directory (~5-10 MB total).

## Libraries Used

### Core Dependencies

| Library | Version | Purpose | Size |
|---------|---------|---------|------|
| marked.js | latest | Markdown parsing | ~50 KB |
| CodeMirror | 5.65.16 | Code editor | ~800 KB |
| Reveal.js | 4.6.1 | Presentations | ~500 KB |
| d3.js | 7 | Visualization | ~250 KB |
| markmap | 0.15.4 | Mindmap rendering | ~150 KB |
| mermaid.js | 10.9.1 | Diagram rendering | ~1.5 MB |
| Chart.js | 4.4.0 | Charts | ~200 KB |

### Export Libraries

| Library | Version | Purpose | Size |
|---------|---------|---------|------|
| jsPDF | 2.5.1 | PDF generation | ~800 KB |
| html2canvas | 1.4.1 | Screenshot rendering | ~150 KB |
| pptxgenjs | 3.12.0 | PowerPoint export | ~350 KB |
| docx.js | 8.5.0 | Word export | ~1 MB |

### Syntax Highlighting

| Library | Version | Purpose | Size |
|---------|---------|---------|------|
| highlight.js | 11.9.0 | Code highlighting | ~500 KB |
| marked-highlight | latest | Integration | ~10 KB |
| marked-gfm-heading-id | latest | GFM support | ~5 KB |

## Directory Structure

After running `npm run download-libs`:

```
libs/
├── js/
│   ├── marked.min.js
│   ├── d3.min.js
│   ├── markmap-view.min.js
│   ├── markmap-lib.min.js
│   ├── reveal.js
│   ├── reveal-markdown.js
│   ├── html2canvas.min.js
│   ├── jspdf.umd.min.js
│   ├── marked-gfm-heading-id.umd.min.js
│   ├── marked-highlight.umd.min.js
│   ├── highlight.min.js
│   ├── mermaid.min.js
│   ├── chart.umd.min.js
│   ├── pptxgen.bundle.js
│   ├── docx.js
│   ├── codemirror.min.js
│   ├── codemirror-markdown.min.js
│   ├── codemirror-closebrackets.min.js
│   ├── codemirror-active-line.min.js
│   ├── codemirror-match-highlighter.min.js
│   └── codemirror-annotatescrollbar.min.js
├── css/
│   ├── reveal.css
│   ├── reveal-black.css
│   ├── highlight-github-dark.min.css
│   ├── codemirror.min.css
│   ├── codemirror-material-darker.min.css
│   └── codemirror-dracula.min.css
└── README.md
```

## CDN vs Local Libraries

### CDN (Default)

**Pros:**
- Smaller file size (~191 KB for dist/index.html)
- Faster initial page load (browser caching)
- Automatic updates from CDN
- No setup required

**Cons:**
- Requires internet connection
- Dependent on CDN availability
- Privacy concerns (external requests)
- Potential version changes

### Local (Vendored)

**Pros:**
- Works completely offline
- Full control over versions
- No external dependencies
- Better privacy
- Production-ready

**Cons:**
- Larger download size (~6-8 MB total)
- Need to manually update libraries
- Requires build step
- More complex deployment

## Using Local Libraries

### Option 1: Build with Local Libraries (Future Feature)

```bash
npm run build -- --use-local-libs
```

This will modify the build to use local libraries instead of CDN.

### Option 2: Manual Configuration

1. Download libraries: `npm run download-libs`
2. Modify `src/html/template.html` to point to local paths
3. Serve from a web server (cannot use file:// protocol)
4. Build: `npm run build`

## Updating Libraries

### Update All Libraries

```bash
npm run download-libs
```

### Update Specific Library

Edit `build/download-libs.js` and change the version in the URL:

```javascript
{
    url: 'https://cdn.jsdelivr.net/npm/marked@NEW_VERSION/marked.min.js',
    dest: 'js/marked.min.js'
}
```

Then run: `npm run download-libs`

## Production Deployment

For production deployments, we recommend:

1. **Use local libraries** for reliability and offline support
2. **Minify and compress** all assets
3. **Enable HTTPS** for security
4. **Set up proper caching** headers
5. **Use a CDN** for your deployment (not for dependencies)

## Troubleshooting

### Download Fails

If downloads fail:
1. Check internet connection
2. Verify CDN URLs are accessible
3. Check for firewall/proxy issues
4. Try downloading individual libraries manually

### Library Conflicts

If you experience conflicts:
1. Clear browser cache
2. Ensure all libraries are from compatible versions
3. Check browser console for errors
4. Verify library load order in template.html

### Size Concerns

If local libraries are too large:
1. Use CDN for development
2. Use local for production only
3. Consider removing unused libraries
4. Implement code splitting (future feature)

## License Information

Each library has its own license:

- **marked.js** - MIT
- **CodeMirror** - MIT
- **Reveal.js** - MIT
- **d3.js** - ISC
- **markmap** - MIT
- **mermaid.js** - MIT
- **Chart.js** - MIT
- **jsPDF** - MIT
- **html2canvas** - MIT
- **pptxgenjs** - MIT
- **docx.js** - MIT
- **highlight.js** - BSD-3-Clause

Please review individual library licenses before distribution.

## Support

For issues with external libraries:
- Check the library's official documentation
- Report issues to the library's repository
- For MDNotes-specific integration issues, open an issue on our repository

---

**Last Updated**: 2025-11-19
**MDNotes Version**: 2.1.0
