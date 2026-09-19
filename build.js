const fs = require('fs');
const path = require('path');

const CSS_PARTS = [
  'src/styles/01-tokens.css',
  'src/styles/header.css',
  'src/styles/base.css',
  'src/styles/components/sidebar.css',
  'src/styles/components/button.css',
  'src/styles/documentation/04-content.css',
  'src/styles/components.css',
  'src/styles/pages/home.css',
  'src/styles/pages/support.css',
  'src/styles/pages/product.css',
  'src/styles/pages/changelog.css'
];

const PAGES = {
  'index.html': [
    'src/layout/head.html',
    'src/layout/header.html',
    'src/pages/home/01-hero.html',
    'src/pages/home/02-products.html',
    'src/pages/home/03-ecosystem.html',
    'src/layout/footer.html'
  ],
  'product-filter.html': [
    'src/layout/head.html',
    'src/layout/header.html',
    'src/pages/product-filter/product-filter.html',
    'src/layout/footer.html'
  ],
  'theme.html': [
    'src/layout/head.html',
    'src/layout/header.html',
    'src/pages/theme/theme.html',
    'src/layout/footer.html'
  ],
  'product-filter-changelog.html': [
    'src/layout/head.html',
    'src/layout/header.html',
    'src/pages/product-filter/changelog/product-filter-changelog.html',
    'src/layout/footer.html'
  ],
  'theme-changelog.html': [
    'src/layout/head.html',
    'src/layout/header.html',
    'src/pages/theme/changelog/theme-changelog.html',
    'src/layout/footer.html'
  ],
  'product-filter-docs.html': [
    'src/layout/head.html',
    'src/layout/documentation/doc-start.html',
    'src/pages/product-filter/documentation/sidebar-left.html',
    'src/layout/documentation/main-start.html',
    'src/pages/product-filter/documentation/00-overview.html',
    'src/pages/product-filter/documentation/01-core-architecture.html',
    'src/pages/product-filter/documentation/02-client-reactive-engine.html',
    'src/pages/product-filter/documentation/03-code-implementation.html',
    'src/pages/product-filter/documentation/04-ssr-query-engine.html',
    'src/pages/product-filter/documentation/05-database-indexing-storage.html',
    'src/pages/product-filter/documentation/06-rest-api-lifecycle.html',
    'src/pages/product-filter/documentation/07-admin-security-extensibility.html',
    'src/layout/documentation/main-end.html',
    'src/pages/product-filter/documentation/sidebar-right.html',
    'src/layout/documentation/doc-end.html',
    'src/layout/documentation/footer.html'
  ],
  'theme-docs.html': [
    'src/layout/head.html',
    'src/layout/documentation/doc-start.html',
    'src/pages/theme/documentation/sidebar-left.html',
    'src/layout/documentation/main-start.html',
    'src/pages/theme/documentation/01-overview.html',
    'src/pages/theme/documentation/02-architecture-hierarchy.html',
    'src/pages/theme/documentation/03-styling-tokens.html',
    'src/pages/theme/documentation/04-hooks-extensibility.html',
    'src/layout/documentation/main-end.html',
    'src/pages/theme/documentation/sidebar-right.html',
    'src/layout/documentation/doc-end.html',
    'src/layout/documentation/footer.html'
  ],
  'support.html': [
    'src/layout/head.html',
    'src/layout/header.html',
    'src/pages/support/support.html',
    'src/layout/footer.html'
  ]
};

function readPartial(relPath) {
  const fullPath = path.resolve(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing partial file: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8').trimEnd();
}

function buildHtml() {
  const totalStartTime = Date.now();
  let compiledCount = 0;

  for (const [outputFile, partials] of Object.entries(PAGES)) {
    const pageStartTime = Date.now();
    const buffers = partials.map((file) => readPartial(file));
    const fullPageContent = buffers.join('\n\n') + '\n';

    const outputPath = path.resolve(__dirname, outputFile);
    fs.writeFileSync(outputPath, fullPageContent, 'utf8');

    const duration = Date.now() - pageStartTime;
    const sizeKb = (Buffer.byteLength(fullPageContent, 'utf8') / 1024).toFixed(1);
    console.log(`[build:html] ${outputFile.padEnd(20)} (${sizeKb.padStart(6)} KB) in ${duration}ms`);
    compiledCount++;
  }

  const totalDuration = Date.now() - totalStartTime;
  console.log(`[build:html] Compiled ${compiledCount} pages successfully in ${totalDuration}ms`);
}

function buildCss() {
  const startTime = Date.now();
  const buffers = CSS_PARTS.map((file) => readPartial(file));

  const output = buffers.join('\n\n') + '\n';
  const outputPath = path.resolve(__dirname, 'styles.css');
  fs.writeFileSync(outputPath, output, 'utf8');

  const duration = Date.now() - startTime;
  const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
  console.log(`[build:css]  styles.css           (${sizeKb.padStart(6)} KB) in ${duration}ms`);
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
