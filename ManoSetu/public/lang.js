/**
 * ManoSetu — Global Language Toggle
 * Supports EN (English), HI (Hindi), TE (Telugu)
 * Uses Google Translate API for actual translation.
 * Auto-injects the toggle UI into any nav or topbar on the page.
 */

(function () {
  /* ── CSS ─────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .ms-lang-toggle {
      position: relative;
      display: inline-flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 20px;
      padding: 2px;
      height: 32px;
      width: 118px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      flex-shrink: 0;
      font-family: 'Sora', sans-serif;
      user-select: none;
    }
    .ms-lang-track {
      position: absolute;
      top: 2px;
      left: 2px;
      height: 28px;
      width: 36px;
      background: #7c3aed;
      border-radius: 18px;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
      z-index: 0;
    }
    .ms-lang-btn {
      flex: 1;
      text-align: center;
      font-size: 11.5px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      z-index: 1;
      line-height: 28px;
      transition: color 0.25s;
      letter-spacing: 0.3px;
    }
    .ms-lang-btn.active { color: #ffffff; }

    /* Floating pill for pages without a standard nav (auth, etc.) */
    .ms-lang-float {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
    }
    /* Inside volunteer sidebar topbar */
    .ms-lang-topbar {
      margin-left: 0;
    }
    /* Hide Google's own UI chrome */
    .skiptranslate, .goog-te-banner-frame { display: none !important; }
    body { top: 0px !important; }
  `;
  document.head.appendChild(style);

  /* ── Inject Google Translate (invisible) ─────────────────────── */
  if (!document.getElementById('ms-gt-container')) {
    const div = document.createElement('div');
    div.id = 'ms-gt-container';
    div.style.display = 'none';
    document.body.appendChild(div);

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=_msGTInit';
    document.body.appendChild(script);
  }

  window._msGTInit = function () {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,te',
      autoDisplay: false
    }, 'ms-gt-container');
  };

  /* ── Build toggle HTML ───────────────────────────────────────── */
  const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'te', label: 'TE' },
  ];

  function buildToggle(extraClass = '') {
    const wrap  = document.createElement('div');
    wrap.className = `ms-lang-toggle ${extraClass}`;
    wrap.id = 'ms-lang-toggle';

    const track = document.createElement('div');
    track.className = 'ms-lang-track';
    track.id = 'ms-lang-track';
    wrap.appendChild(track);

    LANGS.forEach((lang, i) => {
      const btn = document.createElement('div');
      btn.className = 'ms-lang-btn' + (i === 0 ? ' active' : '');
      btn.dataset.idx = i;
      btn.dataset.code = lang.code;
      btn.textContent = lang.label;
      btn.addEventListener('click', () => applyLanguage(lang.code, i));
      wrap.appendChild(btn);
    });

    return wrap;
  }

  /* ── Apply language ──────────────────────────────────────────── */
  function applyLanguage(code, index) {
    localStorage.setItem('ms-lang', code);
    localStorage.setItem('ms-lang-idx', index);

    // Update all toggle instances on the page
    document.querySelectorAll('#ms-lang-toggle, .ms-lang-toggle').forEach(toggle => {
      toggle.querySelectorAll('.ms-lang-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
      const track = toggle.querySelector('.ms-lang-track');
      if (track) track.style.transform = `translateX(${index * 38}px)`;
    });

    // Trigger Google Translate
    const sel = document.querySelector('select.goog-te-combo');
    if (sel) {
      sel.value = code;
      sel.dispatchEvent(new Event('change'));
    } else {
      // Google Translate not ready yet — try once it loads
      setTimeout(() => {
        const s2 = document.querySelector('select.goog-te-combo');
        if (s2) { s2.value = code; s2.dispatchEvent(new Event('change')); }
      }, 1500);
    }
  }

  /* ── Restore saved language on load ─────────────────────────── */
  function restoreSavedLanguage() {
    const savedIdx  = parseInt(localStorage.getItem('ms-lang-idx') || '0');
    const savedCode = localStorage.getItem('ms-lang') || 'en';
    if (savedIdx > 0) {
      setTimeout(() => applyLanguage(savedCode, savedIdx), 800);
    }
  }

  /* ── Inject into page ────────────────────────────────────────── */
  function inject() {
    // Already injected?
    if (document.getElementById('ms-lang-toggle')) return;

    const page = window.location.pathname;

    // 1. Volunteer sidebar topbar
    const topbar = document.querySelector('.topbar');
    if (topbar) {
      const toggle = buildToggle('ms-lang-topbar');
      // Insert before the Export button or avatar
      const exportBtn = topbar.querySelector('.btn-export');
      if (exportBtn) topbar.insertBefore(toggle, exportBtn);
      else topbar.appendChild(toggle);
      restoreSavedLanguage();
      return;
    }

    // 2. Admin sidebar header area
    const adminHeader = document.querySelector('.header-actions, .topbar-actions');
    if (adminHeader) {
      adminHeader.appendChild(buildToggle());
      restoreSavedLanguage();
      return;
    }

    // 3. Standard <nav> with nav-links
    const nav = document.querySelector('nav');
    if (nav) {
      const toggle  = buildToggle();
      const sos     = nav.querySelector('.btn-sos');
      const logout  = nav.querySelector('.btn-logout');
      const logoutInline = nav.querySelector('button[onclick*="localStorage.clear"]');

      const insertBefore = sos || logout || logoutInline;
      if (insertBefore) {
        nav.insertBefore(toggle, insertBefore);
      } else {
        nav.appendChild(toggle);
      }
      toggle.style.marginLeft = '12px';
      restoreSavedLanguage();
      return;
    }

    // 4. No nav at all — float in top-right corner
    document.body.appendChild(buildToggle('ms-lang-float'));
    restoreSavedLanguage();
  }

  /* Run after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
