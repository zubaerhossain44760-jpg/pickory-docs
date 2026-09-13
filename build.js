const fs = require('fs');
const path = require('path');

const PARTS = [
  'src/layout/head.html',
  'src/layout/sidebar-left.html',
  'src/layout/main-start.html',
  'src/sections/00-overview.html',
  'src/sections/01-core-architecture.html',
  'src/sections/02-client-reactive-engine.html',
  'src/sections/03-code-implementation.html',
  'src/sections/04-ssr-query-engine.html',
  'src/sections/05-database-indexing-storage.html',
  'src/sections/06-rest-api-lifecycle.html',
  'src/sections/07-admin-security-extensibility.html',
  'src/layout/main-end.html',
  'src/layout/sidebar-right.html',
  'src/layout/footer.html'
];

function build() {
  const startTime = Date.now();
  try {
    const buffers = PARTS.map((file) => {
      const fullPath = path.resolve(__dirname, file);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Missing partial: ${file}`);
      }
      return fs.readFileSync(fullPath, 'utf8').trimEnd();
    });

    const output = buffers.join('\n\n') + '\n';
    const outputPath = path.resolve(__dirname, 'index.html');
    fs.writeFileSync(outputPath, output, 'utf8');

    const duration = Date.now() - startTime;
    const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
    console.log(`[build] index.html successfully compiled (${sizeKb} KB) in ${duration}ms`);
  } catch (err) {
    console.error(`[build error]`, err.message);
  }
}

// Check arguments
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

build();

if (isWatch) {
  console.log('[build] Watching src/ for changes... (Press Ctrl+C to stop)');
  let debounceTimeout = null;
  fs.watch(path.resolve(__dirname, 'src'), { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        console.log(`[build] Detected change in ${filename}, rebuilding...`);
        build();
      }, 60);
    }
  });
}
