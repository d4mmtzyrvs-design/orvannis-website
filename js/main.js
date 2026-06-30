/* =====================================================
   ORVANNIS MAIN JS — v2
   Theme · Nav · 3D Tilt · Scroll Reveal · O-Ring
   ===================================================== */

'use strict';

/* ─── THEME ─────────────────────────────────────────── */
(function () {
  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = prefersDark ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);

  function updateToggles(t) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
      btn.innerHTML = t === 'dark'
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateToggles(theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', theme);
        updateToggles(theme);
      });
    });
  });
})();

/* ─── STICKY HEADER ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('site-header--scrolled', window.scrollY > 40);
  }, { passive: true });
});

/* ─── LOGIN DROPDOWN ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-login-wrap').forEach(wrap => {
    const btn      = wrap.querySelector('.nav-login-btn');
    const dropdown = wrap.querySelector('.nav-login-dropdown');
    if (!btn || !dropdown) return;

    const open  = () => { wrap.classList.add('is-open');    btn.setAttribute('aria-expanded', 'true');  };
    const close = () => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    const toggle = () => wrap.classList.contains('is-open') ? close() : open();

    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  });
});

/* ─── MOBILE NAV ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle  = document.querySelector('.nav-toggle');
  const closeBtn= document.querySelector('.mobile-nav-close');
  const mNav    = document.querySelector('.mobile-nav');
  if (!toggle || !mNav) return;

  const open  = () => { mNav.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { mNav.classList.remove('open'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  mNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
});

/* ─── ACTIVE NAV LINK ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isHome = (href === '/' || href === 'index.html') && (path === '/' || path.endsWith('index.html'));
    const isOther = href !== '/' && href !== 'index.html' && path.includes(href.replace('.html', ''));
    if (isHome || isOther) a.classList.add('active');
  });
});

/* ─── CARD LIFT HOVER ───────────────────────────────────── */
/*
  Clean lift-forward on hover — no rotation, no glare.
  Cards translate up and forward, casting a deeper shadow.
  Handled entirely in CSS; this block intentionally left minimal.
*/
// Card hover is CSS-only — see .card-3d:hover in main.css

/* ─── SCROLL REVEAL ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    // Above-the-fold elements (e.g. a page's hero, which is already in
    // view the instant the page loads) can't rely on IntersectionObserver's
    // initial callback alone — on some loads it doesn't fire until the
    // first scroll/resize, leaving the whole hero stuck at opacity:0 with
    // nothing on screen. Check synchronously and reveal immediately if
    // already in the viewport, instead of waiting on the observer for it.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('visible');
    } else {
      io.observe(el);
    }
  });
});

/* ─── ROTATING O RING ────────────────────────────────── */
/*
  The hero O-mark has two SVG rings:
    #ring-outer — slow clockwise rotation
    #ring-inner — slightly faster counter-clockwise rotation
  We drive this with rAF so it pauses on prefers-reduced-motion.
*/
document.addEventListener('DOMContentLoaded', () => {
  const outer = document.getElementById('ring-outer');
  const inner = document.getElementById('ring-inner');
  const arrowRing = document.getElementById('ring-arrow');
  if (!outer && !inner) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let angle1 = 0;   // outer ring
  let angle2 = 0;   // inner ring  (counter)
  let angle3 = 0;   // arrow ring  (faster)
  let last   = null;

  function tick(ts) {
    if (!last) last = ts;
    const dt = Math.min(ts - last, 50);  // cap at 50ms (tab-unfocus protection)
    last = ts;

    angle1 += 0.018 * dt;   // ~1 rev / 20s
    angle2 -= 0.011 * dt;   // ~1 rev / 32s (counter)
    angle3 += 0.040 * dt;   // ~1 rev /  9s (arrow — most visible)

    if (outer)     outer.setAttribute('transform',     `rotate(${angle1},200,200)`);
    if (inner)     inner.setAttribute('transform',     `rotate(${angle2},200,200)`);
    if (arrowRing) arrowRing.setAttribute('transform', `rotate(${angle3},200,200)`);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});

/* ─── NAV LOGO O SPIN ────────────────────────────────── */
/* The small nav logo O spins slowly on page load, then idles */
document.addEventListener('DOMContentLoaded', () => {
  const logos = document.querySelectorAll('.logo-spin');
  if (!logos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  logos.forEach(el => {
    el.style.transformOrigin = '50% 50%';
    el.style.animation = 'logo-idle 12s linear infinite';
  });
});

/* ─── CONTACT FORM ───────────────────────────────────── */
/*
  Posts to the Orvannis backend API at POST /contact.
  Backend URL comes from site.config.js → window.ORVANNIS.backendUrl.
  Falls back to mailto if backendUrl is empty or the request fails.

  NOTE: The backend ContactForm schema accepts:
    { name, email, company?, message }
  The "size" (team size) field is NOT sent to the API —
  it is appended to the message in the mailto fallback only.
*/

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn     = form.querySelector('[type="submit"]');
    const name    = form.querySelector('#name')?.value.trim()    || '';
    const email   = form.querySelector('#email')?.value.trim()   || '';
    const phone   = form.querySelector('#phone')?.value.trim()   || '';
    const company = form.querySelector('#company')?.value.trim() || '';
    const size    = form.querySelector('#size')?.value            || '';
    const message = form.querySelector('#message')?.value.trim() || '';
    const industry          = form.querySelector('#industry')?.value || '';
    const leadSource        = form.querySelector('#lead_source')?.value || '';
    const bestTime           = form.querySelector('#best_time')?.value || '';
    const preferredContact  = form.querySelector('input[name="preferred_contact"]:checked')?.value || 'Email';

    if (!name || !email || !message) {
      setStatus(form, 'Please fill in your name, email, and message.', 'error');
      return;
    }

    btn.disabled = true;
    const btnLabel = btn.querySelector('[data-submit-label]') || btn;
    btnLabel.textContent = 'Sending…';

    // Resolve backend URL from site.config.js (empty string = no backend yet)
    const backendUrl = (window.ORVANNIS && window.ORVANNIS.backendUrl) || '';

    try {
      let sent = false;

      // ── Try backend API if URL is configured ──────────────────────────
      if (backendUrl) {
        try {
          const resp = await fetch(`${backendUrl}/contact`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            // size is excluded — backend ContactForm doesn't accept it
            body: JSON.stringify({
              name, email,
              phone: phone || undefined,
              company: company || undefined,
              message,
              industry: industry || undefined,
              lead_source: leadSource || undefined,
              best_time: bestTime || undefined,
              preferred_contact: preferredContact,
            }),
          });
          if (resp.ok) { sent = true; }
        } catch (_) { /* backend unreachable — fall through to mailto */ }
      }

      if (sent) {
        setStatus(form, 'Request received. You will hear from us within one business day.', 'success');
        form.reset();
      } else {
        // ── Mailto fallback: include team size here ────────────────────
        const subject = encodeURIComponent(`Orvannis Discovery Call Request — ${company || name}`);
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nCompany: ${company || '—'}\nTeam size: ${size || '—'}\nIndustry: ${industry || '—'}\nPreferred contact: ${preferredContact}\nBest time: ${bestTime || '—'}\nHeard about us via: ${leadSource || '—'}\n\n${message}`
        );
        window.location.href = `mailto:brian@orvannis.com?subject=${subject}&body=${body}`;
        setStatus(form, 'Your email client is opening with your request pre-filled.', 'success');
      }

    } catch (err) {
      setStatus(form,
        err.message || 'Something went wrong. Please email brian@orvannis.com directly.',
        'error'
      );
    } finally {
      btn.disabled = false;
      btnLabel.textContent = 'Book a Discovery Call';
    }
  });
});

function setStatus(form, msg, type) {
  let el = form.querySelector('.form-status');
  if (!el) { el = document.createElement('p'); el.className = 'form-status'; form.appendChild(el); }
  el.textContent = msg;
  el.style.cssText = `margin-top:0.75rem; font-size:0.8125rem; font-family:var(--font-body); color:${type === 'success' ? 'var(--color-primary)' : '#a13544'};`;
  // The message is appended at the end of the form, which can land below
  // the fold (especially once the button shows "Sending…" and the layout
  // hasn't grown yet) — scroll it into view so the visitor actually sees
  // submission confirmation instead of wondering if anything happened.
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ══════════════════════════════════════════════
   MARQUEE — scrollLeft-based (crisp text always)
   Browser renders scrollLeft as native scroll —
   no GPU compositing, no subpixel blur.
   ══════════════════════════════════════════════ */
(function () {
  const strip = document.querySelector('.marquee-strip');
  const track = strip && strip.querySelector('.marquee-track');
  if (!strip || !track) return;

  /* ── Config ── */
  const SPEED_NORMAL = 0.16;   // px per ms — snappy, energetic pace
  const SPEED_SLOW   = 0.030;  // px per ms — slow hover/touch speed
  const EASE_MS      = 700;

  /* ── State ── */
  let offset        = 0;
  let speed         = SPEED_NORMAL;
  let targetSpeed   = SPEED_NORMAL;
  let easeStart     = null;
  let easeFrom      = SPEED_NORMAL;
  let lastTs        = null;
  let halfWidth     = 0;

  function measure() {
    halfWidth = track.scrollWidth / 2;
  }

  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  /* ── RAF loop — advances via scrollLeft, never transform ── */
  function tick(ts) {
    requestAnimationFrame(tick);

    if (!halfWidth) measure();
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;

    /* Ease speed toward target */
    if (Math.abs(speed - targetSpeed) > 0.0001) {
      if (!easeStart) { easeStart = ts; easeFrom = speed; }
      const t = Math.min((ts - easeStart) / EASE_MS, 1);
      speed = easeFrom + (targetSpeed - easeFrom) * easeInOut(t);
      if (t >= 1) { speed = targetSpeed; easeStart = null; }
    } else {
      easeStart = null;
    }

    /* Advance by whole pixels only — fractional px blurs text */
    offset += speed * dt;
    if (offset >= halfWidth) offset -= halfWidth;

    /* scrollLeft renders through the browser's native scroll path —
       text stays on the pixel grid, zero GPU compositing blur */
    strip.scrollLeft = Math.round(offset);
  }

  window.addEventListener('load', function () {
    measure();
    /* Make the strip scrollable (JS-only, not user-scrollable) */
    strip.style.overflowX = 'hidden';
    requestAnimationFrame(tick);
  });

  window.addEventListener('resize', measure);

  /* ── Slow on hover / touch ── */
  function goSlow()   { targetSpeed = SPEED_SLOW;   easeStart = null; }
  function goNormal() { targetSpeed = SPEED_NORMAL; easeStart = null; }

  strip.addEventListener('mouseenter', goSlow);
  strip.addEventListener('mouseleave', goNormal);

  let touchTimer = null;
  strip.addEventListener('touchstart', function () {
    clearTimeout(touchTimer);
    goSlow();
  }, { passive: true });
  strip.addEventListener('touchend', function () {
    touchTimer = setTimeout(goNormal, 1400);
  }, { passive: true });
  strip.addEventListener('touchcancel', goNormal, { passive: true });

})();


/* ══════════════════════════════════════════════
   SOLUTION MODAL — dual-track (Automated + Advisory)
   ══════════════════════════════════════════════ */
(function () {

  const SOLUTIONS = {
    'sales': {
      title: 'Sales',
      auto:     "We build the systems that keep your pipeline moving on its own — automated lead capture, follow-up sequences, pipeline reporting, and CRM sync. No leads fall through the cracks, no follow-up goes unsent.",
      advisory: "We also bring 22+ years of real sales experience directly to your team. From teaching wholesaling techniques and prospecting methods to rebuilding your entire sales model — hands-on coaching that lifts the people doing the selling."
    },
    'finance': {
      title: 'Finance',
      auto:     "Automated invoicing, real-time cash flow dashboards, payment reconciliation, and expense tracking. The financial machinery of your business runs without manual input — so your numbers are always current.",
      advisory: "Finance coaching for small businesses built on real-world experience — not theory. Cash flow strategy, margin analysis, pricing decisions, and the financial fundamentals that determine whether a business survives or scales."
    },
    'marketing': {
      title: 'Marketing',
      auto:     "Automated campaign delivery, content scheduling, email sequences, and performance reporting. Your message reaches the right audience consistently — without anyone manually managing the cadence.",
      advisory: "We work with you on positioning, messaging, and the strategic decisions that automation can't make: what to say, who to target, and what kind of marketing actually fits your business at its current stage."
    },
    'client-onboarding': {
      title: 'Client Onboarding',
      auto:     "Automated welcome sequences, intake workflows, document collection, and milestone check-ins. Every new client gets a consistent, professional first experience — without anyone having to remember to do it.",
      advisory: "We design the onboarding experience itself — what the client sees, how they feel, and what the first 30 days communicate about your business. That architecture comes from experience, not a template."
    },
    'operations': {
      title: 'Operations',
      auto:     "Workflow automation across your internal processes — approvals, task routing, status updates, and reporting. The right things happen at the right time without anyone orchestrating them manually.",
      advisory: "We assess how your operation actually runs, identify where time and money are being lost, and redesign the process before we automate it. Automation built on a broken process is just faster broken."
    },
    'invoicing': {
      title: 'Invoicing & Billing',
      auto:     "Invoices generated and sent automatically at the right moment. Payment reminders go out on schedule. Reconciliation happens in the background. Your billing cycle runs itself.",
      advisory: "We also advise on the business side of billing — payment terms, pricing structure, retainer models, and how to design a billing approach that improves cash flow and client relationships simultaneously."
    },
    'crm': {
      title: 'CRM & Relationships',
      auto:     "Your CRM stays current without manual entry — contact sources synced, activity logged automatically, every client interaction captured in one place. One clean, reliable view of every relationship.",
      advisory: "A CRM is only as good as the relationship model behind it. We help you define how you manage clients, design the right pipeline stages, and train your team to use the system in a way that actually reflects how your business sells."
    },
    'team': {
      title: 'Team Performance',
      auto:     "Automated performance tracking, workflow adherence reporting, and task management systems. Visibility into how your team operates — without micromanaging the details.",
      advisory: "We work directly with your team on the skills and habits that no software can install — sales technique, communication, accountability structures, and the coaching frameworks that turn a group of people into a high-performing operation."
    }
  };

  const modal    = document.getElementById('solution-modal');
  if (!modal) return;
  const titleEl    = modal.querySelector('.sol-title');
  const autoEl     = modal.querySelector('.sol-body-auto');
  const advisoryEl = modal.querySelector('.sol-body-advisory');
  const closeBtn   = modal.querySelector('.sol-close');

  function openModal(key) {
    const data = SOLUTIONS[key];
    if (!data) return;
    titleEl.textContent    = data.title;
    autoEl.textContent     = data.auto;
    advisoryEl.textContent = data.advisory;
    modal.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.addEventListener('transitionend', () => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, { once: true });
  }

  document.addEventListener('click', function (e) {
    const item = e.target.closest('.marquee-item');
    if (item) { openModal(item.dataset.solution); return; }
    if (e.target === modal) closeModal();
  });

  closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

})();
