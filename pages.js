/**
 * ============================================================================
 * Pickory Commercial & Showcase Pages Runtime
 * File: pages.js
 * Scope: Product Pages (Filter & Theme), Showcase Demos, Header Nav, Walkthroughs,
 *        Interactive Changelog
 *
 * ARCHITECTURAL CONSTRAINTS:
 * - Strictly Pure Vanilla JavaScript (ES6+)
 * - Zero external dependencies
 * - Lightweight, non-blocking event delegation
 * ============================================================================
 */

/* ==========================================================================
   CHANGELOG DATA STORE
   Keyed by data-changelog attribute on <main>
   ========================================================================== */
const CHANGELOG_DATA = {
  'product-filter': {
    latest: '1.9.2',
    requires: 'WooCommerce 9.0+ · PHP 8.0+',
    releases: [
      {
        version: '1.9.2',
        date: 'September 11, 2026',
        tag: 'latest',
        summary: 'Performance pass on large catalogs.',
        changes: [
          { kind: 'improved', text: 'Attribute counts are now a single grouped query instead of one per term (≈40% faster on 50k products).' },
          { kind: 'fixed', text: 'Price slider ignored tax display settings when shop prices excluded tax.' },
          { kind: 'fixed', text: 'AJAX results lost the current sort order after clearing a filter.' },
        ],
      },
      {
        version: '1.9.0',
        date: 'August 4, 2026',
        tag: 'major',
        summary: 'HPOS compatible and a new filter builder.',
        changes: [
          { kind: 'added', text: 'Full High-Performance Order Storage (HPOS) compatibility.' },
          { kind: 'added', text: 'Drag-and-drop filter builder with per-archive rule sets.' },
          { kind: 'added', text: 'New shortcode [filterkit_active] to render active filter chips anywhere.' },
          { kind: 'improved', text: 'Filter state is now written to the URL so results are shareable.' },
        ],
      },
      {
        version: '1.8.3',
        date: 'July 2, 2026',
        changes: [
          { kind: 'fixed', text: 'Stock status filter excluded backordered products by mistake.' },
          { kind: 'fixed', text: 'Conflict with caching plugins serving stale AJAX responses (nocache headers added).' },
          { kind: 'improved', text: 'Translations updated for German, Spanish and Portuguese (Brazil).' },
        ],
      },
      {
        version: '1.8.0',
        date: 'May 19, 2026',
        changes: [
          { kind: 'added', text: 'Colour and image swatch filter type for variable products.' },
          { kind: 'improved', text: 'Reduced front-end script size from 42 KB to 18 KB (gzipped).' },
          { kind: 'removed', text: 'Removed the deprecated filterkit_query_args filter — use filterkit_pre_query.' },
        ],
      },
    ],
  },
  'theme': {
    latest: '1.1.0',
    requires: 'WooCommerce 8.0+ · WordPress 6.2+',
    releases: [
      {
        version: '1.1.0',
        date: 'September 1, 2026',
        tag: 'latest',
        summary: 'W3C Design Tokens & Containment.',
        changes: [
          { kind: 'added', text: 'Added CSS layout containment to product cards to eliminate CLS.' },
          { kind: 'added', text: 'Exposed dynamic --theme-shop-columns grid custom properties.' },
          { kind: 'improved', text: 'Zero jQuery runtime optimization for lightning-fast First Contentful Paint.' },
        ],
      },
      {
        version: '1.0.0',
        date: 'May 15, 2026',
        tag: 'major',
        summary: 'Initial public release.',
        changes: [
          { kind: 'added', text: 'Initial WooCommerce starter theme architecture with action hook model.' },
          { kind: 'added', text: 'Clean semantic markup optimized for search visibility and core web vitals.' },
        ],
      },
    ],
  },
};

(function initPickoryPagesRuntime() {
  'use strict';

  /* ==========================================================================
     1. GLOBAL HEADER: Active Link Highlighting
     ========================================================================== */
  function setupHeaderNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.doc-header-link');

    navLinks.forEach((link) => {
      const pageTarget = link.getAttribute('data-page') || link.getAttribute('href');
      const isMatch = pageTarget === currentPath ||
        (currentPath === 'theme-changelog.html' && pageTarget === 'theme.html') ||
        (currentPath === 'product-filter-changelog.html' && pageTarget === 'product-filter.html');

      if (isMatch) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    const popover = document.getElementById('header-mobile-menu');
    if (popover) {
      popover.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && typeof popover.hidePopover === 'function') {
          try { popover.hidePopover(); } catch (_) { }
        }
      });
    }
  }

  /* ==========================================================================
     2. PRODUCT WALKTHROUGH: Feature Tabs & YouTube Video Switcher
     ========================================================================== */
  function setupWalkthroughTabs() {
    const walkthroughContainer = document.querySelector('.pf-walkthrough-list');
    const videoPlayer = document.getElementById('pf-youtube-player');

    if (!walkthroughContainer) return;

    walkthroughContainer.addEventListener('click', (event) => {
      const item = event.target.closest('.pf-walkthrough-item');
      if (!item) return;

      // Update active state
      const siblings = walkthroughContainer.querySelectorAll('.pf-walkthrough-item');
      siblings.forEach((el) => {
        el.classList.remove('is-active');
        el.setAttribute('aria-selected', 'false');
      });

      item.classList.add('is-active');
      item.setAttribute('aria-selected', 'true');

      // Update YouTube video player if data-yt attribute exists
      const ytId = item.getAttribute('data-yt');
      if (ytId && videoPlayer) {
        const newSrc = `https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1`;
        if (videoPlayer.getAttribute('src') !== newSrc) {
          videoPlayer.setAttribute('src', newSrc);
        }
      }
    });
  }

  /* ==========================================================================
     3. PRODUCT SHOWCASE: Interactive Store Filter Mockup
     ========================================================================== */
  function setupStoreDemo() {
    const appWindow = document.querySelector('.pf-app-window');
    if (!appWindow) return;

    // 1. Color Swatches Toggle
    const swatchesContainer = appWindow.querySelector('.pf-app-swatches');
    if (swatchesContainer) {
      swatchesContainer.addEventListener('click', (event) => {
        const swatch = event.target.closest('.pf-swatch');
        if (!swatch) return;

        swatchesContainer.querySelectorAll('.pf-swatch').forEach((s) => s.classList.remove('is-selected'));
        swatch.classList.add('is-selected');
        triggerFilterCountUpdate();
      });
    }

    // 2. Filter Checkbox Toggles
    const checkboxes = appWindow.querySelectorAll('.pf-app-checkbox-item input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        triggerFilterCountUpdate();
      });
    });

    // 3. Demo App Window Tabs
    const tabsContainer = appWindow.querySelector('.pf-app-tabs');
    if (tabsContainer) {
      tabsContainer.addEventListener('click', (event) => {
        const tab = event.target.closest('.pf-app-tab');
        if (!tab) return;

        tabsContainer.querySelectorAll('.pf-app-tab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
      });
    }

    // Simulated dynamic count calculation
    function triggerFilterCountUpdate() {
      const statusText = appWindow.querySelector('.pf-app-status-text');
      if (!statusText) return;

      const checkedCount = appWindow.querySelectorAll('.pf-app-checkbox-item input[type="checkbox"]:checked').length;
      const baseItems = 50000;
      const results = Math.max(12, Math.round(baseItems / (checkedCount + 1) * 0.001));

      statusText.textContent = `Showing ${results} of 50,000 items`;
    }
  }

  /* ==========================================================================
     4. CHANGELOG: Interactive filter + JS-rendered release timeline
     Reads CHANGELOG_DATA keyed by data-changelog on <main>
     ========================================================================== */
  function setupChangelog() {
    const mainEl = document.querySelector('[data-changelog]');
    if (!mainEl) return;

    const key = mainEl.getAttribute('data-changelog');
    const data = CHANGELOG_DATA[key];
    if (!data) return;

    const KIND_LABELS = { added: 'Added', improved: 'Improved', fixed: 'Fixed', removed: 'Removed' };
    const TAG_LABELS = { latest: 'Latest', security: 'Security', major: 'Feature release' };
    const KINDS = Object.keys(KIND_LABELS);

    // localStorage keys — namespaced + version-stamped for automatic cache busting
    const CACHE_KEY_FILTER = `pickory:changelog:${key}:filters`;
    const CACHE_KEY_HTML = `pickory:changelog:${key}:html:${data.latest}`;

    const filtersEl = mainEl.querySelector('#changelog-filters');
    const releasesEl = mainEl.querySelector('#changelog-releases');
    const emptyEl = mainEl.querySelector('#changelog-empty');
    if (!filtersEl || !releasesEl) return;

    // --- localStorage helpers (wrapped for safety in restricted environments) ---
    function cacheGet(k) {
      try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; }
    }
    function cacheSet(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { }
    }

    // Restore persisted filter state, fallback to empty
    let active = cacheGet(CACHE_KEY_FILTER) || [];

    // Build filter chips
    KINDS.forEach((k) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'changelog-chip';
      btn.dataset.kind = k;
      btn.textContent = KIND_LABELS[k];
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        active = active.includes(k) ? active.filter((x) => x !== k) : [...active, k];
        cacheSet(CACHE_KEY_FILTER, active); // persist filter state
        render();
      });
      filtersEl.appendChild(btn);
    });

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'changelog-clear-btn';
    clearBtn.textContent = 'Clear';
    clearBtn.hidden = true;
    clearBtn.addEventListener('click', () => {
      active = [];
      cacheSet(CACHE_KEY_FILTER, active); // persist cleared state
      render();
    });
    filtersEl.appendChild(clearBtn);

    function buildHTML(filtered) {
      return filtered.map((r) => `
        <li>
          <div class="changelog-release-head">
            <h2>v${r.version}</h2>
            <time>${r.date}</time>
            ${r.tag ? `<span class="changelog-tag ${r.tag}">${TAG_LABELS[r.tag]}</span>` : ''}
          </div>
          ${r.summary ? `<p class="changelog-summary">${r.summary}</p>` : ''}
          <div class="ui-card" style="margin-top: var(--space-3);">
            <ul class="changelog-change-list">
              ${r.changes.map((c) => `
                <li>
                  <span class="changelog-kind ${c.kind}">${KIND_LABELS[c.kind]}</span>
                  <span class="changelog-change-text">${c.text}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </li>
      `).join('');
    }

    function render() {
      // Sync chip active state
      filtersEl.querySelectorAll('.changelog-chip').forEach((chip) => {
        const on = active.includes(chip.dataset.kind);
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
      clearBtn.hidden = active.length === 0;

      // Filter releases
      const filtered = data.releases
        .map((r) => ({
          ...r,
          changes: active.length === 0 ? r.changes : r.changes.filter((c) => active.includes(c.kind)),
        }))
        .filter((r) => r.changes.length > 0);

      if (emptyEl) emptyEl.hidden = filtered.length > 0;

      if (active.length === 0) {
        // No active filters: try reading the cached full render (version-stamped)
        const cached = cacheGet(CACHE_KEY_HTML);
        if (cached) {
          releasesEl.innerHTML = cached;
          return;
        }
        // Cache miss: build, render, then store
        const html = buildHTML(filtered);
        releasesEl.innerHTML = html;
        cacheSet(CACHE_KEY_HTML, html);
      } else {
        // Filtered view: always compute fresh (no caching for partial views)
        releasesEl.innerHTML = buildHTML(filtered);
      }
    }

    render();
  }

  /* ==========================================================================
     5. SUPPORT PORTAL: Category Cards, Ticket Popup & Anti-Spam Guard
     ========================================================================== */
  function setupSupportPortal() {
    const modal = document.getElementById('ticket-modal');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-title');
    const categorySelect = document.getElementById('ticket-category');
    const closeBtn = document.getElementById('modal-close-btn');
    const form = document.getElementById('support-ticket-form');
    const statusMsg = document.getElementById('form-status-msg');
    const hpField = document.getElementById('company_verify_check');

    // Floating Toast Notification
    const toast = document.getElementById('support-toast');
    const toastEmail = document.getElementById('toast-user-email');
    const toastCloseBtn = document.getElementById('toast-close-btn');
    let toastTimer = null;

    function showToast(userEmail) {
      if (!toast) return;
      if (toastTimer) clearTimeout(toastTimer);

      if (toastEmail && userEmail) {
        toastEmail.textContent = userEmail;
      }

      // Visibility controlled via CSS class (not `hidden` attr, which display:flex overrides)
      toast.classList.add('is-visible');

      // Auto-dismiss toast after 5.5 seconds
      toastTimer = setTimeout(() => {
        hideToast();
      }, 5500);
    }

    function hideToast() {
      if (!toast) return;
      if (toastTimer) clearTimeout(toastTimer);
      toast.classList.remove('is-visible');
    }

    if (toastCloseBtn) {
      toastCloseBtn.addEventListener('click', hideToast);
    }

    function openModal(category) {
      if (category) {
        if (categorySelect) categorySelect.value = category;
        if (modalTitle) {
          modalTitle.textContent = category;
        }
      }
      modal.hidden = false;
      requestAnimationFrame(() => {
        modal.classList.add('is-active');
      });
      
      if (form) form.hidden = false;
      if (statusMsg) statusMsg.hidden = true;
      
      const emailInput = document.getElementById('ticket-email');
      if (emailInput) emailInput.focus();
    }

    function closeModal() {
      modal.classList.remove('is-active');
      setTimeout(() => {
        modal.hidden = true;
        if (form) form.hidden = false;
      }, 200);
    }

    // Category Card click bindings
    document.querySelectorAll('.js-category-card').forEach((card) => {
      card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        openModal(category);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });

    // Form Submission: Honeypot Anti-Bot + Rate Limiter + Immediate Modal Close + Floating Toast
    if (form) {
      let isSubmitting = false;
      
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        // 0. Rate limit / double-click prevention
        if (isSubmitting) return;
        isSubmitting = true;
        setTimeout(() => { isSubmitting = false; }, 3000); // 3 second cooldown

        const categoryVal = categorySelect ? categorySelect.value : '';
        const emailVal = document.getElementById('ticket-email')?.value.trim() || '';
        const descVal = document.getElementById('ticket-description')?.value.trim() || '';

        // 1. Anti-Bot Honeypot Trap check
        if (hpField && hpField.value.trim() !== '') {
          console.warn('[Security] Bot trapped by honeypot field. Submission dropped silently.');
          closeModal();
          form.reset();
          showToast(emailVal);
          return;
        }

        const nameVal = document.getElementById('ticket-name')?.value.trim() || '';

        // Show inline success message without closing the modal
        if (statusMsg) {
          statusMsg.textContent = 'Ticket Submitted Successfully! We will follow up shortly.';
          statusMsg.style.color = 'var(--cyan-500, #06b6d4)';
          statusMsg.style.marginTop = '0';
          statusMsg.style.marginBottom = 'var(--space-4)';
          statusMsg.hidden = false;
        }
        showToast(emailVal);

        const payload = {
          name: nameVal,
          category: categoryVal,
          email: emailVal,
          description: descVal,
          timestamp: new Date().toISOString()
        };

        // Reset form for subsequent submissions
        form.reset();

        // Check if endpoint configured on the form (Google Apps Script Web App)
        const endpoint = form.getAttribute('action') || form.getAttribute('data-endpoint') || '';

        if (endpoint && endpoint.startsWith('https://')) {
          // Send JSON payload with text/plain;charset=utf-8 to eliminate CORS preflight rejection while Google Apps Script parses e.postData.contents
          fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          }).catch((err) => {
            console.error('[Support Form] Background sync error:', err);
          });
        }
      });
    }

    // High-performance Smooth Accordion Engine using Web Animations API
    class SmoothAccordion {
      constructor(el) {
        this.el = el;
        this.summary = el.querySelector('.faq-accordion-summary');
        this.body = el.querySelector('.faq-accordion-body');
        this.animation = null;
        this.isClosing = false;
        this.isExpanding = false;
        el._accordion = this;

        if (this.summary) {
          this.summary.addEventListener('click', (e) => this.onSummaryClick(e));
        }
      }

      onSummaryClick(e) {
        e.preventDefault();
        this.el.style.overflow = 'hidden';

        if (this.isClosing || !this.el.open) {
          this.open();
        } else if (this.isExpanding || this.el.open) {
          this.shrink();
        }
      }

      shrink() {
        this.isClosing = true;
        this.isExpanding = false;
        this.el.classList.add('is-closing');

        const startHeight = `${this.el.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight}px`;

        if (this.animation) {
          this.animation.cancel();
        }

        // Animate accordion container height smoothly
        this.animation = this.el.animate({
          height: [startHeight, endHeight]
        }, {
          duration: 300,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        });

        // Soft fade out for inner body text
        if (this.body) {
          this.body.animate({
            opacity: [1, 0],
            transform: ['translateY(0)', 'translateY(-6px)']
          }, {
            duration: 200,
            easing: 'ease-out'
          });
        }

        this.animation.onfinish = () => this.onAnimationFinish(false);
        this.animation.oncancel = () => {
          this.isClosing = false;
          this.el.classList.remove('is-closing');
        };
      }

      open() {
        // Smoothly close any currently open sibling accordions
        document.querySelectorAll('.faq-accordion-item[open]').forEach((other) => {
          if (other !== this.el && other._accordion && !other.classList.contains('is-closing')) {
            other._accordion.shrink();
          }
        });

        const startHeight = `${this.el.offsetHeight}px`;
        this.el.open = true;
        this.el.classList.remove('is-closing');

        window.requestAnimationFrame(() => this.expand(startHeight));
      }

      expand(initialHeight) {
        this.isExpanding = true;
        this.isClosing = false;
        this.el.classList.remove('is-closing');

        const startHeight = initialHeight || `${this.summary.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight + (this.body ? this.body.offsetHeight : 0)}px`;

        if (this.animation) {
          this.animation.cancel();
        }

        // Animate container expanding to full height
        this.animation = this.el.animate({
          height: [startHeight, endHeight]
        }, {
          duration: 340,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        });

        // Smooth fade-in & slide-up for content
        if (this.body) {
          this.body.animate({
            opacity: [0, 1],
            transform: ['translateY(-6px)', 'translateY(0)']
          }, {
            duration: 300,
            delay: 30,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both'
          });
        }

        this.animation.onfinish = () => this.onAnimationFinish(true);
        this.animation.oncancel = () => {
          this.isExpanding = false;
        };
      }

      onAnimationFinish(isOpen) {
        this.animation = null;
        this.isClosing = false;
        this.isExpanding = false;
        this.el.classList.remove('is-closing');

        if (!isOpen) {
          // Pin the fully-collapsed height before toggling open=false
          // so the browser's native instant-collapse never fires visibly.
          this.el.style.height = `${this.summary.offsetHeight}px`;
          this.el.style.overflow = 'hidden';
          this.el.open = false;
          // Release control on next frame — element is already visually closed
          requestAnimationFrame(() => {
            this.el.style.height = '';
            this.el.style.overflow = '';
          });
        } else {
          this.el.open = true;
          this.el.style.height = '';
          this.el.style.overflow = '';
        }
      }
    }

    // Initialize all FAQ accordions
    document.querySelectorAll('.faq-accordion-item').forEach((acc) => {
      new SmoothAccordion(acc);
    });
  }

  /* ==========================================================================
     INITIALIZATION: Run on DOMContentLoaded
     ========================================================================== */
  function init() {
    setupHeaderNav();
    setupWalkthroughTabs();
    setupStoreDemo();
    setupChangelog();
    setupSupportPortal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
