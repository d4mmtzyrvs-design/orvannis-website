/**
 * ╔══════════════════════════════════════════════════════╗
 * ║          ORVANNIS SITE CONFIGURATION                 ║
 * ║                                                      ║
 * ║  This is the SINGLE SOURCE OF TRUTH for the site.   ║
 * ║  Change text, colors, links, and layout here.       ║
 * ║  All pages read from this file automatically.       ║
 * ╚══════════════════════════════════════════════════════╝
 */

window.ORVANNIS = {

  /* ─────────────────────────────────────────
     BACKEND
     Set this to your deployed Railway / Render URL
     once you have deployed server.py.
     Leave blank to use the mailto fallback.
  ───────────────────────────────────────── */
  backendUrl: 'https://orvannis-website-production.up.railway.app',

  /* ─────────────────────────────────────────
     BRAND
  ───────────────────────────────────────── */
  brand: {
    name:      'Orvannis',
    tagline:   'Strategy, automated.',
    email:     'brian@orvannis.com',
    location:  'Hooksett, New Hampshire',
    domain:    'orvannis.com',
    founded:   '2026',
  },

  /* ─────────────────────────────────────────
     COLORS
  ───────────────────────────────────────── */
  colors: {
    copper:        '#B87333',
    copperBright:  '#D4924A',
    copperMuted:   '#9C5A2C',

    bgLight:       '#E8E2D4',
    surfaceLight:  '#FAF8F4',
    textLight:     '#33302A',
    headingLight:  '#415A6B',
    textMutedLight:'#6B6560',

    bgDark:        '#000000',
    surfaceDark:   '#1A1815',
    textDark:      '#E5DFD4',
    textMutedDark: '#8A8070',
  },

  /* ─────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────── */
  nav: [
    { label: 'Home',      href: 'index.html' },
    { label: 'Services',  href: 'platform.html' },
    { label: 'About',     href: 'about.html' },
    { label: 'Contact',   href: 'contact.html' },
  ],
  navCta: { label: 'Book a Discovery Call', href: 'contact.html' },

  /* ─────────────────────────────────────────
     HOME PAGE
  ───────────────────────────────────────── */
  home: {
    hero: {
      eyebrow:    'Strategy, automated.',
      headline:   'Your business already has',
      headlineEm: 'the intelligence.',
      headlineLine3: 'We build the conduit',
      headlineLine4: 'that carries it.',
      body:       'Orvannis helps small and mid-sized businesses connect sales, finance, marketing, and operations through practical AI automation and workflow systems — built on 22 years of sitting across the table from business owners, not 22 months of building software.',
      ctaPrimary:   { label: 'Book a Discovery Call', href: 'contact.html' },
      ctaSecondary: { label: 'See What We Automate', href: 'platform.html' },
      note:         'No product to sell. Just a conversation we want to have.',
    },

    founderStrip: {
      eyebrow: 'Who\'s Behind This',
      body: 'Founded by Brian O’Connor, Orvannis is built on 22 years of finance, sales, and client advisory experience. The focus isn’t AI for its own sake — it’s using automation to solve real business problems.',
      cta: { label: 'Read the full story', href: 'about.html' },
    },

    modules: {
      eyebrow: 'Where We Help First',
      title:   'Four practical service areas designed to connect the parts of your business that should already be working together.',
      body:    'Orvannis does not start with custom software. We start with the business process, then choose the simplest reliable tool that solves the problem — implemented hands-on, with the judgment to know what should run on its own and what still needs a person.',
      cards: [
        {
          tag:   'Flow',
          title: 'Workflow & onboarding automation',
          body:  'Client onboarding, internal approvals, and the repetitive admin work that eats your week — mapped out and automated using proven tools, not a generic template.',
          href:  'platform.html#flow',
        },
        {
          tag:   'Pay',
          title: 'Invoicing & cash flow automation',
          body:  'Invoice workflows, payment follow-up, and cash flow visibility — so you stop chasing money and start tracking it.',
          href:  'platform.html#pay',
        },
        {
          tag:   'Connect',
          title: 'CRM & communication setup',
          body:  'CRM setup, email and calendar coordination, and one clear view of every client conversation — instead of five disconnected tools.',
          href:  'platform.html#connect',
        },
        {
          tag:   'Reach',
          title: 'Lead follow-up & pipeline automation',
          body:  'Lead follow-up, sales pipelines, review requests, and campaign workflows — so nothing goes cold because no one had time to follow up.',
          href:  'platform.html#reach',
        },
      ],
    },

    concept: {
      eyebrow: 'The Copper Conduit Philosophy',
      title:   'The copper doesn\'t create the current.\nYour business does.',
      body1:   'Most automation projects fail for the same reason: someone acted before they understood the full picture. A tool gets deployed, a workflow gets built, and three months later the problem is still there — just buried one layer deeper.',
      body2:   'Orvannis orbits the whole problem first. We look at how sales connects to finance, how marketing feeds the pipeline, how operations amplifies or undermines everything above it. Then we build the conduit — connected, AI-assisted workflows that carry your business\'s existing intelligence faster, further, and with less friction. We just make sure nothing is lost in transmission.',
      cta:     { label: 'Our Story', href: 'about.html' },
    },

    helpWith: {
      eyebrow: 'What We Actually Help With',
      title:   'The everyday friction that quietly costs the most.',
      items: [
        'Missed lead follow-ups',
        'Manual client onboarding',
        'Disconnected CRM, email, calendar, and spreadsheets',
        'Repetitive admin work',
        'Inconsistent review requests',
        'Slow invoicing or payment follow-up',
        'Lack of visibility into sales and operations',
        'Owner dependency on daily tasks',
      ],
    },

    currentServices: {
      eyebrow: 'Built for Year 1',
      title:   'Practical automation, available now.',
      body:    'Orvannis is AI automation consulting for small businesses — practical business process automation and CRM automation using proven tools, clear workflows, and business-first implementation. Not a roadmap. A working system you can use this quarter.',
      items: [
        'AI readiness assessments',
        'Workflow audits',
        'CRM and lead management setup',
        'Sales follow-up automation',
        'Review request automation',
        'Client onboarding automation',
        'Internal knowledge & documentation systems',
        'AI-assisted communication workflows',
        'Third-party tool integration using proven platforms',
      ],
      statement: 'We do not start with custom software. We start with the business process, then choose the simplest reliable tool that solves the problem.',
    },

    whoWeHelp: {
      eyebrow: 'Who We Help',
      title:   'Built for businesses outgrowing manual work.',
      items: [
        'Founder-led businesses',
        'Professional service firms',
        'Local service businesses',
        'Advisory businesses',
        'Growing teams using disconnected tools',
        'Businesses with manual admin bottlenecks',
      ],
    },

    howWeWork: {
      eyebrow: 'How We Work',
      title:   'A simple, four-step service journey.',
      steps: [
        { num: '01', title: 'Discover', body: 'Understand your business and where the bottlenecks actually are.' },
        { num: '02', title: 'Map',      body: 'Identify where automation creates real, measurable value — and where it does not.' },
        { num: '03', title: 'Build',    body: 'Implement practical workflows using reliable, proven tools.' },
        { num: '04', title: 'Refine',   body: 'Improve the system as your business grows and changes.' },
      ],
    },

    cta: {
      eyebrow: 'We want to hear from you',
      title:   'Help us build the right thing.',
      body:    'We are speaking with business owners at every stage — startups, established businesses, solo operators. A 20-minute conversation. Your input shapes what Orvannis becomes.',
      ctaPrimary:   { label: 'Book a Discovery Call', href: 'contact.html' },
      ctaSecondary: { label: 'See What We Automate', href: 'platform.html' },
    },
  },

  /* ─────────────────────────────────────────
     SERVICES PAGE  (file: platform.html)
  ───────────────────────────────────────── */
  platform: {
    hero: {
      eyebrow:  'Our Services — Now Booking Discovery Calls',
      title:    'Four practical service areas.\nOne connected business.',
      subtitle: 'Every service Orvannis offers is delivered hands-on, using proven third-party tools rather than custom-built software — paired with an advisory track backed by 22 years of real business experience. You can use one service, several, or all of them, depending on what your business actually needs.',
      statusBadge: 'Now booking discovery calls',
    },
    modules: [
      {
        id:      'flow',
        tag:     'Flow',
        title:   'Orvannis Flow',
        tagline: 'Workflow & onboarding automation.',
        body:    'Every business has repetitive processes — client onboarding, internal approvals, routing, follow-ups. Flow maps those processes and implements automation using proven third-party tools, so the right thing happens at the right time without you having to remember to do it.',
        features: [
          'Client onboarding automation',
          'Internal approvals and task routing',
          'Workflow audits to find what is worth automating',
          'Automation implementation using reliable, proven tools',
        ],
        advisory: {
          label: 'Workflow audit available',
          body:  'Not sure where automation fits in your operation? We will map your existing workflow, identify what should run on its own and what still needs a person, and design the implementation around your business — not a generic template.',
        },
      },
      {
        id:      'pay',
        tag:     'Pay',
        title:   'Orvannis Pay',
        tagline: 'Invoicing & cash flow automation.',
        body:    'Invoice workflows that send themselves, payment follow-up that does not depend on someone remembering, and clear visibility into cash flow — implemented with proven finance and billing tools, not a custom system to maintain.',
        features: [
          'Automated invoicing and payment follow-up',
          'Cash flow visibility and reporting',
          'Reconciliation and expense-tracking workflows',
          'Integration with the finance tools you already use',
        ],
        advisory: {
          label: 'Finance coaching available',
          body:  'Automation handles the transactions. Finance coaching handles the decisions behind them — cash flow strategy, pricing, margin analysis, and the financial fundamentals that keep small businesses healthy. Built on 22 years of real finance experience.',
        },
      },
      {
        id:      'connect',
        tag:     'Connect',
        title:   'Orvannis Connect',
        tagline: 'CRM & communication setup.',
        body:    'Your email, CRM, calendar, and tools do not talk to each other today. Connect is the implementation work that gets them coordinated — using proven CRM and communication platforms, set up and configured around how your team actually works.',
        features: [
          'CRM setup and configuration',
          'Email and calendar coordination',
          'Client communication visibility — one clear view per client',
          'Integration with the tools you already use',
        ],
        advisory: {
          label: 'Setup and strategy available',
          body:  'Connecting systems is only useful if you know how to use what they tell you. We can help you design the right client relationship model, set up your CRM the right way, and train your team on how to actually use it.',
        },
      },
      {
        id:      'reach',
        tag:     'Reach',
        title:   'Orvannis Reach',
        tagline: 'Lead follow-up & pipeline automation.',
        body:    'Reach covers the marketing and sales work that usually falls through the cracks — follow-ups that go unsent, leads that go cold, review requests no one gets around to. Implemented with proven outreach and pipeline tools.',
        features: [
          'Automated lead follow-up sequences',
          'Sales pipeline setup and management',
          'Review request automation',
          'Campaign workflow automation',
        ],
        advisory: {
          label: 'Sales coaching available',
          body:  'Automation fills the pipeline. Sales technique closes it. With over 22 years building and coaching sales teams, we can teach your people the skills — prospecting, objection handling, closing — that no software can replace.',
        },
      },
    ],
    helpWith: {
      eyebrow: 'What We Actually Help With',
      items: [
        'Missed lead follow-ups',
        'Manual client onboarding',
        'Disconnected CRM, email, calendar, and spreadsheets',
        'Repetitive admin work',
        'Inconsistent review requests',
        'Slow invoicing or payment follow-up',
        'Lack of visibility into sales and operations',
        'Owner dependency on daily tasks',
      ],
    },
    bottomCta: {
      title: 'Tell us which of these matters most to you.',
      body:  'Orvannis is currently accepting early discovery calls while we build our first implementation partnerships. A 20-minute conversation helps us get your priorities right — and puts you first in line.',
      cta:   { label: 'Book a Discovery Call', href: 'contact.html' },
    },
  },

  /* ─────────────────────────────────────────
     ABOUT PAGE
  ───────────────────────────────────────── */
  about: {
    hero: {
      eyebrow:  'Built from experience, not from theory.',
      title:    'We\'ve seen what slows\ngood businesses down.\nWe built Orvannis\nto fix it.',
      subtitle: 'Two decades in sales, finance, and business operations — then the tools finally caught up to what we always knew was possible. Orvannis is what happened next.',
    },
    story: {
      eyebrow: 'The Approach',
      title:   'Two things most firms offer one at a time. We offer both.',
      body1:   'Most automation projects fail for the same reason: someone acted before they understood the full picture. Orvannis starts differently. We orbit the whole problem first — sales, finance, operations, the workflows tying them together — and look at how everything connects before recommending where to move.',
      body2:   'Then we build the conduit: connected, AI-assisted workflows that carry your business\'s existing intelligence faster, further, and with less friction. The copper doesn\'t create the current. Your business does. We just make sure nothing is lost in transmission.',
      body3:   'Automation solves a real problem. It also has hard limits. No workflow can close a complex sale. No pipeline tool replaces the judgment to coach a struggling team or the financial literacy to read what your numbers are telling you. That is why Orvannis runs two tracks simultaneously — because the businesses that need the most help usually need both.',
      quote:   '"The copper doesn\'t create the current. Your business does. We just make sure nothing is lost in transmission."',
    },
    mission: {
      eyebrow: 'What We Are Building Toward',
      title:   'Practical automation. Human expertise. Both.',
      items: [
        {
          title: 'Automation that fits your business',
          body:  'Not custom software you adapt to — practical workflows, built around how your business actually operates, using proven tools chosen for the job. We design the implementation after we understand the process.',
        },
        {
          title: 'Advisory built on real experience',
          body:  'Sales coaching. Finance strategy. Operations design. Every advisory service comes from 22 years of hands-on experience — not a playbook, but actual judgment from someone who has been there.',
        },
        {
          title: 'The line between them is judgment',
          body:  "We know which tasks should run on autopilot and which decisions need a human. That line comes from experience — and knowing the difference is what separates a useful tool from a real solution.",
        },
      ],
    },
    cta: {
      title: 'We are in the listening phase — intentionally.',
      body:  'Before we build, we are talking to business owners. No product to demo, no pitch to sit through. Just a 20-minute conversation about what is actually hard for you right now.',
      cta:   { label: 'Book a Discovery Call', href: 'contact.html' },
    },
  },

  /* ─────────────────────────────────────────
     CONTACT PAGE
  ───────────────────────────────────────── */
  contact: {
    hero: {
      eyebrow: 'Book a Discovery Call',
      title:   'Book a\nDiscovery Call.',
    },
    info: {
      body1: "Orvannis is currently accepting early discovery calls while we build our first implementation partnerships. Some areas of this site are still being developed.",
      body2: "This is a 20-minute conversation. No product to sell, nothing to sign. Just your honest perspective on what is working, what is not, and what you wish existed — automated, advised, or both.",
    },
    steps: [
      "Tell us where you are — starting out, scaling up, stuck, or just curious what AI could do for your business.",
      "We will share what we currently offer and ask which parts of it matter most to you — automation, hands-on advisory, or a combination.",
      "Your input directly shapes what Orvannis prioritizes next — and puts you first in line for our first implementation partnerships.",
    ],
    form: {
      submitLabel: 'Book a Discovery Call',
      placeholder: 'E.g. I run a 10-person service business and spend half my week on things that should be automated — but I also need help tightening up our sales process...',
    },
  },

  /* ─────────────────────────────────────────
     FOOTER
  ───────────────────────────────────────── */
  footer: {
    tagline: 'AI automation and business systems consulting — built on 22 years of sales and finance experience, and a genuine belief that small businesses deserve better tools and better guidance.',
    copyright: '2026 Orvannis. All rights reserved.',
    signoff: 'Built on copper, stone, orbit, and the arrow.',
  },

  /* ─────────────────────────────────────────
     LAYOUT TOGGLES
  ───────────────────────────────────────── */
  layout: {
    showMarqueeStrip:  true,
    showConceptSection:true,
    showHomeCta:       true,
    showPlatformStatus:true,
    heroORotates:      true,
    navLogoSpins:      true,
    cards3dTilt:       true,
    darkModeToggle:    true,
  },

};
