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
  backendUrl: '',
  // backendUrl: 'https://orvannis-backend.up.railway.app',

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

    bgDark:        '#131210',
    surfaceDark:   '#1A1815',
    textDark:      '#E5DFD4',
    textMutedDark: '#8A8070',
  },

  /* ─────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────── */
  nav: [
    { label: 'Home',      href: 'index.html' },
    { label: 'Platform',  href: 'platform.html' },
    { label: 'About',     href: 'about.html' },
    { label: 'Contact',   href: 'contact.html' },
  ],
  navCta: { label: 'Book a Consultation', href: 'contact.html' },

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
      body:       'Orvannis combines AI-driven automation with real-world sales and finance expertise. Built on 22 years of sitting across the table from business owners — not 22 months of building software.',
      ctaPrimary:   { label: 'Book a Consultation', href: 'contact.html' },
      ctaSecondary: { label: 'See What We Are Building', href: 'platform.html' },
      note:         'No product to sell. Just a conversation we want to have.',
    },

    modules: {
      eyebrow: 'What We Are Exploring',
      title:   'Two tracks. Every problem.',
      body:    'Most automation companies give you a tool and walk away. Orvannis offers both: systems that run themselves and the hands-on expertise to make sure they are built on the right strategy. Tell us which of these challenges matter most to you.',
      cards: [
        {
          tag:   'Start',
          title: 'Launch a business',
          body:  'From idea to open doors — structure, strategy, and the systems you need to start right the first time. Guided setup or fully automated foundations, depending on where you are.',
          href:  'contact.html',
        },
        {
          tag:   'Grow',
          title: 'Scale what works',
          body:  'Identify what is driving growth, remove what is slowing it down, and build the infrastructure to handle more — through coaching, process design, or automated systems.',
          href:  'contact.html',
        },
        {
          tag:   'Automate',
          title: 'Stop doing it manually',
          body:  'Invoicing, follow-ups, reporting, onboarding — the work that eats your week, handed off to systems that do not forget. And the judgment to know which work should stay human.',
          href:  'platform.html',
        },
        {
          tag:   'Strategize',
          title: 'Think through the big picture',
          body:  'Brainstorm new directions, pressure-test decisions, and get honest input from someone who has been in the room — 22 years in sales and finance, applied to your situation.',
          href:  'contact.html',
        },
      ],
    },

    concept: {
      eyebrow: 'The Copper Conduit Philosophy',
      title:   'The copper doesn\'t create the current.\nYour business does.',
      body1:   'Most automation projects fail for the same reason: someone acted before they understood the full picture. A tool gets deployed, a workflow gets built, and three months later the problem is still there — just buried one layer deeper.',
      body2:   'Orvannis orbits the whole problem first. We look at how sales connects to finance, how marketing feeds the pipeline, how operations amplifies or undermines everything above it. Then we build the conduit — AI systems that carry your business\'s existing intelligence faster, further, and with less friction. We just make sure nothing is lost in transmission.',
      cta:     { label: 'Our Story', href: 'about.html' },
    },

    cta: {
      eyebrow: 'We want to hear from you',
      title:   'Help us build the right thing.',
      body:    'We are speaking with business owners at every stage — startups, established businesses, solo operators. A 20-minute conversation. Your input shapes what Orvannis becomes.',
      ctaPrimary:   { label: 'Book a Consultation', href: 'contact.html' },
      ctaSecondary: { label: 'See What We Are Building', href: 'platform.html' },
    },
  },

  /* ─────────────────────────────────────────
     PLATFORM PAGE
  ───────────────────────────────────────── */
  platform: {
    hero: {
      eyebrow:  'The Platform — In Development',
      title:    'Two tracks.\nOne platform.',
      subtitle: 'Every service Orvannis offers comes in two forms: an automated system that runs without you, and a hands-on advisory track backed by 22 years of real business experience. You can use one, both, or anywhere in between — depending on what your business actually needs.',
      statusBadge: 'In development — not yet available',
    },
    modules: [
      {
        id:      'flow',
        tag:     'Flow',
        title:   'Orvannis Flow',
        tagline: 'Workflows that run themselves.',
        body:    'Every business has repetitive processes — onboarding clients, routing approvals, triggering follow-ups. Flow automates them so the right thing happens at the right time. And if you are not sure which processes to automate, we will help you figure that out first.',
        features: [
          'Visual workflow builder — no code required',
          'Trigger automation from time, event, or condition',
          'Task routing and internal approvals',
          'Client onboarding sequences, automated',
        ],
        advisory: {
          label: 'Advisory track available',
          body:  'Not sure where automation fits in your operation? We will map your existing workflow, identify what should run on its own and what needs a human, and design the system around your business — not a generic template.',
        },
      },
      {
        id:      'pay',
        tag:     'Pay',
        title:   'Orvannis Pay',
        tagline: "Finance that doesn't wait for you.",
        body:    'Invoices sent automatically. Payments reconciled. Cash flow visible at a glance. Pay handles the financial mechanics of your business so you stop chasing money and start tracking it.',
        features: [
          'Automated invoicing and payment reminders',
          'Real-time cash flow dashboard',
          'Bank reconciliation and expense tracking',
          'Quote-to-invoice in seconds',
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
        tagline: 'One view of everything.',
        body:    'Your email, CRM, calendar, and tools do not talk to each other. Connect makes them. Instead of switching between five apps to piece together a picture, you get one place where everything already is.',
        features: [
          'CRM, email, and calendar unified',
          'Two-way sync with existing tools',
          'Client activity timeline — every touchpoint in one place',
          'API-first — integrate what you already use',
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
        tagline: 'Your pipeline, on autopilot.',
        body:    'Reach handles the marketing and sales work that usually falls through the cracks — follow-ups that go unsent, leads that go cold, pipelines that never get updated.',
        features: [
          'Automated follow-up sequences',
          'Lead scoring and pipeline management',
          'Email and social campaign automation',
          "Reporting — what's working, what isn't",
        ],
        advisory: {
          label: 'Sales coaching available',
          body:  'Automation fills the pipeline. Wholesaling technique closes it. With over 22 years building and coaching sales teams, we can teach your people the skills — prospecting, objection handling, closing — that no software can replace.',
        },
      },
    ],
    bottomCta: {
      title: 'Tell us which of these matters most to you.',
      body:  'We are prioritizing what to build first based on real conversations. A 20-minute interview helps us get it right — and puts you first in line when it launches.',
      cta:   { label: 'Book a Consultation', href: 'contact.html' },
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
      body2:   'Then we build the conduit: AI-driven systems that carry your business\'s existing intelligence faster, further, and with less friction. The copper doesn\'t create the current. Your business does. We just make sure nothing is lost in transmission.',
      body3:   'Automation solves a real problem. It also has hard limits. No workflow can close a complex sale. No pipeline tool replaces the judgment to coach a struggling team or the financial literacy to read what your numbers are telling you. That is why Orvannis runs two tracks simultaneously — because the businesses that need the most help usually need both.',
      quote:   '"The copper doesn\'t create the current. Your business does. We just make sure nothing is lost in transmission."',
    },
    mission: {
      eyebrow: 'What We Are Building Toward',
      title:   'Automated systems. Human expertise. Both.',
      items: [
        {
          title: 'Automation that fits your business',
          body:  'Not a generic platform you adapt to — but systems designed around how your business actually operates. We build the automation after we understand the workflow.',
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
      cta:   { label: 'Book a Consultation', href: 'contact.html' },
    },
  },

  /* ─────────────────────────────────────────
     CONTACT PAGE
  ───────────────────────────────────────── */
  contact: {
    hero: {
      eyebrow: 'Book a Consultation',
      title:   'Book a\nConsultation.',
    },
    info: {
      body1: "Orvannis is not live yet. We are in the research phase — speaking with business owners to understand which problems are the most urgent and which solutions are worth building first.",
      body2: "This is a 20-minute conversation. No product to sell, nothing to sign. Just your honest perspective on what is working, what is not, and what you wish existed — automated, advised, or both.",
    },
    steps: [
      "Tell us where you are — starting out, scaling up, stuck, or just curious what AI could do for your business.",
      "We will share what we are building and ask which parts of it matter most to you — automated solutions, hands-on advisory, or a combination.",
      "Your input directly shapes what Orvannis prioritizes — and puts you first in line when we launch.",
    ],
    form: {
      submitLabel: 'Book a Consultation',
      placeholder: 'E.g. I run a 10-person service business and spend half my week on things that should be automated — but I also need help tightening up our sales process...',
    },
  },

  /* ─────────────────────────────────────────
     FOOTER
  ───────────────────────────────────────── */
  footer: {
    tagline: 'In development. Built on 22 years of sales and finance experience — and a genuine belief that small businesses deserve better tools and better guidance.',
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
