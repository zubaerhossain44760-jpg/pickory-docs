const fs = require('fs');
const path = require('path');

const HTML_PARTS = [
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

const CSS_PARTS = [
  'src/styles/01-tokens.css',
  'src/styles/02-base.css',
  'src/styles/03-sidebar-left.css',
  'src/styles/04-content.css',
  'src/styles/05-components.css',
  'src/styles/06-sidebar-right.css',
  'src/styles/07-responsive.css'
];

function buildHtml() {
  const startTime = Date.now();
  const buffers = HTML_PARTS.map((file) => {
    const fullPath = path.resolve(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing HTML partial: ${file}`);
    }
    return fs.readFileSync(fullPath, 'utf8').trimEnd();
  });

  const output = buffers.join('\n\n') + '\n';
  const outputPath = path.resolve(__dirname, 'index.html');
  fs.writeFileSync(outputPath, output, 'utf8');

  const duration = Date.now() - startTime;
  const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
  console.log(`[build] index.html compiled (${sizeKb} KB) in ${duration}ms`);
}

function buildCss() {
  const startTime = Date.now();
  const buffers = CSS_PARTS.map((file) => {
    const fullPath = path.resolve(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing CSS partial: ${file}`);
    }
    return fs.readFileSync(fullPath, 'utf8').trimEnd();
  });

  const output = buffers.join('\n\n') + '\n';
  const outputPath = path.resolve(__dirname, 'styles.css');
  fs.writeFileSync(outputPath, output, 'utf8');

  const duration = Date.now() - startTime;
  const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
  console.log(`[build] styles.css compiled (${sizeKb} KB) in ${duration}ms`);
}

function buildAll(target) {
  try {
    if (!target || target === 'html') buildHtml();
    if (!target || target === 'css') buildCss();
  } catch (err) {
    console.error(`[build error]`, err.message);
  }
}

// Check arguments
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

buildAll();

if (isWatch) {
  console.log('[build] Watching src/ for HTML and CSS changes... (Press Ctrl+C to stop)');
  let debounceTimeout = null;
  fs.watch(path.resolve(__dirname, 'src'), { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const isHtml = filename.endsWith('.html');
    const isCss = filename.endsWith('.css');
    if (isHtml || isCss) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        console.log(`[build] Detected change in ${filename}, rebuilding...`);
        if (isHtml) buildAll('html');
        if (isCss) buildAll('css');
      }, 60);
    }
  });
}
