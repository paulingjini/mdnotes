const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

console.log('📦 Downloading external libraries...\n');

// Create libs directory
const libsDir = path.join(__dirname, '..', 'libs');
if (!fs.existsSync(libsDir)) {
    fs.mkdirSync(libsDir, { recursive: true });
}

// Library definitions
const libraries = [
    // JavaScript libraries
    { url: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js', dest: 'js/marked.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js', dest: 'js/d3.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/markmap-view@0.15.4/dist/index.min.js', dest: 'js/markmap-view.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/markmap-lib@0.15.4/dist/browser/index.min.js', dest: 'js/markmap-lib.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.js', dest: 'js/reveal.js' },
    { url: 'https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/plugin/markdown/markdown.js', dest: 'js/reveal-markdown.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', dest: 'js/html2canvas.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', dest: 'js/jspdf.umd.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/marked-gfm-heading-id/lib/index.umd.min.js', dest: 'js/marked-gfm-heading-id.umd.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/marked-highlight/lib/index.umd.min.js', dest: 'js/marked-highlight.umd.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js', dest: 'js/highlight.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js', dest: 'js/mermaid.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', dest: 'js/chart.umd.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', dest: 'js/pptxgen.bundle.js' },
    { url: 'https://unpkg.com/docx@8.5.0/build/index.js', dest: 'js/docx.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js', dest: 'js/codemirror.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/markdown/markdown.min.js', dest: 'js/codemirror-markdown.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js', dest: 'js/codemirror-closebrackets.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/selection/active-line.min.js', dest: 'js/codemirror-active-line.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/search/match-highlighter.min.js', dest: 'js/codemirror-match-highlighter.min.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/scroll/annotatescrollbar.min.js', dest: 'js/codemirror-annotatescrollbar.min.js' },

    // CSS libraries
    { url: 'https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.css', dest: 'css/reveal.css' },
    { url: 'https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/theme/black.css', dest: 'css/reveal-black.css' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css', dest: 'css/highlight-github-dark.min.css' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css', dest: 'css/codemirror.min.css' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material-darker.min.css', dest: 'css/codemirror-material-darker.min.css' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css', dest: 'css/codemirror-dracula.min.css' },
];

/**
 * Download a file from URL
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const fullPath = path.join(libsDir, destPath);
        const dir = path.dirname(fullPath);

        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const file = fs.createWriteStream(fullPath);

        protocol.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                file.close();
                downloadFile(response.headers.location, destPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(fullPath);
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });

            file.on('error', (err) => {
                fs.unlinkSync(fullPath);
                reject(err);
            });
        }).on('error', (err) => {
            file.close();
            fs.unlinkSync(fullPath);
            reject(err);
        });
    });
}

/**
 * Download all libraries
 */
async function downloadAll() {
    let success = 0;
    let failed = 0;

    for (const lib of libraries) {
        try {
            console.log(`⬇️  Downloading ${lib.dest}...`);
            await downloadFile(lib.url, lib.dest);
            console.log(`   ✓ ${lib.dest}`);
            success++;
        } catch (error) {
            console.error(`   ✗ Failed: ${lib.dest}`);
            console.error(`     Error: ${error.message}`);
            failed++;
        }
    }

    console.log(`\n✅ Download complete!`);
    console.log(`   Success: ${success}/${libraries.length}`);
    if (failed > 0) {
        console.log(`   Failed: ${failed}/${libraries.length}`);
    }

    // Create README
    const readmePath = path.join(libsDir, 'README.md');
    const readmeContent = `# External Libraries

This directory contains vendored external libraries to eliminate CDN dependencies.

## Libraries Included

### JavaScript
- **marked.js** - Markdown parser
- **d3.js** - Data visualization
- **markmap** - Mindmap visualization
- **reveal.js** - Presentation framework
- **html2canvas** - Screenshot rendering
- **jsPDF** - PDF generation
- **marked extensions** - GFM heading IDs, syntax highlighting
- **highlight.js** - Code syntax highlighting
- **mermaid.js** - Diagram rendering
- **chart.js** - Chart visualization
- **pptxgenjs** - PowerPoint generation
- **docx.js** - Word document generation
- **CodeMirror** - Code editor

### CSS
- **reveal.js** - Presentation styles
- **highlight.js** - Code highlighting styles
- **CodeMirror** - Editor styles

## Version Information

All libraries are pinned to specific versions for stability:
- marked: latest
- d3: v7
- markmap: v0.15.4
- reveal.js: v4.6.1
- html2canvas: v1.4.1
- jsPDF: v2.5.1
- highlight.js: v11.9.0
- mermaid: v10.9.1
- chart.js: v4.4.0
- pptxgenjs: v3.12.0
- docx: v8.5.0
- CodeMirror: v5.65.16

## Usage

These libraries are automatically included in the build process and bundled into dist/index.html.

## Updating

To update libraries, modify the URLs in build/download-libs.js and run:
\`\`\`bash
npm run download-libs
\`\`\`

## License

Each library maintains its own license. See individual library repositories for details.
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`\n📝 Created ${readmePath}`);
}

// Run download
downloadAll().catch(console.error);
