/**
 * ORVANNIS RENDER ENGINE
 * Reads window.ORVANNIS config and hydrates every page.
 * Runs after site.config.js loads.
 */

(function () {
  'use strict';

  const C = window.ORVANNIS;
  if (!C) return;

  /* ── Helpers ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const set = (sel, val, attr = 'textContent') => {
    const el = $(sel);
    if (el && val !== undefined) el[attr] = val;
  };
  const html = (sel, val) => { const el = $(sel); if (el) el.innerHTML = val; };

  /* ── Apply color tokens to CSS vars ──
     Theme-aware: picks the Light or Dark variant from config based on the
     current data-theme attribute, and re-runs whenever that attribute
     changes (e.g. the user clicks the theme toggle) so it never gets stuck
     showing one palette's colors under the other theme's attribute.
  */
  function applyColors() {
    const r = document.documentElement;
    const co = C.colors;
    if (!co) return;
    const isDark = r.getAttribute('data-theme') === 'dark';
    // Copper (theme-invariant brand accent)
    r.style.setProperty('--copper',        co.copper       || '#B87333');
    r.style.setProperty('--copper-bright', co.copperBright || '#D4924A');
    r.style.setProperty('--copper-muted',  co.copperMuted  || '#9C5A2C');
    r.style.setProperty('--color-primary', co.copper       || '#B87333');
    // Theme-dependent palette
    if (isDark) {
      r.style.setProperty('--color-bg',         co.bgDark        || '#131210');
      r.style.setProperty('--color-surface',    co.surfaceDark   || '#1A1815');
      r.style.setProperty('--color-text',       co.textDark      || '#E5DFD4');
      r.style.setProperty('--color-text-muted', co.textMutedDark || '#8A8070');
    } else {
      r.style.setProperty('--color-bg',         co.bgLight        || '#F4F0E8');
      r.style.setProperty('--color-surface',    co.surfaceLight   || '#FAF8F4');
      r.style.setProperty('--color-text',       co.textLight      || '#2A2720');
      r.style.setProperty('--color-text-muted', co.textMutedLight || '#6B6560');
    }
  }
  new MutationObserver(applyColors)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── Inject shared nav into every page ── */
  function renderNav() {
    const nav = C.nav || [];
    const cta = C.navCta || {};
    const path = window.location.pathname;

    // Build links HTML
    const linksHtml = nav.map(item => {
      const isActive = path.endsWith(item.href) ||
        (item.href === 'index.html' && (path === '/' || path.endsWith('index.html')));
      return `<li><a href="${item.href}"${isActive ? ' class="active"' : ''}>${item.label}</a></li>`;
    }).join('');

    // Desktop nav links
    $$('.nav-links').forEach(el => { el.innerHTML = linksHtml; });

    // Mobile nav links
    $$('.mobile-nav-links').forEach(el => {
      el.innerHTML = nav.map(i => `<li><a href="${i.href}">${i.label}</a></li>`).join('');
    });

    // CTA button text + href
    $$('.nav-cta').forEach(btn => {
      btn.textContent = cta.label || 'Book a Call';
      btn.href = cta.href || 'contact.html';
    });

    // Footer mobile CTA
    $$('.mobile-cta').forEach(btn => {
      btn.textContent = cta.label || 'Book a Call';
      btn.href = cta.href || 'contact.html';
    });
  }

  /* ── Render brand name everywhere ── */
  function renderBrand() {
    const b = C.brand;
    if (!b) return;
    $$('[data-brand-name]').forEach(el => { el.textContent = b.name; });
    $$('[data-brand-tagline]').forEach(el => { el.textContent = b.tagline; });
    $$('[data-brand-email]').forEach(el => {
      el.textContent = b.email;
      if (el.tagName === 'A') el.href = `mailto:${b.email}`;
    });
    $$('[data-brand-location]').forEach(el => { el.textContent = b.location; });
    $$('[data-copyright]').forEach(el => { el.textContent = `© ${b.founded} ${b.name}. All rights reserved.`; });
    $$('[data-signoff]').forEach(el => {
      el.innerHTML = (C.footer?.signoff || '')
        .replace('copper', '<span class="copper-text">copper</span>')
        .replace('stone', '<span style="color:var(--color-text-muted)">stone</span>')
        .replace('orbit', '<span style="color:var(--color-heading)">orbit</span>')
        .replace('the arrow', '<span class="copper-text">the arrow</span>');
    });
  }

  /* ── HOME PAGE ── */
  function renderHome() {
    if (!$('[data-page="home"]')) return;
    const h = C.home;
    if (!h) return;
    const { hero, modules, concept, cta, layout, founderStrip, helpWith, currentServices, whoWeHelp, howWeWork } = { ...h, layout: C.layout };

    // Hero
    set('[data-hero-eyebrow]', hero?.eyebrow);
    set('[data-hero-headline]', hero?.headline);
    set('[data-hero-headline-em]', hero?.headlineEm);
    set('[data-hero-headline-l3]', hero?.headlineLine3);
    set('[data-hero-headline-l4]', hero?.headlineLine4);
    set('[data-hero-body]', hero?.body);
    set('[data-hero-note]', hero?.note);

    const heroPrimary = $('[data-hero-cta-primary]');
    if (heroPrimary && hero?.ctaPrimary) {
      heroPrimary.textContent = hero.ctaPrimary.label;
      heroPrimary.href = hero.ctaPrimary.href;
    }
    const heroSecondary = $('[data-hero-cta-secondary]');
    if (heroSecondary && hero?.ctaSecondary) {
      heroSecondary.textContent = hero.ctaSecondary.label;
      heroSecondary.href = hero.ctaSecondary.href;
    }

    // Modules section
    set('[data-modules-eyebrow]', modules?.eyebrow);
    set('[data-modules-title]', modules?.title);
    set('[data-modules-body]', modules?.body);

    // Module cards
    const cards = $$('[data-module-card]');
    cards.forEach((card, i) => {
      const m = modules?.cards?.[i];
      if (!m) return;
      const tag = card.querySelector('[data-card-tag]');
      const title = card.querySelector('[data-card-title]');
      const body = card.querySelector('[data-card-body]');
      const link = card.querySelector('[data-card-link]');
      if (tag)   tag.textContent = m.tag;
      if (title) title.textContent = m.title;
      if (body)  body.textContent = m.body;
      if (link)  { link.href = m.href || '#'; }
    });

    // Founder strip (near the top of the homepage, per brand direction)
    set('[data-founder-eyebrow]', founderStrip?.eyebrow);
    set('[data-founder-body]', founderStrip?.body);
    const founderCta = $('[data-founder-cta]');
    if (founderCta && founderStrip?.cta) {
      founderCta.textContent = founderStrip.cta.label + ' →';
      founderCta.href = founderStrip.cta.href;
    }

    // "What We Actually Help With"
    set('[data-helpwith-eyebrow]', helpWith?.eyebrow);
    set('[data-helpwith-title]', helpWith?.title);
    const helpWithList = $('[data-helpwith-items]');
    if (helpWithList && helpWith?.items) {
      helpWithList.innerHTML = helpWith.items.map(i => `<li>${i}</li>`).join('');
    }

    // "Built for Year 1" / current services
    set('[data-currentservices-eyebrow]', currentServices?.eyebrow);
    set('[data-currentservices-title]', currentServices?.title);
    set('[data-currentservices-body]', currentServices?.body);
    set('[data-currentservices-statement]', currentServices?.statement);
    const currentServicesList = $('[data-currentservices-items]');
    if (currentServicesList && currentServices?.items) {
      currentServicesList.innerHTML = currentServices.items.map(i => `<li>${i}</li>`).join('');
    }

    // "Who We Help"
    set('[data-whowehelp-eyebrow]', whoWeHelp?.eyebrow);
    set('[data-whowehelp-title]', whoWeHelp?.title);
    const whoWeHelpList = $('[data-whowehelp-items]');
    if (whoWeHelpList && whoWeHelp?.items) {
      whoWeHelpList.innerHTML = whoWeHelp.items.map(i => `<li>${i}</li>`).join('');
    }

    // "How We Work"
    set('[data-howwework-eyebrow]', howWeWork?.eyebrow);
    set('[data-howwework-title]', howWeWork?.title);
    const howWeWorkList = $('[data-howwework-steps]');
    if (howWeWorkList && howWeWork?.steps) {
      howWeWorkList.innerHTML = howWeWork.steps.map(s =>
        `<li><span class="how-step-num">${s.num}</span><span class="how-step-title">${s.title}</span><span class="how-step-body">${s.body}</span></li>`
      ).join('');
    }

    // Concept section
    if (C.layout?.showConceptSection === false) {
      const sec = $('[data-section="concept"]');
      if (sec) sec.style.display = 'none';
    } else {
      set('[data-concept-eyebrow]', concept?.eyebrow);
      set('[data-concept-title]', concept?.title?.replace('\n', ' '));
      set('[data-concept-body1]', concept?.body1);
      set('[data-concept-body2]', concept?.body2);
      const conceptCta = $('[data-concept-cta]');
      if (conceptCta && concept?.cta) {
        conceptCta.textContent = concept.cta.label;
        conceptCta.href = concept.cta.href;
      }
    }

    // Home CTA
    if (C.layout?.showHomeCta === false) {
      const sec = $('[data-section="home-cta"]');
      if (sec) sec.style.display = 'none';
    } else {
      set('[data-cta-eyebrow]', cta?.eyebrow);
      set('[data-cta-title]', cta?.title);
      set('[data-cta-body]', cta?.body);
      const ctaPrimary = $('[data-cta-primary]');
      if (ctaPrimary && cta?.ctaPrimary) {
        ctaPrimary.textContent = cta.ctaPrimary.label;
        ctaPrimary.href = cta.ctaPrimary.href;
      }
      const ctaSecondary = $('[data-cta-secondary]');
      if (ctaSecondary && cta?.ctaSecondary) {
        ctaSecondary.textContent = cta.ctaSecondary.label;
        ctaSecondary.href = cta.ctaSecondary.href;
      }
    }

    // Marquee strip
    if (C.layout?.showMarqueeStrip === false) {
      const strip = $('[data-section="marquee"]');
      if (strip) strip.style.display = 'none';
    }

    // O-ring rotation
    if (C.layout?.heroORotates === false) {
      window._oRingDisabled = true;
    }
  }

  /* ── PLATFORM PAGE ── */
  function renderPlatform() {
    if (!$('[data-page="platform"]')) return;
    const p = C.platform;
    if (!p) return;

    // Hero
    set('[data-hero-eyebrow]', p.hero?.eyebrow);
    const titleEl = $('[data-hero-title]');
    if (titleEl) titleEl.innerHTML = (p.hero?.title || '').replace('\n', '<br>');
    set('[data-hero-subtitle]', p.hero?.subtitle);
    set('[data-status-badge]', p.hero?.statusBadge);

    // What We Actually Help With
    set('[data-helpwith-eyebrow]', p.helpWith?.eyebrow);
    const helpWithList = $('[data-helpwith-items]');
    if (helpWithList && p.helpWith?.items) {
      helpWithList.innerHTML = p.helpWith.items.map(i => `<li>${i}</li>`).join('');
    }

    // Modules
    p.modules?.forEach((mod, i) => {
      const sec = $(`[data-module="${mod.id}"]`);
      if (!sec) return;
      const q = sel => sec.querySelector(sel);
      const t = (sel, val) => { const el = q(sel); if (el) el.textContent = val; };
      t('[data-mod-tag]', mod.tag);
      t('[data-mod-title]', mod.title);
      t('[data-mod-tagline]', mod.tagline);
      t('[data-mod-body]', mod.body);
      // Features
      const featList = q('[data-mod-features]');
      if (featList && mod.features) {
        featList.innerHTML = mod.features.map(f =>
          `<li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>${f}</li>`
        ).join('');
      }
    });

    // Bottom CTA
    set('[data-bottom-cta-title]', p.bottomCta?.title);
    set('[data-bottom-cta-body]', p.bottomCta?.body);
    const bottomBtn = $('[data-bottom-cta-btn]');
    if (bottomBtn && p.bottomCta?.cta) {
      bottomBtn.textContent = p.bottomCta.cta.label;
      bottomBtn.href = p.bottomCta.cta.href;
    }
  }

  /* ── ABOUT PAGE ── */
  function renderAbout() {
    if (!$('[data-page="about"]')) return;
    const a = C.about;
    if (!a) return;

    set('[data-hero-eyebrow]', a.hero?.eyebrow);
    const titleEl = $('[data-hero-title]');
    if (titleEl) titleEl.innerHTML = (a.hero?.title || '').replace('\n', '<br>');
    set('[data-hero-subtitle]', a.hero?.subtitle);

    set('[data-story-eyebrow]', a.story?.eyebrow);
    set('[data-story-title]', a.story?.title);
    set('[data-story-body1]', a.story?.body1);
    set('[data-story-body2]', a.story?.body2);
    set('[data-story-body3]', a.story?.body3);
    set('[data-story-quote]', a.story?.quote);

    set('[data-mission-eyebrow]', a.mission?.eyebrow);
    set('[data-mission-title]', a.mission?.title);

    const missionItems = $$('[data-mission-item]');
    missionItems.forEach((item, i) => {
      const m = a.mission?.items?.[i];
      if (!m) return;
      const t = item.querySelector('[data-mi-title]');
      const b = item.querySelector('[data-mi-body]');
      if (t) t.textContent = m.title;
      if (b) b.textContent = m.body;
    });

    set('[data-about-cta-title]', a.cta?.title);
    set('[data-about-cta-body]', a.cta?.body);
    const aboutBtn = $('[data-about-cta-btn]');
    if (aboutBtn && a.cta?.cta) {
      aboutBtn.textContent = a.cta.cta.label;
      aboutBtn.href = a.cta.cta.href;
    }
  }

  /* ── CONTACT PAGE ── */
  function renderContact() {
    if (!$('[data-page="contact"]')) return;
    const con = C.contact;
    if (!con) return;

    set('[data-hero-eyebrow]', con.hero?.eyebrow);
    const titleEl = $('[data-hero-title]');
    if (titleEl) titleEl.innerHTML = (con.hero?.title || '').replace('\n', '<br>');
    set('[data-contact-body1]', con.info?.body1);
    set('[data-contact-body2]', con.info?.body2);

    const steps = $$('[data-step-text]');
    steps.forEach((el, i) => { if (con.steps?.[i]) el.textContent = con.steps[i]; });

    const submitBtn = $('[data-submit-label]');
    if (submitBtn) submitBtn.textContent = con.form?.submitLabel || 'Send Message';

    const msgPlaceholder = $('[data-msg-placeholder]');
    if (msgPlaceholder) msgPlaceholder.placeholder = con.form?.placeholder || '';
  }

  /* ── Layout toggles ── */
  function applyLayoutToggles() {
    const L = C.layout || {};
    if (L.darkModeToggle === false) {
      $$('[data-theme-toggle]').forEach(el => el.style.display = 'none');
    }
  }

  /* ── BOOT ── */
  document.addEventListener('DOMContentLoaded', () => {
    applyColors();
    renderNav();
    renderBrand();
    renderHome();
    renderPlatform();
    renderAbout();
    renderContact();
    applyLayoutToggles();

    // The render*() calls above inject content (e.g. feature lists) into
    // sections that sit above an anchor target like #pay — that growth
    // happens after the browser's automatic scroll-to-fragment already ran
    // against the pre-render layout, so a direct link to e.g.
    // platform.html#pay lands back at the top of the page instead of the
    // intended section. Re-run the jump now that layout has settled.
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ block: 'start' });
    }
  });

})();
