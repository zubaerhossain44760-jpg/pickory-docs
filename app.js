/**
 * ============================================================================
 * Pickory Product Filter - Interactive Developer Documentation Engine
 * File: app.js
 * Architecture: Event-Delegated, Zero-Dependency, Pure Vanilla Web APIs (ES6+)
 * Performance: rAF-Gated Layout Engine, Inertial Scroll Guards, High-DPI Observer
 * Accessibility: WCAG 2.2 AA / WAI-ARIA Compliant State Machine & Tab Engines
 * ============================================================================
 */

(function initPickoryDocRuntime() {
  'use strict';

  /* ==========================================================================
     1. COMPONENT 1: REACTIVE STATE MACHINE VISUALIZER
     Interactive SVG State Machine with Accessible Micro-Card Inspection
     ========================================================================== */

  const STATE_MACHINE_NODES = {
    'user-interaction': {
      title: 'User Interaction',
      badge: 'INPUT LAYER',
      filePath: 'src/frontend/components/filter-group.js',
      role: 'Synchronous Event Capture & Debounce',
      invariant: 'UI events (dual-thumb slider drag, checkbox toggle, swatch selection) are captured synchronously and debounced at 300ms for continuous sliders. Presentation components are strictly decoupled from network dispatchers and never initiate direct fetch operations.'
    },
    'url-params': {
      title: 'URL SearchParams',
      badge: 'STATE SOURCE',
      filePath: 'src/frontend/modules/url.js',
      role: 'Deterministic Query Serialization',
      invariant: 'The browser URL search query parameters serve as the Single Source of Truth (SSOT). All filter mutations serialize into deterministic key-value pairs via window.history.pushState() or replaceState(), ensuring 100% shareable and bookmarkable filtered views.'
    },
    'url-change-event': {
      title: 'ppfx:url-change Event',
      badge: 'EVENT BUS',
      filePath: 'src/frontend/events.js',
      role: 'Synthetic Event Broadcast & Decoupling',
      invariant: 'A custom synthetic window event [ppfx:url-change] is dispatched with payload { detail: { params, source } }. This decouples UI widgets from backend dispatchers and automatically normalizes browser popstate (back/forward button) navigation.'
    },
    'coordinator': {
      title: 'Primary Coordinator',
      badge: 'ORCHESTRATOR',
      filePath: 'src/frontend/coordinator.js',
      role: 'Instance Coordination & Mutex Control',
      invariant: 'Coordinates concurrent filter widgets (desktop sidebar + mobile drawer) without redundant network requests. Enforces an AbortController mutex: any in-flight fetch is immediately aborted before a new query is dispatched, preventing out-of-order race conditions.'
    },
    'rest-engine': {
      title: 'REST Engine',
      badge: 'SQL RESOLUTION',
      filePath: 'includes/api/class-pickory-rest-controller.php',
      role: 'Cache-First Nonce-Verified SQL Query',
      invariant: 'Dispatches GET request to [/wp-json/pickory/v1/products] with strict nonce verification and IP rate limiting (80 req/min). Returns cached transient payload if available or executes composite index lookup on the denormalized [wp_pickory_product_index] table.'
    }
  };

  function setupStateMachine() {
    const container = document.getElementById('state-machine-container');
    const microCard = document.getElementById('state-inspector-card');
    if (!container || !microCard) return;

    const microTitle = microCard.querySelector('.ui-card-title');
    const microBadge = microCard.querySelector('.ui-badge');
    const microPath = microCard.querySelector('.ui-card-filepath');
    const microRole = microCard.querySelector('.ui-card-role');
    const microInvariant = microCard.querySelector('.ui-card-invariant');
    const allNodes = Array.from(container.querySelectorAll('.flow-node'));

    // Inject accessible button semantics into SVG group nodes
    allNodes.forEach((node) => {
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-pressed', 'false');
    });

    function activateNode(nodeId) {
      const nodeData = STATE_MACHINE_NODES[nodeId];
      if (!nodeData) return;

      allNodes.forEach((node) => {
        const isActive = node.getAttribute('data-node-id') === nodeId;
        node.classList.toggle('is-active', isActive);
        node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        if (isActive) {
          node.setAttribute('aria-current', 'true');
        } else {
          node.removeAttribute('aria-current');
        }
      });

      if (microTitle) microTitle.textContent = nodeData.title;
      if (microBadge) microBadge.textContent = nodeData.badge;
      if (microPath) microPath.textContent = nodeData.filePath;
      if (microRole) microRole.textContent = nodeData.role;
      if (microInvariant) microInvariant.textContent = nodeData.invariant;
    }

    container.addEventListener('click', (event) => {
      const nodeEl = event.target.closest('.flow-node');
      if (!nodeEl) return;
      const nodeId = nodeEl.getAttribute('data-node-id');
      if (nodeId) activateNode(nodeId);
    });

    container.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        const nodeEl = event.target.closest('.flow-node');
        if (nodeEl) {
          event.preventDefault();
          const nodeId = nodeEl.getAttribute('data-node-id');
          if (nodeId) activateNode(nodeId);
        }
      }
    });

    activateNode('user-interaction');
  }

  /* ==========================================================================
     2. COMPONENT 2: MULTI-TAB CODE WINDOW (WAI-ARIA COMPLIANT)
     Keyboard Arrow Navigation, Resilient Clipboard Engine & Race Guard
     ========================================================================== */

  function setupCodeWindows() {
    const codeWindows = document.querySelectorAll('.ui-code-window');

    codeWindows.forEach((windowEl) => {
      const tabGroup = windowEl.querySelector('.code-tab-group');
      const filenameLabel = windowEl.querySelector('.code-window-filename');
      const copyBtn = windowEl.querySelector('.copy-btn');
      const tabPanes = Array.from(windowEl.querySelectorAll('.code-tab-pane'));

      if (!tabGroup) return;

      const tabButtons = Array.from(tabGroup.querySelectorAll('.code-tab-btn'));

      // Ensure proper WAI-ARIA roles
      tabGroup.setAttribute('role', 'tablist');
      tabButtons.forEach((btn, idx) => {
        btn.setAttribute('role', 'tab');
        const isInitActive = btn.classList.contains('is-active') || idx === 0;
        btn.setAttribute('aria-selected', isInitActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isInitActive ? '0' : '-1');

        const targetId = btn.getAttribute('data-target');
        if (targetId) {
          btn.setAttribute('aria-controls', targetId);
          const pane = document.getElementById(targetId);
          if (pane) {
            pane.setAttribute('role', 'tabpanel');
            pane.setAttribute('aria-labelledby', btn.id || `tab-btn-${targetId}`);
            pane.hidden = !isInitActive;
          }
        }
      });

      function switchTab(targetBtn) {
        if (!targetBtn) return;
        const targetPaneId = targetBtn.getAttribute('data-target');
        const targetFilename = targetBtn.getAttribute('data-file');

        tabButtons.forEach((btn) => {
          const isTarget = btn === targetBtn;
          btn.classList.toggle('is-active', isTarget);
          btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
          btn.setAttribute('tabindex', isTarget ? '0' : '-1');
        });

        tabPanes.forEach((pane) => {
          const isTarget = pane.id === targetPaneId;
          pane.classList.toggle('is-active', isTarget);
          pane.hidden = !isTarget;
        });

        if (filenameLabel && targetFilename) {
          filenameLabel.textContent = targetFilename;
        }

        targetBtn.focus();
      }

      tabGroup.addEventListener('click', (event) => {
        const tabBtn = event.target.closest('.code-tab-btn');
        if (tabBtn) switchTab(tabBtn);
      });

      // Keyboard arrow navigation according to WAI-ARIA Tabs pattern
      tabGroup.addEventListener('keydown', (event) => {
        const currentBtn = event.target.closest('.code-tab-btn');
        if (!currentBtn) return;

        const currentIndex = tabButtons.indexOf(currentBtn);
        let nextIndex = null;

        switch (event.key) {
          case 'ArrowRight':
            nextIndex = (currentIndex + 1) % tabButtons.length;
            break;
          case 'ArrowLeft':
            nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
            break;
          case 'Home':
            nextIndex = 0;
            break;
          case 'End':
            nextIndex = tabButtons.length - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        switchTab(tabButtons[nextIndex]);
      });

      // Memory-safe, race-free clipboard trigger
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const activePane = tabPanes.find((p) => !p.hidden) || tabPanes[0];
          const codeEl = activePane ? activePane.querySelector('code') : null;
          if (!codeEl) return;

          const codeText = codeEl.innerText || codeEl.textContent || '';
          const copyText = copyBtn.querySelector('.copy-text');
          const originalText = copyBtn._originalText || (copyText ? copyText.textContent : 'Copy Code');
          copyBtn._originalText = originalText;

          try {
            if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(codeText);
            } else {
              // Non-secure context fallback
              const textArea = document.createElement('textarea');
              textArea.value = codeText;
              textArea.style.position = 'fixed';
              textArea.style.left = '-999999px';
              textArea.style.top = '-999999px';
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              document.execCommand('copy');
              textArea.remove();
            }

            // Cancel any pending timer to avoid visual state collision
            if (copyBtn._timeoutId) clearTimeout(copyBtn._timeoutId);

            copyBtn.classList.add('is-copied');
            if (copyText) copyText.textContent = 'Copied!';

            copyBtn._timeoutId = setTimeout(() => {
              copyBtn.classList.remove('is-copied');
              if (copyText) copyText.textContent = originalText;
              copyBtn._timeoutId = null;
            }, 2000);
          } catch (err) {
            console.error('Pickory Docs: Clipboard failed', err);
            if (copyText) copyText.textContent = 'Error';
            copyBtn._timeoutId = setTimeout(() => {
              if (copyText) copyText.textContent = originalText;
            }, 2000);
          }
        });
      }
    });
  }

  /* ==========================================================================
     3. COMPONENT 3: DYNAMIC CONTEXTUAL TOC & MAIN NAV SYNCHRONIZATION
     Bidirectional Scroll-Spy with Programmatic Scroll Mutex Lock
     ========================================================================== */

  const SECTION_CONTEXT_TOPICS = {
    'core-architecture': {
      title: 'Core Architecture & System Foundation',
      topics: [
        { id: 'subtopic-1-1', label: '1.1 Plugin Anatomy & Directory Contract' },
        { id: 'subtopic-1-2', label: '1.2 Dual-Path Execution Model' },
        { id: 'subtopic-1-3', label: '1.3 ppfx_ Namespace Convention' },
        { id: 'subtopic-1-4', label: '1.4 WooCommerce Integration Surface' },
        { id: 'subtopic-1-5', label: '1.5 Data Flow: Browser → REST → DOM' },
        { id: 'subtopic-1-6', label: '1.6 Class Responsibility Map' }
      ]
    },
    'client-reactive-engine': {
      title: 'Client Reactive Engine & UI Layer',
      topics: [
        { id: 'subtopic-2-1', label: '2.1 URL as Single Source of Truth' },
        { id: 'subtopic-2-2', label: '2.2 PPFXURLStateManager & Event Bus' },
        { id: 'subtopic-2-3', label: '2.3 Parameter Translation Layer' },
        { id: 'subtopic-2-4', label: '2.4 commitFilterUpdate Write Gate' },
        { id: 'subtopic-2-5', label: '2.5 setCanonicalState Push vs. Replace' },
        { id: 'subtopic-2-6', label: '2.6 popstate & Browser History' },
        { id: 'subtopic-2-7', label: '2.7 Multi-Instance syncAllUIs' },
        { id: 'subtopic-2-8', label: '2.8 Reserved Key Partition' },
        { id: 'subtopic-2-9', label: '2.9 Auto-Filter vs. Manual Submit' },
        { id: 'subtopic-2-10', label: '2.10 Debounce & Delay Semantics' },
        { id: 'subtopic-3-1', label: '3.1 initFilterForm & Lifecycle Guard' },
        { id: 'subtopic-3-2', label: '3.2 Container Resolution Strategy' },
        { id: 'subtopic-3-3', label: '3.3 toggleMultiValue vs. setSingleValue' },
        { id: 'subtopic-3-4', label: '3.4 Native Input Handler Architecture' },
        { id: 'subtopic-3-5', label: '3.5 Non-Native Widget Handlers' },
        { id: 'subtopic-3-6', label: '3.6 Radio Uncheck Toggle Pattern' },
        { id: 'subtopic-3-7', label: '3.7 Form Serialization (Manual Mode)' },
        { id: 'subtopic-3-8', label: '3.8 applyFilterState Hydration Engine' },
        { id: 'subtopic-3-9', label: '3.9 Price Slider State & Bounds' },
        { id: 'subtopic-3-10', label: '3.10 applySortState Across Contexts' },
        { id: 'subtopic-3-11', label: '3.11 AbortController Request Cancellation' },
        { id: 'subtopic-3-12', label: '3.12 Pagination Intercept & Transitions' },
        { id: 'subtopic-3-13', label: '3.13 stopImmediatePropagation Contract' },
        { id: 'subtopic-3-14', label: '3.14 domAbortController Listener Cleanup' }
      ]
    },
    'ssr-query-engine': {
      title: 'SSR & Query Execution Engine',
      topics: [
        { id: 'subtopic-4-1', label: '4.1 PPFX_Server_Filter Scope' },
        { id: 'subtopic-4-2', label: '4.2 pre_get_posts Interception' },
        { id: 'subtopic-4-3', label: '4.3 Shop 404 & Redirect Guard' },
        { id: 'subtopic-4-4', label: '4.4 PPFX_Product_Query_Builder' },
        { id: 'subtopic-4-5', label: '4.5 PPFX_Query_Clause_Compiler' },
        { id: 'subtopic-4-6', label: '4.6 Scoped posts_clauses Hooks' },
        { id: 'subtopic-4-7', label: '4.7 SSR & Client Hash Parity' }
      ]
    },
    'database-indexing-storage': {
      title: 'Database Indexing, Storage & Sorting',
      topics: [
        { id: 'subtopic-5-1', label: '5.1 Flat Index Schema (ppfxi)' },
        { id: 'subtopic-5-2', label: '5.2 Term Index Schema (ppfxt)' },
        { id: 'subtopic-5-3', label: '5.3 Composite Index Strategy' },
        { id: 'subtopic-5-4', label: '5.4 Real-Time Product Sync' },
        { id: 'subtopic-5-5', label: '5.5 Bulk Reindexing & CLI Locks' },
        { id: 'subtopic-5-6', label: '5.6 Persistent Query Cache Tier' },
        { id: 'subtopic-5-7', label: '5.7 Invalidation on Product Save' }
      ]
    },
    'rest-api-lifecycle': {
      title: 'REST API, Fragment Rendering & Lifecycle',
      topics: [
        { id: 'subtopic-6-1', label: '6.1 REST Endpoint & Schema' },
        { id: 'subtopic-6-2', label: '6.2 Nonce Verification & Security' },
        { id: 'subtopic-6-3', label: '6.3 PPFX_Fragment_Renderer DOM' },
        { id: 'subtopic-6-4', label: '6.4 HTML Tag Processor Tagging' },
        { id: 'subtopic-6-5', label: '6.5 Targeted DOM Container Swap' },
        { id: 'subtopic-6-6', label: '6.6 Plugin Bootstrap & Autoload' },
        { id: 'subtopic-6-7', label: '6.7 Public Hooks & JS Events API' }
      ]
    },
    'admin-security-extensibility': {
      title: 'Admin Architecture, Security & Extensibility',
      topics: [
        { id: 'subtopic-7-1', label: '7.1 Admin Settings Page Architecture' },
        { id: 'subtopic-7-2', label: '7.2 Swatch Taxonomy Term Meta' },
        { id: 'subtopic-7-3', label: '7.3 Token Bucket Rate Limiter' },
        { id: 'subtopic-7-4', label: '7.4 Strict Parameter Sanitization' },
        { id: 'subtopic-7-5', label: '7.5 Prototype Pollution Defenses' },
        { id: 'subtopic-7-6', label: '7.6 Memory Thresholds & Guardrails' },
        { id: 'subtopic-7-7', label: '7.7 Third-Party Compatibility Bridge' }
      ]
    }
  };

  function setupDynamicContextSync() {
    const leftNavTree = document.querySelector('.doc-nav-tree');
    const dynamicSection = document.getElementById('dynamic-toc-section');
    const dynamicList = document.getElementById('dynamic-toc-list');
    const centerCanvas = document.querySelector('.doc-center-canvas') || window;

    if (!leftNavTree || !dynamicList) return;

    const leftNavItems = Array.from(leftNavTree.querySelectorAll('.doc-nav-item'));
    const sectionIds = leftNavItems.map(item => {
      const link = item.querySelector('.doc-nav-link');
      return link && link.getAttribute('href').startsWith('#') ? link.getAttribute('href').substring(1) : null;
    }).filter(Boolean);
    const sectionElements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    let activeSectionId = null;
    let activeSubtopicId = null;
    let isProgrammaticScroll = false;
    let scrollEndTimer = null;
    let subtopicObserver = null;

    function releaseProgrammaticLock() {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        isProgrammaticScroll = false;
      }, 700);
    }

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', () => { isProgrammaticScroll = false; });
    }

    function updateLeftSidebarActive(sectionId) {
      leftNavItems.forEach((item) => {
        const link = item.querySelector('.doc-nav-link');
        if (link) {
          const href = link.getAttribute('href');
          const isMatch = href === `#${sectionId}`;
          item.classList.toggle('is-active', isMatch);
          item.setAttribute('aria-current', isMatch ? 'true' : 'false');
        }
      });
    }

    function setActiveSubtopic(subtopicId) {
      if (activeSubtopicId === subtopicId) return;
      activeSubtopicId = subtopicId;
      const items = dynamicList.querySelectorAll('.doc-toc-item');
      items.forEach((item) => {
        const targetId = item.getAttribute('data-target-id');
        const isTarget = targetId === subtopicId;
        item.classList.toggle('is-active', isTarget);
        item.setAttribute('aria-current', isTarget ? 'location' : 'false');
      });
    }

    function setupSubtopicObserver(topics) {
      if (subtopicObserver) {
        subtopicObserver.disconnect();
      }

      const targetToIdMap = new Map();
      topics.forEach((t) => {
        const el = document.getElementById(t.id);
        if (el) targetToIdMap.set(el, t.id);
      });

      if (targetToIdMap.size === 0) return;

      subtopicObserver = new IntersectionObserver((entries) => {
        if (isProgrammaticScroll) return;

        // Choose the highest visible entry closest to our reading margin
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const targetId = targetToIdMap.get(visibleEntries[0].target);
          if (targetId) setActiveSubtopic(targetId);
        }
      }, {
        root: null,
        rootMargin: '-10% 0px -60% 0px',
        threshold: 0
      });

      targetToIdMap.forEach((_, el) => subtopicObserver.observe(el));
    }

    function renderRightSidebarContext(sectionId) {
      const data = SECTION_CONTEXT_TOPICS[sectionId];
      if (!data) return;

      if (dynamicSection) dynamicSection.textContent = data.title;

      // Safe fragment construction to prevent layout shifts
      const fragment = document.createDocumentFragment();
      data.topics.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = `doc-toc-item ${idx === 0 ? 'is-active' : ''}`;
        li.setAttribute('data-target-id', t.id);
        li.setAttribute('aria-current', idx === 0 ? 'location' : 'false');

        const a = document.createElement('a');
        a.href = `#${t.id}`;
        a.className = 'doc-toc-link';
        a.textContent = t.label;

        li.appendChild(a);
        fragment.appendChild(li);
      });

      dynamicList.replaceChildren(fragment);
      setupSubtopicObserver(data.topics);
    }

    function syncActiveSection(sectionId) {
      if (activeSectionId === sectionId) return;
      activeSectionId = sectionId;
      updateLeftSidebarActive(sectionId);
      renderRightSidebarContext(sectionId);
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      if (isProgrammaticScroll) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId) {
            syncActiveSection(sectionId);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-12% 0px -65% 0px',
      threshold: 0
    });

    sectionElements.forEach((el) => sectionObserver.observe(el));

    // Unified click delegation for smooth scrolling
    document.addEventListener('click', (event) => {
      const link = event.target.closest('.doc-nav-link, .doc-toc-link');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      event.preventDefault();
      isProgrammaticScroll = true;
      releaseProgrammaticLock();

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (link.classList.contains('doc-nav-link')) {
        syncActiveSection(targetId);
      } else {
        setActiveSubtopic(targetId);
      }

      if (window.history.pushState) {
        window.history.pushState(null, '', href);
      }
    });

    // Hash hydration on load
    const initialHash = window.location.hash.replace('#', '');
    let initialSection = sectionIds[0];

    if (initialHash) {
      if (SECTION_CONTEXT_TOPICS[initialHash]) {
        initialSection = initialHash;
      } else {
        for (const [secId, secData] of Object.entries(SECTION_CONTEXT_TOPICS)) {
          if (secData.topics.some((t) => t.id === initialHash)) {
            initialSection = secId;
            break;
          }
        }
      }
    }

    syncActiveSection(initialSection);
  }

  /* ==========================================================================
     4. COMPONENT 4: READING PROGRESS INDICATOR
     High-Performance rAF-Gated Layout Engine (Zero Forced Reflows)
     ========================================================================== */

  function setupReadingProgress() {
    const centerCanvas = document.querySelector('.doc-center-canvas');
    const targetScroller = centerCanvas && centerCanvas.scrollHeight > window.innerHeight
      ? centerCanvas
      : window;

    let isTicking = false;

    function calculateProgress() {
      let progress = 0;

      if (targetScroller === window) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      } else {
        const scrollTop = targetScroller.scrollTop;
        const maxScroll = targetScroller.scrollHeight - targetScroller.clientHeight;
        progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      }

      const clamped = Math.min(Math.max(progress, 0), 1);
      const formatted = Number(clamped.toFixed(4));

      // Batch all style updates
      if (centerCanvas) {
        centerCanvas.style.setProperty('--reading-progress', formatted);
      } else {
        document.documentElement.style.setProperty('--reading-progress', formatted);
      }

      isTicking = false;
    }

    function onScroll() {
      if (!isTicking) {
        window.requestAnimationFrame(calculateProgress);
        isTicking = true;
      }
    }

    targetScroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    calculateProgress();
  }

  /* ==========================================================================
     5. RUNTIME INITIALIZATION GATEWAY
     ========================================================================== */

  function start() {
    window.requestAnimationFrame(() => {
      try {
        setupStateMachine();
        setupCodeWindows();
        setupDynamicContextSync();
        setupReadingProgress();
      } catch (err) {
        console.error('Pickory Docs: Engine initialization error', err);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();