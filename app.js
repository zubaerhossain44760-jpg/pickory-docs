/**
 * ============================================================================
 * Pickory Product Filter - Interactive Developer Documentation Engine
 * File: app.js
 * Phase: 3 (Content Hydration, Interactive State Machine, Code Window, Scroll Spy)
 *
 * ARCHITECTURAL CONSTRAINTS:
 * - Strictly Pure Vanilla JavaScript (ES6+)
 * - Zero React hooks (No useState, No useEffect, No JSX)
 * - Zero external libraries (No jQuery, No lodash, No Alpine, No npm packages)
 * - Clean event delegation pattern
 * - Native Web APIs: IntersectionObserver, EventTarget, classList, dataset, navigator.clipboard
 * ============================================================================
 */

(function initPickoryDocRuntime() {
  'use strict';

  /* ==========================================================================
     1. COMPONENT 1: REACTIVE STATE MACHINE VISUALIZER
     Data store and event-delegated node activation with adjacent micro-card
     ========================================================================== */

  /**
   * Technical specifications and architectural invariants for each pipeline node
   */
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

  /**
   * Initializes the State Machine Flowchart and Micro-card
   */
  function setupStateMachine() {
    const container = document.getElementById('state-machine-container');
    const microCard = document.getElementById('state-inspector-card');
    if (!container || !microCard) return;

    const microTitle = microCard.querySelector('.ui-card-title');
    const microBadge = microCard.querySelector('.ui-badge');
    const microPath = microCard.querySelector('.ui-card-filepath');
    const microRole = microCard.querySelector('.ui-card-role');
    const microInvariant = microCard.querySelector('.ui-card-invariant');
    const allNodes = container.querySelectorAll('.flow-node');

    /**
     * Activates a specific node and updates the inspector micro-card
     * @param {string} nodeId - The key matching STATE_MACHINE_NODES
     */
    function activateNode(nodeId) {
      const nodeData = STATE_MACHINE_NODES[nodeId];
      if (!nodeData) return;

      // 1. Toggle active state on SVG nodes
      allNodes.forEach((node) => {
        const isActive = node.getAttribute('data-node-id') === nodeId;
        node.classList.toggle('is-active', isActive);
        node.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // 2. Update micro-card DOM elements
      if (microTitle) microTitle.textContent = nodeData.title;
      if (microBadge) microBadge.textContent = nodeData.badge;
      if (microPath) microPath.textContent = nodeData.filePath;
      if (microRole) microRole.textContent = nodeData.role;
      if (microInvariant) microInvariant.textContent = nodeData.invariant;
    }

    // Event delegation on the SVG flowchart container
    container.addEventListener('click', (event) => {
      const nodeEl = event.target.closest('.flow-node');
      if (!nodeEl) return;
      const nodeId = nodeEl.getAttribute('data-node-id');
      if (nodeId) activateNode(nodeId);
    });

    // Keyboard navigation (Enter / Space to activate focused node)
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

    // Default activate the first node (User Interaction)
    activateNode('user-interaction');
  }

  /* ==========================================================================
     2. COMPONENT 2: MULTI-TAB JETBRAINS / STRIPE CODE WINDOW
     DRY tab-switching logic via dataset & classList.toggle()
     ========================================================================== */

  /**
   * Initializes Multi-Tab Code Windows
   */
  function setupCodeWindows() {
    const codeWindows = document.querySelectorAll('.ui-code-window');

    codeWindows.forEach((windowEl) => {
      const tabGroup = windowEl.querySelector('.code-tab-group');
      const filenameLabel = windowEl.querySelector('.code-window-filename');
      const copyBtn = windowEl.querySelector('.copy-btn');
      const tabPanes = windowEl.querySelectorAll('.code-tab-pane');

      if (!tabGroup) return;

      // Event delegation for tab switching
      tabGroup.addEventListener('click', (event) => {
        const tabBtn = event.target.closest('.code-tab-btn');
        if (!tabBtn) return;

        const targetPaneId = tabBtn.getAttribute('data-target');
        const targetFilename = tabBtn.getAttribute('data-file');
        if (!targetPaneId) return;

        // Toggle tab button active state
        const allTabBtns = tabGroup.querySelectorAll('.code-tab-btn');
        allTabBtns.forEach((btn) => {
          btn.classList.toggle('is-active', btn === tabBtn);
          btn.setAttribute('aria-selected', btn === tabBtn ? 'true' : 'false');
        });

        // Toggle code pane visibility
        tabPanes.forEach((pane) => {
          const isTarget = pane.id === targetPaneId;
          pane.classList.toggle('is-active', isTarget);
        });

        // Dynamically update active filename indicator in the header
        if (filenameLabel && targetFilename) {
          filenameLabel.textContent = targetFilename;
        }
      });

      // Clipboard copy function with temporary visual feedback
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const activePane = windowEl.querySelector('.code-tab-pane.is-active');
          const codeEl = activePane ? activePane.querySelector('code') : null;
          if (!codeEl) return;

          const codeText = codeEl.textContent || '';

          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(codeText);
            } else {
              // Fallback for non-secure contexts
              const textarea = document.createElement('textarea');
              textarea.value = codeText;
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            }

            // Visual feedback: toggle checkmark state
            copyBtn.classList.add('is-copied');
            const copyText = copyBtn.querySelector('.copy-text');
            const originalText = copyText ? copyText.textContent : 'Copy Code';
            if (copyText) copyText.textContent = 'Copied!';

            setTimeout(() => {
              copyBtn.classList.remove('is-copied');
              if (copyText) copyText.textContent = originalText;
            }, 2000);
          } catch (err) {
            console.error('Pickory Docs: Clipboard copy failed:', err);
          }
        });
      }
    });
  }

  /* ==========================================================================
     3. COMPONENT 3: DYNAMIC CONTEXTUAL TOC & MAIN NAV SYNCHRONIZATION
     Dynamic contextual subtopic rendering and bidirectional scroll spy
     between Left Main Navigation and Right Practical Inquiries Sidebar
     ========================================================================== */

  /**
   * Data dictionary defining the contextual topics and practical questions
   * associated with each primary section in the Main Navigation.
   */
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

  /**
   * Initializes the dynamic synchronization engine
   */
  function setupDynamicContextSync() {
    const leftNavTree = document.querySelector('.doc-nav-tree');
    const rightSidebar = document.querySelector('.doc-sidebar-right');
    const dynamicSection = document.getElementById('dynamic-toc-section');
    const dynamicList = document.getElementById('dynamic-toc-list');

    if (!leftNavTree || !rightSidebar || !dynamicList) return;

    const leftNavItems = Array.from(leftNavTree.querySelectorAll('.doc-nav-item'));
    const sectionIds = Object.keys(SECTION_CONTEXT_TOPICS);
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    let activeSectionId = null;
    let activeSubtopicId = null;
    let subtopicObserver = null;

    /**
     * Updates the active class on the Left Sidebar main navigation
     * @param {string} sectionId
     */
    function updateLeftSidebarActive(sectionId) {
      leftNavItems.forEach((item) => {
        const link = item.querySelector('.doc-nav-link');
        if (link) {
          const href = link.getAttribute('href');
          const isMatch = href === `#${sectionId}`;
          item.classList.toggle('is-active', isMatch);
        }
      });
    }

    /**
     * Renders contextual topics in the Right Sidebar and observes subtopics
     * @param {string} sectionId
     */
    function renderRightSidebarContext(sectionId) {
      const data = SECTION_CONTEXT_TOPICS[sectionId];
      if (!data) return;

      if (dynamicSection) dynamicSection.textContent = data.title;

      // Render new items with subtle fade
      dynamicList.style.opacity = '0';
      setTimeout(() => {
        dynamicList.innerHTML = data.topics.map((t, idx) => `
          <li class="doc-toc-item ${idx === 0 ? 'is-active' : ''}" data-target-id="${t.id}">
            <a href="#${t.id}" class="doc-toc-link">${t.label}</a>
          </li>
        `).join('');
        dynamicList.style.opacity = '1';

        // Connect subtopic observer for the newly rendered topics
        setupSubtopicObserver(data.topics);
      }, 80);
    }

    /**
     * Highlights the active subtopic in the Right Sidebar
     * @param {string} subtopicId
     */
    function setActiveSubtopic(subtopicId) {
      activeSubtopicId = subtopicId;
      const items = dynamicList.querySelectorAll('.doc-toc-item');
      items.forEach((item) => {
        const targetId = item.getAttribute('data-target-id');
        item.classList.toggle('is-active', targetId === subtopicId);
      });
    }

    /**
     * Sets up IntersectionObserver for subtopics of the current section
     * @param {Array} topics
     */
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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetId = targetToIdMap.get(entry.target);
            if (targetId && targetId !== activeSubtopicId) {
              setActiveSubtopic(targetId);
            }
          }
        });
      }, {
        root: null,
        rootMargin: '-10% 0px -55% 0px',
        threshold: 0
      });

      targetToIdMap.forEach((_, el) => subtopicObserver.observe(el));
    }

    /**
     * Syncs a new section to both sidebars
     * @param {string} sectionId
     */
    function syncActiveSection(sectionId) {
      if (activeSectionId === sectionId) return;
      activeSectionId = sectionId;
      updateLeftSidebarActive(sectionId);
      renderRightSidebarContext(sectionId);
    }

    // 1. Observe all primary sections in the main canvas
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId && SECTION_CONTEXT_TOPICS[sectionId]) {
            syncActiveSection(sectionId);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-10% 0px -60% 0px',
      threshold: 0
    });

    sectionElements.forEach((el) => sectionObserver.observe(el));

    // 2. Handle Left Sidebar clicks: smooth scroll & immediate sync
    leftNavTree.addEventListener('click', (event) => {
      const link = event.target.closest('.doc-nav-link');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          event.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        syncActiveSection(targetId);
      }
    });

  /* ==========================================================================
     4. COMPONENT 4: READING PROGRESS INDICATOR
     Dynamic progress bar showing scroll position in main content
     ========================================================================== */

  /**
   * Initializes the reading progress indicator
   */
  function setupReadingProgress() {
    const centerCanvas = document.querySelector('.doc-center-canvas');
    if (!centerCanvas) return;

    const updateProgress = () => {
      const scrollTop = centerCanvas.scrollTop;
      const scrollHeight = centerCanvas.scrollHeight - centerCanvas.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      centerCanvas.style.setProperty('--reading-progress', progress);
      centerCanvas.classList.add('reading-progress');
    };

    centerCanvas.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call
  }



  /* ==========================================================================
     INITIALIZATION: Bootstrap All Components
     ========================================================================== */
  setupStateMachine();
  setupCodeWindows();
  setupContextualTOC();
  setupReadingProgress();
    // 3. Handle Right Sidebar clicks: smooth scroll to subtopic
    rightSidebar.addEventListener('click', (event) => {
      const link = event.target.closest('.doc-toc-link');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          event.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSubtopic(targetId);
        }
      }
    });

    // 4. Initial sync based on current URL hash or default to architecture-overview
    const initialHash = window.location.hash.replace('#', '');
    let initialSection = 'core-architecture';

    if (initialHash) {
      // Check if hash is directly a section
      if (SECTION_CONTEXT_TOPICS[initialHash]) {
        initialSection = initialHash;
      } else {
        // Find which section contains this subtopic
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
     4. RUNTIME BOOTSTRAP
     DOM ready initialization
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupStateMachine();
      setupCodeWindows();
      setupDynamicContextSync();
      setupReadingProgress();
    });
  } else {
    setupStateMachine();
    setupCodeWindows();
    setupDynamicContextSync();
    setupReadingProgress();
  }
})();
