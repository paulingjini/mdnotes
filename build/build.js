const fs = require('fs');
const path = require('path');

console.log('🚀 Building MDNotes Pro...\n');

// Paths
const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');
const templatePath = path.join(srcDir, 'html', 'template.html');
const distPath = path.join(distDir, 'index.html');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Read template
console.log('📄 Reading template...');
let html = fs.readFileSync(templatePath, 'utf8');

// Read and combine CSS
console.log('🎨 Processing CSS...');
const cssFiles = [
    'design-system.css',
    'variables.css',
    'base.css',
    'shadcn.css',
    'layout-v2.css',
    'components.css',
    'modals.css',
    'blocks.css',
    'animations.css'
];

let css = '';
cssFiles.forEach(file => {
    const filePath = path.join(srcDir, 'css', file);
    if (fs.existsSync(filePath)) {
        css += fs.readFileSync(filePath, 'utf8') + '\n\n';
        console.log(`   ✓ ${file}`);
    } else {
        console.warn(`   ⚠ ${file} not found`);
    }
});

// Read and combine JavaScript modules
console.log('📦 Processing JavaScript modules...');
const jsModules = [
    'modules/storage.js',
    'modules/theme.js',
    'modules/layout-manager.js',
    'modules/file-manager.js',
    'modules/file-system-advanced.js',
    'modules/blocks-db.js',
    'modules/block.js',
    'modules/block-editor.js',
    'modules/editor.js',
    'modules/preview.js',
    'modules/mindmap.js',
    'modules/presentation.js',
    'modules/presentation-templates.js',
    'modules/export.js',
    'modules/export-advanced.js',
    'modules/sync.js',
    'extensions/charts.js',
    'extensions/timeline.js',
    'extensions/interactive-tables.js',
    'extensions/task-lists.js',
    'app.js'
];

let js = '';
jsModules.forEach(file => {
    const filePath = path.join(srcDir, 'js', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove export/import statements for inline bundling
        content = content.replace(/^export\s+(default\s+)?/gm, '');
        content = content.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '');

        js += content + '\n\n';
        console.log(`   ✓ ${file}`);
    } else {
        console.warn(`   ⚠ ${file} not found`);
    }
});

// Read modals HTML
console.log('🪟  Processing modals...');
const modalsPath = path.join(srcDir, 'html', 'modals.html');
let modals = '';
if (fs.existsSync(modalsPath)) {
    modals = fs.readFileSync(modalsPath, 'utf8');
    console.log('   ✓ modals.html');
}

// Read icons SVG
console.log('🎨 Processing icons...');
const iconsPath = path.join(srcDir, 'html', 'icons.html');
let icons = '';
if (fs.existsSync(iconsPath)) {
    icons = fs.readFileSync(iconsPath, 'utf8');
    console.log('   ✓ icons.html');
}

// Replace placeholders
console.log('🔧 Assembling final HTML...');
html = html.replace('/* BUILD_CSS_PLACEHOLDER */', css);
html = html.replace('/* BUILD_JS_PLACEHOLDER */', js);
html = html.replace('<!-- BUILD_MODALS_PLACEHOLDER -->', modals);
html = html.replace('<!-- BUILD_ICONS_PLACEHOLDER -->', icons);

// Write output
fs.writeFileSync(distPath, html, 'utf8');

// Calculate file size
const stats = fs.statSync(distPath);
const fileSizeKB = (stats.size / 1024).toFixed(2);

console.log('\n✅ Build complete!');
console.log(`📦 Output: ${distPath}`);
console.log(`📏 Size: ${fileSizeKB} KB`);
console.log('\n💡 Tip: Open dist/index.html in your browser to test');
