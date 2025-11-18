const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('👀 Watching for file changes...\n');

const srcDir = path.join(__dirname, '..', 'src');

let timeout;
const rebuild = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        console.log('\n🔄 Changes detected, rebuilding...');
        exec('node build/build.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Build error: ${error}`);
                return;
            }
            console.log(stdout);
            if (stderr) console.error(stderr);
        });
    }, 500);
};

// Watch src directory recursively
fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
        console.log(`📝 Changed: ${filename}`);
        rebuild();
    }
});

console.log('✨ Watching src/ directory for changes...');
console.log('   Press Ctrl+C to stop\n');

// Initial build
rebuild();
